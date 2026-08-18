import { useEffect, useState } from 'react';
import { site00LoaderBackgroundUrl, site00LoaderRefMapUrl } from './site00LoaderMedia';
import { isLoaderRefOverlayEnabled } from './site00LoaderHeroStage';

/**
 * Dev-only reference artwork overlay — shares artboard bounds with live composition.
 * Toggle: ?loaderRefOverlay=1 (or ?loaderDebug=1)
 */
export function LoaderReferenceOverlay() {
  const enabled = isLoaderRefOverlayEnabled();
  const [src, setSrc] = useState(site00LoaderRefMapUrl());

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch(site00LoaderRefMapUrl(), { method: 'HEAD' })
      .then((res) => {
        if (cancelled) return;
        if (!res.ok) setSrc(site00LoaderBackgroundUrl());
      })
      .catch(() => {
        if (!cancelled) setSrc(site00LoaderBackgroundUrl());
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="site00-loader-ref-overlay" aria-hidden="true">
      <img className="site00-loader-ref-overlay__img" src={src} alt="" draggable={false} />
      <span className="site00-loader-ref-overlay__label">REF OVERLAY · 50%</span>
    </div>
  );
}
