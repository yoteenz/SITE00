/**
 * P0.VR.2B — Recent activity + quick actions footer.
 */

import { Link } from 'react-router-dom';
import type { DesignWorkspaceActivityEntry } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2b/client.js';
import type { DesignWorkspaceQuickAction } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2b/types.js';

type Props = {
  activity: DesignWorkspaceActivityEntry[];
  quickActions: DesignWorkspaceQuickAction[];
};

export function DesignWorkspaceFooter({ activity, quickActions }: Props) {
  return (
    <div className="site00-dw-footer">
      <section className="site00-dw-footer__activity">
        <h2>RECENT ACTIVITY</h2>
        <ul>
          {activity.map((entry) => (
            <li key={entry.id}>
              <span className="site00-dw-footer__activity-label">{entry.label}</span>
              <span className="site00-dw-footer__activity-meta">
                {new Date(entry.timestamp).toLocaleString()} · {entry.actor}
              </span>
              <span className={`site00-dw-footer__activity-status is-${entry.status.toLowerCase()}`}>
                {entry.status}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="site00-dw-footer__quick">
        <h2>QUICK ACTIONS</h2>
        <div className="site00-dw-footer__quick-grid">
          {quickActions.map((action) =>
            action.href ? (
              <Link key={action.id} to={action.href} className="site00-dw-footer__quick-card">
                <strong>{action.title}</strong>
                <span>{action.subtitle}</span>
              </Link>
            ) : (
              <button key={action.id} type="button" className="site00-dw-footer__quick-card">
                <strong>{action.title}</strong>
                <span>{action.subtitle}</span>
              </button>
            ),
          )}
        </div>
      </section>
    </div>
  );
}
