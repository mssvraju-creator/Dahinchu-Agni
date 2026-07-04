import { Router, Request, Response } from "express";

const router = Router();

const DEFAULT_CHANNEL_ID = "UChxz3kSq1sw0pLD3Pg-Vj7w";

const INVIDIOUS_INSTANCES = [
  "https://inv.tux.pizza",
  "https://invidious.nerdvpn.de",
  "https://invidious.io.lol",
  "https://iv.datura.network",
  "https://invidious.privacyredirect.com",
];

// Try all Invidious instances in parallel; return first JSON response
async function tryInvidiousParallel(path: string): Promise<any | null> {
  const attempts = INVIDIOUS_INSTANCES.map((instance) =>
    fetch(`${instance}${path}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(5000),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .catch(() => null)
  );
  const results = await Promise.all(attempts);
  return results.find((r) => r !== null) ?? null;
}

function formatDuration(seconds: number): string | null {
  if (!seconds || seconds <= 0) return null;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

function mapInvidiousVideo(v: any) {
  const thumbs: any[] = v.videoThumbnails || [];
  let thumb =
    thumbs.find((t) => t.quality === "high")?.url ||
    thumbs.find((t) => t.quality === "medium")?.url ||
    thumbs[0]?.url ||
    `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
  if (thumb.startsWith("//")) thumb = `https:${thumb}`;

  const durationSecs = v.lengthSeconds || 0;
  const isLive = !!v.liveNow;
  const isShort = !isLive && durationSecs > 0 && durationSecs <= 65;

  return {
    id: v.videoId,
    title: v.title || "",
    publishedAt: new Date((v.published || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    thumbnailUrl: thumb,
    videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
    channelName: v.author || "Dahinchu Agni Ministries",
    duration: formatDuration(durationSecs),
    isLive,
    isShort,
    viewCount: v.viewCount ? String(v.viewCount) : null,
  };
}

async function rssToVideos(channelId: string): Promise<any[]> {
  const r = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    {
      headers: { Accept: "application/rss+xml, application/xml, text/xml, */*" },
      signal: AbortSignal.timeout(7000),
    }
  );
  if (!r.ok) throw new Error(`RSS ${r.status}`);
  const xml = await r.text();
  return (xml.match(/<entry>([\s\S]*?)<\/entry>/g) || [])
    .flatMap((entry: string) => {
      const id = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1]?.trim();
      const title = (entry.match(/<title>(.*?)<\/title>/)?.[1] || "")
        .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
      const publishedRaw = entry.match(/<published>(.*?)<\/published>/)?.[1]?.trim();
      if (!id || !title) return [];
      // Detect if it looks like a live stream from the title
      const titleLower = title.toLowerCase();
      const isLive = titleLower.includes("live") || titleLower.includes("stream") || titleLower.includes("streaming");
      return [{
        id, title,
        publishedAt: publishedRaw || new Date().toISOString(),
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${id}`,
        channelName: "Dahinchu Agni Ministries",
        duration: null,
        isLive,
        isShort: false,
        viewCount: null,
      }];
    });
}

// RSS proxy — kept for compatibility
router.get("/youtube/feed", async (req: Request, res: Response) => {
  const channelId = (req.query.channelId as string) || DEFAULT_CHANNEL_ID;
  try {
    const upstream = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
      {
        headers: { Accept: "application/rss+xml, application/xml, text/xml, */*" },
        signal: AbortSignal.timeout(10000),
      }
    );
    if (!upstream.ok) { res.status(upstream.status).json({ error: "Feed unavailable" }); return; }
    const xml = await upstream.text();
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(xml);
  } catch (err: any) {
    res.status(500).json({ error: "Proxy error", message: err?.message });
  }
});

// Videos: try RSS first (fast), then Invidious for richer data
router.get("/youtube/videos", async (req: Request, res: Response) => {
  const channelId = (req.query.channelId as string) || DEFAULT_CHANNEL_ID;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);

  let sent = false;
  let resolveOnSend: () => void = () => {};
  const done = new Promise<void>((resolve) => { resolveOnSend = resolve; });

  function send(videos: any[], hasMore: boolean) {
    if (sent || res.headersSent) return;
    sent = true;
    res.setHeader("Cache-Control", "public, max-age=180");
    res.json({ videos, page, hasMore });
    resolveOnSend();
  }

  const fallbackTimer = setTimeout(() => send([], false), 8000);

  // RSS (fast, page 1 only, ~15 latest videos)
  if (page === 1) {
    rssToVideos(channelId)
      .then((videos) => { if (videos.length) send(videos, true); })
      .catch(() => {});
  }

  // Invidious (richer data: duration, viewCount, isShort, isLive)
  tryInvidiousParallel(
    `/api/v1/channels/${channelId}/videos?page=${page}&sort_by=newest`
  )
    .then((data) => {
      if (data?.videos?.length) {
        const videos = (data.videos as any[]).map(mapInvidiousVideo);
        const hasMore = videos.length >= 25 || data.continuation != null;
        send(videos, hasMore);
      }
    })
    .catch(() => {});

  await done;
  clearTimeout(fallbackTimer);
});

// Live stream detection — returns { isLive, videoId, title, thumbnailUrl }
router.get("/youtube/live", async (req: Request, res: Response) => {
  const channelId = (req.query.channelId as string) || DEFAULT_CHANNEL_ID;

  res.setHeader("Cache-Control", "no-cache, no-store");

  try {
    // Strategy 1: Check channel endpoint for liveNow flag
    const [channelData, videosData] = await Promise.all([
      tryInvidiousParallel(`/api/v1/channels/${channelId}`),
      tryInvidiousParallel(`/api/v1/channels/${channelId}/videos?page=1&sort_by=newest`),
    ]);

    // Check latest videos list for any currently live video
    if (videosData?.videos) {
      const liveVideo = (videosData.videos as any[]).find((v: any) => v.liveNow);
      if (liveVideo) {
        res.json({
          isLive: true,
          videoId: liveVideo.videoId,
          title: liveVideo.title || null,
          thumbnailUrl: `https://i.ytimg.com/vi/${liveVideo.videoId}/hqdefault.jpg`,
        });
        return;
      }
    }

    // Check channel info liveNow flag and streams endpoint
    if (channelData?.liveNow) {
      // Try streams endpoint for the live video details
      const streamsData = await tryInvidiousParallel(`/api/v1/channels/${channelId}/streams`);
      const liveVideo = streamsData?.videos?.find((v: any) => v.liveNow) || streamsData?.videos?.[0];
      if (liveVideo) {
        res.json({
          isLive: true,
          videoId: liveVideo.videoId,
          title: liveVideo.title || null,
          thumbnailUrl: `https://i.ytimg.com/vi/${liveVideo.videoId}/hqdefault.jpg`,
        });
        return;
      }
      // liveNow=true but no video details — return live without videoId
      res.json({ isLive: true, videoId: null, title: "Live Now", thumbnailUrl: null });
      return;
    }

    // Strategy 2: Check RSS feed for any live indicators in the latest video
    try {
      const rssVideos = await rssToVideos(channelId);
      if (rssVideos.length > 0 && rssVideos[0].isLive) {
        res.json({
          isLive: true,
          videoId: rssVideos[0].id,
          title: rssVideos[0].title || null,
          thumbnailUrl: rssVideos[0].thumbnailUrl,
        });
        return;
      }
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }

  res.json({ isLive: false, videoId: null, title: null, thumbnailUrl: null });
});

export default router;
