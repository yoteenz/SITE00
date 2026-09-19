/**
 * P0.VR.DIAG.1R4 — Region DOM target confidence mapping.
 */

import type { ForensicConfidence } from '../p0vrDiag1/types.js';
import type { DomTargetRecovery, RegionTargetConfidence } from './types.js';

export function mapForensicToTargetConfidence(confidence: ForensicConfidence): RegionTargetConfidence {
  if (confidence === 'HIGH') return 'HIGH';
  if (confidence === 'MEDIUM') return 'MEDIUM';
  if (confidence === 'LOW') return 'LOW';
  return 'UNRESOLVED';
}

export function targetConfidenceAllowsSufficientDepth(confidence: RegionTargetConfidence): boolean {
  return confidence === 'HIGH' || confidence === 'MEDIUM';
}

export function resolveDomTargetConfidence(recovery: DomTargetRecovery): RegionTargetConfidence {
  if (recovery.status === 'OUT_OF_SCOPE') return 'UNRESOLVED';
  if (recovery.status === 'UNRESOLVED') return 'UNRESOLVED';
  if (recovery.status === 'AMBIGUOUS') return 'LOW';
  return recovery.matchConfidence;
}
