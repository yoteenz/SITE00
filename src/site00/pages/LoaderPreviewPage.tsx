import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { acquireLoadingScreenDocumentLock } from '../../platform-stabilization/loadingScreenLock';
import { Site00ImmersiveLoader, type Site00ImmersiveLoaderPhase } from '../components/loader/Site00ImmersiveLoader';
import { teardownSite00ImmersiveBootShell } from '../components/loader/site00LoaderBoot';
import { resolveSite00ImmersiveLoaderConfig } from '../components/loader/site00LoaderConfig';
import { resolveActiveStageSubtitle } from '../components/loader/site00LoaderStageSubtitle';
import { syncSite00LoaderFocalDocumentVars } from '../components/loader/site00LoaderMedia';

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 62;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Isolated loader surface — stays mounted so typography and animation can be inspected.
 * Query params: ?progress=62&complete=1&loaderDebug=1&route=/assts
 * Copy is visible by default; ?forceCopy=0 simulates cold-start copy gating.
 */
export default function LoaderPreviewPage() {
  const [params] = useSearchParams();
  const route = params.get('route') ?? '/';
  const config = useMemo(() => resolveSite00ImmersiveLoaderConfig(route), [route]);

  const progress = useMemo(() => clampProgress(Number(params.get('progress') ?? '62')), [params]);
  const isComplete = params.get('complete') === '1' || progress >= 100;
  const phase: Site00ImmersiveLoaderPhase = isComplete ? 'complete-hold' : 'loading';
  const stageSubtitle = useMemo(() => {
    if (isComplete) return config.stages[config.stages.length - 1]?.subtitle ?? '';
    return resolveActiveStageSubtitle(config.stages, progress);
  }, [config.stages, isComplete, progress]);

  useLayoutEffect(() => {
    // Preview is not an immersive boot path — clear stale boot chrome and seed focal tokens
    // so static bg + animation use the same anchors as cold start (89b3ce7 / 3c5a730).
    document.documentElement.classList.remove('site00-assts-boot');
    teardownSite00ImmersiveBootShell();
    syncSite00LoaderFocalDocumentVars();
    return () => {
      document.documentElement.style.removeProperty('--site00-loader-bg-focal');
      document.documentElement.style.removeProperty('--site00-loader-animation-focal');
    };
  }, []);

  useEffect(() => acquireLoadingScreenDocumentLock(), []);

  // Inspection default: copy visible unless simulating cold-start gating.
  const forceCopyActive = params.get('forceCopy') !== '0';

  return (
    <Site00ImmersiveLoader
      config={config}
      progress={progress}
      stageSubtitle={stageSubtitle}
      loaderState={isComplete ? 'READY' : 'ASSEMBLING'}
      isComplete={isComplete}
      phase={phase}
      forceCopyActive={forceCopyActive}
    />
  );
}
