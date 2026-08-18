import { Link } from 'react-router-dom';
import type { CtrlRoomMetricState } from '../../hooks/useCtrlRoomData';

type CtrlRoomMetricCardProps = {
  label: string;
  value: string;
  state: CtrlRoomMetricState;
  actionLabel: string;
  actionHref: string;
  icon: 'globe' | 'target' | 'cube' | 'calendar';
};

function MetricIcon({ icon }: { icon: CtrlRoomMetricCardProps['icon'] }) {
  const paths: Record<CtrlRoomMetricCardProps['icon'], string> = {
    globe: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 2c1.2 0 2.3.3 3.3.8M12 4v16M4 12h16',
    target: 'M12 2a10 10 0 100 20 10 10 0 000-20m0 4a6 6 0 110 12 6 6 0 010-12m0 2a4 4 0 100 8 4 4 0 000-8',
    cube: 'M4 7l8-4 8 4v10l-8 4-8-4V7zm8 10l8-4M12 11V3',
    calendar: 'M7 3v2M17 3v2M4 9h16M6 5h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2z',
  };
  return (
    <svg className="site00-ctrl-metric__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d={paths[icon]} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CtrlRoomMetricCard({ label, value, state, actionLabel, actionHref, icon }: CtrlRoomMetricCardProps) {
  return (
    <article className="site00-ctrl-metric">
      <p className="site00-ctrl-metric__label">{label}</p>
      <div className="site00-ctrl-metric__row">
        <p className="site00-ctrl-metric__value" aria-busy={state === 'loading'}>
          {state === 'loading' ? '…' : value}
        </p>
        <MetricIcon icon={icon} />
      </div>
      <Link to={actionHref} className="site00-ctrl-metric__action">
        {actionLabel}
      </Link>
    </article>
  );
}
