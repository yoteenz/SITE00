import { Link } from 'react-router-dom';
import type { CtrlRoomActivityRow } from '../../hooks/useCtrlRoomData';
import { SITE00_ROUTES } from '../../config/routes';

type CtrlRoomActivityPanelProps = {
  rows: CtrlRoomActivityRow[];
};

export function CtrlRoomActivityPanel({ rows }: CtrlRoomActivityPanelProps) {
  return (
    <section className="site00-ctrl-panel site00-ctrl-panel--activity" aria-labelledby="ctrl-room-activity-heading">
      <h2 id="ctrl-room-activity-heading" className="site00-ctrl-panel__title">
        RECENT ACTIVITY
      </h2>
      {rows.length === 0 ? (
        <p className="site00-ctrl-panel__empty">NO RECENT ACTIVITY YET.</p>
      ) : (
        <ul className="site00-ctrl-activity-list">
          {rows.map((row) => (
            <li key={row.id} className="site00-ctrl-activity-list__row">
              <span className="site00-ctrl-activity-list__id">{row.label}</span>
              <span className="site00-ctrl-activity-list__desc">{row.action}</span>
              <span className="site00-ctrl-activity-list__time">{row.timeAgo}</span>
            </li>
          ))}
        </ul>
      )}
      <Link to={SITE00_ROUTES.controlSettings} className="site00-ctrl-panel__link">
        VIEW ALL ACTIVITY →
      </Link>
    </section>
  );
}
