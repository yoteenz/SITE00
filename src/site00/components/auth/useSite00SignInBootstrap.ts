import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ensureAuthRestoredFromBackup, isPreviewEnvironment, onSignInSuccess } from '../../../utils/adminAuth';
import type { Session } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured, signOutIfSessionEmailUnconfirmed } from '../../../utils/supabase';
import {
  applyMinimalUserToStorage,
  buildMinimalUserFromSupabaseSession,
  buildProfilePayloadForBackend,
  didLastProfileSyncError,
  syncAllFromApi,
} from '../../../utils/syncFromApi';
import { promiseWithTimeout } from '../../../utils/promiseWithTimeout';
import { registerServerSessionCookie, tryServerSessionRestore } from '../../../utils/sessionRestore';
import { trackActivity } from '../../../utils/activity';
import { resolveSite00ReturnToAfterSignIn } from '../../../utils/signInReturnTo';

const PROFILE_SYNC_TIMEOUT_MS = 12_000;
const PREVIEW_PROFILE_SYNC_TIMEOUT_MS = 4_000;

let bootstrapStarted = false;

function redirectAfterSignIn(locationSearch: string, locationState: unknown): void {
  const returnTo = new URLSearchParams(locationSearch).get('returnTo');
  const target = resolveSite00ReturnToAfterSignIn(returnTo, locationState as { from?: string } | null);
  window.setTimeout(() => {
    window.location.href = target;
  }, 280);
}

async function finishSessionRestore(session: Session): Promise<void> {
  const preview = isPreviewEnvironment();
  const syncTimeout = preview ? PREVIEW_PROFILE_SYNC_TIMEOUT_MS : PROFILE_SYNC_TIMEOUT_MS;

  if (preview) {
    const minimal = buildMinimalUserFromSupabaseSession(session.user);
    applyMinimalUserToStorage(minimal);
    onSignInSuccess('session_restore');
    void registerServerSessionCookie(session.access_token, session.refresh_token);
    localStorage.setItem('isSignedIn', 'true');
    trackActivity('sign_in', { method: 'session_restore' });
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
    void promiseWithTimeout(syncAllFromApi(), syncTimeout, null);
    return;
  }

  const profile = await promiseWithTimeout(syncAllFromApi(), syncTimeout, null);
  if (profile) {
    localStorage.setItem('isSignedIn', 'true');
    onSignInSuccess('session_restore');
    await registerServerSessionCookie(session.access_token, session.refresh_token);
    trackActivity('sign_in', { method: 'session_restore' });
    window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
    return;
  }

  const minimal = buildMinimalUserFromSupabaseSession(session.user);
  applyMinimalUserToStorage(minimal);
  onSignInSuccess('session_restore');
  await registerServerSessionCookie(session.access_token, session.refresh_token);
  if (!didLastProfileSyncError()) {
    const { patchProfile } = await import('../../../utils/api');
    await patchProfile(buildProfilePayloadForBackend(minimal)).catch(() => {});
  }
  localStorage.setItem('isSignedIn', 'true');
  window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
}

/** Runs once per full page load — avoids duplicate Supabase/profile work from desktop + mobile sign-in forms. */
export function useSite00SignInBootstrap(): void {
  const location = useLocation();

  useEffect(() => {
    if (bootstrapStarted) return;
    bootstrapStarted = true;

    let cancelled = false;
    ensureAuthRestoredFromBackup();

    const redirectIfAlreadySignedIn = () => {
      if (cancelled) return;
      if (localStorage.getItem('isSignedIn') !== 'true') return;
      if (!isSupabaseConfigured()) {
        redirectAfterSignIn(location.search, location.state);
        return;
      }
      const supabase = getSupabase();
      if (!supabase) return;
      void supabase.auth.getSession().then(({ data: { session } }) => {
        if (cancelled || !session?.access_token) return;
        redirectAfterSignIn(location.search, location.state);
      });
    };

    redirectIfAlreadySignedIn();

    if (!isSupabaseConfigured()) {
      return () => {
        cancelled = true;
      };
    }

    const supabase = getSupabase();
    if (!supabase) {
      return () => {
        cancelled = true;
      };
    }

    void (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (await signOutIfSessionEmailUnconfirmed(supabase, session)) return;
      if (!session) {
        await promiseWithTimeout(tryServerSessionRestore(), 8_000, false);
        return;
      }
      await finishSessionRestore(session);
      if (cancelled) return;
      redirectAfterSignIn(location.search, location.state);
    })();

    return () => {
      cancelled = true;
    };
  }, [location.search, location.state]);
}
