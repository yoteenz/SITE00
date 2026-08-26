import { useAstralWorld } from '../context/AstralWorldContext';

export default function AstralWorldJournalPage() {
  const { journey } = useAstralWorld();

  return (
    <>
      <h1 className="aw-display aw-display--hero">Your Journey</h1>
      <section className="aw-card aw-card--gold">
        <h2 className="aw-display aw-display--section">Recent Activity</h2>
        {journey.map((entry) => (
          <div key={entry.id} className="aw-presence-item">
            <div style={{ flex: 1 }}>
              <span className="aw-label">{entry.kind}</span>
              <strong>{entry.title}</strong>
              <div className="aw-muted">{entry.subtitle} · {entry.date}</div>
            </div>
          </div>
        ))}
      </section>
      <section className="aw-card">
        <div className="aw-hero" style={{ minHeight: 120 }}>
          <div className="aw-hero__bg" aria-hidden />
          <div className="aw-hero__content" style={{ minHeight: 120 }}>
            <p className="aw-muted">Visual journal artifact · REFERENCE_ASSET_PENDING</p>
          </div>
        </div>
      </section>
    </>
  );
}
