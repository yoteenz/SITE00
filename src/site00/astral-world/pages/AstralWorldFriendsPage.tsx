import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import { friendLocationLabel } from '../../../../shared/site00-astral-world/presenceService.js';

export default function MeetMyFriendsPage() {
  const { friends } = useAstralWorld();

  return (
    <>
      <h1 className="aw-display aw-display--hero">Meet My Friends</h1>
      <section className="aw-card aw-card--gold">
        <h2 className="aw-display aw-display--section">See Who&apos;s Here</h2>
        {friends.map((f) => {
          const loc = friendLocationLabel(f.id);
          const destRoute = f.currentDestination
            ? `/projects/astral-world/experience/astrea/${f.currentDestination}`
            : '/projects/astral-world/experience/astrea';
          return (
            <div key={f.id} className="aw-presence-item">
              <div className="aw-avatar">{f.avatarInitials}</div>
              <div style={{ flex: 1 }}>
                <strong>{f.name}</strong>
                <div className="aw-muted">{loc ?? 'Location hidden'}</div>
              </div>
              {f.joinable && loc ? (
                <Link to={destRoute} className="aw-btn-secondary">Join Here</Link>
              ) : (
                <span className="aw-status aw-status--reading">Busy</span>
              )}
            </div>
          );
        })}
      </section>
      <div className="aw-lock-screen-demo aw-mobile-only">
        <div className="aw-lock-screen-demo__label">Presence alert prototype (visual demo only)</div>
        <strong>Jane is at the Coffee Shop</strong>
        <p className="aw-muted">Not a native push notification</p>
      </div>
    </>
  );
}
