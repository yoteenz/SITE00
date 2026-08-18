/**
 * Supabase client for the frontend (auth + optional API token).
 * Uses a custom storage that mirrors the auth session and user to cookies so that when Safari (or any
 * browser) clears localStorage on app close, the session can be restored from cookies — same
 * effective behavior as Chrome keeping localStorage. Sign-out happens ONLY when the user
 * explicitly clicks Sign Out. When Supabase fires SIGNED_OUT we restore app auth from backup.
 */
import { createClient, SupabaseClient, type Session, type User } from '@supabase/supabase-js';
import { ensureAuthRestoredFromBackup, consumeManualSignOutFlag } from './adminAuth';

const SUPABASE_SESSION_COOKIE = 'baw_sb_session';
const SUPABASE_USER_COOKIE = 'baw_sb_user';
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60;
const MAX_SESSION_LENGTH = 4000; // under 4k cookie limit; session JSON can be ~2–3k
const MAX_USER_LENGTH = 4000;

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function setCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return;
  try {
    const secure = typeof location !== 'undefined' && location.protocol === 'https:';
    let c = name + '=' + encodeURIComponent(value) + '; path=/; max-age=' + COOKIE_MAX_AGE + '; SameSite=Lax';
    if (secure) c += '; Secure';
    document.cookie = c;
  } catch (_) {}
}

function clearCookie(name: string): void {
  if (typeof document === 'undefined') return;
  try {
    const secure = typeof location !== 'undefined' && location.protocol === 'https:';
    let c = name + '=; path=/; max-age=0';
    if (secure) c += '; Secure';
    document.cookie = c;
  } catch (_) {}
}

/** Session key is e.g. sb-xxx-auth-token (no -user suffix). */
function isSessionStorageKey(k: string): boolean {
  return /^sb-.+-auth-token$/.test(k);
}

/** User key is e.g. sb-xxx-auth-token-user. */
function isUserStorageKey(k: string): boolean {
  return k.endsWith('-user');
}

/**
 * Restore Supabase session and user from cookies into localStorage at bootstrap.
 * Call this in main.tsx right after ensureAuthRestoredFromBackup() so that when
 * getSupabase() runs, storage.getItem() finds the session in localStorage (and we
 * don't rely on Supabase reading our cookie path on first getItem).
 */
export function restoreSupabaseSessionFromCookie(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  const url = (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL;
  if (!url) return;
  try {
    const projectRef = new URL(url).hostname.split('.')[0];
    if (!projectRef) return;
    const storageKey = `sb-${projectRef}-auth-token`;
    const sessionVal = getCookie(SUPABASE_SESSION_COOKIE);
    const userVal = getCookie(SUPABASE_USER_COOKIE);
    if (sessionVal) {
      window.localStorage.setItem(storageKey, sessionVal);
    }
    if (userVal) {
      window.localStorage.setItem(storageKey + '-user', userVal);
    }
  } catch (_) {}
}

/** Storage adapter that mirrors Supabase auth session and user to separate cookies so session survives when localStorage is cleared (e.g. Safari on app close). */
function createSupabaseStorage(): { getItem: (key: string) => string | null; setItem: (key: string, value: string) => void; removeItem: (key: string) => void } {
  const ls = typeof window !== 'undefined' ? window.localStorage : null;

  return {
    getItem(key: string): string | null {
      if (!ls) return null;
      let val = ls.getItem(key);
      if (val) return val;
      if (isSessionStorageKey(key)) {
        const fromCookie = getCookie(SUPABASE_SESSION_COOKIE);
        if (fromCookie) {
          ls.setItem(key, fromCookie);
          return fromCookie;
        }
      }
      if (isUserStorageKey(key)) {
        const fromCookie = getCookie(SUPABASE_USER_COOKIE);
        if (fromCookie) {
          ls.setItem(key, fromCookie);
          return fromCookie;
        }
      }
      return null;
    },
    setItem(key: string, value: string): void {
      if (!ls) return;
      ls.setItem(key, value);
      if (isSessionStorageKey(key) && value && value.length <= MAX_SESSION_LENGTH) {
        setCookie(SUPABASE_SESSION_COOKIE, value);
      } else if (isUserStorageKey(key) && value && value.length <= MAX_USER_LENGTH) {
        setCookie(SUPABASE_USER_COOKIE, value);
      }
    },
    removeItem(key: string): void {
      if (!ls) return;
      ls.removeItem(key);
      if (isSessionStorageKey(key)) clearCookie(SUPABASE_SESSION_COOKIE);
      if (isUserStorageKey(key)) clearCookie(SUPABASE_USER_COOKIE);
    },
  };
}

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === 'undefined') return null;
  if (client) return client;
  const url = (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL;
  const key = (import.meta as unknown as { env?: { VITE_SUPABASE_ANON_KEY?: string } }).env?.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  client = createClient(url, key, {
    auth: {
      storage: createSupabaseStorage(),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });
  client.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      // Hard gate: only allow true signed-out state on explicit manual sign-out.
      const manual = consumeManualSignOutFlag();
      if (manual) {
        return;
      }
      ensureAuthRestoredFromBackup();
      // Try server cookie restore when browser/session cleared local Supabase state unexpectedly.
      import('./sessionRestore').then((m) => m.tryServerSessionRestore()).catch(() => {});
    }
  });
  return client;
}

export function isSupabaseConfigured(): boolean {
  return !!(
    (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL &&
    (import.meta as unknown as { env?: { VITE_SUPABASE_ANON_KEY?: string } }).env?.VITE_SUPABASE_ANON_KEY
  );
}

/**
 * True when the user has confirmed their email in Supabase (email/password signups).
 * Users without an email (edge cases) are treated as OK so we do not block unexpectedly.
 */
export function isSupabaseUserEmailConfirmed(user: User | null | undefined): boolean {
  if (!user?.email) return true;
  return Boolean(user.email_confirmed_at);
}

/**
 * If the session user has not confirmed their email, sign out of Supabase and optionally clear app auth.
 * Use clearAppAuth: false right after signInWithPassword when app localStorage was not updated yet.
 */
export async function signOutIfSessionEmailUnconfirmed(
  client: SupabaseClient,
  session: Session | null | undefined,
  options?: { clearAppAuth?: boolean }
): Promise<boolean> {
  if (!session?.user || isSupabaseUserEmailConfirmed(session.user)) return false;
  if (options?.clearAppAuth !== false) {
    const { clearAppAuth } = await import('./adminAuth');
    clearAppAuth();
  }
  await client.auth.signOut();
  return true;
}
