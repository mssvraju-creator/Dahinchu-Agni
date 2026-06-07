import { Router, Request, Response } from "express";

const router = Router();

const DEFAULT_CHANNEL_ID = "UChxz3kSq1sw0pLD3Pg-Vj7w";

const INVIDIOUS_INSTANCES = [
  "https://inv.tux.pizza",
  "https://invidious.nerdvpn.de",
  "https://invidious.io.lol",
];

// Try all Invidious instances in parallel; return first JSON response
async function tryInvidiousParallel(path: string): Promise<any | null> {
  const attempts = INVIDIOUS_INSTANCES.map((instance) =>
    fetch(`${instance}${path}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .catch(() => null)
  );
  const results = await Promise.all(attempts);
  return results.find((r) => r !== null) ?? null;
}

function mapInvidiousVideo(v: any) {
  const thumbs: any[] = v.videoThumbnails || [];
  let thumb =
    thumbs.find((t) => t.quality === "high")?.url ||
    thumbs[0]?.url ||
    `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;
  if (thumb.startsWith("//")) thumb = `https:${thumb}`;
  return {
    id: v.videoId,
    title: v.title || "",
    published: new Date((v.published || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    thumbnailUrl: thumb,
    videoUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
    channelName: v.author || "Dahinchu Agni Ministries",
    durationSeconds: v.lengthSeconds || 0,
    isLive: !!v.liveNow,
    viewCount: v.viewCount || 0,
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
      const published = entry.match(/<published>(.*?)<\/published>/)?.[1]?.trim();
      if (!id || !title) return [];
      return [{
        id, title,
        published: published || new Date().toISOString(),
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        videoUrl: `https://www.youtube.com/watch?v=${id}`,
        channelName: "Dahinchu Agni Ministries",
        durationSeconds: 0, isLive: false, viewCount: 0,
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

// Videos: return as soon as either RSS or Invidious has data (whichever wins)
router.get("/youtube/videos", async (req: Request, res: Response) => {
  const channelId = (req.query.channelId as string) || DEFAULT_CHANNEL_ID;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);

  let sent = false;
  function send(videos: any[], hasMore: boolean) {
    if (sent || res.headersSent) return;
    sent = true;
    res.setHeader("Cache-Control", "public, max-age=180");
    res.json({ videos, page, hasMore });
  }

  // Promise that resolves when we send; used for cleanup
  const done = new Promise<void>((resolve) => {
    const originalSend = send;
    send = (...args) => { originalSend(...args); resolve(); };
  });

  // Fallback: respond empty after 6 seconds
  const fallbackTimer = setTimeout(() => send([], false), 6000);

  // RSS (fast ~800ms) — always try for page 1
  if (page === 1) {
    rssToVideos(channelId)
      .then((videos) => { if (videos.length) send(videos, false); })
      .catch(() => {});
  }

  // Invidious (may have more videos, slower)
  tryInvidiousParallel(
    `/api/v1/channels/${channelId}/videos?page=${page}&sort_by=newest`
  )
    .then((data) => {
      if (data?.videos?.length) {
        const videos = (data.videos as any[]).map(mapInvidiousVideo);
        // Only override RSS if Invidious has significantly more videos
        if (!sent || videos.length > 15) send(videos, videos.length >= 25);
      }
    })
    .catch(() => {});

  await done;
  clearTimeout(fallbackTimer);
});

// Live stream detection
router.get("/youtube/live", async (req: Request, res: Response) => {
  const channelId = (req.query.channelId as string) || DEFAULT_CHANNEL_ID;

  const data = await tryInvidiousParallel(`/api/v1/channels/${channelId}/streams`);

  if (data?.videos) {
    const streams = (data.videos as any[]).filter((v) => v.liveNow).map(mapInvidiousVideo);
    res.setHeader("Cache-Control", "no-cache");
    res.json({ streams });
    return;
  }

  res.json({ streams: [] });
});

export default router;
