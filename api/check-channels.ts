import type { VercelRequest, VercelResponse } from '@vercel/node';
import dns from 'dns/promises';

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { urls } = req.body;
    
    if (!Array.isArray(urls)) {
      return res.status(400).json({ error: "urls must be an array" });
    }
    
    if (urls.length > 200) {
      return res.status(400).json({ error: "too many urls (max 200)" });
    }

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
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          
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

    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
