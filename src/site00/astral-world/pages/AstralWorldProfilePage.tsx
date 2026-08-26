import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';

export default function AstralWorldProfilePage() {
  const { energy, userPresence, journey } = useAstralWorld();

  return (
    <>
      <h1 className="aw-display">Profile</h1>
      <section className="aw-card aw-card--gold">
        <div className="aw-avatar" style={{ width: 56, height: 56, fontSize: '1rem', marginBottom: '0.75rem' }}>R</div>
        <strong>Rea</strong>
        <p className="aw-muted">Membership · Prototype</p>
        <p className="aw-muted">Energy: {energy.replace(/_/g, ' ')}</p>
        <p className="aw-muted">Presence: {userPresence.state.replace(/_/g, ' ')}</p>
      </section>
      <section className="aw-card">
        <h2 className="aw-display aw-display--section">Your World, Your Way</h2>
        <ul className="aw-muted">
          <li>Custom avatar</li>
          <li>Join a circle</li>
          <li>Create a deck</li>
          <li>Daily card</li>
        </ul>
      </section>
      <section className="aw-card">
        <h2 className="aw-display aw-display--section">Favorites</h2>
        <p className="aw-muted">{journey.filter((j) => j.kind === 'SAVED').length} saved readings</p>
      </section>
      <Link to="/projects/astral-world/identity" className="aw-btn-secondary">Identity Review (SITE 00) →</Link>
    </>
  );
}
