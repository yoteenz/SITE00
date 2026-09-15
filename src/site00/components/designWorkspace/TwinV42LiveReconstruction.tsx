import type { TwinV41PixelDerivedSceneGraph } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/twinV41Types.js';
import type { TwinV4CanonicalViewport } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV42/twinV42Types.js';
import { TWIN_V4_CSS_NAMESPACE } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV40/constants.js';

type Props = {
  sceneGraph: TwinV41PixelDerivedSceneGraph;
  viewport: TwinV4CanonicalViewport;
  correctionBoost?: number;
};

/** Fixed-canvas LIVE DOM from pixel-derived scene graph (no golden raster substrate). */
export function TwinV42LiveReconstruction({ sceneGraph, viewport, correctionBoost = 0 }: Props) {
  const boost = correctionBoost * 0.001;
  const { width, height } = viewport;

  return (
    <div
      className={`${TWIN_V4_CSS_NAMESPACE} site00-twin-v42-live`}
      data-testid="twin-v4-live-reconstruction"
      data-twin-v4-qa-stable="1"
      style={{
        width,
        height,
        maxWidth: '100%',
        margin: '0 auto',
        position: 'relative',
        background: '#f5f5f0',
        boxSizing: 'border-box',
      }}
    >
      {sceneGraph.nodes
        .filter((n) => n.type !== 'DOCUMENT' && n.type !== 'EDGE')
        .map((node) => (
          <div
            key={node.sceneNodeId}
            data-scene-node-id={node.sceneNodeId}
            style={{
              position: 'absolute',
              left: node.x + boost * width,
              top: node.y + boost * height,
              width: node.width,
              height: node.height,
              boxSizing: 'border-box',
              border: node.type === 'REGION' ? '1px solid #1e5bb8' : undefined,
              background:
                node.type === 'TEXT' ? 'rgba(30,60,120,0.08)'
                : node.type === 'CALLOUT' ? '#b4e050'
                : node.type === 'VISUAL_OBJECT' ? '#ffffff'
                : 'transparent',
              fontSize: 10,
              color: '#1a3366',
              overflow: 'hidden',
            }}
          >
            {node.semanticLabel ? node.semanticLabel.replace(/_/g, ' ').slice(0, 32) : null}
          </div>
        ))}
    </div>
  );
}
