import { WORKSPACE_SELF_TARGET, WORKSPACE_SELF_TARGET_ID } from '../designTargetModel.js';
import { evaluateNbpHandoffReadiness } from './readiness.js';
import type { WorkspaceSelfGenerationPlan } from './generationTypes.js';
import type { WorkspaceSelfWorkflowState } from './types.js';
import { activeReadyCaptureSet } from './captureWorkflow.js';

export const WORKSPACE_SELF_NBP_MODEL = 'fal-ai/nano-banana-pro/edit';
export const WORKSPACE_SELF_CGPT_PROMPT_VERSION = 'workspace-self-cgpt-v2-single-direction';
export const WORKSPACE_SELF_GPT2_PROMPT_VERSION = 'workspace-self-gpt2-v2-single-concept';
export const WORKSPACE_SELF_NBP_PROMPT_VERSION = 'workspace-self-nbp-v2-lineage';
/** @deprecated */ export const WORKSPACE_SELF_CREATIVE_PROMPT_VERSION = WORKSPACE_SELF_CGPT_PROMPT_VERSION;

export function assertWorkspaceSelfGenerationTarget(state: WorkspaceSelfWorkflowState): void {
  if (state.targetType !== 'WORKSPACE_SELF' || state.targetId !== WORKSPACE_SELF_TARGET_ID) {
    throw new Error('WORKSPACE_SELF_TARGET_REQUIRED');
  }
}

export function buildWorkspaceSelfGenerationPlan(state: WorkspaceSelfWorkflowState): WorkspaceSelfGenerationPlan {
  assertWorkspaceSelfGenerationTarget(state);
  const readiness = evaluateNbpHandoffReadiness(state);
  if (readiness === 'BLOCKED_NO_MOBILE_CAPTURE' || readiness === 'BLOCKED_NO_DESKTOP_CAPTURE') {
    throw new Error('BLOCKED_NO_CAPTURE');
  }
  if (readiness === 'BLOCKED_NO_FUNCTION_CONTRACT' || !state.functionContract) {
    throw new Error('BLOCKED_NO_FUNCTION_CONTRACT');
  }
  const captureSet = activeReadyCaptureSet(state);
  if (!captureSet) throw new Error('BLOCKED_NO_CAPTURE');

  return {
    targetId: WORKSPACE_SELF_TARGET_ID,
    targetType: 'WORKSPACE_SELF',
    targetLabel: WORKSPACE_SELF_TARGET.displayName,
    conceptCount: 3,
    outputCount: 6,
    viewports: ['MOBILE', 'DESKTOP'],
    cgptCalls: 3,
    gpt2Calls: 3,
    nbpJobs: 6,
    creativeLayer: 'CGPT + GPT2',
    renderer: 'NBP',
    nbpPromptVersion: WORKSPACE_SELF_NBP_PROMPT_VERSION,
    captureSetId: captureSet.captureSetId,
    functionContractId: state.functionContract.contractId,
    functionContractVersion: state.functionContract.version,
    nbpModel: WORKSPACE_SELF_NBP_MODEL,
    estimatedCostNote:
      '3 CGPT direction calls (Anthropic) + 3 GPT2 single-concept calls (OpenAI text) + 6 NBP image jobs (FAL). No spend until founder confirms GENERATE.',
  };
}

export function listExpectedNbpJobKeys(): readonly string[] {
  return [
    'CONCEPT_A:MOBILE',
    'CONCEPT_A:DESKTOP',
    'CONCEPT_B:MOBILE',
    'CONCEPT_B:DESKTOP',
    'CONCEPT_C:MOBILE',
    'CONCEPT_C:DESKTOP',
  ];
}
