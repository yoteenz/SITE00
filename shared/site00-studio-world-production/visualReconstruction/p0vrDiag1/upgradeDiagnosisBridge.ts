/**
 * P0.VR.DIAG.1 — Bridge forensics → upgrade UI types (PageVisualDiagnosis + ReconstructionPlan).
 */

import type { PageVisualDiagnosis, VisualDiagnosisDimension, VisualDiagnosisFinding } from '../p0vrCapture1/pageVisualDiagnosis.js';
import type { ReconstructionPlan, ReconstructionPlanChange } from '../p0vrCapture1/reconstructionPlan.js';
import { buildMeasuredReconstructionSpec } from './measuredReconstructionSpec.js';
import { runAuthorityRelativeForensics } from './authorityRelativeForensicsEngine.js';
import { reconcileForensicReportScoring } from './forensicReconciliation.js';
import { resolvePageRegionLayoutProfile } from './pageRegionLayoutProfiles.js';
import { storeForensicReport } from './forensicReportRegistry.js';
import {
  analyzeMissingForensicEvidence,
  type AnalyzeMissingForensicEvidenceInput,
} from '../p0vrDiag1R4/regionEvidenceRecovery.js';
import type { RegionEvidenceRecoveryReceipt } from '../p0vrDiag1R4/types.js';
import type {
  AuthorityRelativeForensicsInput,
  AuthorityRelativeForensicsReport,
  DomRegionMeasurement,
  GeometryDelta,
  MeasuredReconstructionSpec,
} from './types.js';
import { P0_VR_DIAG_1R5A_BUILD } from './constants.js';
import {
  regionNeedsAnalyzeStructure,
  resolveRegionInternalStructureSummary,
  resolveRegionStructureViewModel,
} from '../p0vrDiag1R5/enrichRegionStructure.js';
import { shouldShowViewStructure } from '../p0vrDiag1R5/structureUiVisibility.js';
import type { StructureToDepthTrace } from '../p0vrDiag1R5/structureToDepthTrace.js';

export type ForensicUpgradeBundle = {
  report: AuthorityRelativeForensicsReport;
  measuredSpec: MeasuredReconstructionSpec;
  visualDiagnosis: PageVisualDiagnosis;
  reconstructionPlan: ReconstructionPlan;
};

export function buildForensicUpgradeBundle(input: AuthorityRelativeForensicsInput & {
  pagePurpose: string;
  route: string;
  isRootPage?: boolean;
}): ForensicUpgradeBundle {
  const report = runAuthorityRelativeForensics(input);
  const measuredSpec = buildMeasuredReconstructionSpec({
    pageId: input.pageId,
    viewport: input.viewport,
    authorityVersionId: input.designAuthority.authorityVersionId,
    captureId: input.currentCapture.captureId,
    report,
  });
  const profile = resolvePageRegionLayoutProfile({
    pageArchetype: input.pageArchetype,
    screenId: input.screenId,
    isRootPage: input.isRootPage,
  });
  const visualDiagnosis = forensicReportToVisualDiagnosis(report, {
    profile,
    domMeasurements: input.currentCapture.domMeasurements,
  });
  const reconstructionPlan = measuredSpecToReconstructionPlan({
    measuredSpec,
    report,
    pagePurpose: input.pagePurpose,
    route: input.route,
    isRootPage: input.isRootPage,
  });
  storeForensicReport(report);
  return { report, measuredSpec, visualDiagnosis, reconstructionPlan };
}

