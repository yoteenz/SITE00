import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createHmac, timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { useSecureSessionCookieAttribute } from './_lib/sessionCookieSecure.js';

const COOKIE_NAME = 'baw_session_rt';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

type RefreshCookiePayload = {
  rt: string;
  uid: string;
  iat: number;
};

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {};
  return header.split(';').reduce<Record<string, string>>((acc, part) => {
    const i = part.indexOf('=');
    if (i <= 0) return acc;
    const k = part.slice(0, i).trim();
    const v = part.slice(i + 1).trim();
    acc[k] = decodeURIComponent(v);
    return acc;
  }, {});
}

function signPayload(encodedPayload: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(encodedPayload).digest();
}

function verifyAndReadToken(token: string, secret: string): RefreshCookiePayload | null {
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return null;
  const encodedPayload = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);
  if (!encodedPayload || !sigB64) return null;

  let givenSig: Buffer;
  try {
    givenSig = Buffer.from(sigB64, 'base64url');
  } catch {
    return null;
  }
  const expectedSig = signPayload(encodedPayload, secret);
  if (givenSig.length !== expectedSig.length) return null;
  if (!timingSafeEqual(givenSig, expectedSig)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as Partial<RefreshCookiePayload>;
    if (!parsed || typeof parsed.rt !== 'string' || typeof parsed.uid !== 'string') return null;
    return {
      rt: parsed.rt,
      uid: parsed.uid,
      iat: typeof parsed.iat === 'number' ? parsed.iat : Date.now(),
    };
  } catch {
    return null;
  }
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

function buildSignedToken(payload: RefreshCookiePayload, secret: string): string {
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = createHmac('sha256', secret).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${sig}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const secureCookie = useSecureSessionCookieAttribute(req);

  const secret = process.env.SESSION_COOKIE_SECRET;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnon = process.env.SUPABASE_ANON_KEY;
  if (!secret || !supabaseUrl || !supabaseAnon) {
    return res.status(503).json({ error: 'Missing server env for session restore' });
  }

  const cookies = parseCookies(req.headers.cookie);
  const rawToken = cookies[COOKIE_NAME];
  if (!rawToken) return res.status(401).json({ error: 'No session cookie' });

  const payload = verifyAndReadToken(rawToken, secret);
  if (!payload?.rt) {
    clearRefreshCookie(res, secureCookie);
    return res.status(401).json({ error: 'Invalid session cookie' });
  }

  const supabase = createClient(supabaseUrl, supabaseAnon);
  const { data, error } = await supabase.auth.refreshSession({ refresh_token: payload.rt });
  if (error || !data.session || !data.user) {
    clearRefreshCookie(res, secureCookie);
    return res.status(401).json({ error: 'Session restore failed' });
  }

  if (data.user.id !== payload.uid) {
    clearRefreshCookie(res, secureCookie);
    return res.status(401).json({ error: 'Session user mismatch' });
  }

  // Rotate cookie to latest refresh token so Safari restore stays valid.
  const rotated = buildSignedToken(
    { rt: data.session.refresh_token, uid: data.user.id, iat: Date.now() },
    secret
  );
  setRefreshCookie(res, rotated, secureCookie);

  return res.status(200).json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    expires_in: data.session.expires_in,
    user: {
      id: data.user.id,
      email: data.user.email ?? '',
      user_metadata: data.user.user_metadata ?? {},
    },
  });
}
