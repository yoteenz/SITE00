/**
 * P0.VR.UPGRADE.1 + UPGRADE.2 — Page upgrade + twin reconstruction workflow.
 */

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DesignViewportClass } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import type {
  PageCreativeUpgradeSession,
  PageVisualDiagnosis,
  ReconstructionPlan,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/types.js';
import type { ReconstructionTwinSession } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import { canPromote } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/promotionReadiness.js';
import { setPageCreativeUpgradeFounderNote } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageCreativeUpgradeSession.js';
import { DesignTaskWizardShell } from '../wizard/DesignTaskWizardShell';
import {
  AllForensicsOverlay,
  ForensicEvidenceDetailOverlay,
  resolveAllRegionForensics,
} from './ForensicEvidenceOverlays.js';
import { ForensicStructureOverlay } from './ForensicStructureOverlay.js';
import {
  evaluateTwinBuildReadiness,
  founderMayApproveDirectionWithWarnings,
  founderMayBuildTwin,
  resolveUpgradeWorkflowState,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrConverge1/index.js';
import { stashTwinSessionForPreview } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/twinPreviewHandoff.js';
import { formatProvenanceScore } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrRebuild1/fidelityScoreProvenance.js';
import '../../../styles/site00-reconstruction-twin.css';

type CompareMode = 'current' | 'authority' | 'overlay';
type ReviewMode = 'before' | 'after' | 'authority';
type TwinReviewMode = 'before' | 'twin' | 'authority';

type Props = {
  open: boolean;
  session: PageCreativeUpgradeSession;
  pageLabel: string;
  route: string;
  currentScreenshot: string | null;
  authorityScreenshot: string | null;
  onApprove: () => void;
  onRevise: () => void;
  onBack: () => void;
  onVerify?: () => void;
  afterScreenshot?: string | null;
  visualDiagnosis?: PageVisualDiagnosis | null;
  reconstructionPlan?: ReconstructionPlan | null;
  twinSession?: ReconstructionTwinSession | null;
  onBuildTwin?: () => void;
  onPreviewTwin?: () => void;
  onRefineTwin?: (instruction: string) => void;
  onApprovePromotion?: () => void;
  onPromote?: () => void;
  buildingTwin?: boolean;
  onRecomputeForensics?: () => void;
  forensicsRecomputing?: boolean;
  forensicsRecomputeError?: string | null;
  onAnalyzeMissingEvidence?: () => void;
  evidenceRecoveryRunning?: boolean;
  evidenceRecoveryError?: string | null;
  onAnalyzeRegionStructure?: (regionId: string) => void;
};

function useIsMobileViewport(): boolean {
  const [mobile, setMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false,
  );
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const fn = () => setMobile(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return mobile;
}

export function PageCreativeUpgradePanel({
  open,
  session,
  pageLabel,
  route,
  currentScreenshot,
  authorityScreenshot,
  onApprove,
  onRevise,
  onBack,
  onVerify,
  afterScreenshot,
  visualDiagnosis,
  reconstructionPlan,
  twinSession,
  onBuildTwin,
  onPreviewTwin,
  onRefineTwin,
  onApprovePromotion,
  onPromote,
  buildingTwin,
  onRecomputeForensics,
  forensicsRecomputing,
  forensicsRecomputeError,
  onAnalyzeMissingEvidence,
  evidenceRecoveryRunning,
  evidenceRecoveryError,
  onAnalyzeRegionStructure,
}: Props) {
  const isMobile = useIsMobileViewport();
  const [compareMode, setCompareMode] = useState<CompareMode>('current');
  const [reviewMode, setReviewMode] = useState<ReviewMode>('after');
  const [twinReviewMode, setTwinReviewMode] = useState<TwinReviewMode>('twin');
  const [overlayMix, setOverlayMix] = useState(50);
  const [founderNote, setFounderNote] = useState(session.founderNote ?? '');
  const [noteOpen, setNoteOpen] = useState(false);
  const [refineOpen, setRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState('');
  const [promotionConfirmOpen, setPromotionConfirmOpen] = useState(false);
  const [evidenceId, setEvidenceId] = useState<string | null>(null);
  const [allForensicsOpen, setAllForensicsOpen] = useState(false);
  const [evidenceRegionId, setEvidenceRegionId] = useState<string | null>(null);
  const [structureRegionId, setStructureRegionId] = useState<string | null>(null);
  const [forensicsDetailsOpen, setForensicsDetailsOpen] = useState(true);
  const [twinLinkCopied, setTwinLinkCopied] = useState(false);

  const twinPreviewAbsoluteUrl = useMemo(() => {
    if (!twinSession?.twinRoute || typeof window === 'undefined') return null;
    return `${window.location.origin}${twinSession.twinRoute}`;
  }, [twinSession?.twinRoute]);

  const workflow = useMemo(
    () => resolveUpgradeWorkflowState({ session, twinSession }),
    [session, twinSession],
  );

  const showTwinReview =
    twinSession &&
    ['READY_FOR_REVIEW', 'REVISION_REQUESTED', 'REVISING', 'APPROVED_FOR_PROMOTION', 'VERIFYING'].includes(
      twinSession.status,
    );
  const showPostBuild =
    twinSession?.status === 'PROMOTED' ||
    (session.status === 'COMPLETE' && Boolean(afterScreenshot) && !twinSession);
  const diagnosis = visualDiagnosis ?? session.visualDiagnosis;
  const plan = reconstructionPlan ?? session.reconstructionPlan;

  const missingCurrent = !session.beforeImageRenderable || !currentScreenshot;
  const missingAuthority = !session.referenceImageRenderable || !authorityScreenshot;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onBack]);

  const headline = useMemo(() => {
    if (twinSession?.status === 'PROMOTED') return 'LIVE AFTER VS DESIGN AUTHORITY';
    if (showTwinReview) return 'TWIN VS DESIGN AUTHORITY';
    if (showPostBuild) return 'AFTER VS DESIGN AUTHORITY';
    if (session.status === 'DIRECTION_APPROVED') return 'DIRECTION APPROVED';
    return 'CURRENT VS DESIGN AUTHORITY';
  }, [showPostBuild, showTwinReview, session.status, twinSession?.status]);

  const twinReadiness = useMemo(
    () =>
      evaluateTwinBuildReadiness({
        diagnosis,
        safety: {
          authorityReady: !missingAuthority && Boolean(session.designAuthorityVersionId),
          captureReady: !missingCurrent && Boolean(session.captureId),
          routeReady: Boolean(route),
          viewportReady: Boolean(session.viewport),
          canonicalRoute: route,
          expectedRoute: session.route ?? route,
          functionContractReady: true,
        },
      }),
    [diagnosis, missingAuthority, missingCurrent, route, session.captureId, session.designAuthorityVersionId, session.route, session.viewport],
  );

  const hardForensicBlock = twinReadiness.hardBlockers.length > 0;
  const mayProceedWithWarning =
    diagnosis?.forensicCoverage?.founderMayProceedWithWarning === true || twinReadiness.status === 'READY_WITH_WARNINGS';
  const regionForensicsCount = resolveAllRegionForensics(diagnosis).length;

  useEffect(() => {
    if (showTwinReview || workflow.state === 'READY_TO_BUILD_TWIN') setForensicsDetailsOpen(false);
  }, [showTwinReview, workflow.state]);

  const primaryAction = useMemo(() => {
    if (session.status === 'DIRECTION_READY') {
      const canApprove = founderMayApproveDirectionWithWarnings(twinReadiness);
      return {
        label: hardForensicBlock ? 'FORENSICS INCOMPLETE' : mayProceedWithWarning ? 'APPROVE DIRECTION' : 'APPROVE DIRECTION',
        onClick: onApprove,
        disabled: missingCurrent || missingAuthority || !canApprove,
      };
    }
    if (twinSession?.status === 'PLANNED' || twinSession?.status === 'FAILED') {
      const canBuild = founderMayBuildTwin(twinReadiness) || mayProceedWithWarning;
      return {
        label: 'BUILD TWIN NOW',
        onClick: onBuildTwin ?? (() => {}),
        disabled: !onBuildTwin || buildingTwin || !canBuild,
      };
    }
    if (session.status === 'DIRECTION_APPROVED' && !twinSession) {
      const canBuild = founderMayBuildTwin(twinReadiness);
      return {
        label: mayProceedWithWarning ? 'BUILD TWIN NOW' : 'BUILD TWIN',
        onClick: onBuildTwin ?? (() => {}),
        disabled: !onBuildTwin || buildingTwin || !canBuild,
      };
    }
    if (twinSession?.status === 'BUILDING' || buildingTwin) {
      return { label: 'BUILDING TWIN…', onClick: () => {}, disabled: true };
    }
    if (twinSession && ['READY_FOR_REVIEW', 'REVISION_REQUESTED', 'REVISING'].includes(twinSession.status)) {
      return { label: 'PREVIEW TWIN', onClick: onPreviewTwin ?? (() => {}), disabled: !onPreviewTwin };
    }
    if (twinSession?.status === 'APPROVED_FOR_PROMOTION') {
      return { label: 'PROMOTE TO LIVE', onClick: () => setPromotionConfirmOpen(true), disabled: !onPromote };
    }
    if (session.status === 'DIRECTION_APPROVED' && onVerify) {
      return { label: 'VERIFY BUILD', onClick: onVerify };
    }
    return undefined;
  }, [
    session.status,
    twinSession,
    onApprove,
    onBuildTwin,
    onPreviewTwin,
    onPromote,
    onVerify,
    buildingTwin,
    missingCurrent,
    missingAuthority,
    hardForensicBlock,
    mayProceedWithWarning,
    twinReadiness,
  ]);

  const secondaryAction = useMemo(() => {
    if (session.status === 'DIRECTION_READY') {
      return { label: 'REVISE', onClick: onRevise };
    }
    if (twinSession?.status === 'PLANNED') {
      return {
        label: 'REVIEW PLAN',
        onClick: () => {
          document.querySelector('.site00-pfw-upgrade-v2__plan')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        },
      };
    }
    if (session.status === 'DIRECTION_APPROVED' && !twinSession && mayProceedWithWarning && onAnalyzeMissingEvidence) {
      return { label: 'CONTINUE FORENSICS', onClick: onAnalyzeMissingEvidence };
    }
    if (twinSession && ['READY_FOR_REVIEW', 'REVISION_REQUESTED'].includes(twinSession.status)) {
      return { label: 'REFINE TWIN', onClick: () => setRefineOpen(true) };
    }
    return undefined;
  }, [session.status, twinSession, onRevise, mayProceedWithWarning, onAnalyzeMissingEvidence]);

  if (!open) return null;

  const renderPreview = (src: string | null, label: string, sublabel: string) => (
    <figure className="site00-pfw-upgrade-v2__preview">
      <figcaption>
        <strong>{label}</strong>
        <span>{sublabel}</span>
      </figcaption>
      {src ? (
        <img src={src} alt={label} className="site00-pfw-upgrade-v2__img" />
      ) : (
        <div className="site00-pfw-upgrade-v2__empty">PREVIEW UNAVAILABLE</div>
      )}
    </figure>
  );

  const renderCompareControls = () => (
    <div className="site00-pfw-upgrade-v2__tabs" role="tablist" aria-label="Compare sources">
      {(['current', 'authority', 'overlay'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-selected={compareMode === mode}
          className={`site00-pfw-upgrade-v2__tab${compareMode === mode ? ' is-active' : ''}`}
          onClick={() => setCompareMode(mode)}
        >
          {mode === 'current' ? 'CURRENT' : mode === 'authority' ? 'AUTHORITY' : 'COMPARE'}
        </button>
      ))}
    </div>
  );

  const renderTwinReviewControls = () => (
    <div className="site00-pfw-upgrade-v2__tabs" role="tablist" aria-label="Twin review">
      {(['before', 'twin', 'authority'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-selected={twinReviewMode === mode}
          className={`site00-pfw-upgrade-v2__tab${twinReviewMode === mode ? ' is-active' : ''}`}
          onClick={() => setTwinReviewMode(mode)}
        >
          {mode.toUpperCase()}
        </button>
      ))}
    </div>
  );

  const renderReviewControls = () => (
    <div className="site00-pfw-upgrade-v2__tabs" role="tablist" aria-label="Post-build review">
      {(['before', 'after', 'authority'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          role="tab"
          aria-selected={reviewMode === mode}
          className={`site00-pfw-upgrade-v2__tab${reviewMode === mode ? ' is-active' : ''}`}
          onClick={() => setReviewMode(mode)}
        >
          {mode.toUpperCase()}
        </button>
      ))}
    </div>
  );

  const renderVisualCompare = () => {
    if (showTwinReview && !showPostBuild) {
      const twinPlaceholder = twinSession?.twinCapture?.imageRef ?? null;
      const src =
        twinReviewMode === 'before'
          ? currentScreenshot
          : twinReviewMode === 'twin'
            ? twinPlaceholder ?? currentScreenshot
            : authorityScreenshot;
      const label =
        twinReviewMode === 'before' ? 'BEFORE' : twinReviewMode === 'twin' ? 'TWIN' : 'DESIGN AUTHORITY';
      const sub =
        twinReviewMode === 'authority'
          ? 'APPROVED REFERENCE'
          : twinReviewMode === 'twin'
            ? 'RECONSTRUCTION CANDIDATE'
            : 'LIVE IMPLEMENTATION';
      return (
        <>
          {renderTwinReviewControls()}
          {renderPreview(src, label, sub)}
          {twinSession ? (
            <p className="site00-pfw-upgrade-v2__twin-route">
              TWIN ROUTE: <code>{twinSession.twinRoute}</code>
            </p>
          ) : null}
        </>
      );
    }

    if (showPostBuild) {
      const src =
        reviewMode === 'before'
          ? currentScreenshot
          : reviewMode === 'after'
            ? afterScreenshot ?? null
            : authorityScreenshot;
      const label =
        reviewMode === 'before' ? 'BEFORE' : reviewMode === 'after' ? 'AFTER' : 'DESIGN AUTHORITY';
      const sub =
        reviewMode === 'authority' ? 'APPROVED REFERENCE' : reviewMode === 'after' ? 'LIVE IMPLEMENTATION' : 'LIVE IMPLEMENTATION';
      return (
        <>
          {renderReviewControls()}
          {renderPreview(src, label, sub)}
        </>
      );
    }

    if (missingCurrent || missingAuthority) {
      return (
        <div className="site00-pfw-upgrade-v2__block">
          {missingCurrent ? <p>LIVE CAPTURE REQUIRED — RECAPTURE THIS PAGE.</p> : null}
          {missingAuthority ? <p>DESIGN AUTHORITY REQUIRED — SET APPROVED REFERENCE.</p> : null}
        </div>
      );
    }

    if (isMobile) {
      return (
        <>
          {renderCompareControls()}
          {compareMode === 'overlay' ? (
            <div className="site00-pfw-upgrade-v2__overlay">
              {renderPreview(currentScreenshot, 'CURRENT', 'LIVE IMPLEMENTATION')}
              <div
                className="site00-pfw-upgrade-v2__overlay-reveal"
                style={{ clipPath: `inset(0 ${100 - overlayMix}% 0 0)` }}
              >
                <img src={authorityScreenshot!} alt="" aria-hidden className="site00-pfw-upgrade-v2__img" />
              </div>
              <label className="site00-pfw-upgrade-v2__slider">
                Overlay mix
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={overlayMix}
                  onChange={(e) => setOverlayMix(Number(e.target.value))}
                />
              </label>
            </div>
          ) : compareMode === 'authority' ? (
            renderPreview(authorityScreenshot, 'DESIGN AUTHORITY', 'APPROVED REFERENCE')
          ) : (
            renderPreview(currentScreenshot, 'CURRENT', 'LIVE IMPLEMENTATION')
          )}
        </>
      );
    }

    if (compareMode === 'overlay') {
      return (
        <>
          {renderCompareControls()}
          <div className="site00-pfw-upgrade-v2__overlay site00-pfw-upgrade-v2__overlay--desktop">
            {renderPreview(currentScreenshot, 'CURRENT', 'LIVE IMPLEMENTATION')}
            <div
              className="site00-pfw-upgrade-v2__overlay-reveal"
              style={{ clipPath: `inset(0 ${100 - overlayMix}% 0 0)` }}
            >
              <img src={authorityScreenshot!} alt="" aria-hidden className="site00-pfw-upgrade-v2__img" />
            </div>
            <label className="site00-pfw-upgrade-v2__slider">
              Overlay mix
              <input
                type="range"
                min={0}
                max={100}
                value={overlayMix}
                onChange={(e) => setOverlayMix(Number(e.target.value))}
              />
            </label>
          </div>
        </>
      );
    }

    return (
      <>
        {renderCompareControls()}
        <div className="site00-pfw-upgrade-v2__side-by-side">
          {renderPreview(currentScreenshot, 'CURRENT', 'LIVE IMPLEMENTATION')}
          {renderPreview(authorityScreenshot, 'DESIGN AUTHORITY', 'APPROVED REFERENCE')}
        </div>
      </>
    );
  };

  return createPortal(
    <div className="site00-dw-wizard-drawer" data-open="true" role="presentation">
      <button type="button" className="site00-dw-wizard-drawer__backdrop" aria-label="Close page upgrade" onClick={onBack} />
      <aside className="site00-dw-wizard-drawer__panel site00-pfw-upgrade-drawer" role="dialog" aria-modal="true" aria-label="Page upgrade">
        <header className="site00-dw-wizard-drawer__head">
          <div className="site00-pfw-upgrade-v2__header-meta">
            <strong>PAGE UPGRADE</strong>
            <span>{pageLabel.toUpperCase()}</span>
            <span>{route}</span>
            <span>{session.viewport.toUpperCase()}</span>
          </div>
          <button type="button" className="site00-dw-wizard-drawer__close" onClick={onBack} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="site00-dw-wizard-drawer__body">
          <DesignTaskWizardShell
            stepTitle="PAGE UPGRADE"
            headline={headline}
            support="Match the approved design authority while preserving the live page function."
            statusLabel={`STATUS: ${workflow.founderStatusLabel}${workflow.twinStatusLabel ? ` · TWIN: ${workflow.twinStatusLabel}` : ''}`}
            onBack={onBack}
            transitionKey={`upgrade-${session.sessionId}-${session.forensicsRecalculatedAt ?? 'initial'}`}
            visual={<span className="site00-pfw-upgrade-v2__visual-spacer" aria-hidden />}
            primaryAction={primaryAction}
            secondaryAction={secondaryAction}
          >
            <div className="site00-pfw-upgrade-v2">
              {session.status === 'DIRECTION_APPROVED' && twinSession?.status === 'PLANNED' ? (
                <p className="site00-pfw-upgrade-v2__approved">DIRECTION APPROVED ✓ — LIVE PAGE UNCHANGED</p>
              ) : null}
              {twinSession?.status === 'READY_FOR_REVIEW' ? (
                <p className="site00-pfw-upgrade-v2__approved">TWIN READY ✓</p>
              ) : null}
              {twinSession?.visualAuthorityStatus === 'FAILED_VISUAL_AUTHORITY' ||
              twinSession?.visualAuthorityStatus === 'VISUAL_AUTHORITY_FAILED' ? (
                <p className="site00-pfw-upgrade-v2__twin-warning">
                  FAILED VISUAL AUTHORITY — patch-based twin retained for debug. Rebuild to authority-first composition;
                  promotion disabled.
                </p>
              ) : null}
              {twinSession?.reconstructionStrategy === 'REBUILD_FROM_AUTHORITY' ? (
                <p className="site00-pfw-upgrade-v2__approved">AUTHORITY-FIRST TWIN · {twinSession.twinRenderMode ?? 'REBUILD'}</p>
              ) : null}
              {twinPreviewAbsoluteUrl &&
              twinSession &&
              ['READY_FOR_REVIEW', 'REVISION_REQUESTED', 'REVISING', 'APPROVED_FOR_PROMOTION'].includes(
                twinSession.status,
              ) ? (
                <section className="site00-pfw-upgrade-v2__twin-link">
                  <h3>TWIN DEBUG LINK</h3>
                  <p className="site00-pfw-upgrade-v2__twin-link-url">
                    <a href={twinPreviewAbsoluteUrl}>{twinPreviewAbsoluteUrl}</a>
                  </p>
                  <div className="site00-pfw-upgrade-v2__twin-link-actions">
                    <button
                      type="button"
                      className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-v3-btn--compact"
                      onClick={() => {
                        stashTwinSessionForPreview(twinSession);
                        window.location.assign(twinPreviewAbsoluteUrl);
                      }}
                    >
                      OPEN TWIN
                    </button>
                    <button
                      type="button"
                      className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
                      onClick={async () => {
                        stashTwinSessionForPreview(twinSession);
                        try {
                          await navigator.clipboard.writeText(twinPreviewAbsoluteUrl);
                          setTwinLinkCopied(true);
                          window.setTimeout(() => setTwinLinkCopied(false), 2500);
                        } catch {
                          window.prompt('COPY TWIN LINK:', twinPreviewAbsoluteUrl);
                        }
                      }}
                    >
                      {twinLinkCopied ? 'COPIED ✓' : 'COPY LINK'}
                    </button>
                  </div>
                  <p className="site00-pfw-upgrade-v2__twin-link-hint">
                    Open on this same phone/browser after TWIN READY — the link includes your private session id.
                  </p>
                </section>
              ) : null}
              {twinSession && (twinSession.status === 'BUILDING' || buildingTwin) ? (
                <ul className="site00-pfw-upgrade-v2__twin-progress">
                  {twinSession.buildSteps.map((step) => (
                    <li
                      key={step.step}
                      className={
                        step.status === 'COMPLETE'
                          ? 'is-complete'
                          : step.status === 'RUNNING'
                            ? 'is-running'
                            : undefined
                      }
                    >
                      <span>{step.step.replace(/_/g, ' ')}</span>
                      <span>{step.status}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {mayProceedWithWarning && !showTwinReview && session.status !== 'DIRECTION_READY' ? (
                <section className="site00-pfw-upgrade-v2__twin-warning">
                  <h3>FORENSIC WARNING</h3>
                  <p>
                    Forensic depth is incomplete. SITE 00 can still build an isolated twin using the best available
                    evidence. Unresolved regions may need visual refinement. Live will not change.
                  </p>
                  {twinReadiness.warnings.slice(0, 2).map((w) => (
                    <p key={w} className="site00-pfw-upgrade-v2__coverage-warn">
                      {w}
                    </p>
                  ))}
                </section>
              ) : null}

              {renderVisualCompare()}

              {diagnosis?.forensicCoverage ? (
                <section
                  className={`site00-pfw-upgrade-v2__coverage site00-pfw-upgrade-v2__coverage--${diagnosis.forensicCoverage.gateStatus.toLowerCase()}${forensicsRecomputing ? ' site00-pfw-upgrade-v2__coverage--recalculating' : ''}${session.forensicsRecalculatedAt ? ' site00-pfw-upgrade-v2__coverage--fresh' : ''}${!forensicsDetailsOpen ? ' site00-pfw-upgrade-v2__coverage--collapsed' : ''}`}
                >
                  <div className="site00-pfw-upgrade-v2__coverage-head">
                    <h3>{showTwinReview ? 'FORENSIC DETAILS' : 'FORENSIC COVERAGE'}</h3>
                    {showTwinReview ? (
                      <button
                        type="button"
                        className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
                        onClick={() => setForensicsDetailsOpen((v) => !v)}
                      >
                        {forensicsDetailsOpen ? 'HIDE DETAILS' : 'SHOW DETAILS'}
                      </button>
                    ) : null}
                  </div>
                  {forensicsDetailsOpen ? (
                    <>
                  <p className="site00-pfw-upgrade-v2__coverage-summary">
                    REGION COVERAGE {diagnosis.forensicCoverage.majorAccounted} / {diagnosis.forensicCoverage.majorTotal}
                    · MEASUREMENT DEPTH {diagnosis.forensicCoverage.majorSufficientDepth ?? '—'} /{' '}
                    {diagnosis.forensicCoverage.majorTotal} SUFFICIENT ({diagnosis.forensicCoverage.measurementDepthPct}%)
                    {diagnosis.forensicCoverage.ambiguousCount > 0
                      ? ` · ${diagnosis.forensicCoverage.ambiguousCount} AMBIGUOUS`
                      : ''}
                  </p>
                  <p className="site00-pfw-upgrade-v2__coverage-gate">
                    {diagnosis.forensicCoverage.gateStatus}: {diagnosis.forensicCoverage.gateReason}
                  </p>
                  {diagnosis.forensicCoverage.depthGateStatus ? (
                    <p className="site00-pfw-upgrade-v2__coverage-gate">
                      DEPTH {diagnosis.forensicCoverage.depthGateStatus}: {diagnosis.forensicCoverage.depthGateReason}
                    </p>
                  ) : null}
                  {diagnosis.forensicCoverage.forensicConsistencyStatus === 'FORENSIC_STATE_INCONSISTENT' ? (
                    <p className="site00-pfw-upgrade-v2__coverage-warn">
                      FORENSIC STATE INCONSISTENT — RECALCULATE FORENSICS (no new capture required).
                    </p>
                  ) : null}
                  {(diagnosis.forensicCoverage.depthGateStatus === 'BLOCK' ||
                    diagnosis.forensicCoverage.depthGateStatus === 'WARNING') &&
                  onAnalyzeMissingEvidence ? (
                    <>
                      <p className="site00-pfw-upgrade-v2__coverage-warn">
                        BLOCKING REGIONS{' '}
                        {Math.max(
                          0,
                          (diagnosis.forensicCoverage.majorTotal ?? 0) -
                            (diagnosis.forensicCoverage.majorSufficientDepth ?? 0),
                        )}
                      </p>
                      <button
                        type="button"
                        className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-v3-btn--compact"
                        onClick={onAnalyzeMissingEvidence}
                        disabled={evidenceRecoveryRunning || forensicsRecomputing}
                        aria-busy={evidenceRecoveryRunning}
                      >
                        {evidenceRecoveryRunning ? 'ANALYZING MISSING EVIDENCE…' : 'ANALYZE MISSING EVIDENCE'}
                      </button>
                      {session.lastEvidenceRecoverySummary ? (
                        <p className="site00-pfw-upgrade-v2__coverage-recalc-ok">
                          RECOVERY {session.lastEvidenceRecoverySummary.status.replace(/_/g, ' ')} · DEPTH{' '}
                          {session.lastEvidenceRecoverySummary.depthBeforePct}% →{' '}
                          {session.lastEvidenceRecoverySummary.depthAfterPct}%
                          {session.lastEvidenceRecoverySummary.regionsImproved.length
                            ? ` · ${session.lastEvidenceRecoverySummary.regionsImproved.length} IMPROVED`
                            : ''}
                          {session.lastEvidenceRecoverySummary.rootCauseSummary &&
                          session.lastEvidenceRecoverySummary.status === 'NO_PROGRESS'
                            ? ` · ${session.lastEvidenceRecoverySummary.rootCauseSummary}`
                            : ''}
                        </p>
                      ) : null}
                      {session.lastEvidenceRecoverySummary?.structureToDepthTraces?.length ? (
                        <ul className="site00-pfw-upgrade-v2__recovery-transitions site00-pfw-structure-trace-list">
                          {session.lastEvidenceRecoverySummary.structureToDepthTraces.map((t) => (
                            <li key={t.regionId}>
                              <strong>{t.regionName}</strong> · {t.resolvedAnchors.length} anchors ·{' '}
                              {t.generatedMeasurements.length} generated · {t.qualifiedDimensions.length} qualified ·{' '}
                              {t.depthBefore} → {t.depthAfter}
                              {t.blockingReason ? ` · ${t.blockingReason}` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      {session.lastEvidenceRecoverySummary?.regionsImproved.length ? (
                        <ul className="site00-pfw-upgrade-v2__recovery-transitions">
                          {session.lastEvidenceRecoverySummary.regionsImproved.map((id) => (
                            <li key={id}>{id.split('.').pop()?.toUpperCase() ?? id} · SHALLOW → SUFFICIENT</li>
                          ))}
                        </ul>
                      ) : null}
                      {evidenceRecoveryError ? (
                        <p className="site00-pfw-upgrade-v2__coverage-warn">{evidenceRecoveryError}</p>
                      ) : null}
                    </>
                  ) : null}
                  {onRecomputeForensics ? (
                    <>
                      <button
                        type="button"
                        className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
                        onClick={onRecomputeForensics}
                        disabled={forensicsRecomputing || evidenceRecoveryRunning}
                        aria-busy={forensicsRecomputing}
                      >
                        {forensicsRecomputing ? 'RECALCULATING FORENSICS…' : 'RECALCULATE FORENSICS'}
                      </button>
                      {session.forensicsRecalculatedAt ? (
                        <p className="site00-pfw-upgrade-v2__coverage-recalc-ok">
                          FORENSICS UPDATED ·{' '}
                          {new Date(session.forensicsRecalculatedAt).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </p>
                      ) : null}
                      {forensicsRecomputeError ? (
                        <p className="site00-pfw-upgrade-v2__coverage-warn">{forensicsRecomputeError}</p>
                      ) : null}
                    </>
                  ) : null}
                  {diagnosis.forensicCoverage.scopeMismatch ? (
                    <p className="site00-pfw-upgrade-v2__coverage-warn">
                      CURRENT CAPTURE SCOPE INSUFFICIENT — FULL-PAGE CAPTURE REQUIRED FOR COMPLETE ANALYSIS.
                    </p>
                  ) : null}
                  {diagnosis.forensicCoverage.missingCurrent.length ? (
                    <p className="site00-pfw-upgrade-v2__coverage-missing">
                      MISSING FROM CURRENT: {diagnosis.forensicCoverage.missingCurrent.join(' · ')}
                    </p>
                  ) : null}
                  {regionForensicsCount > 0 ? (
                    <button
                      type="button"
                      className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
                      onClick={() => setAllForensicsOpen(true)}
                    >
                      VIEW ALL FORENSICS
                    </button>
                  ) : null}
                    </>
                  ) : null}
                </section>
              ) : regionForensicsCount > 0 ? (
                <section className="site00-pfw-upgrade-v2__coverage">
                  <h3>FORENSIC COVERAGE</h3>
                  <button
                    type="button"
                    className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
                    onClick={() => setAllForensicsOpen(true)}
                  >
                    VIEW ALL FORENSICS
                  </button>
                </section>
              ) : null}

              {diagnosis?.topVisualDifferences?.length ? (
                <section className="site00-pfw-upgrade-v2__diagnosis">
                  <h3>TOP VISUAL DIFFERENCES</h3>
                  <ul className="site00-pfw-upgrade-v2__forensics-list">
                    {diagnosis.topVisualDifferences.map((item) => (
                      <li key={item.evidenceId}>
                        <strong>{item.regionName}</strong>
                        <span className="site00-pfw-upgrade-v2__forensics-delta">{item.delta}</span>
                        <dl className="site00-pfw-upgrade-v2__forensics-measures">
                          <div>
                            <dt>AUTHORITY</dt>
                            <dd>{item.authority}</dd>
                          </div>
                          <div>
                            <dt>CURRENT</dt>
                            <dd>{item.current}</dd>
                          </div>
                          <div>
                            <dt>CONFIDENCE</dt>
                            <dd>{item.confidence}</dd>
                          </div>
                        </dl>
                        <button
                          type="button"
                          className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
                          onClick={() => {
                            setEvidenceId(item.evidenceId);
                            setEvidenceRegionId(item.evidenceId);
                          }}
                        >
                          VIEW EVIDENCE
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : diagnosis ? (
                <section className="site00-pfw-upgrade-v2__diagnosis">
                  <h3>TOP VISUAL DIFFERENCES</h3>
                  <ul>
                    {diagnosis.topFindings.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {plan && !showPostBuild ? (
                <section className="site00-pfw-upgrade-v2__plan">
                  <h3>RECONSTRUCTION PLAN</h3>
                  <p className="site00-pfw-upgrade-v2__plan-goal">{plan.goal}</p>
                  <ul className="site00-pfw-upgrade-v2__plan-list">
                    {[...plan.geometryChanges, ...plan.componentChanges, ...plan.spacingChanges]
                      .slice(0, 8)
                      .map((item) => (
                        <li key={item.id}>
                          <strong>{item.regionName ?? item.label.split(' — ')[0]}</strong>
                          {item.authorityValue ? (
                            <span className="site00-pfw-upgrade-v2__plan-target">TARGET: {item.authorityValue}</span>
                          ) : null}
                          {item.currentValue ? (
                            <span className="site00-pfw-upgrade-v2__plan-current">CURRENT: {item.currentValue}</span>
                          ) : null}
                          {item.delta ? (
                            <span className="site00-pfw-upgrade-v2__plan-delta">{item.delta}</span>
                          ) : null}
                          {item.correction ? (
                            <span className="site00-pfw-upgrade-v2__plan-correction">{item.correction}</span>
                          ) : null}
                          {item.evidenceId ? (
                            <button
                              type="button"
                              className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact"
                              onClick={() => setEvidenceId(item.evidenceId!)}
                            >
                              VIEW EVIDENCE
                            </button>
                          ) : null}
                        </li>
                      ))}
                  </ul>
                </section>
              ) : null}

              {plan ? (
                <section className="site00-pfw-upgrade-v2__function-contract">
                  <h3>FUNCTION PRESERVATION</h3>
                  <ul>
                    {plan.functionPreservation.map((item) => (
                      <li key={item}>{item} ✓</li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {isMobile && workflow.primaryTask === 'BUILD_TWIN' && primaryAction ? (
                <div className="site00-pfw-upgrade-v2__mobile-active-task">
                  <button
                    type="button"
                    className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-wizard__primary"
                    disabled={primaryAction.disabled}
                    onClick={primaryAction.onClick}
                  >
                    {primaryAction.label}
                  </button>
                  {secondaryAction ? (
                    <button
                      type="button"
                      className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-wizard__secondary"
                      disabled={Boolean((secondaryAction as { disabled?: boolean }).disabled)}
                      onClick={secondaryAction.onClick}
                    >
                      {secondaryAction.label}
                    </button>
                  ) : null}
                </div>
              ) : null}

              {twinSession?.regionExecutionDecisions?.length ? (
                <section className="site00-pfw-upgrade-v2__region-execution">
                  <h3>REGION BUILD MODES</h3>
                  <ul>
                    {twinSession.regionExecutionDecisions.map((d) => (
                      <li key={d.regionId}>
                        <strong>{d.regionName}</strong> · {d.executionMode.replace(/_/g, ' ')}
                        {d.warnings.includes('FOUNDER REVIEW REQUIRED') ? ' · FOUNDER REVIEW REQUIRED' : ''}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {twinSession?.convergenceBefore && twinSession?.convergenceAfter ? (
                <section className="site00-pfw-upgrade-v2__convergence">
                  <h3>BEFORE DRIFT VS AFTER DRIFT</h3>
                  <dl className="site00-pfw-upgrade-v2__convergence-grid">
                    {(['composition', 'geometry', 'spacing', 'typography', 'assets', 'function'] as const).map((key) => {
                      const beforeVal =
                        key === 'composition'
                          ? twinSession.convergenceBefore?.composition ?? '—'
                          : twinSession.convergenceBefore![key as 'geometry'];
                      const afterVal =
                        key === 'composition'
                          ? twinSession.convergenceAfter?.composition ?? '—'
                          : twinSession.convergenceAfter![key as 'geometry'];
                      return (
                        <div key={key}>
                          <dt>{key.toUpperCase()}</dt>
                          <dd>
                            {beforeVal} → {afterVal}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                  {twinSession.fidelityScoreProvenance?.length ? (
                    <ul className="site00-pfw-upgrade-v2__provenance">
                      {twinSession.fidelityScoreProvenance.map((row) => (
                        <li key={row.dimension}>
                          <strong>{row.dimension}</strong> after {formatProvenanceScore(row)} · {row.status}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {twinSession.regionConvergence?.length ? (
                    <ul className="site00-pfw-upgrade-v2__region-convergence">
                      {twinSession.regionConvergence
                        .filter((r) => r.status !== 'UNANALYZED')
                        .slice(0, 8)
                        .map((r) => (
                          <li key={r.regionId}>
                            <strong>{r.regionName}</strong>
                            <span>
                              {r.beforeScore} → {r.afterScore}
                            </span>
                          </li>
                        ))}
                    </ul>
                  ) : null}
                </section>
              ) : null}

              {noteOpen ? (
                <label className="site00-pfw-upgrade-v2__note">
                  FOUNDER NOTE
                  <textarea
                    value={founderNote}
                    onChange={(e) => {
                      setFounderNote(e.target.value);
                      setPageCreativeUpgradeFounderNote(
                        session.projectId,
                        session.pageId,
                        session.viewport as DesignViewportClass,
                        e.target.value,
                      );
                    }}
                    rows={3}
                    placeholder="KEEP CURRENT DATA BAND · MATCH AUTHORITY HEADER EXACTLY"
                  />
                </label>
              ) : (
                <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-v3-btn--compact" onClick={() => setNoteOpen(true)}>
                  ADD FOUNDER NOTE
                </button>
              )}

              {twinSession && showTwinReview && onApprovePromotion ? (
                <button
                  type="button"
                  className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-v3-btn--compact"
                  disabled={!twinSession.promotionReadiness || !canPromote(twinSession.promotionReadiness)}
                  onClick={onApprovePromotion}
                >
                  APPROVE FOR PROMOTION
                </button>
              ) : null}

              {promotionConfirmOpen && twinSession ? (
                <div className="site00-pfw-upgrade-v2__promotion-confirm">
                  <p>
                    YOU ARE ABOUT TO REPLACE THE LIVE IMPLEMENTATION FOR <strong>{pageLabel.toUpperCase()}</strong>{' '}
                    <code>{route}</code> WITH TWIN VERSION <code>{twinSession.twinVersionId}</code>.
                  </p>
                  <p>THE CURRENT LIVE VERSION WILL BE ARCHIVED FOR RECOVERY.</p>
                  <button type="button" className="site00-dw-v3-btn site00-dw-v3-btn--primary" onClick={onPromote}>
                    PROMOTE TO LIVE
                  </button>
                  <button
                    type="button"
                    className="site00-dw-v3-btn site00-dw-v3-btn--outline"
                    onClick={() => setPromotionConfirmOpen(false)}
                  >
                    CANCEL
                  </button>
                </div>
              ) : null}

              {refineOpen ? (
                <label className="site00-pfw-upgrade-v2__note">
                  REFINE TWIN — WHAT NEEDS TO CHANGE?
                  <textarea
                    value={refineText}
                    onChange={(e) => setRefineText(e.target.value)}
                    rows={3}
                    placeholder="HEADER STILL TOO TALL · MATCH AUTHORITY SPACING"
                  />
                  <button
                    type="button"
                    className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-v3-btn--compact"
                    onClick={() => {
                      onRefineTwin?.(refineText);
                      setRefineOpen(false);
                      setRefineText('');
                    }}
                  >
                    APPLY REVISION
                  </button>
                </label>
              ) : null}

              <p className="site00-pfw-upgrade-v2__status">
                STATUS: {workflow.founderStatusLabel}
                {workflow.twinStatusLabel ? ` · TWIN: ${workflow.twinStatusLabel}` : ''}
                {workflow.conflictingComplete ? ' · (SESSION MARKED COMPLETE — BUILD STILL REQUIRED)' : ''}
              </p>
            </div>
          </DesignTaskWizardShell>
        </div>
      </aside>
      <AllForensicsOverlay
        open={allForensicsOpen}
        diagnosis={diagnosis}
        onClose={() => setAllForensicsOpen(false)}
        onSelectRegion={(regionId) => {
          setEvidenceRegionId(regionId);
          setEvidenceId(regionId);
          setAllForensicsOpen(false);
        }}
        onSelectStructure={(regionId) => {
          setStructureRegionId(regionId);
          setAllForensicsOpen(false);
        }}
      />
      <ForensicEvidenceDetailOverlay
        open={Boolean(evidenceId || evidenceRegionId)}
        evidenceId={evidenceId}
        regionId={evidenceRegionId}
        diagnosis={diagnosis}
        plan={plan}
        onClose={() => {
          setEvidenceId(null);
          setEvidenceRegionId(null);
        }}
        onOpenStructure={(rid) => {
          setStructureRegionId(rid);
        }}
      />
      <ForensicStructureOverlay
        open={Boolean(structureRegionId)}
        region={resolveAllRegionForensics(diagnosis).find((r) => r.regionId === structureRegionId) ?? null}
        onClose={() => setStructureRegionId(null)}
        onAnalyzeStructure={onAnalyzeRegionStructure}
      />
    </div>,
    document.body,
  );
}