/** Reconcile scoring/math on an existing report without re-extracting dimensions (1R3). */
export function recomputeForensicScoringFromReport(
  report: AuthorityRelativeForensicsReport,
  input: {
    pageArchetype: string;
    screenId?: string;
    isRootPage?: boolean;
    pagePurpose?: string;
    route?: string;
    domMeasurements?: DomRegionMeasurement[];
    structureToDepthTraces?: StructureToDepthTrace[];
  },
): ForensicUpgradeBundle {
  const profile = resolvePageRegionLayoutProfile({
    pageArchetype: input.pageArchetype,
    screenId: input.screenId,
    isRootPage: input.isRootPage,
  });
  const { report: reconciled } = reconcileForensicReportScoring({ report, profile });
  const measuredSpec = buildMeasuredReconstructionSpec({
    pageId: reconciled.pageId,
    viewport: reconciled.viewport,
    authorityVersionId: reconciled.authorityVersionId,
    captureId: reconciled.captureId,
    report: reconciled,
  });
  const visualDiagnosis = forensicReportToVisualDiagnosis(reconciled, {
    profile,
    domMeasurements: input.domMeasurements,
    structureToDepthTraces: input.structureToDepthTraces,
  });
  const reconstructionPlan = measuredSpecToReconstructionPlan({
    measuredSpec,
    report: reconciled,
    pagePurpose: input.pagePurpose ?? reconciled.pageId,
    route: input.route ?? reconciled.pageId,
    isRootPage: input.isRootPage,
  });
  storeForensicReport(reconciled);
  return { report: reconciled, measuredSpec, visualDiagnosis, reconstructionPlan };
}

/** Targeted shallow-region evidence recovery (1R4) — blockers only, no full re-segment. */
export function runRegionEvidenceRecoveryForUpgrade(input: {
  report: AuthorityRelativeForensicsReport;
  forensicsVersion: string;
  pageArchetype: string;
  screenId?: string;
  isRootPage?: boolean;
  pagePurpose?: string;
  route?: string;
  domMeasurements?: AnalyzeMissingForensicEvidenceInput['domMeasurements'];
  cssSnapshot?: AnalyzeMissingForensicEvidenceInput['cssSnapshot'];
  shell?: AnalyzeMissingForensicEvidenceInput['shell'];
  viewportWidth?: number;
  viewportHeight?: number;
}): { bundle: ForensicUpgradeBundle; receipt: RegionEvidenceRecoveryReceipt } {
  const profile = resolvePageRegionLayoutProfile({
    pageArchetype: input.pageArchetype,
    screenId: input.screenId,
    isRootPage: input.isRootPage,
  });
  const { report: recovered, receipt } = analyzeMissingForensicEvidence({
    report: input.report,
    profile,
    forensicsVersion: input.forensicsVersion,
    domMeasurements: input.domMeasurements,
    cssSnapshot: input.cssSnapshot,
    shell: input.shell,
    viewportWidth: input.viewportWidth,
    viewportHeight: input.viewportHeight,
  });
  const bundle = recomputeForensicScoringFromReport(recovered, {
    pageArchetype: input.pageArchetype,
    screenId: input.screenId,
    isRootPage: input.isRootPage,
    pagePurpose: input.pagePurpose,
    route: input.route,
    domMeasurements: input.domMeasurements,
    structureToDepthTraces: receipt.structureToDepthTraces,
  });
  return { bundle, receipt };
}

