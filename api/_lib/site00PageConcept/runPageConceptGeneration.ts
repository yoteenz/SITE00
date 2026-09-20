import { planPageNbpRenditions } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/renditionPlanner.js';
import {
  buildPageConceptGenerationPlan,
  PAGE_NBP_MODEL,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import type {
  PageConceptGeneratedArtifact,
  PageConceptGenerationRunResult,
  PageConceptGenerationState,
  PageConceptPipelineSet,
  PageConceptRendition,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';
import { PAGE_CONCEPT_TARGET_TYPE } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/constants.js';
import { generatePageCreativeInjection } from './generatePageCreativeInjection.js';
import { generatePageGpt2AuthorityConcept } from './generatePageGpt2AuthorityConcept.js';
import { renderPageNbpJob } from './renderPageNbpJob.js';

export type PageGenerationCapturePayload = {
  captureId: string;
  artifactBase64: string;
  width: number;
  height: number;
};

export type RunPageConceptGenerationInput = {
  state: PageConceptGenerationState;
  mobileCapture: PageGenerationCapturePayload;
  desktopCapture: PageGenerationCapturePayload;
  founderConfirmedSpend: boolean;
};

export function planPageConceptGeneration(
  projectId: string,
  pageId: string,
): ReturnType<typeof buildPageConceptGenerationPlan> {
  return buildPageConceptGenerationPlan(projectId, pageId);
}

export async function runPageConceptGeneration(
  input: RunPageConceptGenerationInput,
): Promise<PageConceptGenerationRunResult> {
  if (!input.founderConfirmedSpend) throw new Error('SPEND_GUARD: founder confirmation required');
  if (input.state.targetType !== PAGE_CONCEPT_TARGET_TYPE) {
    throw new Error('PAGE_TARGET_REQUIRED');
  }
  if (
    input.state.projectId !== input.state.projectContext?.projectId ||
    input.state.pageId !== input.state.pageContext?.pageId
  ) {
    throw new Error('PAGE_STATE_MISMATCH');
  }

  const plan = buildPageConceptGenerationPlan(input.state.projectId, input.state.pageId);
  const projectContext = input.state.projectContext!;
  const pageContext = input.state.pageContext!;
  const functionContract = input.state.functionContract!;

  let creativeInjection = input.state.pipelineSet?.creativeInjection ?? null;
  let gpt2Authority = input.state.pipelineSet?.gpt2AuthorityConcept ?? null;
  let creativeInjectionError = input.state.pipelineSet?.creativeInjectionError;
  let gpt2AuthorityError = input.state.pipelineSet?.gpt2AuthorityError;

  const pipelineSetId = input.state.pipelineSet?.pipelineSetId ?? `pps-${Date.now()}`;

  try {
    creativeInjection = await generatePageCreativeInjection({
      projectContext,
      pageContext,
      functionContract,
    });
    creativeInjectionError = undefined;
  } catch (err) {
    creativeInjectionError = err instanceof Error ? err.message : 'CGPT_INJECTION_FAILED';
    creativeInjection = null;
  }

  if (creativeInjection && !gpt2Authority && !gpt2AuthorityError) {
    try {
      gpt2Authority = await generatePageGpt2AuthorityConcept({ injection: creativeInjection, functionContract });
      gpt2AuthorityError = undefined;
    } catch (err) {
      gpt2AuthorityError = err instanceof Error ? err.message : 'GPT2_AUTHORITY_FAILED';
      gpt2Authority = null;
    }
  }

  const completed: PageConceptGeneratedArtifact[] = [];
  const renditions: PageConceptRendition[] = [];

  if (creativeInjection && gpt2Authority) {
    for (const rp of planPageNbpRenditions()) {
      const renditionId = `prend-${rp.slot}-${pipelineSetId}`;
      let mobileArtifactId: string | null = null;
      let desktopArtifactId: string | null = null;
      let failed = false;

      for (const viewport of ['MOBILE', 'DESKTOP'] as const) {
        const artifactId = `pcga-${rp.slot}-${viewport}`;
        const running: PageConceptGeneratedArtifact = {
          artifactId,
          projectId: input.state.projectId,
          pageId: input.state.pageId,
          renditionSlot: rp.slot,
          viewport,
          captureSetId: plan.captureSetId,
          projectContextVersion: projectContext.contextVersion,
          pageContextVersion: pageContext.contextVersion,
          functionContractId: functionContract.contractId,
          creativeInjectionId: creativeInjection.injectionId,
          gpt2AuthorityConceptId: gpt2Authority.conceptId,
          renditionId,
          provider: 'NBP',
          model: PAGE_NBP_MODEL,
          providerJobId: null,
          promptVersion: 'page-nbp-v1',
          createdAt: new Date().toISOString(),
          status: 'RUNNING',
          artifactPath: null,
          imageUri: null,
          width: viewport === 'MOBILE' ? input.mobileCapture.width : input.desktopCapture.width,
          height: viewport === 'MOBILE' ? input.mobileCapture.height : input.desktopCapture.height,
        };

        try {
          const ref =
            viewport === 'MOBILE' ? input.mobileCapture.artifactBase64 : input.desktopCapture.artifactBase64;
          const dims = viewport === 'MOBILE' ? input.mobileCapture : input.desktopCapture;
          const render = await renderPageNbpJob({
            gpt2Authority,
            creativeInjection,
            renditionSlot: rp.slot,
            renditionDirective: rp.renditionDirective,
            viewport,
            referenceImageBase64: ref,
            width: dims.width,
            height: dims.height,
            functionContract,
          });
          completed.push({
            ...running,
            status: 'READY',
            providerJobId: render.providerJobId,
            imageUri: `data:image/png;base64,${render.imageBase64}`,
          });
          if (viewport === 'MOBILE') mobileArtifactId = artifactId;
          else desktopArtifactId = artifactId;
        } catch (err) {
          failed = true;
          completed.push({
            ...running,
            status: 'FAILED',
            failureReason: err instanceof Error ? err.message : 'NBP_FAILED',
          });
        }
      }

      renditions.push({
        renditionId,
        slot: rp.slot,
        sourceGpt2ConceptId: gpt2Authority.conceptId,
        mobileArtifactId,
        desktopArtifactId,
        status:
          mobileArtifactId && desktopArtifactId ? 'READY'
          : failed ? 'FAILED'
          : mobileArtifactId || desktopArtifactId ? 'PARTIAL'
          : 'PENDING',
        renditionDirective: rp.renditionDirective,
      });
    }
  }

  const pipelineSet: PageConceptPipelineSet = {
    pipelineSetId,
    projectId: input.state.projectId,
    pageId: input.state.pageId,
    targetType: PAGE_CONCEPT_TARGET_TYPE,
    captureSetId: plan.captureSetId,
    functionContractId: functionContract.contractId,
    creativeInjection,
    gpt2AuthorityConcept: gpt2Authority,
    renditions,
    creativeInjectionError,
    gpt2AuthorityError,
    createdAt: new Date().toISOString(),
  };

  return { plan, pipelineSet, jobs: completed };
}
