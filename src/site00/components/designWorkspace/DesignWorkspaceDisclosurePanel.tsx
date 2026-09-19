/**
 * P0.VR.6 — Collapsible Recent Activity + Quick Actions (progressive disclosure).
 */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DesignWorkspaceActivityEntry } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2b/types.js';
import type { DesignWorkspaceQuickAction } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vr2b/types.js';

const STORAGE_KEY = 'site00-dw-activity-expanded';

type Props = {
  activity: DesignWorkspaceActivityEntry[];
  quickActions: DesignWorkspaceQuickAction[];
};

export function DesignWorkspaceDisclosurePanel({ activity, quickActions }: Props) {
  const [activityOpen, setActivityOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === '1') setActivityOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  const toggleActivity = useCallback(() => {
    setActivityOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  return (
    <div className="site00-dw-v3-disclosure" data-design-disclosure="progressive">
      <button
        type="button"
        className={`site00-dw-v3-disclosure__row${activityOpen ? ' is-open' : ''}`}
        onClick={toggleActivity}
        aria-expanded={activityOpen}
        aria-controls="site00-dw-activity-panel"
      >
        <span className="site00-dw-v3-disclosure__label">RECENT ACTIVITY</span>
        <span className="site00-dw-v3-disclosure__count">{activity.length}</span>
        <span className="site00-dw-v3-disclosure__chev" aria-hidden>
          {activityOpen ? '▴' : '▾'}
        </span>
      </button>
      {activityOpen ? (
        <div id="site00-dw-activity-panel" className="site00-dw-v3-disclosure__panel">
          <ul className="site00-dw-v3-activity-list">
            {activity.length ? (
              activity.map((entry) => (
                <li key={entry.id}>
                  <span className="site00-dw-v3-activity-list__label">{entry.label.toUpperCase()}</span>
                  <span className="site00-dw-v3-activity-list__meta">
                    {new Date(entry.timestamp).toLocaleString()} · {entry.actor.toUpperCase()}
                  </span>
                </li>
              ))
            ) : (
              <li className="site00-dw-v3-activity-list__empty">NO RECENT ACTIVITY</li>
            )}
          </ul>
        </div>
      ) : null}

      <button
        type="button"
        className={`site00-dw-v3-disclosure__row site00-dw-v3-disclosure__row--quick${quickOpen ? ' is-open' : ''}`}
        onClick={() => setQuickOpen((v) => !v)}
        aria-expanded={quickOpen}
        aria-controls="site00-dw-quick-panel"
      >
        <span className="site00-dw-v3-disclosure__label">QUICK ACTIONS</span>
        <span className="site00-dw-v3-disclosure__chev" aria-hidden>
          {quickOpen ? '▴' : '›'}
        </span>
      </button>
      {quickOpen ? (
        <div id="site00-dw-quick-panel" className="site00-dw-v3-disclosure__panel site00-dw-v3-disclosure__panel--quick">
          <div className="site00-dw-v3-quick-grid">
            {quickActions.map((action) =>
              action.href ? (
                <Link key={action.id} to={action.href} className="site00-dw-v3-quick-card">
                  <strong>{action.title.toUpperCase()}</strong>
                  <span>{action.subtitle.toUpperCase()}</span>
                </Link>
              ) : (
                <button key={action.id} type="button" className="site00-dw-v3-quick-card">
                  <strong>{action.title.toUpperCase()}</strong>
                  <span>{action.subtitle.toUpperCase()}</span>
                </button>
              ),
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
