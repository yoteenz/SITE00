import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';

/** Visual demo only — PUSH_NOTIFICATION_DEMO, not native push */
export default function AstralWorldNotificationDemoPage() {
  const { notifications, path } = useAstralWorld();
  const demos = notifications.slice(0, 3);

  return (
    <div className="aw-mobile-screen">
      <h1 className="aw-display">Presence Alerts</h1>
      <p className="aw-label" data-demo="PUSH_NOTIFICATION_DEMO">PUSH NOTIFICATION DEMO · NOT NATIVE</p>
      {demos.map((n) => (
        <div key={n.id} className="aw-lock-screen-demo">
          <div className="aw-lock-screen-demo__label">ASTRAL WORLD · NOW</div>
          <strong>{n.title}</strong>
          <p className="aw-muted">{n.body}</p>
          <Link to={n.actionRoute} className="aw-btn-primary" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
            {n.actionLabel}
          </Link>
        </div>
      ))}
      <Link to={path('home')} className="aw-btn-secondary">Back to World</Link>
    </div>
  );
}
