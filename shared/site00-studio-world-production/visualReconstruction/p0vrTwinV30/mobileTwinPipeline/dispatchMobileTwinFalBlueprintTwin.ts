import { createHash } from 'node:crypto';
import { runFalReferenceImageJob } from '../../../../site00-visual-generation/falReferenceImageJob.js';
import { P0_VR_TWIN_V30R7MF1_LINEAGE } from '../constants.js';
import { buildMobileBlueprintTwinFalPrompt } from './buildMobileTwinFalPrompts.js';
import { resolveMobileTwinPublicAssetUrl } from './resolveMobileTwinPublicAssetUrl.js';
import type {
  MobileBlueprintTwinVisual,
  MobileImplementationRender,
  MobileImplementationVisualAuthority,
  MobileTwinCompositionState,
} from './types.js';

const ESTIMATED_TWIN_COST_USD = 0.08;

function hashFromUrl(url: string): string {
  return createHash('sha256').update(url).digest('hex');
}

export async function dispatchMobileTwinFalBlueprintTwin(input: {
  twinId: string;
  composition: MobileTwinCompositionState;
  render: MobileImplementationRender;
  visualAuthority: MobileImplementationVisualAuthority;
  publicOrigin?: string;
}): Promise<{
  blueprint: MobileBlueprintTwinVisual;
  costUsd: number;
}> {
  if (input.render.renderMode !== 'REAL_PROVIDER_RENDER' && input.render.provider !== 'FAL') {
    throw new Error('MOBILE_RENDER_NOT_APPROVED');
  }

  const implementationRenderUrl = resolveMobileTwinPublicAssetUrl(input.render.renderImageUri, input.publicOrigin);
  const prompt = buildMobileBlueprintTwinFalPrompt({
    composition: input.composition,
    implementationRenderId: input.render.id,
    implementationRenderHash: input.render.renderImageHash,
    implementationVisualAuthorityId: input.visualAuthority.id,
  });

  let falResult;
  try {
    falResult = await runFalReferenceImageJob({
      jobKey: `mobile-blueprint-twin-${input.twinId}`,
      prompt,
      referenceImageUrls: [implementationRenderUrl],
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
    implementationRenderId: input.render.id,
    twinImageUri: falResult.url,
    twinImageHash,
    provider: 'FAL',
    providerJobRef: `${P0_VR_TWIN_V30R7MF1_LINEAGE}-twin-${falResult.jobRef}`,
    createdAt: new Date().toISOString(),
  };

  return { blueprint, costUsd: ESTIMATED_TWIN_COST_USD };
}
