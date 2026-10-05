import type { ConceptDirectedTwinSession } from '../p0vrTwinV21/types.js';

const SILENT_FALLBACK_MARKERS = [
  'ConceptDirectedPackageTwinV2',
  'ConceptDirectedNdxOverviewTwinV2',
  'authority-ghost',
  'PACKAGE_DRIVEN_SOURCE_GENERATION',
  'SEMANTIC_BLUEPRINT_RENDERER',
];

export function assertFailureClosedNoSilentFallback(session: ConceptDirectedTwinSession): void {
  const mode = session.renderedTwin?.buildMode;
  if (mode === 'PACKAGE_DRIVEN_SOURCE_GENERATION') {
    throw new Error('SILENT_FALLBACK_ATTEMPTED: legacy package build mode blocked');
  }
  const component = session.renderedTwin?.componentRef;
  if (component && SILENT_FALLBACK_MARKERS.includes(component)) {
    throw new Error(`SILENT_FALLBACK_ATTEMPTED: ${component}`);
  }
}

export function assertStableObjectIds(upstream: string[], downstream: string[]): void {
  for (const id of upstream) {
    if (!downstream.includes(id)) {
      throw new Error(`OBJECT_LINEAGE_BROKEN: missing ${id}`);
    }
  }
}
