export default async function handler(req: any, res: any) {
  try {
    let endpoint = req.query.endpoint as string;
    
    if (!endpoint) endpoint = '/';

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
}
