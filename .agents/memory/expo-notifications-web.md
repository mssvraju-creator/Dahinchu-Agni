---
name: expo-notifications web guards
description: APIs in expo-notifications that crash on web and the permission type cast workaround
---

## Rule
Always guard `expo-notifications` APIs with `Platform.OS !== 'web'` before calling:
- `setNotificationHandler` — safe to call on web but no-ops; move inside `if (Platform.OS !== 'web')` to avoid confusion
- `getLastNotificationResponseAsync` — crashes on web with "method not available"
- `addNotificationReceivedListener` / `addNotificationResponseReceivedListener` — web logs a warning and has no effect
- `getExpoPushTokenAsync` — only works on real native devices (not web, not simulator)
- `setNotificationChannelAsync` — Android only

**Why:** Expo's web implementation of expo-notifications is incomplete. Several methods throw `UnavailabilityError` on web.

## Permission type cast
`NotificationPermissionsStatus extends PermissionResponse` but TypeScript can't resolve `granted` or `status` because the `expo` package's PermissionResponse type doesn't resolve properly in the monorepo's tsconfig. Fix:

```typescript
type PermResult = { granted: boolean };
const existing = (await Notifications.getPermissionsAsync()) as unknown as PermResult;
const isGranted = existing.granted;
```

**Why:** The `expo` package re-exports PermissionResponse from expo-modules-core but the type path doesn't resolve in the monorepo setup, causing TS2339 on both `.granted` and `.status`.

## Token registration
- `getExpoPushTokenAsync` requires a real physical device + a valid EAS `projectId`
- In development without EAS: gracefully return `undefined` from the function, don't crash
- The app.json `extra.eas.projectId` placeholder `"replace-with-your-eas-project-id"` is detected and skipped

## Backend poller
- Token store: `push_tokens.json` in the API server's cwd
- Notification state: `notification_state.json` (tracks lastVideoId, wasLive)
- Seeded on startup (no notification sent for existing state), then polls every 3 min
- Admin endpoints: `POST /api/notifications/send`, `POST /api/notifications/send-live` (passcode: DAFIRE94)
- Stats endpoint: `GET /api/notifications/stats` (returns subscriber count, no auth required)
