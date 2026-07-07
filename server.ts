/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dns from 'dns/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function safeFetchPlaylist(targetUrl: string, requestOrigin: string | undefined) {
  let url: URL;
  try {
    url = new URL(targetUrl);
  } catch {
    throw new Error('URL non autorisée');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('URL non autorisée');
  }

  if (url.hostname === 'localhost') {
    throw new Error('URL non autorisée');
  }

  try {
    const lookup = await dns.lookup(url.hostname);
    const ip = lookup.address;
    
    if (
      ip.startsWith('127.') || 
      ip.startsWith('10.') || 
      ip.startsWith('192.168.') || 
      ip.startsWith('169.254.') ||
      ip === '::1' ||
      ip.toLowerCase().startsWith('fc00:') ||
      ip.toLowerCase().startsWith('fd')
    ) {
      throw new Error('URL non autorisée');
    }
    
    if (ip.startsWith('172.')) {
      const secondOctet = parseInt(ip.split('.')[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) {
        throw new Error('URL non autorisée');
      }
    }
  } catch {
    throw new Error('URL non autorisée');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      redirect: 'follow'
    });
    clearTimeout(timeoutId);

    if (response.url && response.url !== url.toString()) {
      console.error(`Stream proxy redirected: requested ${url.toString()} -> final ${response.url}`);
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch from target (${response.url || url.toString()}): ${response.statusText}`);
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    let size = 0;
    const chunks: Uint8Array[] = [];

    if (response.body && 'getReader' in response.body) {
      const reader = (response.body as any).getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          size += value.length;
          if (size > MAX_SIZE) {
            const remaining = MAX_SIZE - (size - value.length);
            if (remaining > 0) {
              chunks.push(value.slice(0, remaining));
            }
            await reader.cancel('Taille maximale dépassée');
            break;
          } else {
            chunks.push(value);
          }
        }
      }
    } else {
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > MAX_SIZE) {
        chunks.push(new Uint8Array(buffer.slice(0, MAX_SIZE)));
      } else {
        chunks.push(new Uint8Array(buffer));
      }
    }

    const totalLength = chunks.reduce((acc, val) => acc + val.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    
    const data = new TextDecoder().decode(combined);
    const contentType = response.headers.get("content-type") || "text/plain";
    
    const allowedOrigin = process.env.ALLOWED_ORIGIN || (requestOrigin ? requestOrigin : 'https://votre-site.com');

    return { data, contentType, allowedOrigin };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}


async function safeFetchStream(targetUrl: string, requestOrigin: string | undefined) {
  let url: URL;
  try {
    url = new URL(targetUrl);
  } catch {
    throw new Error('URL non autorisée');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('URL non autorisée');
  }

  if (url.hostname === 'localhost') {
    throw new Error('URL non autorisée');
  }

  try {
    const lookup = await dns.lookup(url.hostname);
    const ip = lookup.address;
    
    if (
      ip.startsWith('127.') || 
      ip.startsWith('10.') || 
      ip.startsWith('192.168.') || 
      ip.startsWith('169.254.') ||
      ip === '::1' ||
      ip.toLowerCase().startsWith('fc00:') ||
      ip.toLowerCase().startsWith('fd')
    ) {
      throw new Error('URL non autorisée');
    }
    
    if (ip.startsWith('172.')) {
      const secondOctet = parseInt(ip.split('.')[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) {
        throw new Error('URL non autorisée');
      }
    }
  } catch {
    throw new Error('URL non autorisée');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`Failed to fetch from target: ${response.statusText}`);
    }

    const MAX_SIZE = 20 * 1024 * 1024; // 20 MB
    let size = 0;
    const chunks: Uint8Array[] = [];

    if (response.body && 'getReader' in response.body) {
      const reader = (response.body as any).getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          size += value.length;
          if (size > MAX_SIZE) {
            const remaining = MAX_SIZE - (size - value.length);
            if (remaining > 0) {
              chunks.push(value.slice(0, remaining));
            }
            await reader.cancel('Taille maximale dépassée');
            break;
          } else {
            chunks.push(value);
          }
        }
      }
    } else {
      const buffer = await response.arrayBuffer();
      if (buffer.byteLength > MAX_SIZE) {
        chunks.push(new Uint8Array(buffer.slice(0, MAX_SIZE)));
      } else {
        chunks.push(new Uint8Array(buffer));
      }
    }

    const totalLength = chunks.reduce((acc, val) => acc + val.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    const contentType = response.headers.get("content-type") || "";
    const isPlaylistByUrlOrType = contentType.includes("mpegurl") || contentType.includes("vnd.apple.mpegurl") || url.pathname.endsWith(".m3u8");
    const first20 = new TextDecoder().decode(combined.slice(0, 20));
    const isPlaylist = isPlaylistByUrlOrType || first20.includes("#EXTM3U");

    const allowedOrigin = process.env.ALLOWED_ORIGIN || (requestOrigin ? requestOrigin : '*');

    if (isPlaylist) {
      let text = new TextDecoder().decode(combined);
      const lines = text.split('\n');
      const rewrittenLines = lines.map(line => {
        let trimmedLine = line.trim();
        if (trimmedLine.startsWith('#EXT-X-KEY') || trimmedLine.startsWith('#EXT-X-MAP')) {
          return trimmedLine.replace(/URI="([^"]+)"/, (match, uriValue) => {
            try {
              const absoluteUrl = new URL(uriValue, response.url || targetUrl).toString();
              return `URI="/api/stream-proxy?url=${encodeURIComponent(absoluteUrl)}"`;
            } catch {
              return match;
            }
          });
        } else if (trimmedLine.length > 0 && !trimmedLine.startsWith('#')) {
          try {
            const absoluteUrl = new URL(trimmedLine, response.url || targetUrl).toString();
            return `/api/stream-proxy?url=${encodeURIComponent(absoluteUrl)}`;
          } catch {
            return trimmedLine;
          }
        }
        return trimmedLine;
      });
      
      return { 
        data: rewrittenLines.join('\n'), 
        contentType: "application/vnd.apple.mpegurl", 
        allowedOrigin,
        isText: true
      };
    } else {
      return {
        data: Buffer.from(combined),
        contentType: contentType || "video/mp2t",
        allowedOrigin,
        isText: false
      };
    }
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function validateUrl(targetUrl: string): Promise<boolean> {
  let url: URL;
  try {
    url = new URL(targetUrl);
  } catch {
    return false;
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return false;
  }

  if (url.hostname === 'localhost') {
    return false;
  }

  try {
    const lookup = await dns.lookup(url.hostname);
    const ip = lookup.address;
    
    if (
      ip.startsWith('127.') || 
      ip.startsWith('10.') || 
      ip.startsWith('192.168.') || 
      ip.startsWith('169.254.') ||
      ip === '::1' ||
      ip.toLowerCase().startsWith('fc00:') ||
      ip.toLowerCase().startsWith('fd')
    ) {
      return false;
    }
    
    if (ip.startsWith('172.')) {
      const secondOctet = parseInt(ip.split('.')[1], 10);
      if (secondOctet >= 16 && secondOctet <= 31) {
        return false;
      }
    }
  } catch {
    return false;
  }

  return true;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // TMDB API Proxy
  app.get("/api/tmdb", async (req, res) => {
    try {
      const endpoint = (req.query.endpoint as string) || '/';
      
      if (!endpoint.startsWith('/') || endpoint.includes('..')) {
        return res.status(400).json({ error: "Invalid endpoint" });
      }

      const allowedPrefixes = ['/movie', '/tv', '/trending', '/search', '/discover', '/genre'];
      if (!allowedPrefixes.some(prefix => endpoint.startsWith(prefix))) {
        return res.status(400).json({ error: "Endpoint not allowed" });
      }

      const apiKey = process.env.TMDB_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Server misconfiguration: TMDB_API_KEY missing" });
      }

      // Convert the query object to a query string
      const queryParamsObj = { ...req.query };
      delete queryParamsObj.endpoint;
      const queryParams = new URLSearchParams(queryParamsObj as Record<string, string>).toString();
      let tmdbUrl = `https://api.themoviedb.org/3${endpoint}${queryParams ? `?${queryParams}` : ''}`;

      const headers: HeadersInit = {
        'Accept': 'application/json',
      };

      if (apiKey.length > 50) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else {
        const urlObj = new URL(tmdbUrl);
        urlObj.searchParams.append('api_key', apiKey);
        tmdbUrl = urlObj.toString();
      }

      const response = await fetch(tmdbUrl, { headers });
      const data = await response.json();

      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Content-Type", "application/json");
      res.status(response.status).json(data);
    } catch (error: any) {
      console.error("TMDB Proxy Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Simple Proxy Endpoint to bypass CORS
  app.get("/api/proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    try {
      const result = await safeFetchPlaylist(targetUrl, req.get('origin'));
      
      if (result.contentType) {
        res.setHeader("Content-Type", result.contentType);
      }
      res.setHeader("Access-Control-Allow-Origin", result.allowedOrigin);
      
      res.send(result.data);
    } catch (error: any) {
      if (error.message === 'URL non autorisée') {
        return res.status(400).json({ error: "URL non autorisée" });
      }
      console.error("Proxy error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  
  // Stream Proxy Endpoint to bypass CORS for HLS media
  app.get("/api/stream-proxy", async (req, res) => {
    const targetUrl = req.query.url as string;
    
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing url parameter" });
    }

    try {
      const result = await safeFetchStream(targetUrl, req.get('origin'));
      
      if (result.contentType) {
        res.setHeader("Content-Type", result.contentType);
      }
      res.setHeader("Access-Control-Allow-Origin", result.allowedOrigin);
      
      res.send(result.data);
    } catch (error: any) {
      if (error.message === 'URL non autorisée') {
        return res.status(400).json({ error: "URL non autorisée" });
      }
      console.error("Stream Proxy error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Bulk Health Check Endpoint
  app.post("/api/check-channels", express.json(), async (req, res) => {
    const { urls } = req.body;
    if (!Array.isArray(urls)) {
      return res.status(400).json({ error: "urls must be an array" });
    }
    
    if (urls.length > 200) {
      return res.status(400).json({ error: "too many urls (max 200)" });
    }

    // Limit concurrency to avoid being blocked or overloading
    const batchSize = 10;
    const results: Record<string, boolean> = {};

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      await Promise.all(batch.map(async (url) => {
        try {
          const isValid = await validateUrl(url);
          if (!isValid) {
            results[url] = false;
            return;
          }

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
