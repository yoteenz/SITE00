/**
 * Reference-fidelity — derived content horizontal cards + social package gate.
 */

import { Link } from 'react-router-dom';
import type { DerivedContentCard, DerivedContentStatus } from './derivedContentState';
import type { SocialPackageReadiness } from './socialPackageReadiness';

type Props = {
  cards: DerivedContentCard[];
  readiness: SocialPackageReadiness;
  campaignBoardPath: string;
  campaignStatus: DerivedContentStatus;
};

function statusLabel(status: DerivedContentStatus): string {
  switch (status) {
    case 'READY':
      return 'READY TO GENERATE';
    case 'APPROVED':
      return 'APPROVED';
    case 'IN_PROGRESS':
      return 'IN PROGRESS';
    case 'AWAITING_REVIEW':
      return 'AWAITING REVIEW';
    case 'REVISION_REQUIRED':
      return 'REVISION REQUIRED';
    case 'LOCKED':
      return 'LOCKED';
    default:
      return 'PENDING';
  }
}

export function ReferenceDerivedContent({ cards, readiness, campaignBoardPath, campaignStatus }: Props) {
  const packageComplete = readiness.packageStatus === 'COMPLETE';

  return (
    <section className="site00-ee-ref-derived">
      <h3 className="site00-ee-ref-derived__title">
        DERIVED CONTENT <span>(FROM FINAL REEL)</span>
      </h3>
      <div className="site00-ee-ref-derived__source">
        <span>FINAL REEL</span>
        <span aria-hidden>↓</span>
        <span>DERIVED EXPRESSIONS</span>
      </div>
      <div className="site00-ee-ref-derived__scroll">
        {cards.map((card) => (
          <article key={card.id} className={`site00-ee-ref-derived__card site00-ee-ref-derived__card--${card.status.toLowerCase().replace(/[^a-z]+/g, '-')}`}>
            <span className="site00-ee-ref-derived__platform">{card.platform}</span>
            <strong className="site00-ee-ref-derived__label">{card.label}</strong>
            <span className={`site00-ee-ref-derived__status site00-ee-ref-derived__status--${statusLabel(card.status).toLowerCase().replace(/\s+/g, '-')}`}>
              {statusLabel(card.status)}
            </span>
          </article>
        ))}
        <article className={`site00-ee-ref-derived__card site00-ee-ref-derived__card--package site00-ee-ref-derived__card--${readiness.packageStatus.toLowerCase()}`}>
          <strong className="site00-ee-ref-derived__label">SOCIAL PACKAGE</strong>
          <span className="site00-ee-ref-derived__status">
            {readiness.packageStatus === 'LOCKED'
              ? 'LOCKED'
              : packageComplete
                ? 'COMPLETE'
                : readiness.packageStatus.replace(/_/g, ' ')}
          </span>
          {readiness.packageStatus !== 'LOCKED' ? (
            <span className="site00-ee-ref-derived__meta">
              {readiness.approvedDerivativeCount}/{readiness.requiredDerivativeCount}
            </span>
          ) : null}
        </article>
        <article className={`site00-ee-ref-derived__card site00-ee-ref-derived__card--campaign site00-ee-ref-derived__card--${campaignStatus.toLowerCase()}`}>
          {campaignStatus === 'LOCKED' ? (
            <span className="site00-ee-ref-derived__lock" aria-hidden>⊘</span>
          ) : null}
          <strong className="site00-ee-ref-derived__label">CAMPAIGN BOARD</strong>
          <span className={`site00-ee-ref-derived__status site00-ee-ref-derived__status--${statusLabel(campaignStatus).toLowerCase()}`}>
            {campaignStatus === 'READY' ? 'READY' : campaignStatus === 'LOCKED' ? 'LOCKED' : 'PENDING'}
          </span>
          {campaignStatus === 'READY' ? (
            <Link to={campaignBoardPath} className="site00-ee-ref-derived__link">
              DEPLOY
            </Link>
          ) : campaignStatus === 'LOCKED' ? (
            <span className="site00-ee-ref-derived__hint">PACKAGE REQUIRED</span>
          ) : null}
        </article>
      </div>
    </section>
  );
}
