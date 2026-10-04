import { useEffect, useState, type ReactNode } from 'react';
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
import { getAccessToken } from '../../../utils/api';
import { registerServerSessionCookie } from '../../../utils/sessionRestore';
import { tryServerSessionRestore } from '../../../utils/sessionRestore';
import { site00SignInHrefWithReturnTo } from '../../config/mobile-directory-nav';
import { GuardLoadingRecovery } from '../../../platform-stabilization/GuardLoadingRecovery';
import { useGuardLoadingTimeout } from '../../../platform-stabilization/useGuardLoadingTimeout';
import { promiseWithTimeout } from '../../../platform-stabilization/promiseWithTimeout';
import { isSite00CloudPreviewBuild } from '../loader/site00PreviewHost';
import { isSite00SignInPaused } from '../../config/signInPaused';
import { Site00ShellAuthProvider } from '../../auth/Site00ShellAuthContext';
import {
  isSite00EcPreviewGuestFeatureActive,
  isSite00PreviewGuestAllowlistedPath,
} from '../../auth/site00ShellAuthState';

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

function previewGuestAllowedForRoute(
  pathname: string,
  flags: { allowExperienceCompilerPreviewGuest: boolean; allowStudioPreviewGuestLanding: boolean },
): boolean {
  if (!isSite00EcPreviewGuestFeatureActive() || !isSite00PreviewGuestAllowlistedPath(pathname)) {
    return false;
  }
  if (flags.allowExperienceCompilerPreviewGuest && /\/experience-compiler\/?$/.test(pathname)) {
    return true;
  }
  if (flags.allowStudioPreviewGuestLanding && /\/preview-guest\/?$/.test(pathname)) {
    return true;
  }
  return false;
}

