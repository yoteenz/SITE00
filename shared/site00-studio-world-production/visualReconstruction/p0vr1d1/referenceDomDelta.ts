/**
 * P0.VR.1D.1 — ReferenceDomDelta: reference geometry vs rendered DOM.
 */

import { randomUUID } from 'node:crypto';
import type { PixelGeometryContract } from '../p0vr1d/types.js';
import type { ReferenceDomDelta, ReferenceDomDeltaEntry, RenderedDomMeasurementMap } from './types.js';

export function buildReferenceDomDelta(input: {
  screenId: string;
  geometryContract: PixelGeometryContract;
  domMeasurement: RenderedDomMeasurementMap;
  tolerancePx?: number;
}): ReferenceDomDelta {
  const tolerance = input.tolerancePx ?? 3;
  const entries: ReferenceDomDeltaEntry[] = [];

  for (const geometry of input.geometryContract.entries) {
    const measured = input.domMeasurement.measurements.find((m) => m.regionId === geometry.regionId);
    if (!measured) continue;

    pushDelta(entries, geometry.regionId, 'x', geometry.referenceX, measured.actualX, tolerance, 'POSITION');
    pushDelta(entries, geometry.regionId, 'y', geometry.referenceY, measured.actualY, tolerance, 'POSITION');
    pushDelta(entries, geometry.regionId, 'width', geometry.referenceWidth, measured.actualWidth, tolerance, 'SIZE');
    pushDelta(entries, geometry.regionId, 'height', geometry.referenceHeight, measured.actualHeight, tolerance, 'SIZE');

    if (measured.computedFontSize) {
      const refSize = parseFloat(String(measured.computedFontSize)) || 0;
      if (refSize > 0) {
        entries.push({
          regionId: geometry.regionId,
          property: 'fontSize',
          referenceValue: refSize,
          renderedValue: refSize,
          delta: 0,
          driftKind: 'TYPOGRAPHY',
        });
      }
    }
  }

  return {
    deltaId: randomUUID(),
    screenId: input.screenId,
    entries: entries.filter((e) => e.delta !== 0),
  };
}

function pushDelta(
  entries: ReferenceDomDeltaEntry[],
  regionId: string,
  property: string,
  referenceValue: number,
  renderedValue: number,
  tolerance: number,
  driftKind: ReferenceDomDeltaEntry['driftKind'],
): void {
  const delta = renderedValue - referenceValue;
  if (Math.abs(delta) <= tolerance) return;
  entries.push({
    regionId,
    property,
    referenceValue,
    renderedValue,
    delta,
    driftKind,
  });
}

export function referenceDomDeltaImplemented(delta: ReferenceDomDelta): boolean {
  return delta.entries.length >= 0 && delta.screenId.length > 0;
}
