---
name: Notification System Architecture
description: How push notifications work across the website (browser) and mobile app (Expo), and common pitfalls
---

# Notification System

## Channels
Two parallel channels are broadcast simultaneously from `broadcastNotification()` in `artifacts/api-server/src/routes/notifications.ts`:

1. **Expo Push** — for mobile app users; tokens stored in `push_tokens.json`
2. **Web Push (VAPID)** — for website visitors; subscriptions stored in `web_push_subscriptions.json`

## VAPID keys
Stored as shared env vars `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`. Public key is also hardcoded in `artifacts/website/src/hooks/useWebPush.ts` (safe — it's a public key by design).

## Service Worker
`artifacts/website/public/sw.js` handles `push` (shows notification) and `notificationclick` (navigates to correct page). Registered at app boot in `artifacts/website/src/main.tsx` via `registerServiceWorker()`.

## Mobile API URL
`artifacts/mobile/constants/api.ts` exports `API_URL`:
- Web (browser): `""` (relative URLs work fine)
- Native dev: derived from Expo's `hostUri` (Metro bundler host + port 80 → Replit proxy → API)
- Native prod: `EXPO_PUBLIC_API_URL` env var

**Why:** React Native `fetch` has no base URL concept — relative paths like `/api/...` only work in Expo Web (browser). All `fetch` calls in native must use absolute URLs.

## Mobile EAS Push Tokens
`getExpoPushTokenAsync` requires a real EAS `projectId`. Currently `app.json` has `"replace-with-your-eas-project-id"` as placeholder — Expo push won't work on native until the user creates an EAS project and updates this. The hook handles this gracefully (returns `undefined`).

## Subscriber counts
`/api/notifications/stats` returns `{ subscribers: number, webSubscribers: number }`. The generated TS types only know about `subscribers`; admin panel uses `as any` cast to access `webSubscribers`.
