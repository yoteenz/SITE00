import type { ClientStudioSignalMetric } from '../../services/clientProductionApi';

type ProjectSignalProps = {
  metrics: ClientStudioSignalMetric[];
};

function metricIcon(id: string) {
  switch (id) {
    case 'identity':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M12 3 L12 21 M3 12 L21 12" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
        </svg>
      );
    case 'assets':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 16 L12 4 L20 16 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case 'screens':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="5" width="18" height="14" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case 'build':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 18 L12 6 L18 18 Z" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="4" y="4" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
  }
}

export function ProjectSignal({ metrics }: ProjectSignalProps) {
  return (
    <section className="site00-studio-panel site00-studio-panel--signal" aria-labelledby="studio-project-signal">
      <h2 id="studio-project-signal" className="site00-studio-panel__eyebrow">PROJECT SIGNAL</h2>
      <div className="site00-studio-signal-grid">
        {metrics.map((m) => (
          <article key={m.id} className="site00-studio-signal-metric">
            <div className="site00-studio-signal-metric__icon">{metricIcon(m.id)}</div>
            <p className="site00-studio-signal-metric__label">{m.label}</p>
            {m.pct !== null ? (
              <>
                <p className="site00-studio-signal-metric__pct">{m.pct}%</p>
                <div className="site00-studio-signal-metric__bar" aria-hidden="true">
                  <span style={{ width: `${m.pct}%` }} />
                </div>
              </>
            ) : null}
            <p className="site00-studio-signal-metric__state">{m.stateLabel}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
