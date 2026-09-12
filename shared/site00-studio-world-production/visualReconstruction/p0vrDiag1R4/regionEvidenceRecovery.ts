/**
 * P0.VR.DIAG.1R4 — Targeted evidence recovery orchestrator (blockers only).
 */

import { reconcileForensicReportScoring } from '../p0vrDiag1/forensicReconciliation.js';
import { reconcileBundleDimensions, isRegionDepthSufficient } from '../p0vrDiag1/forensicDepthQualification.js';
import { buildRegionMeasurementDepthEvidence } from '../p0vrDiag1/regionMeasurementDepth.js';
import type { PageRegionLayoutDefinition, PageRegionLayoutProfile } from '../p0vrDiag1/pageRegionLayoutProfiles.js';
import type {
  AuthorityRelativeForensicsReport,
  DomRegionMeasurement,
  VisualRegionMatch,
} from '../p0vrDiag1/types.js';
import { resolveBlockingRegions } from './blockingRegionResolver.js';
import { recoverDomTarget } from './domTargetRecovery.js';
import { enrichDomFromChildAnchors, extractRegionChildAnchors } from './regionChildAnchorExtractor.js';
import { runAuthorityRegionMeasurementPass } from './authorityRegionMeasurementPass.js';
import { buildRegionEvidenceRecoveryPlan } from './regionEvidenceRecoveryPlan.js';
import { mergeRecoveredDimensions } from './mergeRecoveredDimensions.js';
import { resolveDomTargetConfidence, targetConfidenceAllowsSufficientDepth } from './regionTargetConfidence.js';
import { appendRecoveryHistory } from './regionEvidenceRecoveryHistory.js';
import type { RecoveredDimensionProvenance, RegionEvidenceRecoveryReceipt } from './types.js';
import { P0_VR_DIAG_1R5A_BUILD } from '../p0vrDiag1/constants.js';
import { cacheKeyFromReport } from '../p0vrDiag1R5/enrichRegionStructure.js';
import { structureCacheKey, storeRegionInternalStructures } from '../p0vrDiag1R5/regionInternalStructureRegistry.js';
import { recordRegionStructureVersion } from '../p0vrDiag1R5/regionStructureVersion.js';
import type { StructureToDepthTrace } from '../p0vrDiag1R5/structureToDepthTrace.js';
import { runRegionInternalStructureRecovery } from '../p0vrDiag1R5/regionInternalStructureRecovery.js';
import { repairDimensionTypesOnBundles } from '../p0vrDiag1R5/dimensionTypeRepair.js';
import type { InternalStructureRecoveryTrace } from '../p0vrDiag1R5/types.js';

export type AnalyzeMissingForensicEvidenceInput = {
  report: AuthorityRelativeForensicsReport;
  profile: PageRegionLayoutProfile;
  forensicsVersion: string;
  domMeasurements?: DomRegionMeasurement[];
  cssSnapshot?: Record<string, string | number>;
  shell?: { headerPaddingX: number; contentPaddingX: number; sectionGap?: number } | null;
  viewportWidth?: number;
  viewportHeight?: number;
};

function buildDomMap(measurements: DomRegionMeasurement[]): Map<string, DomRegionMeasurement> {
  const map = new Map<string, DomRegionMeasurement>();
  for (const m of measurements) map.set(m.regionId, m);
  return map;
}

function buildComponentDomMap(measurements: DomRegionMeasurement[]): Map<string, DomRegionMeasurement> {
  const map = new Map<string, DomRegionMeasurement>();
  for (const m of measurements) {
    if (m.componentId) map.set(m.componentId, m);
  }
  return map;
}

function findRegionMatch(matches: VisualRegionMatch[], regionId: string): VisualRegionMatch | null {
  return matches.find((m) => m.regionId === regionId) ?? null;
}

function findRegionDef(profile: PageRegionLayoutProfile, regionId: string): PageRegionLayoutDefinition | null {
  return profile.regions.find((r) => r.regionId === regionId) ?? null;
}

