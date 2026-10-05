import { BLDR_CLASSIFICATION_COPY, BLDR_SCALE_COMPARISON } from '../../../config/bldr-classification';

function ComplexityDots({ active }: { active: number }) {
  return (
    <span className="site00-bldr-scale-module__dots" aria-hidden="true">
      {[1, 2, 3].map((n) => (
        <span
          key={n}
          className={`site00-bldr-scale-module__dot ${n <= active ? 'site00-bldr-scale-module__dot--on' : ''}`.trim()}
        />
      ))}
    </span>
  );
}

export function BuildScaleComparison() {
  return (
    <section className="site00-bldr-scale-module" aria-labelledby="bldr-scale-module-heading">
      <header className="site00-bldr-scale-module__header">
        <h2 id="bldr-scale-module-heading" className="site00-bldr-scale-module__title">
          {BLDR_CLASSIFICATION_COPY.scaleTitle}
        </h2>
        <p className="site00-bldr-scale-module__subhead">{BLDR_CLASSIFICATION_COPY.scaleSubhead}</p>
        <p className="site00-bldr-scale-module__subhead">{BLDR_CLASSIFICATION_COPY.scaleSubhead2}</p>
      </header>
      <div className="site00-bldr-scale-module__grid">
        {BLDR_SCALE_COMPARISON.map((col) => (
          <div key={col.id} className="site00-bldr-scale-module__col">
            {col.num ? <p className="site00-bldr-scale-module__col-num">{col.num}</p> : null}
            <p className="site00-bldr-scale-module__col-scale">{col.scale}</p>
            <p className="site00-bldr-scale-module__col-price">{col.price}</p>
            <p className="site00-bldr-scale-module__col-hint">{col.hint}</p>
            {col.activeDots > 0 ? <ComplexityDots active={col.activeDots} /> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
