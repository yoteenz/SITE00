/**
 * P0.VR.1D.4 — Reference ↔ DOM region map builder.
 */

import { randomUUID } from 'node:crypto';
import type { RenderedDomMeasurement } from '../p0vr1d1/types.js';
import type { ReferenceDomRegionMapEntry, ReferenceDomRegionMap } from './types.js';
import { canonicalRegionIdsForScreen, normalizeReferenceRegionId } from './normalizeReferenceRegionId.js';

export function buildReferenceDomRegionMap(input: {
  screenId: string;
  route: string;
  referenceRegionIds: string[];
  domRegionIds: string[];
}): ReferenceDomRegionMap {
  const entries: ReferenceDomRegionMapEntry[] = [];
  const canonicalForScreen = new Set(canonicalRegionIdsForScreen(input.screenId));

  for (const refId of input.referenceRegionIds) {
    const { canonicalRegionId, mappingSource } = normalizeReferenceRegionId({
      referenceRegionId: refId,
      screenId: input.screenId,
    });
    if (!canonicalForScreen.has(canonicalRegionId) && !refId.startsWith('region-')) continue;
    entries.push({
      referenceRegionId: refId,
      canonicalRegionId,
      domSelector: `[data-vr-region="${canonicalRegionId}"]`,
      route: input.route,
      screenId: input.screenId,
      confidence: mappingSource === 'INFERRED' ? 0.55 : 0.92,
      mappingSource,
    });
  }

  for (const domId of input.domRegionIds) {
    const { canonicalRegionId, mappingSource } = normalizeReferenceRegionId({
      referenceRegionId: domId,
      screenId: input.screenId,
    });
    if (entries.some((e) => e.canonicalRegionId === canonicalRegionId)) continue;
    entries.push({
      referenceRegionId: domId,
      canonicalRegionId,
      domSelector: `[data-vr-region="${canonicalRegionId}"]`,
      route: input.route,
      screenId: input.screenId,
      confidence: mappingSource === 'LEGACY_ALIAS' ? 0.88 : 0.75,
      mappingSource,
    });
  }

  return {
    mapId: randomUUID(),
    screenId: input.screenId,
    route: input.route,
    entries,
  };
}

export function resolveDomMeasurementForCanonicalRegion(
  canonicalRegionId: string,
  domMeasurements: RenderedDomMeasurement[],
  regionMap: ReferenceDomRegionMap,
): RenderedDomMeasurement | undefined {
  const direct = domMeasurements.find((m) => m.regionId === canonicalRegionId);
  if (direct) return direct;

  const aliases = regionMap.entries.filter((e) => e.canonicalRegionId === canonicalRegionId);
  for (const alias of aliases) {
    const hit = domMeasurements.find((m) => m.regionId === alias.referenceRegionId);
    if (hit) return hit;
  }

  return domMeasurements.find((m) => {
    const normalized = normalizeReferenceRegionId({ referenceRegionId: m.regionId });
    return normalized.canonicalRegionId === canonicalRegionId;
  });
}
