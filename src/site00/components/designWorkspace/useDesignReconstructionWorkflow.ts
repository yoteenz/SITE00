/**
 * Hook — founder action workflow state for Design reconstruction.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  getPrimaryBlockingAction,
  countPendingActionsForTab,
  actionTypeToWorkflowView,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderActionRouter.js';
import {
  approveAllCropsInWorkflow,
  approveCropAtIndex,
  approveGenerationInWorkflow,
  approveOutputAtIndex,
  closeWorkflowView,
  markCandidateGenerationComplete,
  openWorkflowView,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionJobOrchestrator.js';
import {
  getReconstructionWorkflowState,
  subscribeReconstructionWorkflow,
  updateReconstructionWorkflow,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionWorkflowStore.js';
import { buildSkinsMobileStructureCorrections } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/structureCorrectionEngine.js';
import { getTopLevelJobPresentation } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/referenceReconstructionSubJobs.js';
import { dispatchSkinsCandidateGeneration } from './designSkinsReconstructionApi.js';

export function useDesignReconstructionWorkflow() {
  const [, setTick] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => subscribeReconstructionWorkflow(() => setTick((n) => n + 1)), []);

  const state = getReconstructionWorkflowState();
  const structureCorrections = useMemo(() => buildSkinsMobileStructureCorrections(), []);

  const primaryAction = state ? getPrimaryBlockingAction(state.actions) : null;
  const assetsActionCount = state ? countPendingActionsForTab(state.actions, 'ASSETS') : 0;
  const skinsActionCount = state ? countPendingActionsForTab(state.actions, 'SKINS') : 0;
  const topLevel = state ? getTopLevelJobPresentation(state.subJobs) : null;

  useEffect(() => {
    const rriAction = searchParams.get('rriAction');
    if (!state || !rriAction) return;
    const view =
      rriAction === 'review-crops'
        ? 'crop-review'
        : rriAction === 'generation-plan'
          ? 'generation-plan'
          : rriAction === 'review-outputs'
            ? 'output-review'
            : null;
    if (view && state.workflowView !== view) {
      updateReconstructionWorkflow((s) => openWorkflowView(s, view));
    }
  }, [searchParams, state?.workflowView]);

  const openAction = useCallback(
    (deepLink: string) => {
      const q = deepLink.startsWith('?') ? deepLink.slice(1) : deepLink;
      const params = new URLSearchParams(q);
      params.forEach((value, key) => searchParams.set(key, value));
      setSearchParams(searchParams, { replace: false });
      const action = params.get('rriAction');
      const view =
        action === 'review-crops'
          ? 'crop-review'
          : action === 'generation-plan'
            ? 'generation-plan'
            : action === 'review-outputs'
              ? 'output-review'
              : null;
      if (view) updateReconstructionWorkflow((s) => openWorkflowView(s, view));
    },
    [searchParams, setSearchParams],
  );

  const openPrimaryAction = useCallback(() => {
    if (!primaryAction) return;
    openAction(primaryAction.deepLink);
  }, [primaryAction, openAction]);

  const approveCrop = useCallback((index: number) => {
    updateReconstructionWorkflow((s) => approveCropAtIndex(s, index));
  }, []);

  const approveAllCrops = useCallback(() => {
    updateReconstructionWorkflow((s) => approveAllCropsInWorkflow(s));
  }, []);

  const approveGeneration = useCallback(async () => {
    const next = updateReconstructionWorkflow((s) => approveGenerationInWorkflow(s));
    if (!next?.generationExecuting) return;
    for (let i = 0; i < next.job.candidateAssets.length; i++) {
      const c = next.job.candidateAssets[i]!;
      if (c.cropStatus !== 'APPROVED') continue;
      try {
        const result = await dispatchSkinsCandidateGeneration({
          candidateId: c.candidateId,
          sourceCropUrl: c.sourceCrop.sourceCropUrl,
          prompt: c.generatedPrompt,
          brandKey: c.brandKey,
        });
        updateReconstructionWorkflow((s) =>
          markCandidateGenerationComplete(s, i, result.outputUrl),
        );
      } catch {
        updateReconstructionWorkflow((s) => markCandidateGenerationComplete(s, i, null));
      }
    }
  }, []);

  const approveOutput = useCallback((index: number) => {
    updateReconstructionWorkflow((s) => approveOutputAtIndex(s, index));
  }, []);

  const closeWorkflow = useCallback(() => {
    updateReconstructionWorkflow((s) => closeWorkflowView(s));
    searchParams.delete('rriAction');
    searchParams.delete('jobId');
    setSearchParams(searchParams, { replace: true });
  }, [searchParams, setSearchParams]);

  const setCandidateIndex = useCallback((index: number) => {
    updateReconstructionWorkflow((s) => ({ ...s, activeCandidateIndex: index }));
  }, []);

  return {
    state,
    primaryAction,
    assetsActionCount,
    skinsActionCount,
    topLevel,
    structureCorrections,
    openPrimaryAction,
    openAction,
    approveCrop,
    approveAllCrops,
    approveGeneration,
    approveOutput,
    closeWorkflow,
    setCandidateIndex,
    actionTypeToWorkflowView,
  };
}
