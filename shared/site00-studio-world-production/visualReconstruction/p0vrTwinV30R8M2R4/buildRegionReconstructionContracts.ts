import type { ActualVisualAnalysis, BlueprintVisualAnalysis } from '../p0vrTwinV30R8M2R1/implementationExpressionTypes.js';
import type { MobileTwinCompositionState } from '../p0vrTwinV30/mobileTwinPipeline/types.js';
import { buildActualImplementationRegionMap } from '../p0vrTwinV30R8M2/actualImplementationRegionMap.js';
import type { CriticalImplementationRegionId } from '../p0vrTwinV30R8M2/constants.js';
import { CRITICAL_RECONSTRUCTION_REGIONS, type CriticalReconstructionRegionId } from './constants.js';
import type { ActualRegionReconstructionContract } from './actualFirstTypes.js';

function mapRegionId(id: CriticalImplementationRegionId): CriticalReconstructionRegionId {
  if (id === 'HOST_HEADER') return 'HOST_SHELL';
  return id as CriticalReconstructionRegionId;
}

function boundsForRegion(
  regionId: string,
  analysis: ActualVisualAnalysis | BlueprintVisualAnalysis,
): { xRatio: number; yRatio: number; widthRatio: number; heightRatio: number } {
  const hit = analysis.regions.find((r) => r.regionId === regionId || r.regionId.includes(regionId.split('_')[0]!));
  if (hit && 'bounds' in hit) return hit.bounds;
  if (hit && 'geometry' in hit) {
    return {
      xRatio: hit.geometry.xRatio,
      yRatio: hit.geometry.yRatio,
      widthRatio: hit.geometry.widthRatio,
      heightRatio: hit.geometry.heightRatio,
    };
  }
  return { xRatio: 0, yRatio: 0, widthRatio: 1, heightRatio: 0.08 };
}

export function buildRegionReconstructionContracts(input: {
  composition: MobileTwinCompositionState;
  actualAnalysis: ActualVisualAnalysis;
  blueprintAnalysis: BlueprintVisualAnalysis;
}): ActualRegionReconstructionContract[] {
  const regionMap = buildActualImplementationRegionMap(input.composition);
  return CRITICAL_RECONSTRUCTION_REGIONS.map((regionId) => {
    const structured = regionMap.find((r) => mapRegionId(r.regionId) === regionId);
    const structuredKey = structured?.regionId ?? 'HERO_WORKSPACE';
    const actualBounds = boundsForRegion(structuredKey, input.actualAnalysis);
    const blueprintBounds = boundsForRegion(structuredKey, input.blueprintAnalysis);
    const cols =
      regionId === 'HERO_WORKSPACE' ? 3
      : regionId === 'CANDIDATE_GALLERY' ? 4
      : regionId === 'STRUCTURED_OUTPUT' ? 5
      : regionId === 'BOTTOM_NAV' ? 5
      : 1;
    const rows = regionId === 'READINESS' ? 2 : 1;
    return {
      regionId,
      actualRegionBounds: actualBounds,
      blueprintRegionBounds: blueprintBounds,
      targetWidthRatio: actualBounds.widthRatio,
      targetHeightRatio: actualBounds.heightRatio,
      targetInternalColumns: cols,
      targetInternalRows: rows,
      targetAlignment: regionId.includes('HERO') ? 'grid-start' : 'stretch',
      targetPadding: regionId.includes('GALLERY') ? 8 : 10,
      targetGapRelationships: regionId === 'HERO_WORKSPACE' ? 'headline:artifact:authority=38:34:28' : 'uniform-6px',
      targetTypographyHierarchy: regionId === 'HERO_WORKSPACE' ? 'headline-dominates' : 'label-secondary',
      targetImagePlacement: regionId.includes('GALLERY') || regionId === 'HERO_WORKSPACE' ? 'cover-editorial' : 'none',
      targetControlGrouping: regionId === 'AUTHORITY_PANEL' ? 'vertical-rail' : 'inline',
      targetVisualWeight: regionId === 'HERO_WORKSPACE' || regionId === 'AUTHORITY_PANEL' ? 1 : 0.55,
      targetContrast: 'black-dominant-lime-accent',
      targetSectionDensity: regionId.includes('STRUCTURED') ? 'compact' : 'medium',
      doNotReinterpret: true,
    };
  });
}
