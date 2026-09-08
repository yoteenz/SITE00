/**
 * B5.0R1 — Derived social content workspace (downstream from Final Reel).
 */

import type { DerivedContentCard } from './derivedContentState';
import type { SocialPackageReadiness } from './socialPackageReadiness';

type Props = {
  finalReelApproved: boolean;
  readiness: SocialPackageReadiness;
};

function statusDisplay(status: DerivedContentCard['status']): string {
  switch (status) {
    case 'LOCKED':
      return 'LOCKED';
    case 'READY':
      return 'READY TO GENERATE';
    case 'IN_PROGRESS':
      return 'IN PROGRESS';
    case 'AWAITING_REVIEW':
      return 'AWAITING REVIEW';
    case 'REVISION_REQUIRED':
      return 'REVISION REQUIRED';
    case 'APPROVED':
      return 'APPROVED';
    default:
      return 'PENDING';
  }
}

export function DerivedContentWorkspace({ finalReelApproved, readiness }: Props) {
  return (
    <section className="site00-ee-derived-workspace">
      <header className="site00-ee-derived-workspace__head">
        <span className="site00-ee-derived-workspace__kicker">DOWNSTREAM</span>
        <h2>SOCIAL CONTENT</h2>
        <p>Derived expressions from the approved Entry narrative.</p>
      </header>

      <div className="site00-ee-derived-workspace__source">
        <span className="site00-ee-derived-workspace__source-label">SOURCE</span>
        <article className={`site00-ee-derived-workspace__source-card${finalReelApproved ? ' site00-ee-derived-workspace__source-card--approved' : ''}`}>
          <strong>FINAL REEL</strong>
          <span>{finalReelApproved ? 'APPROVED' : 'NOT YET APPROVED'}</span>
        </article>
        <span className="site00-ee-derived-workspace__arrow" aria-hidden>
          ↓
        </span>
        <span className="site00-ee-derived-workspace__branch-label">DERIVED EXPRESSIONS</span>
      </div>

      <div className="site00-ee-derived-workspace__grid">
        {readiness.derivatives.map((card) => (
          <article
            key={card.id}
            className={`site00-ee-derived-workspace__card site00-ee-derived-workspace__card--${card.status.toLowerCase().replace(/[^a-z]+/g, '-')}`}
          >
            <span className="site00-ee-derived-workspace__platform">{card.platform}</span>
            <strong>{card.label}</strong>
            <span className="site00-ee-derived-workspace__lineage">from {card.lineageSource ?? 'FINAL REEL'}</span>
            <span className="site00-ee-derived-workspace__status">{statusDisplay(card.status)}</span>
            {card.nextAction ? (
              <span className="site00-ee-derived-workspace__action">{card.nextAction}</span>
            ) : null}
          </article>
        ))}
      </div>

      <footer className="site00-ee-derived-workspace__package">
        <span>SOCIAL PACKAGE</span>
        <strong>{readiness.packageStatus.replace(/_/g, ' ')}</strong>
        <span>
          {readiness.approvedDerivativeCount}/{readiness.requiredDerivativeCount} approved
        </span>
      </footer>
    </section>
  );
}
