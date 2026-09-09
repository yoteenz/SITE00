/**
 * P0.VR.6R7 — Founder action routing + approval workflow tests.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import {
  syncFounderActionsFromJob,
  getPrimaryBlockingAction,
  countPendingActionsForTab,
  actionTypeToWorkflowView,
  hydrateV238SkinsMobileJob,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderActionRouter.js';
import {
  createInitialWorkflowState,
  approveCropAtIndex,
  approveAllCropsInWorkflow,
  approveGenerationInWorkflow,
  approveOutputAtIndex,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionJobOrchestrator.js';
import {
  getReconstructionWorkflowState,
  resetReconstructionWorkflowForTest,
  setReconstructionWorkflowState,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/reconstructionWorkflowStore.js';
import {
  initializeSubJobs,
  assertStructureNotBlockedByAssets,
  getTopLevelJobPresentation,
} from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/referenceReconstructionSubJobs.js';
import { buildSkinsMobileStructureCorrections } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/structureCorrectionEngine.js';
import { buildMultiAssetReconstructionPlan } from '../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/multiAssetReconstructionJob.js';

describe('P0.VR.6R7 — Founder action routing', () => {
  beforeEach(() => resetReconstructionWorkflowForTest());

  it('1. crop-blocked job creates founder action', () => {
    const state = createInitialWorkflowState();
    expect(state).not.toBeNull();
    const review = state!.actions.find((a) => a.actionType === 'REVIEW_CROPS');
    expect(review).toBeDefined();
    expect(review?.blocking).toBe(true);
  });

  it('2. founder action surfaces for Skins workspace', () => {
    const state = createInitialWorkflowState()!;
    expect(countPendingActionsForTab(state.actions, 'SKINS')).toBeGreaterThan(0);
  });

  it('3. founder action surfaces for Assets workspace', () => {
    const state = createInitialWorkflowState()!;
    expect(countPendingActionsForTab(state.actions, 'ASSETS')).toBeGreaterThan(0);
  });

  it('4. action deep-links to crop review', () => {
    const state = createInitialWorkflowState()!;
    const action = getPrimaryBlockingAction(state.actions);
    expect(action?.deepLink).toContain('rriAction=review-crops');
    expect(actionTypeToWorkflowView('REVIEW_CROPS')).toBe('crop-review');
  });

  it('5. all five crops visible in job', () => {
    const state = createInitialWorkflowState()!;
    expect(state.job.candidateAssets.length).toBe(5);
  });

  it('6. crop context fields present on candidates', () => {
    const state = createInitialWorkflowState()!;
    expect(state.job.candidateAssets[0]?.sourceCrop.sourceCropUrl).toBeTruthy();
    expect(state.job.candidateAssets[0]?.generatedPrompt.length).toBeGreaterThan(10);
  });

  it('7. crop approval works per index', () => {
    let state = createInitialWorkflowState()!;
    state = approveCropAtIndex(state, 0);
    expect(state.job.cropApprovalStatus.approved).toBe(1);
  });

  it('8. all-crop approval explicit', () => {
    let state = createInitialWorkflowState()!;
    state = approveAllCropsInWorkflow(state);
    expect(state.job.cropApprovalStatus.approved).toBe(5);
    expect(state.workflowView).toBe('generation-plan');
  });

  it('9. generation remains blocked after single crop only', () => {
    let state = createInitialWorkflowState()!;
    state = approveCropAtIndex(state, 0);
    expect(state.job.generationApprovalStatus.status).toBe('BLOCKED');
  });

  it('10. generation plan action created after all crops', () => {
    let state = approveAllCropsInWorkflow(createInitialWorkflowState()!);
    const genAction = state.actions.find((a) => a.actionType === 'APPROVE_GENERATION' && a.workspace === 'SKINS');
    expect(genAction).toBeDefined();
  });

  it('11. generation plan displays prompts', () => {
    const state = approveAllCropsInWorkflow(createInitialWorkflowState()!);
    const plan = buildMultiAssetReconstructionPlan(state.job);
    expect(plan.entries.length).toBe(5);
    expect(plan.entries[0]?.generatedPrompt.length).toBeGreaterThan(0);
  });

  it('12. generation approval authorizes dispatch count', () => {
    const state = approveGenerationInWorkflow(approveAllCropsInWorkflow(createInitialWorkflowState()!));
    expect(state.job.generationApprovalStatus.authorizedDispatchCount).toBe(5);
    expect(state.generationExecuting).toBe(true);
  });

  it('13. provider execution flag set after generation approval', () => {
    const state = approveGenerationInWorkflow(approveAllCropsInWorkflow(createInitialWorkflowState()!));
    expect(state.workflowView).toBe('generation-executing');
  });

  it('14. execution status tracked per candidate', () => {
    const state = createInitialWorkflowState()!;
    const statuses = state.job.candidateAssets.map((c) => c.generationStatus);
    expect(statuses.every((s) => s === 'BLOCKED')).toBe(true);
  });

  it('15. output review action created when outputs complete', () => {
    let state = approveAllCropsInWorkflow(createInitialWorkflowState()!);
    state = {
      ...state,
      job: {
        ...state.job,
        candidateAssets: state.job.candidateAssets.map((c) => ({
          ...c,
          generationStatus: 'COMPLETE' as const,
          output: { outputId: 'o1', outputUrl: '/test.webp', approvalStatus: 'PENDING' },
        })),
        jobStatus: 'OUTPUT_REVIEW',
      },
    };
    const actions = syncFounderActionsFromJob(state.job);
    expect(actions.some((a) => a.actionType === 'REVIEW_OUTPUTS')).toBe(true);
  });

  it('16. outputs do not auto-bind', () => {
    const state = createInitialWorkflowState()!;
    expect(state.job.candidateAssets.every((c) => c.bindingStatus === 'UNBOUND')).toBe(true);
  });

  it('17. regeneration waits for explicit approval — no auto action', () => {
    const state = createInitialWorkflowState()!;
    expect(state.actions.some((a) => a.actionType === 'APPROVE_REGENERATION')).toBe(false);
  });

  it('18. output approval updates binding', () => {
    let state = approveAllCropsInWorkflow(createInitialWorkflowState()!);
    state = approveOutputAtIndex(state, 0);
    expect(state.job.candidateAssets[0]?.approvalStatus).toBe('LOVE_IT');
  });

  it('19. binding status progresses', () => {
    let state = approveAllCropsInWorkflow(createInitialWorkflowState()!);
    state = approveOutputAtIndex(state, 0);
    expect(state.job.bindingStatus.bound).toBe(1);
  });

  it('20. reconvergence status field exists after binding path', () => {
    let state = approveAllCropsInWorkflow(createInitialWorkflowState()!);
    state = approveOutputAtIndex(state, 0);
    expect(['NOT_RUN', 'PENDING', 'COMPLETE']).toContain(state.job.recomparisonStatus);
  });

  it('21. structure sub-job runs while assets blocked', () => {
    const subJobs = initializeSubJobs({ cropApprovalPending: true, generationBlocked: true });
    expect(subJobs.structure.status).toBe('RUNNING');
    expect(subJobs.assets.status).toBe('WAITING_CROP_APPROVAL');
    const coupled = assertStructureNotBlockedByAssets(subJobs);
    expect(coupled.coupled).toBe(false);
  });

  it('22. typography sub-job runs while assets blocked', () => {
    const subJobs = initializeSubJobs({ cropApprovalPending: true, generationBlocked: true });
    expect(subJobs.typography.status).toBe('RUNNING');
  });

  it('23. top-level job reports action required', () => {
    const state = createInitialWorkflowState()!;
    const top = getTopLevelJobPresentation(state.subJobs);
    expect(top.label).toBe('IN_PROGRESS — FOUNDER ACTION REQUIRED');
  });

  it('24. resolving crop flow transitions workflow view', () => {
    let state = approveAllCropsInWorkflow(createInitialWorkflowState()!);
    expect(state.workflowView).toBe('generation-plan');
  });

  it('25. v238 job hydrates with actions', () => {
    resetReconstructionWorkflowForTest();
    const state = createInitialWorkflowState();
    if (state) setReconstructionWorkflowState(state);
    expect(hydrateV238SkinsMobileJob().actionCreated).toBe(true);
    expect(getReconstructionWorkflowState()?.actions.length).toBeGreaterThan(0);
  });

  it('26. structure corrections produce visible css vars', () => {
    const corrections = buildSkinsMobileStructureCorrections();
    expect(corrections.cssVars['--skins-mobile-family-w']).not.toBe('88px');
    expect(corrections.correctionsApplied.length).toBeGreaterThan(0);
  });
});
