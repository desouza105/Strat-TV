import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const targetUrl = event.queryStringParameters?.url;
  
  if (!targetUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing url parameter" }),
    };
  }

  try {
    const response = await fetch(targetUrl);
    
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Failed to fetch from target: ${response.statusText}` }),
      };
    }

    const data = await response.text();
    const contentType = response.headers.get("content-type") || "text/plain";

    return {
      statusCode: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*", // Helpful for CORS
      },
      body: data,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || "Internal server error" }),
    };
  }
};
