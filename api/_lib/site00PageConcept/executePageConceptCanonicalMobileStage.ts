import type { PageConceptRunProgress } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptServerRun.js';
import type {
  PageConceptGenerationPlan,
  PageConceptGenerationRunResult,
  PageConceptPipelineSet,
  PageCreativeInjection,
  PageConceptCgptCreativeBrief,
  PageFunctionContract,
  PageCreativeContext,
  ProjectCreativeContext,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { PAGE_CONCEPT_TARGET_TYPE } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/constants.js';
import { PAGE_CONCEPT_CANONICAL_PIPELINE_ID } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCanonicalPipeline.js';
import { pageConceptProgressPatchForGpt2 } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptLiveProgress.js';
import { executePageConceptGpt2MobileConcepts } from './executePageConceptGpt2MobileConcepts.js';

export async function executePageConceptCanonicalMobileStage(input: {
  runId: string;
  plan: PageConceptGenerationPlan;
  pipelineSetId: string;
  dryRun: boolean;
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  creativeInjection: PageCreativeInjection;
  cgptCreativeBrief: PageConceptCgptCreativeBrief | null;
  pageArchitectureBrief?: import('../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptPageArchitectureBrief.js').PageConceptPageArchitectureBrief | null;
  creativeInjectionError?: string;
  mobileDims: { width: number; height: number };
  functionalCaptureBase64: string;
  existingJobs?: import('../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js').PageConceptGeneratedArtifact[];
  retrySlots?: import('../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamily.js').PageMobileConceptSlotId[] | null;
  onProgress?: (patch: PageConceptRunProgress) => void;
}): Promise<PageConceptGenerationRunResult> {
  const emit = (patch: PageConceptRunProgress) => {
    input.onProgress?.({ ...patch, updatedAt: new Date().toISOString() });
  };

  const gpt2Start = pageConceptProgressPatchForGpt2();
  emit({
    status: 'GPT2_RUNNING',
    currentStage: gpt2Start.currentStage,
    panelProgress: gpt2Start.panelProgress,
    cgptStatus: 'COMPLETE',
    gpt2Status: 'RUNNING',
    nbpStatus: 'PENDING',
    generationStatus: 'GPT2_RUNNING',
    error: null,
    completedAt: null,
  });

  const { jobs, mobileConcepts, partialFailure, screenshotFunctionalPageMap, webExpressionTerritorySet } =
    await executePageConceptGpt2MobileConcepts({
    runId: input.runId,
    plan: input.plan,
    pipelineSetId: input.pipelineSetId,
    dryRun: input.dryRun,
    projectContext: input.projectContext,
    pageContext: input.pageContext,
    functionContract: input.functionContract,
    creativeInjection: input.creativeInjection,
    cgptCreativeBrief: input.cgptCreativeBrief,
    pageArchitectureBrief: input.pageArchitectureBrief ?? null,
    mobileDims: input.mobileDims,
    functionalCaptureBase64: input.functionalCaptureBase64,
    existingJobs: input.existingJobs,
    retrySlots: input.retrySlots,
    onSlotUpdate: (payload) => {
      emit({
        status: 'GPT2_RUNNING',
        currentStage: 'GPT2_MOBILE_CONCEPT_SLOT',
        cgptStatus: 'COMPLETE',
        gpt2Status: 'RUNNING',
        nbpStatus: 'PENDING',
        generationStatus: 'GPT2_RUNNING',
        jobs: payload.jobs,
        pipelineSet: {
          pipelineSetId: input.pipelineSetId,
          projectId: input.plan.projectId,
          pageId: input.plan.pageId,
          targetType: PAGE_CONCEPT_TARGET_TYPE,
          captureSetId: input.plan.captureSetId,
          functionContractId: input.functionContract.contractId,
          creativeInjection: input.creativeInjection,
          cgptCreativeBrief: input.cgptCreativeBrief,
          pageArchitectureBrief: input.pageArchitectureBrief ?? null,
          screenshotFunctionalPageMap: payload.screenshotFunctionalPageMap,
          webExpressionTerritorySet: payload.webExpressionTerritorySet,
          gpt2AuthorityConcept: null,
          renditions: [],
          mobileConcepts: payload.mobileConcepts,
          selectedMobileConceptId: null,
          pipelineLineage: PAGE_CONCEPT_CANONICAL_PIPELINE_ID,
          creativeInjectionError: input.creativeInjectionError,
          createdAt: new Date().toISOString(),
        },
        error: null,
        completedAt: null,
      });
    },
  });

  const pipelineSet: PageConceptPipelineSet = {
    pipelineSetId: input.pipelineSetId,
    projectId: input.plan.projectId,
    pageId: input.plan.pageId,
    targetType: PAGE_CONCEPT_TARGET_TYPE,
    captureSetId: input.plan.captureSetId,
    functionContractId: input.functionContract.contractId,
    creativeInjection: input.creativeInjection,
    cgptCreativeBrief: input.cgptCreativeBrief,
    pageArchitectureBrief: input.pageArchitectureBrief ?? null,
    screenshotFunctionalPageMap,
    webExpressionTerritorySet,
    gpt2AuthorityConcept: null,
    renditions: [],
    mobileConcepts,
    selectedMobileConceptId: null,
    pipelineLineage: PAGE_CONCEPT_CANONICAL_PIPELINE_ID,
    creativeInjectionError: input.creativeInjectionError,
    createdAt: new Date().toISOString(),
  };

  const allReady = mobileConcepts.every((c) => c.status === 'READY');
  emit({
    status: allReady ? 'READY_FOR_REVIEW' : 'GPT2_RUNNING',
    currentStage: allReady ? 'GPT2_MOBILE_CONCEPTS_READY' : 'GPT2_MOBILE_PARTIAL',
    panelProgress: gpt2Start.panelProgress,
    cgptStatus: 'COMPLETE',
    gpt2Status: allReady ? 'COMPLETE' : 'RUNNING',
    nbpStatus: 'PENDING',
    generationStatus: allReady ? 'GPT2_MOBILE_AWAITING_SELECTION' : 'GPT2_RUNNING',
    pipelineSet,
    jobs,
    error: partialFailure ? 'GPT2_MOBILE_PARTIAL_FAILURE' : null,
    completedAt: allReady ? new Date().toISOString() : null,
  });

  return { plan: input.plan, pipelineSet, jobs };
}
