import { Link } from 'react-router-dom';
import type { NeedsYouItem, FocusNowItem } from '../../types/orchestration';

export function NeedsYouPanel({ items }: { items: NeedsYouItem[] }) {
  return (
    <section className="site00-control-panel site00-control-panel--priority" aria-labelledby="needs-you-heading">
      <div className="site00-control-panel__head">
        <h2 id="needs-you-heading" className="site00-control-panel__title">NEEDS YOU</h2>
        <span className="site00-orchestration-count">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="site00-control-empty">NO DECISIONS REQUIRING OPERATOR JUDGMENT</p>
      ) : (
        <ul className="site00-control-priority-list">
          {items.map((item) => (
            <li key={item.id}>
              <Link to={item.route} className="site00-control-priority-row">
                <span className="site00-control-priority__pill site00-control-priority__pill--critical">NEEDS YOU</span>
                <div className="site00-control-priority-row__body">
                  <p className="site00-control-priority-row__project">{item.organizationName}</p>
                  <p className="site00-control-priority-row__title">{item.title}</p>
                  <p className="site00-control-priority-row__detail">{item.reason}</p>
                </div>
                <span className="site00-control-priority-row__chev" aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function FocusNowPanel({ items }: { items: FocusNowItem[] }) {
  return (
    <section className="site00-control-panel" aria-labelledby="focus-now-heading">
      <div className="site00-control-panel__head">
        <h2 id="focus-now-heading" className="site00-control-panel__title">FOCUS NOW</h2>
      </div>
      {items.length === 0 ? (
        <p className="site00-control-empty">NO URGENT OPERATOR FOCUS — SYSTEM CAN CONTINUE</p>
      ) : (
        <ol className="site00-orchestration-focus-list">
          {items.map((item) => (
            <li key={`${item.organizationSlug}-${item.rank}`}>
              <Link to={item.route} className="site00-orchestration-focus-item">
                <span className="site00-orchestration-focus-item__rank">{String(item.rank).padStart(2, '0')}</span>
                <div>
                  <p className="site00-orchestration-focus-item__org">{item.organizationName}</p>
                  <p className="site00-orchestration-focus-item__action">{item.action}</p>
                  <p className="site00-orchestration-focus-item__why">WHY: {item.why}</p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
