import type { EvolvePath } from '../../../config/evolve';
import type { EvolvePathSelectionCard } from '../../../config/evolve-diagnostic';
import { EvolvePathIcon } from '../EvolvePathIcon';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';

type EvolutionPathCardProps = {
  path: EvolvePath;
  cardConfig: EvolvePathSelectionCard;
  selected: boolean;
  onSelect: (pathId: EvolvePath['id']) => void;
};

function CrosshairIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true" className="site00-evolve-mobile-path-card__crosshair">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="0.75" />
      <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="8" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function EvolutionPathCard({ path, cardConfig, selected, onSelect }: EvolutionPathCardProps) {
  return (
    <article
      className={`site00-evolve-mobile-path-card ${selected ? 'site00-evolve-mobile-path-card--selected' : ''}`.trim()}
    >
      <button
        type="button"
        className="site00-evolve-mobile-path-card__hit"
        onClick={() => onSelect(path.id)}
        aria-pressed={selected}
        aria-label={`${cardConfig.num} ${path.title}. ${cardConfig.modeLabel}`}
      >
        <span className="site00-evolve-mobile-path-card__ghost" aria-hidden="true">
          {cardConfig.num}
        </span>
        <Site00ThreeCornerMark className="site00-evolve-mobile-path-card__mark" />
        <div className="site00-evolve-mobile-path-card__icon">
          <EvolvePathIcon id={path.icon} title={path.title} size={48} />
        </div>
        <h2 className="site00-evolve-mobile-path-card__title">{path.title}</h2>
        <p className="site00-evolve-mobile-path-card__mode">{cardConfig.modeLabel}</p>
        <span className="site00-evolve-mobile-path-card__rule" aria-hidden="true" />
        <p className="site00-evolve-mobile-path-card__desc">{cardConfig.description}</p>
        <ul className="site00-evolve-mobile-path-card__list">
          {cardConfig.capabilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <span
          className={`site00-evolve-mobile-path-card__status ${selected ? 'site00-evolve-mobile-path-card__status--selected' : ''}`.trim()}
        >
          {selected ? (
            <>
              <CrosshairIcon />
              SELECTED
            </>
          ) : (
            cardConfig.selectCta
          )}
        </span>
      </button>
    </article>
  );
}
