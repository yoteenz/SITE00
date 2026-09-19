import { fnv1aHex } from '../p0vrTwinV30/mobileTwinPipeline/runGenerateMobileTwinPackageCore.js';
import type { TwinV4DomPlanNode, TwinV4DomReconstructionPlan, TwinV4VisualSceneGraph } from './twinV4Types.js';

export function buildTwinV4DomReconstructionPlan(sceneGraph: TwinV4VisualSceneGraph): TwinV4DomReconstructionPlan {
  const nodes: TwinV4DomPlanNode[] = sceneGraph.nodes.map((n) => {
    const positioning: TwinV4DomPlanNode['positioning'] =
      n.parentNodeId === 'page-root' || n.type === 'CALLOUT' || n.type === 'TABLE_ROW' ? 'absolute' : 'relative';
    const parentLayout: TwinV4DomPlanNode['parentLayout'] =
      n.type === 'GROUP' || n.type === 'SECTION' ? 'flex-column'
      : n.parentNodeId === 'footer-legend-row' ? 'flex-row'
      : 'absolute-stack';
    const elementType: TwinV4DomPlanNode['elementType'] =
      n.type === 'TEXT' || n.type === 'CALLOUT' ? 'span' : n.type === 'PAGE' ? 'section' : 'div';
    return {
      sceneNodeId: n.sceneNodeId,
      elementType,
      positioning,
      parentLayout,
      widthBehavior: `${Math.round(n.widthRatio * 100)}%`,
      heightBehavior: `${Math.max(12, Math.round(n.heightRatio * 100))}px`,
      typographyRule: n.textRole ? `role:${n.textRole}` : null,
      borderRule: n.border,
      backgroundRule: n.background,
      assetRule: n.assetRole,
    };
  });
  const body = JSON.stringify(nodes.map((x) => x.sceneNodeId));
  return {
    id: `tv4drp-${fnv1aHex(body).slice(0, 10)}`,
    hash: fnv1aHex(body),
    nodes,
  };
}
