import {
  resolveWorkspaceSelfAuthorityPairPresentation,
  type ViewportAuthorityPreview,
} from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/viewportAuthorityPreview.js';
import { resolveGpt2AuthoritySource } from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/reviewState.js';
import type { WorkspaceSelfWorkflowState } from '../../../../shared/site00-design-workspace-production/workspaceSelfConcept/types.js';
import { resolveCaptureArtifactDisplayUrl } from '../../services/workspaceSelfArtifactStorage';

function ViewportAuthorityCard({
  preview,
  onPromote,
  promoteDisabled,
  promoteLabel,
  onPreviewClick,
}: {
  preview: ViewportAuthorityPreview;
  onPromote?: () => void;
  promoteDisabled?: boolean;
  promoteLabel?: string;
  onPreviewClick?: () => void;
}) {
  const src = preview.imageRef ? resolveCaptureArtifactDisplayUrl(preview.imageRef) : null;
  const pendingSrc = preview.pendingImageRef ? resolveCaptureArtifactDisplayUrl(preview.pendingImageRef) : null;

  return (
    <div className="site00-wssc__authorityCard" data-viewport={preview.viewport} data-state={preview.state}>
      <div className="site00-wssc__authorityCardHead">
        <strong>{preview.titleLabel}</strong>
        <span className="site00-wssc__authorityPill">{preview.statePill}</span>
      </div>
      <p className="site00-wssc__muted">
        {preview.conceptSlot ?? '—'} · {preview.versionLabel.slice(0, 24)}
      </p>
      {preview.pendingConceptSlot ?
        <p className="site00-wssc__pendingNote">
          Current authority: {preview.authorityConceptSlot} · Pending selection: {preview.pendingConceptSlot}
        </p>
      : null}
      <button
        type="button"
        className="site00-wssc__authorityThumbBtn"
        onClick={onPreviewClick}
        aria-label={`Open ${preview.viewport} authority preview`}
      >
        <div className="site00-wssc__authorityThumbFrame" data-empty={preview.state === 'EMPTY' ? 'true' : 'false'}>
          {src ?
            <img src={src} alt={`${preview.viewport} concept preview`} className="site00-wssc__authorityThumb" />
          : <p className="site00-wssc__authorityEmpty">{preview.emptyMessage ?? 'No preview'}</p>}
        </div>
      </button>
      {preview.pendingConceptSlot && pendingSrc ?
        <div className="site00-wssc__pendingThumb">
          <span className="site00-wssc__muted">Pending</span>
          <img src={pendingSrc} alt="" className="site00-wssc__authorityThumb" />
        </div>
      : null}
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
  onViewportClick,
}: {
  state: WorkspaceSelfWorkflowState;
  onPromoteMobile: () => void;
  onPromoteDesktop: () => void;
  canPromoteMobile: boolean;
  canPromoteDesktop: boolean;
  onViewportClick: (viewport: 'MOBILE' | 'DESKTOP') => void;
}) {
  const { mobile, desktop } = resolveWorkspaceSelfAuthorityPairPresentation(state);
  const { gpt2AuthorityConcept } = resolveGpt2AuthoritySource(state);
  const gpt2Src =
    gpt2AuthorityConcept?.authorityImage ?
      resolveCaptureArtifactDisplayUrl(gpt2AuthorityConcept.authorityImage)
    : null;

  return (
    <aside className="site00-wssc__authorityRail" aria-label="Authority pair" data-testid="workspace-self-authority-pair">
      <h2 className="site00-wssc__authorityTitle">Authority pair</h2>
      <p className="site00-wssc__muted">Selected NBP rendition per viewport (from one GPT2 concept).</p>
      {gpt2AuthorityConcept ?
        <details className="site00-wssc__gpt2Source" data-testid="workspace-self-gpt2-source">
          <summary>GPT2 concept source</summary>
          <p className="site00-wssc__muted">{gpt2AuthorityConcept.name}</p>
          {gpt2Src ?
            <img src={gpt2Src} alt="" className="site00-wssc__authorityThumb" />
          : <p className="site00-wssc__muted">Authority image pending provider run.</p>}
        </details>
      : null}
      <ViewportAuthorityCard
        preview={mobile}
        onPromote={onPromoteMobile}
        promoteDisabled={!canPromoteMobile}
        promoteLabel="Promote Mobile"
        onPreviewClick={() => onViewportClick('MOBILE')}
      />
      <ViewportAuthorityCard
        preview={desktop}
        onPromote={onPromoteDesktop}
        promoteDisabled={!canPromoteDesktop}
        promoteLabel="Promote Desktop"
        onPreviewClick={() => onViewportClick('DESKTOP')}
      />
    </aside>
  );
}
