import { Router, Request, Response } from "express";

const router = Router();

const DEFAULT_CHANNEL_ID = "UChxz3kSq1sw0pLD3Pg-Vj7w";

// ── External API instances ────────────────────────────────────────────────────
const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://pipedapi.adminforge.de",
  "https://pipedapi.leptons.xyz",
  "https://api.piped.projectsegfault.com",
  "https://pipedapi.tokhmi.xyz",
];

const INVIDIOUS_INSTANCES = [
  "https://inv.tux.pizza",
  "https://invidious.nerdvpn.de",
  "https://invidious.io.lol",
  "https://iv.datura.network",
  "https://invidious.privacyredirect.com",
];

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

// Nextpage tokens for Piped pagination (page N stores token for page N+1)
const nextTokens = new Map<string, string>();

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDuration(secs: number): string | null {
  if (!secs || secs <= 0) return null;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

// Race all Piped instances — return first JSON OK response
async function tryPiped(path: string): Promise<any | null> {
  const results = await Promise.all(
    PIPED_INSTANCES.map((base) =>
      fetch(`${base}${path}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(6000),
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    )
  );
  return results.find((r) => r !== null) ?? null;
}

// Race all Invidious instances — return first JSON OK response
async function tryInvidious(path: string): Promise<any | null> {
  const results = await Promise.all(
    INVIDIOUS_INSTANCES.map((base) =>
      fetch(`${base}${path}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(6000),
      })
        .then((r) => (r.ok ? r.json() : null))
        .catch(() => null)
    )
  );
  return results.find((r) => r !== null) ?? null;
}

// Map Piped stream → VideoItem
function mapPiped(v: any): any {
  const id = (v.url || "").replace(/^\/watch\?v=/, "");
  const dur: number = typeof v.duration === "number" ? v.duration : -1;
  const isLive = dur === -1;
  const isShort = !isLive && (v.isShort === true || (dur > 0 && dur <= 65));
  return {
    id,
    title: v.title || "",
    publishedAt: v.uploaded ? new Date(v.uploaded).toISOString() : new Date().toISOString(),
    thumbnailUrl: v.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    duration: isLive ? null : formatDuration(dur),
    isLive,
    isShort,
    viewCount: v.views != null ? String(v.views) : null,
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
    publishedAt: new Date((v.published || Math.floor(Date.now() / 1000)) * 1000).toISOString(),
    thumbnailUrl: thumb,
    duration: formatDuration(dur),
    isLive,
    isShort: !isLive && dur > 0 && dur <= 65,
    viewCount: v.viewCount ? String(v.viewCount) : null,
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
    return [{ id, title, publishedAt, thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, duration: null, isLive, isShort: false, viewCount: null }];
  });
}

// Known YouTube UI strings to skip when extracting video title
const YT_UI_STRINGS = new Set([
  "SUBSCRIBE", "SUBSCRIBED", "UNSUBSCRIBE", "Unsubscribe", "Subscribe",
  "Cancel", "Report", "Share", "Save", "Download", "Clip", "Thanks",
  "Add to queue", "Like", "Dislike",
]);

// Scrape YouTube channel/live page for live indicator
async function scrapeYtLive(channelId: string): Promise<{ isLive: boolean; videoId: string | null; title: string | null } | null> {
  try {
    const r = await fetch(`https://www.youtube.com/channel/${channelId}/live`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(9000),
      redirect: "follow",
    });
    if (!r.ok) return null;
    const html = await r.text();

    // " watching now" is the most reliable live-only indicator on this page
    // "isLiveContent":true is set on the video renderer when the stream is active
    // Note: "liveStreamAbilityRenderer" is always present for live-capable channels — don't use it
    const hasLive =
      html.includes(' watching now"') ||
      html.includes('"isLiveContent":true') ||
      html.includes('"isLive":true');
    if (!hasLive) return { isLive: false, videoId: null, title: null };

    // Extract video ID
    const videoIdMatch = html.match(/"videoId":"([a-zA-Z0-9_-]{11})"/);
    const videoId = videoIdMatch?.[1] ?? null;

    // Extract title: collect ALL "text":"..." values, filter UI noise, pick longest
    const allTextMatches = [...html.matchAll(/"text":"([^"]{8,300})"/g)].map((m) => m[1]);
    const title =
      allTextMatches
        .filter(
          (t) =>
            !YT_UI_STRINGS.has(t) &&
            !t.includes(" watching now") &&
            !/playlist/i.test(t) &&
            !/sign in/i.test(t) &&
            !/again later/i.test(t) &&
            !/unsubscribe from/i.test(t)
        )
        .sort((a, b) => b.length - a.length)[0] ?? null;

    return { isLive: true, videoId, title };
  } catch {
    return null;
  }
}

