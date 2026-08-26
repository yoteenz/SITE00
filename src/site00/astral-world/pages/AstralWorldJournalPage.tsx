import { Link } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';

export default function AstralWorldJournalPage() {
  const { journey, demoSession, path } = useAstralWorld();

  return (
    <div className="aw-mobile-screen">
      <h1 className="aw-display aw-display--hero">Your Journey</h1>
      <section className="aw-card aw-card--gold aw-journal-book">
        <h2 className="aw-display aw-display--section">Journal · {demoSession.journalEntryCount} entries</h2>
        {journey.map((entry) => (
          <div key={entry.id} className="aw-presence-item">
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
  );
}
