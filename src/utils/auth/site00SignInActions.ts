/**
 * Shared SITE 00 sign-in actions — Supabase password, magic link, password reset.
 * Reuses the same session/profile pipeline as Frontal Slayer commerce sign-in.
 */

import { onSignInSuccess } from '../adminAuth';
import { saveCartAndWishlistToUserKeys } from '../cartWishlistStorage';
import {
  getSupabase,
  isSupabaseConfigured,
  isSupabaseUserEmailConfirmed,
  signOutIfSessionEmailUnconfirmed,
} from '../supabase';
import {
  syncAllFromApi,
  buildMinimalUserFromSupabaseSession,
  applyMinimalUserToStorage,
  buildProfilePayloadForBackend,
  didLastProfileSyncError,
} from '../syncFromApi';
import { registerServerSessionCookie } from '../sessionRestore';
import { trackActivity } from '../activity';
import { flushQueuedProfilePatch } from '../profileSyncQueue';

export type Site00SignInResult =
  | { ok: true }
  | { ok: false; message: string };

function normalizeAuthError(message: string): string {
  const raw = (message || '').toLowerCase();
  const isInvalidCreds =
    message === 'Invalid login credentials' ||
    raw.includes('email not confirmed') ||
    raw.includes('not confirmed');
  return isInvalidCreds ? 'INVALID EMAIL OR PASSWORD.' : message.toUpperCase();
}

async function finalizePasswordSession(accessToken: string, refreshToken: string, userEmail?: string): Promise<void> {
  try {
    const raw = localStorage.getItem('currentUser');
    if (raw) {
      const prev = JSON.parse(raw);
      if (prev?.email) saveCartAndWishlistToUserKeys((prev.email as string).trim().toLowerCase());
    } else if (userEmail) {
      saveCartAndWishlistToUserKeys(userEmail.trim().toLowerCase());
    }
  } catch {
    /* ignore */
  }

  const profile = await syncAllFromApi();
  if (profile) {
    localStorage.setItem('isSignedIn', 'true');
    onSignInSuccess('password');
    await registerServerSessionCookie(accessToken, refreshToken);
    trackActivity('sign_in', { method: 'password' });
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
    await flushQueuedProfilePatch().catch(() => {});
    return;
  }

  const supabase = getSupabase();
  const session = supabase ? (await supabase.auth.getSession()).data.session : null;
  if (!session?.user) return;

  const minimal = buildMinimalUserFromSupabaseSession(session.user) as Record<string, unknown>;
  applyMinimalUserToStorage(minimal);
  onSignInSuccess('password');
  await registerServerSessionCookie(accessToken, refreshToken);
  if (!didLastProfileSyncError()) {
    const { patchProfile } = await import('../api');
    await patchProfile(buildProfilePayloadForBackend(minimal)).catch(() => {});
  }
  localStorage.setItem('isSignedIn', 'true');
  trackActivity('sign_in', { method: 'password' });
  window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
  await flushQueuedProfilePatch().catch(() => {});
}

export async function site00SignInWithPassword(email: string, password: string): Promise<Site00SignInResult> {
  const emailTrim = email.trim();
  if (!emailTrim) return { ok: false, message: 'EMAIL IS REQUIRED.' };
  if (!password) return { ok: false, message: 'PASSWORD IS REQUIRED.' };

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: 'SIGN-IN REQUIRES SUPABASE. SET VITE_SUPABASE_URL AND VITE_SUPABASE_ANON_KEY IN .ENV.LOCAL.',
    };
  }

  const supabase = getSupabase();
  if (!supabase) return { ok: false, message: 'SIGN-IN FAILED. TRY AGAIN.' };

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailTrim,
      password: password.trim(),
    });

    if (error) {
      return { ok: false, message: normalizeAuthError(error.message) };
    }

    if (!data.session) {
      return { ok: false, message: 'INVALID EMAIL OR PASSWORD.' };
    }

    if (!isSupabaseUserEmailConfirmed(data.session.user)) {
      await signOutIfSessionEmailUnconfirmed(supabase, data.session, { clearAppAuth: false });
      return { ok: false, message: 'INVALID EMAIL OR PASSWORD.' };
    }

    await finalizePasswordSession(
      data.session.access_token,
      data.session.refresh_token,
      data.session.user.email ?? emailTrim,
    );
    return { ok: true };
  } catch {
    return { ok: false, message: 'SIGN-IN FAILED. TRY AGAIN.' };
  }
}

export async function site00SignInWithMagicLink(email: string, redirectTo: string): Promise<Site00SignInResult> {
  const emailTrim = email.trim();
  if (!emailTrim) return { ok: false, message: 'EMAIL IS REQUIRED.' };

  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'MAGIC LINK REQUIRES SUPABASE CONFIGURATION.' };
  }

  const supabase = getSupabase();
  if (!supabase) return { ok: false, message: 'MAGIC LINK FAILED. TRY AGAIN.' };

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.signInWithOtp({
      email: emailTrim,
      options: {
        emailRedirectTo: redirectTo.startsWith('http') ? redirectTo : `${origin}${redirectTo}`,
      },
    });
    if (error) return { ok: false, message: normalizeAuthError(error.message) };
    return { ok: true };
  } catch {
    return { ok: false, message: 'MAGIC LINK FAILED. TRY AGAIN.' };
  }
}

export async function site00RequestPasswordReset(email: string): Promise<Site00SignInResult> {
  const emailTrim = email.trim();
  if (!emailTrim) return { ok: false, message: 'EMAIL IS REQUIRED.' };

  if (!isSupabaseConfigured()) {
    return { ok: false, message: 'PASSWORD RESET REQUIRES SUPABASE CONFIGURATION.' };
  }

  const supabase = getSupabase();
  if (!supabase) return { ok: false, message: 'PASSWORD RESET FAILED. TRY AGAIN.' };

  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const { error } = await supabase.auth.resetPasswordForEmail(emailTrim, {
      redirectTo: `${origin}/account/settings`,
    });
    if (error) return { ok: false, message: normalizeAuthError(error.message) };
    return { ok: true };
  } catch {
    return { ok: false, message: 'PASSWORD RESET FAILED. TRY AGAIN.' };
  }
}
