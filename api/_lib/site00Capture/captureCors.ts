/**
 * P0.VR.8R3R3 — CORS for capture / page-mirror API (Railway → cPanel frontend).
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const CAPTURE_CORS_STATIC_ORIGINS = [
  'https://site00.com',
  'https://www.site00.com',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
] as const;

export function resolveCaptureCorsAllowedOrigins(): string[] {
  const extra = (process.env.SITE00_CAPTURE_CORS_ORIGINS ?? '')
    .split(',')
    .map((value) => value.trim().replace(/\/$/, ''))
    .filter(Boolean);
  return [...CAPTURE_CORS_STATIC_ORIGINS, ...extra];
}

export function applyCaptureCorsHeaders(req: VercelRequest, res: VercelResponse): boolean {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : null;
  const allowed = resolveCaptureCorsAllowedOrigins();
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    return true;
  }
  if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    return true;
  }
  return false;
}

export function handleCaptureCorsPreflight(req: VercelRequest, res: VercelResponse): boolean {
  applyCaptureCorsHeaders(req, res);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
