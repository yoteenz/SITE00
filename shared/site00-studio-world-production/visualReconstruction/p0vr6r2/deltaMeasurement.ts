/**
 * P0.VR.6R2 — Region delta measurement + drift classification.
 */

import type {
  DriftSeverity,
  ReferenceVisualRegion,
  VisualDeltaMeasurement,
  VisualDriftType,
} from './types.js';

function measurementId(): string {
  return `delta-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function classifyDriftSeverity(maxAbsDelta: number): DriftSeverity {
  if (maxAbsDelta > 24) return 'BLOCKER';
  if (maxAbsDelta > 16) return 'MAJOR';
  if (maxAbsDelta > 8) return 'MODERATE';
  if (maxAbsDelta > 2) return 'MINOR';
  return 'ACCEPTABLE_VARIANCE';
}

export function classifyVisualDrift(input: {
  region: ReferenceVisualRegion;
  deltaX: number | null;
  deltaY: number | null;
  deltaWidth: number | null;
  deltaHeight: number | null;
  assetScaleDelta?: number | null;
}): { driftType: VisualDriftType; severity: DriftSeverity } {
  const abs = [
    Math.abs(input.deltaX ?? 0),
    Math.abs(input.deltaY ?? 0),
    Math.abs(input.deltaWidth ?? 0),
    Math.abs(input.deltaHeight ?? 0),
  ];
  const max = Math.max(...abs, Math.abs(input.assetScaleDelta ?? 0) * 100);

  let driftType: VisualDriftType = 'COMPONENT_POSITION_DRIFT';
  if (input.region.semanticRole === 'SHELL') driftType = 'SHELL_DRIFT';
  else if (Math.abs(input.deltaWidth ?? 0) > Math.abs(input.deltaY ?? 0)) driftType = 'COMPONENT_SIZE_DRIFT';
  else if (input.assetScaleDelta != null && Math.abs(input.assetScaleDelta) > 0.05) driftType = 'ASSET_SCALE_DRIFT';
  else if (input.region.expectedAssetSlot) driftType = 'ASSET_POSITION_DRIFT';

  return { driftType, severity: classifyDriftSeverity(max) };
}

export function measureReferenceDelta(input: {
  region: ReferenceVisualRegion;
  referenceBounds: { x: number; y: number; width: number; height: number };
  liveBounds: { x: number; y: number; width: number; height: number };
  liveGeometryHints?: Partial<{
    typographyDelta: number;
    spacingDelta: number;
    colorRole: string;
    assetScaleDelta: number;
  }>;
}): VisualDeltaMeasurement {
  const { region, referenceBounds, liveBounds } = input;
  const deltaX = liveBounds.x - referenceBounds.x;
  const deltaY = liveBounds.y - referenceBounds.y;
  const deltaWidth = liveBounds.width - referenceBounds.width;
  const deltaHeight = liveBounds.height - referenceBounds.height;
  const { driftType, severity } = classifyVisualDrift({
    region,
    deltaX,
    deltaY,
    deltaWidth,
    deltaHeight,
    assetScaleDelta: input.liveGeometryHints?.assetScaleDelta ?? null,
  });

  const parts: string[] = [];
  if (deltaX) parts.push(`Δx ${deltaX}px`);
  if (deltaY) parts.push(`Δy ${deltaY}px`);
  if (deltaWidth) parts.push(`Δw ${deltaWidth}px`);
  if (deltaHeight) parts.push(`Δh ${deltaHeight}px`);

  return {
    measurementId: measurementId(),
    regionId: region.regionId,
    componentId: region.semanticRole,
    deltaX,
    deltaY,
    deltaWidth,
    deltaHeight,
    deltaFontSize: input.liveGeometryHints?.typographyDelta ?? null,
    deltaLineHeight: null,
    deltaSpacing: input.liveGeometryHints?.spacingDelta ?? null,
    deltaColor: input.liveGeometryHints?.colorRole ?? null,
    deltaRadius: null,
    deltaBorderWidth: null,
    assetScaleDelta: input.liveGeometryHints?.assetScaleDelta ?? null,
    driftType,
    severity,
    confidence: 0.85,
    masked: false,
    description: parts.length ? parts.join(', ') : 'Within tolerance',
  };
}

export function measureRegionDeltas(input: {
  regions: ReferenceVisualRegion[];
  liveGeometryHints?: Partial<{
    headerTooTall: number;
    stepperClipped: boolean;
    stepperTooWide: number;
    cardTooTallRatio: number;
    displaySizeRatio: number;
  }>;
}): VisualDeltaMeasurement[] {
  const deltas: VisualDeltaMeasurement[] = [];
  const hints = input.liveGeometryHints ?? {};

  for (const region of input.regions) {
    if (region.semanticRole === 'SHELL') continue;

    let liveBounds = { ...region, x: region.x, y: region.y, width: region.width, height: region.height };

    if (region.semanticRole === 'STEPPER' && hints.stepperTooWide) {
      liveBounds = { ...liveBounds, width: region.width + hints.stepperTooWide };
    }
    if (region.semanticRole === 'HEADER' && hints.headerTooTall) {
      liveBounds = { ...liveBounds, height: region.height + hints.headerTooTall };
    }
    if (region.semanticRole === 'PRIMARY_CONTENT' && hints.cardTooTallRatio && hints.cardTooTallRatio > 1.02) {
      liveBounds = { ...liveBounds, height: Math.round(region.height * hints.cardTooTallRatio) };
    }

    const refBounds = { x: region.x, y: region.y, width: region.width, height: region.height };
    const delta = measureReferenceDelta({
      region,
      referenceBounds: refBounds,
      liveBounds,
      liveGeometryHints:
        region.semanticRole === 'HERO' && hints.displaySizeRatio
          ? { assetScaleDelta: hints.displaySizeRatio - 1 }
          : undefined,
    });

    if (
      delta.severity !== 'ACCEPTABLE_VARIANCE' ||
      hints.stepperClipped && region.semanticRole === 'STEPPER'
    ) {
      if (hints.stepperClipped && region.semanticRole === 'STEPPER') {
        deltas.push({
          ...delta,
          driftType: 'HORIZONTAL_OVERFLOW',
          severity: 'MAJOR',
          description: 'Stepper clipped / overflow',
        });
      } else if (delta.severity !== 'ACCEPTABLE_VARIANCE') {
        deltas.push(delta);
      }
    }
  }

  return deltas;
}

export function countDriftBySeverity(deltas: VisualDeltaMeasurement[]): {
  blocker: number;
  major: number;
  moderate: number;
  minor: number;
} {
  return {
    blocker: deltas.filter((d) => !d.masked && d.severity === 'BLOCKER').length,
    major: deltas.filter((d) => !d.masked && d.severity === 'MAJOR').length,
    moderate: deltas.filter((d) => !d.masked && d.severity === 'MODERATE').length,
    minor: deltas.filter((d) => !d.masked && d.severity === 'MINOR').length,
  };
}

export function exactModeCanVerify(deltas: VisualDeltaMeasurement[]): boolean {
  const counts = countDriftBySeverity(deltas);
  return counts.blocker === 0 && counts.major === 0;
}
