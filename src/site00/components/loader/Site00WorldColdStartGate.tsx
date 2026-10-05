import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import {
  dispatchSite00ForceRevealLoader,
  shouldBypassImmersiveColdStartGate,
  SITE00_FORCE_REVEAL_LOADER_EVENT,
} from './site00ForceRevealAfterMount';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { acquireLoadingScreenDocumentLock } from '../../../platform-stabilization/loadingScreenLock';
import { Site00ImmersiveLoader, type Site00ImmersiveLoaderPhase } from './Site00ImmersiveLoader';
import { initSite00ImmersiveLoaderBoot, releaseSite00ImmersiveBootRoot, teardownSite00ImmersiveBootShell, waitForLoaderExitPaint } from './site00LoaderBoot';
import { resolveSite00ImmersiveLoaderConfig } from './site00LoaderConfig';
import { preloadSite00LoaderAnimation, preloadSite00LoaderBackground } from './site00LoaderPreload';
import { resolveSite00LoaderGeometryPreloadUrl } from './site00LoaderBootstrap';
import { resolveSite00LoaderBackgroundUrl, resolveSite00LoaderMediaPresentation } from './site00LoaderMedia';
import { loaderLifecycleLog } from './loaderLifecycleLog';
import {
  markSite00ImmersiveComplete,
  purgeSite00ImmersiveLoaderDomAfterGateReveal,
  shouldShowSite00ImmersiveLoader,
} from './site00LoaderSession';
import { isSite00LoaderPreviewPath, isSite00SignInPath, isSite00PublicHubPath } from './site00LoaderPaths';
import {
  advanceLoaderStagesFromTasks,
  waitForLoaderAnimationOpeningHold,
  waitForLoaderAnimationStart,
  waitForOpeningFrameHold,
} from './loaderProgressTimeline';
import { preloadSite00RoutePage } from './site00LoaderRoutePreload';
import { useSite00LoaderProgress } from './useSite00LoaderProgress';
import {
  SITE00_LOADER_MIN_OPENING_HOLD_MS,
  SITE00_LOADER_OPENING_HOLD_TIMEOUT_MS,
} from './site00LoaderAnimationPlayback';

const COMPLETE_HOLD_MS = 680;
/** Never leave founder on cinematic loader past this wall clock (mobile networks, cancelled bootstrap). */
const LOADER_WALL_CLOCK_FAILSAFE_MS = 6_000;
const LOADER_EXIT_BACKUP_MS = 900;

initSite00ImmersiveLoaderBoot();

/**
 * Cinematic cold-start gate for SITE 00 world routes (Origin, Enter, IDNTY, BLDR, …).
 * Loader ALWAYS mounts immediately — animation readiness never blocks the shell.
 */
