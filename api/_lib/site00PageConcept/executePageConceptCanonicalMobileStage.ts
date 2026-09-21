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
  plan: PageConceptGenerationPlan;
  pipelineSetId: string;
  dryRun: boolean;
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  creativeInjection: PageCreativeInjection;
  cgptCreativeBrief: PageConceptCgptCreativeBrief | null;
  creativeInjectionError?: string;
  mobileDims: { width: number; height: number };
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

  const { jobs, mobileConcepts } = await executePageConceptGpt2MobileConcepts({
    plan: input.plan,
    pipelineSetId: input.pipelineSetId,
    dryRun: input.dryRun,
    projectContext: input.projectContext,
    pageContext: input.pageContext,
    functionContract: input.functionContract,
    creativeInjection: input.creativeInjection,
    mobileDims: input.mobileDims,
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
    gpt2AuthorityConcept: null,
    renditions: [],
    mobileConcepts,
    selectedMobileConceptId: null,
    pipelineLineage: PAGE_CONCEPT_CANONICAL_PIPELINE_ID,
    creativeInjectionError: input.creativeInjectionError,
    createdAt: new Date().toISOString(),
  };

  emit({
    status: 'GPT2_MOBILE_AWAITING_SELECTION',
    currentStage: 'GPT2_MOBILE_CONCEPTS_READY',
    panelProgress: gpt2Start.panelProgress,
    cgptStatus: 'COMPLETE',
    gpt2Status: 'COMPLETE',
    nbpStatus: 'PENDING',
    generationStatus: 'GPT2_MOBILE_AWAITING_SELECTION',
    pipelineSet,
    jobs,
    error: null,
    completedAt: new Date().toISOString(),
  });

  return { plan: input.plan, pipelineSet, jobs };
}
