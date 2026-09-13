import {
  resolveDerivationButtonView,
  isFounderInjectedAuthorityPair,
  pairStatusLabel,
  resolveViewportMasterArtifact,
  type DesignPageAuthorityReviewSession,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';
import { resolveDesignPageAuthorityImageSrc } from './designPageAuthorityR3PrototypeUrls.js';

type Props = {
  session: DesignPageAuthorityReviewSession;
  onReplaceViewport: (viewport: 'mobile' | 'desktop') => void;
  onViewViewport: (viewport: 'mobile' | 'desktop') => void;
  onPromoteViewport: (viewport: 'mobile' | 'desktop') => void;
  onLockPair: () => void;
  onGenerateDerivatives?: () => void;
  pairLocked: boolean;
  generating?: boolean;
};

export function DesignPageV3AuthorityPairDock({
  session,
  onReplaceViewport,
  onViewViewport,
  onPromoteViewport,
  onLockPair,
  onGenerateDerivatives,
  pairLocked,
  generating,
}: Props) {
  const pipeline = session.authorityPipeline;
  const mobileSel = pipeline?.viewportSelection.mobile;
  const desktopSel = pipeline?.viewportSelection.desktop;
  const mobileMaster = pipeline?.mobileMaster;
  const desktopMaster = pipeline?.desktopMaster;
  const mobileArt = resolveViewportMasterArtifact(session, 'mobile');
  const desktopArt = resolveViewportMasterArtifact(session, 'desktop');

  const slot = (
    viewport: 'mobile' | 'desktop',
    label: string,
    sel: typeof mobileSel,
    master: typeof mobileMaster,
    art: typeof mobileArt,
  ) => (
    <div className="site00-dw-v3-authority-dock__slot" data-viewport={viewport}>
      <strong>{label}</strong>
      <div className="site00-dw-v3-authority-dock__thumb">
        {art ?
          <img src={resolveDesignPageAuthorityImageSrc(art.storageUrl)} alt={`${label} master preview`} />
        : <span className="site00-dw-v3-authority-dock__empty">EMPTY</span>}
      </div>
      <p className="site00-dw-v3-authority-dock__meta">
        {master ?
          <>
            {master.founderApproved ? 'FOUNDER APPROVED · ' : ''}
            {master.sourceType === 'FOUNDER_ATTACHED_AUTHORITY' ?
              'ATTACHED MASTER'
            : `${master.sourceTerritoryId} · ${master.sourceConceptCandidateId.slice(-8)}`}{' '}
            · v{master.version}
            <br />
            <span className="site00-dw-v3-authority-dock__status">{master.status.replace(/_/g, ' ')}</span>
          </>
        : sel ?
          <>Selected · territory {sel.territoryId}</>
        : 'No selection'}
      </p>
      <div className="site00-dw-v3-authority-dock__slot-actions">
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--compact"
          disabled={!art && !sel}
          onClick={() => onViewViewport(viewport)}
        >
          VIEW
        </button>
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--compact"
          disabled={pairLocked}
          onClick={() => onReplaceViewport(viewport)}
        >
          REPLACE
        </button>
        {!master && sel ?
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--compact site00-dw-v3-btn--primary"
            disabled={pairLocked}
            onClick={() => onPromoteViewport(viewport)}
          >
            PROMOTE
          </button>
        : null}
      </div>
    </div>
  );

  const bothPromoted = Boolean(mobileMaster && desktopMaster);
  const founderInjected = isFounderInjectedAuthorityPair(session);
  const derivationReady =
    session.authorityPipeline?.authorityPair?.derivationStatus === 'READY' ||
    session.authorityPipeline?.authorityPair?.derivationStatus === 'COMPLETE';
  const buttonView = resolveDerivationButtonView(session);

  return (
    <aside className="site00-dw-v3-authority-dock" aria-label="Authority pair selection" data-testid="v3-authority-pair-dock">
      <header className="site00-dw-v3-authority-dock__head">
        <strong>AUTHORITY PAIR{pairLocked ? ' · LOCKED' : ''}</strong>
        <span className="site00-dw-v3-authority-dock__pair-status">{pairStatusLabel(session)}</span>
        {founderInjected ?
          <span className="site00-dw-v3-authority-dock__recovery" data-testid="v3-founder-injection-badge">
            FOUNDER AUTHORITY INJECTION · R5F2
          </span>
        : null}
      </header>
      <div className="site00-dw-v3-authority-dock__grid">
        {slot('mobile', 'MOBILE MASTER', mobileSel, mobileMaster, mobileArt)}
        {slot('desktop', 'DESKTOP MASTER', desktopSel, desktopMaster, desktopArt)}
      </div>
      {pairLocked && (derivationReady || buttonView.state !== 'DISABLED') ?
        <div className="site00-dw-v3-authority-dock__lock">
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-v3-btn--lock"
            data-testid={generating ? 'v3-derivation-generating' : buttonView.testId}
            disabled={buttonView.disabled || generating}
            onClick={() => onGenerateDerivatives?.()}
          >
            {generating ? 'GENERATING DERIVATIVES…' : buttonView.label}
          </button>
          <p className="site00-dw-v3-authority-dock__meta">DERIVATION READY · EXECUTION TRANSLATION · INVENTION NONE</p>
        </div>
      : bothPromoted ?
        <div className="site00-dw-v3-authority-dock__lock">
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-v3-btn--lock"
            disabled={pairLocked}
            onClick={onLockPair}
          >
            LOCK MOBILE + DESKTOP AUTHORITY PAIR
          </button>
        </div>
      : null}
    </aside>
  );
}
