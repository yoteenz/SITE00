/**
 * P0.VR.6R2 — Visual comparison drawer (reference / live / overlay / diff).
 */

import type { DesignReferenceComparisonSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr6r2/browserClient.js';

export type DesignVisualComparisonDrawerProps = {
  open: boolean;
  session: DesignReferenceComparisonSession | null;
  referenceUrl?: string | null;
  liveUrl?: string | null;
  onClose: () => void;
  onAcceptMatch?: () => void;
  onRequestAnotherPass?: () => void;
  onRecapture?: () => void;
};

export function DesignVisualComparisonDrawer({
  open,
  session,
  referenceUrl,
  liveUrl,
  onClose,
  onAcceptMatch,
  onRequestAnotherPass,
  onRecapture,
}: DesignVisualComparisonDrawerProps) {
  if (!open || !session) return null;

  const overlay = session.latestOverlay;

  return (
    <aside className="site00-dw-v3-comparison-drawer" role="dialog" aria-label="Visual comparison">
      <header className="site00-dw-v3-comparison-drawer__head">
        <div>
          <strong>VISUAL COMPARISON</strong>
          <span>{session.status.replace(/_/g, ' ')}</span>
        </div>
        <button type="button" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </header>

      <div className="site00-dw-v3-comparison-drawer__views">
        <figure>
          <figcaption>REFERENCE</figcaption>
          {referenceUrl ? <img src={referenceUrl} alt="Reference" /> : <div className="site00-dw-v3-pages__empty-thumb" />}
        </figure>
        <figure>
          <figcaption>LIVE</figcaption>
          {liveUrl ? <img src={liveUrl} alt="Live" /> : <div className="site00-dw-v3-pages__empty-thumb" />}
        </figure>
        <figure>
          <figcaption>OVERLAY @ 50%</figcaption>
          {overlay?.overlayPath ? (
            <div className="site00-dw-v3-comparison-drawer__overlay-note">{overlay.overlayPath}</div>
          ) : (
            <div className="site00-dw-v3-pages__empty-thumb" />
          )}
        </figure>
        <figure>
          <figcaption>DIFF</figcaption>
          {overlay?.diffPath ? (
            <div className="site00-dw-v3-comparison-drawer__overlay-note">{overlay.diffPath}</div>
          ) : (
            <div className="site00-dw-v3-pages__empty-thumb" />
          )}
        </figure>
      </div>

      <section className="site00-dw-v3-comparison-drawer__findings">
        <h3>REGION FINDINGS ({session.latestDeltas.length})</h3>
        <ul>
          {session.latestDeltas.slice(0, 8).map((d) => (
            <li key={d.measurementId}>
              {d.componentId ?? d.regionId}: {d.description} — {d.severity}
              {d.masked ? ' (masked)' : ''}
            </li>
          ))}
        </ul>
      </section>

      <section className="site00-dw-v3-comparison-drawer__history">
        <h3>ITERATION HISTORY ({session.iterations.length})</h3>
        <ul>
          {session.historyEvents.slice(-6).map((e, i) => (
            <li key={`${e.event}-${i}`}>
              {e.event.replace(/_/g, ' ')} — {e.at}
            </li>
          ))}
        </ul>
      </section>

      <footer className="site00-dw-v3-comparison-drawer__actions">
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onAcceptMatch}>
          ACCEPT MATCH
        </button>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onRequestAnotherPass}>
          REQUEST ANOTHER PASS
        </button>
        <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline" onClick={onRecapture}>
          RECAPTURE
        </button>
      </footer>
    </aside>
  );
}
