import type { EvolvePath } from '../../../config/evolve';
import { evolvePathCapabilities } from '../../../config/evolve-diagnostic';
import { EvolvePathIcon } from '../EvolvePathIcon';
import { Site00ThreeCornerMark } from '../../mark/Site00ThreeCornerMark';
import { ArrowIconSmall } from '../../icons/ArrowAction';

type EvolutionPathCardProps = {
  path: EvolvePath;
  selected: boolean;
  onSelect: (pathId: EvolvePath['id']) => void;
  onProceed: (pathId: EvolvePath['id']) => void;
};

export function EvolutionPathCard({ path, selected, onSelect, onProceed }: EvolutionPathCardProps) {
  const capabilities = evolvePathCapabilities(path.description);

  return (
    <article className={`site00-evolve-mobile-path-card ${selected ? 'site00-evolve-mobile-path-card--selected' : ''}`.trim()}>
      <button
        type="button"
        className="site00-evolve-mobile-path-card__hit"
        onClick={() => onSelect(path.id)}
        aria-pressed={selected}
        aria-label={`${path.code} ${path.title}. ${path.subtitle}`}
      >
        <span className="site00-evolve-mobile-path-card__ghost" aria-hidden="true">
          {path.code}
        </span>
        <Site00ThreeCornerMark className="site00-evolve-mobile-path-card__mark" />
        <div className="site00-evolve-mobile-path-card__icon">
          <EvolvePathIcon id={path.icon} title={path.title} size={56} />
        </div>
        <h2 className="site00-evolve-mobile-path-card__title">{path.title}</h2>
        <p className="site00-evolve-mobile-path-card__subtitle">{path.subtitle}</p>
        <ul className="site00-evolve-mobile-path-card__list">
          {capabilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </button>
      <button type="button" className="site00-evolve-mobile-path-card__cta" onClick={() => onProceed(path.id)}>
        {path.cta.replace(' →', '')}
        <ArrowIconSmall />
      </button>
    </article>
  );
}
