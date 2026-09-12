/**
 * P0.VR.DIAG.1R5A — When founders should see VIEW STRUCTURE.
 */

import type { VisualRegionType } from '../p0vrDiag1/types.js';
import type { InternalStructureStatus } from './types.js';

export const COMPLEX_REGION_TYPES: VisualRegionType[] = [
  'NAVIGATION',
  'METRICS',
  'STATUS',
  'CARD_RAIL',
  'LIST',
  'PERSISTENT_NAV',
];

export function isComplexRegionType(regionType: string | undefined): boolean {
  if (!regionType) return false;
  return COMPLEX_REGION_TYPES.includes(regionType as VisualRegionType);
}

export function shouldShowViewStructure(input: {
  regionType?: string;
  measurementDepthStatus?: string;
  internalStructureStatus?: InternalStructureStatus | string;
  significance?: string;
}): boolean {
  if (!isComplexRegionType(input.regionType)) return false;

  const depth = (input.measurementDepthStatus ?? '').toUpperCase();
  const structure = (input.internalStructureStatus ?? '').toUpperCase();

  if (['PARTIAL', 'RESOLVED', 'AMBIGUOUS', 'UNRESOLVED', 'UNSUPPORTED'].includes(structure)) return true;
  if (['SHALLOW', 'UNMEASURED', 'BLOCKED'].includes(depth)) return true;
  if (input.significance === 'MAJOR') return true;
  return isComplexRegionType(input.regionType);
}

export function shouldShowAnalyzeStructure(input: {
  regionType?: string;
  internalStructureStatus?: string;
  measurementDepthStatus?: string;
}): boolean {
  if (!isComplexRegionType(input.regionType)) return false;
  const structure = (input.internalStructureStatus ?? '').toUpperCase();
  if (!structure || structure === 'UNRESOLVED') return true;
  if (structure === 'UNSUPPORTED' && ['SHALLOW', 'UNMEASURED', 'BLOCKED'].includes((input.measurementDepthStatus ?? '').toUpperCase())) {
    return true;
  }
  return false;
}
