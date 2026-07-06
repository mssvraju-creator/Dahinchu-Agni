import express, { type Request, type Response } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import { existsSync, readFileSync } from "fs";
import router from "./routes/index.js";
import { logger } from "./lib/logger.js";

type SpaResponse = Response & {
  type: (contentType: string) => SpaResponse;
  send: (body: string) => SpaResponse;
};

const app = express();

const pinoMiddleware = (pinoHttp as unknown as any)({
  logger,
  serializers: {
    req(req: any) {
      return {
        id: req.id,
        method: req.method,
        url: req.url?.split("?")[0],
      };
    },
    res(res: any) {
      return {
        statusCode: res.statusCode,
      };
    },
  },
});

app.use(pinoMiddleware);
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
    app.get("*", (_req: Request, res: SpaResponse) => {
      const indexPath = path.join(staticDir, "index.html");
      res.type("html");
      res.send(readFileSync(indexPath, "utf8"));
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
