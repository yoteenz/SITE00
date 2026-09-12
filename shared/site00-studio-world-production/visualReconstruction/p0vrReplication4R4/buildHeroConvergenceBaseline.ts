import type { HeroAuthorityGeometryFull, HeroGeometryDeltaFull } from '../p0vrReplication4R3/types.js';
import type { HeroMeasurementSource } from '../p0vrReplication4R3R1/types.js';
import type { HeroObjectId } from '../p0vrReplication4R2/types.js';
import type { HeroConvergenceBaseline } from './types.js';

export function buildHeroConvergenceBaseline(input: {
  twinId: string;
  authorityId: string;
  measurementSource: HeroMeasurementSource;
  authority: HeroAuthorityGeometryFull[];
  deltas: HeroGeometryDeltaFull[];
}): HeroConvergenceBaseline {
  const measured = input.deltas.filter((d) => d.objectId !== 'H07');
  const outliers = measured
    .filter((d) => d.status === 'OUT_OF_TOLERANCE')
    .map((d) => d.objectId as HeroObjectId);
  const passCount = measured.filter((d) => d.status === 'WITHIN_TOLERANCE').length;
  const posErrors = measured.map((d) => Math.max(Math.abs(d.deltaX), Math.abs(d.deltaY)));
  const sizeErrors = measured.map((d) => Math.max(Math.abs(d.deltaWidth), Math.abs(d.deltaHeight)));

  return {
    twinId: input.twinId,
    authorityId: input.authorityId,
    captureTime: new Date().toISOString(),
    measurementSource: input.measurementSource,
    objectCount: 14,
    passCount,
    outlierCount: outliers.length,
    outliers,
    maxPositionError: posErrors.length ? Math.max(...posErrors) : 0,
    maxSizeError: sizeErrors.length ? Math.max(...sizeErrors) : 0,
    meanPositionError: posErrors.length ? posErrors.reduce((a, b) => a + b, 0) / posErrors.length : 0,
    meanSizeError: sizeErrors.length ? sizeErrors.reduce((a, b) => a + b, 0) / sizeErrors.length : 0,
  };
}
