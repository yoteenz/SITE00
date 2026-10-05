import type { MobileBlueprintTwinVisual, MobileImplementationRender, MobileTwinPipelineState } from './types.js';

function isImplementationRender(row: Record<string, unknown>): row is MobileImplementationRender {
  return typeof row.id === 'string' && typeof row.renderImageUri === 'string' && row.renderImageUri.length > 0;
}

function isBlueprintTwin(row: Record<string, unknown>): row is MobileBlueprintTwinVisual {
  return typeof row.id === 'string' && typeof row.twinImageUri === 'string' && row.twinImageUri.length > 0;
}

function unionById<T extends { id: string }>(rows: T[]): T[] {
  const map = new Map<string, T>();
  for (const row of rows) map.set(row.id, row);
  return [...map.values()];
}

/** Restore renders / blueprint twins dropped from arrays but still present in artifactsById (slim LS). */
export function rehydrateMobileTwinVisualArtifactsFromStore(
  pipeline: MobileTwinPipelineState,
): MobileTwinPipelineState {
  let renders = [...pipeline.renders];
  let blueprintTwins = [...pipeline.blueprintTwins];
  const renderIds = new Set(renders.map((r) => r.id));
  const blueprintIds = new Set(blueprintTwins.map((b) => b.id));

  for (const value of Object.values(pipeline.artifactsById ?? {})) {
    if (!value || typeof value !== 'object') continue;
    const row = value as Record<string, unknown>;
    if (isImplementationRender(row) && !renderIds.has(row.id)) {
      renders.push(row);
      renderIds.add(row.id);
      continue;
    }
    if (isBlueprintTwin(row) && !blueprintIds.has(row.id)) {
      blueprintTwins.push(row);
      blueprintIds.add(row.id);
    }
  }

  renders = unionById(renders);
  blueprintTwins = unionById(blueprintTwins);

  let activeRenderId = pipeline.activeRenderId;
  if (!activeRenderId && renders.length) {
    activeRenderId = renders.find((r) => r.status !== 'SUPERSEDED')?.id ?? renders.at(-1)!.id;
  }

  return {
    ...pipeline,
    renders,
    blueprintTwins,
    activeRenderId: activeRenderId ?? pipeline.activeRenderId,
  };
}