// ── Race-based live detection ──────────────────────────────────────────────────
// Returns as soon as ANY strategy confirms live; doesn't wait for slow ones
function detectLive(channelId: string): Promise<{ isLive: boolean; videoId?: string | null; title?: string | null }> {
  return new Promise((resolve) => {
    let done = false;
    let completed = 0;
    const TOTAL = 4;

    function onResult(r: { isLive: boolean; videoId?: string | null; title?: string | null } | null) {
      completed++;
      if (!done && r?.isLive) {
        done = true;
        resolve(r);
        return;
      }
      if (completed >= TOTAL && !done) {
        done = true;
        resolve({ isLive: false });
      }
    }

    // Strategy 1: Piped — live stream has duration === -1
    tryPiped(`/channel/${channelId}`)
      .then((data) => {
        if (!data?.relatedStreams) { onResult(null); return; }
        const lv = (data.relatedStreams as any[]).find((v) => v.type === "stream" && v.duration === -1);
        if (!lv) { onResult(null); return; }
        const id = (lv.url || "").replace(/^\/watch\?v=/, "");
        onResult({ isLive: true, videoId: id || null, title: lv.title ?? null });
      })
      .catch(() => onResult(null));

    // Strategy 2: Invidious streams endpoint
    tryInvidious(`/api/v1/channels/${channelId}/streams`)
      .then((data) => {
        const lv = data?.videos?.find((v: any) => v.liveNow);
        onResult(lv ? { isLive: true, videoId: lv.videoId ?? null, title: lv.title ?? null } : null);
      })
      .catch(() => onResult(null));

    // Strategy 3: Scrape YouTube channel/live page
    scrapeYtLive(channelId).then(onResult).catch(() => onResult(null));

    // Strategy 4: RSS — latest video published < 6h ago with live keyword
    fetchRss(channelId)
      .then((videos) => {
        if (!videos.length) { onResult(null); return; }
        const v = videos[0];
        if (!v.isLive) { onResult(null); return; }
        const ageMs = Date.now() - new Date(v.publishedAt).getTime();
        if (ageMs > 6 * 60 * 60 * 1000) { onResult(null); return; }
        onResult({ isLive: true, videoId: v.id, title: v.title });
      })
      .catch(() => onResult(null));

    // Hard timeout 9 s
    setTimeout(() => { if (!done) { done = true; resolve({ isLive: false }); } }, 9000);
  });
}

// ── RSS proxy ─────────────────────────────────────────────────────────────────
router.get("/youtube/feed", async (req: Request, res: Response) => {
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
router.get("/youtube/videos", async (req: Request, res: Response) => {
  const channelId = (req.query.channelId as string) || DEFAULT_CHANNEL_ID;
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const cacheKey = `videos:${channelId}:${page}`;

  const cached = getCache<any>(cacheKey);
  if (cached) {
    res.setHeader("Cache-Control", "public, max-age=60");
    res.json(cached);
    return;
  }

  let sent = false;
  let resolveDone!: () => void;
  const done = new Promise<void>((r) => { resolveDone = r; });

  function send(videos: any[], hasMore: boolean) {
    if (sent || res.headersSent) return;
    sent = true;
    const payload = { videos, page, hasMore };
    setCache(cacheKey, payload, page === 1 ? 90_000 : 300_000);
    res.setHeader("Cache-Control", "public, max-age=60");
    res.json(payload);
    resolveDone();
  }

  const fallback = setTimeout(() => send([], false), 10_000);

  if (page === 1) {
    // RSS: fast first response (~1s)
    fetchRss(channelId)
      .then((videos) => { if (videos.length) send(videos, true); })
      .catch(() => {});

    // Piped: rich metadata (duration, views, isLive, isShort)
    tryPiped(`/channel/${channelId}`)
      .then((data) => {
        if (!data?.relatedStreams?.length) return;
        const videos = (data.relatedStreams as any[])
          .filter((v) => v.type === "stream")
          .map(mapPiped)
          .filter((v) => v.id);
        if (data.nextpage) nextTokens.set(`${channelId}:2`, data.nextpage);
        if (videos.length) send(videos, !!data.nextpage);
      })
      .catch(() => {});

    // Invidious: fallback enrichment if Piped fails
    tryInvidious(`/api/v1/channels/${channelId}/videos?page=1&sort_by=newest`)
      .then((data) => {
        if (!data?.videos?.length) return;
        const videos = (data.videos as any[]).map(mapInvidious);
        send(videos, videos.length >= 25);
      })
      .catch(() => {});
  } else {
    // Pages 2+: use stored Piped nextpage token if available
    const token = nextTokens.get(`${channelId}:${page}`);
    if (token) {
      tryPiped(`/nextpage/channel/${channelId}?nextpage=${encodeURIComponent(token)}`)
        .then((data) => {
          if (!data?.relatedStreams?.length) return;
          const videos = (data.relatedStreams as any[])
            .filter((v) => v.type === "stream")
            .map(mapPiped)
            .filter((v) => v.id);
          if (data.nextpage) nextTokens.set(`${channelId}:${page + 1}`, data.nextpage);
          send(videos, !!data.nextpage);
        })
        .catch(() => {});
    }

    // Always try Invidious for page 2+ as parallel attempt
    tryInvidious(`/api/v1/channels/${channelId}/videos?page=${page}&sort_by=newest`)
      .then((data) => {
        if (!data?.videos?.length) return;
        const videos = (data.videos as any[]).map(mapInvidious);
        send(videos, videos.length >= 25);
      })
      .catch(() => {});
  }

  await done;
  clearTimeout(fallback);
});

// ── GET /youtube/live ─────────────────────────────────────────────────────────
router.get("/youtube/live", async (req: Request, res: Response) => {
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
router.post("/youtube/cache/clear", (req: Request, res: Response) => {
  const { passcode } = req.body as { passcode?: string };
  if (passcode !== "DAFIRE94") { res.status(401).json({ error: "Unauthorized" }); return; }
  cache.clear();
  nextTokens.clear();
  res.json({ ok: true });
});

export default router;
