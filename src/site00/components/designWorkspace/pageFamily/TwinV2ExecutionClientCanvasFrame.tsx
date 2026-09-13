/**
 * P0.VR.TWINV2.2R2R2 — Collapsed execution client canvas crop (blueprint-driven, not full image height).
 */

import type { ClientCanvasBoundary } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/computeClientCanvasBoundary.js';
import { clientCanvasClipInsetsFromBoundary } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV22R2/computeClientCanvasBoundary.js';

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
  const { topPct, bottomPct, visibleHeightRatio } = clientCanvasClipInsetsFromBoundary(boundary);

  return (
    <div
      className="site00-twin-v2-trimmed-canvas"
      data-client-canvas-trim={boundary.status}
      style={{ aspectRatio: `375 / ${Math.max(120, Math.round(375 * visibleHeightRatio))}` }}
    >
      <img
        src={imageUrl}
        alt={alt}
        draggable={false}
        style={{
          clipPath: `inset(${topPct.toFixed(2)}% 0 ${bottomPct.toFixed(2)}% 0)`,
        }}
      />
      {debugGuides ? (
        <>
          <span className="site00-twin-v2-trimmed-canvas__guide site00-twin-v2-trimmed-canvas__guide--end">
            CLIENT CANVAS END
          </span>
        </>
      ) : null}
    </div>
  );
}
