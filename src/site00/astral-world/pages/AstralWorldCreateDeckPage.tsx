import { CREATE_DECK_STEPS } from '../../../../shared/site00-astral-world/fixtures.js';
import { AstralScene } from '../components/immersive/AstralScene';

export default function AstralWorldCreateDeckPage() {
  return (
    <div className="aw-mobile-screen aw-deck-visual">
      <AstralScene crop="CREATE_DECK" minHeight={260}>
        <p className="aw-label">Your People</p>
        <h1 className="aw-display">Create a Deck</h1>
        <p className="aw-muted">Your people as tarot archetypes</p>
      </AstralScene>
      <div className="aw-deck-visual__cards" aria-hidden>
        {['Mom', 'Dad', 'Sis', 'You'].map((label) => (
          <div key={label} className="aw-deck-visual__card">{label}</div>
        ))}
      </div>
      <section className="aw-card aw-card--gold" style={{ margin: '3rem 0.75rem 0.75rem' }}>
        <p className="aw-muted">Prototype teaser for customized family tarot — no generation or checkout yet.</p>
        <ol style={{ paddingLeft: '1.25rem', margin: '1rem 0' }}>
          {CREATE_DECK_STEPS.map((step, i) => (
            <li key={step} className="aw-muted" style={{ marginBottom: '0.5rem' }}>
              <strong>{i + 1}.</strong> {step}
            </li>
          ))}
        </ol>
        <button type="button" className="aw-btn-primary">Start Prototype Flow</button>
      </section>
    </div>
  );
}
