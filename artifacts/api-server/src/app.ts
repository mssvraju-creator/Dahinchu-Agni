import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { existsSync } from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// In standalone production mode, serve the built website from this same server.
// On Replit, the platform serves the static files directly via the artifact.toml config.
if (process.env.NODE_ENV === "production" && !process.env.REPL_ID) {
  // Root of the monorepo is two levels up from dist/ (api-server/dist → api-server → artifacts → root)
  const staticDir = path.resolve(
    import.meta.dirname,
    "..",
    "..",
    "..",
    "artifacts",
    "website",
    "dist",
    "public",
  );

  if (existsSync(staticDir)) {
    app.use(express.static(staticDir));
    // SPA fallback — send index.html for any unmatched route
    app.get("*", (_req, res) => {
      res.sendFile(path.join(staticDir, "index.html"));
    });
    logger.info({ staticDir }, "Serving website static files");
  } else {
    logger.warn(
      { staticDir },
      "Static website dir not found — run `pnpm --filter @workspace/website run build` first",
    );
  }
}

export default app;
