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
  const visible = Math.max(0.05, boundary.sanitizedCanvasHeight);
  const top = boundary.canvasTop;
  const artboardVisibleHeight = 812 * visible;

  return (
    <div
      className="site00-twin-v2-trimmed-canvas"
      data-client-canvas-trim={boundary.status}
      data-canvas-top={top.toFixed(4)}
      data-canvas-bottom={boundary.sanitizedCanvasBottom.toFixed(4)}
      style={{
        aspectRatio: `375 / ${artboardVisibleHeight}`,
        ['--client-crop-top' as string]: String(top),
        ['--client-crop-visible' as string]: String(visible),
      }}
    >
      <img
        src={imageUrl}
        alt={alt}
        draggable={false}
        className="site00-twin-v2-trimmed-canvas__artboard"
      />
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
