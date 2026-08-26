import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import { YourWorldYourWayPanel } from '../components/PlacesPopularPanel';
import { AstralPortrait } from '../components/immersive/AstralPortrait';
import { AstralScene } from '../components/immersive/AstralScene';

export default function AstralWorldProfilePage() {
  const { demoSession, energy, userPresence, journey, path } = useAstralWorld();

  return (
    <div className="aw-mobile-screen">
      <AstralScene crop="CUSTOM_AVATAR" minHeight={200}>
        <h1 className="aw-display" style={{ margin: 0 }}>Profile</h1>
      </AstralScene>
      <section className="aw-card aw-card--gold" style={{ marginTop: '-2rem', position: 'relative', zIndex: 2 }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <AstralPortrait personId={demoSession.userId} name={demoSession.displayName} initials={demoSession.displayName[0]} size={56} showPresence />
          <div>
            <strong>{demoSession.displayName}</strong>
            <p className="aw-muted">{demoSession.membershipBadge}</p>
          </div>
        </div>
        <p className="aw-muted">Energy: {energy.replace(/_/g, ' ')}</p>
        <p className="aw-muted">Presence: {userPresence.state.replace(/_/g, ' ')}</p>
      </section>
      <section className="aw-card">
        <h2 className="aw-display aw-display--section">Recent Journey</h2>
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
