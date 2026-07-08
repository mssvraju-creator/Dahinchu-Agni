import { Router, Request as ExpressRequest, Response as ExpressResponse } from "express";
import fs from "fs";
import path from "path";
import webPush from "web-push";
import { detectLive, CHANNEL_ID } from "../lib/live-detection.js";

const router = Router();

const ADMIN_PASSCODE = "DAFIRE94";
const TOKENS_FILE = path.join(process.cwd(), "push_tokens.json");
const WEB_SUBS_FILE = path.join(process.cwd(), "web_push_subscriptions.json");
const STATE_FILE = path.join(process.cwd(), "notification_state.json");

// ── VAPID setup ───────────────────────────────────────────────────────────────
const VAPID_PUBLIC = process.env.VAPID_PUBLIC_KEY ?? "";
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY ?? "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT ?? "mailto:info@dahinchuagni.com";

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  webPush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);
}

// ── Expo token persistence ────────────────────────────────────────────────────
let pushTokens: string[] = [];
let notifState: { lastVideoId?: string; wasLive?: boolean } = {};

// ── Web push subscription persistence ────────────────────────────────────────
type WebSub = webPush.PushSubscription;
let webSubscriptions: WebSub[] = [];

function loadState() {
  try { pushTokens = JSON.parse(fs.readFileSync(TOKENS_FILE, "utf8")); } catch {}
  try { notifState = JSON.parse(fs.readFileSync(STATE_FILE, "utf8")); } catch {}
  try { webSubscriptions = JSON.parse(fs.readFileSync(WEB_SUBS_FILE, "utf8")); } catch {}
}

function saveTokens() {
  try { fs.writeFileSync(TOKENS_FILE, JSON.stringify(pushTokens)); } catch {}
}

function saveWebSubs() {
  try { fs.writeFileSync(WEB_SUBS_FILE, JSON.stringify(webSubscriptions)); } catch {}
}

function saveNotifState() {
  try { fs.writeFileSync(STATE_FILE, JSON.stringify(notifState)); } catch {}
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
  for (let i = 0; i < messages.length; i += 100) chunks.push(messages.slice(i, i + 100));
  for (const chunk of chunks) {
    try {
      await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", "accept-encoding": "gzip, deflate" },
        body: JSON.stringify(chunk),
        signal: AbortSignal.timeout(12000),
      });
    } catch {}
  }
}

// ── Web Push sender ───────────────────────────────────────────────────────────
async function sendWebPushNotifications(payload: { title: string; body: string; data?: Record<string, unknown> }) {
  if (!VAPID_PUBLIC || !VAPID_PRIVATE || webSubscriptions.length === 0) return;
  const expired: number[] = [];
  await Promise.allSettled(
    webSubscriptions.map(async (sub, idx) => {
      try {
        await webPush.sendNotification(sub, JSON.stringify(payload), { urgency: "high", TTL: 86400 });
      } catch (err: any) {
        if (err.statusCode === 404 || err.statusCode === 410) expired.push(idx);
      }
    })
  );
  if (expired.length > 0) {
    webSubscriptions = webSubscriptions.filter((_, i) => !expired.includes(i));
    saveWebSubs();
  }
}

// ── Broadcast to all channels ─────────────────────────────────────────────────
export async function broadcastNotification(payload: { title: string; body: string; data?: Record<string, unknown> }) {
  await Promise.all([
    // Expo (mobile) push
    pushTokens.length > 0
      ? sendExpoNotifications(
          pushTokens.map((token) => ({
            to: token,
            title: payload.title,
            body: payload.body,
            sound: "default",
            channelId: "dahinchu-agni",
            priority: "high",
            data: payload.data ?? {},
          }))
        )
      : Promise.resolve(),
    // Web (browser) push
    sendWebPushNotifications(payload),
  ]);
}

// ── RSS helper ────────────────────────────────────────────────────────────────
async function fetchLatestVideoFromRss(): Promise<{ id: string; title: string } | null> {
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
  } catch { return null; }
}

// ── Background poller ─────────────────────────────────────────────────────────
let pollerStarted = false;

