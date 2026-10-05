import type { NDXIconName, NdxIconDefinition } from '../types.js';
import { NDX_ICON_VIEWBOX, NDX_ICON_STROKE_DEFAULT } from '../tokens.js';
import {
  NDX_ICON_GEOMETRY_V1,
  buildReferenceTracedSpec,
} from './geometry/ndxIconGeometryV1ReferenceTraced.js';
import { referenceSampleIdsByIcon } from './referenceSamples.js';
import type { ReferenceTracedIconSpec } from './types.js';

export type NdxIconRegistryEntry = {
  definition: NdxIconDefinition;
  trace: ReferenceTracedIconSpec;
};

const SAMPLE_IDS = referenceSampleIdsByIcon();

function toDefinition(name: NDXIconName, trace: ReferenceTracedIconSpec): NdxIconDefinition {
  const raw = NDX_ICON_GEOMETRY_V1[name];
  const hostCanonical = name === 'projects' || name === 'origin' || name === 'back_to_projects' || name === 'return_to_origin';
  return {
    name,
    paths: trace.pathData.map((d) => ({ d })),
    circles: raw.circles?.map((c) => ({ ...c })),
    hostCanonical: hostCanonical || undefined,
    visualVersion: trace.visualVersion,
    traceClassification: trace.classification,
    visualMatchStatus: trace.visualMatchStatus,
    referenceSampleId: trace.referenceSampleId,
    strokeWidth: trace.strokeWidth,
    optical: trace.optical,
    activeBehavior: trace.activeBehavior,
    supersededGeometryId: trace.supersededGeometryId,
  };
}

export function getReferenceTracedRegistryEntry(name: NDXIconName): NdxIconRegistryEntry {
  const raw = NDX_ICON_GEOMETRY_V1[name];
  const sampleId = SAMPLE_IDS[name] ?? `${name}-untracked`;
  const trace = buildReferenceTracedSpec(name, sampleId, raw);
  return {
    definition: toDefinition(name, trace),
    trace,
  };
}

export function buildReferenceTracedIconRegistry(): Record<NDXIconName, NdxIconDefinition> {
  const registry = {} as Record<NDXIconName, NdxIconDefinition>;
  for (const name of Object.keys(NDX_ICON_GEOMETRY_V1) as NDXIconName[]) {
    registry[name] = getReferenceTracedRegistryEntry(name).definition;
  }
  return registry;
}

export const NDX_ICON_GEOMETRY = NDX_ICON_GEOMETRY_V1;

export { NDX_ICON_VIEWBOX, NDX_ICON_STROKE_DEFAULT };
