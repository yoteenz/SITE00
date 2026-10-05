import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import { WhosHerePanel } from './WhosHerePanel';
import { YourWorldYourWayPanel } from './PlacesPopularPanel';
import { AstralPortrait } from './immersive/AstralPortrait';

export function AstralWorldRightRail() {
  const { notifications, markNotificationRead, path, journey } = useAstralWorld();

  return (
    <aside className="aw-shell__rail aw-desktop-only aw-ref-rail" aria-label="Social context rail">
      <WhosHerePanel />
      <div className="aw-card aw-card--gold">
        <div className="aw-card__header">
          <h2 className="aw-display aw-display--section">Notifications</h2>
          <span className="aw-label">Live</span>
        </div>
        <ul className="aw-ref-notif-list">
          {notifications.map((n) => (
            <li key={n.id} className={n.read ? 'aw-ref-notif--read' : ''}>
              <div className="aw-ref-notif-row">
                {n.subjectPersonId ? (
                  <AstralPortrait
                    personId={n.subjectPersonId}
                    avatarId={n.subjectAvatarId}
                    name={n.title}
                    size={40}
                    variant="reader"
                  />
                ) : null}
                <div className="aw-ref-notif-row__body">
                  <div className="aw-label">{n.type.replace(/_/g, ' ')}</div>
                  <strong>{n.title}</strong>
                  <p className="aw-muted">{n.body}</p>
                  <Link to={n.actionRoute} className="aw-btn-secondary" onClick={() => markNotificationRead(n.id)}>
                    {n.actionLabel}
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link to={path('notification-demo')} className="aw-btn-secondary aw-ref-notif-demo">
          Mobile alert demo →
        </Link>
      </div>
      <div className="aw-card aw-ref-journey-card">
        <h2 className="aw-display aw-display--section">Your Journey</h2>
        {journey.slice(0, 2).map((j) => (
          <p key={j.id} className="aw-muted aw-ref-journey-item">
            <strong>{j.kind === 'READING' ? 'Last Reading' : j.kind === 'SAVED' ? 'Saved Reading' : 'Journal'}</strong>
            <br />
            {j.title}
          </p>
        ))}
        <Link to={path('journal')} className="aw-btn-primary">Open Journal →</Link>
      </div>
      <YourWorldYourWayPanel rail />
    </aside>
  );
}
