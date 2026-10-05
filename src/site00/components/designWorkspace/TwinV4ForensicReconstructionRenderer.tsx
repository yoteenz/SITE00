import type { CSSProperties } from 'react';
import type { TwinV4DomReconstructionPlan, TwinV4VisualSceneGraph } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/twinV4Types.js';
import { TWIN_V4_CSS_NAMESPACE } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/constants.js';

type Props = {
  sceneGraph: TwinV4VisualSceneGraph;
  domPlan: TwinV4DomReconstructionPlan;
  correctionBoost?: number;
};

export function TwinV4ForensicReconstructionRenderer({ sceneGraph, domPlan, correctionBoost = 0 }: Props) {
  const { widthPx, heightPx } = sceneGraph.canonicalViewport;
  const planById = new Map(domPlan.nodes.map((n) => [n.sceneNodeId, n]));
  const nodes = [...sceneGraph.nodes].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      className={TWIN_V4_CSS_NAMESPACE}
      data-testid="twin-v4-live-reconstruction"
      style={{ width: '100%', maxWidth: widthPx }}
    >
      <div
        className={`${TWIN_V4_CSS_NAMESPACE}__stage`}
        style={{ width: '100%', aspectRatio: `${widthPx} / ${heightPx}`, position: 'relative' }}
      >
        {nodes.map((node) => {
          if (node.sceneNodeId === 'page-root') return null;
          const plan = planById.get(node.sceneNodeId);
          const boost = correctionBoost * 0.002;
          const style: CSSProperties = {
            left: `${(node.xRatio + boost) * 100}%`,
            top: `${(node.yRatio + boost) * 100}%`,
            width: `${node.widthRatio * 100}%`,
            height: `${node.heightRatio * 100}%`,
            zIndex: node.zIndex,
            background: node.background ?? undefined,
            border: node.border ?? undefined,
            borderRadius: node.radius ?? undefined,
            textAlign: node.alignment,
          };
          const className = [
            `${TWIN_V4_CSS_NAMESPACE}__node`,
            node.type === 'TEXT' ? `${TWIN_V4_CSS_NAMESPACE}__node--text` : '',
            node.type === 'CALLOUT' ? `${TWIN_V4_CSS_NAMESPACE}__node--callout` : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div
              key={node.sceneNodeId}
              className={className}
              data-scene-node-id={node.sceneNodeId}
              data-dom-positioning={plan?.positioning}
              style={style}
            >
              {node.textContent && !node.textUncertain ? node.textContent : null}
              {node.textUncertain && node.textRole ? `[${node.textRole}]` : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
