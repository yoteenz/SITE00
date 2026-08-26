import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';

export function AstralWorldRightRail() {
  const { notifications, markNotificationRead, path, journey } = useAstralWorld();

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
              <p className="aw-muted" style={{ margin: '0.25rem 0' }}>{n.body}</p>
              <Link to={n.actionRoute} className="aw-btn-secondary" onClick={() => markNotificationRead(n.id)}>
                {n.actionLabel}
              </Link>
            </li>
          ))}
        </ul>
        <Link to={path('notification-demo')} className="aw-btn-secondary" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
          Mobile alert demo →
        </Link>
      </div>
      <div className="aw-card">
        <h2 className="aw-display aw-display--section">Your Journey</h2>
        {journey.slice(0, 2).map((j) => (
          <p key={j.id} className="aw-muted" style={{ marginBottom: '0.35rem' }}>
            <strong>{j.kind === 'READING' ? 'Last Reading' : j.kind === 'SAVED' ? 'Saved Reading' : 'Journal'}</strong>
            <br />
            {j.title}
          </p>
        ))}
        <Link to={path('journal')} className="aw-btn-primary">Open Journal →</Link>
      </div>
    </aside>
  );
}
