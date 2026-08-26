import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import { AstralScene } from '../components/immersive/AstralScene';
import { MobileJournalScene } from '../components/scenes/MobileJournalScene';

function DesktopJournalLayout() {
  const { journey, demoSession, path } = useAstralWorld();

  return (
    <div className="aw-mobile-screen aw-journal-artifact">
      <AstralScene crop="JOURNAL" minHeight={300}>
        <p className="aw-label">Open Journal</p>
        <h1 className="aw-display aw-display--hero" style={{ margin: 0 }}>Tarot Journal</h1>
        <p className="aw-muted">{demoSession.journalEntryCount} saved entries from your journey</p>
      </AstralScene>
      <div className="aw-journal-artifact__entries">
        <section className="aw-card aw-card--gold">
          <h2 className="aw-display aw-display--section">Your Journey</h2>
          {journey.map((entry) => (
            <div key={entry.id} className="aw-presence-item aw-presence-item--immersive">
              <div style={{ flex: 1 }}>
                <div className="aw-label">{entry.kind}</div>
                <strong>{entry.title}</strong>
                <div className="aw-muted">{entry.subtitle} · {entry.date}</div>
              </div>
              <button type="button" className="aw-btn-secondary">
                {entry.kind === 'JOURNAL' ? 'Open' : 'View Reading'}
              </button>
            </div>
          ))}
        </section>
        <Link to={path('daily-card')} className="aw-btn-primary">Daily Card →</Link>
      </div>
    </div>
  );
}

export default function AstralWorldJournalPage() {
  return (
    <>
      <div className="aw-desktop-only"><DesktopJournalLayout /></div>
      <div className="aw-mobile-only aw-route-scene"><MobileJournalScene /></div>
    </>
  );
}
