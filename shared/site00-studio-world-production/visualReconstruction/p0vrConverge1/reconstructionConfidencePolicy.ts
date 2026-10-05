/**
 * P0.VR.CONVERGE.1 — Map forensic depth to region execution mode.
 */

import { isRegionDepthSufficient } from '../p0vrDiag1/forensicDepthQualification.js';
import type { RegionForensicsBundle } from '../p0vrDiag1/types.js';
import type { ReconstructionExecutionMode } from './types.js';

export function executionModeForRegion(bundle: RegionForensicsBundle): ReconstructionExecutionMode {
  if (bundle.status !== 'MATCHED') return 'FOUNDER_REVIEW_REQUIRED';
  if (isRegionDepthSufficient(bundle)) return 'MEASURED';
  const depth = bundle.depthComputation?.depthStatus ?? bundle.measurementDepth?.status ?? 'UNMEASURED';
  if (depth === 'SHALLOW' || depth === 'UNMEASURED') {
    if (bundle.regionType === 'HERO' || bundle.regionType === 'HEADER') return 'VISUAL_INFERENCE';
    if (bundle.regionType === 'METRICS' || bundle.regionType === 'NAVIGATION') return 'CONSERVATIVE_ADAPTATION';
    return 'VISUAL_INFERENCE';
  }
  if (bundle.internalStructure?.status === 'AMBIGUOUS') return 'FOUNDER_REVIEW_REQUIRED';
  return 'CONSERVATIVE_ADAPTATION';
}

export function confidenceForMode(mode: ReconstructionExecutionMode): 'HIGH' | 'MEDIUM' | 'LOW' {
  switch (mode) {
    case 'HIGH_CONFIDENCE':
    case 'MEASURED':
      return 'HIGH';
    case 'VISUAL_INFERENCE':
    case 'CONSERVATIVE_ADAPTATION':
      return 'MEDIUM';
    default:
      return 'LOW';
  }
}
