import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Outlet } from 'react-router-dom';
import { acquireLoadingScreenDocumentLock } from '../../../platform-stabilization/loadingScreenLock';
import { ASSTS_IMMERSIVE_LOADER_CONFIG } from '../../components/loader/site00LoaderConfig';
import { resolveSite00LoaderBackgroundUrl, resolveSite00LoaderMediaPresentation } from '../../components/loader/site00LoaderMedia';
import { Site00ImmersiveLoader, type Site00ImmersiveLoaderPhase } from '../../components/loader/Site00ImmersiveLoader';
import { initSite00ImmersiveLoaderBoot, releaseSite00ImmersiveBootRoot, teardownSite00ImmersiveBootShell, waitForLoaderExitPaint } from '../../components/loader/site00LoaderBoot';
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
import { advanceLoaderStagesFromTasks, waitForLoaderAnimationOpeningHold, waitForLoaderAnimationStart, waitForOpeningFrameHold } from '../../components/loader/loaderProgressTimeline';
import { preloadAsstsLibraryPage } from '../../components/loader/site00LoaderRoutePreload';
import {
  SITE00_LOADER_MIN_OPENING_HOLD_MS,
  SITE00_LOADER_OPENING_HOLD_TIMEOUT_MS,
} from '../../components/loader/site00LoaderAnimationPlayback';
import { Site00TypographyBootstrap } from '../../components/Site00TypographyBootstrap';
import { ASSTS_ENVIRONMENT_SLOTS } from '../config/slots';
import { fetchAsstsLibrary, primeAsstsLibraryCache, resolveAsstsSlot } from '../services/asstsApi';

const COMPLETE_HOLD_MS = 680;

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
  const [pageUnderlayReady, setPageUnderlayReady] = useState(!immersive);
  const geometryReadyAt = useRef<number | null>(null);
  const geometryReadyRef = useRef(false);
  const openingHoldRef = useRef(false);
  const openingHoldAt = useRef<number | null>(null);
  const config = ASSTS_IMMERSIVE_LOADER_CONFIG;
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
        const backgroundTask = preloadSite00LoaderBackground(
          resolveSite00LoaderBackgroundUrl(resolveSite00LoaderMediaPresentation()),
        );
        const geometryUrl = await resolveSite00LoaderGeometryPreloadUrl();
        const animationTask = preloadSite00LoaderAnimation(geometryUrl);
        const pageTask = preloadAsstsLibraryPage();

        const libraryTask = withTimeout(fetchAsstsLibrary(), BOOTSTRAP_API_TIMEOUT_MS, 'library').catch(
          () => null,
        );
        const slotTask = withTimeout(
          resolveAsstsSlot(ASSTS_ENVIRONMENT_SLOTS.library),
          BOOTSTRAP_API_TIMEOUT_MS,
          'slot',
        ).catch(() => null);

        await waitForGeometryReady(() => geometryReadyRef.current);
        if (cancelled) return;

        await advanceLoaderStagesFromTasks(
          [
            { stageId: 'bootstrap', task: backgroundTask },
            { stageId: 'preparing', task: animationTask },
            { stageId: 'connect', task: libraryTask },
            { stageId: 'resolve', task: slotTask },
            { stageId: 'assemble', task: pageTask },
          ],
          completeStage,
          () => cancelled,
        );
        if (cancelled) return;

        const library = await libraryTask;
        if (library) primeAsstsLibraryCache(library);

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
        await sleep(COMPLETE_HOLD_MS);
        if (cancelled) return;

        releaseSite00ImmersiveBootRoot();
        setPageUnderlayReady(true);
        await waitForLoaderExitPaint();
        if (cancelled) return;

        setPhase('exiting');
      } catch {
        if (cancelled) return;
        completeStage('ready');
        forceComplete();
        setPhase('complete-hold');
        await sleep(COMPLETE_HOLD_MS);
        if (cancelled) return;
        releaseSite00ImmersiveBootRoot();
        setPageUnderlayReady(true);
        await waitForLoaderExitPaint();
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

  const underlay = pageUnderlayReady ? (
    <>
      <Site00TypographyBootstrap />
      <Outlet />
    </>
  ) : null;

  const overlay = (
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
  );

  if (typeof document === 'undefined') {
    return (
      <>
        {underlay}
        {overlay}
      </>
    );
  }

  return (
    <>
      {underlay}
      {createPortal(overlay, document.body)}
    </>
  );
}
