import { Handler } from '@netlify/functions';
import dns from 'dns/promises';

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

export const handler: Handler = async (event) => {
  const targetUrl = event.queryStringParameters?.url;
  
  if (!targetUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing url parameter" }),
    };
  }

  try {
    const requestOrigin = event.headers.origin;
    const result = await safeFetchStream(targetUrl, requestOrigin);

    if (result.isText) {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": result.contentType,
          "Access-Control-Allow-Origin": result.allowedOrigin,
        },
        body: result.data as string,
      };
    } else {
      return {
        statusCode: 200,
        headers: {
          "Content-Type": result.contentType,
          "Access-Control-Allow-Origin": result.allowedOrigin,
        },
        body: (result.data as Buffer).toString('base64'),
        isBase64Encoded: true,
      };
    }
  } catch (error: any) {
    if (error.message === 'URL non autorisée') {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "URL non autorisée" }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
