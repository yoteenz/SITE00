/**
 * Temporary while Supabase is down.
 * The preview tunnel can be reviewed without sign-in.
 * site00.com still requires sign-in.
 */
export function isSite00SignInPaused(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname.toLowerCase();
  return host === 'site00.fsbw-dev.com' || host === 'localhost' || host === '127.0.0.1';
}
