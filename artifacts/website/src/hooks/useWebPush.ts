import { useState, useEffect, useCallback } from "react";

// Public VAPID key — safe to include in client code (not secret)
const VAPID_PUBLIC_KEY = "BHZyeOdVhv-Zxegln3snXlljH9eSanMDI_9QthL0Yi-P1KFGX1pmmf2-aFAuIkbeYsUuH6O1lsJX494Hm3NPpng";

type PushState = "unsupported" | "denied" | "unsubscribed" | "subscribed" | "loading";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

async function getSubscription(): Promise<PushSubscription | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return null;
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  if (!reg) return null;
  return reg.pushManager.getSubscription().catch(() => null);
}

async function subscribeUser(): Promise<PushSubscription | null> {
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  if (!reg) return null;
  try {
    return await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });
  } catch {
    return null;
  }
}

async function saveSubscription(sub: PushSubscription): Promise<boolean> {
  try {
    const res = await fetch("/api/notifications/subscribe-web", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
      signal: AbortSignal.timeout(8000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function useWebPush() {
  const [state, setState] = useState<PushState>("loading");

  const supported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  useEffect(() => {
    if (!supported) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    getSubscription().then((sub) => {
      setState(sub ? "subscribed" : "unsubscribed");
    });
  }, [supported]);

  const subscribe = useCallback(async () => {
    if (!supported) return false;
    setState("loading");

    // Register service worker if not already
    if (!("serviceWorker" in navigator)) { setState("unsupported"); return false; }
    const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => null);
    if (!reg) { setState("unsupported"); return false; }
    await navigator.serviceWorker.ready.catch(() => null);

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setState(permission === "denied" ? "denied" : "unsubscribed");
      return false;
    }

    const sub = await subscribeUser();
    if (!sub) { setState("unsubscribed"); return false; }

    await saveSubscription(sub);
    setState("subscribed");
    return true;
  }, [supported]);

  const unsubscribe = useCallback(async () => {
    const sub = await getSubscription();
    if (sub) await sub.unsubscribe().catch(() => null);
    setState("unsubscribed");
  }, []);

  return { state, subscribe, unsubscribe, supported };
}

// Register the service worker on app boot (call once from main.tsx)
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch {}
}
