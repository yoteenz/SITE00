/**
 * Auth email return URLs.
 * Supabase uses the project Site URL when emailRedirectTo is omitted or not allowlisted.
 * A new project Site URL defaults to http://localhost:3000. Always pass an explicit https origin.
 */

export const SITE00_STAGING_PUBLIC_ORIGIN = 'https://carefree-luck-staging.up.railway.app';
export const SITE00_FOUNDER_READINESS_PATH = '/admin/site00/founder-workspace/overview';
const SIGN_IN_PATH = '/origin/sign-in';

export function site00SafeReturnPath(returnPath: string | null | undefined): string {
  const raw = (returnPath ?? '').trim();
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.includes('://') || raw.includes('\\')) {
    return SITE00_FOUNDER_READINESS_PATH;
  }
  return raw.slice(0, 1024);
}

/**
 * Sign-in URL that preserves the page the founder meant to open after confirm or reset.
 * Origin must be the browser origin. There is no localhost:3000 fallback.
 */
export function site00AuthCallbackUrl(origin: string, returnPath?: string | null): string {
  const base = origin.trim().replace(/\/$/, '');
  if (!/^https?:\/\//i.test(base) || base === 'http://localhost:3000' || base === 'https://localhost:3000') {
    throw new Error('SITE00_AUTH_ORIGIN_REQUIRED');
  }
  const path = site00SafeReturnPath(returnPath);
  return `${base}${SIGN_IN_PATH}?returnTo=${encodeURIComponent(path)}`;
}

export function site00BrowserAuthOrigin(loc?: { origin?: string } | null): string {
  const origin = (loc?.origin ?? '').trim();
  return origin;
}

export function isSite00PasswordRecoveryHash(hash: string): boolean {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  return new URLSearchParams(raw).get('type') === 'recovery';
}
