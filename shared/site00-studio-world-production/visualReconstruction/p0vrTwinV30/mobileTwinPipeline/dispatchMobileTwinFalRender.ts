import { createHash } from 'node:crypto';
import { runFalReferenceImageJob } from '../../../../site00-visual-generation/falReferenceImageJob.js';
import { FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER, P0_VR_TWIN_V30R7MF1_LINEAGE } from '../constants.js';
import { buildMobileImplementationRenderFalPrompt } from './buildMobileTwinFalPrompts.js';
import { REAL_PROVIDER_RENDER_MODE } from './mobileRenderClassification.js';
import { resolveMobileTwinPublicAssetUrl } from './resolveMobileTwinPublicAssetUrl.js';
import type { MobileDesignReferenceAuthority, MobileImplementationRender, MobileTwinCompositionState } from './types.js';

const ESTIMATED_RENDER_COST_USD = 0.08;

function hashFromUrl(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

export async function dispatchMobileTwinFalRender(input: {
  runId: string;
  reference: MobileDesignReferenceAuthority;
  composition: MobileTwinCompositionState;
  publicOrigin?: string;
  refineNotes?: string[];
  parentRenderId?: string | null;
  regeneration?: boolean;
}): Promise<{
  render: MobileImplementationRender;
  costUsd: number;
  providerJobRef: string;
  model: string;
}> {
  const referenceUrl = resolveMobileTwinPublicAssetUrl(input.reference.sourceImageUri, input.publicOrigin);
  const prompt = buildMobileImplementationRenderFalPrompt({
    reference: input.reference,
    composition: input.composition,
    refineNotes: input.refineNotes,
    regeneration: input.regeneration,
  });

  let falResult;
  try {
    falResult = await runFalReferenceImageJob({
      jobKey: `mobile-render-${input.runId}`,
      prompt,
      referenceImageUrls: [referenceUrl],
      aspectRatio: '9:16',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'MOBILE_RENDER_PROVIDER_FAILED';
    throw new Error(message.includes('FAL') ? message : 'MOBILE_RENDER_PROVIDER_FAILED');
  }

  const renderImageHash = hashFromUrl(`${falResult.url}:${falResult.jobRef}`);
  if (renderImageHash === input.reference.sourceImageHash) {
    throw new Error('MOBILE_RENDER_PROVIDER_FAILED');
  }

  const render: MobileImplementationRender = {
    id: input.runId,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    referenceAuthorityId: input.reference.id,
    renderImageUri: falResult.url,
    renderImageHash,
    widthPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.widthPx,
    heightPx: FOUNDER_R5F2_NDXBOOK_MOBILE_MASTER.heightPx,
    provider: 'FAL',
    providerJobRef: falResult.jobRef,
    providerModel: falResult.model,
    providerStatus: 'GENERATED',
    renderMode: REAL_PROVIDER_RENDER_MODE,
    providerArtifactType: 'REAL_VISUAL_GENERATION',
    normalizedRequest: falResult.normalizedInput,
    parentRenderId: input.parentRenderId ?? null,
    refinementScope: input.refineNotes?.length ? 'FOUNDER_REFINE' : input.regeneration ? 'REGENERATE' : null,
    founderNotes: input.refineNotes,
    providerCostUsd: ESTIMATED_RENDER_COST_USD,
    status: 'FOUNDER_REVIEW',
    createdAt: new Date().toISOString(),
  };

  return {
    render,
    costUsd: ESTIMATED_RENDER_COST_USD,
    providerJobRef: `${P0_VR_TWIN_V30R7MF1_LINEAGE}-render-${falResult.jobRef}`,
    model: falResult.model,
  };
}
