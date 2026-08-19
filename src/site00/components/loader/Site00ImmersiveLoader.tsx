import { useCallback, useEffect, useState } from 'react';
import type { Site00ImmersiveLoaderConfig, Site00LoaderState } from './site00LoaderConfig';
import {
  isLoaderAnimationEnabled,
  isLoaderDebugEnabled,
  isLoaderMediaDebugEnabled,
} from './site00LoaderHeroStage';
import { teardownSite00AsstsBootShell } from './site00LoaderBoot';
import { LoaderCopyRegions } from './LoaderCopyRegions';
import { LoaderCompositionProvider } from './LoaderCompositionContext';
import { LoaderReferenceMapDebug } from './LoaderReferenceMapDebug';
import { LoaderReferenceOverlay } from './LoaderReferenceOverlay';
import { LoaderRegion } from './LoaderRegion';
import { loaderLifecycleLog } from './loaderLifecycleLog';
import { Site00LoaderAnimation } from './Site00LoaderAnimation';
import { Site00LoaderEnvironment } from './Site00LoaderEnvironment';
import type { LoaderPresentation } from './loader-composition-resolver';
import { resolveSite00LoaderBackgroundUrl, resolveSite00LoaderBackgroundFocal, resolveSite00LoaderAnimationFocal } from './site00LoaderMedia';
import { preloadSite00LoaderBackground } from './site00LoaderPreload';
import { useLoaderMediaPresentation } from './useLoaderMediaPresentation';
import { useLoaderPresentation } from './useLoaderPresentation';
import '../../styles/site00-loader.css';

export type Site00ImmersiveLoaderPhase = 'loading' | 'complete-hold' | 'exiting';

type Site00ImmersiveLoaderProps = {
  config: Site00ImmersiveLoaderConfig;
  progress: number;
  statusLabel: string;
  loaderState?: Site00LoaderState;
  isComplete?: boolean;
  phase?: Site00ImmersiveLoaderPhase;
  reducedMotion?: boolean;
  onAnimationReady?: () => void;
  onExitComplete?: () => void;
  error?: boolean;
  onRetry?: () => void;
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
  statusLabel: _statusLabel,
  loaderState: _loaderState = 'BOOTSTRAP',
  isComplete = false,
  phase = 'loading',
  reducedMotion: reducedMotionProp,
  onAnimationReady,
  onExitComplete,
  error = false,
  onRetry,
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

  useEffect(() => {
    loaderLifecycleLog('LOADER_MOUNTED', { path: window.location.pathname, uiPresentation, mediaPresentation });
    loaderLifecycleLog('BACKGROUND_SOURCE_RESOLVED', { url: backgroundUrl, mediaPresentation });
    return () => {
      loaderLifecycleLog('LOADER_UNMOUNTED');
    };
  }, [backgroundUrl, uiPresentation, mediaPresentation]);

  const handleBootHandoff = useCallback(() => {
    loaderLifecycleLog('BACKGROUND_LOADED');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        teardownSite00AsstsBootShell();
      });
    });
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

  const handleAnimationReady = () => {
    loaderLifecycleLog('ANIMATION_CANPLAY');
    onAnimationReady?.();
  };

  const handleAnimationError = (detail: unknown) => {
    loaderLifecycleLog('ANIMATION_ERROR', detail);
  };

  useEffect(() => {
    if (phase !== 'exiting') return;
    const t = window.setTimeout(() => onExitComplete?.(), 720);
    return () => window.clearTimeout(t);
  }, [phase, onExitComplete]);

  const atComplete = isComplete || phase === 'complete-hold' || progress >= 100;
  const progressLabel = error ? 'RETRY REQUIRED' : atComplete ? config.completionMessage : config.assemblingLabel;

  const rootClass = [
    'site00-immersive-loader',
    uiPresentation === 'desktop' ? 'site00-immersive-loader--desktop' : 'site00-immersive-loader--mobile',
    mediaPresentation === 'desktop' ? 'site00-immersive-loader--media-desktop' : 'site00-immersive-loader--media-mobile',
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
      <div
        className="site00-immersive-loader__media"
        aria-hidden="true"
        style={{
          ['--site00-loader-bg-focal' as string]: backgroundFocal,
          ['--site00-loader-animation-focal' as string]: animationFocal,
        }}
      >
        <Site00LoaderEnvironment
          backgroundUrl={backgroundUrl}
          viewport
          fit={envFit}
          mediaFocal={backgroundFocal}
          onBackgroundLoad={handleBootHandoff}
        />

        {animationEnabled ? (
          <Site00LoaderAnimation
            mediaPresentation={mediaPresentation}
            mediaFocal={animationFocal}
            reducedMotion={reducedMotion}
            onReady={handleAnimationReady}
            onError={handleAnimationError}
          />
        ) : null}
      </div>

      <LoaderCompositionProvider presentation={uiPresentation}>
        {debug ? (
          <LoaderRegion id="pedestal" className="site00-loader-pedestal-debug" aria-hidden="true" />
        ) : null}

        <LoaderCopyRegions
          siteLabel={config.siteLabel}
          title={error ? 'BUILD INTERRUPTED' : config.experienceTitle}
          subtitle={error ? "WE COULDN'T COMPLETE THIS STEP" : config.experienceSubtitle}
          tagline={config.tagline}
          footerMark={config.footerMark}
          footerLabel={config.footerLabel}
          progress={error ? 0 : progress}
          progressLabel={progressLabel}
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
