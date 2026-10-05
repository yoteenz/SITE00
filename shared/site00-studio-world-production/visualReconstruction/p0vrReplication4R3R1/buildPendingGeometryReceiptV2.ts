import type { HeroGeometryDeltaFull } from '../p0vrReplication4R3/types.js';
import type { HeroGeometryReceiptV2, HeroMeasurementSource, HeroRenderedCaptureReceipt } from './types.js';

export function buildGeometryReceiptV2FromLive(input: {
  deltas: HeroGeometryDeltaFull[];
  captureReceipt: HeroRenderedCaptureReceipt;
  measurementSource: HeroMeasurementSource;
}): HeroGeometryReceiptV2 {
  const measured = input.deltas;
  const within = measured.filter((d) => d.status === 'WITHIN_TOLERANCE');
  const outliers = measured.filter((d) => d.status === 'OUT_OF_TOLERANCE');
  const posErrors = measured.map((d) => Math.max(Math.abs(d.deltaX), Math.abs(d.deltaY)));
  const sizeErrors = measured.map((d) => Math.max(Math.abs(d.deltaWidth), Math.abs(d.deltaHeight)));

  let status: HeroGeometryReceiptV2['status'] = 'FAIL';
  if (
    input.captureReceipt.foundCount === 14 &&
    measured.length === 14 &&
    outliers.length === 0 &&
    (input.measurementSource === 'LIVE_BROWSER_DOM' || input.measurementSource === 'PLAYWRIGHT_DOM')
  ) {
    status = 'PASS';
  } else if (input.captureReceipt.foundCount === 14 && measured.length === 14) {
    status = 'PARTIAL';
  }

  return {
    authorityCount: 14,
    renderedCount: input.captureReceipt.foundCount,
    measuredCount: measured.length,
    withinToleranceCount: within.length,
    outlierCount: outliers.length,
    maxPositionError: posErrors.length ? Math.max(...posErrors) : 0,
    maxSizeError: sizeErrors.length ? Math.max(...sizeErrors) : 0,
    measurementSource: input.measurementSource,
    status,
  };
}
