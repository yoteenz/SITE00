/**
 * CORS for JURNL user-facing API (browser + Railway API).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const JURNL_STATIC_ORIGINS = [
  'https://site00.com',
  'https://www.site00.com',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
] as const;

export function resolveJurnlCorsOrigins(): string[] {
  const extra = (process.env.JURNL_CORS_ORIGINS ?? process.env.SITE00_CAPTURE_CORS_ORIGINS ?? '')
    .split(',')
    .map((v) => v.trim().replace(/\/$/, ''))
    .filter(Boolean);
  return [...JURNL_STATIC_ORIGINS, ...extra];
}

export function isJurnlCorsOriginAllowed(origin: string): boolean {
  const normalized = origin.replace(/\/$/, '');
  if (resolveJurnlCorsOrigins().includes(normalized)) return true;
  try {
    const host = new URL(normalized).hostname.toLowerCase();
    if (host.endsWith('.trycloudflare.com')) return true;
    if (host.endsWith('.site00.com')) return true;
  } catch {
    return false;
  }
  return false;
}

/** User entitlements API — allow listed origins (needed for SPA + API split). */
export function applyJurnlUserApiCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : null;
  if (origin && isJurnlCorsOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return true;
  }
  if (!origin) return true;
  return false;
}

/** Admin grant API — same-origin only; reject unknown browser origins. */
export function applyJurnlAdminApiCors(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : null;
  if (!origin) return true;
  if (isJurnlCorsOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return true;
  }
  return false;
}

export function handleJurnlCorsPreflight(
  req: VercelRequest,
  res: VercelResponse,
  mode: 'user' | 'admin',
): boolean {
  const ok = mode === 'admin' ? applyJurnlAdminApiCors(req, res) : applyJurnlUserApiCors(req, res);
  if (req.method === 'OPTIONS') {
    if (!ok && mode === 'admin') {
      res.status(403).json({ error: 'Origin not allowed', code: 'CORS_FORBIDDEN' });
      return true;
    }
    res.setHeader('Access-Control-Allow-Methods', mode === 'admin' ? 'POST, OPTIONS' : 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.status(204).end();
    return true;
  }
  if (mode === 'admin' && !ok) {
    res.status(403).json({ error: 'Origin not allowed', code: 'CORS_FORBIDDEN' });
    return true;
  }
  return false;
}
