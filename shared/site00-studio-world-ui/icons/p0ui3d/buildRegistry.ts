import type { NDXIconName, NdxIconDefinition } from '../types.js';
import { NDX_ICON_VIEWBOX, NDX_ICON_STROKE_DEFAULT } from '../tokens.js';
import { NDX_ICON_GEOMETRY_V2 } from '../p0ui3b/geometry/ndxIconGeometryV2PixelTraced.js';
import { buildPixelTracedSpec } from '../p0ui3b/geometry/ndxIconGeometryV2PixelTraced.js';
import {
  NDX_ICON_REFERENCE_SHEET_SOURCE_ID,
  NDX_ICON_VISUAL_CANON_V3,
  P0_UI_3D_TARGET_ICONS,
} from './constants.js';
import {
  NDX_ICON_GEOMETRY_V3,
  buildReferenceLockedSpec,
  type RawReferenceLockedTrace,
} from './geometry/ndxIconGeometryV3ReferenceLocked.js';
import type { ReferenceLockedIconSpec, SupersededIconGeometryRecord } from './types.js';

export type NdxIconRegistryEntryV3 = {
  definition: NdxIconDefinition;
  trace: ReferenceLockedIconSpec;
};

function sampleId(name: NDXIconName): string {
  return `${NDX_ICON_REFERENCE_SHEET_SOURCE_ID}:${name}`;
}

function toDefinition(name: NDXIconName, trace: ReferenceLockedIconSpec): NdxIconDefinition {
  const hostCanonical =
    name === 'projects' || name === 'origin' || name === 'back_to_projects' || name === 'return_to_origin';
  return {
    name,
    paths: trace.pathData.map((d) => ({ d })),
    circles: trace.circleData?.map((c) => ({ ...c })),
    hostCanonical: hostCanonical || undefined,
    visualVersion: trace.visualVersion,
    traceClassification: 'REFERENCE_LOCKED',
    visualMatchStatus: trace.visualMatchStatus,
    referenceSampleId: trace.referenceSampleId,
    strokeWidth: trace.strokeWidth,
    optical: {
      opticalScale: NDX_ICON_GEOMETRY_V3[name].opticalScale ?? 1,
      opticalOffsetX: NDX_ICON_GEOMETRY_V3[name].opticalOffsetX ?? 0,
      opticalOffsetY: NDX_ICON_GEOMETRY_V3[name].opticalOffsetY ?? 0,
      bounds: trace.opticalBounds,
    },
    activeBehavior: 'color-only',
    supersededGeometryId: trace.supersededGeometryId,
  };
}

function buildV2FallbackDefinition(name: NDXIconName): NdxIconDefinition {
  const raw = NDX_ICON_GEOMETRY_V2[name];
  const trace = buildPixelTracedSpec(name, `${name}-v2-fallback`, raw);
  return {
    name,
    paths: trace.pathData.map((d) => ({ d })),
    circles: trace.circleData?.map((c) => ({ ...c })),
    visualVersion: trace.visualVersion,
    traceClassification: 'PIXEL_TRACED',
    visualMatchStatus: trace.visualMatchStatus,
    referenceSampleId: trace.referenceSampleId,
    strokeWidth: trace.strokeWidth,
    optical: {
      opticalScale: raw.opticalScale ?? 1,
      opticalOffsetX: raw.opticalOffsetX ?? 0,
      opticalOffsetY: raw.opticalOffsetY ?? 0,
      bounds: trace.opticalBounds,
    },
    activeBehavior: 'color-only',
    supersededGeometryId: trace.supersededGeometryId,
  };
}

export function getReferenceLockedRegistryEntry(name: NDXIconName): NdxIconRegistryEntryV3 {
  const raw = NDX_ICON_GEOMETRY_V3[name] as RawReferenceLockedTrace;
  const trace = buildReferenceLockedSpec(name, sampleId(name), raw);
  return { definition: toDefinition(name, trace), trace };
}

export function buildSupersededGeometryRecords(): SupersededIconGeometryRecord[] {
  return P0_UI_3D_TARGET_ICONS.map((name) => {
    const previous = NDX_ICON_GEOMETRY_V2[name];
    const next = NDX_ICON_GEOMETRY_V3[name];
    return {
      iconName: name,
      previousPath: previous.paths,
      newPath: next.paths,
      referenceSource: NDX_ICON_REFERENCE_SHEET_SOURCE_ID,
      version: NDX_ICON_VISUAL_CANON_V3,
      reason: 'SUPERSEDED_BY_P0_UI_3D_REFERENCE_CANON',
      status: 'SUPERSEDED_BY_P0_UI_3D_REFERENCE_CANON',
    };
  });
}

export function buildReferenceLockedIconRegistry(): Record<NDXIconName, NdxIconDefinition> {
  const registry = {} as Record<NDXIconName, NdxIconDefinition>;
  for (const name of Object.keys(NDX_ICON_GEOMETRY_V3) as NDXIconName[]) {
    if (P0_UI_3D_TARGET_ICONS.includes(name)) {
      registry[name] = getReferenceLockedRegistryEntry(name).definition;
    } else if (NDX_ICON_GEOMETRY_V3[name].referenceIconNumber === 0) {
      registry[name] = buildV2FallbackDefinition(name);
    } else {
      registry[name] = getReferenceLockedRegistryEntry(name).definition;
    }
  }
  return registry;
}

export { NDX_ICON_VIEWBOX, NDX_ICON_STROKE_DEFAULT };
