import { useCallback, useMemo, useRef, useState } from 'react';
import type { Site00LoaderStage, Site00LoaderState } from './site00LoaderConfig';

export type Site00LoaderProgressState = {
  progress: number;
  statusLabel: string;
  loaderState: Site00LoaderState;
  isComplete: boolean;
  completeStage: (stageId: string) => void;
  setProgressFloor: (value: number) => void;
  forceComplete: () => void;
};

export function useSite00LoaderProgress(
  stages: Site00LoaderStage[],
  completionMessage: string,
): Site00LoaderProgressState {
  const stageMap = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);
  const completedRef = useRef<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [statusLabel, setStatusLabel] = useState(stages[0]?.label ?? 'INITIALIZING SITE 00');
  const [loaderState, setLoaderState] = useState<Site00LoaderState>(stages[0]?.state ?? 'BOOTSTRAP');
  const [isComplete, setIsComplete] = useState(false);

  const applyProgress = useCallback((next: number, label: string, state: Site00LoaderState) => {
    setProgress((prev) => Math.max(prev, Math.min(100, next)));
    setStatusLabel(label);
    setLoaderState(state);
  }, []);

  const completeStage = useCallback(
    (stageId: string) => {
      const stage = stageMap.get(stageId);
      if (!stage || completedRef.current.has(stageId)) return;
      completedRef.current.add(stageId);
      applyProgress(stage.progress, stage.label, stage.state);
    },
    [applyProgress, stageMap],
  );

  const setProgressFloor = useCallback(
    (value: number) => {
      applyProgress(value, statusLabel, loaderState);
    },
    [applyProgress, loaderState, statusLabel],
  );

  const forceComplete = useCallback(() => {
    setIsComplete(true);
    applyProgress(100, completionMessage, 'READY');
  }, [applyProgress, completionMessage]);

  return {
    progress,
    statusLabel,
    loaderState,
    isComplete,
    completeStage,
    setProgressFloor,
    forceComplete,
  };
}
