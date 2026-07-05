# Dahinchu Agni Ministries

Full digital presence for Dahinchu Agni Ministries — a React+Vite mobile-style web app and Express API for streaming content, events, giving, and prayer.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/website run dev` — run the website (port 5173)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)

## Standalone Setup (outside Replit)

Run the app on any machine without needing Replit:

```bash
# 1. Install dependencies
pnpm install

# 2. Start the API server (terminal 1)
pnpm --filter @workspace/api-server run dev
# → listens on http://localhost:8080/api

# 3. Start the website (terminal 2)
pnpm --filter @workspace/website run dev
# → listens on http://localhost:5173
# → /api calls are automatically proxied to localhost:8080

# Optional env vars (all have defaults):
# PORT=5173           website dev port
# BASE_PATH=/         website base URL path
# PORT=8080           API server port (set in api-server terminal)
```

### Standalone Production Build

```bash
# Build everything
VITE_VAPID_PUBLIC_KEY=<your_key> pnpm --filter @workspace/website run build  # → artifacts/website/dist/public/
pnpm --filter @workspace/api-server run build                                 # → artifacts/api-server/dist/

# Serve from one process (API server also serves the website)
VAPID_PUBLIC_KEY=<your_key> VAPID_PRIVATE_KEY=<your_private_key> \
  VAPID_SUBJECT=mailto:you@example.com NODE_ENV=production \
  node artifacts/api-server/dist/index.mjs
# → http://localhost:8080 serves both /api and the website (SPA)
```

> On Replit, the platform handles the reverse proxy and static file serving automatically — no extra config needed.

### Push Notification Setup (Standalone)

```bash
# 1. Generate a VAPID key pair once for your deployment:
node -e "const wp=require('./artifacts/api-server/node_modules/web-push'); \
  const k=wp.generateVAPIDKeys(); \
  console.log('PUBLIC='+k.publicKey+'\nPRIVATE='+k.privateKey)"

# 2. Set these environment variables (add to .env or your hosting platform):
#    VAPID_PUBLIC_KEY    = <publicKey>     (server)
#    VAPID_PRIVATE_KEY   = <privateKey>    (server — keep secret)
#    VAPID_SUBJECT       = mailto:you@example.com
#    VITE_VAPID_PUBLIC_KEY = <publicKey>   (website build — same as PUBLIC)
#    EXPO_PUBLIC_API_URL = https://your-api.com  (mobile native builds)

# 3. Rebuild the website so the new public key is baked in:
VITE_VAPID_PUBLIC_KEY=<publicKey> pnpm --filter @workspace/website run build
```

See `.env.example` at the repo root for a ready-to-copy template.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Website: React 18 + Vite, Tailwind CSS v4, Shadcn UI, Wouter, TanStack Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM (optional — not required for YouTube/live features)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/website/src/pages/` — all app pages (home, media, give, prayer, events, about, more, contact, admin)
- `artifacts/website/src/constants/ministry.ts` — ministry data (stats, social links, YouTube channel ID)
- `artifacts/api-server/src/routes/youtube.ts` — live stream detection, video feed proxy
- `artifacts/api-server/src/app.ts` — Express app, CORS, static serving in standalone production
- `artifacts/website/vite.config.ts` — Vite config with `/api` proxy for standalone dev
- `lib/api-spec/` — OpenAPI spec (source of truth for API contracts)
- `lib/api-client-react/` — generated TanStack Query hooks

## Architecture decisions

- **YouTube channel ID** (`UChxz3kSq1sw0pLD3Pg-Vj7w`) is hardcoded in the website constants — only the Dahinchu Agni channel is ever queried.
- **Live detection** uses three strategies in order: Piped (`duration === -1`), Invidious (`liveNow`), YouTube page scrape (redirect URL → videoId, then `" watching now"` for confirmation). The video list is also used as a fallback live signal on the media page.
- **Reverse proxy**: In Replit, the shared proxy routes `/` → website, `/api` → API server. Standalone dev uses Vite's `server.proxy` to forward `/api` to localhost:8080.
- **Static serving**: In Replit production, the platform serves `artifacts/website/dist/public` directly. Outside Replit, the API server (`NODE_ENV=production` + no `REPL_ID`) picks up the same directory and serves it with an SPA fallback.
- **Dark mode**: CSS variables only. Never use `text-white`/`bg-black`/`border-white/10` globally — use semantic tokens (`text-foreground`, `border-border`, etc.). `text-white` is only allowed inside elements with an explicit dark background (like `bg-red-600`, `bg-secondary` which is navy).

## Product

- **Home** — live banner, verse of the day, stats, quick-action buttons, latest videos, upcoming events
- **Media** — live hero (full 16:9 thumbnail when live), video categories (All / Sermons / Worship / Teaching / Lives / Shorts)
- **Give** — online giving with bank details and UPI
- **Prayer** — prayer request submission
- **Events** — church calendar with admin management
- **About / More / Contact** — ministry info pages
- **Admin** — passcode-protected settings panel

## User preferences

- Brand: primary orange `#E84C1E` / `#F97316`, secondary navy `#0B2A7A`
- Tagline: "Consuming Fire — Igniting Nations"
- YouTube channel handle: `@Dahinchuagni`
- Admin passcode: stored in AdminContext (not in env)
- Mobile-first layout (max-width ~430 px, centered on desktop)

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing the OpenAPI spec.
- The Vite config is an **async** `defineConfig` call (needed for dynamic Replit plugin imports) — don't convert it to sync.
- `@replit/vite-plugin-*` packages are optional. They are guarded by `REPL_ID` env var and are skipped entirely outside Replit.
- Never run `pnpm dev` at workspace root — individual artifact workflows inject `PORT` and `BASE_PATH`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
