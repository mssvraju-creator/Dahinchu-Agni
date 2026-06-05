import { useQuery } from "@tanstack/react-query";
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
}

const CHANNEL_ID = MINISTRY.youtubeChannelId;
const DIRECT_RSS = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
const PROXY_RSS = `/api/youtube/feed?channelId=${CHANNEL_ID}`;

function parseRSS(xml: string): YouTubeVideo[] {
  const entries: YouTubeVideo[] = [];
  const entryMatches = xml.match(/<entry>([\s\S]*?)<\/entry>/g) ?? [];

  for (const entry of entryMatches) {
    const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
    const titleMatch = entry.match(/<title>(.*?)<\/title>/);
    const publishedMatch = entry.match(/<published>(.*?)<\/published>/);

    if (!videoIdMatch?.[1] || !titleMatch?.[1]) continue;

    const videoId = videoIdMatch[1].trim();
    const title = (titleMatch[1] || "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
      .trim();

    if (!title) continue;

    const titleLower = title.toLowerCase();
    const isLive =
      titleLower.includes("live") ||
      titleLower.includes("livestream") ||
      titleLower.includes("live stream") ||
      titleLower.includes("ప్రత్యక్ష");

    entries.push({
      id: videoId,
      title,
      published: publishedMatch?.[1]?.trim() ?? new Date().toISOString(),
      thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
      channelName: "Dahinchu Agni Ministries",
      isLive,
    });
  }

  return entries;
}

async function fetchYouTubeFeed(): Promise<YouTubeVideo[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  try {
    const url = Platform.OS === "web" ? PROXY_RSS : DIRECT_RSS;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const xml = await response.text();
    return parseRSS(xml);
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

export function useYouTubeFeed() {
  return useQuery({
    queryKey: ["youtube-feed", CHANNEL_ID],
    queryFn: fetchYouTubeFeed,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export function useLiveStream() {
  return useQuery({
    queryKey: ["youtube-live", CHANNEL_ID],
    queryFn: async () => {
      const videos = await fetchYouTubeFeed();
      const threeHoursAgo = Date.now() - 3 * 60 * 60 * 1000;
      return (
        videos.find((v) => {
          const pubTime = new Date(v.published).getTime();
          return v.isLive && pubTime > threeHoursAgo;
        }) ?? null
      );
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000,
  });
}