export function startNotificationPoller() {
  if (pollerStarted) return;
  pollerStarted = true;

  async function poll() {
    try {
      const { isLive, title } = await detectLive(CHANNEL_ID);
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

    try {
      const latest = await fetchLatestVideoFromRss();
      if (latest) {
        if (notifState.lastVideoId !== undefined && latest.id !== notifState.lastVideoId) {
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

  async function seedBaseline() {
    try {
      const latest = await fetchLatestVideoFromRss();
      if (latest && notifState.lastVideoId === undefined) { notifState.lastVideoId = latest.id; saveNotifState(); }
    } catch {}
    try {
      const { isLive } = await detectLive(CHANNEL_ID);
      if (notifState.wasLive === undefined) { notifState.wasLive = isLive; saveNotifState(); }
    } catch {}
  }

  setTimeout(async () => {
    await seedBaseline();
    setInterval(poll, 3 * 60 * 1000);
  }, 5000);
}

// ── Routes ────────────────────────────────────────────────────────────────────

// Register Expo push token (mobile app)
router.post("/notifications/register", (req: ExpressRequest, res: ExpressResponse) => {
  const { token, platform } = req.body as { token?: string; platform?: string };
  if (!token || typeof token !== "string") { res.status(400).json({ error: "token required" }); return; }
  if (!pushTokens.includes(token)) { pushTokens.push(token); saveTokens(); }
  req.log.info({ platform, total: pushTokens.length }, "expo push token registered");
  res.json({ ok: true });
});

// Register browser Web Push subscription
router.post("/notifications/subscribe-web", (req: ExpressRequest, res: ExpressResponse) => {
  const sub = req.body as WebSub;
  if (!sub?.endpoint) { res.status(400).json({ error: "valid push subscription required" }); return; }
  const exists = webSubscriptions.some((s) => s.endpoint === sub.endpoint);
  if (!exists) { webSubscriptions.push(sub); saveWebSubs(); }
  req.log.info({ total: webSubscriptions.length }, "web push subscription registered");
  res.json({ ok: true });
});

// Unsubscribe browser Web Push
router.post("/notifications/unsubscribe-web", (req: ExpressRequest, res: ExpressResponse) => {
  const { endpoint } = req.body as { endpoint?: string };
  if (!endpoint) { res.status(400).json({ error: "endpoint required" }); return; }
  webSubscriptions = webSubscriptions.filter((s) => s.endpoint !== endpoint);
  saveWebSubs();
  res.json({ ok: true });
});

// Get subscriber count (public)
router.get("/notifications/stats", (_req: ExpressRequest, res: ExpressResponse) => {
  res.json({ subscribers: pushTokens.length, webSubscribers: webSubscriptions.length });
});

// VAPID public key (needed by browser to subscribe)
router.get("/notifications/vapid-public-key", (_req: ExpressRequest, res: ExpressResponse) => {
  res.json({ key: VAPID_PUBLIC });
});

// Admin: send a custom broadcast
router.post("/notifications/send", async (req: ExpressRequest, res: ExpressResponse) => {
  const { passcode, title, body, type } = req.body as { passcode?: string; title?: string; body?: string; type?: string };
  if (passcode !== ADMIN_PASSCODE) { res.status(401).json({ error: "Unauthorized" }); return; }
  if (!title || !body) { res.status(400).json({ error: "title and body required" }); return; }
  await broadcastNotification({ title, body, data: { type: type ?? "announcement" } });
  req.log.info({ title, expoRecipients: pushTokens.length, webRecipients: webSubscriptions.length }, "manual notification sent");
  res.json({ ok: true, sent: pushTokens.length + webSubscriptions.length });
});

// Admin: send a "going live" notification
router.post("/notifications/send-live", async (req: ExpressRequest, res: ExpressResponse) => {
  const { passcode, streamTitle } = req.body as { passcode?: string; streamTitle?: string };
  if (passcode !== ADMIN_PASSCODE) { res.status(401).json({ error: "Unauthorized" }); return; }
  await broadcastNotification({
    title: "🔴 Dahinchu Agni is LIVE NOW!",
    body: streamTitle ?? "Join the live stream — tap to watch!",
    data: { type: "live" },
  });
  res.json({ ok: true, sent: pushTokens.length + webSubscriptions.length });
});

export default router;
