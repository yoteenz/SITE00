import { BLDR_SEQUENCE_STEPS } from '../../../config/bldr-hub-stages';

export function BldrSequenceIndicator() {
  return (
    <nav className="site00-bldr-mobile-sequence" aria-label="BUILD SEQUENCE">
      <ol className="site00-bldr-mobile-sequence__track">
        {BLDR_SEQUENCE_STEPS.map((step, index) => {
          const isLast = index === BLDR_SEQUENCE_STEPS.length - 1;
          return (
            <li
              key={step.label}
              className={`site00-bldr-mobile-sequence__step ${step.terminal ? 'site00-bldr-mobile-sequence__step--terminal' : ''}`.trim()}
            >
              <span className="site00-bldr-mobile-sequence__marker" aria-hidden="true">
                {step.terminal ? <span className="site00-bldr-mobile-sequence__dot" /> : step.num}
              </span>
              <span className="site00-bldr-mobile-sequence__label">{step.label}</span>
              {!isLast ? <span className="site00-bldr-mobile-sequence__connector" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
