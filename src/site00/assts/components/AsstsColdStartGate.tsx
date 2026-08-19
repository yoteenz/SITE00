import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Outlet } from 'react-router-dom';
import { acquireLoadingScreenDocumentLock } from '../../../platform-stabilization/loadingScreenLock';
import { ASSTS_IMMERSIVE_LOADER_CONFIG } from '../../components/loader/site00LoaderConfig';
import { resolveSite00LoaderBackgroundUrl, resolveSite00LoaderMediaPresentation } from '../../components/loader/site00LoaderMedia';
import { Site00ImmersiveLoader, type Site00ImmersiveLoaderPhase } from '../../components/loader/Site00ImmersiveLoader';
import { initSite00ImmersiveLoaderBoot, teardownSite00ImmersiveBootShell } from '../../components/loader/site00LoaderBoot';
import { resolveSite00LoaderGeometryPreloadUrl } from '../../components/loader/site00LoaderBootstrap';
import {
  preloadSite00LoaderAnimation,
  preloadSite00LoaderBackground,
} from '../../components/loader/site00LoaderPreload';
import {
  markSite00ImmersiveComplete,
  shouldShowSite00ImmersiveLoader,
} from '../../components/loader/site00LoaderSession';
import { useSite00LoaderProgress } from '../../components/loader/useSite00LoaderProgress';
import { runLoaderStageTimeline, waitForLoaderAnimationStart } from '../../components/loader/loaderProgressTimeline';
import { Site00TypographyBootstrap } from '../../components/Site00TypographyBootstrap';
import { ASSTS_ENVIRONMENT_SLOTS } from '../config/slots';
import { fetchAsstsLibrary, primeAsstsLibraryCache, resolveAsstsSlot } from '../services/asstsApi';

const COMPLETE_HOLD_MS = 680;
/** Minimum time the immersive loader stays visible from cold-start gate mount. */
const MIN_CINEMATIC_MS = 4200;
/** After geometry is painted, keep the loop running at least this long. */
const MIN_GEOMETRY_PLAY_MS = 2800;

initSite00ImmersiveLoaderBoot();

function waitForGeometryReady(getReady: () => boolean, timeoutMs = 8000): Promise<void> {
  return waitForLoaderAnimationStart(getReady, timeoutMs);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timeoutId = 0;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = window.setTimeout(() => reject(new Error(`${label} timed out`)), ms);
      }),
    ]);
  } finally {
    window.clearTimeout(timeoutId);
  }
}

const BOOTSTRAP_API_TIMEOUT_MS = 10000;

/**
 * Cold-start gate for ASSTS — full immersive Asset Vault loader on first session entry.
 * Loader media is boot-critical (same-origin) and does NOT wait on ASSTS API resolution.
 */
export function AsstsColdStartGate() {
  const immersive = shouldShowSite00ImmersiveLoader();
  const [phase, setPhase] = useState<Site00ImmersiveLoaderPhase>(immersive ? 'loading' : 'exiting');
  const [revealed, setRevealed] = useState(!immersive);
  const geometryReadyAt = useRef<number | null>(null);
  const geometryReadyRef = useRef(false);
  const config = ASSTS_IMMERSIVE_LOADER_CONFIG;
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
      markSite00ImmersiveComplete();
      teardownSite00ImmersiveBootShell();
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      try {
        void import('../pages/LibraryPage');

        await preloadSite00LoaderBackground(
          resolveSite00LoaderBackgroundUrl(resolveSite00LoaderMediaPresentation()),
        );
        if (cancelled) return;

        const geometryUrl = await resolveSite00LoaderGeometryPreloadUrl();
        const geometryPromise = preloadSite00LoaderAnimation(geometryUrl);

        const libraryPromise = withTimeout(fetchAsstsLibrary(), BOOTSTRAP_API_TIMEOUT_MS, 'library').catch(
          () => null,
        );
        const slotPromise = withTimeout(
          resolveAsstsSlot(ASSTS_ENVIRONMENT_SLOTS.library),
          BOOTSTRAP_API_TIMEOUT_MS,
          'slot',
        ).catch(() => null);

        const [library] = await Promise.all([libraryPromise, slotPromise]);
        if (cancelled) return;
        if (library) primeAsstsLibraryCache(library);

        await geometryPromise;
        if (cancelled) return;

        await waitForGeometryReady(() => geometryReadyRef.current);
        if (cancelled) return;

        const animationStartedAt = geometryReadyAt.current ?? Date.now();
        await runLoaderStageTimeline({
          stageIds: ['bootstrap', 'preparing', 'connect', 'resolve', 'assemble'],
          completeStage,
          animationStartedAt,
          minGeometryPlayMs: MIN_GEOMETRY_PLAY_MS,
          minCinematicMs: MIN_CINEMATIC_MS,
          isCancelled: () => cancelled,
        });
        if (cancelled) return;

        completeStage('ready');
        forceComplete();
        setPhase('complete-hold');
        await sleep(COMPLETE_HOLD_MS);
        if (cancelled) return;

        setPhase('exiting');
      } catch {
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
  }, [immersive, completeStage, forceComplete]);

  const handleExitComplete = () => {
    markSite00ImmersiveComplete();
    teardownSite00ImmersiveBootShell();
    setRevealed(true);
  };

  if (revealed) {
    return (
      <>
        <Site00TypographyBootstrap />
        <Outlet />
      </>
    );
  }

  const overlay = (
    <>
      <Site00TypographyBootstrap />
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
    </>
  );

  if (typeof document === 'undefined') return overlay;
  return createPortal(overlay, document.body);
}
