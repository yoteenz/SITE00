import { Link } from 'react-router-dom';
import type { ControlActivityItem } from '../../types/control';

type ActivityLedgerProps = {
  items: ControlActivityItem[];
  viewAllHref?: string;
};

export function ActivityLedger({ items, viewAllHref }: ActivityLedgerProps) {
  return (
    <section className="site00-control-panel site00-control-panel--activity" aria-labelledby="control-activity-heading">
      <div className="site00-control-panel__head">
        <h2 id="control-activity-heading" className="site00-control-panel__title">ACTIVITY STREAM</h2>
        {viewAllHref ? <Link to={viewAllHref} className="site00-control-panel__link">VIEW ALL →</Link> : null}
      </div>
      {items.length === 0 ? (
        <p className="site00-control-empty">ACTIVITY WILL APPEAR AS PRODUCTION BEGINS</p>
      ) : (
        <ol className="site00-control-activity">
          {items.slice(0, 8).map((ev) => (
            <li key={ev.id} className="site00-control-activity__row">
              <span className="site00-control-activity__node" aria-hidden="true" />
              <div>
                <time className="site00-control-activity__time" dateTime={ev.timestamp}>{ev.clockTime}</time>
                <p className="site00-control-activity__summary">{ev.summary}</p>
                {ev.projectName ? <p className="site00-control-activity__project">{ev.projectName}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
