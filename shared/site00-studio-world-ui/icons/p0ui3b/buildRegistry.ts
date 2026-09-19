import type { NDXIconName, NdxIconDefinition } from '../types.js';
import { NDX_ICON_VIEWBOX, NDX_ICON_STROKE_DEFAULT } from '../tokens.js';
import {
  NDX_ICON_GEOMETRY_V2,
  buildPixelTracedSpec,
} from './geometry/ndxIconGeometryV2PixelTraced.js';
import type { PixelTracedIconSpec } from './types.js';

export type NdxIconRegistryEntryV2 = {
  definition: NdxIconDefinition;
  trace: PixelTracedIconSpec;
};

function sampleIds(): Record<NDXIconName, string> {
  const ids = {} as Record<NDXIconName, string>;
  for (const name of Object.keys(NDX_ICON_GEOMETRY_V2) as NDXIconName[]) {
    ids[name] = `ndxbook-mobile-overview-menu-open:${name}`;
  }
  return ids;
}

const SAMPLE_IDS = sampleIds();

function toDefinition(name: NDXIconName, trace: PixelTracedIconSpec): NdxIconDefinition {
  const hostCanonical =
    name === 'projects' || name === 'origin' || name === 'back_to_projects' || name === 'return_to_origin';
  return {
    name,
    paths: trace.pathData.map((d) => ({ d })),
    circles: trace.circleData?.map((c) => ({ ...c })),
    hostCanonical: hostCanonical || undefined,
    visualVersion: trace.visualVersion,
    traceClassification: 'PIXEL_TRACED' as NdxIconDefinition['traceClassification'],
    visualMatchStatus: trace.visualMatchStatus,
    referenceSampleId: trace.referenceSampleId,
    strokeWidth: trace.strokeWidth,
    optical: {
      opticalScale: NDX_ICON_GEOMETRY_V2[name].opticalScale ?? 1,
      opticalOffsetX: NDX_ICON_GEOMETRY_V2[name].opticalOffsetX ?? 0,
      opticalOffsetY: NDX_ICON_GEOMETRY_V2[name].opticalOffsetY ?? 0,
      bounds: trace.opticalBounds,
    },
    activeBehavior: 'color-only',
    supersededGeometryId: trace.supersededGeometryId,
  };
}

export function getPixelTracedRegistryEntry(name: NDXIconName): NdxIconRegistryEntryV2 {
  const raw = NDX_ICON_GEOMETRY_V2[name];
  const sampleId = SAMPLE_IDS[name] ?? `${name}-untracked`;
  const trace = buildPixelTracedSpec(name, sampleId, raw);
  return {
    definition: toDefinition(name, trace),
    trace,
  };
}

export function buildPixelTracedIconRegistry(): Record<NDXIconName, NdxIconDefinition> {
  const registry = {} as Record<NDXIconName, NdxIconDefinition>;
  for (const name of Object.keys(NDX_ICON_GEOMETRY_V2) as NDXIconName[]) {
    registry[name] = getPixelTracedRegistryEntry(name).definition;
  }
  return registry;
}

export { NDX_ICON_VIEWBOX, NDX_ICON_STROKE_DEFAULT };
