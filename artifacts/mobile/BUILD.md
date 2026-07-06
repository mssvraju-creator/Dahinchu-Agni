# Mobile Build Pipeline

## Development
```bash
pnpm --filter @workspace/mobile run dev
```
Starts Expo dev server on port 8081. The app connects to the API server at `http://<host>:8080`.

## Production Static Build
Builds static bundles for deployment:

```bash
# Local build (relative URLs - for testing)
pnpm --filter @workspace/mobile run build

# Production build (with deployment domain)
EXPO_PUBLIC_DOMAIN=your-domain.com pnpm --filter @workspace/mobile run build
```

Output goes to `static-build/`. Serve it with:
```bash
pnpm --filter @workspace/mobile run serve
```

## Environment Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `EXPO_PUBLIC_DOMAIN` | - | Production deployment domain (required for deployment build) |
| `EXPO_PUBLIC_METRO_PORT` | 8081 | Metro bundler port |
| `EXPO_PUBLIC_API_URL` | - | API server URL for native builds |
| `EXPO_PUBLIC_API_PORT` | 8080 | API server port (dev only) |
| `BASE_PATH` | / | URL path prefix |
| `PORT` | 3000 | Serve HTTP port |

## Output Structure
```
static-build/
├── <timestamp>-<pid>/    ← latest build
│   └── _expo/static/js/
│       ├── ios/bundle.js
│       └── android/bundle.js
├── ios/manifest.json
└── android/manifest.json
```
