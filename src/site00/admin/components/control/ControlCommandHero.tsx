import type { ControlCommandPayload } from '../../types/control';

type ControlCommandHeroProps = {
  data: ControlCommandPayload;
  greeting?: string;
};

export function ControlCommandHero({ data, greeting }: ControlCommandHeroProps) {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'GOOD MORNING' : hour < 17 ? 'GOOD AFTERNOON' : 'GOOD EVENING';
  const name = data.operator.displayName;

  return (
    <header className="site00-control-hero">
      <div className="site00-control-hero__copy">
        <p className="site00-control-hero__greeting">{greeting ?? `${timeGreeting}, ${name}.`}</p>
        <div className="site00-control-hero__brand">
          <span className="site00-control-hero__site">SITE 00</span>
          <span className="site00-control-hero__diamond" aria-hidden="true">◆</span>
        </div>
        <p className="site00-control-hero__kicker">00 / CONTROL</p>
        <p className="site00-control-hero__env-label">OPERATOR ENVIRONMENT</p>
        <h1 className="site00-control-hero__headline">WHAT NEEDS MY ATTENTION?</h1>
        <div className="site00-control-hero__status">
          <span className="site00-control-hero__status-dot" aria-hidden="true" />
          <span>SYSTEM STATUS · {data.systemHealth.overall === 'OPERATIONAL' ? 'ONLINE' : data.systemHealth.summary}</span>
        </div>
        <p className="site00-control-hero__operator">{data.operator.role} · {name}</p>
      </div>
      <div className="site00-control-hero__reticle" aria-hidden="true" />
    </header>
  );
}
