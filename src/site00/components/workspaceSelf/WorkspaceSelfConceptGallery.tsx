import { WORKSPACE_CONCEPT_SLOT_IDS } from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/constants.js';
import {
  conceptViewportBadge,
  type ConceptViewportBadge,
} from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/reviewState.js';
import type { WorkspaceConceptSlotId, WorkspaceSelfWorkflowState } from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import { resolveCaptureArtifactDisplayUrl } from '../../services/workspaceSelfArtifactStorage';

function Badge({ label }: { label: ConceptViewportBadge }) {
  if (label === '—') return <span className="site00-wssc__badge site00-wssc__badge--muted">—</span>;
  return <span className="site00-wssc__badge">{label}</span>;
}

export function WorkspaceSelfConceptGallery({
  state,
  activeConceptId,
  onActivate,
  onInspect,
  onFullscreen,
  onSelectMobile,
  onSelectDesktop,
}: {
  state: WorkspaceSelfWorkflowState;
  activeConceptId: WorkspaceConceptSlotId | null;
  onActivate: (id: WorkspaceConceptSlotId) => void;
  onInspect: (id: WorkspaceConceptSlotId) => void;
  onFullscreen: (id: WorkspaceConceptSlotId) => void;
  onSelectMobile: (id: WorkspaceConceptSlotId) => void;
  onSelectDesktop: (id: WorkspaceConceptSlotId) => void;
}) {
  return (
    <div className="site00-wssc__gallery" data-testid="workspace-self-concept-gallery">
      <div className="site00-wssc__galleryTrack">
        {WORKSPACE_CONCEPT_SLOT_IDS.map((id) => {
          const concept = state.concepts.find((c) => c.conceptId === id);
          const isActive = activeConceptId === id;
          const staged = concept?.status !== 'EMPTY';
          return (
            <article
              key={id}
              className="site00-wssc__slot site00-wssc__galleryCard"
              data-active={isActive ? 'true' : 'false'}
              data-concept={id}
            >
              <button type="button" className="site00-wssc__galleryActivate" onClick={() => onActivate(id)}>
                <strong>{concept?.conceptName || id}</strong>
                {isActive ? <span className="site00-wssc__badge site00-wssc__badge--active">ACTIVE</span> : null}
              </button>
              <div className="site00-wssc__badgeRow">
                <span>MOBILE</span>
                <Badge label={conceptViewportBadge(state, id, 'MOBILE')} />
                <span>DESKTOP</span>
                <Badge label={conceptViewportBadge(state, id, 'DESKTOP')} />
              </div>
              {concept?.conceptTerritory ?
                <p className="site00-wssc__muted">{concept.conceptTerritory.slice(0, 100)}</p>
              : null}
              <div className="site00-wssc__grid site00-wssc__grid--2">
                {concept?.mobileArtifactPath ?
                  <img
                    className="site00-wssc__capture"
                    src={resolveCaptureArtifactDisplayUrl(concept.mobileArtifactPath) ?? undefined}
                    alt={`${id} mobile`}
                  />
                : <div className="site00-wssc__thumbPlaceholder">No mobile</div>}
                {concept?.desktopArtifactPath ?
                  <img
                    className="site00-wssc__capture"
                    src={resolveCaptureArtifactDisplayUrl(concept.desktopArtifactPath) ?? undefined}
                    alt={`${id} desktop`}
                  />
                : <div className="site00-wssc__thumbPlaceholder">No desktop</div>}
              </div>
              <div className="site00-wssc__actions">
                <button type="button" onClick={() => onInspect(id)} disabled={!staged}>
                  INSPECT
                </button>
                <button type="button" onClick={() => onFullscreen(id)} disabled={!staged}>
                  FULLSCREEN
                </button>
                <button type="button" onClick={() => onSelectMobile(id)} disabled={!staged}>
                  SELECT MOBILE
                </button>
                <button type="button" onClick={() => onSelectDesktop(id)} disabled={!staged}>
                  SELECT DESKTOP
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
