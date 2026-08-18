import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { acquireLoadingScreenDocumentLock } from '../../../platform-stabilization/loadingScreenLock';
import { Site00ImmersiveLoader, type Site00ImmersiveLoaderPhase } from './Site00ImmersiveLoader';
import { initSite00ImmersiveLoaderBoot, teardownSite00ImmersiveBootShell } from './site00LoaderBoot';
import { resolveSite00ImmersiveLoaderConfig } from './site00LoaderConfig';
import { preloadSite00LoaderAnimation, preloadSite00LoaderBackground } from './site00LoaderPreload';
import { resolveSite00LoaderGeometryPreloadUrl } from './site00LoaderBootstrap';
import { loaderLifecycleLog } from './loaderLifecycleLog';
import {
  markSite00ImmersiveComplete,
  shouldShowSite00ImmersiveLoader,
} from './site00LoaderSession';
import { isSite00SignInPath } from './site00LoaderPaths';
import { useSite00LoaderProgress } from './useSite00LoaderProgress';

const COMPLETE_HOLD_MS = 680;
const MIN_CINEMATIC_MS = 4200;
const MIN_GEOMETRY_PLAY_MS = 2800;

initSite00ImmersiveLoaderBoot();

/**
 * Cinematic cold-start gate for SITE 00 world routes (Origin, Enter, IDNTY, BLDR, …).
 * Loader ALWAYS mounts immediately — animation readiness never blocks the shell.
 */
export function Site00WorldColdStartGate({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const skipForRoute =
    isSite00SignInPath(pathname) || pathname === '/control' || pathname.startsWith('/control/');
  const immersive = !skipForRoute && shouldShowSite00ImmersiveLoader();
  const [phase, setPhase] = useState<Site00ImmersiveLoaderPhase>(immersive ? 'loading' : 'exiting');
  const [revealed, setRevealed] = useState(!immersive);
  const startedAt = useRef(Date.now());
  const geometryReadyAt = useRef<number | null>(null);
  const geometryReadyRef = useRef(false);
  const config = resolveSite00ImmersiveLoaderConfig(pathname);
  const { progress, statusLabel, loaderState, isComplete, completeStage, forceComplete } = useSite00LoaderProgress(
    config.stages,
    config.completionMessage,
  );

  const handleAnimationReady = useCallback(() => {
    if (geometryReadyRef.current) return;
    geometryReadyRef.current = true;
    geometryReadyAt.current = Date.now();
  }, []);

  useEffect(() => {
    if (!immersive || revealed) return;
    return acquireLoadingScreenDocumentLock();
  }, [immersive, revealed]);

  useEffect(() => {
    if (!immersive) {
      loaderLifecycleLog('ROUTE_COMPLETE', { skipped: true });
      markSite00ImmersiveComplete();
      teardownSite00ImmersiveBootShell();
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      try {
        completeStage('bootstrap');
        void preloadSite00LoaderBackground(config.backgroundUrl);
        if (cancelled) return;
        completeStage('preparing');

        const geometryUrl = await resolveSite00LoaderGeometryPreloadUrl();
        void preloadSite00LoaderAnimation(geometryUrl);
        if (cancelled) return;
        completeStage('assemble');

        const geometryWaitStart = Date.now();
        while (!geometryReadyRef.current && Date.now() - geometryWaitStart < 8000) {
          if (cancelled) return;
          await sleep(50);
        }

        const geometryStartedAt = geometryReadyAt.current ?? Date.now();
        const geometryElapsed = Date.now() - geometryStartedAt;
        if (geometryElapsed < MIN_GEOMETRY_PLAY_MS) {
          await sleep(MIN_GEOMETRY_PLAY_MS - geometryElapsed);
        }
        if (cancelled) return;

        const elapsed = Date.now() - startedAt.current;
        if (elapsed < MIN_CINEMATIC_MS) {
          await sleep(MIN_CINEMATIC_MS - elapsed);
        }
        if (cancelled) return;

        completeStage('ready');
        forceComplete();
        setPhase('complete-hold');
        loaderLifecycleLog('ROUTE_COMPLETE');
        await sleep(COMPLETE_HOLD_MS);
        if (cancelled) return;

        setPhase('exiting');
      } catch (err) {
        loaderLifecycleLog('ROUTE_COMPLETE', { error: err });
        if (cancelled) return;
        completeStage('ready');
        forceComplete();
        setPhase('complete-hold');
        await sleep(COMPLETE_HOLD_MS);
        if (cancelled) return;
        setPhase('exiting');
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [immersive, completeStage, forceComplete, config.backgroundUrl]);

  const handleExitComplete = () => {
    markSite00ImmersiveComplete();
    teardownSite00ImmersiveBootShell();
    setRevealed(true);
  };

  if (revealed) return <>{children}</>;

  const overlay = (
    <Site00ImmersiveLoader
      config={config}
      progress={progress}
      statusLabel={statusLabel}
      loaderState={loaderState}
      isComplete={isComplete}
      phase={phase}
      onAnimationReady={handleAnimationReady}
      onExitComplete={handleExitComplete}
    />
  );

  if (typeof document === 'undefined') return overlay;
  return createPortal(overlay, document.body);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
