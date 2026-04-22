import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const targetUrl = req.query.url as string;
  
  if (!targetUrl) {
    return res.status(400).json({ error: "Missing url parameter" });
  }

  try {
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch from target: ${response.statusText}` });
    }

    const data = await response.text();
    const contentType = response.headers.get("content-type") || "text/plain";

    res.setHeader("Content-Type", contentType);
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(200).send(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
