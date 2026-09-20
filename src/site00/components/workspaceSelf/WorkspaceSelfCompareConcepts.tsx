import { buildCompareConceptColumns } from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/reviewState.js';
import type { WorkspaceConceptSlotId, WorkspaceSelfWorkflowState } from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import { resolveCaptureArtifactDisplayUrl } from '../../services/workspaceSelfArtifactStorage';

export function WorkspaceSelfCompareConcepts({
  state,
  viewport,
  onClose,
  onSelectViewport,
  onSelectForViewport,
  onInspect,
  onFullscreen,
}: {
  state: WorkspaceSelfWorkflowState;
  viewport: 'MOBILE' | 'DESKTOP';
  onClose: () => void;
  onSelectViewport: (vp: 'MOBILE' | 'DESKTOP') => void;
  onSelectForViewport: (id: WorkspaceConceptSlotId) => void;
  onInspect: (id: WorkspaceConceptSlotId) => void;
  onFullscreen: (id: WorkspaceConceptSlotId) => void;
}) {
  const columns = buildCompareConceptColumns(state, viewport);

  return (
    <div className="site00-wssc__overlay" role="dialog" data-testid="workspace-self-compare">
      <div className="site00-wssc__overlayPanel site00-wssc__compare">
        <header className="site00-wssc__overlayHead">
          <h2>Compare concepts — {viewport}</h2>
          <button type="button" onClick={onClose}>
            CLOSE
          </button>
        </header>
        <div className="site00-wssc__actions">
          <button type="button" data-active={viewport === 'MOBILE' ? 'true' : 'false'} onClick={() => onSelectViewport('MOBILE')}>
            COMPARE MOBILE
          </button>
          <button type="button" data-active={viewport === 'DESKTOP' ? 'true' : 'false'} onClick={() => onSelectViewport('DESKTOP')}>
            COMPARE DESKTOP
          </button>
        </div>
        <div className="site00-wssc__compareGrid">
          {columns.map((col) => {
            const src = col.imageRef ? resolveCaptureArtifactDisplayUrl(col.imageRef) : null;
            return (
              <article key={col.conceptId} className="site00-wssc__compareCol" data-active={col.isActive ? 'true' : 'false'}>
                <strong>{col.conceptName}</strong>
                <p className="site00-wssc__muted">{col.badge !== '—' ? col.badge : 'UNSELECTED'}</p>
                <div className="site00-wssc__compareArt">
                  {src ?
                    <img src={src} alt="" />
                  : <p className="site00-wssc__authorityEmpty">No {viewport.toLowerCase()} artifact</p>}
                </div>
                <p className="site00-wssc__muted">{col.premise || '—'}</p>
                <div className="site00-wssc__actions">
                  <button type="button" onClick={() => onInspect(col.conceptId)} disabled={!col.imageRef}>
                    INSPECT
                  </button>
                  <button type="button" onClick={() => onFullscreen(col.conceptId)} disabled={!col.imageRef}>
                    FULLSCREEN
                  </button>
                  <button type="button" data-primary="true" onClick={() => onSelectForViewport(col.conceptId)} disabled={!col.imageRef}>
                    SELECT FOR {viewport}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
