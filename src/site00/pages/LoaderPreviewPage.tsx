import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { acquireLoadingScreenDocumentLock } from '../../platform-stabilization/loadingScreenLock';
import { Site00ImmersiveLoader, type Site00ImmersiveLoaderPhase } from '../components/loader/Site00ImmersiveLoader';
import { teardownSite00ImmersiveBootShell } from '../components/loader/site00LoaderBoot';
import { resolveSite00ImmersiveLoaderConfig } from '../components/loader/site00LoaderConfig';
import { resolveActiveStageSubtitle } from '../components/loader/site00LoaderStageSubtitle';

function clampProgress(value: number): number {
  if (!Number.isFinite(value)) return 62;
  return Math.min(100, Math.max(0, Math.round(value)));
}

/**
 * Isolated loader surface — stays mounted so typography and animation can be inspected.
 * Query params: ?progress=62&complete=1&loaderDebug=1&forceCopy=1&route=/assts
 *
 * Focal inspection (no jump): ?loaderMediaDebug=1&forceCopy=1 — inline bg 45% / anim center.
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
    // Preview is an isolated inspection surface — no boot shell handoff (matches ?forceCopy=1 debug URL).
    document.documentElement.classList.remove('site00-assts-boot');
    teardownSite00ImmersiveBootShell();
  }, []);

  useEffect(() => acquireLoadingScreenDocumentLock(), []);

  const forceCopyActive = params.get('forceCopy') === '1';

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
