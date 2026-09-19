import { useAstralWorld } from '../context/AstralWorldContext';
import { AstralScene } from '../components/immersive/AstralScene';

export default function AstralWorldDailyCardPage() {
  const { dailyCard } = useAstralWorld();
  return (
    <div className="aw-mobile-screen aw-daily-card-visual">
      <AstralScene crop="DAILY_CARD" minHeight={420}>
        <p className="aw-label">{dailyCard.date}</p>
      </AstralScene>
      <div className="aw-daily-card-visual__face">
        <h2 className="aw-display">{dailyCard.cardName}</h2>
      </div>
      <section className="aw-card aw-card--gold" style={{ margin: '1rem 0.75rem' }}>
        <p className="aw-muted">{dailyCard.meaning}</p>
        <p className="aw-muted" style={{ marginTop: '1rem', fontSize: '0.65rem' }}>Prototype seeded daily draw — not personalized AI.</p>
      </section>
    </div>
  );
}