export function forensicReportToVisualDiagnosis(
  report: AuthorityRelativeForensicsReport,
  options?: {
    profile?: ReturnType<typeof resolvePageRegionLayoutProfile>;
    domMeasurements?: DomRegionMeasurement[];
    structureToDepthTraces?: StructureToDepthTrace[];
  },
): PageVisualDiagnosis {
  const profile =
    options?.profile ??
    resolvePageRegionLayoutProfile({ pageArchetype: report.pageId, screenId: undefined, isRootPage: true });
  const traceByRegion = new Map((options?.structureToDepthTraces ?? []).map((t) => [t.regionId, t]));
  const findings: VisualDiagnosisFinding[] = [];

  for (const item of report.topImpactItems) {
    const diff = report.geometryDiffs.find((d) => d.evidenceId === item.evidenceId)
      ?? report.spacingDiffs.find((d) => d.evidenceId === item.evidenceId);
    if (!diff) continue;
    findings.push({
      dimension: mapCategoryToDimension(diff.regionName),
      label: formatTopDifferenceLabel(diff),
      impact: diff.severity,
      sourceDiff: diff.evidenceId,
      evidenceId: diff.evidenceId,
      authorityValue: String(diff.authority),
      currentValue: String(diff.current),
      delta: formatDeltaLabel(diff),
      confidence: diff.confidence,
      correction: diff.correction,
    });
  }

  for (const missing of report.missingRegions) {
    findings.push({
      dimension: 'ASSET_PLACEMENT',
      label: `${missing} — MISSING IN CURRENT`,
      impact: 'HIGH',
      sourceDiff: 'MISSING_REGION',
    });
  }

  const sorted = [...findings].sort((a, b) => {
    const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return rank[a.impact] - rank[b.impact];
  });

  const topFindings = sorted.slice(0, 6).map((f) => f.label);
  return {
    findings: sorted,
    topFindings,
    topVisualDifferences: buildTopVisualDifferences(report),
    forensicCoverage: {
      majorAccounted: report.coverageMap.coverageScore.majorAccounted,
      majorTotal: report.coverageMap.coverageScore.majorAuthorityTotal,
      majorAccountedPct: report.coverageMap.coverageScore.majorAccountedPct,
      measurementDepthPct:
        report.topLevelDepthAggregation?.depthPct ?? report.coverageMap.coverageScore.measurementDepthPct,
      majorSufficientDepth:
        report.topLevelDepthAggregation?.sufficientRegionCount ??
        report.coverageMap.coverageScore.majorWithSufficientDepth,
      depthGateStatus: report.measurementDepthGate.status,
      depthGateReason: report.measurementDepthGate.reason,
      forensicConsistencyStatus: report.forensicConsistencyStatus ?? 'OK',
      ambiguousCount: report.coverageMap.coverageScore.ambiguousCount,
      gateStatus: report.coverageGate.status,
      gateReason: report.coverageGate.reason,
      blockApproveDirection: report.coverageGate.blockApproveDirection,
      missingCurrent: report.coverageMap.missingCurrent,
      extraCurrent: report.coverageMap.extraCurrent,
      ambiguous: report.coverageMap.ambiguous,
      captureScope: report.coverageMap.captureScope,
      scopeMismatch: report.coverageMap.scopeMismatch,
    },
    allRegionForensics: report.regionForensics.map((b) => {
      const structureSummary = resolveRegionInternalStructureSummary({
        bundle: b,
        report,
        profile,
        domMeasurements: options?.domMeasurements,
      });
      const depthTrace = traceByRegion.get(b.regionId);
      const structureView = resolveRegionStructureViewModel({
        bundle: { ...b, internalStructure: structureSummary },
        report,
        profile,
        domMeasurements: options?.domMeasurements,
        failureCode: structureSummary.failureCode ?? depthTrace?.blockingReason ?? undefined,
        failureDetail: structureSummary.failureDetail ?? undefined,
      });
      const measurementDepthStatus = b.depthComputation?.depthStatus ?? b.measurementDepth?.status ?? 'UNMEASURED';
      return {
        regionId: b.regionId,
        regionName: b.regionName,
        regionType: b.regionType,
        status: b.status,
        confidence: b.confidence,
        dimensionCount:
          b.measurementDepth?.validDimensionCount ??
          b.depthComputation?.qualifiedDimensions.filter((q) => q.countsTowardDepth).length ??
          b.dimensions.length,
        measurementDepthStatus,
        missingDimensions: b.measurementDepth?.missingDimensions ?? [],
        disqualifiedDimensionCount:
          b.measurementDepth?.disqualifiedDimensionCount ?? b.depthComputation?.disqualifiedDimensions.length ?? 0,
        depthReasons: b.measurementDepth?.depthReasons ?? b.depthComputation?.reasons ?? [],
        topDelta: b.dimensions.find((d) => d.delta && !d.alignedWithinTolerance)?.delta ?? null,
        dimensions: b.dimensions.map((d) => ({
          dimension: d.dimension,
          authority: String(d.authorityValue),
          current: String(d.currentValue),
          delta: d.delta ?? '0px',
          confidence: d.confidence,
          authoritySource: d.authoritySource ?? d.source,
          currentSource: d.currentSource ?? d.source,
        })),
        internalStructureStatus: structureSummary.status,
        internalStructureHierarchy: structureSummary.anchorHierarchy,
        internalStructureSubtype: structureSummary.subtype,
        structureFailureCode: structureSummary.failureCode,
        structureFailureDetail: structureSummary.failureDetail,
        showViewStructure: shouldShowViewStructure({
          regionType: b.regionType,
          measurementDepthStatus,
          internalStructureStatus: structureSummary.status,
          significance: b.significance,
        }),
        showAnalyzeStructure: regionNeedsAnalyzeStructure({ ...b, internalStructure: structureSummary }, structureSummary),
        structureView: structureView ?? undefined,
        structureToDepthTrace: depthTrace,
      };
    }),
    summary: topFindings.slice(0, 3).join(' · '),
    detectedAt: report.generatedAt,
    forensicsReportId: report.reportId,
    alignmentStatus: report.alignmentStatus,
    forensicsEngineVersion: report.forensicsVersion ?? P0_VR_DIAG_1R5A_BUILD,
    structureUiVersion: 'R5A',
    structureToDepthTraces: options?.structureToDepthTraces,
  };
}

