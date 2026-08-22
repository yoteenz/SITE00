import { Link } from 'react-router-dom';
import type { ControlPriorityItem, ControlPrioritySeverity } from '../../types/control';

type PriorityQueueProps = {
  items: ControlPriorityItem[];
  viewAllHref?: string;
  compact?: boolean;
};

function severityClass(severity: ControlPrioritySeverity): string {
  switch (severity) {
    case 'CRITICAL':
      return 'site00-control-priority__pill--critical';
    case 'ACTION':
      return 'site00-control-priority__pill--action';
    case 'READY':
      return 'site00-control-priority__pill--ready';
    case 'BLOCKED':
      return 'site00-control-priority__pill--blocked';
    case 'MILESTONE':
      return 'site00-control-priority__pill--milestone';
    default:
      return 'site00-control-priority__pill--info';
  }
}

export function PriorityQueue({ items, viewAllHref, compact }: PriorityQueueProps) {
  return (
    <section className="site00-control-panel site00-control-panel--priority" aria-labelledby="control-priority-heading">
      <div className="site00-control-panel__head">
        <h2 id="control-priority-heading" className="site00-control-panel__title">PRIORITY QUEUE</h2>
        {viewAllHref ? (
          <Link to={viewAllHref} className="site00-control-panel__link">VIEW ALL →</Link>
        ) : null}
      </div>
      {items.length === 0 ? (
        <p className="site00-control-empty">NO OPERATOR ATTENTION REQUIRED</p>
      ) : (
        <ul className={`site00-control-priority-list ${compact ? 'site00-control-priority-list--compact' : ''}`.trim()}>
          {items.slice(0, compact ? 4 : 8).map((item) => (
            <li key={item.id}>
              <Link to={item.route} className="site00-control-priority-row">
                <span className={`site00-control-priority__pill ${severityClass(item.severity)}`}>{item.severity}</span>
                <div className="site00-control-priority-row__body">
                  <p className="site00-control-priority-row__project">{item.projectName}</p>
                  <p className="site00-control-priority-row__title">{item.title}</p>
                  {!compact ? <p className="site00-control-priority-row__detail">{item.detail}</p> : null}
                </div>
                <time className="site00-control-priority-row__time" dateTime={item.timestamp}>{item.clockTime}</time>
                <span className="site00-control-priority-row__chev" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
