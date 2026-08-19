import type { VercelRequest } from '@vercel/node';

/**
 * Whether to add the `Secure` flag to HttpOnly session cookies.
 *
 * Browsers ignore `Secure` cookies on non-HTTPS pages — so LAN / localhost dev
 * (`http://10.0.0.117:3001`) never keeps the cookie if the API always sets `Secure`.
 * Production (`https://…`) still gets `Secure`.
 *
 * Override: SESSION_COOKIE_SECURE=true|false (forces on/off for all requests).
 */
export function useSecureSessionCookieAttribute(req: VercelRequest): boolean {
  const force = process.env.SESSION_COOKIE_SECURE;
  if (force === 'true') return true;
  if (force === 'false') return false;

  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
  if (origin.startsWith('https://')) return true;
  if (origin.startsWith('http://')) return false;

  const referer = typeof req.headers.referer === 'string' ? req.headers.referer : '';
  if (referer.startsWith('https://')) return true;
  if (referer.startsWith('http://')) return false;

  // e.g. server-to-server or missing headers — preserve prior behavior
  return process.env.VERCEL_ENV === 'production';
}
