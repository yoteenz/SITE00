import { createHash } from 'node:crypto';
import { runFalReferenceImageJob } from '../../../../site00-visual-generation/falReferenceImageJob.js';
import { P0_VR_TWIN_V30R7MF3_LINEAGE } from '../constants.js';
import { buildMobileBlueprintTwinFromCompositionFalPrompt } from './buildMobileTwinFalPrompts.js';
import { resolveMobileTwinPublicAssetUrl } from './resolveMobileTwinPublicAssetUrl.js';
import type {
  MobileBlueprintTwinVisual,
  MobileDesignReferenceAuthority,
  MobileTwinCompositionState,
} from './types.js';

const ESTIMATED_TWIN_COST_USD = 0.08;

function hashFromUrl(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

/** Blueprint sibling render — same frozen composition + reference guidance (not Actual pixel inference). */
export async function dispatchMobileTwinFalBlueprintFromComposition(input: {
  twinId: string;
  reference: MobileDesignReferenceAuthority;
  composition: MobileTwinCompositionState;
  siblingActualRenderId: string;
  publicOrigin?: string;
}): Promise<{
  blueprint: MobileBlueprintTwinVisual;
  costUsd: number;
  providerJobRef: string;
  model: string;
}> {
  const referenceUrl = resolveMobileTwinPublicAssetUrl(input.reference.sourceImageUri, input.publicOrigin);
  const prompt = buildMobileBlueprintTwinFromCompositionFalPrompt({
    composition: input.composition,
    siblingActualRenderId: input.siblingActualRenderId,
  });

  let falResult;
  try {
    falResult = await runFalReferenceImageJob({
      jobKey: `mobile-blueprint-composition-${input.twinId}`,
      prompt,
      referenceImageUrls: [referenceUrl],
      aspectRatio: '9:16',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'BLUEPRINT_TWIN_COMPOSITION_MISMATCH';
    throw new Error(message.includes('FAL') ? message : 'MOBILE_RENDER_PROVIDER_FAILED');
  }

  const twinImageHash = hashFromUrl(`${falResult.url}:${falResult.jobRef}`);
  const blueprint: MobileBlueprintTwinVisual = {
    id: input.twinId,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    implementationRenderId: input.siblingActualRenderId,
    twinImageUri: falResult.url,
    twinImageHash,
    provider: 'FAL',
    providerJobRef: `${P0_VR_TWIN_V30R7MF3_LINEAGE}-blueprint-${falResult.jobRef}`,
    structuralSource: 'FROZEN_COMPOSITION_STATE',
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
