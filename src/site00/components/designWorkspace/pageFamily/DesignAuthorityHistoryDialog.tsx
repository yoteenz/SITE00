/**
 * P0.VR.AUTH.1 — Design authority version history for page + viewport.
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { DesignViewportClass } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import { listPageDesignAuthorityHistory } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1R3a/index.js';

type Props = {
  open: boolean;
  projectId: string;
  pageId: string;
  viewport: DesignViewportClass;
  onClose: () => void;
};

export function DesignAuthorityHistoryDialog({ open, projectId, pageId, viewport, onClose }: Props) {
  const history = listPageDesignAuthorityHistory(projectId, pageId, viewport);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="site00-dw-wizard-drawer" data-open="true" role="presentation">
      <button type="button" className="site00-dw-wizard-drawer__backdrop" aria-label="Close history" onClick={onClose} />
      <aside className="site00-dw-wizard-drawer__panel" role="dialog" aria-modal="true" aria-label="Design authority history">
        <header className="site00-dw-wizard-drawer__head">
          <strong>DESIGN AUTHORITY HISTORY</strong>
          <button type="button" className="site00-dw-wizard-drawer__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="site00-dw-wizard-drawer__body site00-pfw-authority-history">
          <p className="site00-pfw-authority-history__context">{viewport.toUpperCase()}</p>
          <ul className="site00-pfw-authority-history__list">
            {history.length === 0 ? (
              <li>No authority versions recorded yet.</li>
            ) : (
              history.map((entry) => (
                <li key={entry.authorityVersionId} className={`is-${entry.status.toLowerCase()}`}>
                  <strong>{entry.status}</strong>
                  <span>{entry.source}</span>
                  {entry.approvedAt ? <span>Approved {entry.approvedAt.slice(0, 10)}</span> : null}
                  {entry.supersededAt ? <span>Superseded {entry.supersededAt.slice(0, 10)}</span> : null}
                  <small>{entry.assetRef || entry.storagePath}</small>
                </li>
              ))
            )}
          </ul>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
