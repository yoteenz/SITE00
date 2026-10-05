import type { HeroGeometryDeltaFull } from '../p0vrReplication4R3/types.js';
import type { HeroObjectId } from '../p0vrReplication4R2/types.js';
import type { HeroMeasurementSource } from '../p0vrReplication4R3R1/types.js';
import type { HeroOutlierSnapshot, HeroOutlierSnapshotEntry } from './types.js';
import { visibleMismatchHint } from './visibleMismatchHint.js';

export function buildHeroOutlierSnapshotEntry(delta: HeroGeometryDeltaFull): HeroOutlierSnapshotEntry | null {
  if (delta.objectId === 'H07' || delta.status === 'WITHIN_TOLERANCE') return null;
  return {
    objectId: delta.objectId as HeroObjectId,
    deltaX: delta.deltaX,
    deltaY: delta.deltaY,
    deltaWidth: delta.deltaWidth,
    deltaHeight: delta.deltaHeight,
    leftError: delta.leftError,
    rightError: delta.rightError,
    topError: delta.topError,
    bottomError: delta.bottomError,
    severity: delta.severity,
    visibleMismatch: visibleMismatchHint(delta.objectId as HeroObjectId, delta),
  };
}

export function buildHeroOutlierSnapshot(input: {
  twinId: string;
  measurementSource: HeroMeasurementSource;
  measuredCount: number;
  renderedCount: number;
  deltas: HeroGeometryDeltaFull[];
}): HeroOutlierSnapshot {
  const outliers = input.deltas
    .map(buildHeroOutlierSnapshotEntry)
    .filter((e): e is HeroOutlierSnapshotEntry => e != null);
  const passCount = input.deltas.filter((d) => d.objectId !== 'H07' && d.status === 'WITHIN_TOLERANCE').length;

  return {
    twinId: input.twinId,
    captureTimestamp: new Date().toISOString(),
    measurementSource: input.measurementSource,
    measuredCount: input.measuredCount,
    renderedCount: input.renderedCount,
    passCount,
    outlierCount: outliers.length,
    outliers,
  };
}
