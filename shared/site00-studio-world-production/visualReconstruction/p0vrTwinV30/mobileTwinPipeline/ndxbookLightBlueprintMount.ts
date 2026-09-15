import { DESIGN_PAGE_V3_PILOT_PROJECT_ID } from '../constants.js';
import {
  MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID,
  R7MF3P6F1_LIGHT_BLUEPRINT_PROMPT_VERSION,
} from './blueprintVisualStyleContract.js';
import { hydrateMobileTwinReviewState } from './hydrateMobileTwinReviewState.js';
import { reconcileMobileTwinPipelineState } from './reconcileMobileTwinPipelineState.js';
import { resolveMobileTwinReviewSlots } from './hydrateMobileTwinReviewState.js';
import type { MobileBlueprintTwinVisual, MobileTwinPipelineState } from './types.js';

/** Bundled founder light technical blueprint (Design compare slot + NBP style anchor). */
export const NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT =
  '/assets/ndxbook-reconstruction/ndxbook-mobile-light-technical-blueprint-v1.jpg' as const;

export const NDXBOOK_FOUNDER_LIGHT_BLUEPRINT_MOUNT_TAG = 'FOUNDER_CANONICAL_LIGHT_BLUEPRINT_v1' as const;

const FOUNDER_LIGHT_BLUEPRINT_MOUNT_HASH = 'founder-light-bp-v1' as const;

export function isFounderCanonicalLightBlueprintUri(uri: string | null | undefined): boolean {
  if (!uri) return false;
  return uri.includes('ndxbook-mobile-light-technical-blueprint-v1');
}

function isRemoteProviderUri(uri: string | null | undefined): boolean {
  if (!uri) return false;
  return /^https?:\/\//i.test(uri) || uri.startsWith('vitest-fal://');
}

/** NDXBOOK: active review slot uses founder JPG until already mounted (FAL kept on providerTwinImageUri). */
export function shouldApplyFounderCanonicalLightBlueprintMount(blueprint: MobileBlueprintTwinVisual): boolean {
  return !isFounderCanonicalLightBlueprintUri(blueprint.twinImageUri);
}

export function applyFounderCanonicalLightBlueprintMount(
  pipeline: MobileTwinPipelineState,
  projectId: string,
): MobileTwinPipelineState {
  if (projectId.toLowerCase() !== DESIGN_PAGE_V3_PILOT_PROJECT_ID) return pipeline;

  const reconciled = reconcileMobileTwinPipelineState(pipeline, projectId);
  const slots = resolveMobileTwinReviewSlots(reconciled);
  const active = slots.blueprintTwin;
  if (!active?.id) return pipeline;
  if (!shouldApplyFounderCanonicalLightBlueprintMount(active)) return pipeline;

  const preservedFal =
    active.providerTwinImageUri ??
    (isRemoteProviderUri(active.twinImageUri) && !isFounderCanonicalLightBlueprintUri(active.twinImageUri) ?
      active.twinImageUri
    : undefined);

  const blueprintTwins = reconciled.blueprintTwins.map((bp) => {
    if (bp.id !== active.id) {
      if (
        bp.implementationRenderId === active.implementationRenderId &&
        bp.id !== active.id &&
        (bp.blueprintVisualVariant === 'ACTIVE_BLUEPRINT_TWIN' || bp.blueprintVisualVariant === 'CANONICAL_LIGHT')
      ) {
        return { ...bp, blueprintVisualVariant: 'HISTORICAL_BLUEPRINT_VARIANT' as const };
      }
      return bp;
    }
    return {
      ...bp,
      providerTwinImageUri: preservedFal,
      twinImageUri: NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT,
      twinImageHash: FOUNDER_LIGHT_BLUEPRINT_MOUNT_HASH,
      outputRepresentationMode: 'LIGHT_TECHNICAL_BLUEPRINT' as const,
      styleContractId: MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID,
      promptContractVersion: R7MF3P6F1_LIGHT_BLUEPRINT_PROMPT_VERSION,
      blueprintVisualVariant: 'ACTIVE_BLUEPRINT_TWIN' as const,
      blueprintStyleStatus: 'PASS' as const,
      styleFailureCode: null,
      provider: 'LOCAL_COMPILER' as const,
      providerJobRef: `${NDXBOOK_FOUNDER_LIGHT_BLUEPRINT_MOUNT_TAG}-${active.id}`,
    };
  });

  const mounted = blueprintTwins.find((b) => b.id === active.id)!;
  const artifactsById = { ...reconciled.artifactsById, [active.id]: mounted };

  return hydrateMobileTwinReviewState({
    ...reconciled,
    blueprintTwins,
    artifactsById,
  });
}