export function buildTopVisualDifferences(report: AuthorityRelativeForensicsReport): TopVisualDifference[] {
  const items: TopVisualDifference[] = [];
  for (const score of report.topImpactItems) {
    const diff =
      report.geometryDiffs.find((d) => d.evidenceId === score.evidenceId) ??
      report.spacingDiffs.find((d) => d.evidenceId === score.evidenceId);
    if (!diff) continue;
    items.push({
      evidenceId: diff.evidenceId,
      regionName: diff.regionName,
      metric: 'metric' in diff ? diff.metric : 'spacing',
      authority: String(diff.authority),
      current: String(diff.current),
      delta: formatDeltaLabel(diff),
      confidence: diff.confidence,
      correction: diff.correction,
      impactScore: score.score,
    });
  }
  return items;
}

export type TopVisualDifference = {
  evidenceId: string;
  regionName: string;
  metric: string;
  authority: string;
  current: string;
  delta: string;
  confidence: string;
  correction: string;
  impactScore: number;
};

function measuredSpecToReconstructionPlan(input: {
  measuredSpec: MeasuredReconstructionSpec;
  report: AuthorityRelativeForensicsReport;
  pagePurpose: string;
  route: string;
  isRootPage?: boolean;
}): ReconstructionPlan {
  const { measuredSpec, report, pagePurpose, route, isRootPage } = input;
  const geometryChanges: ReconstructionPlanChange[] = [];
  const spacingChanges: ReconstructionPlanChange[] = [];
  const componentChanges: ReconstructionPlanChange[] = [];
  const assetChanges: ReconstructionPlanChange[] = [];
  const typographyChanges: ReconstructionPlanChange[] = [];

  for (const region of measuredSpec.regionSpecs) {
    if (region.status === 'FOUNDER_OVERRIDE_KEEP_CURRENT' || region.status === 'EXCLUDED') continue;
    const change: ReconstructionPlanChange = {
      id: region.evidenceId,
      label: compactPlanLabel(region),
      sourceDimension: mapVisualCategoryToDimension(region.visualCategory),
      category: mapVisualCategoryToPlanCategory(region.visualCategory),
      evidenceId: region.evidenceId,
      authorityValue: region.authorityTarget,
      currentValue: region.currentState,
      delta: region.delta,
      correction: region.correction,
      confidence: region.confidence,
      functionalRisk: region.functionalRisk,
      regionId: region.regionId,
      regionName: region.regionName,
    };
    if (change.category === 'geometry') geometryChanges.push(change);
    else if (change.category === 'spacing') spacingChanges.push(change);
    else if (change.category === 'asset') assetChanges.push(change);
    else if (change.category === 'typography') typographyChanges.push(change);
    else componentChanges.push(change);
  }

  const goal = isRootPage
    ? `Measured reconstruction toward approved ${pagePurpose} authority (spec ${measuredSpec.specId}).`
    : `Measured reconstruction for ${route} from forensic diffs.`;

  return {
    planId: measuredSpec.specId,
    pageId: measuredSpec.pageId,
    pagePurpose,
    viewport: measuredSpec.viewport,
    authorityVersionId: measuredSpec.authorityVersionId,
    captureId: measuredSpec.captureId,
    goal,
    geometryChanges,
    typographyChanges,
    componentChanges,
    assetChanges,
    spacingChanges,
    interactionPreservation: ['Preserve tap targets', 'Preserve nav behavior', 'Preserve form submit flows'],
    responsiveChanges: [],
    functionPreservation: measuredSpec.functionalConstraints,
    rootPreservation: isRootPage
      ? ['Root navigation', 'Project switching', 'Founder / client mode', 'Project status surfaces']
      : [],
    risks: report.functionalRiskSummary.filter((r) => r.risk === 'HIGH' || r.risk === 'CRITICAL').map((r) => r.changeSummary),
    status: 'DRAFT',
    measuredSpecId: measuredSpec.specId,
    forensicsReportId: report.reportId,
  };
}

