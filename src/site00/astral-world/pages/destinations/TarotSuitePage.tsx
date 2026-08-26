import { useAstralWorld } from '../../context/AstralWorldContext';
import { TakeMeSomewherePanel } from '../../components/TakeMeSomewherePanel';

export default function TarotSuitePage() {
  const { readers } = useAstralWorld();
  const suiteReaders = readers.filter((r) => r.currentDestination === 'tarot-suite');
  const privateCount = suiteReaders.filter((r) => r.presence === 'READING_NOW').length;

  return (
    <>
      <div className="aw-hero" style={{ minHeight: 220 }}>
        <div className="aw-hero__bg aw-hero__bg--pending" aria-hidden />
        <div className="aw-hero__content" style={{ minHeight: 220 }}>
          <p className="aw-label">Astréa · Destination</p>
          <h1 className="aw-display aw-display--hero">Tarot Suite</h1>
          <p className="aw-muted">Deep · private · intentional</p>
          <button type="button" className="aw-btn-primary" style={{ marginTop: '1rem' }}>Enter Suite →</button>
        </div>
      </div>
      <section className="aw-card aw-card--gold">
        <h2 className="aw-display aw-display--section">Suite Status</h2>
        <p className="aw-muted">{privateCount} private reading(s) in progress · identities protected</p>
        <p className="aw-muted">{suiteReaders.length} reader(s) available in suite</p>
      </section>
      <section className="aw-card">
        <h2 className="aw-display aw-display--section">Choose Reader</h2>
        {suiteReaders.map((r) => (
          <div key={r.id} className="aw-presence-item">
            <div className="aw-avatar">{r.avatarInitials}</div>
            <div style={{ flex: 1 }}>
              <strong>{r.name}</strong>
              <div className="aw-muted">{r.specialty}</div>
            </div>
            <span className="aw-status aw-status--reading">{r.presence.replace(/_/g, ' ')}</span>
          </div>
        ))}
      </section>
      <TakeMeSomewherePanel compact />
    </>
  );
}
