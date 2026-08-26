import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';

export function AstralWorldRightRail() {
  const { notifications, markNotificationRead } = useAstralWorld();

  return (
    <aside className="aw-shell__rail aw-desktop-only" aria-label="Notifications and journey">
      <div className="aw-card aw-card--gold">
        <div className="aw-card__header">
          <h2 className="aw-display aw-display--section">Notifications</h2>
          <span className="aw-label">Live</span>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {notifications.map((n) => (
            <li key={n.id} style={{ marginBottom: '0.75rem', opacity: n.read ? 0.55 : 1 }}>
              <div className="aw-label">{n.type.replace(/_/g, ' ')}</div>
              <strong>{n.title}</strong>
              <p className="aw-muted" style={{ margin: '0.25rem 0' }}>
                {n.body}
              </p>
              <Link
                to={n.actionRoute}
                className="aw-btn-secondary"
                onClick={() => markNotificationRead(n.id)}
              >
                {n.actionLabel}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="aw-card">
        <h2 className="aw-display aw-display--section">Your Journey</h2>
        <Link to="/projects/astral-world/experience/journal" className="aw-btn-primary">
          Open Journal →
        </Link>
      </div>
    </aside>
  );
}
