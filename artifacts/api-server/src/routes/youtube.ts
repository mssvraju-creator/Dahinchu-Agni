import { Router, Request as ExpressRequest, Response as ExpressResponse } from "express";
import { detectLive, tryPiped, tryInvidious, CHANNEL_ID } from "../lib/live-detection.js";
import { fetchVideos as fetchYoutubeApiVideos } from "../lib/youtube-api.js";

const router = Router();

const DEFAULT_CHANNEL_ID = CHANNEL_ID;

// ── In-memory cache ───────────────────────────────────────────────────────────
const cache = new Map<string, { data: any; expiresAt: number }>();
function getCache<T>(key: string): T | null {
  const e = cache.get(key);
  if (!e || Date.now() > e.expiresAt) return null;
  return e.data as T;
}
function setCache(key: string, data: any, ttlMs: number) {
  cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// Map Piped stream → VideoItem
function mapPiped(v: any): any {
  const id = (v.url || "").replace(/^\/watch\?v=/, "");
  const dur: number = typeof v.duration === "number" ? v.duration : -1;
  const isLive = dur === -1;
  const isShort = !isLive && (v.isShort === true || (dur > 0 && dur <= 65));
  return {
    id,
    title: v.title || "",
    published: v.uploaded ? new Date(v.uploaded).toISOString() : new Date().toISOString(),
    thumbnailUrl: v.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    videoUrl: `https://www.youtube.com/watch?v=${id}`,
    channelName: "Dahinchu Agni Ministries",
    isLive,
    isShort,
    durationSeconds: isLive ? null : dur,
    viewCount: v.views != null ? v.views : null,
  };
}

// Map Invidious video → VideoItem
function mapInvidious(v: any): any {
  const thumbs: any[] = v.videoThumbnails || [];
  let thumb =
    thumbs.find((t) => t.quality === "high")?.url ||
    thumbs.find((t) => t.quality === "medium")?.url ||
    thumbs[0]?.url ||
    `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
  if (thumb.startsWith("//")) thumb = `https:${thumb}`;
  const dur = v.lengthSeconds || 0;
  const isLive = !!v.liveNow;
  return {
    id: v.videoId,
    title: v.title || "",
    published: new Date((v.published || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    thumbnailUrl: thumb,
    videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
    channelName: "Dahinchu Agni Ministries",
    isLive,
    isShort: !isLive && dur > 0 && dur <= 65,
    durationSeconds: dur || null,
    viewCount: v.viewCount ? v.viewCount : null,
  };
}

// Parse YouTube RSS → VideoItem[]  (always fast, max 15 newest)
async function fetchRss(channelId: string): Promise<any[]> {
  const r = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    {
      headers: { Accept: "application/rss+xml,application/xml,text/xml,*/*" },
      signal: AbortSignal.timeout(7000),
    }
  );
  if (!r.ok) throw new Error(`RSS ${r.status}`);
  const xml = await r.text();
  return (xml.match(/<entry>([\s\S]*?)<\/entry>/g) || []).flatMap((entry) => {
    const id = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1]?.trim();
    const raw = entry.match(/<title>(.*?)<\/title>/)?.[1] || "";
    const title = raw
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
    const publishedAt = entry.match(/<published>(.*?)<\/published>/)?.[1]?.trim() || new Date().toISOString();
    if (!id || !title) return [];
    const tl = title.toLowerCase();
    const isLive = tl.includes("live") || tl.includes("stream") || tl.includes("broadcast");
    return [{
      id, title,
      published: publishedAt,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      videoUrl: `https://www.youtube.com/watch?v=${id}`,
      channelName: "Dahinchu Agni Ministries",
      isLive, isShort: false, durationSeconds: null, viewCount: null,
    }];
  });
}

// ── Race-based live detection ──────────────────────────────────────────────────
// Shared with notifications via ../lib/live-detection.js