export function analyzeMissingForensicEvidence(
  input: AnalyzeMissingForensicEvidenceInput,
): { report: AuthorityRelativeForensicsReport; receipt: RegionEvidenceRecoveryReceipt; provenance: RecoveredDimensionProvenance[] } {
  const beforeAgg = input.report.topLevelDepthAggregation;
  const depthBefore = {
    sufficient: beforeAgg?.sufficientRegionCount ?? input.report.coverageMap.coverageScore.majorWithSufficientDepth,
    total: beforeAgg?.majorRegionCount ?? 8,
    pct: beforeAgg?.depthPct ?? input.report.coverageMap.coverageScore.measurementDepthPct,
    gateStatus: input.report.measurementDepthGate.status,
  };

  const blocking = resolveBlockingRegions({ report: input.report, profile: input.profile });
  const domMeasurements = input.domMeasurements ?? [];
  const domMap = buildDomMap(domMeasurements);
  const domByComponent = buildComponentDomMap(domMeasurements);
  const scopeMismatch = input.report.coverageMap.scopeMismatch;

  const regionForensics = input.report.regionForensics.map((b) => ({ ...b, dimensions: [...b.dimensions] }));
  const plans = [];
  const provenance: RecoveredDimensionProvenance[] = [];
  let dimensionsAdded = 0;
  let captureRequired = false;
  let captureScopeReason: string | null = null;
  const transitions: RegionEvidenceRecoveryReceipt['regionTransitions'] = [];
  const regionsImproved: string[] = [];
  const regionsStillBlocked: string[] = [];
  const structureTraces: InternalStructureRecoveryTrace[] = [];
  const structureToDepthTraces: StructureToDepthTrace[] = [];
  const recoveryFailures: NonNullable<RegionEvidenceRecoveryReceipt['recoveryFailures']> = [];
  const structureStore: Array<{ regionId: string; current: import('../p0vrDiag1R5/types.js').RegionInternalStructure; authority: import('../p0vrDiag1R5/types.js').RegionInternalStructure }> = [];
  const cacheKeyInput = cacheKeyFromReport(input.report);
  const cacheKey = structureCacheKey({ ...cacheKeyInput, forensicsVersion: P0_VR_DIAG_1R5A_BUILD });

  for (const block of blocking) {
    const idx = regionForensics.findIndex((b) => b.regionId === block.regionId);
    if (idx < 0) continue;
    const bundle = regionForensics[idx]!;
    const beforeStatus = bundle.depthComputation?.depthStatus ?? bundle.measurementDepth?.status ?? 'UNMEASURED';

    const def = findRegionDef(input.profile, block.regionId);
    const match = findRegionMatch(input.report.regionMatches, block.regionId);
    if (!def || !match?.authorityRegion || !match.currentRegion) {
      regionsStillBlocked.push(block.regionId);
      continue;
    }

    const dom = domMap.get(block.regionId);
    const domRecovery = recoverDomTarget({
      def,
      dom,
      componentTarget: bundle.componentTarget,
      domByComponentId: domByComponent,
    });

    if (domRecovery.status === 'OUT_OF_SCOPE' || (scopeMismatch && !dom && def.normalizedY > 0.75)) {
      captureRequired = true;
      captureScopeReason = 'CAPTURE_SCOPE_INSUFFICIENT';
      regionsStillBlocked.push(block.regionId);
      plans.push(
        buildRegionEvidenceRecoveryPlan({
          blocking: block,
          bundle,
          domRecovery: { ...domRecovery, status: 'OUT_OF_SCOPE' },
          authorityPass: {
            regionId: block.regionId,
            authorityBounds: { x: 0, y: 0, width: 0, height: 0 },
            childAnchors: [],
            dimensions: [],
            confidence: 'LOW',
            status: 'SKIPPED',
          },
          scopeMismatch: true,
        }),
      );
      continue;
    }

    const childAnchors = extractRegionChildAnchors({
      def,
      dom: dom ?? null,
      relatedDom: domMeasurements.filter((m) => m.regionId.startsWith(def.regionId) && m.regionId !== def.regionId),
    });
    const enrichedDom = dom ? enrichDomFromChildAnchors(dom, childAnchors, def.regionType) : dom;

    const authorityPass = runAuthorityRegionMeasurementPass({
      def,
      authority: match.authorityRegion,
      shell: input.shell,
      viewportWidth: input.viewportWidth ?? 390,
      dom: enrichedDom,
    });

    const plan = buildRegionEvidenceRecoveryPlan({
      blocking: block,
      bundle,
      domRecovery,
      authorityPass,
      scopeMismatch,
    });
    plans.push(plan);

    const validBefore =
      bundle.depthComputation?.qualifiedDimensions.filter((q) => q.countsTowardDepth).length ??
      bundle.measurementDepth?.validDimensionCount ??
      bundle.dimensions.filter((d) => d.delta != null).length;

    const relatedDom = domMeasurements.filter(
      (m) => m.regionId.startsWith(def.regionId) && m.regionId !== def.regionId,
    );
    const structurePass = runRegionInternalStructureRecovery({
      def,
      dom: enrichedDom ?? dom ?? null,
      relatedDom,
      authority: match.authorityRegion,
      validDimensionsBefore: validBefore,
      captureScopeInsufficient: Boolean(scopeMismatch && !dom),
      bundleBefore: bundle,
    });
    structureTraces.push(structurePass.trace);
    if (structurePass.depthTrace) structureToDepthTraces.push(structurePass.depthTrace);
    structureStore.push({
      regionId: block.regionId,
      current: structurePass.currentStructure,
      authority: structurePass.authorityStructure,
    });
    if (structurePass.trace.failure) recoveryFailures.push(structurePass.trace.failure);

    const targetConf = resolveDomTargetConfidence(domRecovery);
    if (!targetConfidenceAllowsSufficientDepth(targetConf) && plan.recommendedRecoveryMethod !== 'AUTHORITY_REGION_REMEASURE') {
      regionsStillBlocked.push(block.regionId);
      transitions.push({ regionId: block.regionId, regionName: block.regionName, before: beforeStatus, after: beforeStatus });
      regionForensics[idx] = { ...bundle, internalStructure: structurePass.summary };
      continue;
    }

    const recovered = buildRegionMeasurementDepthEvidence({
      def,
      authority: match.authorityRegion,
      current: match.currentRegion,
      dom: enrichedDom,
      shell: input.shell,
      cssSnapshot: input.cssSnapshot,
      viewportWidth: input.viewportWidth ?? 390,
      viewportHeight: input.viewportHeight ?? 844,
      matchConfidence: match.matchConfidence,
    }).dimensions;

    const allRecovered = [...recovered, ...structurePass.dimensionEvidence];

    for (const row of allRecovered) {
      if (
        row.currentSource === 'DOM_RECT' ||
        row.currentSource === 'COMPUTED_STYLE' ||
        row.currentSource === 'CHILD_ANCHOR'
      ) {
        provenance.push({
          dimension: row.dimension,
          source: row.currentSource,
          sourceId: row.evidenceId,
          regionId: block.regionId,
          extractionMethod:
            row.currentSource === 'CHILD_ANCHOR' ? 'CHILD_ANCHOR_EXTRACTION' : plan.recommendedRecoveryMethod,
          confidence: row.confidence,
          timestamp: new Date().toISOString(),
        });
      }
    }

    const { merged, added } = mergeRecoveredDimensions(bundle.dimensions, allRecovered);
    dimensionsAdded += added;

    const reconciled = reconcileBundleDimensions({
      ...bundle,
      dimensions: merged,
      internalStructure: structurePass.summary,
    });
    regionForensics[idx] = reconciled;

    const afterValid =
      reconciled.depthComputation?.qualifiedDimensions.filter((q) => q.countsTowardDepth).length ??
      reconciled.measurementDepth?.validDimensionCount ??
      0;
    structureTraces[structureTraces.length - 1] = {
      ...structurePass.trace,
      validDimensionsAfter: afterValid,
    };

    const afterStatus = reconciled.depthComputation?.depthStatus ?? reconciled.measurementDepth?.status ?? beforeStatus;
    transitions.push({ regionId: block.regionId, regionName: block.regionName, before: beforeStatus, after: afterStatus });

    if (isRegionDepthSufficient(reconciled)) regionsImproved.push(block.regionId);
    else regionsStillBlocked.push(block.regionId);
  }

  const typeRepair = repairDimensionTypesOnBundles({
    bundles: regionForensics,
    forensicsVersionBefore: input.forensicsVersion,
    forensicsVersionAfter: P0_VR_DIAG_1R5A_BUILD,
  });

  const reconciledAfterRepair = typeRepair.bundles.map((b) => reconcileBundleDimensions(b));

  const patchedReport: AuthorityRelativeForensicsReport = {
    ...input.report,
    regionForensics: reconciledAfterRepair,
    forensicsVersion: P0_VR_DIAG_1R5A_BUILD,
    generatedAt: new Date().toISOString(),
  };

  storeRegionInternalStructures(cacheKey, structureStore);
  for (const entry of structureStore) {
    const bundle = reconciledAfterRepair.find((b) => b.regionId === entry.regionId);
    if (bundle?.internalStructure) {
      recordRegionStructureVersion({
        cacheKeyInput: { ...cacheKeyInput, forensicsVersion: P0_VR_DIAG_1R5A_BUILD },
        regionId: entry.regionId,
        forensicsVersion: P0_VR_DIAG_1R5A_BUILD,
        summary: bundle.internalStructure,
        current: entry.current,
        authority: entry.authority,
      });
    }
  }

  const { report: reconciledReport, aggregation } = reconcileForensicReportScoring({
    report: patchedReport,
    profile: input.profile,
  });

  const depthAfter = {
    sufficient: aggregation.sufficientRegionCount,
    total: aggregation.majorRegionCount,
    pct: aggregation.depthPct,
    gateStatus: reconciledReport.measurementDepthGate.status,
  };

  let status: RegionEvidenceRecoveryReceipt['status'] = 'NO_PROGRESS';
  if (captureRequired && regionsImproved.length === 0) status = 'CAPTURE_SCOPE_INSUFFICIENT';
  else if (regionsImproved.length === blocking.length && blocking.length > 0) status = 'RECOVERY_COMPLETE';
  else if (regionsImproved.length > 0 || dimensionsAdded > 0) status = 'PARTIAL';

  const rootCauseSummary =
    status === 'NO_PROGRESS' && recoveryFailures.length
      ? recoveryFailures.map((f) => `${f.regionId}: ${f.failureCode}`).join(' · ')
      : null;

  const receipt: RegionEvidenceRecoveryReceipt = {
    forensicsVersionBefore: input.forensicsVersion,
    forensicsVersionAfter: P0_VR_DIAG_1R5A_BUILD,
    regionsAttempted: blocking.map((b) => b.regionId),
    regionsImproved,
    regionsStillBlocked,
    dimensionsAdded,
    captureRequired,
    captureScopeReason,
    status,
    depthBefore,
    depthAfter,
    regionTransitions: transitions,
    plans,
    structureTraces,
    structureToDepthTraces: structureToDepthTraces.length ? structureToDepthTraces : undefined,
    recoveryFailures: recoveryFailures.length ? recoveryFailures : undefined,
    dimensionTypeRepair: typeRepair.receipt.dimensionsReclassified ? typeRepair.receipt : null,
    rootCauseSummary,
    createdAt: new Date().toISOString(),
  };

  appendRecoveryHistory(reconciledReport.reportId, { receipt, provenance });

  return { report: reconciledReport, receipt, provenance };
}
