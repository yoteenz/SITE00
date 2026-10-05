import { conceptViewportBadge } from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/reviewState.js';
import { resolveConceptArtifactRef } from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/conceptArtifacts.js';
import type { WorkspaceConceptSlotId, WorkspaceSelfWorkflowState } from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import { resolveCaptureArtifactDisplayUrl } from '../../services/workspaceSelfArtifactStorage';

export function WorkspaceSelfFullscreenReview({
  state,
  conceptId,
  viewport,
  onClose,
  onSelectForViewport,
  onPromote,
  canPromote,
}: {
  state: WorkspaceSelfWorkflowState;
  conceptId: WorkspaceConceptSlotId;
  viewport: 'MOBILE' | 'DESKTOP';
  onClose: () => void;
  onSelectForViewport: () => void;
  onPromote: () => void;
  canPromote: boolean;
}) {
  const concept = state.concepts.find((c) => c.conceptId === conceptId);
  const imageRef = resolveConceptArtifactRef(state, conceptId, viewport);
  const src = imageRef ? resolveCaptureArtifactDisplayUrl(imageRef) : null;
  const badge = conceptViewportBadge(state, conceptId, viewport);

  return (
    <div className="site00-wssc__fullscreen" role="dialog" data-testid="workspace-self-fullscreen">
      <div className="site00-wssc__fullscreenBar">
        <span>
          {concept?.conceptName ?? conceptId} · {viewport} · {badge}
        </span>
        <div className="site00-wssc__actions">
          <button type="button" onClick={onSelectForViewport}>
            SELECT FOR {viewport}
          </button>
          <button type="button" onClick={onPromote} disabled={!canPromote}>
            PROMOTE
          </button>
          <button type="button" className="site00-wssc__fullscreenClose" onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
      {src ?
        <img src={src} alt="" className="site00-wssc__fullscreenConcept" />
      : <p className="site00-wssc__authorityEmpty">No artifact</p>}
    </div>
  );
}
