/**
 * Build visual reconstruction blueprint before implementation.
 */

import type {
  CopyMatchMode,
  NormalizedVisualReference,
  PageState,
  VisualReconstructionBlueprint,
  VisualReconstructionMode,
  VisualReferenceRegion,
} from '../types.js';
import { measureRegions, measureTypographyFromRegions } from '../measurement/VisualMeasurement.js';
import { evaluateResponsiveInference } from '../responsive/ResponsiveInferenceEvaluation.js';

export type BuildBlueprintInput = {
  reference: NormalizedVisualReference;
  targetRoute: string;
  regions: VisualReferenceRegion[];
  mode?: VisualReconstructionMode;
  pageState?: PageState;
  copyMatchMode?: CopyMatchMode;
  componentMatches: VisualReconstructionBlueprint['componentMatches'];
  assetMatches: VisualReconstructionBlueprint['assetMatches'];
  deviceScaleFactor?: number;
};

export function buildVisualReconstructionBlueprint(input: BuildBlueprintInput): VisualReconstructionBlueprint {
  const globalGeometry = measureRegions(input.regions);
  const typography = measureTypographyFromRegions(input.regions);
  const confidenceMap: Record<string, number> = {};
  for (const region of input.regions) {
    confidenceMap[region.regionId] = region.confidence;
  }

  return {
    blueprintId: `bp-${input.reference.referenceId}-${Date.now()}`,
    referenceId: input.reference.referenceId,
    targetRoute: input.targetRoute,
    viewport: {
      width: input.reference.estimatedViewportWidth,
      height: input.reference.estimatedViewportHeight,
      deviceScaleFactor: input.deviceScaleFactor ?? 2,
    },
    globalGeometry,
    layoutRegions: input.regions,
    typography,
    surfaces: globalGeometry.filter((m) => m.property === 'color' || m.property === 'radius'),
    imagery: input.regions
      .filter((r) => r.visualRole === 'IMAGE' || r.visualRole === 'METHOD_STAGE')
      .map((r) => ({ regionId: r.regionId, classification: 'STRUCTURAL_COMPONENT' as const })),
    navigation: input.regions
      .filter((r) => r.visualRole === 'BOTTOM_NAV' || r.visualRole === 'GLOBAL_SHELL')
      .map((r) => ({
        regionId: r.regionId,
        componentMatch: 'EXISTING_CANONICAL_COMPONENT' as const,
      })),
    fixedElements: input.regions.filter((r) => r.visualRole === 'BOTTOM_NAV').map((r) => r.regionId),
    scrollBehavior: 'viewport',
    responsiveInferences: evaluateResponsiveInference(input.reference),
    assetMatches: input.assetMatches,
    componentMatches: input.componentMatches,
    unknownElements: input.regions.filter((r) => r.confidence < 0.5).map((r) => r.regionId),
    confidenceMap,
    copyMatchMode: input.copyMatchMode ?? 'CANONICAL_REPOSITORY_COPY',
    mode: input.mode ?? 'REPRODUCE',
    pageState: input.pageState ?? 'DEFAULT',
    createdAt: new Date().toISOString(),
  };
}
