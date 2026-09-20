import {
  conceptViewportBadge,
  resolveInspectLineage,
} from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/reviewState.js';
import { resolveConceptArtifactRef } from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/conceptArtifacts.js';
import type { WorkspaceConceptSlotId, WorkspaceSelfWorkflowState } from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import { resolveCaptureArtifactDisplayUrl } from '../../services/workspaceSelfArtifactStorage';

export function WorkspaceSelfInspectPanel({
  state,
  conceptId,
  viewport,
  onClose,
  onSelectMobile,
  onSelectDesktop,
  onPromote,
  onFullscreen,
  canPromote,
}: {
  state: WorkspaceSelfWorkflowState;
  conceptId: WorkspaceConceptSlotId;
  viewport: 'MOBILE' | 'DESKTOP';
  onClose: () => void;
  onSelectMobile: () => void;
  onSelectDesktop: () => void;
  onPromote: () => void;
  onFullscreen: () => void;
  canPromote: boolean;
}) {
  const concept = state.concepts.find((c) => c.conceptId === conceptId);
  const imageRef = resolveConceptArtifactRef(state, conceptId, viewport);
  const src = imageRef ? resolveCaptureArtifactDisplayUrl(imageRef) : null;
  const lineage = resolveInspectLineage(state, conceptId);
  const mobileBadge = conceptViewportBadge(state, conceptId, 'MOBILE');
  const desktopBadge = conceptViewportBadge(state, conceptId, 'DESKTOP');

  return (
    <div className="site00-wssc__overlay" role="dialog" data-testid="workspace-self-inspect">
      <div className="site00-wssc__overlayPanel">
        <header className="site00-wssc__overlayHead">
          <h2>Inspect — {concept?.conceptName ?? conceptId}</h2>
          <button type="button" onClick={onClose}>
            CLOSE
          </button>
        </header>
        <p className="site00-wssc__muted">
          Viewport: <strong>{viewport}</strong> · Mobile: {mobileBadge} · Desktop: {desktopBadge}
        </p>
        <div className="site00-wssc__inspectArt">
          {src ?
            <img src={src} alt="" />
          : <p className="site00-wssc__authorityEmpty">No artifact for this viewport</p>}
        </div>
        <p>{concept?.conceptTerritory ?? '—'}</p>
        <div className="site00-wssc__actions">
          {viewport === 'MOBILE' ?
            <button type="button" onClick={onSelectMobile}>
              SELECT FOR MOBILE
            </button>
          : <button type="button" onClick={onSelectDesktop}>
              SELECT FOR DESKTOP
            </button>
          }
          <button type="button" onClick={onPromote} disabled={!canPromote}>
            PROMOTE {viewport}
          </button>
          <button type="button" onClick={onFullscreen} disabled={!src}>
            VIEW FULLSCREEN
          </button>
        </div>
        <details className="site00-wssc__technical">
          <summary>TECHNICAL DETAILS / GENERATION LINEAGE</summary>
          <pre className="site00-wssc__lineagePre">{JSON.stringify(lineage, null, 2)}</pre>
        </details>
      </div>
    </div>
  );
}
