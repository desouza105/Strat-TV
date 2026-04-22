import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { urls } = req.body;
    
    if (!Array.isArray(urls)) {
      return res.status(400).json({ error: "urls must be an array" });
    }

    const batchSize = 10;
    const results: Record<string, boolean> = {};

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);
      await Promise.all(batch.map(async (url) => {
        try {
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
