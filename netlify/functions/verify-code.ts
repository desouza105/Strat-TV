import { Handler } from '@netlify/functions';
import crypto from 'crypto';

// Vérifie le code de la section protégée côté serveur : le code et l'URL ne sont jamais envoyés au navigateur.
// Variables d'environnement : PROTECTED_SECTION_CODE et PROTECTED_SECTION_URL.

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

function sameCode(a: string, b: string): boolean {
  const ha = crypto.createHash('sha256').update(a).digest();
  const hb = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function tooManyAttempts(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

const json = (statusCode: number, body: unknown) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'method_not_allowed' });

  const expected = process.env.PROTECTED_SECTION_CODE;
  const url = process.env.PROTECTED_SECTION_URL;
  if (!expected || !url) return json(503, { error: 'unavailable' });

  const ip = (event.headers['x-nf-client-connection-ip'] || event.headers['x-forwarded-for'] || 'unknown').split(',')[0].trim();
  if (tooManyAttempts(ip)) return json(429, { error: 'rate_limited' });

  let supplied = '';
  try {
    const parsed = JSON.parse(event.body || '{}');
    if (typeof parsed.code === 'string') supplied = parsed.code;
  } catch {
    return json(400, { error: 'bad_request' });
  }
  if (!supplied || !sameCode(supplied, expected)) return json(401, { error: 'invalid' });

  return json(200, { url });
};
