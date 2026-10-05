import { resolveConceptArtifactRef } from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/conceptArtifacts.js';
import type { WorkspaceSelfWorkflowState } from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import { resolveCaptureArtifactDisplayUrl } from '../../services/workspaceSelfArtifactStorage';

export function WorkspaceSelfPairReviewPanel({ state }: { state: WorkspaceSelfWorkflowState }) {
  const mobileId = state.promotedMobileConceptId;
  const desktopId = state.promotedDesktopConceptId;
  if (!mobileId || !desktopId) return null;

  const mobileRef = resolveConceptArtifactRef(state, mobileId, 'MOBILE');
  const desktopRef = resolveConceptArtifactRef(state, desktopId, 'DESKTOP');
  const mobileSrc = mobileRef ? resolveCaptureArtifactDisplayUrl(mobileRef) : null;
  const desktopSrc = desktopRef ? resolveCaptureArtifactDisplayUrl(desktopRef) : null;
  const mobileName = state.concepts.find((c) => c.conceptId === mobileId)?.conceptName ?? mobileId;
  const desktopName = state.concepts.find((c) => c.conceptId === desktopId)?.conceptName ?? desktopId;

  if (!state.pairReviewOpenedAt) return null;

  return (
    <section className="site00-wssc__pairReview" data-testid="workspace-self-pair-review">
      <h2>Pair review — promoted authority only</h2>
      <div className="site00-wssc__grid site00-wssc__grid--2">
        <div>
          <strong>MOBILE AUTHORITY — {mobileName}</strong>
          {mobileSrc ?
            <img className="site00-wssc__capture" src={mobileSrc} alt="" />
          : null}
        </div>
        <div>
          <strong>DESKTOP AUTHORITY — {desktopName}</strong>
          {desktopSrc ?
            <img className="site00-wssc__capture" src={desktopSrc} alt="" />
          : null}
        </div>
      </div>
      <p className="site00-wssc__muted">
        Responsive relationship: independent viewport authorities from the same concept set (
        {state.conceptSet?.conceptSetId ?? '—'}).
      </p>
    </section>
  );
}
