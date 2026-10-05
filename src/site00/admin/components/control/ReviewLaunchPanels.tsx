import { Link } from 'react-router-dom';
import type { ControlLaunchItem, ControlReviewItem } from '../../types/control';

export function UpcomingReviewsPanel({ items }: { items: ControlReviewItem[] }) {
  return (
    <section className="site00-control-panel site00-control-panel--reviews" aria-labelledby="control-reviews-heading">
      <div className="site00-control-panel__head">
        <h2 id="control-reviews-heading" className="site00-control-panel__title">UPCOMING REVIEWS</h2>
      </div>
      {items.length === 0 ? (
        <p className="site00-control-empty">NO REVIEWS READY</p>
      ) : (
        <ul className="site00-control-review-list">
          {items.slice(0, 4).map((r) => (
            <li key={r.id}>
              <Link to={r.route} className="site00-control-review-row">
                <span className="site00-control-review-row__badge">{r.category.charAt(0)}</span>
                <div>
                  <p className="site00-control-review-row__project">{r.projectName}</p>
                  <p className="site00-control-review-row__title">{r.title}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function LaunchQueuePanel({ items }: { items: ControlLaunchItem[] }) {
  return (
    <section className="site00-control-panel site00-control-panel--launch" aria-labelledby="control-launch-heading">
      <div className="site00-control-panel__head">
        <h2 id="control-launch-heading" className="site00-control-panel__title">LAUNCH QUEUE</h2>
      </div>
      {items.length === 0 ? (
        <p className="site00-control-empty">NO LAUNCH QUEUE</p>
      ) : (
        <>
          <p className="site00-control-launch-count">{String(items.length).padStart(2, '0')} PROJECTS IN QUEUE</p>
          <ul className="site00-control-launch-list">
            {items.map((item) => (
              <li key={item.projectId}>
                <Link to={item.route} className="site00-control-launch-row">
                  <span className="site00-control-launch-row__name">{item.projectName}</span>
                  <span className="site00-control-launch-row__meta">{item.domain ?? 'NO DOMAIN'} · {item.qaStatus}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
