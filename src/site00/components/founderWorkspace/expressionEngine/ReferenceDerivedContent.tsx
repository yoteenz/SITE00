/**
 * Reference-fidelity — derived content horizontal cards.
 */

import { Link } from 'react-router-dom';
import type { DerivedContentCard, DerivedContentStatus } from './derivedContentState';

type Props = {
  cards: DerivedContentCard[];
  campaignBoardPath: string;
  campaignStatus: DerivedContentStatus;
};

function statusLabel(status: DerivedContentStatus): string {
  if (status === 'READY' || status === 'APPROVED') return 'READY';
  if (status === 'IN_PROGRESS') return 'IN PROGRESS';
  if (status === 'LOCKED') return 'LOCKED';
  return 'PENDING';
}

export function ReferenceDerivedContent({ cards, campaignBoardPath, campaignStatus }: Props) {
  return (
    <section className="site00-ee-ref-derived">
      <h3 className="site00-ee-ref-derived__title">
        DERIVED CONTENT <span>(FROM FINAL REEL)</span>
      </h3>
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
        <article className={`site00-ee-ref-derived__card site00-ee-ref-derived__card--campaign site00-ee-ref-derived__card--${campaignStatus.toLowerCase()}`}>
          {campaignStatus === 'LOCKED' ? (
            <span className="site00-ee-ref-derived__lock" aria-hidden>⊘</span>
          ) : null}
          <strong className="site00-ee-ref-derived__label">CAMPAIGN BOARD</strong>
          <span className={`site00-ee-ref-derived__status site00-ee-ref-derived__status--${statusLabel(campaignStatus).toLowerCase()}`}>
            {statusLabel(campaignStatus)}
          </span>
          {campaignStatus === 'READY' ? (
            <Link to={campaignBoardPath} className="site00-ee-ref-derived__link">
              OPEN
            </Link>
          ) : null}
        </article>
      </div>
    </section>
  );
}
