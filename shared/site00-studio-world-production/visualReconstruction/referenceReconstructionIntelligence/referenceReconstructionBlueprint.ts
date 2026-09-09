/**
 * ReferenceReconstructionBlueprint — machine-readable implementation spec.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';
import type { ReferenceLayoutPlan } from './types.js';
import type { ReferenceMeasurementSpec } from './types.js';
import {
  EXACT_FIDELITY_THRESHOLDS,
} from './referenceVerificationEngine.js';
import type {
  BlueprintStatus,
  ReferenceReconstructionBlueprint,
} from './types.js';

export function buildReferenceReconstructionBlueprint(input: {
  authorityId: string;
  viewport: DesignViewportClass;
  route: string;
  measurement: ReferenceMeasurementSpec;
  layoutPlan: ReferenceLayoutPlan;
  assetRequirements?: ReferenceReconstructionBlueprint['assetRequirements'];
  status?: BlueprintStatus;
  authorityBoundaryMapId?: string;
  hostShellCoverage?: number;
  authorityRebuildCoverage?: number;
  boundaryReviewRequired?: boolean;
  multiAssetJobId?: string | null;
  assetMismatchCount?: number;
  cropApprovalState?: string;
  generationApprovalState?: string;
  assetCompletenessState?: string;
}): ReferenceReconstructionBlueprint {
  const overflowContracts: ReferenceReconstructionBlueprint['overflowContracts'] = {};
  const anchoringContracts: ReferenceReconstructionBlueprint['anchoringContracts'] = {};
  for (const r of input.measurement.regions) {
    overflowContracts[r.regionId] = r.expectedOverflow;
    anchoringContracts[r.regionId] = r.expectedPositioning;
  }

  const uncertainties = [...input.layoutPlan.uncertainties];

  return {
    blueprintId: `blueprint-${input.authorityId}-${input.viewport.toLowerCase()}`,
    authorityId: input.authorityId,
    viewport: input.viewport,
    route: input.route,
    status: input.status ?? (uncertainties.some((u) => u.severity === 'NEEDS_INFERENCE_REVIEW') ? 'DRAFT' : 'READY'),
    viewportCalibration: input.measurement.viewportCalibration,
    regionTree: input.measurement.regions,
    geometrySpecs: input.measurement.geometrySpecs,
    typographySpecs: input.measurement.typographySpecs,
    surfaceSpecs: input.measurement.surfaceSpecs,
    layoutPlan: input.layoutPlan,
    spacingSystem: input.measurement.spacingSystem,
    lineBreakContracts: input.measurement.lineBreakContracts,
    overflowContracts,
    anchoringContracts,
    layerStack: input.measurement.regions.map((r) => ({ regionId: r.regionId, zIndexIntent: r.zLayer })),
    densityContract: { visiblePrimaryData: 8, progressiveDisclosureMode: null },
    dataState: {
      selectedTab: 'SKINS',
      selectedFamily: 'NDXBOOK',
      selectedScreen: 'PROJECT_OVERVIEW',
      openPanel: null,
      scrollY: 0,
      emptyState: false,
      loadingState: false,
    },
    assetRequirements: input.assetRequirements ?? [],
    verificationThresholds: EXACT_FIDELITY_THRESHOLDS,
    measurementSpecVersion: input.measurement.measurementSpecVersion,
    layoutPlanVersion: '1.0.0',
    uncertainties,
    lockedRegions: [],
    authorityBoundaryMapId: input.authorityBoundaryMapId,
    hostShellCoverage: input.hostShellCoverage,
    authorityRebuildCoverage: input.authorityRebuildCoverage,
    boundaryReviewRequired: input.boundaryReviewRequired,
    multiAssetJobId: input.multiAssetJobId ?? null,
    assetMismatchCount: input.assetMismatchCount,
    cropApprovalState: input.cropApprovalState,
    generationApprovalState: input.generationApprovalState,
    assetCompletenessState: input.assetCompletenessState,
  };
}

export function blueprintRequiredBeforeExactImplementation(blueprint: ReferenceReconstructionBlueprint | null): {
  allowed: boolean;
  failureCode: 'REFERENCE_BLUEPRINT_MISSING' | null;
} {
  if (!blueprint || blueprint.status === 'DRAFT' || blueprint.status === 'BLOCKED') {
    return { allowed: false, failureCode: 'REFERENCE_BLUEPRINT_MISSING' };
  }
  return { allowed: blueprint.status === 'READY' || blueprint.status === 'IMPLEMENTING', failureCode: null };
}

export function lockVerifiedRegion(blueprint: ReferenceReconstructionBlueprint, regionId: string): ReferenceReconstructionBlueprint {
  if (blueprint.lockedRegions.includes(regionId)) return blueprint;
  return { ...blueprint, lockedRegions: [...blueprint.lockedRegions, regionId] };
}
