import { Link } from 'react-router-dom';
import { friendLocationLabel } from '../../../../shared/site00-astral-world/presenceService.js';
import { useAstralWorld } from '../context/AstralWorldContext';

export default function AstralWorldFriendsPage() {
  const { friends, path } = useAstralWorld();

  return (
    <>
      <h1 className="aw-display aw-display--hero">Meet My Friends</h1>
      <section className="aw-card aw-card--gold">
        <h2 className="aw-display aw-display--section">See Who&apos;s Here</h2>
        {friends.map((f) => {
          const loc = friendLocationLabel(f.id);
          const destPath = f.currentDestination
            ? path(`astrea/${f.currentDestination}`)
            : path('astrea');
          return (
            <div key={f.id} className="aw-presence-item">
              <div className="aw-avatar">{f.avatarInitials}</div>
              <div style={{ flex: 1 }}>
                <strong>{f.name}</strong>
                <div className="aw-muted">{loc ? `at ${loc}` : 'In Astréa'}</div>
              </div>
              {f.joinable ? (
                <Link to={destPath} className="aw-btn-primary">{f.tableId ? 'Join Table' : 'Join Here'}</Link>
              ) : (
                <span className="aw-status aw-status--reading">Busy</span>
              )}
            </div>
          );
        })}
      </section>
    </>
  );
}
