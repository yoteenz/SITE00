/**
 * P0.VR.DIAG.1 / P0.VR.DIAG.1R1 — Measured reconstruction spec from forensics report.
 */

import type {
  AuthorityRelativeForensicsReport,
  ForensicConfidence,
  FunctionalRiskLevel,
  MeasuredReconstructionSpec,
  RegionForensicsBundle,
  RegionReconstructionSpec,
  VisualCategory,
} from './types.js';

function inferFunctionalRisk(category: VisualCategory, regionName: string, bundle?: RegionForensicsBundle): FunctionalRiskLevel {
  if (bundle?.functionalRisk) return bundle.functionalRisk;
  if (category === 'NAVIGATION' && regionName.includes('BOTTOM')) return 'MEDIUM';
  if (category === 'NAVIGATION') return 'LOW';
  if (category === 'GEOMETRY' || category === 'SPACING' || category === 'TYPOGRAPHY') return 'LOW';
  if (category === 'ASSET') return 'LOW';
  if (category === 'ORDER') return 'MEDIUM';
  return 'NONE';
}

function mapRegionTypeToCategory(bundle: RegionForensicsBundle): VisualCategory {
  switch (bundle.regionType) {
    case 'NAVIGATION':
    case 'PERSISTENT_NAV':
      return 'NAVIGATION';
    case 'MEDIA':
    case 'HERO':
      return 'ASSET';
    case 'IDENTITY':
      return 'TYPOGRAPHY';
    case 'LIST':
    case 'CARD_RAIL':
    case 'METRICS':
      return 'DENSITY';
    case 'HEADER':
      return 'GEOMETRY';
    default:
      return 'GEOMETRY';
  }
}

export function buildMeasuredReconstructionSpec(input: {
  pageId: string;
  viewport: MeasuredReconstructionSpec['viewport'];
  authorityVersionId: string | null;
  captureId: string;
  report: AuthorityRelativeForensicsReport;
}): MeasuredReconstructionSpec {
  const regionSpecs: RegionReconstructionSpec[] = [];

  for (const bundle of input.report.regionForensics) {
    if (bundle.status === 'MISSING_AUTHORITY') {
      regionSpecs.push(regionSpecFromBundle(bundle, 'REMOVE', input.report));
      continue;
    }
    if (bundle.status === 'MISSING_CURRENT') {
      regionSpecs.push(regionSpecFromBundle(bundle, 'ADD', input.report));
      continue;
    }
    if (bundle.dimensions.length === 0) {
      regionSpecs.push(regionSpecFromBundle(bundle, 'RESIZE', input.report));
      continue;
    }
    for (const dim of bundle.dimensions) {
      regionSpecs.push(dimensionToRegionSpec(bundle, dim, input.report));
    }
  }

  for (const diff of input.report.spacingDiffs) {
    if (regionSpecs.some((s) => s.evidenceId === diff.evidenceId)) continue;
    regionSpecs.push({
      regionId: diff.regionId,
      regionName: diff.regionName,
      evidenceId: diff.evidenceId,
      authorityTarget: String(diff.authority),
      currentState: String(diff.current),
      delta: formatDelta(diff.absoluteDelta, diff.relativeDeltaPct, diff.confidence),
      correction: diff.correction,
      corrections: [diff.correction],
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

  const gate = input.report.coverageGate;
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
    coverageGateStatus: gate.status,
    status: gate.blockApproveDirection ? 'DRAFT' : regionSpecs.length ? 'READY' : 'DRAFT',
    generatedAt: new Date().toISOString(),
  };
}

function regionSpecFromBundle(
  bundle: RegionForensicsBundle,
  direction: RegionReconstructionSpec['direction'],
  _report: AuthorityRelativeForensicsReport,
): RegionReconstructionSpec {
  const primary = bundle.dimensions[0];
  return {
    regionId: bundle.regionId,
    regionName: bundle.regionName,
    evidenceId: primary?.evidenceId ?? `region_${bundle.regionId}`,
    outcome: bundle.status,
    authorityTarget: primary ? String(primary.authorityValue) : 'PRESENT',
    currentState: primary ? String(primary.currentValue) : bundle.status === 'MISSING_CURRENT' ? 'MISSING' : 'EXTRA',
    delta: primary?.delta ?? bundle.status.replace(/_/g, ' '),
    correction: bundle.corrections[0] ?? `Review ${bundle.regionName.toLowerCase()}`,
    corrections: bundle.corrections,
    dimensionDeltas: bundle.dimensions,
    visualCategory: mapRegionTypeToCategory(bundle),
    confidence: bundle.confidence,
    functionalRisk: bundle.functionalRisk,
    direction,
    dependencies: [],
    componentId: bundle.componentTarget.componentId,
    selectorHint: bundle.componentTarget.selector,
    unresolvedComponentTarget: bundle.componentTarget.unresolvedComponentTarget,
    status: 'PENDING',
  };
}

function dimensionToRegionSpec(
  bundle: RegionForensicsBundle,
  dim: RegionForensicsBundle['dimensions'][number],
  _report: AuthorityRelativeForensicsReport,
): RegionReconstructionSpec {
  const direction = dim.delta?.includes('MISSING') ? 'ADD' : dim.delta?.startsWith('-') ? 'INCREASE' : 'DECREASE';
  return {
    regionId: bundle.regionId,
    regionName: bundle.regionName,
    evidenceId: dim.evidenceId,
    outcome: bundle.status,
    authorityTarget: `${dim.dimension}: ${String(dim.authorityValue)}`,
    currentState: `${dim.dimension}: ${String(dim.currentValue)}`,
    delta: dim.delta ?? 'DRIFT',
    correction: bundle.corrections.find((c) => c.toLowerCase().includes(dim.dimension.toLowerCase())) ?? bundle.corrections[0] ?? `Align ${dim.dimension}`,
    corrections: bundle.corrections,
    dimensionDeltas: bundle.dimensions,
    visualCategory: mapRegionTypeToCategory(bundle),
    confidence: dim.confidence,
    functionalRisk: inferFunctionalRisk(mapRegionTypeToCategory(bundle), bundle.regionName, bundle),
    direction,
    dependencies: [],
    componentId: bundle.componentTarget.componentId,
    selectorHint: bundle.componentTarget.selector,
    unresolvedComponentTarget: bundle.componentTarget.unresolvedComponentTarget,
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
  const bundle = report.regionForensics.find((b) => b.regionId === regionId);
  if (bundle) return bundle.componentTarget.componentId;
  const match = report.regionMatches.find((m) => m.regionId === regionId);
  return match?.currentRegion?.componentId ?? match?.authorityRegion?.componentId ?? null;
}

function findSelectorHint(report: AuthorityRelativeForensicsReport, regionId: string): string | null {
  const bundle = report.regionForensics.find((b) => b.regionId === regionId);
  if (bundle) return bundle.componentTarget.selector;
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
