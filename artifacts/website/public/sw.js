// Dahinchu Agni Ministries — Push Notification Service Worker

const CACHE_NAME = "da-sw-v1";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Handle incoming push messages
self.addEventListener("push", (event) => {
  let payload = { title: "Dahinchu Agni", body: "New update from Dahinchu Agni Ministries", data: {} };
  try {
    if (event.data) payload = { ...payload, ...event.data.json() };
  } catch {}

  const options = {
    body: payload.body,
    icon: "/da-logo.png",
    badge: "/favicon.svg",
    vibrate: [100, 50, 100],
    data: payload.data ?? {},
    requireInteraction: false,
    tag: payload.data?.type ?? "general",
    renotify: true,
    actions: [
      { action: "open", title: "Open" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const type = event.notification.data?.type;
  let path = "/";
  if (type === "live" || type === "video") path = "/media";
  else if (type === "event") path = "/events";
  else if (type === "resource") path = "/resources";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin)) {
          client.focus();
          client.navigate(path);
          return;
        }
      }
      return clients.openWindow(path);
    })
  );
});
