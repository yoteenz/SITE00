/**
 * P0.VR.REPLICATION.1 — Founder-facing experience state (not forensic internals).
 */

import type { PageCreativeUpgradeSession } from '../p0vrCapture1/types.js';
import type { ReconstructionTwinSession } from '../p0vrUpgrade2/types.js';
import type { ReconstructionExperienceState } from './types.js';

export function resolveReconstructionExperienceState(input: {
  session: PageCreativeUpgradeSession;
  twinSession?: ReconstructionTwinSession | null;
  buildingTwin?: boolean;
}): ReconstructionExperienceState {
  const twin = input.twinSession;
  if (twin?.status === 'PROMOTED') return 'PROMOTED';
  if (twin?.status === 'FAILED') return 'FAILED';
  if (twin?.status === 'BUILDING' || input.buildingTwin) return 'REPLICATING';
  if (twin?.status === 'REVISING' || twin?.status === 'REVISION_REQUESTED') return 'REFINING';
  if (twin?.status === 'APPROVED_FOR_PROMOTION') return 'PROMOTION_READY';
  if (twin && ['READY_FOR_REVIEW', 'VERIFYING'].includes(twin.status)) return 'REVIEW_READY';
  return 'REFERENCE_READY';
}

export const EXPERIENCE_STEP_LABELS = [
  'REFERENCE',
  'REPLICATE',
  'REVIEW',
  'REFINE',
  'PROMOTE',
] as const;

export function experienceStepIndex(state: ReconstructionExperienceState): number {
  switch (state) {
    case 'REFERENCE_READY':
      return 0;
    case 'REPLICATING':
      return 1;
    case 'REVIEW_READY':
      return 2;
    case 'REFINING':
      return 3;
    case 'PROMOTION_READY':
    case 'PROMOTED':
      return 4;
    case 'FAILED':
      return 1;
    default:
      return 0;
  }
}
