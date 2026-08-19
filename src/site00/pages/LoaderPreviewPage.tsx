import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { acquireLoadingScreenDocumentLock } from '../../platform-stabilization/loadingScreenLock';
import { Site00ImmersiveLoader, type Site00ImmersiveLoaderPhase } from '../components/loader/Site00ImmersiveLoader';
import { initSite00ImmersiveLoaderBoot, teardownSite00ImmersiveBootShell } from '../components/loader/site00LoaderBoot';
import { SITE00_WORLD_IMMERSIVE_LOADER_CONFIG } from '../components/loader/site00LoaderConfig';

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 62;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Isolated loader surface — stays mounted so typography and animation can be inspected.
 * Query params: ?progress=62&complete=1&loaderDebug=1
 */
export default function LoaderPreviewPage() {
  const [params] = useSearchParams();
  const config = SITE00_WORLD_IMMERSIVE_LOADER_CONFIG;

  const progress = useMemo(() => clampProgress(Number(params.get('progress') ?? '62')), [params]);
  const isComplete = params.get('complete') === '1' || progress >= 100;
  const phase: Site00ImmersiveLoaderPhase = isComplete ? 'complete-hold' : 'loading';
  const statusLabel = isComplete ? config.completionMessage : config.assemblingLabel;

  useEffect(() => {
    initSite00ImmersiveLoaderBoot();
    return () => {
      teardownSite00ImmersiveBootShell();
    };
  }, []);

  useEffect(() => acquireLoadingScreenDocumentLock(), []);

  const forceCopyActive = params.get('forceCopy') === '1';

  return (
    <Site00ImmersiveLoader
      config={config}
      progress={progress}
      statusLabel={statusLabel}
      loaderState={isComplete ? 'READY' : 'ASSEMBLING'}
      isComplete={isComplete}
      phase={phase}
      forceCopyActive={forceCopyActive}
    />
  );
}
