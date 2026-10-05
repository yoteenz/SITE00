/**
 * Derives founder-visible visual production state from formation + completeness.
 */

import type { CoreDirectionFormationRecord, CoreDirectionFormationStatus } from './types.js';
import { assessFormationProductionCompleteness } from './directionFieldContract.js';

export type VisualProductionState =
  | 'FORMING DIRECTIONS'
  | 'PREPARING VISUAL PROOFS'
  | 'GENERATING HERO WORLD'
  | 'INSPECTING VISUAL PROOFS'
  | 'VISUAL PROOFS READY'
  | 'SOME PROOFS NEED REVIEW'
  | 'VISUAL PLAN BLOCKED INCOMPLETE DIRECTION'
  | 'NEEDS HUMAN REVIEW'
  | 'FORMATION FAILED'
  | 'VISUAL PRODUCTION FAILED';

export function deriveVisualProductionState(
  record: CoreDirectionFormationRecord | null,
): VisualProductionState {
  if (!record) return 'FORMING DIRECTIONS';

  const status = record.status as CoreDirectionFormationStatus;
  if (status === 'FAILED') return 'FORMATION FAILED';
  if (status === 'FORMING' || status === 'CRITIQUING' || status === 'REVISING') return 'FORMING DIRECTIONS';
  if (status === 'NEEDS_HUMAN_REVIEW') return 'NEEDS HUMAN REVIEW';

  if (status === 'READY_FOR_VISUAL_PRODUCTION') {
    const completeness = assessFormationProductionCompleteness(record.finalDirections);
    if (completeness.blockedStatus) return 'VISUAL PLAN BLOCKED INCOMPLETE DIRECTION';
    if (!record.visualProofPlans.length) return 'PREPARING VISUAL PROOFS';
    return 'PREPARING VISUAL PROOFS';
  }

  return 'FORMING DIRECTIONS';
}
