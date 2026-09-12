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

    const targetConf = resolveDomTargetConfidence(domRecovery);
    if (!targetConfidenceAllowsSufficientDepth(targetConf) && plan.recommendedRecoveryMethod !== 'AUTHORITY_REGION_REMEASURE') {
      regionsStillBlocked.push(block.regionId);
      transitions.push({ regionId: block.regionId, regionName: block.regionName, before: beforeStatus, after: beforeStatus });
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

    for (const row of recovered) {
      if (row.currentSource === 'DOM_RECT' || row.currentSource === 'COMPUTED_STYLE') {
        provenance.push({
          dimension: row.dimension,
          source: row.currentSource,
          sourceId: row.evidenceId,
          regionId: block.regionId,
          extractionMethod: plan.recommendedRecoveryMethod,
          confidence: row.confidence,
          timestamp: new Date().toISOString(),
        });
      }
    }

    const { merged, added } = mergeRecoveredDimensions(bundle.dimensions, recovered);
    dimensionsAdded += added;

    const reconciled = reconcileBundleDimensions({ ...bundle, dimensions: merged });
    regionForensics[idx] = reconciled;

    const afterStatus = reconciled.depthComputation?.depthStatus ?? reconciled.measurementDepth?.status ?? beforeStatus;
    transitions.push({ regionId: block.regionId, regionName: block.regionName, before: beforeStatus, after: afterStatus });

    if (isRegionDepthSufficient(reconciled)) regionsImproved.push(block.regionId);
    else regionsStillBlocked.push(block.regionId);
  }

  const patchedReport: AuthorityRelativeForensicsReport = {
    ...input.report,
    regionForensics,
    generatedAt: new Date().toISOString(),
  };

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
  else if (regionsImproved.length > 0) status = 'PARTIAL';

  const receipt: RegionEvidenceRecoveryReceipt = {
    forensicsVersionBefore: input.forensicsVersion,
    forensicsVersionAfter: input.forensicsVersion,
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
    createdAt: new Date().toISOString(),
  };

  appendRecoveryHistory(reconciledReport.reportId, { receipt, provenance });

  return { report: reconciledReport, receipt, provenance };
}
