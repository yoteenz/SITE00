/**
 * P0.VR.8R3R5R1 — Single-screen task wizard shell (one task, one primary CTA).
 */

import { type ReactNode, useState } from 'react';
import { DesignDetailsDrawer } from './DesignDetailsDrawer';

export type WizardAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

export type DesignTaskWizardShellProps = {
  stepCurrent?: number;
  stepTotal?: number;
  stepTitle: string;
  visualState?: 'ready' | 'attention' | 'progress' | 'success' | 'partial' | 'failed';
  headline: string;
  support?: string;
  statusLabel?: string;
  visual?: ReactNode;
  primaryAction?: WizardAction | null;
  secondaryAction?: WizardAction | null;
  onBack?: () => void;
  detailsContent?: ReactNode;
  detailsTitle?: string;
  children?: ReactNode;
  transitionKey?: string;
  className?: string;
};

function VisualStatusIcon({ state }: { state: DesignTaskWizardShellProps['visualState'] }) {
  const glyph =
    state === 'success'
      ? '✓'
      : state === 'attention' || state === 'failed'
        ? '!'
        : state === 'progress'
          ? '◉'
          : state === 'partial'
            ? '◐'
            : '●';
  return (
    <div className={`site00-dw-wizard__visual-icon is-${state ?? 'ready'}`} aria-hidden>
      {glyph}
    </div>
  );
}

export function DesignTaskWizardShell({
  stepCurrent,
  stepTotal,
  stepTitle,
  visualState = 'ready',
  headline,
  support,
  statusLabel,
  visual,
  primaryAction,
  secondaryAction,
  onBack,
  detailsContent,
  detailsTitle = 'DETAILS',
  children,
  transitionKey,
  className,
}: DesignTaskWizardShellProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const showStepRail = stepCurrent != null && stepTotal != null && stepTotal > 0;

  return (
    <section
      className={`site00-dw-wizard${className ? ` ${className}` : ''}`}
      data-visual-state={visualState}
      data-transition-key={transitionKey}
    >
      <div className="site00-dw-wizard__layout">
        {showStepRail ? (
          <aside className="site00-dw-wizard__rail" aria-label="Step progress">
            {Array.from({ length: stepTotal! }, (_, i) => (
              <span
                key={i}
                className={`site00-dw-wizard__rail-dot${i + 1 === stepCurrent ? ' is-current' : ''}${i + 1 < stepCurrent! ? ' is-done' : ''}`}
                aria-hidden
              />
            ))}
          </aside>
        ) : null}

        <div className="site00-dw-wizard__task">
          {onBack ? (
            <button type="button" className="site00-dw-wizard__back" onClick={onBack}>
              ← BACK
            </button>
          ) : null}

          {showStepRail ? (
            <p className="site00-dw-wizard__step-label">
              {String(stepCurrent).padStart(2, '0')} / {String(stepTotal).padStart(2, '0')} · {stepTitle}
            </p>
          ) : (
            <p className="site00-dw-wizard__step-label">{stepTitle}</p>
          )}

          <div className="site00-dw-wizard__visual-area">
            {visual ?? <VisualStatusIcon state={visualState} />}
          </div>

          <header className="site00-dw-wizard__copy">
            <h2 className="site00-dw-wizard__headline">{headline}</h2>
            {support ? <p className="site00-dw-wizard__support">{support}</p> : null}
            {statusLabel ? <p className="site00-dw-wizard__status">{statusLabel}</p> : null}
          </header>

          {children}

          <div className="site00-dw-wizard__actions">
            {primaryAction ? (
              <button
                type="button"
                className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-wizard__primary"
                disabled={primaryAction.disabled}
                onClick={primaryAction.onClick}
              >
                {primaryAction.label}
              </button>
            ) : null}
            {secondaryAction ? (
              <button
                type="button"
                className="site00-dw-v3-btn site00-dw-v3-btn--outline site00-dw-wizard__secondary"
                disabled={secondaryAction.disabled}
                onClick={secondaryAction.onClick}
              >
                {secondaryAction.label}
              </button>
            ) : null}
            {detailsContent ? (
              <button
                type="button"
                className="site00-dw-wizard__details-link"
                onClick={() => setDetailsOpen(true)}
              >
                VIEW DETAILS
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {detailsContent ? (
        <DesignDetailsDrawer open={detailsOpen} title={detailsTitle} onClose={() => setDetailsOpen(false)}>
          {detailsContent}
        </DesignDetailsDrawer>
      ) : null}
    </section>
  );
}
