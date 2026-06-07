import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Platform } from "react-native";
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

export type VideoCategory = "all" | "sermon" | "teaching" | "live" | "short";

export function getVideoCategory(video: YouTubeVideo): VideoCategory {
  if (video.isLive) return "live";
  if (video.isShort || ((video.durationSeconds ?? 0) > 0 && (video.durationSeconds ?? 0) <= 90))
    return "short";

  const t = video.title.toLowerCase();
  if (t.includes("live") || t.includes("ప్రత్యక్ష") || t.includes("livestream"))
    return "live";
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

async function fetchPage(
  page: number
): Promise<{ videos: YouTubeVideo[]; hasMore: boolean }> {
  try {
    const res = await fetch(
      `/api/youtube/videos?channelId=${CHANNEL_ID}&page=${page}`,
      { signal: AbortSignal.timeout(12000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.videos) && data.videos.length > 0) {
        const videos: YouTubeVideo[] = data.videos.map((v: any) => ({
          ...v,
          isShort: (v.durationSeconds ?? 0) > 0 && (v.durationSeconds ?? 0) <= 90,
        }));
        return { videos, hasMore: !!data.hasMore };
      }
    }
  } catch {}

  if (page === 1) {
    try {
      const rssUrl =
        Platform.OS === "web"
          ? `/api/youtube/feed?channelId=${CHANNEL_ID}`
          : `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
      const res = await fetch(rssUrl, { signal: AbortSignal.timeout(12000) });
      if (res.ok) {
        return { videos: parseRSS(await res.text()), hasMore: false };
      }
    } catch {}
  }

  return { videos: [], hasMore: false };
}

export function useYouTubeFeed() {
  return useQuery({
    queryKey: ["youtube-feed-v2", CHANNEL_ID],
    queryFn: () => fetchPage(1).then((r) => r.videos),
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useAllVideos() {
  return useInfiniteQuery({
    queryKey: ["youtube-all-v2", CHANNEL_ID],
    queryFn: ({ pageParam }) => fetchPage(pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length + 1 : undefined,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLiveStream() {
  return useQuery({
    queryKey: ["youtube-live-v2", CHANNEL_ID],
    queryFn: async (): Promise<YouTubeVideo | null> => {
      try {
        const res = await fetch(
          `/api/youtube/live?channelId=${CHANNEL_ID}`,
          { signal: AbortSignal.timeout(10000) }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.streams) && data.streams.length > 0) {
            return data.streams[0] as YouTubeVideo;
          }
          return null;
        }
      } catch {}

      const { videos } = await fetchPage(1);
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
