import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAstralWorld } from '../context/AstralWorldContext';
import { TAKE_ME_SOMEWHERE_CHIPS } from '../../../../shared/site00-astral-world/takeMeSomewhereRouter.js';
import type { TakeMeSomewhereIntent } from '../../../../shared/site00-astral-world/types.js';

export function TakeMeSomewherePanel({ compact }: { compact?: boolean }) {
  const { takeMeSomewhere, energy } = useAstralWorld();
  const [suggestion, setSuggestion] = useState<ReturnType<typeof takeMeSomewhere> | null>(null);
  const navigate = useNavigate();

  const handleIntent = (intent: TakeMeSomewhereIntent) => {
    const result = takeMeSomewhere(intent);
    setSuggestion(result);
  };

  const goToSuggestion = () => {
    if (!suggestion) return;
    navigate(`/projects/astral-world/experience/astrea/${suggestion.destination}`);
  };

  return (
    <section className="aw-card aw-card--gold">
      <h2 className="aw-display aw-display--section">Take Me Somewhere</h2>
      <p className="aw-muted">What&apos;s going on today?</p>
      <div className="aw-chips">
        {TAKE_ME_SOMEWHERE_CHIPS.map((chip) => (
          <button key={chip.intent} type="button" className="aw-chip" onClick={() => handleIntent(chip.intent)}>
            {chip.label}
          </button>
        ))}
      </div>
      {suggestion ? (
        <div style={{ marginTop: '0.75rem' }}>
          <p className="aw-label">Suggested destination</p>
          <strong>{suggestion.label}</strong>
          <p className="aw-muted">{suggestion.reason}</p>
          <button type="button" className="aw-btn-primary" onClick={goToSuggestion}>
            Go to {suggestion.label} →
          </button>
        </div>
      ) : null}
      {!compact ? (
        <p className="aw-muted" style={{ fontSize: '0.75rem', marginTop: '0.5rem' }}>
          Prototype routing · energy: {energy.replace(/_/g, ' ')}
        </p>
      ) : null}
    </section>
  );
}
