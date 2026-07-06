# Dahinchu Agni Ministries

Full digital presence for Dahinchu Agni Ministries — an Expo/React Native mobile app with an Express API backend for streaming content, events, giving, and prayer.

## Project Structure

```
├── artifacts/
│   ├── api-server/          Express 5 API server (backend)
│   └── mobile/              Expo/React Native mobile app (Android + iOS)
├── lib/
│   ├── api-zod/             Shared Zod validation schemas
│   ├── db/                  Drizzle ORM database schema
│   ├── api-spec/            OpenAPI specification
│   └── api-client-react/    Generated API client hooks
├── scripts/                 Workspace scripts
└── .env.example             Environment variable template
```

## Run & Operate

```bash
# Install dependencies
pnpm install

# Start the API server (terminal 1)
pnpm --filter @workspace/api-server run dev
# → listens on http://localhost:8080/api

# Start the mobile app (terminal 2)
pnpm --filter @workspace/mobile run dev
# → Expo dev server on port 8081
```

## Production Build

```bash
# Build the API server
pnpm --filter @workspace/api-server run build
# → artifacts/api-server/dist/index.mjs

# Build the mobile app (static Expo Go deployment)
pnpm --filter @workspace/mobile run build
# → artifacts/mobile/static-build/
```

## Mobile API URL Configuration

The mobile app connects to the backend API using the following priority:

1. **`EXPO_PUBLIC_API_URL`** env var — set this for production native builds
2. **Expo debugger host** + `EXPO_PUBLIC_API_PORT` (default: 8080) — local dev
3. **Empty string** — relative URLs (Expo Web)

## Required Environment Variables

See `.env.example` at the repo root for a ready-to-copy template.

### API Server
- `PORT` — server port (default: 8080)
- `VAPID_PUBLIC_KEY` — Web Push public key
- `VAPID_PRIVATE_KEY` — Web Push private key
- `VAPID_SUBJECT` — Web Push subject (mailto: or https:)

### Mobile App
- `EXPO_PUBLIC_API_URL` — deployed API server URL (for production builds)
- `EXPO_PUBLIC_DOMAIN` — deployment domain (for static build serving)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Mobile: Expo SDK 54, React Native 0.81, expo-router
- API: Express 5, Drizzle ORM, PostgreSQL
- Validation: Zod
- Push Notifications: web-push + Expo Notifications

## Where Things Live

- `artifacts/api-server/src/routes/` — all API route handlers
- `artifacts/mobile/app/` — all mobile app screens (Expo Router file-based routing)
- `artifacts/mobile/constants/` — ministry data, colors, API config
- `artifacts/mobile/hooks/` — custom React hooks
- `lib/api-spec/` — OpenAPI spec (source of truth for API contracts)

## Architecture Decisions

- **YouTube channel ID** (`UChxz3kSq1sw0pLD3Pg-Vj7w`) is hardcoded in mobile constants
- **Live detection** uses three strategies in order: Piped, Invidious, YouTube page scrape
- **Dark mode**: CSS variables only. Semantic tokens (`text-foreground`, `border-border`, etc.)
- **Mobile-first layout** (max-width ~430px, centered on desktop for web preview)

## Push Notifications

```bash
# Generate a VAPID key pair once for your deployment:
node -e "const wp=require('./artifacts/api-server/node_modules/web-push'); \
  const k=wp.generateVAPIDKeys(); \
  console.log('PUBLIC='+k.publicKey+'\nPRIVATE='+k.privateKey)"

# Set env vars for the API server:
#   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
# Set EXPO_PUBLIC_API_URL for the mobile app (production builds)
```

## User Preferences

- Brand: primary orange `#E84C1E` / `#F97316`, secondary navy `#0B2A7A`
- Tagline: "Consuming Fire — Igniting Nations"
- YouTube channel: `@Dahinchuagni`
- Admin passcode: stored in app context (not in env — hardcoded `DAFIRE94`)
