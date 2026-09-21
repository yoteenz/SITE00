import type {
  PageConceptGeneratedArtifact,
  PageConceptGenerationPlan,
  PageCreativeInjection,
  PageFunctionContract,
  PageCreativeContext,
  ProjectCreativeContext,
  PageConceptCgptCreativeBrief,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import {
  mobileConceptArtifactId,
  PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS,
  type PageGpt2MobileConcept,
  type PageMobileConceptSlotId,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptViewportAuthorityFamily.js';
import { PAGE_CONCEPT_CANONICAL_PIPELINE_ID } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptCanonicalPipeline.js';
import { PAGE_NBP_MODEL } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import { compileProjectSkinContract } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectSkinContract.js';
import { pageContextForGpt2Package } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptProjectVisualIdentity.js';
import { buildPageGpt2MobileConceptRequestPackage } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptGpt2MobileRequestPackage.js';
import { renderPageGpt2MobileConceptJob } from './renderPageGpt2MobileConceptJob.js';
import { persistPageConceptMobileArtifact } from './persistPageConceptMobileArtifact.js';
import { logPageConceptGpt2MobileEvent } from './pageConceptGpt2MobileObservability.js';

export type Gpt2MobileConceptsResult = {
  jobs: PageConceptGeneratedArtifact[];
  mobileConcepts: PageGpt2MobileConcept[];
  partialFailure: boolean;
};

function stripDataUrlPrefix(base64: string): string {
  const trimmed = base64.trim();
  if (trimmed.startsWith('data:')) {
    const comma = trimmed.indexOf(',');
    if (comma === -1) return trimmed;
    return trimmed.slice(comma + 1);
  }
  return trimmed;
}

async function renderMobileConceptSlot(input: {
  runId: string;
  slot: PageMobileConceptSlotId;
  dryRun: boolean;
  pipelineSetId: string;
  plan: PageConceptGenerationPlan;
  injection: PageCreativeInjection;
  cgptBrief: PageConceptCgptCreativeBrief | null;
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  mobileDims: { width: number; height: number };
  functionalCaptureBase64: string;
  existingJob?: PageConceptGeneratedArtifact;
  retrySlots?: readonly PageMobileConceptSlotId[] | null;
}): Promise<{ concept: PageGpt2MobileConcept; job: PageConceptGeneratedArtifact }> {
  const artifactId = mobileConceptArtifactId(input.slot);
  const conceptId = `pg2m-${input.slot}-${input.pipelineSetId}`;
  const now = new Date().toISOString();

  if (input.retrySlots && input.retrySlots.length > 0 && !input.retrySlots.includes(input.slot)) {
    if (input.existingJob?.status === 'READY') {
      return {
        concept: {
          conceptId,
          slot: input.slot,
          artifactId,
          imageUri: input.existingJob.imageUri,
          status: 'READY',
          createdAt: input.existingJob.createdAt,
        },
        job: input.existingJob,
      };
    }
  }

  if (
    input.existingJob?.status === 'READY' &&
    input.existingJob.providerJobId &&
    input.existingJob.imageUri
  ) {
    return {
      concept: {
        conceptId,
        slot: input.slot,
        artifactId,
        imageUri: input.existingJob.imageUri,
        status: 'READY',
        createdAt: input.existingJob.createdAt,
      },
      job: input.existingJob,
    };
  }

  if (input.dryRun || process.env.VITEST === 'true') {
    const concept: PageGpt2MobileConcept = {
      conceptId,
      slot: input.slot,
      artifactId,
      imageUri: `data:image/png;base64,${Buffer.from(`vitest-${input.slot}`, 'utf8').toString('base64')}`,
      status: 'READY',
      createdAt: now,
    };
    const job: PageConceptGeneratedArtifact = {
      artifactId,
      projectId: input.plan.projectId,
      pageId: input.plan.pageId,
      renditionSlot: 'RENDITION_A',
      viewport: 'MOBILE',
      captureSetId: input.plan.captureSetId,
      projectContextVersion: input.projectContext.contextVersion,
      pageContextVersion: input.pageContext.contextVersion,
      functionContractId: input.functionContract.contractId,
      creativeInjectionId: input.injection.injectionId,
      gpt2AuthorityConceptId: conceptId,
      renditionId: `pg2m-rend-${input.slot}-${input.pipelineSetId}`,
      provider: 'GPT2_MOBILE',
      model: 'gpt2-mobile-concept-v1',
      providerJobId: input.dryRun ? 'dry-run' : `vitest-${input.slot}`,
      promptVersion: 'page-gpt2-mobile-concept-v1',
      createdAt: now,
      status: 'READY',
      artifactPath: null,
      imageUri: concept.imageUri,
      width: input.mobileDims.width,
      height: input.mobileDims.height,
    };
    return { concept, job };
  }

  const skinContract = compileProjectSkinContract(input.projectContext.projectId);
  const pageContextSummary = JSON.stringify(pageContextForGpt2Package(input.pageContext));
  const captureB64 = stripDataUrlPrefix(input.functionalCaptureBase64);

  const pkg = buildPageGpt2MobileConceptRequestPackage({
    runId: input.runId,
    slot: input.slot,
    conceptId,
    projectContext: input.projectContext,
    pageContext: input.pageContext,
    functionContract: input.functionContract,
    injection: input.injection,
    cgptBrief: input.cgptBrief,
    skinContract,
    functionalCaptureBase64: captureB64,
    pageContextSummary,
    mobileViewport: input.mobileDims,
  });

  const runningJob: PageConceptGeneratedArtifact = {
    artifactId,
    projectId: input.plan.projectId,
    pageId: input.plan.pageId,
    renditionSlot: 'RENDITION_A',
    viewport: 'MOBILE',
    captureSetId: input.plan.captureSetId,
    projectContextVersion: input.projectContext.contextVersion,
    pageContextVersion: input.pageContext.contextVersion,
    functionContractId: input.functionContract.contractId,
    creativeInjectionId: input.injection.injectionId,
    gpt2AuthorityConceptId: conceptId,
    renditionId: `pg2m-rend-${input.slot}-${input.pipelineSetId}`,
    provider: 'GPT2_MOBILE',
    model: PAGE_NBP_MODEL,
    providerJobId: null,
    promptVersion: pkg.inspector.promptVersion,
    createdAt: now,
    status: 'RUNNING',
    artifactPath: null,
    imageUri: null,
    width: input.mobileDims.width,
    height: input.mobileDims.height,
  };

  try {
    const render = await renderPageGpt2MobileConceptJob({
      package: pkg,
      width: input.mobileDims.width,
      height: input.mobileDims.height,
    });
    const persisted = await persistPageConceptMobileArtifact({
      runId: input.runId,
      projectId: input.plan.projectId,
      pageId: input.plan.pageId,
      conceptSlot: input.slot,
      artifactId,
      providerJobId: render.providerJobId,
      imageBase64: render.imageBase64,
      cgptBriefId: input.injection.injectionId,
      skinVersion: skinContract.version,
    });

    const concept: PageGpt2MobileConcept = {
      conceptId,
      slot: input.slot,
      artifactId,
      imageUri: persisted.publicUrl,
      status: 'READY',
      createdAt: now,
    };
    const job: PageConceptGeneratedArtifact = {
      ...runningJob,
      status: 'READY',
      providerJobId: render.providerJobId,
      model: render.model,
      artifactPath: persisted.storagePath,
      imageUri: persisted.publicUrl,
    };
    return { concept, job };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'GPT2_MOBILE_FAILED';
    logPageConceptGpt2MobileEvent('GPT2_MOBILE_PROVIDER_FAILED', {
      runId: input.runId,
      conceptSlot: input.slot,
      message,
    });
    const concept: PageGpt2MobileConcept = {
      conceptId,
      slot: input.slot,
      artifactId,
      imageUri: null,
      status: 'FAILED',
      createdAt: now,
    };
    const job: PageConceptGeneratedArtifact = {
      ...runningJob,
      status: 'FAILED',
      failureReason: message,
    };
    return { concept, job };
  }
}

export async function executePageConceptGpt2MobileConcepts(input: {
  runId: string;
  plan: PageConceptGenerationPlan;
  pipelineSetId: string;
  dryRun: boolean;
  projectContext: ProjectCreativeContext;
  pageContext: PageCreativeContext;
  functionContract: PageFunctionContract;
  creativeInjection: PageCreativeInjection;
  cgptCreativeBrief: PageConceptCgptCreativeBrief | null;
  mobileDims: { width: number; height: number };
  functionalCaptureBase64: string;
  existingJobs?: readonly PageConceptGeneratedArtifact[];
  retrySlots?: readonly PageMobileConceptSlotId[] | null;
  onSlotUpdate?: (payload: { jobs: PageConceptGeneratedArtifact[]; mobileConcepts: PageGpt2MobileConcept[] }) => void;
}): Promise<Gpt2MobileConceptsResult> {
  const jobs: PageConceptGeneratedArtifact[] = [];
  const mobileConcepts: PageGpt2MobileConcept[] = [];
  const existingByArtifact = new Map(
    (input.existingJobs ?? []).map((j) => [j.artifactId, j] as const),
  );

  const tasks = PAGE_CONCEPT_MOBILE_CONCEPT_SLOTS.map(async (slot) => {
    const artifactId = mobileConceptArtifactId(slot);
    const result = await renderMobileConceptSlot({
      runId: input.runId,
      slot,
      dryRun: input.dryRun,
      pipelineSetId: input.pipelineSetId,
      plan: input.plan,
      injection: input.creativeInjection,
      cgptBrief: input.cgptCreativeBrief,
      projectContext: input.projectContext,
      pageContext: input.pageContext,
      functionContract: input.functionContract,
      mobileDims: input.mobileDims,
      functionalCaptureBase64: input.functionalCaptureBase64,
      existingJob: existingByArtifact.get(artifactId),
      retrySlots: input.retrySlots,
    });
    return result;
  });

  const settled = await Promise.allSettled(tasks);
  for (const entry of settled) {
    if (entry.status === 'rejected') {
      continue;
    }
    mobileConcepts.push(entry.value.concept);
    jobs.push(entry.value.job);
    input.onSlotUpdate?.({ jobs: [...jobs], mobileConcepts: [...mobileConcepts] });
  }

  const partialFailure = jobs.some((j) => j.status === 'FAILED') && jobs.some((j) => j.status === 'READY');
  const allFailed = jobs.length > 0 && jobs.every((j) => j.status === 'FAILED');
  if (allFailed) {
    throw new Error('GPT2_MOBILE_CONCEPTS_FAILED');
  }

  return { jobs, mobileConcepts, partialFailure };
}

export function canonicalPipelineLineageMarker() {
  return PAGE_CONCEPT_CANONICAL_PIPELINE_ID;
}
