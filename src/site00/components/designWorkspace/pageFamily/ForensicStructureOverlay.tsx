/**
 * P0.VR.DIAG.1R5A — Full-screen / mobile-safe internal structure inspector.
 */

import { createPortal } from 'react-dom';
import type { RegionForensicsSummary } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageVisualDiagnosis.js';
import { formatAnchorLine } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrDiag1R5/structureUiModel.js';

type Props = {
  open: boolean;
  region: RegionForensicsSummary | null;
  onClose: () => void;
  onAnalyzeStructure?: (regionId: string) => void;
};

export function ForensicStructureOverlay({ open, region, onClose, onAnalyzeStructure }: Props) {
  if (!open || !region || typeof document === 'undefined') return null;

  const view = region.structureView;
  const trace = region.structureToDepthTrace;
  const status = region.internalStructureStatus ?? view?.structureStatus ?? 'UNRESOLVED';

  return createPortal(
    <div className="site00-pfw-forensic-overlay site00-pfw-forensic-overlay--structure" role="presentation">
      <button type="button" className="site00-pfw-forensic-overlay__backdrop" aria-label="Close structure" onClick={onClose} />
      <aside
        className="site00-pfw-forensic-overlay__panel site00-pfw-forensic-overlay__panel--sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Region internal structure"
      >
        <header className="site00-pfw-forensic-overlay__head">
          <strong>STRUCTURE — {region.regionName}</strong>
          <button type="button" className="site00-dw-wizard-drawer__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="site00-pfw-forensic-overlay__body">
          <p className="site00-pfw-upgrade-v2__evidence-status">
            STRUCTURE: {status.replace(/_/g, ' ')} · {region.measurementDepthStatus ?? 'UNMEASURED'} ·{' '}
            {region.dimensionCount} valid dimensions
          </p>
          {view ? (
            <p className="site00-pfw-forensic-overlay__structure-meta">
              FORENSICS ENGINE: {view.forensicsEngine} · STRUCTURE UI: {view.structureUiVersion}
            </p>
          ) : null}
          {(region.structureFailureCode || view?.failureCode) && (
            <p className="site00-pfw-forensic-overlay__missing">
              {(region.structureFailureCode ?? view?.failureCode)?.replace(/_/g, ' ')}
              {region.structureFailureDetail || view?.failureDetail ? ` — ${region.structureFailureDetail ?? view?.failureDetail}` : ''}
            </p>
          )}

          {view?.currentLines?.length ? (
            <section className="site00-pfw-structure-side">
              <h4>CURRENT</h4>
              <ul className="site00-pfw-structure-side__list">
                {view.currentLines.map((line) => (
                  <li key={`cur-${line.anchorKey}`}>
                    {formatAnchorLine(line, 'current')} · {line.anchorType}
                  </li>
                ))}
              </ul>
            </section>
          ) : region.internalStructureHierarchy?.length ? (
            <pre className="site00-pfw-forensic-overlay__structure-tree">{region.internalStructureHierarchy.join('\n')}</pre>
          ) : (
            <p className="site00-pfw-forensic-overlay__empty">STRUCTURE NOT ANALYZED</p>
          )}

          {view?.currentLines?.length ? (
            <section className="site00-pfw-structure-side">
              <h4>AUTHORITY</h4>
              <ul className="site00-pfw-structure-side__list">
                {view.currentLines.map((line) => (
                  <li key={`auth-${line.anchorKey}`}>
                    {formatAnchorLine(line, 'authority')} · {line.anchorType}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {view?.relationshipsSummary?.length ? (
            <section>
              <h4>RELATIONSHIPS</h4>
              <ul className="site00-pfw-structure-side__list">
                {view.relationshipsSummary.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {trace ? (
            <section className="site00-pfw-structure-trace">
              <h4>DEPTH TRACE</h4>
              <p>
                {trace.resolvedAnchors.length} anchors · {trace.generatedMeasurements.length} measurements generated ·{' '}
                {trace.qualifiedDimensions.length} qualified · {trace.depthBefore} → {trace.depthAfter}
              </p>
              {trace.blockingReason ? <p className="site00-pfw-forensic-overlay__missing">{trace.blockingReason}</p> : null}
            </section>
          ) : null}

          {region.showAnalyzeStructure && onAnalyzeStructure ? (
            <button
              type="button"
              className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-v3-btn--compact"
              onClick={() => onAnalyzeStructure(region.regionId)}
            >
              ANALYZE STRUCTURE
            </button>
          ) : null}
        </div>
      </aside>
    </div>,
    document.body,
  );
}
