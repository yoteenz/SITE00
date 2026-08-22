import { Link } from 'react-router-dom';
import type { ControlMetric } from '../../types/control';

type ControlMetricRailProps = {
  metrics: ControlMetric[];
};

function metricIcon(id: string) {
  const common = { width: 16, height: 16, viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1 };
  switch (id) {
    case 'active':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="8" cy="8" r="5" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'input':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M8 2 L14 8 L8 14 L2 8 Z" />
          <path d="M8 5v6M5 8h6" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-hidden="true">
          <rect x="3" y="3" width="10" height="10" />
        </svg>
      );
  }
}

export function ControlMetricRail({ metrics }: ControlMetricRailProps) {
  return (
    <section className="site00-control-metrics" aria-label="GLOBAL OPERATOR METRICS">
      {metrics.map((m) => (
        <Link key={m.id} to={m.route} className="site00-control-metric">
          <span className="site00-control-metric__icon">{metricIcon(m.id)}</span>
          <span className="site00-control-metric__value">{String(m.value).padStart(2, '0')}</span>
          <span className="site00-control-metric__label">{m.label}</span>
          <span className="site00-control-metric__sublabel">{m.sublabel}</span>
        </Link>
      ))}
    </section>
  );
}
