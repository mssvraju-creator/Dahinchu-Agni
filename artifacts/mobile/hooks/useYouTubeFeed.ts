import { useQuery } from "@tanstack/react-query";
import { MINISTRY } from "@/constants/ministry";

export interface YouTubeVideo {
  id: string;
  title: string;
  published: string;
  thumbnailUrl: string;
  videoUrl: string;
  channelName: string;
  isLive?: boolean;
  isShort?: boolean;
  durationSeconds?: number;
  viewCount?: number;
}

const CHANNEL_ID = MINISTRY.youtubeChannelId;

export type VideoCategory = "all" | "sermon" | "teaching" | "worship" | "live" | "short";

export function getVideoCategory(video: YouTubeVideo): VideoCategory {
  if (video.isLive) return "live";
  if (video.isShort || ((video.durationSeconds ?? 0) > 0 && (video.durationSeconds ?? 0) <= 90))
    return "short";

  const t = video.title.toLowerCase();
  if (t.includes("live") || t.includes("ప్రత్యక్ష") || t.includes("livestream"))
    return "live";
  if (
    t.includes("worship") ||
    t.includes("song") ||
    t.includes("music") ||
    t.includes("hymn") ||
    t.includes("praise") ||
    t.includes("ఆరాధన") ||
    t.includes("పాట") ||
    t.includes("సంగీతం") ||
    t.includes("గీతం") ||
    t.includes("స్తుతి")
  )
    return "worship";
  if (
    t.includes("teaching") ||
    t.includes("bible") ||
    t.includes("study") ||
    t.includes("school") ||
    t.includes("training") ||
    t.includes("dunamis") ||
    t.includes("word of god") ||
    t.includes("message")
  )
    return "teaching";

  return "sermon";
}

const CATEGORY_PRIORITY: Record<VideoCategory, number> = {
  worship: 0,
  sermon: 1,
  teaching: 2,
  all: 3,
  live: 4,
  short: 5,
};

function fetchWithTimeout(uri: string, ms: number): Promise<Response> {
  const ac = new AbortController();
  const id = setTimeout(() => ac.abort(), ms);
  return fetch(uri, { signal: ac.signal }).finally(() => clearTimeout(id));
}

function parseRSS(xml: string): YouTubeVideo[] {
  const entries = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];
  return entries.flatMap((entry) => {
    const id = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1]?.trim();
    const title = (entry.match(/<title>(.*?)<\/title>/)?.[1] || "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .trim();
    const published = entry.match(/<published>(.*?)<\/published>/)?.[1]?.trim();
    if (!id || !title) return [];
    const tLow = title.toLowerCase();
    return [
      {
        id,
        title,
        published: published ?? new Date().toISOString(),
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${id}`,
        channelName: "Dahinchu Agni Ministries",
        isLive: tLow.includes("live") || tLow.includes("ప్రత్యక్ష"),
        durationSeconds: 0,
      },
    ];
  });
}

async function fetchVideos(): Promise<YouTubeVideo[]> {
  // Try API server first (through Metro proxy)
  try {
    const res = await fetchWithTimeout(
      `/api/youtube/videos?channelId=${CHANNEL_ID}`,
      10000
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.videos) && data.videos.length > 0) {
        return data.videos as YouTubeVideo[];
      }
    }
  } catch {}

  // Fallback to YouTube RSS
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    const res = await fetchWithTimeout(rssUrl, 10000);
    if (res.ok) {
      return parseRSS(await res.text());
    }
  } catch {}

  return [];
}

export function useYouTubeFeed() {
  return useQuery({
    queryKey: ["youtube-feed-v4", CHANNEL_ID],
    queryFn: () => fetchVideos().then((videos) => videos.slice(0, 5)),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useAllVideos() {
  return useQuery({
    queryKey: ["youtube-all-v4", CHANNEL_ID],
    queryFn: async () => {
      const videos = await fetchVideos();
      return videos.sort((a, b) => {
        const pa = CATEGORY_PRIORITY[getVideoCategory(a)] ?? 99;
        const pb = CATEGORY_PRIORITY[getVideoCategory(b)] ?? 99;
        if (pa !== pb) return pa - pb;
        return new Date(b.published).getTime() - new Date(a.published).getTime();
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useLiveStream() {
  return useQuery({
    queryKey: ["youtube-live-v4", CHANNEL_ID],
    queryFn: async (): Promise<YouTubeVideo | null> => {
      // Try API server
      try {
        const res = await fetchWithTimeout(
          `/api/youtube/live?channelId=${CHANNEL_ID}`,
          8000
        );
        if (res.ok) {
          const data = await res.json();
          if (data.isLive && data.videoId) {
            return {
              id: data.videoId,
              title: data.title || "Live Stream",
              published: new Date().toISOString(),
              thumbnailUrl: data.thumbnailUrl || `https://i.ytimg.com/vi/${data.videoId}/hqdefault.jpg`,
              videoUrl: `https://www.youtube.com/watch?v=${data.videoId}`,
              channelName: "Dahinchu Agni Ministries",
              isLive: true,
            } as YouTubeVideo;
          }
          return null;
        }
      } catch {}

      // Fallback: check RSS for live titles
      const videos = await fetchVideos();
      const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
      return (
        videos.find((v) => {
          const t = v.title.toLowerCase();
          const isLiveTitle =
            t.includes("live") || t.includes("ప్రత్యక్ష");
          return isLiveTitle && new Date(v.published).getTime() > twelveHoursAgo;
        }) ?? null
      );
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
  });
}
