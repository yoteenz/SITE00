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

  const showTwinReview =
    twinSession &&
    ['READY_FOR_REVIEW', 'REVISION_REQUESTED', 'REVISING', 'APPROVED_FOR_PROMOTION', 'VERIFYING'].includes(
      twinSession.status,
    );
  const showPostBuild =
    (session.status === 'COMPLETE' && Boolean(afterScreenshot)) || twinSession?.status === 'PROMOTED';
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

  const primaryAction = useMemo(() => {
    if (session.status === 'DIRECTION_READY') {
      return {
        label: 'APPROVE DIRECTION',
        onClick: onApprove,
        disabled: missingCurrent || missingAuthority,
      };
    }
    if (session.status === 'DIRECTION_APPROVED' && !twinSession) {
      return { label: 'BUILD TWIN', onClick: onBuildTwin ?? (() => {}), disabled: !onBuildTwin || buildingTwin };
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
  ]);

  const secondaryAction = useMemo(() => {
    if (session.status === 'DIRECTION_READY') {
      return { label: 'REVISE', onClick: onRevise };
    }
    if (twinSession && ['READY_FOR_REVIEW', 'REVISION_REQUESTED'].includes(twinSession.status)) {
      return { label: 'REFINE TWIN', onClick: () => setRefineOpen(true) };
    }
    return undefined;
  }, [session.status, twinSession, onRevise, onApprovePromotion]);

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
            onBack={onBack}
            transitionKey={`upgrade-${session.sessionId}`}
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
              {renderVisualCompare()}

              {diagnosis ? (
                <section className="site00-pfw-upgrade-v2__diagnosis">
                  <h3>DIAGNOSIS</h3>
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
                  <ul>
                    {[...plan.geometryChanges, ...plan.componentChanges, ...plan.spacingChanges]
                      .slice(0, 8)
                      .map((item) => (
                        <li key={item.id}>
                          {item.label}
                          <span className="site00-pfw-upgrade-v2__plan-source">{item.sourceDimension.replace(/_/g, ' ')}</span>
                        </li>
                      ))}
                  </ul>
                </section>
              ) : null}

              {plan ? (
                <p className="site00-pfw-upgrade-v2__preserve">
                  <strong>FUNCTION PRESERVED:</strong> {plan.functionPreservation.slice(0, 4).join(' · ').toUpperCase()}
                </p>
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
                STATUS: {session.status.replace(/_/g, ' ')}
                {twinSession ? ` · TWIN: ${twinSession.status.replace(/_/g, ' ')}` : ''}
              </p>
            </div>
          </DesignTaskWizardShell>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
