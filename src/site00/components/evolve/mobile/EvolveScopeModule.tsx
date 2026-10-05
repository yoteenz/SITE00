import type { EvolvePathId } from '../../../config/evolve';
import { EVOLVE_PATH_SCOPE } from '../../../config/evolve-diagnostic';

type EvolveScopeModuleProps = {
  activePathId: EvolvePathId;
};

function ScopeCapsuleIcon() {
  return (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className="site00-evolve-mobile-scope__icon">
      <rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="6" cy="6" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function EvolveScopeModule({ activePathId }: EvolveScopeModuleProps) {
  const scope = EVOLVE_PATH_SCOPE[activePathId];

  return (
    <section className="site00-evolve-mobile-scope" aria-labelledby="evolve-scope-heading">
      <h2 id="evolve-scope-heading" className="site00-evolve-mobile-scope__title">
        {scope.title}
      </h2>
      <ul className="site00-evolve-mobile-scope__grid">
        {scope.categories.map((category) => (
          <li key={category} className="site00-evolve-mobile-scope__capsule">
            <ScopeCapsuleIcon />
            <span>{category}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
