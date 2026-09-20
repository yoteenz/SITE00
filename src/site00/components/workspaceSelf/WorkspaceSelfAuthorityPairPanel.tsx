import {
  resolveWorkspaceSelfAuthorityPairPresentation,
  type ViewportAuthorityPreview,
} from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/viewportAuthorityPreview.js';
import type { WorkspaceSelfWorkflowState } from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import { resolveCaptureArtifactDisplayUrl } from '../../services/workspaceSelfArtifactStorage';

function ViewportAuthorityCard({
  preview,
  onPromote,
  promoteDisabled,
  promoteLabel,
}: {
  preview: ViewportAuthorityPreview;
  onPromote?: () => void;
  promoteDisabled?: boolean;
  promoteLabel?: string;
}) {
  const src = preview.imageRef ? resolveCaptureArtifactDisplayUrl(preview.imageRef) : null;

  return (
    <div className="site00-wssc__authorityCard" data-viewport={preview.viewport} data-state={preview.state}>
      <div className="site00-wssc__authorityCardHead">
        <strong>{preview.titleLabel}</strong>
        <span className="site00-wssc__authorityPill">{preview.statePill}</span>
      </div>
      <p className="site00-wssc__muted">
        {preview.conceptSlot ?? '—'} · {preview.versionLabel.slice(0, 24)}
      </p>
      <div className="site00-wssc__authorityThumbFrame" data-empty={preview.state === 'EMPTY' ? 'true' : 'false'}>
        {src ?
          <img src={src} alt={`${preview.viewport} concept preview`} className="site00-wssc__authorityThumb" />
        : <p className="site00-wssc__authorityEmpty">{preview.emptyMessage ?? 'No preview'}</p>}
      </div>
      {onPromote && preview.state === 'SELECTED_PENDING_PROMOTION' ?
        <button type="button" className="site00-wssc__authorityPromote" disabled={promoteDisabled} onClick={onPromote}>
          {promoteLabel ?? `Promote ${preview.viewport === 'MOBILE' ? 'Mobile' : 'Desktop'}`}
        </button>
      : null}
    </div>
  );
}

export function WorkspaceSelfAuthorityPairPanel({
  state,
  onPromoteMobile,
  onPromoteDesktop,
  canPromoteMobile,
  canPromoteDesktop,
}: {
  state: WorkspaceSelfWorkflowState;
  onPromoteMobile: () => void;
  onPromoteDesktop: () => void;
  canPromoteMobile: boolean;
  canPromoteDesktop: boolean;
}) {
  const { mobile, desktop } = resolveWorkspaceSelfAuthorityPairPresentation(state);

  return (
    <aside className="site00-wssc__authorityRail" aria-label="Authority pair" data-testid="workspace-self-authority-pair">
      <h2 className="site00-wssc__authorityTitle">Authority pair</h2>
      <p className="site00-wssc__muted">Live GPT2/NBP concept previews for each viewport.</p>
      <ViewportAuthorityCard
        preview={mobile}
        onPromote={onPromoteMobile}
        promoteDisabled={!canPromoteMobile}
        promoteLabel="Promote Mobile"
      />
      <ViewportAuthorityCard
        preview={desktop}
        onPromote={onPromoteDesktop}
        promoteDisabled={!canPromoteDesktop}
        promoteLabel="Promote Desktop"
      />
    </aside>
  );
}