/** Protects SITE 00 CTRL ROOM — redirects to SITE 00 sign-in when signed out. */
export function Site00AccountRouteGuard({
  children,
  allowExperienceCompilerPreviewGuest = false,
  allowStudioPreviewGuestLanding = false,
}: {
  children: React.ReactNode;
  /** Cloud preview/tunnel only — unsigned MAP2 workspace while Supabase is down (temporary). */
  allowExperienceCompilerPreviewGuest?: boolean;
  /** Cloud preview/tunnel only — minimal Studio parent for ← STUDIO navigation. */
  allowStudioPreviewGuestLanding?: boolean;
}) {
  const location = useLocation();
  const [recoveryDone, setRecoveryDone] = useState(false);
  const [apiTokenReady, setApiTokenReady] = useState<boolean | null>(null);
  const isLoading = !recoveryDone;
  const timedOut = useGuardLoadingTimeout(isLoading, 'Site00AccountRouteGuard');
  const cloudPreview = isSite00CloudPreviewBuild();
  const previewGuestRoute = previewGuestAllowedForRoute(location.pathname, {
    allowExperienceCompilerPreviewGuest,
    allowStudioPreviewGuestLanding,
  });
  const signInHref = site00SignInHrefWithReturnTo(location);

  const goldenDiffCapture =
    typeof window !== 'undefined' &&
    new URLSearchParams(location.search).get('goldenDiffCapture') === '1';

  const designPreviewCapture =
    typeof window !== 'undefined' &&
    new URLSearchParams(location.search).get('designPreview') === '1';

  const allowUnauthenticatedCaptureSurface = goldenDiffCapture || designPreviewCapture;

  useEffect(() => {
    if (isSite00SignInPaused() || designPreviewCapture || goldenDiffCapture) {
      finishLocalAuthRecovery();
      setRecoveryDone(true);
      return;
    }

    if (previewGuestRoute) {
      finishLocalAuthRecovery();
      setRecoveryDone(true);
      setApiTokenReady(true);
      return;
    }

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
        const accessToken = await promiseWithTimeout(getAccessToken(), AUTH_STEP_TIMEOUT_MS, null);
        if (cancelled) return;
        if (accessToken) {
          const { data: { session: recovered } } = await promiseWithTimeout(
            supabase.auth.getSession(),
            AUTH_STEP_TIMEOUT_MS,
            { data: { session: null }, error: null },
          );
          if (recovered?.user) {
            const minimal = buildMinimalUserFromSupabaseSession(recovered.user);
            applyMinimalUserToStorage(minimal);
            onSignInSuccess('session_restore');
            registerServerSessionCookie(recovered.access_token, recovered.refresh_token);
            localStorage.setItem('isSignedIn', 'true');
            window.dispatchEvent(new CustomEvent('signInStateChanged', { detail: 'true' }));
            setRecoveryDone(true);
            return;
          }
        }
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
  }, [cloudPreview, designPreviewCapture, goldenDiffCapture, location.search, previewGuestRoute]);

  useEffect(() => {
    if (
      !recoveryDone ||
      isSite00SignInPaused() ||
      cloudPreview ||
      previewGuestRoute ||
      allowUnauthenticatedCaptureSurface ||
      !isSupabaseConfigured()
    ) {
      setApiTokenReady(true);
      return;
    }
    let cancelled = false;
    void getAccessToken().then((token) => {
      if (!cancelled) setApiTokenReady(!!token);
    });
    return () => {
      cancelled = true;
    };
  }, [allowUnauthenticatedCaptureSurface, cloudPreview, goldenDiffCapture, previewGuestRoute, recoveryDone]);

  const shellWrapped = (body: ReactNode) => (
    <Site00ShellAuthProvider
      authLoading={!recoveryDone}
      previewGuestRouteOverride={previewGuestRoute && !isSignedIn()}
    >
      {body}
    </Site00ShellAuthProvider>
  );

  if (timedOut && isLoading) {
    return shellWrapped(
      <GuardLoadingRecovery
        guard="Site00AccountRouteGuard"
        detail="CTRL ROOM SESSION RESTORE DID NOT COMPLETE. TRY RELOAD OR SIGN IN AGAIN."
        onRetry={() => setRecoveryDone(false)}
      />,
    );
  }

  if (!recoveryDone) {
    return shellWrapped(
      <div className="site00-ctrl-room-loading" role="status" aria-live="polite">
        <p>ASSEMBLING CTRL ROOM…</p>
        {cloudPreview ? <small className="site00-ctrl-room-loading__hint">CLOUD PREVIEW · CHECKING LOCAL SESSION</small> : null}
      </div>,
    );
  }

  if (isSite00SignInPaused()) return <>{children}</>;

  if (apiTokenReady === false && isSignedIn() && !allowUnauthenticatedCaptureSurface) {
    return shellWrapped(<Navigate to={signInHref} replace state={{ reason: 'api_session_expired' }} />);
  }

  if (!isSignedIn()) {
    if (allowUnauthenticatedCaptureSurface || previewGuestRoute) {
      return shellWrapped(
        <>
          {previewGuestRoute ? (
            <div
              className="site00-ec-preview-guest-banner"
              role="status"
              style={{
                background: '#1a1a1a',
                color: '#f5c542',
                fontSize: '11px',
                letterSpacing: '0.06em',
                padding: '8px 12px',
                textAlign: 'center',
                borderBottom: '1px solid #333',
              }}
            >
              PREVIEW GUEST · STUDIO OS PREVIEW · SIGN-IN BYPASSED (SUPABASE DOWN) · NOT PRODUCTION
            </div>
          ) : null}
          {children}
        </>,
      );
    }
    if (cloudPreview) {
      return shellWrapped(
        <div className="site00-ctrl-room-loading site00-ctrl-room-loading--sign-in" role="status" aria-live="polite">
          <p>SIGN IN REQUIRED FOR THIS ROUTE</p>
          <Link className="site00-ctrl-room-loading__cta" to={signInHref}>
            GO TO SIGN IN →
          </Link>
        </div>,
      );
    }
    return shellWrapped(<Navigate to={signInHref} replace />);
  }

  return shellWrapped(<>{children}</>);
}
