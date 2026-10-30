import type { VercelRequest, VercelResponse } from '@vercel/node';
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

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const expected = process.env.PROTECTED_SECTION_CODE;
  const url = process.env.PROTECTED_SECTION_URL;
  if (!expected || !url) return res.status(503).json({ error: 'unavailable' });

  const forwarded = req.headers['x-forwarded-for'];
  const ip = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim() || 'unknown';
  if (tooManyAttempts(ip)) return res.status(429).json({ error: 'rate_limited' });

  const supplied = typeof req.body?.code === 'string' ? req.body.code : '';
  if (!supplied || !sameCode(supplied, expected)) return res.status(401).json({ error: 'invalid' });

  return res.status(200).json({ url });
}
