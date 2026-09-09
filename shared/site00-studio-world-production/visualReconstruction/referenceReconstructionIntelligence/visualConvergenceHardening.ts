/**
 * Layer 4 — Visual Convergence Engine hardening (correction orchestrator).
 */

import { evaluateVisualImplementationDelta } from '../p0vr6/visualImplementationNoOpGuard.js';
import type {
  ConvergenceIterationRecord,
  DriftClassification,
  RegionVisualDelta,
  VisualCorrectionPlan,
} from './types.js';

export const CORRECTION_PRIORITY_ORDER = [
  'VIEWPORT_CANVAS',
  'ROOT_SHELL',
  'PARENT_GEOMETRY',
  'GRID_FLEX_STRUCTURE',
  'SPACING',
  'TYPOGRAPHY',
  'CONTROLS',
  'ICONS',
  'SURFACES',
  'MICRO_DETAIL',
] as const;

export function classifyRegionDriftSeverity(maxAbsDelta: number): DriftClassification {
  if (maxAbsDelta > 16) return 'MAJOR';
  if (maxAbsDelta > 4) return 'MINOR';
  return 'MICRO';
}

export function buildRegionVisualDelta(input: {
  regionId: string;
  referenceBounds: { x: number; y: number; width: number; height: number };
  liveBounds: { x: number; y: number; width: number; height: number };
}): RegionVisualDelta {
  const xDelta = input.liveBounds.x - input.referenceBounds.x;
  const yDelta = input.liveBounds.y - input.referenceBounds.y;
  const widthDelta = input.liveBounds.width - input.referenceBounds.width;
  const heightDelta = input.liveBounds.height - input.referenceBounds.height;
  const max = Math.max(Math.abs(xDelta), Math.abs(yDelta), Math.abs(widthDelta), Math.abs(heightDelta));
  return {
    regionId: input.regionId,
    xDelta,
    yDelta,
    widthDelta,
    heightDelta,
    surfaceDelta: false,
    typographyDelta: false,
    alignmentDelta: Math.abs(xDelta) > 2 || Math.abs(yDelta) > 2,
    severity: classifyRegionDriftSeverity(max),
    probableCause: resolveProbableCause({ xDelta, yDelta, widthDelta, heightDelta }),
  };
}

export function resolveProbableCause(deltas: {
  xDelta: number;
  yDelta: number;
  widthDelta: number;
  heightDelta: number;
}): string | null {
  const regions = [
    { check: Math.abs(deltas.xDelta) > 8, cause: 'PARENT_PADDING_WRONG' },
    { check: Math.abs(deltas.heightDelta) > 8, cause: 'GLOBAL_COMPONENT_MIN_HEIGHT' },
    { check: Math.abs(deltas.widthDelta) > 8, cause: 'INTRINSIC_SIZE_OR_MAX_WIDTH' },
  ];
  return regions.find((r) => r.check)?.cause ?? null;
}

export function detectCumulativeLayoutDrift(deltas: RegionVisualDelta[]): {
  detected: boolean;
  totalHeightDrift: number;
  probableCause: string | null;
} {
  const repeatedHeight = deltas.filter((d) => Math.abs(d.heightDelta) >= 4);
  if (repeatedHeight.length >= 4) {
    const avg = repeatedHeight.reduce((s, d) => s + d.heightDelta, 0) / repeatedHeight.length;
    if (Math.abs(avg) >= 3) {
      return {
        detected: true,
        totalHeightDrift: repeatedHeight.reduce((s, d) => s + d.heightDelta, 0),
        probableCause: 'REPEATED_PARENT_SPACING_ERROR',
      };
    }
  }
  return { detected: false, totalHeightDrift: 0, probableCause: null };
}

export function buildVisualCorrectionPlan(input: {
  iteration: number;
  deltas: RegionVisualDelta[];
  preferRootCause?: boolean;
}): VisualCorrectionPlan {
  const major = input.deltas.filter((d) => d.severity === 'MAJOR');
  const rootCauses = [...new Set(major.map((d) => d.probableCause).filter(Boolean))] as string[];
  const targetRegions = major.map((d) => d.regionId);

  return {
    iteration: input.iteration,
    targetRegions,
    rootCauses,
    files: ['src/site00/styles/site00-design-skins-tab.css'],
    selectors: targetRegions.map((id) => `[data-rri-region="${id}"]`),
    components: targetRegions.map((id) => `Region:${id}`),
    proposedChanges: rootCauses.length
      ? [`Fix root cause: ${rootCauses[0]}`]
      : ['Apply region-scoped spacing correction'],
    expectedImpact: input.preferRootCause ? 'One parent fix over multiple child patches' : 'Localized region fix',
    riskToOtherScreens: rootCauses.includes('GLOBAL_COMPONENT_MIN_HEIGHT') ? 'HIGH' : 'LOW',
  };
}

export function recordConvergenceIteration(input: {
  iteration: number;
  beforeCaptureId: string | null;
  afterCaptureId: string | null;
  deltas: RegionVisualDelta[];
  plan: VisualCorrectionPlan;
  filesChanged: string[];
}): ConvergenceIterationRecord {
  const majorBefore = input.deltas.filter((d) => d.severity === 'MAJOR').length;
  const improvementScore = Math.max(0, 100 - majorBefore * 15);
  return {
    iteration: input.iteration,
    beforeCaptureId: input.beforeCaptureId,
    deltaSummary: `${input.deltas.length} regions, ${majorBefore} major`,
    correctionPlanId: `plan-${input.iteration}`,
    filesChanged: input.filesChanged,
    afterCaptureId: input.afterCaptureId,
    improvementScore,
    regressions: [],
  };
}

export function evaluateNoOpGuard(beforeRatio: number, afterRatio: number): ReturnType<typeof evaluateVisualImplementationDelta> {
  return evaluateVisualImplementationDelta({
    before: { label: 'before', deltaRatio: beforeRatio },
    after: { label: 'after', deltaRatio: afterRatio },
  });
}
