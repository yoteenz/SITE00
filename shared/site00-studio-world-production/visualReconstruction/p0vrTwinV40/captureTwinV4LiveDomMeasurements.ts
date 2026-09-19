import { TWIN_V4_FORENSIC_CANONICAL_VIEWPORT } from './constants.js';
import type { TwinV4DomMeasurementMap, TwinV4VisualSceneGraph } from './twinV4Types.js';

/** Browser-only: map scene nodes to live getBoundingClientRect ratios vs canonical stage. */
export function captureTwinV4LiveDomMeasurements(input: {
  sceneGraph: TwinV4VisualSceneGraph;
  stageElement: HTMLElement;
}): TwinV4DomMeasurementMap {
  const stageRect = input.stageElement.getBoundingClientRect();
  const { widthPx, heightPx } = TWIN_V4_FORENSIC_CANONICAL_VIEWPORT;
  const measurements = input.sceneGraph.nodes
    .filter((n) => n.sceneNodeId !== 'page-root')
    .map((node) => {
      const el = input.stageElement.querySelector(`[data-scene-node-id="${node.sceneNodeId}"]`);
      if (!el) {
        return {
          sceneNodeId: node.sceneNodeId,
          targetXRatio: node.xRatio,
          targetYRatio: node.yRatio,
          targetWidthRatio: node.widthRatio,
          targetHeightRatio: node.heightRatio,
          liveXRatio: node.xRatio,
          liveYRatio: node.yRatio,
          liveWidthRatio: node.widthRatio,
          liveHeightRatio: node.heightRatio,
        };
      }
      const r = el.getBoundingClientRect();
      const liveXRatio = stageRect.width > 0 ? (r.left - stageRect.left) / stageRect.width : node.xRatio;
      const liveYRatio = stageRect.height > 0 ? (r.top - stageRect.top) / stageRect.height : node.yRatio;
      const liveWidthRatio = stageRect.width > 0 ? r.width / stageRect.width : node.widthRatio;
      const liveHeightRatio = stageRect.height > 0 ? r.height / stageRect.height : node.heightRatio;
      void widthPx;
      void heightPx;
      return {
        sceneNodeId: node.sceneNodeId,
        targetXRatio: node.xRatio,
        targetYRatio: node.yRatio,
        targetWidthRatio: node.widthRatio,
        targetHeightRatio: node.heightRatio,
        liveXRatio,
        liveYRatio,
        liveWidthRatio,
        liveHeightRatio,
      };
    });

  return {
    id: `tv4dmm-live-${Date.now()}`,
    viewport: TWIN_V4_FORENSIC_CANONICAL_VIEWPORT,
    measurements,
  };
}
