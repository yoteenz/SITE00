/**
 * P0.VR.UPGRADE.1 — Page upgrade: CURRENT vs DESIGN AUTHORITY + reconstruction plan.
 */

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import type { DesignViewportClass } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import type {
  PageCreativeUpgradeSession,
  PageVisualDiagnosis,
  ReconstructionPlan,
} from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/types.js';
import { setPageCreativeUpgradeFounderNote } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/pageCreativeUpgradeSession.js';
import { DesignTaskWizardShell } from '../wizard/DesignTaskWizardShell';

type CompareMode = 'current' | 'authority' | 'overlay';
type ReviewMode = 'before' | 'after' | 'authority';

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
}: Props) {
  const isMobile = useIsMobileViewport();
  const [compareMode, setCompareMode] = useState<CompareMode>('current');
  const [reviewMode, setReviewMode] = useState<ReviewMode>('after');
  const [overlayMix, setOverlayMix] = useState(50);
  const [founderNote, setFounderNote] = useState(session.founderNote ?? '');
  const [noteOpen, setNoteOpen] = useState(false);

  const showPostBuild = session.status === 'COMPLETE' && Boolean(afterScreenshot);
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
    if (showPostBuild) return 'AFTER VS DESIGN AUTHORITY';
    return 'CURRENT VS DESIGN AUTHORITY';
  }, [showPostBuild]);

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
            primaryAction={
              session.status === 'DIRECTION_READY'
                ? { label: 'APPROVE DIRECTION', onClick: onApprove, disabled: missingCurrent || missingAuthority }
                : session.status === 'DIRECTION_APPROVED' && onVerify
                  ? { label: 'VERIFY BUILD', onClick: onVerify }
                  : undefined
            }
            secondaryAction={
              session.status === 'DIRECTION_READY' ? { label: 'REVISE', onClick: onRevise } : undefined
            }
          >
            <div className="site00-pfw-upgrade-v2">
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

              <p className="site00-pfw-upgrade-v2__status">
                STATUS: {session.status.replace(/_/g, ' ')}
              </p>
            </div>
          </DesignTaskWizardShell>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