function compactPlanLabel(region: MeasuredReconstructionSpec['regionSpecs'][number]): string {
  return `${region.regionName} — ${region.delta} — ${region.direction}`;
}

function formatTopDifferenceLabel(diff: GeometryDelta): string {
  return `${diff.regionName} — ${String(diff.current)} vs authority ${String(diff.authority)} (${formatDeltaLabel(diff)})`;
}

function formatDeltaLabel(diff: { absoluteDelta: number | null; relativeDeltaPct: number | null; confidence: string }): string {
  const parts: string[] = [];
  if (diff.absoluteDelta != null) parts.push(`${diff.absoluteDelta > 0 ? '+' : ''}${Math.round(diff.absoluteDelta)}px`);
  if (diff.relativeDeltaPct != null) parts.push(`${diff.relativeDeltaPct > 0 ? '+' : ''}${Math.round(diff.relativeDeltaPct)}%`);
  return parts.join(' · ') || 'DRIFT';
}

function mapCategoryToDimension(regionName: string): VisualDiagnosisDimension {
  const upper = regionName.toUpperCase();
  if (upper.includes('NAV') || upper.includes('METRICS')) return 'NAVIGATION';
  if (upper.includes('GUTTER') || upper.includes('GAP')) return 'SPACING';
  if (upper.includes('TITLE') || upper.includes('HERO')) return 'TYPOGRAPHY';
  if (upper.includes('CARD') || upper.includes('PRODUCTION')) return 'ASSET_PLACEMENT';
  if (upper.includes('BOTTOM')) return 'CONTROLS';
  return 'PARENT_GEOMETRY';
}

function mapVisualCategoryToDimension(category: MeasuredReconstructionSpec['regionSpecs'][number]['visualCategory']): VisualDiagnosisDimension {
  switch (category) {
    case 'SPACING':
      return 'SPACING';
    case 'TYPOGRAPHY':
      return 'TYPOGRAPHY';
    case 'ASSET':
      return 'ASSET_PLACEMENT';
    case 'NAVIGATION':
      return 'NAVIGATION';
    case 'CONTROL':
      return 'CONTROLS';
    case 'DENSITY':
      return 'CONTENT_DENSITY';
    default:
      return 'PARENT_GEOMETRY';
  }
}

function mapVisualCategoryToPlanCategory(
  category: MeasuredReconstructionSpec['regionSpecs'][number]['visualCategory'],
): ReconstructionPlanChange['category'] {
  switch (category) {
    case 'SPACING':
      return 'spacing';
    case 'TYPOGRAPHY':
      return 'typography';
    case 'ASSET':
      return 'asset';
    case 'NAVIGATION':
    case 'CONTROL':
      return 'component';
    default:
      return 'geometry';
  }
}
