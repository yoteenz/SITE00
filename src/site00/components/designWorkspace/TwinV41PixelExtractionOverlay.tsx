import { useMemo, useState } from 'react';
import type { TwinV41PixelExtractionBundle } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/twinV41Types.js';
import { TWIN_V41_PROJECT_STYLE_FIREWALL } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV41/twinV41StyleFirewall.js';

type Props = {
  bundle: TwinV41PixelExtractionBundle;
};

type OverlayLayer = 'REGIONS' | 'TEXT' | 'CALLOUTS' | 'EDGES' | 'OBJECTS';

export function TwinV41PixelExtractionOverlay({ bundle }: Props) {
  const [layer, setLayer] = useState<OverlayLayer>('REGIONS');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { authorityLock, analysis, sceneGraph } = bundle;
  const { sourceWidth, sourceHeight } = analysis.coordinateSpace;

  const selectedNode = useMemo(
    () => sceneGraph.nodes.find((n) => n.sceneNodeId === selectedId) ?? null,
    [sceneGraph.nodes, selectedId],
  );

  const boxes = useMemo(() => {
    if (layer === 'REGIONS') {
      return analysis.majorRegions.map((r) => ({
        id: String(r.regionId),
        x: r.x,
        y: r.y,
        w: r.width,
        h: r.height,
        label: String(r.regionId),
        confidence: r.confidence,
      }));
    }
    if (layer === 'TEXT') {
      return analysis.textRegionMap.regions.map((r) => ({
        id: r.textRegionId,
        x: r.x,
        y: r.y,
        w: r.width,
        h: r.height,
        label: r.textRegionId,
        confidence: r.confidence,
      }));
    }
    if (layer === 'CALLOUTS') {
      return analysis.calloutMap.callouts.map((c) => ({
        id: c.calloutId,
        x: c.x,
        y: c.y,
        w: c.width,
        h: c.height,
        label: c.visibleNumber != null ? `#${c.visibleNumber}` : c.calloutId,
        confidence: c.confidence,
      }));
    }
    if (layer === 'OBJECTS') {
      return analysis.visualObjectRegions.map((o) => ({
        id: o.objectRegionId,
        x: o.x,
        y: o.y,
        w: o.width,
        h: o.height,
        label: o.objectClass,
        confidence: o.confidence,
      }));
    }
    return analysis.edgeMap.edges.map((e) => ({
      id: e.edgeId,
      x: Math.min(e.x1, e.x2),
      y: Math.min(e.y1, e.y2),
      w: Math.max(2, Math.abs(e.x2 - e.x1)),
      h: Math.max(2, Math.abs(e.y2 - e.y1)),
      label: e.orientation,
      confidence: e.confidence,
    }));
  }, [analysis, layer]);

  return (
    <div
      className="site00-twin-v41-extraction"
      data-testid="twin-v41-pixel-extraction"
      data-style-firewall={JSON.stringify(TWIN_V41_PROJECT_STYLE_FIREWALL)}
    >
      <p className="site00-twin-v41-extraction__note">
        PIXEL EXTRACTION — QA view only. Authority raster background; overlays are source-derived bounds (not DOM
        reconstruction).
      </p>
      <div className="site00-twin-v41-extraction__layers">
        {(['REGIONS', 'TEXT', 'CALLOUTS', 'EDGES', 'OBJECTS'] as OverlayLayer[]).map((l) => (
          <button
            key={l}
            type="button"
            className={`site00-twin-v41-extraction__layer${layer === l ? ' site00-twin-v41-extraction__layer--on' : ''}`}
            onClick={() => setLayer(l)}
          >
            {l}
          </button>
        ))}
      </div>
      <div
        className="site00-twin-v41-extraction__stage"
        style={{ aspectRatio: `${sourceWidth} / ${sourceHeight}` }}
        data-testid="twin-v41-overlay-stage"
      >
        <img
          src={authorityLock.imageUri}
          alt=""
          className="site00-twin-v41-extraction__authority"
          data-testid="twin-v41-authority-raster"
        />
        <svg className="site00-twin-v41-extraction__svg" viewBox={`0 0 ${sourceWidth} ${sourceHeight}`}>
          {boxes.map((b) => (
            <g key={b.id}>
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                className="site00-twin-v41-extraction__box"
                onClick={() => setSelectedId(b.id)}
              />
              <text x={b.x + 4} y={b.y + 14} className="site00-twin-v41-extraction__label">
                {b.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      {selectedNode ?
        <div className="site00-twin-v41-extraction__inspector" data-testid="twin-v41-region-inspector">
          <strong>{selectedNode.sceneNodeId}</strong>
          <div>bounds: {selectedNode.x},{selectedNode.y} · {selectedNode.width}×{selectedNode.height}</div>
          <div>type: {selectedNode.type}</div>
          <div>confidence: {selectedNode.evidence.confidence.toFixed(2)}</div>
          <div>evidence: {selectedNode.evidence.evidenceRefs.map((r) => `${r.kind}:${r.refId}`).join(', ')}</div>
        </div>
      : null}
      <p className="site00-twin-v41-extraction__v40-banner" data-testid="twin-v40-rejected-banner">
        V4.0 REJECTED — SCENE GRAPH NOT IMAGE DERIVED ({sceneGraph.v40RejectionReason})
      </p>
    </div>
  );
}
