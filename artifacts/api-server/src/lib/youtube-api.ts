const API_KEY = process.env.YOUTUBE_API_KEY || "";

const CHANNEL_NAME = "Dahinchu Agni Ministries";

interface YouTubeVideoItem {
  id: string;
  title: string;
  published: string;
  thumbnailUrl: string;
  videoUrl: string;
  channelName: string;
  isLive: boolean;
  isShort: boolean;
  durationSeconds: number | null;
  viewCount: number | null;
}

function formatDuration(iso: string): number {
  const m = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!m) return 0;
  const h = parseInt(m[1] || "0") || 0;
  const mn = parseInt(m[2] || "0") || 0;
  const s = parseInt(m[3] || "0") || 0;
  return h * 3600 + mn * 60 + s;
}

function getUploadsPlaylistId(channelId: string): string {
  return "UU" + channelId.slice(2);
}

export async function fetchVideos(
  channelId: string,
  maxResults: number = 50
): Promise<YouTubeVideoItem[]> {
  if (!API_KEY) return [];

  const playlistId = getUploadsPlaylistId(channelId);

  try {
    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=${maxResults}&playlistId=${playlistId}&key=${API_KEY}`;
    const playlistRes = await fetch(playlistUrl, {
      signal: AbortSignal.timeout(10000),
    });
    if (!playlistRes.ok) {
      const body = await playlistRes.text().catch(() => "");
      return [];
    }
    const playlistData: { items?: any[] } = await playlistRes.json() as any;
    const items = playlistData?.items ?? [];
    if (!items.length) return [];

    const videoIds = items
      .map((i: any) => i.snippet?.resourceId?.videoId)
      .filter(Boolean)
      .join(",");

    const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,liveStreamingDetails,statistics&id=${videoIds}&key=${API_KEY}`;
    const videosRes = await fetch(videosUrl, {
      signal: AbortSignal.timeout(10000),
    });
    if (!videosRes.ok) return [];
    const videosData: { items?: any[] } = await videosRes.json() as any;
    const detailMap = new Map<string, any>();
    for (const v of videosData?.items ?? []) {
      detailMap.set(v.id, v);
    }

    const results: YouTubeVideoItem[] = [];

    for (const item of items) {
      const snippet = item.snippet ?? {};
      const videoId = snippet.resourceId?.videoId;
      if (!videoId) continue;

      const details = detailMap.get(videoId);
      const contentDetails = details?.contentDetails ?? {};
      const liveDetails = details?.liveStreamingDetails ?? {};

      const title = snippet.title || "";
      const isLive = !!liveDetails?.actualStartTime && !liveDetails?.actualEndTime;
      const durationSeconds = isLive ? null : formatDuration(contentDetails.duration || "PT0S");
      const isShort = !isLive && durationSeconds !== null && durationSeconds > 0 && durationSeconds <= 90;

      results.push({
        id: videoId,
        title,
        published: snippet.publishedAt || new Date().toISOString(),
        thumbnailUrl: snippet.thumbnails?.high?.url || snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        channelName: CHANNEL_NAME,
        isLive,
        isShort,
        durationSeconds,
        viewCount: details?.statistics?.viewCount ? parseInt(details.statistics.viewCount) : null,
      });
    }

    return results;
  } catch {
    return [];
  }
}