export function Site00WorldColdStartGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const skipForRoute =
    isSite00LoaderPreviewPath(pathname) ||
    isSite00SignInPath(pathname) ||
    isSite00PublicHubPath(pathname) ||
    pathname === '/control' ||
    pathname.startsWith('/control/');
  const bypassColdStart = shouldBypassImmersiveColdStartGate();
  const immersive = !bypassColdStart && !skipForRoute && shouldShowSite00ImmersiveLoader();
  const [phase, setPhase] = useState<Site00ImmersiveLoaderPhase>(immersive ? 'loading' : 'exiting');
  const [revealed, setRevealed] = useState(!immersive);
  const [pageUnderlayReady, setPageUnderlayReady] = useState(!immersive);
  const geometryReadyAt = useRef<number | null>(null);
  const geometryReadyRef = useRef(false);
  const openingHoldRef = useRef(false);
  const openingHoldAt = useRef<number | null>(null);
  const config = resolveSite00ImmersiveLoaderConfig(pathname);
  const { progress, smoothProgress, stageSubtitle, loaderState, isComplete, completeStage, forceComplete } = useSite00LoaderProgress(
    config.stages,
    config.completionMessage,
  );

  const handleAnimationReady = useCallback(() => {
    if (geometryReadyRef.current) return;
    geometryReadyRef.current = true;
    geometryReadyAt.current = Date.now();
  }, []);

  const handleAnimationOpeningHold = useCallback(() => {
    if (openingHoldRef.current) return;
    openingHoldRef.current = true;
    openingHoldAt.current = Date.now();
  }, []);

  const forceRevealApp = useCallback((reason: string) => {
    loaderLifecycleLog('ROUTE_COMPLETE', { forceReveal: reason });
    markSite00ImmersiveComplete();
    releaseSite00ImmersiveBootRoot();
    teardownSite00ImmersiveBootShell();
    setPageUnderlayReady(true);
    setPhase('exiting');
    setRevealed(true);
  }, []);

  const handleExitComplete = useCallback(() => {
    forceRevealApp('exit-animation');
  }, [forceRevealApp]);

  useLayoutEffect(() => {
    if (bypassColdStart) {
      forceRevealApp('preview-tunnel-bypass');
    }
  }, [bypassColdStart, forceRevealApp]);

  useEffect(() => {
    if (!immersive || revealed) return;
    return acquireLoadingScreenDocumentLock();
  }, [immersive, revealed]);

  useLayoutEffect(() => {
    if (immersive) return;
    releaseSite00ImmersiveBootRoot();
    teardownSite00ImmersiveBootShell();
  }, [immersive]);

  useLayoutEffect(() => {
    if (!revealed) return;
    purgeSite00ImmersiveLoaderDomAfterGateReveal('gate-revealed');
  }, [revealed]);

  useEffect(() => {
    if (!immersive) {
      loaderLifecycleLog('ROUTE_COMPLETE', { skipped: true });
      markSite00ImmersiveComplete();
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      try {
        const mediaPresentation = resolveSite00LoaderMediaPresentation();
        const backgroundTask = preloadSite00LoaderBackground(
          resolveSite00LoaderBackgroundUrl(mediaPresentation),
        );
        const geometryUrl = await resolveSite00LoaderGeometryPreloadUrl();
        const animationTask = preloadSite00LoaderAnimation(geometryUrl);
        const pageTask = preloadSite00RoutePage(pathname);

        await waitForLoaderAnimationStart(() => geometryReadyRef.current);
        if (cancelled) return;

        // Stages advance when each backing preload settles (not timers).
        await advanceLoaderStagesFromTasks(
          [
            { stageId: 'bootstrap', task: backgroundTask },
            { stageId: 'preparing', task: animationTask },
            { stageId: 'connect', task: Promise.resolve() },
            { stageId: 'assemble', task: pageTask },
          ],
          completeStage,
          () => cancelled,
        );
        if (cancelled) return;

        await waitForLoaderAnimationOpeningHold(
          () => openingHoldRef.current,
          SITE00_LOADER_OPENING_HOLD_TIMEOUT_MS,
        );
        if (cancelled) return;

        await waitForOpeningFrameHold(
          openingHoldAt.current ?? Date.now(),
          SITE00_LOADER_MIN_OPENING_HOLD_MS,
          () => cancelled,
        );
        if (cancelled) return;

        completeStage('ready');
        forceComplete();
        setPhase('complete-hold');
        loaderLifecycleLog('ROUTE_COMPLETE');
        await sleep(COMPLETE_HOLD_MS);
        if (cancelled) return;

        await waitForLoaderExitPaint();
        if (cancelled) return;

        forceRevealApp('bootstrap-complete');
      } catch (err) {
        loaderLifecycleLog('ROUTE_COMPLETE', { error: err });
        if (cancelled) return;
        completeStage('ready');
        forceComplete();
        setPhase('complete-hold');
        await sleep(COMPLETE_HOLD_MS);
        if (cancelled) return;
        await waitForLoaderExitPaint();
        if (cancelled) return;
        forceRevealApp('bootstrap-error');
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [immersive, pathname, completeStage, forceComplete, forceRevealApp]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onForce = (ev: Event) => {
      const reason =
        (ev as CustomEvent<{ reason?: string }>).detail?.reason ?? 'external-force-reveal';
      forceRevealApp(reason);
    };
    window.addEventListener(SITE00_FORCE_REVEAL_LOADER_EVENT, onForce);
    return () => window.removeEventListener(SITE00_FORCE_REVEAL_LOADER_EVENT, onForce);
  }, [forceRevealApp]);

  useEffect(() => {
    if (phase !== 'exiting' || revealed) return;
    const backup = window.setTimeout(() => forceRevealApp('exit-backup-timer'), LOADER_EXIT_BACKUP_MS);
    return () => window.clearTimeout(backup);
  }, [phase, revealed, forceRevealApp]);

  useEffect(() => {
    if (!immersive || revealed) return;
    const failsafe = window.setTimeout(() => {
      dispatchSite00ForceRevealLoader('wall-clock-failsafe');
      forceRevealApp('wall-clock-failsafe');
    }, LOADER_WALL_CLOCK_FAILSAFE_MS);
    return () => window.clearTimeout(failsafe);
  }, [immersive, revealed, forceRevealApp]);

  if (revealed) return <>{children}</>;

  if (typeof document === 'undefined') {
    return (
      <>
        {pageUnderlayReady ? children : null}
        <Site00ImmersiveLoader
          config={config}
          progress={progress}
          smoothProgress={smoothProgress}
          stageSubtitle={stageSubtitle}
          loaderState={loaderState}
          isComplete={isComplete}
          phase={phase}
          onAnimationReady={handleAnimationReady}
          onAnimationOpeningHold={handleAnimationOpeningHold}
          onExitComplete={handleExitComplete}
        />
      </>
    );
  }

  return (
    <>
      {pageUnderlayReady ? children : null}
      {createPortal(
        <Site00ImmersiveLoader
          config={config}
          progress={progress}
          smoothProgress={smoothProgress}
          stageSubtitle={stageSubtitle}
          loaderState={loaderState}
          isComplete={isComplete}
          phase={phase}
          onAnimationReady={handleAnimationReady}
          onAnimationOpeningHold={handleAnimationOpeningHold}
          onExitComplete={handleExitComplete}
        />,
        document.body,
      )}
    </>
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
