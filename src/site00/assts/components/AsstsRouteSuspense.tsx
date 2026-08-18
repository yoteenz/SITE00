import { Suspense, type ReactNode } from 'react';
import { ASSTS_IMMERSIVE_LOADER_CONFIG } from '../../components/loader/site00LoaderConfig';
import { Site00ImmersiveLoader } from '../../components/loader/Site00ImmersiveLoader';
import { shouldShowAsstsImmersiveLoader } from '../../components/loader/site00LoaderSession';

/** Immersive fallback during lazy route load — never plain LoadingScreen on cold start. */
function AsstsRouteFallback() {
  if (shouldShowAsstsImmersiveLoader()) {
    const config = ASSTS_IMMERSIVE_LOADER_CONFIG;
    return (
      <Site00ImmersiveLoader
        config={config}
        progress={config.stages[0]?.progress ?? 8}
        statusLabel={config.stages[0]?.label ?? 'INITIALIZING SITE 00'}
        loaderState="BOOTSTRAP"
      />
    );
  }

  return null;
}

export function AsstsRouteSuspense({ children }: { children: ReactNode }) {
  return <Suspense fallback={<AsstsRouteFallback />}>{children}</Suspense>;
}
