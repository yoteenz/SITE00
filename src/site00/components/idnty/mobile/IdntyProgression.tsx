import { IDNTY_BRAND_STATES } from '../../../config/identity';

type IdntyProgressionProps = {
  activeCode: string;
};

export function IdntyProgression({ activeCode }: IdntyProgressionProps) {
  return (
    <nav className="site00-idnty-diagnostic-progression" aria-label="IDENTITY STATE PROGRESSION">
      <ol className="site00-idnty-diagnostic-progression__track">
        {IDNTY_BRAND_STATES.map((state, index) => {
          const isLast = index === IDNTY_BRAND_STATES.length - 1;
          const active = state.code === activeCode;
          return (
            <li
              key={state.id}
              className={`site00-idnty-diagnostic-progression__step ${active ? 'site00-idnty-diagnostic-progression__step--active' : ''}`.trim()}
            >
              <span className="site00-idnty-diagnostic-progression__marker" aria-current={active ? 'step' : undefined}>
                {state.code}
              </span>
              {!isLast ? <span className="site00-idnty-diagnostic-progression__connector" aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
      <p className="site00-idnty-diagnostic-progression__label">IDENTITY STATE PROGRESSION</p>
    </nav>
  );
}
