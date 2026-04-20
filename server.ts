import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Add a proxy for YouTube API
  app.get("/api/youtube/playlists", async (req, res) => {
    try {
      const { id, key } = req.query;
      const response = await fetch(`https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${id}&key=${key}`);
      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: { message: e.message } });
    }
  });

  app.get("/api/youtube/playlistItems", async (req, res) => {
    try {
      const { playlistId, key, pageToken } = req.query;
      let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${key}`;
      if (pageToken) url += `&pageToken=${pageToken}`;
      const response = await fetch(url);
      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: { message: e.message } });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Note: derived path for ES Modules
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
