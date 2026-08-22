import { BLDR_SCALE_RAIL } from '../../../config/bldr-classification';

function ScaleDots({ active }: { active: number }) {
  return (
    <span className="site00-bldr-scale-rail__dots" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`site00-bldr-scale-rail__dot ${n <= active ? 'site00-bldr-scale-rail__dot--on' : ''}`.trim()}
        />
      ))}
    </span>
  );
}

export function BuildScaleRail() {
  return (
    <nav className="site00-bldr-scale-rail" aria-label="BUILD SCALE">
      <ol className="site00-bldr-scale-rail__track">
        {BLDR_SCALE_RAIL.map((step, index) => (
          <li key={step.num} className="site00-bldr-scale-rail__step">
            <div className="site00-bldr-scale-rail__node">
              <span className="site00-bldr-scale-rail__num">{step.num}</span>
              <span className="site00-bldr-scale-rail__title">{step.title}</span>
              <span className="site00-bldr-scale-rail__subtitle">{step.subtitle}</span>
              <ScaleDots active={step.activeDots} />
            </div>
            {index < BLDR_SCALE_RAIL.length - 1 ? (
              <span className="site00-bldr-scale-rail__arrow" aria-hidden="true">
                →
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}
