import { EVOLVE_PATHS } from '../../../config/evolve';
import type { EvolveHubPathCard } from '../../../config/evolve-hub-mobile';
import { EvolvePathIcon } from '../EvolvePathIcon';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';
import { ArrowIconSmall } from '../../icons/ArrowAction';

type EvolveHubPathCardProps = {
  card: EvolveHubPathCard;
  onEnter: () => void;
};

export function EvolveHubPathCardComponent({ card, onEnter }: EvolveHubPathCardProps) {
  const path = EVOLVE_PATHS.find((p) => p.id === card.pathId);
  if (!path) return null;

  return (
    <article className="site00-evolve-hub-path-card">
      <Site00ThreeCornerMark className="site00-evolve-hub-path-card__mark" />
      <span className="site00-evolve-hub-path-card__num" aria-hidden="true">
        {card.num}
      </span>
      <div className="site00-evolve-hub-path-card__icon">
        <EvolvePathIcon id={path.icon} title={path.title} size={64} />
      </div>
      <h3 className="site00-evolve-hub-path-card__title">{path.title}</h3>
      <p className="site00-evolve-hub-path-card__mode">{card.modeLabel}</p>
      <span className="site00-evolve-hub-path-card__rule" aria-hidden="true" />
      <p className="site00-evolve-hub-path-card__descriptor">{card.descriptor}</p>
      <ul className="site00-evolve-hub-path-card__list">
        {card.capabilities.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <button
        type="button"
        className="site00-evolve-hub-path-card__cta"
        onClick={onEnter}
        aria-label={`Enter ${path.title} evolution path`}
      >
        {card.cta.replace(' →', '')}
        <ArrowIconSmall />
      </button>
    </article>
  );
}
