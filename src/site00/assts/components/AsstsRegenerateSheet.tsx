import { useState } from 'react';
import { CORRECTION_CATEGORIES, type CorrectionCategory } from '../config/slots';

type AsstsRegenerateSheetProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (categories: CorrectionCategory[], note: string) => void;
  busy?: boolean;
};

export function AsstsRegenerateSheet({ open, onClose, onSubmit, busy }: AsstsRegenerateSheetProps) {
  const [categories, setCategories] = useState<CorrectionCategory[]>(['LIGHTING']);
  const [note, setNote] = useState('');

  if (!open) return null;

  const toggle = (cat: CorrectionCategory) => {
    setCategories((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
  };

  return (
    <div className="site00-assts-sheet-backdrop" role="presentation" onClick={onClose}>
      <div
        className="site00-assts-sheet site00-assts-panel"
        role="dialog"
        aria-labelledby="assts-regen-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="assts-regen-title" className="site00-assts-sheet__title">
          REGENERATE — CORRECTION
        </h2>
        <p className="site00-assts-sheet__hint">Current version is preserved. A new version will be queued for FAL.</p>
        <div className="site00-assts-sheet__categories">
          {CORRECTION_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`site00-assts-chip ${categories.includes(cat) ? 'site00-assts-chip--active' : ''}`}
              onClick={() => toggle(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <label className="site00-assts-sheet__label">
          Note
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="DESCRIBE WHAT SHOULD CHANGE…"
          />
        </label>
        <div className="site00-assts-sheet__actions">
          <button type="button" className="site00-assts-btn" onClick={onClose} disabled={busy}>
            CANCEL
          </button>
          <button
            type="button"
            className="site00-assts-btn site00-assts-btn--regen"
            disabled={busy || categories.length === 0}
            onClick={() => onSubmit(categories, note.trim())}
          >
            QUEUE NEW VERSION
          </button>
        </div>
      </div>
    </div>
  );
}
