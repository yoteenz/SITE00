import type { ControlSystemHealth } from '../../types/control';

type SystemHealthPanelProps = {
  health: ControlSystemHealth;
};

export function SystemHealthPanel({ health }: SystemHealthPanelProps) {
  return (
    <section className="site00-control-panel site00-control-panel--health" aria-labelledby="control-health-heading">
      <div className="site00-control-panel__head">
        <h2 id="control-health-heading" className="site00-control-panel__title">SYSTEM HEALTH</h2>
        <span className={`site00-control-health__overall site00-control-health__overall--${health.overall.toLowerCase()}`}>
          {health.summary}
        </span>
      </div>
      <ul className="site00-control-health-grid">
        {health.systems.map((sys) => (
          <li key={sys.id} className="site00-control-health-item">
            <p className="site00-control-health-item__label">{sys.label}</p>
            <p className={`site00-control-health-item__state site00-control-health-item__state--${sys.state.toLowerCase()}`}>
              {sys.state}
            </p>
            <p className="site00-control-health-item__detail">{sys.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
