import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Site00ImmersiveLoaderConfig, Site00LoaderState } from './site00LoaderConfig';
import {
  isLoaderAnimationEnabled,
  isLoaderDebugEnabled,
  isLoaderMediaDebugEnabled,
} from './site00LoaderHeroStage';
import { stripSite00BootShellBackground } from './site00LoaderBoot';
import { ImmersiveLoaderMedia } from './ImmersiveLoaderMedia';
import { LoaderCopyRegions } from './LoaderCopyRegions';
import { LoaderCompositionProvider } from './LoaderCompositionContext';
import { LoaderReferenceMapDebug } from './LoaderReferenceMapDebug';
import { LoaderReferenceOverlay } from './LoaderReferenceOverlay';
import { LoaderRegion } from './LoaderRegion';
import { loaderLifecycleLog } from './loaderLifecycleLog';
import type { LoaderPresentation } from './loader-composition-resolver';
import { resolveSite00LoaderBackgroundUrl, resolveSite00LoaderBackgroundFocal, resolveSite00LoaderAnimationFocal } from './site00LoaderMedia';
import { preloadSite00LoaderBackground } from './site00LoaderPreload';
import { useLoaderMediaPresentation } from './useLoaderMediaPresentation';
import { useLoaderPresentation } from './useLoaderPresentation';
import { resolveActiveStageSubtitle } from './site00LoaderStageSubtitle';
import '../../styles/site00-loader.css';

export type Site00ImmersiveLoaderPhase = 'loading' | 'complete-hold' | 'exiting';

type Site00ImmersiveLoaderProps = {
  config: Site00ImmersiveLoaderConfig;
  progress: number;
  /** Synthetic in-stage creep — drives gray subtitle + bar between milestone jumps. */
  smoothProgress?: number;
  /** Gray subtitle — stage-driven mock work copy. */
  stageSubtitle?: string;
  loaderState?: Site00LoaderState;
  isComplete?: boolean;
  phase?: Site00ImmersiveLoaderPhase;
  reducedMotion?: boolean;
  onAnimationReady?: () => void;
  onExitComplete?: () => void;
  error?: boolean;
  onRetry?: () => void;
  /** Inspect surfaces — reveal copy/progress without waiting for animation playback. */
  forceCopyActive?: boolean;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}
type ImmersiveLoaderBodyProps = Site00ImmersiveLoaderProps & {
  uiPresentation: LoaderPresentation;
  mediaPresentation: LoaderPresentation;
  backgroundUrl: string;
  backgroundFocal: string;
  animationFocal: string;
};

