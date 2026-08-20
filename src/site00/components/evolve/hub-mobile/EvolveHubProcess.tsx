import { EVOLVE_PROCESS_STEPS } from '../../../config/evolve';
import { EVOLVE_HUB_PROCESS_COPY } from '../../../config/evolve-hub-mobile';
import { EvolveProcessStepArt } from '../mobile/EvolveProcessStepArt';

export function EvolveHubProcess() {
  return (
    <section className="site00-evolve-hub-process" id="process" aria-labelledby="evolve-hub-process-heading">
      <header className="site00-evolve-hub-section-header">
        <h2 id="evolve-hub-process-heading" className="site00-evolve-hub-section-header__title">
          {EVOLVE_HUB_PROCESS_COPY.title}
        </h2>
        <p className="site00-evolve-hub-section-header__subtitle">{EVOLVE_HUB_PROCESS_COPY.subtitle}</p>
      </header>
      <div className="site00-evolve-hub-process__scroll">
        <ol className="site00-evolve-hub-process__track">
          {EVOLVE_PROCESS_STEPS.map((step, index) => (
            <li key={step.num} className="site00-evolve-hub-process__step">
              <span className="site00-evolve-hub-process__num">{step.num}</span>
              <EvolveProcessStepArt step={step.title} />
              <h3 className="site00-evolve-hub-process__name">{step.title}</h3>
              <p className="site00-evolve-hub-process__body">{step.body}</p>
              {index < EVOLVE_PROCESS_STEPS.length - 1 ? (
                <span className="site00-evolve-hub-process__connector" aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
