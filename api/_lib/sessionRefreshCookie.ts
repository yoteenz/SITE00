import { createHmac } from 'node:crypto';

export const SESSION_REFRESH_COOKIE_NAME = 'baw_session_rt';
export const SESSION_REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export type RefreshCookiePayload = {
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

export function buildSignedRefreshCookieToken(payload: RefreshCookiePayload, secret: string): string {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const sig = signPayload(encodedPayload, secret);
  return `${encodedPayload}.${sig}`;
}

export function refreshCookieExpiresAtUnix(nowMs = Date.now()): number {
  return Math.floor(nowMs / 1000) + SESSION_REFRESH_COOKIE_MAX_AGE_SECONDS;
}
