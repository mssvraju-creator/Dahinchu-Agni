const { getDefaultConfig } = require("expo/metro-config");
const http = require("http");

const config = getDefaultConfig(__dirname);

const API_TARGET = process.env.METRO_API_TARGET || "http://localhost:8080";

config.server = config.server || {};
config.server.enhanceMiddleware = (metroMiddleware) => {
  return (req, res, next) => {
    if (req.url?.startsWith("/api/")) {
      const apiUrl = new URL(req.url, API_TARGET);
      const options = {
        hostname: apiUrl.hostname,
        port: apiUrl.port,
        path: apiUrl.pathname + apiUrl.search,
        method: req.method,
        headers: { ...req.headers },
      };
      delete options.headers.host;
      const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });
      proxyReq.on("error", () => {
        res.writeHead(502);
        res.end("Proxy error");
      });
      req.pipe(proxyReq);
      return;
    }
    return metroMiddleware(req, res, next);
  };
};

module.exports = config;
