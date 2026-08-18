import { useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { isSignedIn, persistAuthBackup, ensureAuthRestoredFromBackup, onSignInSuccess } from '../../../utils/adminAuth';
import { getSupabase, isSupabaseConfigured, signOutIfSessionEmailUnconfirmed } from '../../../utils/supabase';
import {
  syncAllFromApi,
  buildMinimalUserFromSupabaseSession,
  applyMinimalUserToStorage,
  buildProfilePayloadForBackend,
  didLastProfileSyncError,
} from '../../../utils/syncFromApi';
import { registerServerSessionCookie } from '../../../utils/sessionRestore';
import { tryServerSessionRestore } from '../../../utils/sessionRestore';
import { site00SignInHrefWithReturnTo } from '../../config/mobile-directory-nav';
import { GuardLoadingRecovery } from '../../../platform-stabilization/GuardLoadingRecovery';
import { useGuardLoadingTimeout } from '../../../platform-stabilization/useGuardLoadingTimeout';

const SERVER_RESTORE_ATTEMPT_KEY = 'site00_ctrl_room_restore_v1';

function shouldAttemptServerRestoreNow(): boolean {
  if (typeof window === 'undefined' || !window.sessionStorage) return true;
  try {
    const seen = window.sessionStorage.getItem(SERVER_RESTORE_ATTEMPT_KEY) === '1';
    if (seen) return false;
    window.sessionStorage.setItem(SERVER_RESTORE_ATTEMPT_KEY, '1');
    return true;
  } catch {
    return true;
  }
}

/** Protects SITE 00 CTRL ROOM — redirects to SITE 00 sign-in when signed out. */
export function Site00AccountRouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [recoveryDone, setRecoveryDone] = useState(false);
  const isLoading = !recoveryDone;
  const timedOut = useGuardLoadingTimeout(isLoading, 'Site00AccountRouteGuard');

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setRecoveryDone(true);
      return;
    }
    const client = getSupabase();
    if (!client) {
      setRecoveryDone(true);
      return;
    }
    const supabase = client;
    let cancelled = false;

    async function run() {
      if (shouldAttemptServerRestoreNow()) {
        const restored = await tryServerSessionRestore().catch(() => false);
        if (cancelled) return;
        if (restored) return;
      }

      let { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      if (!session) {
        try {
          const { data } = await supabase.auth.refreshSession();
          if (data?.session) session = data.session;
        } catch {
          /* ignore */
        }
        if (cancelled) return;
      }
      if (!session) {
        const restored = await tryServerSessionRestore().catch(() => false);
        if (restored) return;
        ensureAuthRestoredFromBackup();
        persistAuthBackup();
        setRecoveryDone(true);
        return;
      }
      if (await signOutIfSessionEmailUnconfirmed(supabase, session)) {
        setRecoveryDone(true);
        return;
      }
      const profile = await syncAllFromApi();
      if (cancelled) return;
      if (profile) {
        localStorage.setItem('isSignedIn', 'true');
        onSignInSuccess('session_restore');
        registerServerSessionCookie(session.access_token, session.refresh_token);
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
      } else {
        const minimal = buildMinimalUserFromSupabaseSession(session.user);
        applyMinimalUserToStorage(minimal);
        onSignInSuccess('session_restore');
        registerServerSessionCookie(session.access_token, session.refresh_token);
        if (!didLastProfileSyncError()) {
          const { patchProfile } = await import('../../../utils/api');
          await patchProfile(buildProfilePayloadForBackend(minimal)).catch(() => {});
        }
        localStorage.setItem('isSignedIn', 'true');
        window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
      }
      setRecoveryDone(true);
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, []);

  if (timedOut && isLoading) {
    return (
      <GuardLoadingRecovery
        guard="Site00AccountRouteGuard"
        detail="CTRL ROOM session restore did not complete. Try reload or sign in again."
        onRetry={() => setRecoveryDone(false)}
      />
    );
  }

  if (!recoveryDone) {
    return (
      <div className="site00-ctrl-room-loading" role="status" aria-live="polite">
        <p>ASSEMBLING CTRL ROOM…</p>
      </div>
    );
  }

  if (!isSignedIn()) {
    return <Navigate to={site00SignInHrefWithReturnTo(location)} replace />;
  }

  return <>{children}</>;
}
