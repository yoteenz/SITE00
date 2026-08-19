import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac } from 'crypto';
import { getAuthUser } from './_lib/auth.js';
import { useSecureSessionCookieAttribute } from './_lib/sessionCookieSecure.js';

const COOKIE_NAME = 'baw_session_rt';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type RefreshCookiePayload = {
  rt: string;
  uid: string;
  iat: number;
};

function base64UrlEncode(input: string): string {
  return Buffer.from(input, 'utf8').toString('base64url');
}

function signPayload(encodedPayload: string, secret: string): string {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function buildSignedToken(payload: RefreshCookiePayload, secret: string): string {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const sig = signPayload(encodedPayload, secret);
  return `${encodedPayload}.${sig}`;
}

function setRefreshCookie(res: VercelResponse, token: string, secure: boolean): void {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${COOKIE_MAX_AGE}`,
    'SameSite=Lax',
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

function clearRefreshCookie(res: VercelResponse, secure: boolean): void {
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'Max-Age=0',
    'SameSite=Lax',
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secureCookie = useSecureSessionCookieAttribute(req);
  const body = typeof req.body === 'object' && req.body !== null ? req.body as Record<string, unknown> : {};
  if (body.clear === true) {
    clearRefreshCookie(res, secureCookie);
    return res.status(200).json({ ok: true });
  }

  const secret = process.env.SESSION_COOKIE_SECRET;
  if (!secret) return res.status(503).json({ error: 'Missing SESSION_COOKIE_SECRET' });

  const refreshToken = typeof body.refresh_token === 'string' ? body.refresh_token.trim() : '';
  if (!refreshToken) return res.status(400).json({ error: 'Missing refresh_token' });

  const user = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const token = buildSignedToken(
    { rt: refreshToken, uid: user.id, iat: Date.now() },
    secret
  );
  setRefreshCookie(res, token, secureCookie);
  return res.status(200).json({ ok: true });
}
