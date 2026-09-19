/**
 * Compact NEEDS YOUR REVIEW zone — Design → ASSETS top strip.
 * P0.VR.6R8
 */

import type { DesignFounderAction } from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderAction.js';
import {
  founderActionAlertHeadline,
  founderActionAlertSubline,
  founderActionCtaLabel,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/referenceReconstructionIntelligence/founderActionNotifications.js';

type Props = {
  actions: DesignFounderAction[];
  onPrimary: (action: DesignFounderAction) => void;
  onViewJob?: (action: DesignFounderAction) => void;
  onViewAll?: () => void;
  totalPending?: number;
};

function AlertCard({
  action,
  onPrimary,
  onViewJob,
}: {
  action: DesignFounderAction;
  onPrimary: (action: DesignFounderAction) => void;
  onViewJob?: (action: DesignFounderAction) => void;
}) {
  const projectLabel = String(action.context.projectLabel ?? action.projectId.toUpperCase());
  const screenLabel = String(action.context.screenLabel ?? 'SKINS MOBILE');
  const cta = founderActionCtaLabel(action.actionType);

  return (
    <article
      className={`site00-dw-founder-alert${action.blocking ? ' is-blocking' : ''}`}
      data-action-type={action.actionType}
      aria-live="polite"
    >
      <div className="site00-dw-founder-alert__copy">
        <h3 className="site00-dw-founder-alert__job">{screenLabel} RECONSTRUCTION</h3>
        <p className="site00-dw-founder-alert__meta">
          {projectLabel} · {screenLabel}
        </p>
        <p className="site00-dw-founder-alert__headline">{founderActionAlertHeadline(action)}</p>
        <p className="site00-dw-founder-alert__subline">{founderActionAlertSubline(action)}</p>
        {action.blocking ? (
          <span className="site00-dw-founder-alert__blocking" aria-label="Blocking action">
            BLOCKING
          </span>
        ) : null}
      </div>
      <div className="site00-dw-founder-alert__actions">
        <button
          type="button"
          className="site00-dw-v3-btn site00-dw-v3-btn--primary site00-dw-founder-alert__cta"
          onClick={() => onPrimary(action)}
        >
          {cta}
        </button>
        {onViewJob ? (
          <button
            type="button"
            className="site00-dw-v3-btn site00-dw-v3-btn--ghost site00-dw-founder-alert__secondary"
            onClick={() => onViewJob(action)}
          >
            VIEW JOB
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function DesignFounderActionAlertZone({ actions, onPrimary, onViewJob, onViewAll, totalPending }: Props) {
  if (actions.length === 0) return null;

  const remaining = (totalPending ?? actions.length) - actions.length;

  return (
    <section className="site00-dw-founder-alert-zone" aria-label="Needs your review">
      <header className="site00-dw-founder-alert-zone__head">
        <h2>NEEDS YOUR REVIEW</h2>
      </header>
      <div className="site00-dw-founder-alert-zone__stack">
        {actions.map((action) => (
          <AlertCard key={action.actionId} action={action} onPrimary={onPrimary} onViewJob={onViewJob} />
        ))}
      </div>
      {remaining > 0 && onViewAll ? (
        <button type="button" className="site00-dw-founder-alert-zone__view-all" onClick={onViewAll}>
          VIEW ALL ({totalPending})
        </button>
      ) : null}
    </section>
  );
}
