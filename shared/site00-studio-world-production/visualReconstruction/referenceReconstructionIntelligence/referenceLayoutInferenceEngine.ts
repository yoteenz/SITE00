/**
 * Layer 2 — Layout Inference Engine
 */

import type {
  ReferenceInferenceUncertainty,
  ReferenceLayoutPlan,
  ReferenceMeasurementSpec,
  ReferenceParentChildGraph,
} from './types.js';

export function inferReferenceLayout(measurement: ReferenceMeasurementSpec): ReferenceLayoutPlan {
  const regionLayoutModes: ReferenceLayoutPlan['regionLayoutModes'] = {};
  const gridInferences: ReferenceLayoutPlan['gridInferences'] = [];
  const flexInferences: ReferenceLayoutPlan['flexInferences'] = [];
  const uncertainties: ReferenceInferenceUncertainty[] = [];

  for (const region of measurement.regions) {
    if (region.role === 'CARD' && region.regionId.includes('family')) {
      regionLayoutModes[region.regionId] = 'FLEX';
      flexInferences.push({
        regionId: region.regionId,
        direction: 'ROW',
        justify: 'flex-start',
        align: 'stretch',
        gap: measurement.spacingSystem.cardGap,
        wrap: false,
      });
    } else if (region.role === 'SECTION' && region.regionId.includes('screen')) {
      regionLayoutModes[region.regionId] = 'GRID';
      gridInferences.push({
        regionId: region.regionId,
        columns: measurement.viewport === 'mobile' ? 2 : 4,
        rows: measurement.viewport === 'mobile' ? 4 : 2,
        gap: measurement.spacingSystem.panelGap,
      });
    } else if (region.expectedPositioning === 'STICKY' || region.expectedPositioning === 'FIXED') {
      regionLayoutModes[region.regionId] = region.expectedPositioning;
    } else {
      regionLayoutModes[region.regionId] = region.expectedPositioning;
    }

    if (region.confidence < 0.7) {
      uncertainties.push({
        regionId: region.regionId,
        field: 'layoutMode',
        reason: 'Low confidence region segmentation',
        severity: 'NEEDS_INFERENCE_REVIEW',
      });
    }
  }

  return {
    authorityId: measurement.authorityId,
    viewport: measurement.viewport,
    regionLayoutModes,
    parentChildGraph: buildParentChildGraph(measurement),
    gridInferences,
    flexInferences,
    viewportSpecific: true,
    uncertainties,
  };
}

function buildParentChildGraph(measurement: ReferenceMeasurementSpec): ReferenceParentChildGraph {
  const nodes = measurement.regions.map((r) => r.regionId);
  const edges: ReferenceParentChildGraph['edges'] = [];
  for (const r of measurement.regions) {
    if (r.parentRegionId) {
      edges.push({ parentId: r.parentRegionId, childId: r.regionId, relationship: 'CONTAINS' });
    }
  }
  return { nodes, edges };
}

export function assertResponsiveAuthorityIsolation(
  mobilePlan: ReferenceLayoutPlan,
  desktopPlan: ReferenceLayoutPlan,
): { isolated: boolean; failureCode: 'REFERENCE_RESPONSIVE_AUTHORITY_COLLAPSED' | null } {
  const sameModes =
    JSON.stringify(mobilePlan.regionLayoutModes) === JSON.stringify(desktopPlan.regionLayoutModes);
  const sameGrid = JSON.stringify(mobilePlan.gridInferences) === JSON.stringify(desktopPlan.gridInferences);
  if (sameModes && sameGrid && mobilePlan.viewport !== desktopPlan.viewport) {
    return { isolated: false, failureCode: 'REFERENCE_RESPONSIVE_AUTHORITY_COLLAPSED' };
  }
  return { isolated: true, failureCode: null };
}
