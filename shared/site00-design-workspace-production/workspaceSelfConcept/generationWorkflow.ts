import { WORKSPACE_CONCEPT_SLOT_IDS } from './constants.js';
import { WORKSPACE_SELF_TARGET_ID } from '../designTargetModel.js';
import type { WorkspaceGPT2AuthorityConcept } from './creativePipelineTypes.js';
import { WORKSPACE_SELF_PIPELINE_SCHEMA_SINGLE } from './pipelineLegacy.js';
import type {
  WorkspaceSelfConceptSet,
  WorkspaceSelfGeneratedArtifact,
  WorkspaceSelfGenerationStatus,
} from './generationTypes.js';
import type { WorkspaceSelfCreativePipelineSet } from './creativePipelineTypes.js';
import type { WorkspaceConceptCandidate, WorkspaceSelfWorkflowState } from './types.js';
import { defaultReviewUiState } from './reviewState.js';
import { planWorkspaceNbpRenditions } from './renditionPlanner.js';

function appendHistory(
  state: WorkspaceSelfWorkflowState,
  type: string,
  summary: string,
): WorkspaceSelfWorkflowState {
  return {
    ...state,
    history: [...state.history, { type, at: new Date().toISOString(), summary }],
  };
}

export function applyCreativePipelineSet(
  state: WorkspaceSelfWorkflowState,
  pipelineSet: WorkspaceSelfCreativePipelineSet,
): WorkspaceSelfWorkflowState {
  const gpt2Id = pipelineSet.gpt2AuthorityConcept?.conceptId ?? '—';
  return appendHistory(
    { ...state, creativePipelineSet: pipelineSet, generationStatus: 'NBP_RUNNING' },
    'workspace_creative_pipeline_ready',
    `1 GPT2 authority · ${pipelineSet.renditions.length} NBP renditions · ${gpt2Id}`,
  );
}

export function beginWorkspaceConceptSet(
  state: WorkspaceSelfWorkflowState,
  input: { captureSetId: string; functionContractId: string; creativeBriefSetId: string; createdBy: string },
): WorkspaceSelfWorkflowState {
  const conceptSet: WorkspaceSelfConceptSet = {
    conceptSetId: `wscs-${Date.now()}`,
    targetId: WORKSPACE_SELF_TARGET_ID,
    captureSetId: input.captureSetId,
    functionContractId: input.functionContractId,
    creativeBriefSetId: input.creativeBriefSetId,
    schemaVersion: WORKSPACE_SELF_PIPELINE_SCHEMA_SINGLE,
    creativeContextId: null,
    gpt2AuthorityConceptId: null,
    renditionA: null,
    renditionB: null,
    renditionC: null,
    conceptA: 'CONCEPT_A',
    conceptB: 'CONCEPT_B',
    conceptC: 'CONCEPT_C',
    status: 'NBP_RUNNING',
    createdAt: new Date().toISOString(),
    createdBy: input.createdBy,
  };
  return appendHistory(
    {
      ...state,
      conceptSet,
      generationStatus: 'NBP_RUNNING',
      generationJobs: [],
      preferredMobileConceptId: null,
      preferredDesktopConceptId: null,
      promotedMobileConceptId: null,
      promotedDesktopConceptId: null,
      pairReviewOpenedAt: null,
      pairReviewCompletedAt: null,
      authorityPair: null,
      reviewUi: { ...defaultReviewUiState(), activeConceptId: 'CONCEPT_A' },
    },
    'workspace_concept_set_started',
    conceptSet.conceptSetId,
  );
}

export function registerGenerationJobs(
  state: WorkspaceSelfWorkflowState,
  jobs: readonly WorkspaceSelfGeneratedArtifact[],
): WorkspaceSelfWorkflowState {
  return { ...state, generationJobs: [...jobs] };
}

export function applyGenerationJobResult(
  state: WorkspaceSelfWorkflowState,
  artifactId: string,
  patch: Partial<WorkspaceSelfGeneratedArtifact>,
): WorkspaceSelfWorkflowState {
  const generationJobs = state.generationJobs.map((j) =>
    j.artifactId === artifactId ? { ...j, ...patch } : j,
  );
  return { ...state, generationJobs };
}

