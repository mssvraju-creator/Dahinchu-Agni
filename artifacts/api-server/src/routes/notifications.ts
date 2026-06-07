import { Router, Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = Router();

const CHANNEL_ID = "UChxz3kSq1sw0pLD3Pg-Vj7w";
const ADMIN_PASSCODE = "DAFIRE94";
const TOKENS_FILE = path.join(process.cwd(), "push_tokens.json");
const STATE_FILE = path.join(process.cwd(), "notification_state.json");

// ── Token persistence ─────────────────────────────────────────────────────────
let pushTokens: string[] = [];
let notifState: { lastVideoId?: string; wasLive?: boolean } = {};

function loadState() {
  try {
    pushTokens = JSON.parse(fs.readFileSync(TOKENS_FILE, "utf8"));
  } catch {}
  try {
    notifState = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
  } catch {}
}

function saveTokens() {
  try {
    fs.writeFileSync(TOKENS_FILE, JSON.stringify(pushTokens));
  } catch {}
}

function saveNotifState() {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(notifState));
  } catch {}
}

loadState();

// ── Expo Push API ─────────────────────────────────────────────────────────────
type PushMessage = {
  to: string;
  title: string;
  body: string;
  sound?: string;
  data?: Record<string, unknown>;
  badge?: number;
  channelId?: string;
  priority?: "default" | "normal" | "high";
};

async function sendExpoNotifications(messages: PushMessage[]) {
  if (messages.length === 0) return;
  const chunks: PushMessage[][] = [];
  for (let i = 0; i < messages.length; i += 100) {
    chunks.push(messages.slice(i, i + 100));
  }
  for (const chunk of chunks) {
    try {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "accept-encoding": "gzip, deflate",
        },
        body: JSON.stringify(chunk),
        signal: AbortSignal.timeout(12000),
      });
    } catch {}
  }
}

async function broadcastNotification(payload: {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}) {
  if (pushTokens.length === 0) return;
  const messages: PushMessage[] = pushTokens.map((token) => ({
    to: token,
    title: payload.title,
    body: payload.body,
    sound: "default",
    channelId: "dahinchu-agni",
    priority: "high",
    data: payload.data ?? {},
  }));
  await sendExpoNotifications(messages);
}

// ── RSS helper ────────────────────────────────────────────────────────────────
async function fetchLatestVideoFromRss(): Promise<
  { id: string; title: string } | null
> {
  try {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const xml = await res.text();
    const idMatch = xml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
    const titleMatch = xml.match(/<title>([^<]+)<\/title>/g);
    if (!idMatch) return null;
    const titleRaw = titleMatch?.[1] ?? "";
    const title = titleRaw.replace(/<\/?title>/g, "").trim();
    return { id: idMatch[1], title };
  } catch {
    return null;
  }
}

// ── Live stream check ─────────────────────────────────────────────────────────
const INVIDIOUS_INSTANCES = [
  "https://inv.tux.pizza",
  "https://invidious.nerdvpn.de",
  "https://invidious.io.lol",
];

async function checkLiveStream(): Promise<{ isLive: boolean; title: string }> {
  // Try Invidious instances in parallel (first success wins)
  const results = await Promise.allSettled(
    INVIDIOUS_INSTANCES.map(async (base) => {
      const res = await fetch(
        `${base}/api/v1/channels/${CHANNEL_ID}/streams`,
        { signal: AbortSignal.timeout(4000) }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const data = (await res.json()) as {
        videos?: { liveNow?: boolean; title?: string }[];
      };
      const live = data.videos?.find((v) => v.liveNow);
      return { isLive: !!live, title: live?.title ?? "" };
    })
  );
  for (const r of results) {
    if (r.status === "fulfilled") return r.value;
  }
  return { isLive: false, title: "" };
}

// ── Background poller ─────────────────────────────────────────────────────────
let pollerStarted = false;

export function startNotificationPoller() {
  if (pollerStarted) return;
  pollerStarted = true;

  async function poll() {
    // 1. Live stream check
    try {
      const { isLive, title } = await checkLiveStream();
      if (isLive && !notifState.wasLive) {
        notifState.wasLive = true;
        saveNotifState();
        await broadcastNotification({
          title: "🔴 Dahinchu Agni is LIVE NOW!",
          body: title || "Join the live stream — tap to watch!",
          data: { type: "live" },
        });
      } else if (!isLive && notifState.wasLive) {
        notifState.wasLive = false;
        saveNotifState();
      }
    } catch {}

    // 2. New video check
    try {
      const latest = await fetchLatestVideoFromRss();
      if (latest) {
        if (
          notifState.lastVideoId !== undefined &&
          latest.id !== notifState.lastVideoId
        ) {
          await broadcastNotification({
            title: "🎬 New Message from Dahinchu Agni",
            body: latest.title || "A new message has been posted — watch now!",
            data: { type: "video", videoId: latest.id },
          });
        }
        notifState.lastVideoId = latest.id;
        saveNotifState();
      }
    } catch {}
  }

  // Initial seed (no notification, just set baseline)
  async function seedBaseline() {
    try {
      const latest = await fetchLatestVideoFromRss();
      if (latest && notifState.lastVideoId === undefined) {
        notifState.lastVideoId = latest.id;
        saveNotifState();
      }
    } catch {}
    try {
      const { isLive } = await checkLiveStream();
      if (notifState.wasLive === undefined) {
        notifState.wasLive = isLive;
        saveNotifState();
      }
    } catch {}
  }

  // Seed baseline after 5s, then start polling
  setTimeout(async () => {
    await seedBaseline();
    setInterval(poll, 3 * 60 * 1000); // every 3 min
  }, 5000);
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Register a push token
router.post("/notifications/register", (req: Request, res: Response) => {
  const { token, platform } = req.body as {
    token?: string;
    platform?: string;
  };
  if (!token || typeof token !== "string") {
    res.status(400).json({ error: "token required" });
    return;
  }
  if (!pushTokens.includes(token)) {
    pushTokens.push(token);
    saveTokens();
  }
  req.log.info({ platform, total: pushTokens.length }, "push token registered");
  res.json({ ok: true });
});

// Get subscriber count (public)
router.get("/notifications/stats", (_req: Request, res: Response) => {
  res.json({ subscribers: pushTokens.length });
});

// Admin: send a custom broadcast notification
router.post("/notifications/send", async (req: Request, res: Response) => {
  const { passcode, title, body, type } = req.body as {
    passcode?: string;
    title?: string;
    body?: string;
    type?: string;
  };

  if (passcode !== ADMIN_PASSCODE) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!title || !body) {
    res.status(400).json({ error: "title and body required" });
    return;
  }

  await broadcastNotification({
    title,
    body,
    data: { type: type ?? "announcement" },
  });

  req.log.info({ title, recipients: pushTokens.length }, "manual notification sent");
  res.json({ ok: true, sent: pushTokens.length });
});

// Admin: send a "going live" notification manually
router.post("/notifications/send-live", async (req: Request, res: Response) => {
  const { passcode, streamTitle } = req.body as {
    passcode?: string;
    streamTitle?: string;
  };
  if (passcode !== ADMIN_PASSCODE) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  await broadcastNotification({
    title: "🔴 Dahinchu Agni is LIVE NOW!",
    body: streamTitle ?? "Join the live stream — tap to watch!",
    data: { type: "live" },
  });
  res.json({ ok: true, sent: pushTokens.length });
});

export default router;
