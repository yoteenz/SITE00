/**
 * Server-side session restore for Safari (and others). When Safari clears all client storage,
 * the server may still have an HttpOnly cookie. We call GET /api/session-restore with
 * credentials: 'include' to get a new session and rehydrate the client.
 */
import { persistAuthBackup, onSignInSuccess } from './adminAuth';
import { buildMinimalUserFromSupabaseSession, applyMinimalUserToStorage } from './syncFromApi';

const SUPABASE_URL = (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL ?? '';

function getSupabaseStorageKey(): string | null {
  if (!SUPABASE_URL) return null;
  try {
    const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
    return projectRef ? `sb-${projectRef}-auth-token` : null;
  } catch {
    return null;
  }
}

/** Avoid Safari/WebKit "The string did not match the expected pattern" when dev server returns HTML instead of JSON. */
async function parseSessionRestoreJson(
  res: Response,
): Promise<Record<string, unknown> | null> {
  const ct = res.headers.get('content-type') || '';
  const raw = await res.text();
  const trimmed = raw.trim();
  if (!trimmed) {
    return null;
  }
  const looksJson = /application\/json/i.test(ct) || trimmed.startsWith('{');
  if (!looksJson) {
    return null;
  }
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Call GET /api/session-restore with credentials so the HttpOnly cookie is sent.
 * If the server returns a session, write it to localStorage and reload so the app starts signed in.
 * Returns true if we applied and reloaded, false otherwise.
 */
export async function tryServerSessionRestore(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  // Use same-origin API route so Safari treats cookie as first-party (local + production).
  const url = `/api/session-restore`;
  let res: Response;
  try {
    res = await fetch(url, { method: 'GET', credentials: 'include' });
  } catch {
    return false;
  }
  if (!res.ok) {
    return false;
  }
  const parsed = await parseSessionRestoreJson(res);
  if (!parsed) return false;
  const data = parsed as {
    access_token?: string;
    refresh_token?: string;
    expires_at?: number;
    expires_in?: number;
    user?: { id: string; email?: string; user_metadata?: Record<string, unknown> };
  };
  const access_token = data.access_token;
  const refresh_token = data.refresh_token;
  const expires_at = data.expires_at ?? 0;
  const expires_in = data.expires_in ?? 3600;
  if (!access_token || !refresh_token) {
    return false;
  }

  const storageKey = getSupabaseStorageKey();
  if (!storageKey) {
    return false;
  }

  const session = {
    access_token,
    refresh_token,
    expires_at,
    expires_in,
    token_type: 'bearer' as const,
    user: data.user ?? null,
  };
  window.localStorage.setItem(storageKey, JSON.stringify(session));
  if (data.user && typeof data.user === 'object' && data.user.id) {
    const minimal = buildMinimalUserFromSupabaseSession(data.user);
    applyMinimalUserToStorage(minimal);
  } else {
    window.localStorage.setItem('isSignedIn', 'true');
    persistAuthBackup();
  }
  onSignInSuccess('session_restore');
  if (typeof window.dispatchEvent === 'function') {
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
  }
  window.location.reload();
  return true;
}

/**
 * Clear the server HttpOnly session cookie. Call on sign-out so the server forgets the session.
 */
export async function clearServerSessionCookie(): Promise<void> {
  if (typeof window === 'undefined') return;
  const url = `/api/session-cookie`;
  try {
    await fetch(url, {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clear: true }),
    });
  } catch {
    // ignore
  }
}

/**
 * Register the session's refresh_token with the server so it can set the HttpOnly cookie.
 * Call after sign-in with the session you just received. Uses credentials: 'include' so the cookie is set.
 */
export async function registerServerSessionCookie(accessToken: string, refreshToken: string): Promise<void> {
  if (!accessToken || !refreshToken || typeof window === 'undefined') return;
  const url = `/api/session-cookie`;
  try {
    await fetch(url, {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch {
    /* ignore */
  }
}
