import type { FamilyQaCheck, IconInkMeasurement, QaVerdict, VisualFamilySpec } from './types.js';

export type DriftProposal = {
  linecap: 'butt' | 'round' | 'square';
  linejoin: 'miter' | 'round' | 'bevel';
  strokeWidths: number[];
  cornerMode: VisualFamilySpec['geometryRules']['cornerMode'];
  bakedRed: boolean;
  innerCore: boolean;
  silhouette: 'FAMILY_OBJECT' | 'GENERIC_LIBRARY';
};

export type DriftReport = {
  flagged: boolean;
  code: 'GENERIC_FAMILY_DRIFT' | null;
  reasons: string[];
  verdict: QaVerdict;
};

function worst(checks: FamilyQaCheck[]): QaVerdict {
  if (checks.some((c) => c.verdict === 'FAIL')) return 'FAIL';
  if (checks.some((c) => c.verdict === 'NEEDS_REVIEW')) return 'NEEDS_REVIEW';
  return 'PASS';
}

export function detectGenericFamilyDrift(proposal: DriftProposal): DriftReport {
  const reasons: string[] = [];
  if (proposal.silhouette === 'GENERIC_LIBRARY') reasons.push('Silhouette matches an unmodified generic icon-library glyph.');
  if (proposal.linecap === 'round' && proposal.linejoin === 'round' && !proposal.innerCore) {
    reasons.push('Round caps and round joins with no inner core match Lucide-style default glyphs.');
  }
  if (proposal.strokeWidths.length > 1) reasons.push('Mixed stroke weights inside one glyph.');
  if (proposal.cornerMode === 'MIXED_UNRELATED') reasons.push('Unrelated corner radii inside one glyph.');
  if (proposal.bakedRed) reasons.push('Red is baked into the base master instead of left to the host.');
  const flagged = reasons.length > 0;
  return {
    flagged,
    code: flagged ? 'GENERIC_FAMILY_DRIFT' : null,
    reasons,
    verdict: flagged ? 'FAIL' : 'PASS',
  };
}

export function evaluateInkMeasurements(
  family: VisualFamilySpec,
  measurements: Record<string, IconInkMeasurement>,
  roles: string[],
): { checks: FamilyQaCheck[]; overall: QaVerdict } {
  const checks: FamilyQaCheck[] = [];
  const rows = roles.map((role) => measurements[role]).filter(Boolean);
  checks.push({
    id: 'member-count',
    verdict: rows.length === roles.length ? 'PASS' : 'FAIL',
    detail: `${rows.length} measured of ${roles.length} roles`,
  });
  const red = rows.reduce((n, row) => n + row.redPixels, 0);
  checks.push({
    id: 'red-accent-usage',
    verdict: red === 0 && !family.geometryRules.bakedRed ? 'PASS' : 'FAIL',
    detail: red === 0 ? 'Base masters contain no red pixels.' : `${red} red pixels baked into masters.`,
  });
  const canvases = new Set(rows.map((row) => row.canvas));
  checks.push({
    id: 'bounding-box',
    verdict: canvases.size === 1 && canvases.has(512) ? 'PASS' : 'FAIL',
    detail: `Canvases ${[...canvases].join(',')}`,
  });
  const offCenter = rows.filter(
    (row) => Math.abs(row.centerOfGravityX - 256) > 36 || Math.abs(row.centerOfGravityY - 256) > 40,
  );
  checks.push({
    id: 'center-of-gravity',
    verdict: offCenter.length === 0 ? 'PASS' : 'NEEDS_REVIEW',
    detail: offCenter.length === 0 ? 'Ink mass sits near the canvas center.' : `${offCenter.length} icons sit off center.`,
  });
  const thin = rows.filter((row) => row.occupancy < 0.45 || row.occupancy > 0.7);
  checks.push({
    id: 'optical-size',
    verdict: thin.length === 0 ? 'PASS' : 'NEEDS_REVIEW',
    detail: thin.length === 0 ? 'Longest ink side stays in the shared occupancy band.' : `${thin.length} icons fall outside occupancy.`,
  });
  const drift = detectGenericFamilyDrift({
    linecap: family.geometryRules.linecap,
    linejoin: family.geometryRules.linejoin,
    strokeWidths: [family.geometryRules.strokeWidth],
    cornerMode: family.geometryRules.cornerMode,
    bakedRed: family.geometryRules.bakedRed,
    innerCore: family.geometryRules.innerCoreRequired,
    silhouette: 'FAMILY_OBJECT',
  });
  checks.push({
    id: 'generic-icon-drift',
    verdict: drift.verdict,
    detail: drift.flagged ? drift.reasons.join(' ') : 'Construction does not match a generic icon-library default.',
  });
  checks.push({
    id: 'stroke-weight',
    verdict: family.geometryRules.strokeWidth > 0 ? 'PASS' : 'FAIL',
    detail: `Shared stroke ${family.geometryRules.strokeWidth}px on the 512 canvas.`,
  });
  return { checks, overall: worst(checks) };
}

export function inheritanceBrief(family: VisualFamilySpec, semanticRole: string) {
  return {
    steps: [
      'SELECT_FAMILY',
      'SELECT_SEMANTIC_ROLE',
      'INHERIT_FAMILY_RULES',
      'IDENTIFY_CLOSEST_CANONICAL_EXAMPLES',
      'FABRICATE',
      'RUN_FAMILY_FIDELITY_QA',
      'FOUNDER_REVIEW',
      'CANONICAL_ONLY_AFTER_APPROVAL',
    ],
    familyId: family.familyId,
    version: family.version,
    semanticRole,
    geometryRules: family.geometryRules,
    closestExamples: family.canonicalExamples,
    antiExamples: family.antiExamples,
    canonStatusOnCreate: 'DRAFT' as const,
  };
}
