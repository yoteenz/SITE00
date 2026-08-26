import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import { AstralScene } from './immersive/AstralScene';
import { destinationCropKeys } from './immersive/immersiveHelpers';

export function PlacesPopularPanel({ compact, immersive }: { compact?: boolean; immersive?: boolean }) {
  const { placesPopular, path } = useAstralWorld();
  return (
    <div className={`aw-places-popular${immersive ? ' aw-places-popular--immersive' : ''}`} style={{ marginTop: compact ? '0.75rem' : '1rem' }}>
      <h3 className="aw-label">Places Popular Now</h3>
      {placesPopular.map((p) => {
        const crops = destinationCropKeys(p.destination);
        return (
          <Link key={p.destination} to={path(`astrea/${p.destination}`)} className="aw-presence-item" style={{ textDecoration: 'none', color: 'inherit' }}>
            {immersive ? (
              <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: 8, overflow: 'hidden' }}>
                <AstralScene crop={crops.mobile} minHeight={56} responsive={false} />
              </div>
            ) : null}
            <div style={{ flex: 1 }}>
              <strong>{p.label}</strong>
              <div className="aw-muted">{p.activitySummary}</div>
            </div>
            <span className="aw-status aw-status--joinable">Go →</span>
          </Link>
        );
      })}
    </div>
  );
}

export function YourWorldYourWayPanel({ rail }: { rail?: boolean }) {
  const { path } = useAstralWorld();
  const items = [
    { to: path('custom-avatar'), label: 'Custom Avatar', crop: 'CUSTOM_AVATAR' as const },
    { to: path('join-circle'), label: 'Join a Circle', crop: 'SOCIAL_PRESENCE' as const },
    { to: path('create-deck'), label: 'Create a Deck', crop: 'CREATE_DECK' as const },
    { to: path('daily-card'), label: 'Daily Card', crop: 'DAILY_CARD' as const },
  ];
  return (
    <section className={`aw-card aw-card--gold${rail ? ' aw-ref-yww-rail' : ''}`} id="your-world">
      <h2 className="aw-display aw-display--section">Your World, Your Way</h2>
      <div className={rail ? 'aw-ref-yww-grid aw-yww-visual-grid' : 'aw-yww-visual-grid'}>
        {items.map((item) => (
          <Link key={item.to} to={item.to} className="aw-yww-visual-item">
            <AstralScene crop={item.crop} minHeight={rail ? 90 : 110} responsive>
              <strong>{item.label}</strong>
            </AstralScene>
          </Link>
        ))}
      </div>
    </section>
  );
}
