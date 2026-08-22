import { Link } from 'react-router-dom';
import type { ClientStudioActivityEvent } from '../../services/clientProductionApi';

type ActivityStreamProps = {
  events: ClientStudioActivityEvent[];
  viewAllRoute: string;
};

export function ActivityStream({ events, viewAllRoute }: ActivityStreamProps) {
  return (
    <section className="site00-studio-panel site00-studio-panel--activity" aria-labelledby="studio-activity">
      <h2 id="studio-activity" className="site00-studio-panel__eyebrow">ACTIVITY STREAM</h2>
      {events.length === 0 ? (
        <p className="site00-studio-panel__empty">ACTIVITY WILL APPEAR AS PRODUCTION BEGINS</p>
      ) : (
        <ol className="site00-studio-activity">
          {events.slice(0, 6).map((ev) => (
            <li key={ev.id} className="site00-studio-activity__row">
              <span className="site00-studio-activity__node" aria-hidden="true" />
              <div>
                <time className="site00-studio-activity__time" dateTime={ev.timestamp}>{ev.clockTime}</time>
                <p className="site00-studio-activity__summary">{ev.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
      <Link to={viewAllRoute} className="site00-studio-panel__link">VIEW ALL ACTIVITY →</Link>
    </section>
  );
}
