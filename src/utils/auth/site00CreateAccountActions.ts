/**
 * SITE 00 account registration — Supabase sign-up with session finalization + intake claim.
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
import { claimGuestIntakes } from '../../site00/api/intakesApi';

export type Site00SignUpResult =
  | { ok: true; kind: 'active_session' }
  | { ok: true; kind: 'verification_required'; email: string }
  | { ok: false; message: string };

function normalizeSignUpError(message: string): string {
  const raw = (message || '').toLowerCase();
  if (raw.includes('already registered') || raw.includes('already been registered')) {
    return 'AN ACCOUNT WITH THIS EMAIL ALREADY EXISTS. SIGN IN INSTEAD.';
  }
  if (raw.includes('password') && raw.includes('least')) {
    return message.toUpperCase();
  }
  if (raw.includes('invalid email')) {
    return 'ENTER A VALID EMAIL ADDRESS.';
  }
  if (raw.includes('signup is disabled')) {
    return 'ACCOUNT CREATION IS NOT AVAILABLE RIGHT NOW.';
  }
  return (message || 'ACCOUNT CREATION FAILED. TRY AGAIN.').toUpperCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function finalizeNewSession(accessToken: string, refreshToken: string, userEmail?: string): Promise<void> {
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
    trackActivity('sign_in', { method: 'sign_up' });
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
    await flushQueuedProfilePatch().catch(() => {});
  } else {
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
    trackActivity('sign_in', { method: 'sign_up' });
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
    await flushQueuedProfilePatch().catch(() => {});
  }

  await claimGuestIntakes().catch(() => null);
}

export async function site00SignUpWithPassword(params: {
  email: string;
  password: string;
  confirmPassword: string;
  displayName?: string;
}): Promise<Site00SignUpResult> {
  const emailTrim = params.email.trim().toLowerCase();
  if (!emailTrim) return { ok: false, message: 'EMAIL IS REQUIRED.' };
  if (!isValidEmail(emailTrim)) return { ok: false, message: 'ENTER A VALID EMAIL ADDRESS.' };
  if (!params.password) return { ok: false, message: 'PASSWORD IS REQUIRED.' };
  if (params.password !== params.confirmPassword) {
    return { ok: false, message: 'PASSWORDS DO NOT MATCH.' };
  }

  if (!isSupabaseConfigured()) {
    return {
      ok: false,
      message: 'ACCOUNT CREATION REQUIRES SUPABASE. SET VITE_SUPABASE_URL AND VITE_SUPABASE_ANON_KEY.',
    };
  }

  const supabase = getSupabase();
  if (!supabase) return { ok: false, message: 'ACCOUNT CREATION FAILED. TRY AGAIN.' };

  try {
    const { data, error } = await supabase.auth.signUp({
      email: emailTrim,
      password: params.password.trim(),
      options: {
        data: params.displayName?.trim() ? { display_name: params.displayName.trim() } : undefined,
      },
    });

    if (error) {
      return { ok: false, message: normalizeSignUpError(error.message) };
    }

    if (data.session && data.user && isSupabaseUserEmailConfirmed(data.user)) {
      await finalizeNewSession(data.session.access_token, data.session.refresh_token, data.user.email ?? emailTrim);
      return { ok: true, kind: 'active_session' };
    }

    if (data.session && data.user) {
      await signOutIfSessionEmailUnconfirmed(supabase, data.session, { clearAppAuth: true });
    }

    return { ok: true, kind: 'verification_required', email: emailTrim };
  } catch {
    return { ok: false, message: 'ACCOUNT CREATION FAILED. TRY AGAIN.' };
  }
}
