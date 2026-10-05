import { EVOLVE_PROCESS_STEPS } from '../../../config/evolve';
import { EVOLVE_OPERATING_PROCESS_COPY } from '../../../config/evolve-diagnostic';
import { EvolveProcessStepArt } from './EvolveProcessStepArt';

export function EvolveProcessTimeline() {
  return (
    <section className="site00-evolve-mobile-process" aria-labelledby="evolve-process-heading">
      <header className="site00-evolve-mobile-process__header">
        <h2 id="evolve-process-heading" className="site00-evolve-mobile-process__title">
          {EVOLVE_OPERATING_PROCESS_COPY.title}
        </h2>
        <p className="site00-evolve-mobile-process__subtitle">{EVOLVE_OPERATING_PROCESS_COPY.subtitle}</p>
      </header>
      <div className="site00-evolve-mobile-process__scroll">
        <ol className="site00-evolve-mobile-process__track">
          {EVOLVE_PROCESS_STEPS.map((step, index) => (
            <li key={step.num} className="site00-evolve-mobile-process__step">
              <span className="site00-evolve-mobile-process__num">{step.num}</span>
              <EvolveProcessStepArt step={step.title} />
              <h3 className="site00-evolve-mobile-process__name">{step.title}</h3>
              <p className="site00-evolve-mobile-process__body">{step.body}</p>
              {index < EVOLVE_PROCESS_STEPS.length - 1 ? (
                <span className="site00-evolve-mobile-process__connector" aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
