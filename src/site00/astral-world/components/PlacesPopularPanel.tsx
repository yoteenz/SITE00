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

export function YourWorldYourWayPanel({ rail }: { rail?: boolean }) {
  const { path } = useAstralWorld();
  const items = [
    { to: path('custom-avatar'), label: 'Custom Avatar', desc: 'Shape how you appear in Astral World' },
    { to: path('join-circle'), label: 'Join a Circle', desc: 'Find your community' },
    { to: path('create-deck'), label: 'Create a Deck', desc: 'Your people as tarot archetypes' },
    { to: path('daily-card'), label: 'Daily Card', desc: 'Today\'s guidance' },
  ];
  return (
    <section className={`aw-card aw-card--gold${rail ? ' aw-ref-yww-rail' : ''}`} id="your-world">
      <h2 className="aw-display aw-display--section">Your World, Your Way</h2>
      <div className={rail ? 'aw-ref-yww-grid' : 'aw-dest-grid'}>
        {items.map((item) => (
          <Link key={item.to} to={item.to} className="aw-dest-card">
            <strong>{item.label}</strong>
            {!rail ? (
              <span className="aw-muted" style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.25rem' }}>{item.desc}</span>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
