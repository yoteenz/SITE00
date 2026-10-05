import { createHash } from 'node:crypto';
import { runFalReferenceImageJob } from '../../../../site00-visual-generation/falReferenceImageJob.js';
import { P0_VR_TWIN_V30R7MF3_LINEAGE } from '../constants.js';
import { buildMobileBlueprintTwinFromActualTransformFalPrompt } from './buildMobileTwinFalPrompts.js';
import { resolveMobileTwinPublicAssetUrl } from './resolveMobileTwinPublicAssetUrl.js';
import type { MobileBlueprintTwinVisual, MobileImplementationRender, MobileTwinCompositionState } from './types.js';

const ESTIMATED_TWIN_COST_USD = 0.08;

function hashFromUrl(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

/** Flow B — blueprint from exact Actual image + frozen composition contract. */
export async function dispatchMobileTwinFalBlueprintFromActualTransform(input: {
  twinId: string;
  composition: MobileTwinCompositionState;
  actualRender: MobileImplementationRender;
  publicOrigin?: string;
}): Promise<{
  blueprint: MobileBlueprintTwinVisual;
  costUsd: number;
  providerJobRef: string;
  model: string;
}> {
  const actualUrl = resolveMobileTwinPublicAssetUrl(input.actualRender.renderImageUri, input.publicOrigin);
  const prompt = buildMobileBlueprintTwinFromActualTransformFalPrompt({
    composition: input.composition,
    actualRenderId: input.actualRender.id,
    actualRenderHash: input.actualRender.renderImageHash,
  });

  const falResult = await runFalReferenceImageJob({
    jobKey: `mobile-blueprint-flowb-${input.twinId}`,
    prompt,
    referenceImageUrls: [actualUrl],
    aspectRatio: '9:16',
  });

  const twinImageHash = hashFromUrl(`${falResult.url}:${falResult.jobRef}`);
  const blueprint: MobileBlueprintTwinVisual = {
    id: input.twinId,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    implementationRenderId: input.actualRender.id,
    twinImageUri: falResult.url,
    twinImageHash,
    provider: 'FAL',
    providerJobRef: `${P0_VR_TWIN_V30R7MF3_LINEAGE}-flowb-${falResult.jobRef}`,
    structuralSource: 'ACTUAL_RENDER_PIXELS',
    outputRepresentationMode: 'TECHNICAL_BLUEPRINT_RENDER',
    createdAt: new Date().toISOString(),
  };

  return {
    blueprint,
    costUsd: ESTIMATED_TWIN_COST_USD,
    providerJobRef: blueprint.providerJobRef,
    model: falResult.model,
  };
}
