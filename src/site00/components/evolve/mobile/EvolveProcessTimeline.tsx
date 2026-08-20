import { EVOLVE_PROCESS_STEPS, EVOLVE_STATE_COPY } from '../../../config/evolve';
import { EvolveProcessStepArt } from './EvolveProcessStepArt';

export function EvolveProcessTimeline() {
  return (
    <section className="site00-evolve-mobile-process" aria-labelledby="evolve-process-heading">
      <header className="site00-evolve-mobile-process__header">
        <h2 id="evolve-process-heading" className="site00-evolve-mobile-process__title">
          {EVOLVE_STATE_COPY.processHeading}
        </h2>
        <p className="site00-evolve-mobile-process__subtitle">{EVOLVE_STATE_COPY.processSubhead}</p>
      </header>

      <ol className="site00-evolve-mobile-process__timeline">
        <div className="site00-evolve-mobile-process__spine" aria-hidden="true" />
        {EVOLVE_PROCESS_STEPS.map((step, index) => {
          const side = index % 2 === 0 ? 'left' : 'right';
          return (
            <li
              key={step.num}
              className={`site00-evolve-mobile-process__step site00-evolve-mobile-process__step--${side}`.trim()}
            >
              <span className="site00-evolve-mobile-process__node" aria-hidden="true" />
              <div className="site00-evolve-mobile-process__content">
                <p className="site00-evolve-mobile-process__num">{step.num}</p>
                <h3 className="site00-evolve-mobile-process__name">{step.title}</h3>
                <p className="site00-evolve-mobile-process__body">{step.body}</p>
              </div>
              <EvolveProcessStepArt step={step.title} />
            </li>
          );
        })}
      </ol>
    </section>
  );
}
