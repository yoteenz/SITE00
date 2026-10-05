/**
 * P0.VR.REPLICATION.1 — VisualGraph derived from VisualPageBlueprint.
 */

import type { VisualGraph, VisualPageBlueprint } from './types.js';

export function buildVisualGraph(blueprint: VisualPageBlueprint): VisualGraph {
  const regionOrder = blueprint.relationships.length
    ? [...blueprint.regions].sort((a, b) => a.order - b.order).map((r) => r.regionId)
    : blueprint.regions.map((r) => r.regionId);

  const dominant =
    blueprint.regions.find((r) => r.hierarchyLevel >= 10)?.regionId ??
    blueprint.regions[0]?.regionId ??
    null;

  return {
    graphId: `vg_${blueprint.blueprintId}`,
    blueprintId: blueprint.blueprintId,
    regionOrder,
    dominantRegionId: dominant,
    persistentControlIds: blueprint.persistentControls,
  };
}
