import { DESIGN_PAGE_V3_PILOT_PROJECT_ID } from '../constants.js';
import {
  BLUEPRINT_DARK_MODE_VIOLATION,
  MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID,
  R7MF3P6F1_LIGHT_BLUEPRINT_PROMPT_VERSION,
} from './blueprintVisualStyleContract.js';
import { hydrateMobileTwinReviewState } from './hydrateMobileTwinReviewState.js';
import { reconcileMobileTwinPipelineState } from './reconcileMobileTwinPipelineState.js';
import { resolveMobileTwinReviewSlots } from './hydrateMobileTwinReviewState.js';
import type { MobileBlueprintTwinVisual, MobileTwinPipelineState } from './types.js';

/** Bundled founder light technical blueprint (fallback + NBP style anchor). */
export const NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT =
  '/assets/ndxbook-reconstruction/ndxbook-mobile-light-technical-blueprint-v1.jpg' as const;

export const NDXBOOK_FOUNDER_LIGHT_BLUEPRINT_MOUNT_TAG = 'FOUNDER_CANONICAL_LIGHT_BLUEPRINT_v1' as const;

const FOUNDER_LIGHT_BLUEPRINT_MOUNT_HASH = 'founder-light-bp-v1' as const;

export function isFounderCanonicalLightBlueprintUri(uri: string | null | undefined): boolean {
  if (!uri) return false;
  return uri.includes('ndxbook-mobile-light-technical-blueprint-v1');
}

export function isLiveFalBlueprintArtifact(blueprint: MobileBlueprintTwinVisual): boolean {
  const uri = blueprint.twinImageUri ?? '';
  if (blueprint.provider !== 'FAL') return false;
  if (blueprint.providerJobRef?.includes(NDXBOOK_FOUNDER_LIGHT_BLUEPRINT_MOUNT_TAG)) return false;
  if (!/^https?:\/\//i.test(uri) && !uri.startsWith('vitest-fal://')) return false;
  if (blueprint.outputRepresentationMode === 'TECHNICAL_BLUEPRINT_RENDER') return false;
  if (blueprint.styleFailureCode === BLUEPRINT_DARK_MODE_VIOLATION) return false;
  if (blueprint.blueprintStyleStatus === 'BLOCKED' || blueprint.blueprintStyleStatus === 'REVIEW_REQUIRED') {
    return false;
  }
  return true;
}

/** Only replace when review slot has no usable blueprint — never stomp a fresh FAL result. */
export function shouldApplyFounderCanonicalLightBlueprintMount(blueprint: MobileBlueprintTwinVisual): boolean {
  if (isFounderCanonicalLightBlueprintUri(blueprint.twinImageUri)) return false;
  if (isLiveFalBlueprintArtifact(blueprint)) return false;

  if (!blueprint.twinImageUri) return true;

  if (blueprint.outputRepresentationMode === 'TECHNICAL_BLUEPRINT_RENDER') return true;
  if (blueprint.blueprintStyleStatus === 'BLOCKED') return true;
  if (blueprint.styleFailureCode === BLUEPRINT_DARK_MODE_VIOLATION) return true;
  if (
    blueprint.blueprintStyleStatus === 'REVIEW_REQUIRED' &&
    blueprint.outputRepresentationMode !== 'LIGHT_TECHNICAL_BLUEPRINT'
  ) {
    return true;
  }

  return false;
}

/** Fallback: bundled founder light sheet when FAL mount missing or legacy dark contract only. */
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

  const artifactsById = { ...reconciled.artifactsById, [active.id]: blueprintTwins.find((b) => b.id === active.id)! };

  return hydrateMobileTwinReviewState({
    ...reconciled,
    blueprintTwins,
    artifactsById,
  });
}
