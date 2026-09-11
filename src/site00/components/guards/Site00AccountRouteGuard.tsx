import { useEffect, useState } from 'react';
import { useLocation, Navigate, Link } from 'react-router-dom';
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
import { promiseWithTimeout } from '../../../platform-stabilization/promiseWithTimeout';
import { isSite00CloudPreviewBuild } from '../loader/site00PreviewHost';

const SERVER_RESTORE_ATTEMPT_KEY = 'site00_ctrl_room_restore_v1';
const AUTH_STEP_TIMEOUT_MS = 6_000;

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

function finishLocalAuthRecovery(): void {
  ensureAuthRestoredFromBackup();
  persistAuthBackup();
}

/** Protects SITE 00 CTRL ROOM — redirects to SITE 00 sign-in when signed out. */
export function Site00AccountRouteGuard({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [recoveryDone, setRecoveryDone] = useState(false);
  const isLoading = !recoveryDone;
  const timedOut = useGuardLoadingTimeout(isLoading, 'Site00AccountRouteGuard');
  const cloudPreview = isSite00CloudPreviewBuild();
  const signInHref = site00SignInHrefWithReturnTo(location);

  useEffect(() => {
    if (cloudPreview) {
      finishLocalAuthRecovery();
      setRecoveryDone(true);
      return;
    }

    if (!isSupabaseConfigured()) {
      finishLocalAuthRecovery();
      setRecoveryDone(true);
      return;
    }
    const client = getSupabase();
    if (!client) {
      finishLocalAuthRecovery();
      setRecoveryDone(true);
      return;
    }
    const supabase = client;
    let cancelled = false;

    async function run() {
      if (shouldAttemptServerRestoreNow()) {
        const restored = await promiseWithTimeout(tryServerSessionRestore().catch(() => false), AUTH_STEP_TIMEOUT_MS, false);
        if (cancelled) return;
        if (restored) {
          setRecoveryDone(true);
          return;
        }
      }

      let { data: { session } } = await promiseWithTimeout(
        supabase.auth.getSession(),
        AUTH_STEP_TIMEOUT_MS,
        { data: { session: null }, error: null },
      );
      if (cancelled) return;
      if (!session) {
        try {
          const { data } = await promiseWithTimeout(
            supabase.auth.refreshSession(),
            AUTH_STEP_TIMEOUT_MS,
            { data: { user: null, session: null }, error: null },
          );
          if (data?.session) session = data.session;
        } catch {
          /* ignore */
        }
        if (cancelled) return;
      }
      if (!session) {
        const restored = await promiseWithTimeout(tryServerSessionRestore().catch(() => false), AUTH_STEP_TIMEOUT_MS, false);
        if (cancelled) return;
        if (restored) {
          setRecoveryDone(true);
          return;
        }
        finishLocalAuthRecovery();
        setRecoveryDone(true);
        return;
      }
      if (await promiseWithTimeout(signOutIfSessionEmailUnconfirmed(supabase, session), AUTH_STEP_TIMEOUT_MS, false)) {
        setRecoveryDone(true);
        return;
      }
      const profile = await promiseWithTimeout(syncAllFromApi(), AUTH_STEP_TIMEOUT_MS, null);
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
          await promiseWithTimeout(
            patchProfile(buildProfilePayloadForBackend(minimal)).catch(() => undefined),
            AUTH_STEP_TIMEOUT_MS,
            undefined,
          );
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
  }, [cloudPreview]);

  if (timedOut && isLoading) {
    return (
      <GuardLoadingRecovery
        guard="Site00AccountRouteGuard"
        detail="CTRL ROOM SESSION RESTORE DID NOT COMPLETE. TRY RELOAD OR SIGN IN AGAIN."
        onRetry={() => setRecoveryDone(false)}
      />
    );
  }

  if (!recoveryDone) {
    return (
      <div className="site00-ctrl-room-loading" role="status" aria-live="polite">
        <p>ASSEMBLING CTRL ROOM…</p>
        {cloudPreview ? <small className="site00-ctrl-room-loading__hint">CLOUD PREVIEW · CHECKING LOCAL SESSION</small> : null}
      </div>
    );
  }

  if (!isSignedIn()) {
    if (cloudPreview) {
      return (
        <div className="site00-ctrl-room-loading site00-ctrl-room-loading--sign-in" role="status" aria-live="polite">
          <p>SIGN IN REQUIRED FOR THIS ROUTE</p>
          <Link className="site00-ctrl-room-loading__cta" to={signInHref}>
            GO TO SIGN IN →
          </Link>
        </div>
      );
    }
    return <Navigate to={signInHref} replace />;
  }

  return <>{children}</>;
}
