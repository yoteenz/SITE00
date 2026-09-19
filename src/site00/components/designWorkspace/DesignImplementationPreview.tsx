/**
 * P0.VR.3E — Current implementation preview (not canonical reference).
 */

import type { ImplementationSnapshotRecord } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr3e/client.js';
import type { DesignViewportClass } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/client.js';

type Props = {
  snapshot: ImplementationSnapshotRecord | null;
  viewportClass: DesignViewportClass;
  viewportWidth: number;
  viewportHeight: number;
  onCapture?: () => void;
  capturing?: boolean;
};

export function DesignImplementationPreview({
  snapshot,
  viewportClass,
  viewportWidth,
  viewportHeight,
  onCapture,
  capturing,
}: Props) {
  const frameHeight = Math.min(viewportHeight, 520);

  return (
    <section className="site00-dw-impl-preview" data-visual-reconstruction="p0vr3e-implementation-preview">
      <div className="site00-dw-impl-preview__head">
        <h2>CURRENT IMPLEMENTATION</h2>
        <span className="site00-dw-impl-preview__badge">CURRENT</span>
        {onCapture ? (
          <button type="button" className="site00-dw-btn site00-dw-btn--compact" onClick={onCapture} disabled={capturing}>
            {capturing ? 'CAPTURING…' : 'CAPTURE IMPLEMENTATION'}
          </button>
        ) : null}
      </div>
      <p className="site00-dw-impl-preview__meta">
        {viewportClass.toUpperCase()} · {viewportWidth}×{viewportHeight}
        {snapshot?.capturedAt ? ` · ${snapshot.capturedAt.slice(0, 19)}` : ''}
        {snapshot?.stale ? ' · STALE' : ''}
      </p>
      <figure className="site00-dw-impl-preview__figure">
        {snapshot?.publicUrl && snapshot.captureStatus === 'CURRENT' ? (
          <img
            src={snapshot.publicUrl}
            alt={`Current ${viewportClass} implementation`}
            className="site00-dw-impl-preview__shot"
            style={{ width: viewportWidth, height: frameHeight, objectFit: 'cover' }}
          />
        ) : snapshot?.captureStatus === 'IMPLEMENTATION_MISSING' ? (
          <div className="site00-dw-impl-preview__empty">IMPLEMENTATION DOES NOT EXIST</div>
        ) : (
          <div className="site00-dw-impl-preview__empty">
            NO SCREENSHOT YET
            {onCapture ? (
              <button type="button" className="site00-dw-btn" onClick={onCapture}>
                CAPTURE
              </button>
            ) : null}
          </div>
        )}
        {snapshot?.error && snapshot.captureStatus === 'FAILED' ? (
          <figcaption className="site00-dw-impl-preview__error">Capture failed: {snapshot.error}</figcaption>
        ) : null}
      </figure>
    </section>
  );
}
