/**
 * P0.VR.DIAG.1 — Measured reconstruction spec from forensics report.
 */

import type {
  AuthorityRelativeForensicsReport,
  ForensicConfidence,
  FunctionalRiskLevel,
  MeasuredReconstructionSpec,
  RegionReconstructionSpec,
  VisualCategory,
} from './types.js';

function inferFunctionalRisk(category: VisualCategory, regionName: string): FunctionalRiskLevel {
  if (category === 'NAVIGATION' && regionName.includes('BOTTOM NAV')) return 'MEDIUM';
  if (category === 'NAVIGATION') return 'LOW';
  if (category === 'GEOMETRY' || category === 'SPACING' || category === 'TYPOGRAPHY') return 'LOW';
  if (category === 'ASSET') return 'LOW';
  if (category === 'ORDER') return 'MEDIUM';
  return 'NONE';
}

export function buildMeasuredReconstructionSpec(input: {
  pageId: string;
  viewport: MeasuredReconstructionSpec['viewport'];
  authorityVersionId: string | null;
  captureId: string;
  report: AuthorityRelativeForensicsReport;
}): MeasuredReconstructionSpec {
  const regionSpecs: RegionReconstructionSpec[] = [];

  for (const diff of input.report.geometryDiffs) {
    regionSpecs.push(regionSpecFromGeometry(diff, input.report));
  }
  for (const diff of input.report.spacingDiffs) {
    regionSpecs.push({
      regionId: diff.regionId,
      regionName: diff.regionName,
      evidenceId: diff.evidenceId,
      authorityTarget: String(diff.authority),
      currentState: String(diff.current),
      delta: formatDelta(diff.absoluteDelta, diff.relativeDeltaPct, diff.confidence),
      correction: diff.correction,
      visualCategory: 'SPACING',
      confidence: diff.confidence,
      functionalRisk: inferFunctionalRisk('SPACING', diff.regionName),
      direction: diff.direction,
      dependencies: [],
      componentId: findComponentId(input.report, diff.regionId),
      selectorHint: findSelectorHint(input.report, diff.regionId),
      unresolvedComponentTarget: !findComponentId(input.report, diff.regionId),
      status: 'PENDING',
    });
  }
  for (const diff of input.report.assetDiffs) {
    regionSpecs.push({
      regionId: diff.regionId,
      regionName: diff.regionId,
      evidenceId: diff.evidenceId,
      authorityTarget: diff.authorityAssetRegion ? `${diff.authorityAssetRegion.geometry.heightPx}px region` : 'PRESENT',
      currentState: diff.currentAssetRegion ? `${diff.currentAssetRegion.geometry.heightPx}px region` : 'MISSING',
      delta: diff.matchStatus.replace(/_/g, ' '),
      correction: diff.correction,
      visualCategory: 'ASSET',
      confidence: diff.confidence,
      functionalRisk: 'LOW',
      direction: diff.matchStatus.includes('MISSING') ? 'ADD' : 'RESIZE',
      dependencies: [],
      componentId: findComponentId(input.report, diff.regionId),
      selectorHint: findSelectorHint(input.report, diff.regionId),
      unresolvedComponentTarget: !findComponentId(input.report, diff.regionId),
      status: 'PENDING',
    });
  }

  const specId = `spec_${input.pageId.replace(/[:/]/g, '_')}_${input.viewport}_${Date.now()}`;

  return {
    specId,
    pageId: input.pageId,
    viewport: input.viewport,
    authorityVersionId: input.authorityVersionId,
    captureId: input.captureId,
    forensicsReportId: input.report.reportId,
    regionSpecs: dedupeRegionSpecs(regionSpecs),
    functionalConstraints: [
      'Preserve routing',
      'Preserve auth',
      'Preserve permissions',
      'Preserve data fetching',
      'Preserve actions and forms',
    ],
    assetRequirements: input.report.assetDiffs.map((a) => a.correction),
    responsiveRequirements: input.report.orderDiffs.map((o) => o.correction),
    confidenceSummary: input.report.confidenceSummary,
    status: regionSpecs.length ? 'READY' : 'DRAFT',
    generatedAt: new Date().toISOString(),
  };
}

function regionSpecFromGeometry(
  diff: AuthorityRelativeForensicsReport['geometryDiffs'][number],
  report: AuthorityRelativeForensicsReport,
): RegionReconstructionSpec {
  return {
    regionId: diff.regionId,
    regionName: diff.regionName,
    evidenceId: diff.evidenceId,
    authorityTarget: `${diff.metric}: ${String(diff.authority)}`,
    currentState: `${diff.metric}: ${String(diff.current)}`,
    delta: formatDelta(diff.absoluteDelta, diff.relativeDeltaPct, diff.confidence),
    correction: diff.correction,
    visualCategory: 'GEOMETRY',
    confidence: diff.confidence,
    functionalRisk: inferFunctionalRisk('GEOMETRY', diff.regionName),
    direction: diff.direction,
    dependencies: [],
    componentId: findComponentId(report, diff.regionId),
    selectorHint: findSelectorHint(report, diff.regionId),
    unresolvedComponentTarget: !findComponentId(report, diff.regionId),
    status: 'PENDING',
  };
}

function formatDelta(abs: number | null, pct: number | null, confidence: ForensicConfidence): string {
  const parts: string[] = [];
  if (abs != null && Number.isFinite(abs)) {
    parts.push(confidence === 'LOW' ? `~${Math.round(abs)}px` : `${Math.round(abs)}px`);
  }
  if (pct != null && Number.isFinite(pct)) {
    parts.push(confidence === 'LOW' ? `~${Math.round(pct)}%` : `${Math.round(pct)}%`);
  }
  return parts.length ? parts.join(' · ') : 'DRIFT DETECTED';
}

function findComponentId(report: AuthorityRelativeForensicsReport, regionId: string): string | null {
  const match = report.regionMatches.find((m) => m.regionId === regionId);
  return match?.currentRegion?.componentId ?? match?.authorityRegion?.componentId ?? null;
}

function findSelectorHint(report: AuthorityRelativeForensicsReport, regionId: string): string | null {
  const match = report.regionMatches.find((m) => m.regionId === regionId);
  return match?.currentRegion?.selectorHint ?? match?.authorityRegion?.selectorHint ?? null;
}

function dedupeRegionSpecs(specs: RegionReconstructionSpec[]): RegionReconstructionSpec[] {
  const seen = new Set<string>();
  return specs.filter((s) => {
    const key = `${s.regionId}:${s.evidenceId}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
