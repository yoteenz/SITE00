import { createPortal } from 'react-dom';
import { Site00ImmersiveLoader } from './Site00ImmersiveLoader';
import { resolveSite00ImmersiveLoaderConfig } from './site00LoaderConfig';
import { isSite00ImmersivePath } from './site00LoaderPaths';
import { shouldShowSite00ImmersiveLoader } from './site00LoaderSession';

/**
 * Immersive SITE 00 loader portaled to document.body so it stays visible while
 * `html.site00-assts-boot` hides `#root` during ultra-early boot.
 */
export function Site00ImmersiveColdStartFallback() {
  if (typeof window === 'undefined') {
    return null;
  }

  const path = window.location.pathname || '';
  if (!isSite00ImmersivePath(path) || !shouldShowSite00ImmersiveLoader()) {
    return null;
  }

  const config = resolveSite00ImmersiveLoaderConfig(path);
  const overlay = (
    <Site00ImmersiveLoader
      config={config}
      progress={config.stages[0]?.progress ?? 8}
      statusLabel={config.stages[0]?.label ?? 'INITIALIZING SITE 00'}
      loaderState="BOOTSTRAP"
    />
  );

  if (typeof document === 'undefined') {
    return overlay;
  }

  return createPortal(overlay, document.body);
}
