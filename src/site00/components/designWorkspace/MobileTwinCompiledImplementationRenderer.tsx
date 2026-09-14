import type { CompiledMobileTwinImplementationDocument } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30R8M/types.js';

type Props = {
  document: CompiledMobileTwinImplementationDocument;
  onNodeActivate?: (objectId: string) => void;
};

/** Real DOM implementation from structured compiler output — no raster page cheats. */
export function MobileTwinCompiledImplementationRenderer({ document, onNodeActivate }: Props) {
  return (
    <div
      className="site00-mobile-twin-compiled-impl"
      data-testid="mobile-twin-compiled-implementation"
      style={{
        position: 'relative',
        width: document.widthPx,
        height: document.heightPx,
        maxWidth: '100%',
        margin: '0 auto',
        background: '#f7f7f7',
        overflow: 'hidden',
      }}
    >
      {document.nodes.map((node) => (
        <button
          key={node.objectId}
          type="button"
          data-object-id={node.objectId}
          data-primitive={node.primitive}
          data-testid={`compiled-node-${node.objectId}`}
          onClick={() => onNodeActivate?.(node.objectId)}
          style={{
            position: 'absolute',
            left: `${node.layout.leftPct}%`,
            top: `${node.layout.topPct}%`,
            width: `${node.layout.widthPct}%`,
            height: `${node.layout.heightPct}%`,
            zIndex: node.layout.zIndex,
            ...node.styles,
            cursor: node.interactionIntent || node.functionTarget ? 'pointer' : 'default',
          }}
        >
          {node.semanticRole.replace(/_/g, ' ')}
        </button>
      ))}
    </div>
  );
}
