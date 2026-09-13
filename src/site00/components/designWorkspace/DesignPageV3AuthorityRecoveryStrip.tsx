import {
  AUTHORITY_IMAGE_DISPLAY_BROKEN_ISSUE_ID,
  DESIGN_WORKSPACE_FEATURE_MANIFEST_V1,
  resolveDerivationButtonView,
  getProjectCreativeContextVersion,
  masterAmendmentStatusLabel,
  P0_VR_TWIN_V30R5F2_LINEAGE,
  type DesignPageAuthorityReviewSession,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrTwinV30/index.js';

type Props = {
  session: DesignPageAuthorityReviewSession;
  onGenerateDerivatives: () => void;
  generating?: boolean;
};

function statusRow(label: string, value: string, testId?: string) {
  return (
    <div className="site00-dw-v3-authority-recovery__row" data-testid={testId}>
      <span className="site00-dw-v3-authority-recovery__label">{label}</span>
      <strong className="site00-dw-v3-authority-recovery__value">{value}</strong>
    </div>
  );
}

/** Always-visible post-R5F2 state — mobile-first; dock toggle hides GENERATE DERIVATIVES on phone. */
export function DesignPageV3AuthorityRecoveryStrip({ session, onGenerateDerivatives, generating }: Props) {
  const pipeline = session.authorityPipeline;
  const receipt = pipeline?.founderAuthorityInjectionReceipt;
  if (receipt?.status !== 'PASS') return null;

  const pairLocked = pipeline?.authorityPair?.status === 'PAIR_LOCKED';
  const derivationReady =
    pipeline?.authorityPair?.derivationStatus === 'READY' || pipeline?.authorityPair?.derivationStatus === 'COMPLETE';
  const buttonView = resolveDerivationButtonView(session);
  const showPrimary =
    buttonView.state === 'GENERATE_DERIVATIVES' ||
    buttonView.state === 'REVIEW_DERIVATIVES' ||
    buttonView.state === 'RESOLVE_BLOCKERS' ||
    buttonView.state === 'DERIVATION_FAILED';
  const mobile = pipeline?.mobileMaster;
  const desktop = pipeline?.desktopMaster;
  const contextVersion = getProjectCreativeContextVersion(session);
  const manifestLabel = masterAmendmentStatusLabel(mobile);

  return (
    <section
      className="site00-dw-v3-authority-recovery"
      aria-label="Founder authority recovery status"
      data-testid="v3-r5f2-recovery-strip"
    >
      <header className="site00-dw-v3-authority-recovery__head">
        <strong>{P0_VR_TWIN_V30R5F2_LINEAGE}</strong>
        <span>ONE-TIME FOUNDER AUTHORITY INJECTION</span>
      </header>
      <div className="site00-dw-v3-authority-recovery__grid">
        {statusRow('AUTHORITY PAIR', pairLocked ? 'LOCKED' : 'NOT LOCKED', 'v3-recovery-pair-locked')}
        {statusRow(
          'MOBILE MASTER',
          mobile?.founderApproved ? 'FOUNDER APPROVED' : (mobile?.status ?? 'MISSING'),
          'v3-recovery-mobile-approved',
        )}
        {statusRow(
          'DESKTOP MASTER',
          desktop?.founderApproved ? 'FOUNDER APPROVED' : (desktop?.status ?? 'MISSING'),
          'v3-recovery-desktop-approved',
        )}
        {statusRow('FEATURE MANIFEST', manifestLabel, 'v3-recovery-feature-manifest')}
        {statusRow('PROJECT CONTEXT', contextVersion.toUpperCase(), 'v3-recovery-project-context')}
        {statusRow(
          'DERIVATION',
          derivationReady ? 'READY' : 'BLOCKED',
          'v3-recovery-derivation-status',
        )}
      </div>
      {pipeline?.authorityImageDisplayIssue?.status === 'OPEN' ?
        <p className="site00-dw-v3-authority-recovery__issue" data-testid="v3-recovery-broken-image-open">
          {AUTHORITY_IMAGE_DISPLAY_BROKEN_ISSUE_ID} · OPEN — batch gallery fix is separate; injected masters below
          in PAIR REVIEW use founder JPGs ({DESIGN_WORKSPACE_FEATURE_MANIFEST_V1}).
        </p>
      : null}
      {pairLocked && (derivationReady || showPrimary) ?
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-v3-authority-recovery__primary"
          data-testid={generating ? 'v3-derivation-generating' : buttonView.testId}
          disabled={buttonView.disabled || generating}
          onClick={onGenerateDerivatives}
        >
          {generating ? 'GENERATING DERIVATIVES…' : buttonView.label}
        </button>
      : null}
    </section>
  );
}
