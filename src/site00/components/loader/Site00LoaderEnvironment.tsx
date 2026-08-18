import { useEffect, useRef } from 'react';
import { loaderLifecycleLog } from './loaderLifecycleLog';

export type Site00LoaderEnvironmentFit = 'cover' | 'cover-landscape';

type Site00LoaderEnvironmentProps = {
  backgroundUrl: string;
  /** Full-bleed viewport layer (outside artboard). Default true. */
  viewport?: boolean;
  /** Mobile portrait uses cover; desktop landscape uses dedicated wide asset. */
  fit?: Site00LoaderEnvironmentFit;
  onBackgroundLoad?: () => void;
};

/** Approved environment — full viewport, always paints immediately (never render-gated). */
export function Site00LoaderEnvironment({
  backgroundUrl,
  viewport = false,
  fit = 'cover',
  onBackgroundLoad,
}: Site00LoaderEnvironmentProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    loaderLifecycleLog('BACKGROUND_SOURCE_RESOLVED', { url: backgroundUrl, fit });
  }, [backgroundUrl, fit]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img || !onBackgroundLoad) return;
    if (img.complete && img.naturalWidth > 0) {
      onBackgroundLoad();
    }
  }, [backgroundUrl, onBackgroundLoad]);

  const envClass = viewport
    ? `site00-loader-env site00-loader-env--viewport site00-loader-env--${fit}`
    : 'site00-loader-env';

  const handleLoad = () => {
    loaderLifecycleLog('BACKGROUND_LOADED');
    onBackgroundLoad?.();
  };

  return (
    <div className={envClass} aria-hidden="true">
      <img
        ref={imgRef}
        className="site00-loader-env__img"
        src={backgroundUrl}
        alt=""
        decoding="async"
        fetchPriority="high"
        loading="eager"
        draggable={false}
        onLoad={handleLoad}
        onError={() => {
          loaderLifecycleLog('BACKGROUND_ERROR', { url: backgroundUrl });
          onBackgroundLoad?.();
        }}
      />
    </div>
  );
}
