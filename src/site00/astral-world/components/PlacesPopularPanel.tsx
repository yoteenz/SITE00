import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';

export function PlacesPopularPanel({ compact }: { compact?: boolean }) {
  const { placesPopular, path } = useAstralWorld();
  return (
    <div className="aw-places-popular" style={{ marginTop: compact ? '0.75rem' : '1rem' }}>
      <h3 className="aw-label">Places Popular Now</h3>
      {placesPopular.map((p) => (
        <Link key={p.destination} to={path(`astrea/${p.destination}`)} className="aw-presence-item" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ flex: 1 }}>
            <strong>{p.label}</strong>
            <div className="aw-muted">{p.activitySummary}</div>
          </div>
          <span className="aw-status aw-status--joinable">Go →</span>
        </Link>
      ))}
    </div>
  );
}

export function YourWorldYourWayPanel() {
  const { path } = useAstralWorld();
  const items = [
    { to: path('custom-avatar'), label: 'Custom Avatar', desc: 'Shape how you appear in Astral World' },
    { to: path('join-circle'), label: 'Join a Circle', desc: 'Find your community' },
    { to: path('create-deck'), label: 'Create a Deck', desc: 'Your people as tarot archetypes' },
    { to: path('daily-card'), label: 'Daily Card', desc: 'Today\'s guidance' },
  ];
  return (
    <section className="aw-card aw-card--gold" id="your-world">
      <h2 className="aw-display aw-display--section">Your World, Your Way</h2>
      <div className="aw-dest-grid">
        {items.map((item) => (
          <Link key={item.to} to={item.to} className="aw-dest-card">
            <strong>{item.label}</strong>
            <span className="aw-muted" style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.25rem' }}>{item.desc}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
