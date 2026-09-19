import { createHash } from 'node:crypto';
import { runFalReferenceImageJob } from '../../../../site00-visual-generation/falReferenceImageJob.js';
import { P0_VR_TWIN_V30R7MF3P6F1_LINEAGE } from '../constants.js';
import { resolveLightBlueprintStyleReferenceUrl } from './resolveLightBlueprintStyleReference.js';
import { buildMobileBlueprintTwinFromCompositionFalPrompt } from './buildMobileTwinFalPrompts.js';
import {
  buildBlueprintVisualStyleReceipt,
  buildMobileLightTechnicalBlueprintFalPrompt,
  MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID,
  R7MF3P6F1_LIGHT_BLUEPRINT_PROMPT_VERSION,
  HISTORICAL_BLUEPRINT_VARIANT,
  type BlueprintVisualStyleReceipt,
} from './blueprintVisualStyleContract.js';
import { resolveMobileTwinPublicAssetUrl } from './resolveMobileTwinPublicAssetUrl.js';
import { getMobileTwinVisualProviderStrategy } from './getMobileTwinVisualProviderStrategy.js';
import {
  assertMobileTwinNbpModelAfterJob,
  assertMobileTwinNbpModelAtDispatch,
} from './assertMobileTwinNbpProviderModel.js';
import type {
  MobileBlueprintTwinVisual,
  MobileDesignReferenceAuthority,
  MobileTwinCompositionState,
  MobileTwinPipelineState,
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
  pipeline?: MobileTwinPipelineState | null;
  providerMetadataHint?: Record<string, unknown> | null;
}): Promise<{
  blueprint: MobileBlueprintTwinVisual;
  styleReceipt: BlueprintVisualStyleReceipt;
  costUsd: number;
  providerJobRef: string;
  model: string;
}> {
  const referenceUrl = resolveMobileTwinPublicAssetUrl(input.reference.sourceImageUri, input.publicOrigin);
  const lockedRoute = input.pipeline ? getMobileTwinVisualProviderStrategy(input.pipeline) : null;
  const useLight = lockedRoute?.useLightTechnicalBlueprint ?? false;

  const styleReferenceUrl = useLight ? resolveLightBlueprintStyleReferenceUrl(input.publicOrigin) : null;
  const prompt =
    useLight ?
      buildMobileLightTechnicalBlueprintFalPrompt({
        composition: input.composition,
        siblingActualRenderId: input.siblingActualRenderId,
        styleReferenceAttached: Boolean(styleReferenceUrl),
      })
    : buildMobileBlueprintTwinFromCompositionFalPrompt({
        composition: input.composition,
        siblingActualRenderId: input.siblingActualRenderId,
      });

  const referenceImageUrls = styleReferenceUrl ? [referenceUrl, styleReferenceUrl] : [referenceUrl];

  const dispatchModel = assertMobileTwinNbpModelAtDispatch(
    lockedRoute?.blueprint.model,
    input.pipeline,
    'blueprint',
  );

  let falResult;
  try {
    falResult = await runFalReferenceImageJob({
      jobKey: `mobile-blueprint-composition-${input.twinId}`,
      prompt,
      referenceImageUrls,
      aspectRatio: '9:16',
      model: dispatchModel,
    });
  } catch (err) {
    if (lockedRoute?.locked) throw new Error('MOBILE_TWIN_NBP_PROVIDER_FAILED');
    const message = err instanceof Error ? err.message : 'BLUEPRINT_TWIN_COMPOSITION_MISMATCH';
    throw new Error(message.includes('FAL') ? message : 'MOBILE_RENDER_PROVIDER_FAILED');
  }

  assertMobileTwinNbpModelAfterJob(falResult.model, input.pipeline);

  const twinImageHash = hashFromUrl(`${falResult.url}:${falResult.jobRef}`);
  const styleReceipt = buildBlueprintVisualStyleReceipt({
    blueprintRenderId: input.twinId,
    twinImageUri: falResult.url,
    providerMetadata: input.providerMetadataHint ?? null,
    styleReferenceUsed: Boolean(styleReferenceUrl),
  });

  const blueprintStyleStatus =
    styleReceipt.result === 'PASS' ? 'PASS'
    : styleReceipt.result === 'FAIL' ? 'BLOCKED'
    : 'REVIEW_REQUIRED';

  const blueprint: MobileBlueprintTwinVisual = {
    id: input.twinId,
    compositionStateId: input.composition.id,
    compositionHash: input.composition.compositionHash,
    implementationRenderId: input.siblingActualRenderId,
    twinImageUri: falResult.url,
    twinImageHash,
    provider: 'FAL',
    providerJobRef: `${P0_VR_TWIN_V30R7MF3P6F1_LINEAGE}-blueprint-${falResult.jobRef}`,
    structuralSource: 'FROZEN_COMPOSITION_STATE',
    outputRepresentationMode: useLight ? 'LIGHT_TECHNICAL_BLUEPRINT' : 'TECHNICAL_BLUEPRINT_RENDER',
    styleContractId: useLight ? MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID : null,
    promptContractVersion: useLight ? R7MF3P6F1_LIGHT_BLUEPRINT_PROMPT_VERSION : null,
    blueprintVisualVariant:
      useLight && blueprintStyleStatus === 'PASS' ? 'ACTIVE_BLUEPRINT_TWIN'
      : useLight && blueprintStyleStatus !== 'PASS' ? HISTORICAL_BLUEPRINT_VARIANT
      : undefined,
    blueprintStyleStatus,
    styleFailureCode: styleReceipt.failureCode,
    styleReceiptId: styleReceipt.id,
    createdAt: new Date().toISOString(),
  };

  return {
    blueprint,
    styleReceipt,
    costUsd: ESTIMATED_TWIN_COST_USD,
    providerJobRef: blueprint.providerJobRef,
    model: falResult.model,
  };
}
