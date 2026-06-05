import { Router } from "express";

const router = Router();

router.get("/youtube/feed", async (req, res) => {
  const channelId = (req.query.channelId as string) || "UChxz3kSq1sw0pLD3Pg-Vj7w";
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  try {
    const upstream = await fetch(rssUrl, {
      headers: { "Accept": "application/rss+xml, application/xml, text/xml, */*" },
    });
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: "Failed to fetch YouTube feed" });
      return;
    }
    const xml = await upstream.text();
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=300");
    res.send(xml);
  } catch (err: any) {
    res.status(500).json({ error: "Proxy error", message: err?.message });
  }
});

export default router;
