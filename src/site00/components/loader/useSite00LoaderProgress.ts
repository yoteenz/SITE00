import { useCallback, useMemo, useRef, useState } from 'react';
import type { Site00LoaderStage, Site00LoaderState } from './site00LoaderConfig';

export type Site00LoaderProgressState = {
  progress: number;
  /** Gray subtitle — updates with each completed preload stage. */
  stageSubtitle: string;
  loaderState: Site00LoaderState;
  isComplete: boolean;
  completeStage: (stageId: string) => void;
  setProgressFloor: (value: number) => void;
  forceComplete: () => void;
};

export function useSite00LoaderProgress(
  stages: Site00LoaderStage[],
  _completionMessage: string,
): Site00LoaderProgressState {
  const stageMap = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);
  const completedRef = useRef<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [stageSubtitle, setStageSubtitle] = useState(stages[0]?.subtitle ?? '');
  const [loaderState, setLoaderState] = useState<Site00LoaderState>(stages[0]?.state ?? 'BOOTSTRAP');
  const [isComplete, setIsComplete] = useState(false);

  const applyProgress = useCallback((next: number, subtitle: string, state: Site00LoaderState) => {
    setProgress((prev) => Math.max(prev, Math.min(100, next)));
    setStageSubtitle(subtitle);
    setLoaderState(state);
  }, []);

  const completeStage = useCallback(
    (stageId: string) => {
      const stage = stageMap.get(stageId);
      if (!stage || completedRef.current.has(stageId)) return;
      completedRef.current.add(stageId);
      applyProgress(stage.progress, stage.subtitle, stage.state);
    },
    [applyProgress, stageMap],
  );

  const setProgressFloor = useCallback(
    (value: number) => {
      setProgress((prev) => Math.max(prev, Math.min(100, value)));
    },
    [],
  );

  const forceComplete = useCallback(() => {
    setIsComplete(true);
    setProgress(100);
    setLoaderState('READY');
  }, []);

  return {
    progress,
    stageSubtitle,
    loaderState,
    isComplete,
    completeStage,
    setProgressFloor,
    forceComplete,
  };
}
