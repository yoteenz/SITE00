import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import { YourWorldYourWayPanel } from '../components/PlacesPopularPanel';

export default function AstralWorldProfilePage() {
  const { demoSession, energy, userPresence, journey, path } = useAstralWorld();

  return (
    <div className="aw-mobile-screen">
      <h1 className="aw-display">Profile</h1>
      <section className="aw-card aw-card--gold">
        <div className="aw-avatar" style={{ width: 56, height: 56, fontSize: '1.25rem' }}>{demoSession.displayName[0]}</div>
        <strong>{demoSession.displayName}</strong>
        <p className="aw-muted">{demoSession.membershipBadge}</p>
        <p className="aw-muted">Energy: {energy.replace(/_/g, ' ')}</p>
        <p className="aw-muted">Presence: {userPresence.state.replace(/_/g, ' ')}</p>
      </section>
      <section className="aw-card">
        <h2 className="aw-display aw-display--section">Recent</h2>
        {journey.map((j) => (
          <p key={j.id} className="aw-muted"><strong>{j.title}</strong> — {j.subtitle}</p>
        ))}
        <Link to={path('journal')} className="aw-btn-primary">View Journey →</Link>
      </section>
      <YourWorldYourWayPanel />
      <Link to={path('notification-demo')} className="aw-btn-secondary">Notification Demo →</Link>
    </div>
  );
}
