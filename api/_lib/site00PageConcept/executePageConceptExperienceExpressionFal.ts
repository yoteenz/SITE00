/**
 * P0.VR.EXPERIENCE-EXPRESSION-FAL-GENERATION-REVIEW-AND-HANDOFF1
 */

import { buildFalImageInput } from '../../../shared/site00-visual-generation/falImageModels.js';
import { resolvePageGpt2MobileFalModel } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/generationPlan.js';
import {
  PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION,
  type ExperienceExpressionFalTarget,
} from '../../../shared/site00-design-workspace-production/pageConceptPipeline/pageConceptExperienceExpressionFalPlan.js';
import type { PageConceptGeneratedArtifact } from '../../../shared/site00-design-workspace-production/pageConceptPipeline/types.js';

export type ExperienceExpressionFalRenderResult = {
  stateId: string;
  label: string;
  artifactId: string;
  imageUri: string;
  providerJobId: string;
  model: string;
  job: PageConceptGeneratedArtifact;
};

function parseMobileB64(imageUri: string | null): string {
  if (!imageUri?.trim()) throw new Error('EXPERIENCE_MOBILE_AUTHORITY_IMAGE_MISSING');
  const m = imageUri.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (m?.[1]) return m[1];
  if (!imageUri.includes('data:')) return imageUri;
  throw new Error('EXPERIENCE_MOBILE_AUTHORITY_PARSE_FAILED');
}

export async function renderExperienceExpressionFalTarget(input: {
  target: ExperienceExpressionFalTarget;
  mobileAuthorityImageUri: string;
  planMeta: {
    projectId: string;
    pageId: string;
    captureSetId: string;
    projectContextVersion: string;
    pageContextVersion: string;
    functionContractId: string;
    creativeInjectionId: string;
    selectedMobileConceptId: string;
    experienceAuthorityId: string;
  };
  dryRun?: boolean;
}): Promise<ExperienceExpressionFalRenderResult> {
  const artifactId = `pcga-EXP-${input.target.stateId.toUpperCase()}-${input.planMeta.experienceAuthorityId.slice(-10)}`;
  const renditionId = `pex-${input.target.stateId}-${Date.now()}`;

  if (process.env.VITEST === 'true' || input.dryRun) {
    const imageUri = `data:image/png;base64,${Buffer.from(`vitest-experience-${input.target.stateId}`, 'utf8').toString('base64')}`;
    const providerJobId = `vitest-fal-experience-${input.target.stateId}`;
    return {
      stateId: input.target.stateId,
      label: input.target.label,
      artifactId,
      imageUri,
      providerJobId,
      model: 'vitest-fal-experience',
      job: {
        artifactId,
        projectId: input.planMeta.projectId,
        pageId: input.planMeta.pageId,
        renditionSlot: 'RENDITION_A',
        viewport: 'MOBILE',
        captureSetId: input.planMeta.captureSetId,
        projectContextVersion: input.planMeta.projectContextVersion,
        pageContextVersion: input.planMeta.pageContextVersion,
        functionContractId: input.planMeta.functionContractId,
        creativeInjectionId: input.planMeta.creativeInjectionId,
        gpt2AuthorityConceptId: input.planMeta.selectedMobileConceptId,
        renditionId,
        provider: 'FAL_EXPERIENCE',
        model: 'vitest-fal-experience',
        providerJobId,
        promptVersion: PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION,
        createdAt: new Date().toISOString(),
        status: 'READY',
        artifactPath: null,
        imageUri,
        width: 780,
        height: 1688,
        displayTitle: input.target.label,
      },
    };
  }

  const falKey = process.env.FAL_KEY?.trim();
  if (!falKey) throw new Error('EXPERIENCE_EXPRESSION_FAL_FAILED: FAL_KEY not configured');

  const { fal } = await import('@fal-ai/client');
  fal.config({ credentials: falKey });

  const mobileB64 = parseMobileB64(input.mobileAuthorityImageUri);
  const refUrl = await fal.storage.upload(
    new File([Buffer.from(mobileB64, 'base64')], `experience-anchor-${input.target.stateId}.png`, {
      type: 'image/png',
    }),
  );

  const { model, input: falInput } = buildFalImageInput({
    prompt: input.target.prompt,
    aspectRatio: '9:16',
    referenceImageUrls: [refUrl],
    outputFormat: 'png',
    referenceEditImageSize: 'portrait_16_9',
  });

  const result = (await fal.subscribe(model, { input: falInput, logs: false })) as {
    request_id?: string;
    data?: { images?: { url?: string }[] };
  };

  const providerJobId = result.request_id ?? `fal-experience-${Date.now()}`;
  const imageUrl = result.data?.images?.[0]?.url;
  if (!imageUrl) throw new Error('EXPERIENCE_EXPRESSION_FAL_FAILED: no image');

  const imgRes = await fetch(imageUrl);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  const imageUri = `data:image/png;base64,${buf.toString('base64')}`;

  return {
    stateId: input.target.stateId,
    label: input.target.label,
    artifactId,
    imageUri,
    providerJobId,
    model: resolvePageGpt2MobileFalModel(1),
    job: {
      artifactId,
      projectId: input.planMeta.projectId,
      pageId: input.planMeta.pageId,
      renditionSlot: 'RENDITION_A',
      viewport: 'MOBILE',
      captureSetId: input.planMeta.captureSetId,
      projectContextVersion: input.planMeta.projectContextVersion,
      pageContextVersion: input.planMeta.pageContextVersion,
      functionContractId: input.planMeta.functionContractId,
      creativeInjectionId: input.planMeta.creativeInjectionId,
      gpt2AuthorityConceptId: input.planMeta.selectedMobileConceptId,
      renditionId,
      provider: 'FAL_EXPERIENCE',
      model,
      providerJobId,
      promptVersion: PAGE_EXPERIENCE_EXPRESSION_FAL_PROMPT_VERSION,
      createdAt: new Date().toISOString(),
      status: 'READY',
      artifactPath: null,
      imageUri,
      width: 780,
      height: 1688,
      displayTitle: input.target.label,
    },
  };
}
