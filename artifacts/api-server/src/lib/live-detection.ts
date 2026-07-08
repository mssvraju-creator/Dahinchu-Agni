export const CHANNEL_ID = "UChxz3kSq1sw0pLD3Pg-Vj7w";

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

export async function tryPiped(path: string): Promise<any | null> {
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

export async function tryInvidious(path: string): Promise<any | null> {
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

const YT_UI_STRINGS = new Set([
  "SUBSCRIBE", "SUBSCRIBED", "UNSUBSCRIBE", "Unsubscribe", "Subscribe",
  "Cancel", "Report", "Share", "Save", "Download", "Clip", "Thanks",
  "Add to queue", "Like", "Dislike",
]);

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
    const hasWatching = html.includes(' watching now"');
    const finalUrl = r.url ?? "";
    const redirectVideoId = finalUrl.match(/youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/)?.[1] ?? null;
    if (!hasWatching) return { isLive: false, videoId: null, title: null };
    const canonicalMatch = html.match(/"canonical":"https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})"/);
    const videoId = redirectVideoId ?? canonicalMatch?.[1] ?? null;
    const htmlTitleRaw = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";
    const htmlTitle = htmlTitleRaw
      .replace(/ - YouTube$/i, "")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .trim();
    const fromHtmlTitle = htmlTitle.length > 8 && !/^@?\w+$/.test(htmlTitle) ? htmlTitle : null;
    const allTextMatches = [...html.matchAll(/"text":"([^"]{5,200})"/g)].map((m) => m[1]);
    const UI_NOISE = [
      "microphone", "browser settings", "search by voice", "allow access",
      "voice search", "camera access", "location", "notification",
    ];
    const fromJson =
      allTextMatches
        .filter(
          (t) =>
            !YT_UI_STRINGS.has(t) &&
            !t.includes(" watching now") &&
            !/playlist/i.test(t) &&
            !/sign in/i.test(t) &&
            !/again later/i.test(t) &&
            !/unsubscribe from/i.test(t) &&
            !UI_NOISE.some((n) => t.toLowerCase().includes(n))
        )
        .sort((a, b) => b.length - a.length)[0] ?? null;
    const title = fromHtmlTitle ?? fromJson;
    return { isLive: true, videoId, title };
  } catch {
    return null;
  }
}

export function detectLive(channelId: string): Promise<{ isLive: boolean; videoId?: string | null; title?: string | null }> {
  return new Promise((resolve) => {
    let done = false;
    let completed = 0;
    const TOTAL = 3;

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

    tryPiped(`/channel/${channelId}`)
      .then((data) => {
        if (!data?.relatedStreams) { onResult(null); return; }
        const lv = (data.relatedStreams as any[]).find((v) => v.type === "stream" && v.duration === -1);
        if (!lv) { onResult(null); return; }
        const id = (lv.url || "").replace(/^\/watch\?v=/, "");
        onResult({ isLive: true, videoId: id || null, title: lv.title ?? null });
      })
      .catch(() => onResult(null));

    tryInvidious(`/api/v1/channels/${channelId}/streams`)
      .then((data) => {
        const lv = (data?.videos as any[] | undefined)?.find((v: any) => v.liveNow);
        onResult(lv ? { isLive: true, videoId: lv.videoId ?? null, title: lv.title ?? null } : null);
      })
      .catch(() => onResult(null));

    scrapeYtLive(channelId).then(onResult).catch(() => onResult(null));

    setTimeout(() => { if (!done) { done = true; resolve({ isLive: false }); } }, 10_000);
  });
}
