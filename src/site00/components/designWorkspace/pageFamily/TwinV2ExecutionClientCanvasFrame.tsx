/**
 * P0.VR.TWINV2.2R2R2 + 2R2R3 — Execution client canvas (independent top/bottom semantic crop).
 */

import type { ClientCanvasBoundary } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/computeClientCanvasBoundary.js';

type Props = {
  imageUrl: string;
  boundary: ClientCanvasBoundary;
  alt?: string;
  debugGuides?: boolean;
};

export function TwinV2ExecutionClientCanvasFrame({
  imageUrl,
  boundary,
  alt = 'NDXBOOK client canvas',
  debugGuides = false,
}: Props) {
  const visible = boundary.sanitizedCanvasHeight;
  const top = boundary.canvasTop;
  const bottomClipPct = (1 - boundary.sanitizedCanvasBottom) * 100;
  const visibleHeightPxAt375 = 812 * visible;

  return (
    <div
      className="site00-twin-v2-trimmed-canvas"
      data-client-canvas-trim={boundary.status}
      data-canvas-top={top.toFixed(4)}
      data-canvas-bottom={boundary.sanitizedCanvasBottom.toFixed(4)}
      style={{
        aspectRatio: `375 / ${visibleHeightPxAt375}`,
      }}
    >
      <div
        className="site00-twin-v2-trimmed-canvas__shift"
        style={{
          transform: `translateY(-${top * 100}%)`,
        }}
      >
        <img
          src={imageUrl}
          alt={alt}
          draggable={false}
          className="site00-twin-v2-trimmed-canvas__artboard"
          style={{
            clipPath: `inset(0 0 ${bottomClipPct}% 0)`,
            WebkitClipPath: `inset(0 0 ${bottomClipPct}% 0)`,
          }}
        />
      </div>
      {debugGuides ? (
        <>
          <span className="site00-twin-v2-trimmed-canvas__guide site00-twin-v2-trimmed-canvas__guide--top">
            CLIENT TOP
          </span>
          <span className="site00-twin-v2-trimmed-canvas__guide site00-twin-v2-trimmed-canvas__guide--end">
            CLIENT BOTTOM
          </span>
        </>
      ) : null}
    </div>
  );
}
