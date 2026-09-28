import { useEffect, useRef } from 'react';
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
import { isSite00PreviewTunnelHost } from '../loader/site00PreviewHost';

const PROFILE_SYNC_TIMEOUT_MS = 12_000;
const PREVIEW_PROFILE_SYNC_TIMEOUT_MS = 4_000;
const SERVER_RESTORE_TIMEOUT_MS = 8_000;

function redirectAfterSignIn(locationSearch: string, locationState: unknown): void {
  const returnTo = new URLSearchParams(locationSearch).get('returnTo');
  const target = resolveSite00ReturnToAfterSignIn(returnTo, locationState as { from?: string } | null);
  window.setTimeout(() => {
    window.location.assign(target);
  }, 120);
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

function redirectIfAlreadySignedIn(
  locationSearch: string,
  locationState: unknown,
  cancelled: () => boolean,
): void {
  if (cancelled()) return;
  if (localStorage.getItem('isSignedIn') !== 'true') return;
  if (!isSupabaseConfigured()) {
    redirectAfterSignIn(locationSearch, locationState);
    return;
  }
  const supabase = getSupabase();
  if (!supabase) return;
  void supabase.auth.getSession().then(({ data: { session } }) => {
    if (cancelled() || !session?.access_token) return;
    redirectAfterSignIn(locationSearch, locationState);
  });
}

/** Runs session restore once per mount + listens for SIGNED_IN (password autofill / submit). */
export function useSite00SignInBootstrap(): void {
  const location = useLocation();
  const coldStartDone = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;
    const { search, state } = location;

    ensureAuthRestoredFromBackup();
    redirectIfAlreadySignedIn(search, state, isCancelled);

    const supabase = getSupabase();
    const authListener =
      supabase ?
        supabase.auth.onAuthStateChange((event, session) => {
          if (isCancelled() || !session?.access_token) return;
          if (event !== 'SIGNED_IN') return;
          void finishSessionRestore(session).then(() => {
            if (!isCancelled()) redirectAfterSignIn(search, state);
          });
        })
      : null;

    if (!coldStartDone.current) {
      coldStartDone.current = true;

      if (!isSupabaseConfigured() || !supabase) {
        return () => {
          cancelled = true;
          authListener?.data.subscription.unsubscribe();
        };
      }

      void (async () => {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (isCancelled()) return;
        if (await signOutIfSessionEmailUnconfirmed(supabase, session)) return;
        if (!session) {
          if (!isSite00PreviewTunnelHost()) {
            await promiseWithTimeout(tryServerSessionRestore(), SERVER_RESTORE_TIMEOUT_MS, false);
          }
          return;
        }
        await finishSessionRestore(session);
        if (isCancelled()) return;
        redirectAfterSignIn(search, state);
      })();
    }

    return () => {
      cancelled = true;
      authListener?.data.subscription.unsubscribe();
    };
  }, [location.search, location.state]);
}
