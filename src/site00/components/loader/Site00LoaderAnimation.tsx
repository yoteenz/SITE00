import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  resolveSite00LoaderBackgroundFocal,
  resolveSite00LoaderEnvironmentAnimationUrl,
} from './site00LoaderMedia';
import {
  SITE00_LOADER_OPENING_HOLD_FRACTION,
  resolveSite00LoaderOpeningHoldTime,
} from './site00LoaderAnimationPlayback';
import { loaderLifecycleLog } from './loaderLifecycleLog';
import { isLoaderMediaDebugEnabled } from './site00LoaderHeroStage';
import {
  bindSite00LoaderVideoSilentGuards,
  enforceSite00LoaderVideoSilent,
} from './site00LoaderVideoSilent';
import type { LoaderPresentation } from './loader-composition-resolver';

type Site00LoaderAnimationProps = {
  /** Media presentation — selects mobile vs desktop animation asset only. */
  mediaPresentation?: LoaderPresentation;
  /** Cover focal — aligned with static background layer (no play-time crop shift). */
  mediaFocal?: string;
  reducedMotion?: boolean;
  /** Fires once the MP4 begins playback — copy/progress may activate. */
  onPlaying?: () => void;
  onReady?: () => void;
  /** Fires once paused on the opening frame — static layer may strip. */
  onOpeningHold?: () => void;
  onError?: (detail: unknown) => void;
};

/**
 * Full-frame environment animation — Layer 2 above static background.
 * Plays once from frame 0, pauses at the opening frame, and holds until loader exit.
 */
