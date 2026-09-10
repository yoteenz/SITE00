/**
 * P0.VR.MOF.R2 — Shared shell for MORE child tool pages.
 */

import { useState, type ReactNode } from 'react';
import { DesignDetailsDrawer } from '../wizard/DesignDetailsDrawer';
import { MoreStatusHero } from './MoreStatusHero';
import type { MoreVisualState } from './moreStatus';

export type MoreToolAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
};

export type MoreToolPageShellProps = {
  title: string;
  description?: string;
  visualState?: MoreVisualState;
  statusBadge?: string;
  headline: string;
  support?: string;
  primaryAction?: MoreToolAction | null;
  secondaryAction?: MoreToolAction | null;
  onBack: () => void;
  backLabel?: string;
  detailsContent?: ReactNode;
  detailsTitle?: string;
  summary?: ReactNode;
  children?: ReactNode;
  transitionKey?: string;
  heroVisual?: ReactNode;
  hideDefaultHero?: boolean;
};

export function MoreToolPageShell({
  title,
  description,
  visualState = 'ready',
  statusBadge,
  headline,
  support,
  primaryAction,
  secondaryAction,
  onBack,
  backLabel = '← BACK TO SYSTEM & SETTINGS',
  detailsContent,
  detailsTitle = 'DETAILS',
  summary,
  children,
  transitionKey,
  heroVisual,
  hideDefaultHero = false,
}: MoreToolPageShellProps) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <section
      className="site00-dw-more-tool"
      data-transition-key={transitionKey}
      data-visual-state={visualState}
    >
      <button type="button" className="site00-dw-more-tool__back" onClick={onBack}>
        {backLabel}
      </button>

      <header className="site00-dw-more-tool__head">
        <p className="site00-dw-more-tool__kicker">{title}</p>
        {description ? <p className="site00-dw-more-tool__desc">{description}</p> : null}
      </header>

      {!hideDefaultHero ? (
        <div className="site00-dw-more-tool__visual">{heroVisual ?? <MoreStatusHero state={visualState} />}</div>
      ) : null}

      <div className="site00-dw-more-tool__status-block">
        {statusBadge ? <span className={`site00-dw-more-tool__badge is-${visualState}`}>{statusBadge}</span> : null}
        <h2 className="site00-dw-more-tool__headline">{headline}</h2>
        {support ? <p className="site00-dw-more-tool__support">{support}</p> : null}
      </div>

      {summary}
      {children}

      <div className="site00-dw-more-tool__actions">
        {primaryAction ? (
          <button
            type="button"
            className={`site00-dw-v3-btn site00-dw-v3-btn--${primaryAction.variant ?? 'primary'} site00-dw-more-tool__primary`}
            disabled={primaryAction.disabled}
            onClick={primaryAction.onClick}
          >
            {primaryAction.label}
          </button>
        ) : null}
        {secondaryAction ? (
          <button
            type="button"
            className={`site00-dw-v3-btn site00-dw-v3-btn--${secondaryAction.variant ?? 'outline'} site00-dw-more-tool__secondary`}
            disabled={secondaryAction.disabled}
            onClick={() => {
              if (
                (secondaryAction.label === 'VIEW DETAILS' || secondaryAction.label === 'VIEW TEST RESULT') &&
                detailsContent
              ) {
                setDetailsOpen(true);
                return;
              }
              secondaryAction.onClick();
            }}
          >
            {secondaryAction.label}
          </button>
        ) : null}
            {detailsContent &&
            secondaryAction?.label !== 'VIEW DETAILS' &&
            secondaryAction?.label !== 'VIEW TEST RESULT' ? (
              <button type="button" className="site00-dw-more-tool__details-link" onClick={() => setDetailsOpen(true)}>
                VIEW DETAILS
              </button>
            ) : null}
      </div>

      {detailsContent ? (
        <DesignDetailsDrawer open={detailsOpen} title={detailsTitle} onClose={() => setDetailsOpen(false)}>
          {detailsContent}
        </DesignDetailsDrawer>
      ) : null}
    </section>
  );
}
