import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TAKE_ME_SOMEWHERE_CHIPS } from '../../../../../../shared/site00-astral-world/takeMeSomewhereRouter.js';
import type { TakeMeSomewhereIntent } from '../../../../../../shared/site00-astral-world/types.js';
import { useAstralWorld } from '../../../context/AstralWorldContext';
import { AstralOverlay } from '../../immersive/AstralOverlay';
import { AstralScene } from '../../immersive/AstralScene';
import { destinationCropKeys } from '../../immersive/immersiveHelpers';

/** Take Me Somewhere — intention tokens + transport preview */
export function TakeMeSomewhereWorldOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { takeMeSomewhere, path } = useAstralWorld();
  const navigate = useNavigate();
  const [intent, setIntent] = useState<TakeMeSomewhereIntent | null>(null);
  const suggestion = intent ? takeMeSomewhere(intent) : null;
  const previewCrop = suggestion ? destinationCropKeys(suggestion.destination).mobile : null;

  const go = (destination: string) => {
    onClose();
    navigate(path(`astrea/${destination}`));
  };

  return (
    <AstralOverlay open={open} onClose={onClose} title="Take Me Somewhere">
      <p className="aw-muted">What&apos;s going on today?</p>
      <div className="aw-intention-tokens" role="group" aria-label="Intention choices">
        {TAKE_ME_SOMEWHERE_CHIPS.map((c) => (
          <button
            key={c.intent}
            type="button"
            className={`aw-intention-token${intent === c.intent ? ' aw-intention-token--active' : ''}`}
            onClick={() => setIntent(c.intent)}
          >
            {c.label}
          </button>
        ))}
      </div>
      {suggestion && previewCrop ? (
        <div className="aw-routing-preview aw-routing-preview--overlay">
          <AstralScene crop={previewCrop} minHeight={160} responsive={false}>
            <p className="aw-display" style={{ fontSize: '0.95rem', margin: 0 }}>{suggestion.conversationalLine}</p>
            <p className="aw-muted" style={{ margin: '0.35rem 0 0' }}>{suggestion.reason}</p>
          </AstralScene>
          {suggestion.readerName ? <p className="aw-muted">Suggested reader: {suggestion.readerName}</p> : null}
          <button type="button" className="aw-btn-primary aw-transport-cta" onClick={() => go(suggestion.destination)}>
            Take Me There →
          </button>
        </div>
      ) : null}
    </AstralOverlay>
  );
}
