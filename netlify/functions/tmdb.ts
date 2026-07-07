import { Handler } from '@netlify/functions';

export const handler: Handler = async (event, context) => {
  try {
    let endpoint = event.queryStringParameters?.endpoint || '/';
    // let endpoint
    
    // if (!endpoint) endpoint = '/';

    if (!endpoint.startsWith('/') || endpoint.includes('..')) {
      return { statusCode: 400, body: JSON.stringify({ error: "Invalid endpoint" }) };
    }

    const allowedPrefixes = ['/movie', '/tv', '/trending', '/search', '/discover', '/genre'];
    if (!allowedPrefixes.some(prefix => endpoint.startsWith(prefix))) {
      return { statusCode: 400, body: JSON.stringify({ error: "Endpoint not allowed" }) };
    }

    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "Server misconfiguration: TMDB_API_KEY missing" }) };
    }

    // Convert the query object to a query string
    const queryParamsObj = { ...(event.queryStringParameters || {}) };
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

    return {
      statusCode: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    };
  } catch (error: any) {
    console.error("TMDB Proxy Error:", error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