export function Site00LoaderAnimation({
  mediaPresentation = 'mobile',
  mediaFocal = 'center center',
  reducedMotion = false,
  onPlaying,
  onReady,
  onOpeningHold,
  onError,
}: Site00LoaderAnimationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readyRef = useRef(false);
  const playingRef = useRef(false);
  const openingHoldRef = useRef(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [openingHold, setOpeningHold] = useState(false);
  const mediaDebug = isLoaderMediaDebugEnabled();
  const sourceUrl = resolveSite00LoaderEnvironmentAnimationUrl(mediaPresentation);
  const isLegacyLoaderAsset =
    /geometry-v1|kling-v2|assts-loader-geometry/i.test(sourceUrl);

  const signalPlaying = useCallback(() => {
    if (playingRef.current) return;
    playingRef.current = true;
    onPlaying?.();
  }, [onPlaying]);

  const signalReady = useCallback(() => {
    if (readyRef.current) return;
    readyRef.current = true;
    setMediaReady(true);
    loaderLifecycleLog('ANIMATION_PLAYING');
    onReady?.();
  }, [onReady]);

  const holdOpeningFrame = useCallback(
    (video: HTMLVideoElement) => {
      if (openingHoldRef.current) return;
      const holdTime = resolveSite00LoaderOpeningHoldTime(video.duration);
      if (holdTime <= 0) return;

      openingHoldRef.current = true;
      setOpeningHold(true);
      try {
        if (video.currentTime < holdTime - 0.04) {
          video.currentTime = holdTime;
        }
      } catch {
        /* ignore seek errors */
      }
      video.pause();
      enforceSite00LoaderVideoSilent(video);
      loaderLifecycleLog('ANIMATION_OPENING_HOLD', {
        holdTime,
        duration: video.duration,
        fraction: SITE00_LOADER_OPENING_HOLD_FRACTION,
      });
      onOpeningHold?.();
    },
    [onOpeningHold],
  );

  const tryHoldOpeningFromMetadata = useCallback(
    (video: HTMLVideoElement) => {
      if (openingHoldRef.current) return;
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      if (reducedMotion) {
        holdOpeningFrame(video);
        signalPlaying();
        signalReady();
      }
    },
    [holdOpeningFrame, reducedMotion, signalPlaying, signalReady],
  );

  const handleCanPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    enforceSite00LoaderVideoSilent(video);
    tryHoldOpeningFromMetadata(video);
    if (reducedMotion) return;
    void video.play().catch(() => undefined);
  };

  const handlePlaying = () => {
    const video = videoRef.current;
    if (video) enforceSite00LoaderVideoSilent(video);
    signalPlaying();
    signalReady();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || openingHoldRef.current || reducedMotion) return;
    const holdTime = resolveSite00LoaderOpeningHoldTime(video.duration);
    if (holdTime <= 0) return;
    if (video.currentTime >= holdTime - 0.04) {
      holdOpeningFrame(video);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    enforceSite00LoaderVideoSilent(video);
    tryHoldOpeningFromMetadata(video);
  };

  useEffect(() => {
    if (!isLegacyLoaderAsset) return;
    loaderLifecycleLog('ANIMATION_ERROR', { blockedLegacyAsset: sourceUrl });
    signalReady();
    onOpeningHold?.();
  }, [isLegacyLoaderAsset, onOpeningHold, signalReady, sourceUrl]);

  useEffect(() => {
    loaderLifecycleLog('ANIMATION_SOURCE_RESOLVED', { sourceUrl, mediaPresentation });
  }, [sourceUrl, mediaPresentation]);

  useEffect(() => {
    if (sourceUrl) return;
    signalReady();
    onOpeningHold?.();
  }, [onOpeningHold, signalReady, sourceUrl]);

  useLayoutEffect(() => {
    const video = videoRef.current;
    if (video) enforceSite00LoaderVideoSilent(video);
  }, [sourceUrl]);

  useEffect(() => {
    readyRef.current = false;
    playingRef.current = false;
    openingHoldRef.current = false;
    setMediaReady(false);
    setMediaError(false);
    setOpeningHold(false);
  }, [sourceUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sourceUrl) return;

    const unbindSilent = bindSite00LoaderVideoSilentGuards(video);

    if (reducedMotion) {
      video.pause();
      const applyReducedMotionHold = () => {
        if (!Number.isFinite(video.duration) || video.duration <= 0) return;
        holdOpeningFrame(video);
        signalPlaying();
        signalReady();
      };
      if (video.readyState >= 1) {
        applyReducedMotionHold();
      } else {
        video.addEventListener('loadedmetadata', applyReducedMotionHold, { once: true });
      }
    } else {
      void video.play().catch(() => undefined);
    }

    return unbindSilent;
  }, [holdOpeningFrame, reducedMotion, signalPlaying, signalReady, sourceUrl]);

  const handleError = (event: unknown) => {
    loaderLifecycleLog('ANIMATION_ERROR', { event });
    onError?.(event);
    setMediaError(true);
    signalReady();
    onOpeningHold?.();
  };

  if (!sourceUrl || isLegacyLoaderAsset) return null;

  const layerClass = [
    'site00-loader-animation-layer',
    mediaPresentation === 'desktop' ? 'site00-loader-animation-layer--desktop' : 'site00-loader-animation-layer--mobile',
    mediaDebug ? 'site00-loader-animation-layer--debug' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const mediaClass = [
    'site00-loader-animation',
    'site00-loader-animation--environment',
    mediaPresentation === 'desktop' ? 'site00-loader-animation--environment-desktop' : 'site00-loader-animation--environment-mobile',
    reducedMotion ? 'site00-loader-animation--static' : '',
    mediaReady ? 'site00-loader-animation--ready' : '',
    mediaError ? 'site00-loader-animation--error' : '',
    openingHold ? 'site00-loader-animation--opening-hold' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const debugFocalLabel =
    mediaDebug && typeof window !== 'undefined'
      ? `ANIM ${mediaFocal} · BG ${resolveSite00LoaderBackgroundFocal(mediaPresentation)}`
      : null;

  return (
    <div
      className={layerClass}
      data-media-ready={mediaReady ? '1' : '0'}
      data-loader-video-src={sourceUrl}
      style={{ zIndex: 1 }}
      aria-hidden="true"
    >
      {debugFocalLabel ? (
        <span className="site00-loader-media-debug-label">{debugFocalLabel}</span>
      ) : null}
      <video
        key={sourceUrl}
        ref={videoRef}
        className={mediaClass}
        src={sourceUrl}
        muted
        playsInline
        autoPlay={!reducedMotion}
        loop={false}
        preload="auto"
        disablePictureInPicture
        disableRemotePlayback
        controls={false}
        tabIndex={-1}
        style={{ objectPosition: mediaFocal, objectFit: 'cover' }}
        onLoadedMetadata={handleLoadedMetadata}
        onLoadedData={handleCanPlay}
        onCanPlay={handleCanPlay}
        onPlaying={handlePlaying}
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
      />
    </div>
  );
}
