import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  FounderCreativeIngestionState,
  GuidedWorkflowStep,
  PersistedGuidedWorkflowState,
  SlideCompareTab,
} from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';
import {
  firstUnresolvedSlideIndex,
  getSequenceSpecs,
  inferGuidedWorkflowStep,
  loadPersistedGuidedWorkflow,
  resolveWorkflowSlideIndex,
  savePersistedGuidedWorkflow,
} from '../../../../shared/site00-studio-world-production/founderCreativeIngestion/client.js';

export type WorkflowActions = {
  setStep: (step: GuidedWorkflowStep) => void;
  setSlideIndex: (index: number) => void;
  setCompareTab: (tab: SlideCompareTab) => void;
  goNextSlide: () => void;
  goPrevSlide: () => void;
  selectSequence: (sequenceId: string) => void;
  markDecomposing: (value: boolean) => void;
  afterUploadSuccess: () => void;
};

export function useFounderCreativeWorkflow(params: {
  projectSlug: string;
  ingestion: FounderCreativeIngestionState | null;
}) {
  const { projectSlug, ingestion } = params;
  const [sequenceId, setSequenceId] = useState<string | null>(null);
  const [step, setStep] = useState<GuidedWorkflowStep>('INGEST');
  const [slideIndex, setSlideIndex] = useState(0);
  const [compareTab, setCompareTab] = useState<SlideCompareTab>('COMPARE');
  const [decomposing, setDecomposing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!ingestion?.parentSequences.length) return;
    const persisted = loadPersistedGuidedWorkflow(projectSlug);
    const fallbackSequenceId = persisted?.sequenceId ?? ingestion.parentSequences[0]!.sequenceId;
    setSequenceId(fallbackSequenceId);
    const specs = getSequenceSpecs(ingestion, fallbackSequenceId);
    const inferred = inferGuidedWorkflowStep(ingestion, fallbackSequenceId, {
      preferredStep: persisted?.step ?? null,
    });
    setStep(persisted?.step && specs.length > 0 ? persisted.step : inferred);
    setSlideIndex(
      resolveWorkflowSlideIndex(specs, persisted?.slideIndex ?? firstUnresolvedSlideIndex(specs)),
    );
    setCompareTab(persisted?.compareTab ?? 'COMPARE');
    setHydrated(true);
  }, [ingestion, projectSlug]);

  const specs = useMemo(
    () => (ingestion && sequenceId ? getSequenceSpecs(ingestion, sequenceId) : []),
    [ingestion, sequenceId],
  );

  useEffect(() => {
    if (!hydrated || !ingestion || !sequenceId) return;
    const inferred = inferGuidedWorkflowStep(ingestion, sequenceId, { decomposing });
    if (!decomposing && step === 'DECOMPOSE' && specs.length > 0) {
      setStep('SLIDE_REVIEW');
      setSlideIndex(firstUnresolvedSlideIndex(specs));
      return;
    }
    if (step === 'INGEST' && specs.length > 0 && !decomposing) {
      setStep(inferred === 'INGEST' ? 'SLIDE_REVIEW' : inferred);
    }
  }, [hydrated, ingestion, sequenceId, specs.length, decomposing, step, specs]);

  useEffect(() => {
    if (!hydrated || !sequenceId) return;
    const payload: PersistedGuidedWorkflowState = {
      sequenceId,
      step,
      slideIndex,
      compareTab,
      updatedAt: new Date().toISOString(),
    };
    savePersistedGuidedWorkflow(projectSlug, payload);
  }, [hydrated, projectSlug, sequenceId, step, slideIndex, compareTab]);

  const selectSequence = useCallback(
    (nextSequenceId: string) => {
      if (!ingestion) return;
      setSequenceId(nextSequenceId);
      const nextSpecs = getSequenceSpecs(ingestion, nextSequenceId);
      setStep(inferGuidedWorkflowStep(ingestion, nextSequenceId));
      setSlideIndex(firstUnresolvedSlideIndex(nextSpecs));
      setCompareTab('COMPARE');
      setDecomposing(false);
    },
    [ingestion],
  );

  const goNextSlide = useCallback(() => {
    setSlideIndex((current) => Math.min(current + 1, Math.max(0, specs.length - 1)));
  }, [specs.length]);

  const goPrevSlide = useCallback(() => {
    setSlideIndex((current) => Math.max(current - 1, 0));
  }, []);

  const afterUploadSuccess = useCallback(() => {
    setDecomposing(true);
    setStep('DECOMPOSE');
  }, []);

  const actions: WorkflowActions = {
    setStep,
    setSlideIndex,
    setCompareTab,
    goNextSlide,
    goPrevSlide,
    selectSequence,
    markDecomposing: setDecomposing,
    afterUploadSuccess,
  };

  return {
    sequenceId,
    step,
    slideIndex,
    compareTab,
    decomposing,
    specs,
    hydrated,
    actions,
  };
}
