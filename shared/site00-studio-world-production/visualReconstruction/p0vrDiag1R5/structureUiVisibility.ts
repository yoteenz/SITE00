/**
 * P0.VR.DIAG.1R5A / 1R5B — When founders should see VIEW STRUCTURE.
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

/** Infer complex region type from founder-facing region name when bundle type is missing. */
export function inferRegionTypeFromName(regionName: string | undefined): VisualRegionType | undefined {
  if (!regionName) return undefined;
  const n = regionName.toUpperCase();
  if (n.includes('SECTION NAV') || (n.includes('NAV') && !n.includes('BOTTOM'))) return 'NAVIGATION';
  if (n.includes('BOTTOM NAV')) return 'PERSISTENT_NAV';
  if (n.includes('METRIC') || n.includes('STATUS CELL') || n.includes('KPI')) return 'METRICS';
  if (n.includes('PROGRESS') || n.includes('PHASE')) return 'STATUS';
  if (n.includes('ACTIVITY') || n.includes('CURRENT FOCUS') || n.includes('LIST')) return 'LIST';
  if (n.includes('CARD RAIL') || n.includes('MILESTONE')) return 'CARD_RAIL';
  return undefined;
}

export function effectiveRegionType(regionType: string | undefined, regionName: string | undefined): string | undefined {
  return regionType ?? inferRegionTypeFromName(regionName);
}

export function isBlockingMeasurementDepth(measurementDepthStatus?: string): boolean {
  const depth = (measurementDepthStatus ?? '').toUpperCase();
  return ['SHALLOW', 'UNMEASURED', 'BLOCKED'].includes(depth);
}

export function isBlockingStructureStatus(internalStructureStatus?: InternalStructureStatus | string): boolean {
  const structure = (internalStructureStatus ?? '').toUpperCase();
  return ['PARTIAL', 'RESOLVED', 'AMBIGUOUS', 'UNRESOLVED', 'UNSUPPORTED'].includes(structure);
}

/**
 * Live region cards: show VIEW STRUCTURE for blockers even when structure has not been analyzed.
 * Removes catch-22 (must analyze before offering analyze).
 */
export function regionCardMustShowViewStructure(input: {
  regionType?: string;
  regionName?: string;
  measurementDepthStatus?: string;
  internalStructureStatus?: InternalStructureStatus | string;
  significance?: string;
  showViewStructure?: boolean;
}): boolean {
  if (input.showViewStructure === true) return true;

  const type = effectiveRegionType(input.regionType, input.regionName);
  const depthBlock = isBlockingMeasurementDepth(input.measurementDepthStatus);
  const structureSignal = isBlockingStructureStatus(input.internalStructureStatus);

  if (depthBlock && (isComplexRegionType(type) || type === undefined)) return true;
  if (structureSignal && isComplexRegionType(type)) return true;
  if (input.significance === 'MAJOR' && (depthBlock || structureSignal)) return true;

  return shouldShowViewStructure({
    regionType: type,
    measurementDepthStatus: input.measurementDepthStatus,
    internalStructureStatus: input.internalStructureStatus,
    significance: input.significance,
  });
}

export function shouldShowViewStructure(input: {
  regionType?: string;
  measurementDepthStatus?: string;
  internalStructureStatus?: InternalStructureStatus | string;
  significance?: string;
}): boolean {
  const type = effectiveRegionType(input.regionType, undefined);
  if (!isComplexRegionType(type)) return false;

  const depth = (input.measurementDepthStatus ?? '').toUpperCase();
  const structure = (input.internalStructureStatus ?? '').toUpperCase();

  if (['PARTIAL', 'RESOLVED', 'AMBIGUOUS', 'UNRESOLVED', 'UNSUPPORTED'].includes(structure)) return true;
  if (['SHALLOW', 'UNMEASURED', 'BLOCKED'].includes(depth)) return true;
  if (input.significance === 'MAJOR') return true;
  return isComplexRegionType(type);
}

export function shouldShowAnalyzeStructure(input: {
  regionType?: string;
  regionName?: string;
  internalStructureStatus?: string;
  measurementDepthStatus?: string;
}): boolean {
  const type = effectiveRegionType(input.regionType, input.regionName);
  if (!isComplexRegionType(type)) {
    return regionCardMustShowViewStructure({
      regionType: type,
      regionName: input.regionName,
      measurementDepthStatus: input.measurementDepthStatus,
      internalStructureStatus: input.internalStructureStatus,
    });
  }
  const structure = (input.internalStructureStatus ?? '').toUpperCase();
  if (!structure || structure === 'UNRESOLVED') return true;
  if (
    structure === 'UNSUPPORTED' &&
    ['SHALLOW', 'UNMEASURED', 'BLOCKED'].includes((input.measurementDepthStatus ?? '').toUpperCase())
  ) {
    return true;
  }
  if (structure === 'PARTIAL' || structure === 'AMBIGUOUS') return true;
  return false;
}
