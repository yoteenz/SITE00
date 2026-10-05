import type { OperationalPulse } from '../../../../shared/site00-studio-world-production/founderWorkspace/types';

type OperationalPulseProps = {
  pulse: OperationalPulse;
  onPrimaryAction?: () => void;
};

export function OperationalPulsePanel({ pulse, onPrimaryAction }: OperationalPulseProps) {
  const { counts, primaryAction } = pulse;

  return (
    <section className="site00-fws-pulse" aria-label="Today at NDX">
      <div className="site00-fws-pulse__header">
        <h2 className="site00-fws-pulse__title">TODAY AT NDX</h2>
        {primaryAction ? (
          onPrimaryAction ? (
            <button type="button" className="site00-fws-pulse__cta" onClick={onPrimaryAction}>
              {primaryAction.label}
            </button>
          ) : (
            <a href={primaryAction.href} className="site00-fws-pulse__cta">
              {primaryAction.label}
            </a>
          )
        ) : (
          <span className="site00-fws-pulse__clear">NO WORK NEEDS YOUR EYE</span>
        )}
      </div>
      <div className="site00-fws-pulse__counts">
        <div className="site00-fws-pulse__count">
          <span className="site00-fws-pulse__num">{counts.beingMade}</span>
          <span className="site00-fws-pulse__label">BEING MADE</span>
        </div>
        <div className="site00-fws-pulse__count site00-fws-pulse__count--accent">
          <span className="site00-fws-pulse__num">{counts.needYourEye}</span>
          <span className="site00-fws-pulse__label">NEED YOUR EYE</span>
        </div>
        <div className="site00-fws-pulse__count">
          <span className="site00-fws-pulse__num">{counts.developing}</span>
          <span className="site00-fws-pulse__label">DEVELOPING</span>
        </div>
        <div className="site00-fws-pulse__count">
          <span className="site00-fws-pulse__num">{counts.fromAudience}</span>
          <span className="site00-fws-pulse__label">FROM AUDIENCE</span>
        </div>
      </div>
    </section>
  );
}
