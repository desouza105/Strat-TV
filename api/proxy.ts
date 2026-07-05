import type { VercelRequest, VercelResponse } from '@vercel/node';
import dns from 'dns/promises';

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
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch from target: ${response.statusText}`);
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const targetUrl = req.query.url as string;
  
  if (!targetUrl) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    const requestOrigin = req.headers.origin;
    const result = await safeFetchPlaylist(targetUrl, requestOrigin);

    res.setHeader("Content-Type", result.contentType);
    res.setHeader("Access-Control-Allow-Origin", result.allowedOrigin);
    res.status(200).send(result.data);
  } catch (error: any) {
    if (error.message === 'URL non autorisée') {
      return res.status(400).json({ error: "URL non autorisée" });
    }
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
