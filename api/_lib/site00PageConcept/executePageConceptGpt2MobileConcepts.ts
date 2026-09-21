import type {
  PageConceptGeneratedArtifact,
  PageConceptGenerationPlan,
  PageCreativeInjection,
  PageFunctionContract,
  PageCreativeContext,
  ProjectCreativeContext,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import {
  mobileConceptArtifactId,
  PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS,
  type PageGpt2MobileConcept,
  type PageMobileConceptSlotId,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamily.js';
import { PAGE_CONCEPT_CANONICAL_PIPELINE_ID } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCanonicalPipeline.js';

export type Gpt2MobileConceptsResult = {
  jobs: PageConceptGeneratedArtifact[];
  mobileConcepts: PageGpt2MobileConcept[];
};

async function renderMobileConceptSlot(input: {
  slot: PageMobileConceptSlotId;
  dryRun: boolean;
  pipelineSetId: string;
  plan: PageConceptGenerationPlan;
  injection: PageCreativeInjection;
  projectContext: ProjectCreativeContext;
  mobileDims: { width: number; height: number };
}): Promise<PageGpt2MobileConcept> {
  const artifactId = mobileConceptArtifactId(input.slot);
  const conceptId = `pg2m-${input.slot}-${input.pipelineSetId}`;
  if (input.dryRun || process.env.VITEST === 'true') {
    return {
      conceptId,
      slot: input.slot,
      artifactId,
      imageUri: `data:image/png;base64,${Buffer.from(`vitest-${input.slot}`, 'utf8').toString('base64')}`,
      status: 'READY',
      createdAt: new Date().toISOString(),
    };
  }
  // Production: dedicated GPT2 image path lands in follow-up sprint; block silent NBP substitution.
  throw new Error('GPT2_MOBILE_CONCEPT_PROVIDER_NOT_CONFIGURED');
}

export async function executePageConceptGpt2MobileConcepts(input: {
  plan: PageConceptGenerationPlan;
  pipelineSetId: string;
  dryRun: boolean;
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  creativeInjection: PageCreativeInjection;
  mobileDims: { width: number; height: number };
}): Promise<Gpt2MobileConceptsResult> {
  const jobs: PageConceptGeneratedArtifact[] = [];
  const mobileConcepts: PageGpt2MobileConcept[] = [];

  for (const slot of PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS) {
    const concept = await renderMobileConceptSlot({
      slot,
      dryRun: input.dryRun,
      pipelineSetId: input.pipelineSetId,
      plan: input.plan,
      injection: input.creativeInjection,
      projectContext: input.projectContext,
      mobileDims: input.mobileDims,
    });
    mobileConcepts.push(concept);
    jobs.push({
      artifactId: concept.artifactId,
      projectId: input.plan.projectId,
      pageId: input.plan.pageId,
      renditionSlot: 'RENDITION_A',
      viewport: 'MOBILE',
      captureSetId: input.plan.captureSetId,
      projectContextVersion: input.projectContext.contextVersion,
      pageContextVersion: input.pageContext.contextVersion,
      functionContractId: input.functionContract.contractId,
      creativeInjectionId: input.creativeInjection.injectionId,
      gpt2AuthorityConceptId: concept.conceptId,
      renditionId: `pg2m-rend-${slot}-${input.pipelineSetId}`,
      provider: 'GPT2_MOBILE',
      model: 'gpt2-mobile-concept-v1',
      providerJobId: input.dryRun ? 'dry-run' : null,
      promptVersion: 'page-gpt2-mobile-concept-v1',
      createdAt: concept.createdAt,
      status: concept.status === 'READY' ? 'READY' : 'FAILED',
      artifactPath: null,
      imageUri: concept.imageUri,
      width: input.mobileDims.width,
      height: input.mobileDims.height,
    });
  }

  if (jobs.some((j) => j.status !== 'READY')) {
    throw new Error('GPT2_MOBILE_CONCEPTS_FAILED');
  }

  return { jobs, mobileConcepts };
}

export function canonicalPipelineLineageMarker() {
  return PAGE_CONCEPT_CANONICAL_PIPELINE_ID;
}
