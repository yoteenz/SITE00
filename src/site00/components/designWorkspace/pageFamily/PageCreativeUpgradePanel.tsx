/**
 * P0.VR.CAPTURE.1 — Creative upgrade wizard panel (current vs proposed).
 * Portal drawer so mobile founders see the wizard immediately after UPGRADE THIS PAGE.
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { DesignViewportClass } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';
import type { PageCreativeUpgradeSession } from '../../../../../shared/site00-studio-world-production/visualReconstruction/p0vrCapture1/types.js';
import { DesignTaskWizardShell } from '../wizard/DesignTaskWizardShell';

type Props = {
  open: boolean;
  session: PageCreativeUpgradeSession;
  currentScreenshot: string | null;
  proposedLabel: string;
  onApprove: () => void;
  onRevise: () => void;
  onBack: () => void;
  onVerify?: () => void;
  afterScreenshot?: string | null;
};

export function PageCreativeUpgradePanel({
  open,
  session,
  currentScreenshot,
  proposedLabel,
  onApprove,
  onRevise,
  onBack,
  onVerify,
  afterScreenshot,
}: Props) {
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

  if (!open) return null;
  const plan = session.creativeDirectionPlan;
  const diagnosis = session.currentDiagnosis;
  const showAfter = session.status === 'COMPLETE' && afterScreenshot;

  return createPortal(
    <div className="site00-dw-wizard-drawer" data-open="true" role="presentation">
      <button type="button" className="site00-dw-wizard-drawer__backdrop" aria-label="Close page upgrade" onClick={onBack} />
      <aside className="site00-dw-wizard-drawer__panel site00-pfw-upgrade-drawer" role="dialog" aria-modal="true" aria-label="Page upgrade">
        <header className="site00-dw-wizard-drawer__head">
          <strong>PAGE UPGRADE</strong>
          <button type="button" className="site00-dw-wizard-drawer__close" onClick={onBack} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="site00-dw-wizard-drawer__body">
          <DesignTaskWizardShell
            stepTitle="PAGE UPGRADE"
            headline={showAfter ? 'BEFORE / AFTER' : 'CURRENT VS PROPOSED'}
            support={
              showAfter
                ? 'Verify convergence after build — same page, same viewport.'
                : 'Current capture = live implementation evidence. Design authority = parent experience + founder direction.'
            }
            onBack={onBack}
            transitionKey={`upgrade-${session.sessionId}`}
            primaryAction={
              session.status === 'DIRECTION_READY'
                ? { label: 'APPROVE DIRECTION', onClick: onApprove }
                : session.status === 'APPROVED' && onVerify
                  ? { label: 'VERIFY BUILD', onClick: onVerify }
                  : undefined
            }
            secondaryAction={
              session.status === 'DIRECTION_READY' ? { label: 'REVISE', onClick: onRevise } : undefined
            }
          >
            <div className="site00-pfw-upgrade">
              <div className="site00-pfw-upgrade__compare">
                <figure>
                  <figcaption>{showAfter ? 'BEFORE' : 'CURRENT'}</figcaption>
                  {currentScreenshot ? (
                    <img src={currentScreenshot} alt="Current page" />
                  ) : (
                    <div className="site00-pfw-upgrade__empty">NO CAPTURE</div>
                  )}
                </figure>
                <span className="site00-pfw-upgrade__arrow" aria-hidden>
                  {showAfter ? '→' : '↔'}
                </span>
                <figure>
                  <figcaption>{showAfter ? 'AFTER' : 'PROPOSED'}</figcaption>
                  {showAfter && afterScreenshot ? (
                    <img src={afterScreenshot} alt="After build" />
                  ) : (
                    <div className="site00-pfw-upgrade__proposed">
                      <strong>{proposedLabel}</strong>
                      {plan ? (
                        <ul>
                          <li>{plan.visualDirection}</li>
                          <li>{plan.hierarchyDirection}</li>
                          <li>{plan.primaryAction}</li>
                        </ul>
                      ) : null}
                    </div>
                  )}
                </figure>
              </div>

              {diagnosis ? (
                <p className="site00-pfw-upgrade__diagnosis">
                  <strong>DIAGNOSIS</strong> — {diagnosis.summary}
                </p>
              ) : null}

              {plan && !showAfter ? (
                <div className="site00-pfw-upgrade__plan">
                  <p>
                    <strong>PURPOSE</strong> {plan.pagePurpose}
                  </p>
                  <p>
                    <strong>GOAL</strong> {plan.experienceGoal}
                  </p>
                  <p>
                    <strong>PRESERVE</strong> {plan.preserveFunction.join(', ')}
                  </p>
                </div>
              ) : null}

              <p className="site00-pfw-upgrade__viewport">
                VIEWPORT: {(session.viewport as DesignViewportClass).toUpperCase()} · STATUS: {session.status.replace(/_/g, ' ')}
              </p>
            </div>
          </DesignTaskWizardShell>
        </div>
      </aside>
    </div>,
    document.body,
  );
}
