import { DESIGN_PAGE_V3_PILOT_PROJECT_ID } from '../constants.js';
import {
  MOBILE_LIGHT_TECHNICAL_BLUEPRINT_CONTRACT_ID,
  R7MF3P6F1_LIGHT_BLUEPRINT_PROMPT_VERSION,
} from './blueprintVisualStyleContract.js';
import { hydrateMobileTwinReviewState } from './hydrateMobileTwinReviewState.js';
import { reconcileMobileTwinPipelineState } from './reconcileMobileTwinPipelineState.js';
import { resolveMobileTwinReviewSlots } from './hydrateMobileTwinReviewState.js';
import type { MobileTwinPipelineState } from './types.js';

/** Bundled founder light technical blueprint (Design compare slot + NBP style anchor). */
export const NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT =
  '/assets/ndxbook-reconstruction/ndxbook-mobile-light-technical-blueprint-v1.jpg' as const;

export const NDXBOOK_FOUNDER_LIGHT_BLUEPRINT_MOUNT_TAG = 'FOUNDER_CANONICAL_LIGHT_BLUEPRINT_v1' as const;

const FOUNDER_LIGHT_BLUEPRINT_MOUNT_HASH = 'founder-light-bp-v1' as const;

/** Swap active review blueprint URI to bundled founder light sheet (NDXBOOK pilot). */
export function applyFounderCanonicalLightBlueprintMount(
  pipeline: MobileTwinPipelineState,
  projectId: string,
): MobileTwinPipelineState {
  if (projectId.toLowerCase() !== DESIGN_PAGE_V3_PILOT_PROJECT_ID) return pipeline;

  const reconciled = reconcileMobileTwinPipelineState(pipeline, projectId);
  const slots = resolveMobileTwinReviewSlots(reconciled);
  const active = slots.blueprintTwin;
  if (!active?.id) return pipeline;

  if (
    active.twinImageUri === NDXBOOK_MOBILE_LIGHT_TECHNICAL_BLUEPRINT_MOUNT &&
    active.providerJobRef?.includes(NDXBOOK_FOUNDER_LIGHT_BLUEPRINT_MOUNT_TAG)
  ) {
    return pipeline;
  }

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
