import { useAstralWorld } from '../context/AstralWorldContext';

export default function AstralWorldJoinCirclePage() {
  const { circles } = useAstralWorld();
  return (
    <div className="aw-mobile-screen">
      <h1 className="aw-display">Join a Circle</h1>
      <section className="aw-card aw-card--gold">
        <p className="aw-muted">Prototype community discovery — moderation/chat infrastructure reserved.</p>
        {circles.map((c) => (
          <div key={c.id} className="aw-presence-item">
            <div style={{ flex: 1 }}>
              <strong>{c.name}</strong>
              <div className="aw-muted">{c.description}</div>
              <div className="aw-muted">{c.memberCount} members</div>
            </div>
            <button type="button" className="aw-btn-primary">Join</button>
          </div>
        ))}
      </section>
    </div>
  );
}