/** Shared loader body — one progress state, presentation-specific composition + background. */
function ImmersiveLoaderBody({
  config,
  progress,
  smoothProgress: smoothProgressProp,
  stageSubtitle,
  loaderState: _loaderState = 'BOOTSTRAP',
  isComplete = false,
  phase = 'loading',
  reducedMotion: reducedMotionProp,
  onAnimationReady,
  onExitComplete,
  error = false,
  onRetry,
  forceCopyActive = false,
  uiPresentation,
  mediaPresentation,
  backgroundUrl,
  backgroundFocal,
  animationFocal,
}: ImmersiveLoaderBodyProps) {
  const systemReducedMotion = usePrefersReducedMotion();
  const reducedMotion = reducedMotionProp ?? systemReducedMotion;
  const debug = isLoaderDebugEnabled();
  const animationEnabled = isLoaderAnimationEnabled();
  const mediaDebug = isLoaderMediaDebugEnabled();
  const [copyActive, setCopyActive] = useState(forceCopyActive || !animationEnabled || reducedMotion);

  useEffect(() => {
    if (forceCopyActive || !animationEnabled || reducedMotion) {
      setCopyActive(true);
    }
  }, [forceCopyActive, animationEnabled, reducedMotion]);

  useEffect(() => {
    if (copyActive || !animationEnabled) return;
    const fallbackMs = 8000;
    const timer = window.setTimeout(() => {
      setCopyActive(true);
      onAnimationReady?.();
    }, fallbackMs);
    return () => window.clearTimeout(timer);
  }, [animationEnabled, copyActive, onAnimationReady]);

  useEffect(() => {
    loaderLifecycleLog('LOADER_MOUNTED', { path: window.location.pathname, uiPresentation, mediaPresentation });
    loaderLifecycleLog('BACKGROUND_SOURCE_RESOLVED', { url: backgroundUrl, mediaPresentation });
    return () => {
      loaderLifecycleLog('LOADER_UNMOUNTED');
    };
  }, [backgroundUrl, uiPresentation, mediaPresentation]);

  const handleBootHandoff = useCallback(() => {
    loaderLifecycleLog('BACKGROUND_LOADED');
    // Hand off boot layer 1 → React static only. Do not release #root until loader exit.
    stripSite00BootShellBackground();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void preloadSite00LoaderBackground(backgroundUrl).then(() => {
      if (!cancelled) loaderLifecycleLog('BACKGROUND_PRELOADED', { mediaPresentation });
    });
    return () => {
      cancelled = true;
    };
  }, [backgroundUrl, mediaPresentation]);

  const handleAnimationReady = useCallback(() => {
    setCopyActive(true);
    loaderLifecycleLog('ANIMATION_CANPLAY');
    onAnimationReady?.();
  }, [onAnimationReady]);

  const handleAnimationError = useCallback((detail: unknown) => {
    loaderLifecycleLog('ANIMATION_ERROR', detail);
  }, []);

  useEffect(() => {
    if (phase !== 'exiting') return;
    const t = window.setTimeout(() => onExitComplete?.(), 720);
    return () => window.clearTimeout(t);
  }, [phase, onExitComplete]);

  const atComplete = isComplete || phase === 'complete-hold' || progress >= 100;
  const progressLabel = error ? 'RETRY REQUIRED' : atComplete ? config.completionMessage : config.assemblingLabel;
  const liveProgress = smoothProgressProp ?? progress;
  const displayProgress = copyActive ? liveProgress : 0;
  const displaySubtitle = useMemo(() => {
    if (error) return "WE COULDN'T COMPLETE THIS STEP";
    if (config.stages.length > 0) {
      return resolveActiveStageSubtitle(config.stages, liveProgress);
    }
    return stageSubtitle || config.experienceSubtitle;
  }, [config.stages, config.experienceSubtitle, error, liveProgress, stageSubtitle]);

  const rootClass = [
    'site00-immersive-loader',
    uiPresentation === 'desktop' ? 'site00-immersive-loader--desktop' : 'site00-immersive-loader--mobile',
    mediaPresentation === 'desktop' ? 'site00-immersive-loader--media-desktop' : 'site00-immersive-loader--media-mobile',
    copyActive ? 'site00-immersive-loader--copy-active' : '',
    phase === 'exiting' ? 'site00-immersive-loader--exiting' : '',
    phase === 'complete-hold' ? 'site00-immersive-loader--complete' : '',
    error ? 'site00-immersive-loader--error' : '',
    debug ? 'site00-immersive-loader--debug' : '',
    mediaDebug ? 'site00-immersive-loader--media-debug' : '',
    animationEnabled ? '' : 'site00-immersive-loader--animation-off',
  ]
    .filter(Boolean)
    .join(' ');

  const envFit = mediaPresentation === 'desktop' ? 'cover-landscape' : 'cover';

  return (
    <div className={rootClass} role="status" aria-live="polite" aria-label={progressLabel}>
      <ImmersiveLoaderMedia
        backgroundUrl={backgroundUrl}
        envFit={envFit}
        backgroundFocal={backgroundFocal}
        animationFocal={animationFocal}
        animationEnabled={animationEnabled}
        mediaPresentation={mediaPresentation}
        reducedMotion={reducedMotion}
        onBackgroundLoad={handleBootHandoff}
        onAnimationReady={handleAnimationReady}
        onAnimationError={handleAnimationError}
      />

      <LoaderCompositionProvider presentation={uiPresentation}>
        {debug ? (
          <LoaderRegion id="pedestal" className="site00-loader-pedestal-debug" aria-hidden="true" />
        ) : null}

        <LoaderCopyRegions
          siteLabel={config.siteLabel}
          title={error ? 'BUILD INTERRUPTED' : config.experienceTitle}
          subtitle={displaySubtitle}
          tagline={config.tagline}
          footerLabel={config.footerLabel}
          progress={error ? 0 : displayProgress}
          progressLabel={copyActive ? progressLabel : ''}
          assemblingActive={copyActive && !error && !atComplete}
        />

        {error && onRetry ? (
          <div className="site00-loader-error-actions">
            <button type="button" className="site00-loader__retry" onClick={onRetry}>
              TRY AGAIN →
            </button>
          </div>
        ) : null}

        {debug ? (
          <>
            <LoaderReferenceOverlay />
            <LoaderReferenceMapDebug />
          </>
        ) : null}
      </LoaderCompositionProvider>
    </div>
  );
}

/**
 * Asset Vault + world immersive loader.
 * Asset Vault (assts): mobile <768px uses portrait master; desktop ≥768px uses landscape master.
 * World loader: always mobile composition (unchanged).
 */
export function Site00ImmersiveLoader(props: Site00ImmersiveLoaderProps) {
  const uiPresentation = useLoaderPresentation(props.config.id);
  const mediaPresentation = useLoaderMediaPresentation();
  const backgroundUrl = resolveSite00LoaderBackgroundUrl(mediaPresentation);
  const backgroundFocal = resolveSite00LoaderBackgroundFocal(mediaPresentation);
  const animationFocal = resolveSite00LoaderAnimationFocal(mediaPresentation);

  return (
    <ImmersiveLoaderBody
      {...props}
      uiPresentation={uiPresentation}
      mediaPresentation={mediaPresentation}
      backgroundUrl={backgroundUrl}
      backgroundFocal={backgroundFocal}
      animationFocal={animationFocal}
    />
  );
}