// ── RSS proxy ─────────────────────────────────────────────────────────────────
router.get("/youtube/feed", async (req: ExpressRequest, res: ExpressResponse) => {
  const channelId = (req.query.channelId as string) || DEFAULT_CHANNEL_ID;
  try {
    const upstream = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      { headers: { Accept: "application/rss+xml,application/xml,text/xml,*/*" }, signal: AbortSignal.timeout(10000) }
    );
    if (!upstream.ok) { res.status(upstream.status).json({ error: "Feed unavailable" }); return; }
    const xml = await upstream.text();
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=120");
    res.send(xml);
  } catch (err: any) {
    res.status(500).json({ error: "Proxy error", message: err?.message });
  }
});

// ── GET /youtube/videos ───────────────────────────────────────────────────────
router.get("/youtube/videos", async (req: ExpressRequest, res: ExpressResponse) => {
  const channelId = (req.query.channelId as string) || DEFAULT_CHANNEL_ID;
  const cacheKey = `videos:${channelId}`;

  const cached = getCache<any>(cacheKey);
  if (cached) {
    res.setHeader("Cache-Control", "public, max-age=60");
    res.json(cached);
    return;
  }

  let sent = false;

  function send(videos: any[]) {
    if (sent || res.headersSent) return;
    sent = true;
    const payload = { videos, hasMore: false };
    setCache(cacheKey, payload, 90_000);
    res.setHeader("Cache-Control", "public, max-age=60");
    res.json(payload);
  }

  const fallback = setTimeout(() => send([]), 10_000);

  // Strategy 1: YouTube Data API v3 (most reliable, up to 50 videos)
  const apiVideos = await fetchYoutubeApiVideos(channelId, 50);
  if (apiVideos.length > 0) {
    clearTimeout(fallback);
    send(apiVideos);
    return;
  }

  // Strategy 2: Piped (rich metadata, ~15 videos)
  tryPiped(`/channel/${channelId}`)
    .then((data) => {
      if (!data?.relatedStreams?.length) return;
      const videos = (data.relatedStreams as any[])
        .filter((v: any) => v.type === "stream")
        .map(mapPiped)
        .filter((v: any) => v.id);
      if (videos.length) send(videos);
    })
    .catch(() => {});

  // Strategy 3: Invidious (fallback)
  tryInvidious(`/api/v1/channels/${channelId}/videos?page=1&sort_by=newest`)
    .then((data) => {
      if (!data?.videos?.length) return;
      const videos = (data.videos as any[]).map(mapInvidious);
      send(videos);
    })
    .catch(() => {});

  // Strategy 4: RSS (fast, no metadata)
  fetchRss(channelId)
    .then((videos) => { if (videos.length) send(videos); })
    .catch(() => {});

  await new Promise((r) => { const check = setInterval(() => { if (sent) { clearInterval(check); r(undefined); } }, 100); });
  clearTimeout(fallback);
});

// ── GET /youtube/live ─────────────────────────────────────────────────────────
router.get("/youtube/live", async (req: ExpressRequest, res: ExpressResponse) => {
  const channelId = (req.query.channelId as string) || DEFAULT_CHANNEL_ID;
  const cacheKey = `live:${channelId}`;

  res.setHeader("Cache-Control", "no-cache, no-store");

  const cached = getCache<any>(cacheKey);
  if (cached) {
    res.json(cached);
    return;
  }

  const result = await detectLive(channelId);
  const payload = {
    isLive: result.isLive,
    videoId: result.videoId ?? null,
    title: result.title ?? null,
    thumbnailUrl: result.videoId
      ? `https://i.ytimg.com/vi/${result.videoId}/maxresdefault.jpg`
      : null,
  };
  setCache(cacheKey, payload, result.isLive ? 30_000 : 60_000);
  res.json(payload);
});

// ── POST /youtube/cache/clear ── force refresh (admin)
router.post("/youtube/cache/clear", (req: ExpressRequest, res: ExpressResponse) => {
  const { passcode } = req.body as { passcode?: string };
  if (passcode !== "DAFIRE94") { res.status(401).json({ error: "Unauthorized" }); return; }
  cache.clear();
  res.json({ ok: true });
});

export default router;
