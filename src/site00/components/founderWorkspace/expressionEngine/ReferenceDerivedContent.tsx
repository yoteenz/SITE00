/**
 * B5.3 — derived content row (reference shows four locked platform cards).
 */

import type { DerivedContentCard } from './derivedContentState';

type Props = {
  cards: DerivedContentCard[];
};

function statusLabel(status: DerivedContentCard['status']): string {
  switch (status) {
    case 'READY':
      return 'READY';
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

export function ReferenceDerivedContent({ cards }: Props) {
  const primaryCards = cards.slice(0, 4);

  return (
    <section className="site00-ee-ref-derived">
      <h3 className="site00-ee-ref-derived__title">
        DERIVED CONTENT <span>(FROM FINAL REEL)</span>
      </h3>
      <div className="site00-ee-ref-derived__grid">
        {primaryCards.map((card) => (
          <article
            key={card.id}
            className={`site00-ee-ref-derived__card site00-ee-ref-derived__card--${card.status.toLowerCase().replace(/[^a-z]+/g, '-')}`}
          >
            {card.status === 'LOCKED' ? <span className="site00-ee-ref-derived__lock" aria-hidden>⊘</span> : null}
            <strong className="site00-ee-ref-derived__label">{card.label}</strong>
            <span className={`site00-ee-ref-derived__status site00-ee-ref-derived__status--${statusLabel(card.status).toLowerCase().replace(/\s+/g, '-')}`}>
              {statusLabel(card.status)}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
