import { PLACEHOLDER_SCENE_GRAPH_GENERATION_ATTEMPTED, V40_SCENE_GRAPH_REJECTION_REASON } from '../p0vrTwinV41/constants.js';
import type { TwinV4VisualSceneGraph, TwinV4TextObjectMap } from './twinV4Types.js';

/** V4.0 placeholder graph — rejected in V4.1 (history only). */
export const TWIN_V40_SCENE_GRAPH_STATUS = 'REJECTED' as const;
export const TWIN_V40_SCENE_GRAPH_REJECTION = V40_SCENE_GRAPH_REJECTION_REASON;

/** @deprecated V4.0 rejected — use Twin V4.1 pixel-derived extraction. */
export function extractTwinV4VisualSceneGraph(_input: { forensicBlueprintHash: string }): TwinV4VisualSceneGraph {
  throw new Error(PLACEHOLDER_SCENE_GRAPH_GENERATION_ATTEMPTED);
}

export function buildTwinV4TextObjectMap(_sceneGraph: TwinV4VisualSceneGraph): TwinV4TextObjectMap {
  throw new Error(PLACEHOLDER_SCENE_GRAPH_GENERATION_ATTEMPTED);
}
