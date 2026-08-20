import { EVOLVE_PATHS } from '../../../config/evolve';

type EvolutionIntensityRailProps = {
  activeCode: string;
};

export function EvolutionIntensityRail({ activeCode }: EvolutionIntensityRailProps) {
  return (
    <nav className="site00-evolve-mobile-intensity" aria-label="EVOLUTION INTENSITY">
      <ol className="site00-evolve-mobile-intensity__track">
        {EVOLVE_PATHS.map((path, index) => {
          const isLast = index === EVOLVE_PATHS.length - 1;
          const active = path.code === activeCode;
          return (
            <li
              key={path.id}
              className={`site00-evolve-mobile-intensity__step ${active ? 'site00-evolve-mobile-intensity__step--active' : ''}`.trim()}
            >
              <span className="site00-evolve-mobile-intensity__marker" aria-current={active ? 'step' : undefined}>
                <span className="site00-evolve-mobile-intensity__code">{path.code}</span>
                <span className="site00-evolve-mobile-intensity__label">{path.title}</span>
              </span>
              {!isLast ? <span className="site00-evolve-mobile-intensity__connector" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
      <p className="site00-evolve-mobile-intensity__caption">EVOLUTION INTENSITY →</p>
    </nav>
  );
}
