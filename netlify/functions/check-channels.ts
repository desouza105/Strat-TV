import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { urls } = JSON.parse(event.body || '{}');
    
    if (!Array.isArray(urls)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "urls must be an array" }),
      };
    }

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

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(results),
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
