import { useAstralWorld } from '../context/AstralWorldContext';

export default function AstralWorldDailyCardPage() {
  const { dailyCard } = useAstralWorld();
  return (
    <div className="aw-mobile-screen">
      <h1 className="aw-display">Daily Card</h1>
      <section className="aw-card aw-card--gold aw-daily-card">
        <p className="aw-label">{dailyCard.date}</p>
        <h2 className="aw-display aw-display--hero" style={{ fontSize: '1.5rem' }}>{dailyCard.cardName}</h2>
        <p className="aw-muted">{dailyCard.meaning}</p>
        <p className="aw-muted" style={{ marginTop: '1rem', fontSize: '0.65rem' }}>Prototype seeded daily draw — not personalized AI.</p>
      </section>
    </div>
  );
}
