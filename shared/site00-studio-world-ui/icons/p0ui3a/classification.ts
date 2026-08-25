import type { NDXIconName } from '../types.js';
import { NDX_ICON_GEOMETRY_V1 } from './geometry/ndxIconGeometryV1ReferenceTraced.js';
import { NDX_ICON_FIRST_PASS_TRACED, NDX_ICON_EXTENDED_TRACED } from './constants.js';
import { getReferenceTracedRegistryEntry } from './buildRegistry.js';
import type { NdxIconTraceClassification } from './types.js';

const ALL_ICON_NAMES = Object.keys(NDX_ICON_GEOMETRY_V1) as NDXIconName[];

export function classifyNdxIcon(name: NDXIconName): NdxIconTraceClassification {
  const entry = getReferenceTracedRegistryEntry(name);
  return entry.trace.classification;
}

export function auditNdxIconRegistry(): Record<
  NDXIconName,
  { classification: NdxIconTraceClassification; visualMatchStatus: string }
> {
  const audit = {} as Record<NDXIconName, { classification: NdxIconTraceClassification; visualMatchStatus: string }>;
  for (const name of ALL_ICON_NAMES) {
    const entry = getReferenceTracedRegistryEntry(name);
    audit[name] = {
      classification: entry.trace.classification,
      visualMatchStatus: entry.trace.visualMatchStatus,
    };
  }
  return audit;
}

export function genericSemanticApproximationsRemain(): NDXIconName[] {
  return ALL_ICON_NAMES.filter((name) => classifyNdxIcon(name) === 'GENERIC_SEMANTIC_APPROXIMATION');
}

export function targetSurfacesUseReferenceTraced(): boolean {
  const required = [...NDX_ICON_FIRST_PASS_TRACED, ...NDX_ICON_EXTENDED_TRACED];
  return required.every((name) => classifyNdxIcon(name) === 'REFERENCE_TRACED');
}

export function scanForEmojiGlyphFallbacks(source: string): string[] {
  const hits: string[] = [];
  const patterns = [
    /🔔/,
    /⋯/,
    /···/,
    /⌂/,
    /▤/,
    /☰/,
    /⚗/,
    /○/,
    /fa-/,
    /heroicon/i,
    /lucide/i,
  ];
  for (const pattern of patterns) {
    if (pattern.test(source)) hits.push(String(pattern));
  }
  return hits;
}
