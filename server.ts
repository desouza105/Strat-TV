/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Simple Proxy Endpoint to bypass CORS
  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    try {
      const response = await fetch(targetUrl);
      if (!response.ok) {
        return res.status(response.status).json({ error: `Failed to fetch from target: ${response.statusText}` });
      }

      const contentType = response.headers.get("content-type");
      if (contentType) {
        res.setHeader("Content-Type", contentType);
      }

      const data = await response.text();
      res.send(data);
    } catch (error: any) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Bulk Health Check Endpoint
  app.post("/api/check-channels", express.json(), async (req, res) => {
    const { urls } = req.body;
    if (!Array.isArray(urls)) {
      return res.status(400).json({ error: "urls must be an array" });
    }

    // Limit concurrency to avoid being blocked or overloading
    const batchSize = 10;
    const results: Record<string, boolean> = {};

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      await Promise.all(batch.map(async (url) => {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout
          
          const response = await fetch(url, { 
            method: 'HEAD',
            signal: controller.signal
          });
          clearTimeout(timeoutId);
          results[url] = response.ok;
        } catch (err) {
          results[url] = false;
        }
      }));
    }

    res.json(results);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
