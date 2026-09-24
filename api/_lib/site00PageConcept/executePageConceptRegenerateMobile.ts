import { PAGE_CONCEPT_TARGET_TYPE } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/constants.js';
import type { PageConceptGenerationState } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import {
  mobileConceptRegenerationArtifactId,
  PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS,
  type PageMobileConceptSlotId,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamily.js';
import { parseMobileConceptSlotFromArtifactId } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCandidateReconciliation.js';
import { mergePageConceptGenerationJobs } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationWorkflow.js';
import { executePageConceptGpt2MobileConcepts } from './executePageConceptGpt2MobileConcepts.js';
import { invalidateApprovalIfNeeded } from './pageConceptRegenerateMobileDownstream.js';

function resolveSlotFromConceptId(state: PageConceptGenerationState, conceptId: string): PageMobileConceptSlotId | null {
  const mobile = state.pipelineSet?.mobileConcepts?.find((c) => c.conceptId === conceptId);
  if (mobile) return mobile.slot;
  const job = state.generationJobs.find((j) => j.gpt2AuthorityConceptId === conceptId);
  if (job) {
    const slot = parseMobileConceptSlotFromArtifactId(job.artifactId);
    if (slot) return slot;
  }
  return null;
}

export async function executePageConceptRegenerateMobileConcepts(input: {
  state: PageConceptGenerationState;
  slots: readonly PageMobileConceptSlotId[];
  dryRun?: boolean;
  mobileCaptureBase64: string;
  mobileDims: { width: number; height: number };
  runId: string;
}): Promise<{ state: PageConceptGenerationState; jobs: import('../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js').PageConceptGeneratedArtifact[] }> {
  const ps = input.state.pipelineSet;
  if (!ps?.creativeInjection || !ps.cgptCreativeBrief) {
    throw new Error('NO_VALID_CGPT_BRIEF');
  }
  if (!input.state.functionContract) throw new Error('RUN_RECOVERY_REQUIRED');

  const versionToken = String(Date.now());
  const artifactIdForSlot = (slot: PageMobileConceptSlotId) =>
    mobileConceptRegenerationArtifactId(slot, versionToken);

  const { jobs, mobileConcepts } = await executePageConceptGpt2MobileConcepts({
    runId: input.runId,
    plan: {
      targetType: PAGE_CONCEPT_TARGET_TYPE,
      projectId: input.state.projectId,
      pageId: input.state.pageId,
      projectLabel: input.state.projectId,
      pageLabel: input.state.pageId,
      cgptCalls: 1,
      gpt2Calls: input.slots.length,
      gpt2MobileConceptCount: 3,
      nbpRenditions: 0,
      nbpJobs: 0,
      outputCount: input.slots.length,
      captureSetId: ps.captureSetId,
      functionContractId: input.state.functionContract.contractId,
      estimatedCostNote: 'REGENERATE GPT2 MOBILE',
    },
    pipelineSetId: ps.pipelineSetId,
    dryRun: input.dryRun === true,
    projectContext: input.state.projectContext!,
    pageContext: input.state.pageContext!,
    functionContract: input.state.functionContract,
    creativeInjection: ps.creativeInjection,
    cgptCreativeBrief: ps.cgptCreativeBrief,
    pageArchitectureBrief: ps.pageArchitectureBrief ?? null,
    webExpressionTerritorySet: ps.webExpressionTerritorySet ?? null,
    mobileDims: input.mobileDims,
    functionalCaptureBase64: input.mobileCaptureBase64,
    existingJobs: input.state.generationJobs,
    retrySlots: input.slots,
    forceRegenerateSlots: input.slots,
    artifactIdForSlot,
  });

  let nextJobs = input.state.generationJobs;
  for (const job of jobs) {
    nextJobs = mergePageConceptGenerationJobs({ ...input.state, generationJobs: nextJobs }, [job]).generationJobs;
  }

  const mergedMobileConcepts = [...(ps.mobileConcepts ?? [])];
  for (const concept of mobileConcepts) {
    const idx = mergedMobileConcepts.findIndex((c) => c.slot === concept.slot);
    if (idx >= 0) mergedMobileConcepts[idx] = concept;
    else mergedMobileConcepts.push(concept);
  }

  let family = ps.viewportAuthorityFamily ?? null;
  if (family && input.slots.some((slot) => family?.selectedMobileConceptId && mergedMobileConcepts.some((c) => c.slot === slot))) {
    family = invalidateApprovalIfNeeded(family);
  }

  const nextState: PageConceptGenerationState = {
    ...input.state,
    generationJobs: nextJobs,
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    pipelineSet: {
      ...ps,
      mobileConcepts: mergedMobileConcepts,
      viewportAuthorityFamily: family,
    },
  };

  return { state: nextState, jobs };
}

export function resolveRegenerateMobileSlotsFromConceptId(
  state: PageConceptGenerationState,
  conceptId: string,
): PageMobileConceptSlotId {
  const slot = resolveSlotFromConceptId(state, conceptId);
  if (!slot) throw new Error('ARTIFACT_SOURCE_MISSING');
  return slot;
}

export function allMobileConceptSlots(): readonly PageMobileConceptSlotId[] {
  return PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS;
}
