import { useEffect, useRef, useState } from 'react';
import {
  site00LoaderGeometryApngUrl,
  site00LoaderGeometrySourceRemoteUrl,
  site00LoaderGeometrySourceUrl,
  site00LoaderGeometryWebmUrl,
  site00LoaderPrefersApngGeometry,
} from './site00LoaderMedia';
import { loaderLifecycleLog } from './loaderLifecycleLog';
import {
  probeProductionAlphaAvailable,
  resolveLoaderGeometryMode,
  resolveLoaderGeometryModeFromQuery,
  type LoaderGeometryMode,
} from './site00LoaderGeometryMode';
import { isLoaderMediaDebugEnabled } from './site00LoaderHeroStage';

type Site00LoaderAnimationProps = {
  reducedMotion?: boolean;
  onReady?: () => void;
  onError?: (detail: unknown) => void;
};

/**
 * Transparent geometry overlay — bounding box always visible; media fades in independently.
 * Parent loader never waits for this layer.
 */
export function Site00LoaderAnimation({ reducedMotion = false, onReady, onError }: Site00LoaderAnimationProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mountRef = useRef<HTMLDivElement>(null);
  const [mediaReady, setMediaReady] = useState(false);
  const [mediaError, setMediaError] = useState(false);
  const [mediaDebugSize, setMediaDebugSize] = useState('');
  const mediaDebug = isLoaderMediaDebugEnabled();
  const forcedMode = resolveLoaderGeometryModeFromQuery();
  const [mode, setMode] = useState<LoaderGeometryMode>(() => forcedMode ?? 'screen');
  const [alphaUrl, setAlphaUrl] = useState<string | null>(() =>
    (forcedMode ?? 'screen') === 'alpha'
      ? site00LoaderPrefersApngGeometry()
        ? site00LoaderGeometryApngUrl()
        : site00LoaderGeometryWebmUrl()
      : null,
  );
  const [sourceUrl, setSourceUrl] = useState(site00LoaderGeometrySourceUrl());

  useEffect(() => {
    loaderLifecycleLog('ANIMATION_SOURCE_RESOLVED', { mode, sourceUrl, alphaUrl });
  }, [mode, sourceUrl, alphaUrl]);

  useEffect(() => {
    const forced = resolveLoaderGeometryModeFromQuery();
    if (forced) {
      setMode(forced);
      return;
    }
    void probeProductionAlphaAvailable().then((hasAlpha) => {
      const nextMode = resolveLoaderGeometryMode(hasAlpha);
      setMode(nextMode);
      if (nextMode === 'alpha') {
        setAlphaUrl(
          site00LoaderPrefersApngGeometry() ? site00LoaderGeometryApngUrl() : site00LoaderGeometryWebmUrl(),
        );
      }
    });
  }, []);

  useEffect(() => {
    if (mode !== 'screen') return;
    fetch(site00LoaderGeometrySourceUrl(), { method: 'HEAD' })
      .then((r) => {
        if (!r.ok) setSourceUrl(site00LoaderGeometrySourceRemoteUrl());
      })
      .catch(() => setSourceUrl(site00LoaderGeometrySourceRemoteUrl()));
  }, [mode]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

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
  }, [reducedMotion, mode, sourceUrl, alphaUrl]);

  useEffect(() => {
    if (!mediaDebug) return;
    const mount = mountRef.current;
    const media = mount?.querySelector('.site00-loader-animation');
    if (!mount || !media) return;

    const update = () => {
      const mr = mount.getBoundingClientRect();
      const vr = media.getBoundingClientRect();
      setMediaDebugSize(
        `wrap ${Math.round(mr.width)}×${Math.round(mr.height)} · media ${Math.round(vr.width)}×${Math.round(vr.height)}`,
      );
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(mount);
    ro.observe(media);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [mediaDebug, mode, sourceUrl, alphaUrl, mediaReady]);

  const handleReady = () => {
    if (mediaReady) return;
    setMediaReady(true);
    loaderLifecycleLog('ANIMATION_CANPLAY');
    onReady?.();
  };

  const handleAlphaMediaError = (event: unknown) => {
    loaderLifecycleLog('ANIMATION_ERROR', { mode: 'alpha', event });
    onError?.(event);
    setMode('screen');
    setAlphaUrl(null);
    setMediaError(true);
  };

  const handleScreenMediaError = (event: unknown) => {
    loaderLifecycleLog('ANIMATION_ERROR', { mode: 'screen', event });
    onError?.(event);
    setMediaError(true);
    handleReady();
  };

  const useAlphaMode = mode === 'alpha';
  const useApng = useAlphaMode && site00LoaderPrefersApngGeometry();
  const webmSrc = alphaUrl ?? site00LoaderGeometryWebmUrl();
  const mediaClass = [
    'site00-loader-animation',
    useAlphaMode ? 'site00-loader-animation--alpha' : 'site00-loader-animation--screen',
    reducedMotion ? 'site00-loader-animation--static' : '',
    mediaReady ? 'site00-loader-animation--ready' : '',
    mediaError ? 'site00-loader-animation--error' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={mountRef} className="site00-loader-geometry-mount" data-media-ready={mediaReady ? '1' : '0'}>
      {mediaDebug && mediaDebugSize ? (
        <span className="site00-loader-media-debug-label" aria-hidden="true">
          {mediaDebugSize}
        </span>
      ) : null}
      {useAlphaMode ? (
        useApng ? (
          <img
            className={mediaClass}
            src={site00LoaderGeometryApngUrl()}
            alt=""
            decoding="async"
            draggable={false}
            aria-hidden="true"
            onLoad={handleReady}
            onError={handleAlphaMediaError}
          />
        ) : (
          <video
            ref={videoRef}
            className={mediaClass}
            muted
            playsInline
            autoPlay={!reducedMotion}
            loop={!reducedMotion}
            preload="auto"
            disablePictureInPicture
            aria-hidden="true"
            tabIndex={-1}
            onLoadedData={handleReady}
            onCanPlay={handleReady}
            onError={handleAlphaMediaError}
          >
            <source src={webmSrc} type="video/webm" />
          </video>
        )
      ) : (
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
          aria-hidden="true"
          tabIndex={-1}
          onLoadedData={handleReady}
          onCanPlay={handleReady}
          onError={handleScreenMediaError}
        />
      )}
    </div>
  );
}
