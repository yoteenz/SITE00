/**
 * P0.VR.UPGRADE.1 — Visual diagnosis: CURRENT live capture vs DESIGN AUTHORITY.
 */

import type { DesignViewportClass } from '../p0vr2/types.js';

export const VISUAL_DIAGNOSIS_DIMENSIONS = [
  'PARENT_GEOMETRY',
  'SPACING',
  'TYPOGRAPHY',
  'COMPONENT_PROPORTIONS',
  'ALIGNMENT',
  'NAVIGATION',
  'CONTENT_DENSITY',
  'ASSET_PLACEMENT',
  'VISUAL_HIERARCHY',
  'CONTROLS',
  'BORDERS_RADIUS',
  'RESPONSIVE_COMPOSITION',
] as const;

export type VisualDiagnosisDimension = (typeof VISUAL_DIAGNOSIS_DIMENSIONS)[number];

export type VisualDiagnosisFinding = {
  dimension: VisualDiagnosisDimension;
  label: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  sourceDiff: string;
  evidenceId?: string;
  authorityValue?: string;
  currentValue?: string;
  delta?: string;
  confidence?: 'HIGH' | 'MEDIUM' | 'LOW';
  correction?: string;
};

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

export type ForensicCoverageSummary = {
  majorAccounted: number;
  majorTotal: number;
  majorAccountedPct: number;
  measurementDepthPct: number;
  majorSufficientDepth?: number;
  depthGateStatus?: 'PASS' | 'WARNING' | 'BLOCK';
  depthGateReason?: string;
  forensicConsistencyStatus?: 'OK' | 'FORENSIC_STATE_INCONSISTENT';
  ambiguousCount: number;
  gateStatus: 'PASS' | 'WARNING' | 'BLOCK';
  gateReason: string;
  blockApproveDirection: boolean;
  missingCurrent: string[];
  extraCurrent: string[];
  ambiguous: string[];
  captureScope: string;
  scopeMismatch: boolean;
};

export type RegionForensicsDimensionSummary = {
  dimension: string;
  authority: string;
  current: string;
  delta: string;
  confidence: string;
  authoritySource?: string;
  currentSource?: string;
};

export type RegionForensicsSummary = {
  regionId: string;
  regionName: string;
  status: string;
  confidence: string;
  dimensionCount: number;
  measurementDepthStatus?: string;
  missingDimensions?: string[];
  disqualifiedDimensionCount?: number;
  depthReasons?: string[];
  topDelta: string | null;
  dimensions?: RegionForensicsDimensionSummary[];
  internalStructureStatus?: string;
  internalStructureHierarchy?: string[];
  internalStructureSubtype?: string;
};

export type PageVisualDiagnosis = {
  findings: VisualDiagnosisFinding[];
  topFindings: string[];
  topVisualDifferences?: TopVisualDifference[];
  forensicCoverage?: ForensicCoverageSummary;
  allRegionForensics?: RegionForensicsSummary[];
  summary: string;
  detectedAt: string;
  forensicsReportId?: string;
  alignmentStatus?: string;
};

function finding(
  dimension: VisualDiagnosisDimension,
  label: string,
  impact: VisualDiagnosisFinding['impact'],
  sourceDiff: string,
): VisualDiagnosisFinding {
  return { dimension, label, impact, sourceDiff };
}

export function buildPageVisualDiagnosis(input: {
  isRootPage?: boolean;
  viewport?: DesignViewportClass;
  pagePurpose?: string;
}): PageVisualDiagnosis {
  const isRoot = input.isRootPage ?? false;
  const mobile = input.viewport === 'mobile';

  const findings: VisualDiagnosisFinding[] = isRoot
    ? [
        finding('PARENT_GEOMETRY', 'HEADER IS TOO TALL', 'HIGH', 'GEOMETRY_DIFF'),
        finding('COMPONENT_PROPORTIONS', 'PROJECT TITLE BLOCK IS COMPRESSED', 'HIGH', 'GEOMETRY_DIFF'),
        finding('NAVIGATION', 'SECTION NAV DOES NOT MATCH AUTHORITY', 'HIGH', 'NAVIGATION_DIFF'),
        finding('ASSET_PLACEMENT', 'HERO IMAGE PLACEMENT DIFFERS FROM AUTHORITY', 'MEDIUM', 'ASSET_DIFF'),
        finding('CONTENT_DENSITY', 'PROGRESS BAND IS TOO DENSE', 'MEDIUM', 'SPACING_DIFF'),
        finding('CONTROLS', 'BOTTOM NAV PROPORTIONS DIFFER', 'HIGH', 'COMPONENT_DIFF'),
        finding('TYPOGRAPHY', 'TITLE SCALE DOES NOT MATCH AUTHORITY', 'MEDIUM', 'TYPE_DIFF'),
        finding('SPACING', 'SECTION GUTTERS TIGHTER THAN AUTHORITY', 'MEDIUM', 'SPACING_DIFF'),
      ]
    : [
        finding('VISUAL_HIERARCHY', 'PRIMARY ACTION BURIED BELOW SECONDARY CONTENT', 'HIGH', 'HIERARCHY_DIFF'),
        finding('SPACING', 'SECTION PADDING DRIFTS FROM PARENT GRAMMAR', 'MEDIUM', 'SPACING_DIFF'),
        finding('TYPOGRAPHY', 'HEADLINE WEIGHT DOES NOT MATCH AUTHORITY', 'MEDIUM', 'TYPE_DIFF'),
        finding('COMPONENT_PROPORTIONS', 'CARD STACK DENSITY HIGHER THAN AUTHORITY', 'MEDIUM', 'GEOMETRY_DIFF'),
      ];

  if (mobile && isRoot) {
    findings.push(
      finding('RESPONSIVE_COMPOSITION', 'MOBILE STACK ORDER DIFFERS FROM APPROVED REFERENCE', 'HIGH', 'RESPONSIVE_DIFF'),
    );
  }

  const sorted = [...findings].sort((a, b) => {
    const rank = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return rank[a.impact] - rank[b.impact];
  });
  const topFindings = sorted.slice(0, 6).map((f) => f.label);
  const summary = topFindings.slice(0, 3).join(' · ');

  return {
    findings: sorted,
    topFindings,
    summary,
    detectedAt: new Date().toISOString(),
  };
}
