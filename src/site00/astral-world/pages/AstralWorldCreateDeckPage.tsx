import { CREATE_DECK_STEPS } from '../../../../shared/site00-astral-world/fixtures.js';

export default function AstralWorldCreateDeckPage() {
  return (
    <div className="aw-mobile-screen">
      <h1 className="aw-display">Create a Deck</h1>
      <section className="aw-card aw-card--gold">
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
