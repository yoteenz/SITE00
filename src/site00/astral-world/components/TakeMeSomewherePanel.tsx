import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TAKE_ME_SOMEWHERE_CHIPS } from '../../../../shared/site00-astral-world/takeMeSomewhereRouter.js';
import type { TakeMeSomewhereIntent } from '../../../../shared/site00-astral-world/types.js';
import { useAstralWorld } from '../context/AstralWorldContext';

export function TakeMeSomewherePanel({ compact }: { compact?: boolean }) {
  const { takeMeSomewhere, path } = useAstralWorld();
  const navigate = useNavigate();
  const [intent, setIntent] = useState<TakeMeSomewhereIntent | null>(null);
  const [freeText, setFreeText] = useState('');
  const suggestion = intent ? takeMeSomewhere(intent) : null;

  const applyIntent = (i: TakeMeSomewhereIntent) => {
    setIntent(i);
  };

  const go = (destination: string) => {
    navigate(path(`astrea/${destination}`));
  };

  return (
    <section className={`aw-card aw-card--gold${compact ? ' aw-card--compact' : ''}`}>
      <h2 className="aw-display aw-display--section">Take Me Somewhere</h2>
      <p className="aw-muted">What&apos;s going on today?</p>
      <div className="aw-chips">
        {TAKE_ME_SOMEWHERE_CHIPS.map((c) => (
          <button
            key={c.intent}
            type="button"
            className={`aw-chip${intent === c.intent ? ' aw-tab--active' : ''}`}
            onClick={() => applyIntent(c.intent)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <input
        type="text"
        placeholder="Or describe how you feel..."
        value={freeText}
        onChange={(e) => setFreeText(e.target.value)}
        aria-label="Free text intent"
        style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--aw-border)', color: 'var(--aw-text)' }}
      />
      {suggestion ? (
        <div className="aw-routing-suggestion" style={{ marginTop: '1rem' }}>
          <p className="aw-display" style={{ fontSize: '0.95rem' }}>{suggestion.conversationalLine}</p>
          <p className="aw-muted">{suggestion.reason}</p>
          {suggestion.readerName ? <p className="aw-muted">Suggested reader: {suggestion.readerName}</p> : null}
          <button type="button" className="aw-btn-primary" style={{ marginTop: '0.75rem' }} onClick={() => go(suggestion.destination)}>
            Go to {suggestion.destinationLabel} →
          </button>
          <div className="aw-chips" style={{ marginTop: '0.5rem' }}>
            {suggestion.alternates.map((a) => (
              <button key={a.destination} type="button" className="aw-chip" onClick={() => go(a.destination)}>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {!compact ? (
        <Link to={path('readers')} className="aw-btn-secondary" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
          Find My Reader →
        </Link>
      ) : null}
    </section>
  );
}
