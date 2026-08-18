import { OriginPanelIcon } from './OriginPanelIcon';
import { ArrowIconSmall } from '../icons/ArrowAction';
import { EVOLVE_ORIGIN_CARD } from '../../config/evolve';

type CollapsedCardProps = {
  number: string;
  title: string;
  subtitle: string;
  body?: string;
  cta: string;
  panel: 'idnty' | 'bldr' | 'evolve';
  onExpand: () => void;
};

export function CollapsedCard({ number, title, subtitle, body, cta, panel, onExpand }: CollapsedCardProps) {
  return (
    <button
      type="button"
      className="site00-glass-panel"
      onClick={onExpand}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 20px',
        minWidth: 160,
        maxWidth: 200,
        minHeight: 260,
        flex: '1 1 160px',
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.8)',
        background: 'var(--site-surface-glass)',
        overflow: 'visible',
      }}
      aria-label={`Expand ${title}`}
    >
      <span
        className="site00-label-red site00-origin-card__number"
        style={{ color: 'var(--site00-origin-card-number-color, var(--site-text))' }}
      >
        {number}
      </span>
      <span className="site00-panel-title" style={{ marginTop: 8 }}>
        {title}
      </span>
      <span className="site00-label" style={{ marginTop: 4, textAlign: 'center' }}>
        {subtitle}
      </span>
      {body ? (
        <span className="site00-body" style={{ marginTop: 8, fontSize: 10, textAlign: 'center', lineHeight: 1.4 }}>
          {body}
        </span>
      ) : null}
      <div className="site00-origin-card__icon-wrap">
        <OriginPanelIcon panel={panel} />
      </div>
      <span className="site00-action-link" style={{ marginTop: 'auto' }}>
        {cta}
        <ArrowIconSmall />
      </span>
    </button>
  );
}

type OriginCardsProps = {
  onExpandIdnty: () => void;
  onExpandBldr: () => void;
  onExpandEvolve: () => void;
};

export function OriginCards({ onExpandIdnty, onExpandBldr, onExpandEvolve }: OriginCardsProps) {
  return (
    <div className="site00-origin-cards">
      <p className="site00-label-red site00-origin-cards__prompt">WHERE DO WE BEGIN?</p>
      <div className="site00-origin-cards__pointer" aria-hidden="true">
        <span />
        <span>▼</span>
        <span />
      </div>
      <div className="site00-origin-cards__row site00-origin-cards__row--three">
        <CollapsedCard
          number="01"
          title="IDNTY"
          subtitle="DEFINE MY BRAND."
          cta="BEGIN IDNTY"
          panel="idnty"
          onExpand={onExpandIdnty}
        />
        <CollapsedCard
          number="02"
          title="BLDR"
          subtitle="START MY BUILD."
          cta="BEGIN BLDR"
          panel="bldr"
          onExpand={onExpandBldr}
        />
        <CollapsedCard
          number={EVOLVE_ORIGIN_CARD.number}
          title={EVOLVE_ORIGIN_CARD.title}
          subtitle={EVOLVE_ORIGIN_CARD.subtitle}
          body={EVOLVE_ORIGIN_CARD.body}
          cta={EVOLVE_ORIGIN_CARD.cta}
          panel="evolve"
          onExpand={onExpandEvolve}
        />
      </div>
    </div>
  );
}
