/**
 * P0.VR.DIAG.1R5A — Hydrate structure summaries for diagnosis UI (no new capture).
 */

import type { PageRegionLayoutProfile } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import type {
  AuthorityRelativeForensicsReport,
  DomRegionMeasurement,
  RegionForensicsBundle,
  RegionInternalStructureSummary,
} from '../p0vrDiag1/types.js';
import { extractCurrentRegionStructure } from './currentRegionStructureExtractor.js';
import { buildStructureHierarchyPreview } from './structureHierarchyPreview.js';
import { computeInternalStructureCompleteness } from './internalStructureCompleteness.js';
import { getRegionInternalStructure, structureCacheKey, type StructureCacheKeyInput } from './regionInternalStructureRegistry.js';
import { buildRegionStructureViewModel, type RegionStructureViewModel } from './structureUiModel.js';
import { effectiveRegionType, isComplexRegionType, shouldShowAnalyzeStructure } from './structureUiVisibility.js';

export function cacheKeyFromReport(report: AuthorityRelativeForensicsReport): StructureCacheKeyInput {
  return {
    pageId: report.pageId,
    viewport: report.viewport,
    authorityVersionId: report.authorityVersionId,
    captureId: report.captureId,
    forensicsVersion: report.forensicsVersion ?? 'v307',
  };
}

export function resolveRegionInternalStructureSummary(input: {
  bundle: RegionForensicsBundle;
  report: AuthorityRelativeForensicsReport;
  profile: PageRegionLayoutProfile;
  domMeasurements?: DomRegionMeasurement[];
}): RegionInternalStructureSummary {
  if (input.bundle.internalStructure?.anchorHierarchy?.length) {
    return input.bundle.internalStructure;
  }

  const key = structureCacheKey(cacheKeyFromReport(input.report));
  const cached = getRegionInternalStructure(key, input.bundle.regionId);
  if (cached) {
    const completeness = computeInternalStructureCompleteness(cached.current);
    return {
      status: cached.current.status,
      subtype: cached.current.subtype,
      completenessPct: completeness.completenessPct,
      anchorHierarchy: buildStructureHierarchyPreview(cached.current),
      structureVersionId: undefined,
    };
  }

  if (!isComplexRegionType(input.bundle.regionType)) {
    return input.bundle.internalStructure ?? { status: 'UNSUPPORTED', completenessPct: 0 };
  }

  const def = input.profile.regions.find((r) => r.regionId === input.bundle.regionId);
  const dom = input.domMeasurements?.find((d) => d.regionId === input.bundle.regionId);
  if (def && dom) {
    const related =
      input.domMeasurements?.filter((m) => m.regionId.startsWith(def.regionId) && m.regionId !== def.regionId) ?? [];
    const current = extractCurrentRegionStructure({ def, dom, relatedDom: related });
    const completeness = computeInternalStructureCompleteness(current);
    return {
      status: current.status,
      subtype: current.subtype,
      completenessPct: completeness.completenessPct,
      anchorHierarchy: buildStructureHierarchyPreview(current),
    };
  }

  return {
    status: 'UNRESOLVED',
    completenessPct: 0,
    anchorHierarchy: ['STRUCTURE NOT ANALYZED'],
  };
}

export function resolveRegionStructureViewModel(input: {
  bundle: RegionForensicsBundle;
  report: AuthorityRelativeForensicsReport;
  profile: PageRegionLayoutProfile;
  domMeasurements?: DomRegionMeasurement[];
  failureCode?: string;
  failureDetail?: string;
}): RegionStructureViewModel | null {
  const type = effectiveRegionType(input.bundle.regionType, input.bundle.regionName);
  if (!isComplexRegionType(type)) return null;

  const summary = resolveRegionInternalStructureSummary(input);
  const key = structureCacheKey(cacheKeyFromReport(input.report));
  const cached = getRegionInternalStructure(key, input.bundle.regionId);

  let current = cached?.current ?? null;
  let authority = cached?.authority ?? null;

  if (!current) {
    const def = input.profile.regions.find((r) => r.regionId === input.bundle.regionId);
    const dom = input.domMeasurements?.find((d) => d.regionId === input.bundle.regionId);
    if (def && dom) {
      const related =
        input.domMeasurements?.filter((m) => m.regionId.startsWith(def.regionId) && m.regionId !== def.regionId) ?? [];
      current = extractCurrentRegionStructure({ def, dom, relatedDom: related });
    }
  }

  return buildRegionStructureViewModel({
    regionId: input.bundle.regionId,
    regionName: input.bundle.regionName,
    summary,
    current,
    authority,
    failureCode: input.failureCode,
    failureDetail: input.failureDetail,
  });
}

export function regionNeedsAnalyzeStructure(
  bundle: RegionForensicsBundle,
  summary: RegionInternalStructureSummary,
): boolean {
  return shouldShowAnalyzeStructure({
    regionType: bundle.regionType,
    regionName: bundle.regionName,
    internalStructureStatus: summary.status,
    measurementDepthStatus: bundle.depthComputation?.depthStatus ?? bundle.measurementDepth?.status,
  });
}
