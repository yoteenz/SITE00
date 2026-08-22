import type { BldrClassificationCard } from '../../../config/bldr-classification';
import { BldrBuildClassIcon } from '../BldrBuildClassIcon';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';

type BuildClassCardProps = {
  card: BldrClassificationCard;
  onSelect: () => void;
};

export function BuildClassCard({ card, onSelect }: BuildClassCardProps) {
  return (
    <article className={`site00-bldr-class-card ${card.isDiscovery ? 'site00-bldr-class-card--discovery' : ''}`.trim()}>
      <Site00ThreeCornerMark className="site00-bldr-class-card__mark" />
      <p className="site00-bldr-class-card__num" aria-hidden="true">
        {card.num}
      </p>
      <div className="site00-bldr-class-card__art">
        <BldrBuildClassIcon id={card.id} title={card.title} className="site00-bldr-class-card__icon" />
      </div>
      <h2 className="site00-bldr-class-card__title">{card.title}</h2>
      <p className="site00-bldr-class-card__descriptor">{card.descriptor}</p>
      <p className="site00-bldr-class-card__explanation">{card.explanation}</p>

      {card.discoverySteps ? (
        <ol className="site00-bldr-class-card__discovery-steps">
          {card.discoverySteps.map((step) => (
            <li key={step.num}>
              <span className="site00-bldr-class-card__discovery-num">{step.num}</span>
              <span>{step.label}</span>
            </li>
          ))}
        </ol>
      ) : null}

      {card.capabilities.length > 0 ? (
        <div className="site00-bldr-class-card__capabilities">
          <p className="site00-bldr-class-card__capabilities-label">{card.listLabel}</p>
          <ul className="site00-bldr-class-card__capabilities-list">
            {card.capabilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {card.priceLabel ? <p className="site00-bldr-class-card__price">{card.priceLabel}</p> : null}

      <button
        type="button"
        className={`site00-bldr-class-card__cta ${card.ctaFilled ? 'site00-bldr-class-card__cta--filled' : ''}`.trim()}
        onClick={onSelect}
      >
        {card.cta}
      </button>
    </article>
  );
}
