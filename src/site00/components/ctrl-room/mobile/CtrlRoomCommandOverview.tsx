import { Link } from 'react-router-dom';
import { CTRL_ROOM_COMMAND_CELLS, CTRL_ROOM_MOBILE_COPY } from '../../../config/ctrl-room-mobile';
import type { CtrlRoomMetrics } from '../../../hooks/useCtrlRoomData';

type CtrlRoomCommandOverviewProps = {
  metrics: CtrlRoomMetrics;
  billingHint: string | null;
};

function CellIcon({ type }: { type: (typeof CTRL_ROOM_COMMAND_CELLS)[number]['icon'] }) {
  if (type === 'target') {
    return (
      <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className="site00-ctrl-room-overview__icon">
        <circle cx="20" cy="20" r="14" stroke="currentColor" strokeWidth="0.75" />
        <circle cx="20" cy="20" r="4" fill="var(--site-red)" />
      </svg>
    );
  }
  if (type === 'cube') {
    return (
      <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className="site00-ctrl-room-overview__icon">
        <path d="M12 24 L20 18 L28 24 L28 32 L20 38 L12 32 Z" stroke="currentColor" strokeWidth="0.75" />
        <path d="M20 18 V10 L28 16 V24" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
        <path d="M20 18 L12 24" stroke="currentColor" strokeWidth="0.75" opacity="0.5" />
      </svg>
    );
  }
  if (type === 'calendar') {
    return (
      <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className="site00-ctrl-room-overview__icon">
        <rect x="10" y="12" width="20" height="18" stroke="currentColor" strokeWidth="0.75" />
        <line x1="10" y1="18" x2="30" y2="18" stroke="currentColor" strokeWidth="0.75" />
        <line x1="16" y1="10" x2="16" y2="14" stroke="currentColor" strokeWidth="0.75" />
        <line x1="24" y1="10" x2="24" y2="14" stroke="currentColor" strokeWidth="0.75" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className="site00-ctrl-room-overview__icon">
      <path d="M20 8 L30 14 V26 L20 32 L10 26 V14 Z" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="20" cy="20" r="2" fill="var(--site-red)" />
    </svg>
  );
}

function resolveCellValue(
  cellId: (typeof CTRL_ROOM_COMMAND_CELLS)[number]['id'],
  metrics: CtrlRoomMetrics,
  billingHint: string | null,
): string {
  switch (cellId) {
    case 'properties':
      return metrics.activeSites.value;
    case 'domains':
      return metrics.domains.value;
    case 'plan':
      return metrics.plan.value;
    case 'billing':
      return billingHint ?? metrics.nextBilling.value;
    default:
      return '—';
  }
}

export function CtrlRoomCommandOverview({ metrics, billingHint }: CtrlRoomCommandOverviewProps) {
  return (
    <section className="site00-ctrl-room-overview" aria-labelledby="ctrl-room-overview-title">
      <header className="site00-ctrl-room-overview__header">
        <div>
          <h2 id="ctrl-room-overview-title" className="site00-ctrl-room-overview__title">
            {CTRL_ROOM_MOBILE_COPY.commandOverview.title}
          </h2>
          <p className="site00-ctrl-room-overview__micro">{CTRL_ROOM_MOBILE_COPY.commandOverview.micro}</p>
        </div>
        <svg viewBox="0 0 48 16" fill="none" aria-hidden="true" className="site00-ctrl-room-overview__spark">
          <path d="M2 12 L10 4 L18 10 L26 2 L34 8 L42 4 L46 8" stroke="rgba(196,30,58,0.35)" strokeWidth="0.75" />
        </svg>
      </header>
      <div className="site00-ctrl-room-overview__grid">
        {CTRL_ROOM_COMMAND_CELLS.map((cell) => (
          <Link key={cell.id} to={cell.href} className="site00-ctrl-room-overview__cell">
            <span className="site00-ctrl-room-overview__index">{cell.index}</span>
            <CellIcon type={cell.icon} />
            <p className="site00-ctrl-room-overview__cell-title">{cell.title}</p>
            <p className="site00-ctrl-room-overview__cell-value">{resolveCellValue(cell.id, metrics, billingHint)}</p>
            <p className="site00-ctrl-room-overview__cell-state">{cell.stateLabel}</p>
            <span className="site00-ctrl-room-overview__cell-action">{cell.actionLabel}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
