/**
 * P0.VR.1D.4 — Reference ↔ DOM delta with canonical region identity.
 */

import { randomUUID } from 'node:crypto';
import type { PixelGeometryContract } from '../p0vr1d/types.js';
import type { RenderedDomMeasurementMap } from '../p0vr1d1/types.js';
import type { MappedDomDeltaEntry, MappedReferenceDomDelta, ReferenceDomRegionMap } from './types.js';
import { buildReferenceDomRegionMap, resolveDomMeasurementForCanonicalRegion } from './referenceDomRegionMap.js';
import { normalizeReferenceRegionId } from './normalizeReferenceRegionId.js';

export function buildMappedReferenceDomDelta(input: {
  screenId: string;
  route: string;
  geometryContract: PixelGeometryContract;
  domMeasurement: RenderedDomMeasurementMap;
  tolerancePx?: number;
  regionMap?: ReferenceDomRegionMap;
}): MappedReferenceDomDelta {
  const tolerance = input.tolerancePx ?? 3;
  const referenceRegionIds = input.geometryContract.entries.map((e) => e.regionId);
  const domRegionIds = input.domMeasurement.measurements.map((m) => m.regionId);

  const regionMap =
    input.regionMap ??
    buildReferenceDomRegionMap({
      screenId: input.screenId,
      route: input.route,
      referenceRegionIds,
      domRegionIds,
    });

  const mappedCanonical = new Set(regionMap.entries.map((e) => e.canonicalRegionId));
  const entries: MappedDomDeltaEntry[] = [];
  const matchedCanonical = new Set<string>();

  for (const geometry of input.geometryContract.entries) {
    const { canonicalRegionId } = normalizeReferenceRegionId({
      referenceRegionId: geometry.regionId,
      screenId: input.screenId,
    });
    if (!mappedCanonical.has(canonicalRegionId)) continue;

    const measured = resolveDomMeasurementForCanonicalRegion(
      canonicalRegionId,
      input.domMeasurement.measurements,
      regionMap,
    );
    if (!measured) continue;

    matchedCanonical.add(canonicalRegionId);
    const mapping = regionMap.entries.find((e) => e.canonicalRegionId === canonicalRegionId);

    pushMapped(entries, {
      canonicalRegionId,
      geometry,
      measured,
      property: 'x',
      referenceValue: geometry.referenceX,
      renderedValue: measured.actualX,
      tolerance,
      driftKind: 'POSITION',
      domSelector: mapping?.domSelector ?? null,
      mappingSource: mapping?.mappingSource ?? 'INFERRED',
    });
    pushMapped(entries, {
      canonicalRegionId,
      geometry,
      measured,
      property: 'y',
      referenceValue: geometry.referenceY,
      renderedValue: measured.actualY,
      tolerance,
      driftKind: 'POSITION',
      domSelector: mapping?.domSelector ?? null,
      mappingSource: mapping?.mappingSource ?? 'INFERRED',
    });
    pushMapped(entries, {
      canonicalRegionId,
      geometry,
      measured,
      property: 'width',
      referenceValue: geometry.referenceWidth,
      renderedValue: measured.actualWidth,
      tolerance,
      driftKind: 'SIZE',
      domSelector: mapping?.domSelector ?? null,
      mappingSource: mapping?.mappingSource ?? 'INFERRED',
    });
    pushMapped(entries, {
      canonicalRegionId,
      geometry,
      measured,
      property: 'height',
      referenceValue: geometry.referenceHeight,
      renderedValue: measured.actualHeight,
      tolerance,
      driftKind: 'SIZE',
      domSelector: mapping?.domSelector ?? null,
      mappingSource: mapping?.mappingSource ?? 'INFERRED',
    });
  }

  const unmappedReferenceRegions = referenceRegionIds.filter((id: string) => {
    const { canonicalRegionId } = normalizeReferenceRegionId({ referenceRegionId: id, screenId: input.screenId });
    return !matchedCanonical.has(canonicalRegionId);
  });

  const unmappedDomRegions = domRegionIds.filter((id) => {
    const { canonicalRegionId } = normalizeReferenceRegionId({ referenceRegionId: id, screenId: input.screenId });
    return !matchedCanonical.has(canonicalRegionId);
  });

  const driftingEntries = entries.filter((e) => e.delta !== 0);
  const statusByRegion = new Map<string, 'MATCHED' | 'DRIFTING'>();
  for (const entry of entries) {
    const prev = statusByRegion.get(entry.canonicalRegionId);
    if (entry.delta !== 0) {
      statusByRegion.set(entry.canonicalRegionId, 'DRIFTING');
    } else if (prev !== 'DRIFTING') {
      statusByRegion.set(entry.canonicalRegionId, 'MATCHED');
    }
  }
  for (const entry of entries) {
    entry.status = statusByRegion.get(entry.canonicalRegionId) ?? 'MATCHED';
  }

  return {
    deltaId: randomUUID(),
    screenId: input.screenId,
    entries: driftingEntries,
    mappedRegionCount: matchedCanonical.size,
    unmappedReferenceRegions,
    unmappedDomRegions,
  };
}

function pushMapped(
  entries: MappedDomDeltaEntry[],
  input: {
    canonicalRegionId: string;
    geometry: PixelGeometryContract['entries'][number];
    measured: { actualX: number; actualY: number; actualWidth: number; actualHeight: number };
    property: string;
    referenceValue: number;
    renderedValue: number;
    tolerance: number;
    driftKind: MappedDomDeltaEntry['driftKind'];
    domSelector: string | null;
    mappingSource: MappedDomDeltaEntry['mappingSource'];
  },
): void {
  const delta = input.renderedValue - input.referenceValue;
  entries.push({
    regionId: input.canonicalRegionId,
    canonicalRegionId: input.canonicalRegionId,
    property: input.property,
    referenceValue: input.referenceValue,
    renderedValue: input.renderedValue,
    delta,
    driftKind: input.driftKind,
    domSelector: input.domSelector,
    mappingSource: input.mappingSource,
    status: Math.abs(delta) <= input.tolerance ? 'MATCHED' : 'DRIFTING',
  });
}

export function mappedReferenceDomDeltaNonempty(delta: MappedReferenceDomDelta): boolean {
  return delta.mappedRegionCount > 0;
}

export function largestMappedDelta(delta: MappedReferenceDomDelta): number {
  if (delta.entries.length === 0) return 0;
  return Math.max(...delta.entries.map((e) => Math.abs(Number(e.delta))));
}
