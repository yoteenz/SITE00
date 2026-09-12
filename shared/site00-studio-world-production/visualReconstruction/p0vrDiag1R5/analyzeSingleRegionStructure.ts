/**
 * P0.VR.DIAG.1R5A — Re-run internal structure for one region only.
 */

import { reconcileBundleDimensions } from '../p0vrDiag1/forensicDepthQualification.js';
import { reconcileForensicReportScoring } from '../p0vrDiag1/forensicReconciliation.js';
import type { PageRegionLayoutProfile } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import type { AuthorityRelativeForensicsReport, DomRegionMeasurement } from '../p0vrDiag1/types.js';
import { mergeRecoveredDimensions } from '../p0vrDiag1R4/mergeRecoveredDimensions.js';
import { runRegionInternalStructureRecovery } from './regionInternalStructureRecovery.js';
import { buildStructureToDepthTrace } from './structureToDepthTrace.js';
import { storeRegionInternalStructures, structureCacheKey } from './regionInternalStructureRegistry.js';
import { recordRegionStructureVersion } from './regionStructureVersion.js';
import { cacheKeyFromReport } from './enrichRegionStructure.js';

export function analyzeSingleRegionStructure(input: {
  report: AuthorityRelativeForensicsReport;
  profile: PageRegionLayoutProfile;
  regionId: string;
  domMeasurements?: DomRegionMeasurement[];
}): {
  report: AuthorityRelativeForensicsReport;
  depthTrace: ReturnType<typeof buildStructureToDepthTrace>;
} | null {
  const idx = input.report.regionForensics.findIndex((b) => b.regionId === input.regionId);
  if (idx < 0) return null;
  const bundle = input.report.regionForensics[idx]!;
  const def = input.profile.regions.find((r) => r.regionId === input.regionId);
  const match = input.report.regionMatches.find((m) => m.regionId === input.regionId);
  if (!def || !match?.authorityRegion) return null;

  const dom = input.domMeasurements?.find((d) => d.regionId === input.regionId);
  const relatedDom =
    input.domMeasurements?.filter((m) => m.regionId.startsWith(def.regionId) && m.regionId !== def.regionId) ?? [];

  const validBefore =
    bundle.depthComputation?.qualifiedDimensions.filter((q) => q.countsTowardDepth).length ??
    bundle.measurementDepth?.validDimensionCount ??
    0;

  const structurePass = runRegionInternalStructureRecovery({
    def,
    dom,
    relatedDom,
    authority: match.authorityRegion,
    validDimensionsBefore: validBefore,
  });

  const resolvedLabels = structurePass.currentStructure.childAnchors
    .filter((a) => a.anchorType !== 'CONTAINER')
    .map((a) => a.label);

  const depthTrace = buildStructureToDepthTrace({
    regionId: bundle.regionId,
    regionName: bundle.regionName,
    internalStructureStatus: structurePass.currentStructure.status,
    resolvedAnchorLabels: resolvedLabels,
    structureEvidence: structurePass.dimensionEvidence,
    bundleBefore: bundle,
  });

  const { merged } = mergeRecoveredDimensions(bundle.dimensions, structurePass.dimensionEvidence);
  const reconciled = reconcileBundleDimensions({
    ...bundle,
    dimensions: merged,
    internalStructure: structurePass.summary,
  });

  const regionForensics = [...input.report.regionForensics];
  regionForensics[idx] = reconciled;

  const cacheKeyInput = cacheKeyFromReport(input.report);
  storeRegionInternalStructures(structureCacheKey(cacheKeyInput), [
    {
      regionId: input.regionId,
      current: structurePass.currentStructure,
      authority: structurePass.authorityStructure,
    },
  ]);
  recordRegionStructureVersion({
    cacheKeyInput,
    regionId: input.regionId,
    forensicsVersion: input.report.forensicsVersion ?? 'v307',
    summary: structurePass.summary,
    current: structurePass.currentStructure,
    authority: structurePass.authorityStructure,
  });

  const patched: AuthorityRelativeForensicsReport = {
    ...input.report,
    regionForensics,
    generatedAt: new Date().toISOString(),
  };

  const { report } = reconcileForensicReportScoring({ report: patched, profile: input.profile });
  return { report, depthTrace };
}