function gpt2AuthorityToConceptFields(
  t: WorkspaceGPT2AuthorityConcept,
  slotLabel: string,
): Partial<WorkspaceConceptCandidate> {
  return {
    conceptName: slotLabel,
    conceptTerritory: t.premise,
    rationale: t.visualLanguage,
    visualStrategy: t.visualLanguage,
    layoutStrategy: t.layoutStrategy,
    informationHierarchyStrategy: t.hierarchyStrategy,
    responsiveStrategy: t.responsiveIntent,
    status: 'STAGED',
    createdAt: new Date().toISOString(),
  };
}

export function mergeGenerationArtifactsIntoConcepts(
  state: WorkspaceSelfWorkflowState,
): WorkspaceSelfWorkflowState {
  const jobs = state.generationJobs;
  const pipeline = state.creativePipelineSet;
  const gpt2 = pipeline?.gpt2AuthorityConcept ?? null;
  const renditionLabels = Object.fromEntries(
    planWorkspaceNbpRenditions().map((r) => [r.slot, r.label]),
  ) as Record<string, string>;

  let concepts = [...state.concepts];

  for (const slotId of WORKSPACE_CONCEPT_SLOT_IDS) {
    const mobileJob = jobs.find((j) => j.conceptId === slotId && j.viewport === 'MOBILE' && j.status === 'READY');
    const desktopJob = jobs.find((j) => j.conceptId === slotId && j.viewport === 'DESKTOP' && j.status === 'READY');
    concepts = concepts.map((c) => {
      if (c.conceptId !== slotId) return c;
      const base =
        gpt2 ?
          gpt2AuthorityToConceptFields(gpt2, renditionLabels[slotId] ?? slotId)
        : {};
      return {
        ...c,
        ...base,
        functionContractId: state.functionContract?.contractId ?? c.functionContractId,
        mobileArtifactPath: mobileJob?.artifactPath ?? mobileJob?.imageUri ?? c.mobileArtifactPath,
        desktopArtifactPath: desktopJob?.artifactPath ?? desktopJob?.imageUri ?? c.desktopArtifactPath,
        status:
          mobileJob?.status === 'READY' || desktopJob?.status === 'READY' ?
            ('STAGED' as const)
          : c.status,
      };
    });
  }

  const readyCount = jobs.filter((j) => j.status === 'READY').length;
  const failedCount = jobs.filter((j) => j.status === 'FAILED').length;
  let generationStatus: WorkspaceSelfGenerationStatus = 'NBP_RUNNING';
  if (readyCount === 6) generationStatus = 'READY_FOR_REVIEW';
  else if (readyCount > 0 && failedCount > 0) generationStatus = 'PARTIAL_GENERATION';
  else if (failedCount > 0 && readyCount === 0) generationStatus = 'NBP_JOB_FAILED';

  const renditions = pipeline?.renditions ?? [];
  const conceptSet =
    state.conceptSet ?
      {
        ...state.conceptSet,
        status: generationStatus,
        creativeContextId: pipeline?.creativeContext?.creativeContextId ?? state.conceptSet.creativeContextId,
        gpt2AuthorityConceptId: gpt2?.conceptId ?? state.conceptSet.gpt2AuthorityConceptId,
        renditionA: renditions.find((r) => r.slot === 'CONCEPT_A')?.renditionId ?? state.conceptSet.renditionA,
        renditionB: renditions.find((r) => r.slot === 'CONCEPT_B')?.renditionId ?? state.conceptSet.renditionB,
        renditionC: renditions.find((r) => r.slot === 'CONCEPT_C')?.renditionId ?? state.conceptSet.renditionC,
        schemaVersion: pipeline?.schemaVersion ?? state.conceptSet.schemaVersion,
      }
    : state.conceptSet;

  return appendHistory(
    {
      ...state,
      concepts,
      generationStatus,
      conceptSet,
      lastGenerationFailure:
        failedCount > 0 ?
          {
            message: `${failedCount} NBP job(s) failed`,
            at: new Date().toISOString(),
          }
        : null,
    },
    'workspace_concept_generation_completed',
    `${readyCount}/6 NBP artifacts ready`,
  );
}

export function failedGenerationJobIds(state: WorkspaceSelfWorkflowState): string[] {
  return state.generationJobs.filter((j) => j.status === 'FAILED').map((j) => j.artifactId);
}
