import { useEffect, useRef, useState } from 'react';
import { resolveSite00LoaderEnvironmentAnimationUrl } from './site00LoaderMedia';
import { loaderLifecycleLog } from './loaderLifecycleLog';
import { isLoaderMediaDebugEnabled } from './site00LoaderHeroStage';
import type { LoaderPresentation } from './loader-composition-resolver';

type Site00LoaderAnimationProps = {
  /** Media presentation — selects mobile vs desktop animation asset only. */
  mediaPresentation?: LoaderPresentation;
  reducedMotion?: boolean;
  onReady?: () => void;
  onError?: (detail: unknown) => void;
};

/**
 * Full-frame environment animation — Layer 2 above static background.
 * Fades in once the video can render; static background remains underneath as fallback.
 */
export function Site00LoaderAnimation({
  mediaPresentation = 'mobile',
  reducedMotion = false,
  onReady,
  onError,
}: Site00LoaderAnimationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const readyRef = useRef(false);
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const mediaDebug = isLoaderMediaDebugEnabled();
  const sourceUrl = resolveSite00LoaderEnvironmentAnimationUrl(mediaPresentation);

  const signalReady = () => {
    if (readyRef.current) return;
    readyRef.current = true;
    setMediaReady(true);
    loaderLifecycleLog('ANIMATION_CANPLAY');
    onReady?.();
  };

  useEffect(() => {
    loaderLifecycleLog('ANIMATION_SOURCE_RESOLVED', { sourceUrl, mediaPresentation });
  }, [sourceUrl, mediaPresentation]);

  useEffect(() => {
    if (sourceUrl) return;
    signalReady();
  }, [sourceUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !sourceUrl) return;

    const enforceSilent = () => {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
    };

    enforceSilent();
    video.addEventListener('volumechange', enforceSilent);
    video.addEventListener('play', enforceSilent);

    if (reducedMotion) {
      video.pause();
      try {
        video.currentTime = 0;
      } catch {
        /* ignore */
      }
    } else {
      void video.play().catch(() => undefined);
    }

    return () => {
      video.removeEventListener('volumechange', enforceSilent);
      video.removeEventListener('play', enforceSilent);
    };
  }, [reducedMotion, sourceUrl]);

  const handleCanPlay = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
      video.volume = 0;
      if (!reducedMotion) {
        void video.play().catch(() => undefined);
      }
    }
    signalReady();
  };

  const handleError = (event: unknown) => {
    loaderLifecycleLog('ANIMATION_ERROR', { event });
    onError?.(event);
    setMediaError(true);
    signalReady();
  };

  if (!sourceUrl) return null;

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
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={layerClass} data-media-ready={mediaReady ? '1' : '0'} aria-hidden="true">
      <video
        ref={videoRef}
        className={mediaClass}
        src={sourceUrl}
        muted
        playsInline
        autoPlay={!reducedMotion}
        loop={!reducedMotion}
        preload="auto"
        disablePictureInPicture
        controls={false}
        tabIndex={-1}
        onLoadedData={handleCanPlay}
        onCanPlay={handleCanPlay}
        onError={handleError}
      />
    </div>
  );
}
