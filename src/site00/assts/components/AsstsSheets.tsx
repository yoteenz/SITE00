import { useState } from 'react';
import { CORRECTION_CATEGORIES, type CorrectionCategory } from '../config/slots';

type SheetBackdropProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  id?: string;
};

function SheetBackdrop({ open, onClose, title, children, id }: SheetBackdropProps) {
  if (!open) return null;
  return (
    <div className="site00-assts-sheet-backdrop" role="presentation" onClick={onClose}>
      <div
        className="site00-assts-sheet assts-glass assts-glass--panel"
        role="dialog"
        aria-labelledby={id ?? 'assts-sheet-title'}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={id ?? 'assts-sheet-title'} className="site00-assts-sheet__title">
          {title}
        </h2>
        {children}
      </div>
    </div>
  );
}

export function AsstsRejectSheet({
  open,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (note: string, categories: CorrectionCategory[]) => void;
}) {
  const [note, setNote] = useState('');
  const [categories, setCategories] = useState<CorrectionCategory[]>(['OTHER']);
  if (!open) return null;
  return (
    <SheetBackdrop open={open} onClose={onClose} title="REJECT ASSET" id="assts-reject-title">
      <p className="site00-assts-sheet__hint">Provide a concise reason. The rejected version is preserved.</p>
      <div className="site00-assts-sheet__categories">
        {CORRECTION_CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            className={`site00-assts-chip ${categories.includes(cat) ? 'site00-assts-chip--active' : ''}`}
            onClick={() => setCategories((p) => (p.includes(cat) ? p.filter((c) => c !== cat) : [...p, cat]))}
          >
            {cat}
          </button>
        ))}
      </div>
      <label className="site00-assts-sheet__label">
        Reason
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="WHAT MUST CHANGE?" />
      </label>
      <div className="site00-assts-sheet__actions">
        <button type="button" className="site00-assts-btn" onClick={onClose} disabled={busy}>
          CANCEL
        </button>
        <button
          type="button"
          className="site00-assts-btn site00-assts-btn--reject"
          disabled={busy || !note.trim()}
          onClick={() => onSubmit(note.trim(), categories)}
        >
          REJECT
        </button>
      </div>
    </SheetBackdrop>
  );
}

export function AsstsVariantSheet({
  open,
  busy,
  onClose,
  onSubmit,
}: {
  open: boolean;
  busy?: boolean;
  onClose: () => void;
  onSubmit: (note: string, kind: string) => void;
}) {
  const [note, setNote] = useState('');
  const [kind, setKind] = useState('alternate angle');
  if (!open) return null;
  const kinds = ['alternate angle', 'alternate crop', 'alternate composition', 'alternate detail', 'custom instruction'];
  return (
    <SheetBackdrop open={open} onClose={onClose} title="REQUEST VARIANT" id="assts-variant-title">
      <p className="site00-assts-sheet__hint">Request an intentional alternative without rejecting the current asset.</p>
      <div className="site00-assts-sheet__categories">
        {kinds.map((k) => (
          <button
            key={k}
            type="button"
            className={`site00-assts-chip ${kind === k ? 'site00-assts-chip--active' : ''}`}
            onClick={() => setKind(k)}
          >
            {k.toUpperCase()}
          </button>
        ))}
      </div>
      <label className="site00-assts-sheet__label">
        Instructions
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="DESCRIBE THE VARIANT…" />
      </label>
      <div className="site00-assts-sheet__actions">
        <button type="button" className="site00-assts-btn" onClick={onClose} disabled={busy}>
          CANCEL
        </button>
        <button
          type="button"
          className="site00-assts-btn site00-assts-btn--regen"
          disabled={busy || !note.trim()}
          onClick={() => onSubmit(note.trim(), kind)}
        >
          SUBMIT REQUEST
        </button>
      </div>
    </SheetBackdrop>
  );
}

export function AsstsLockConfirmSheet({
  open,
  busy,
  batchKey,
  assetCount,
  slotKeys,
  onClose,
  onConfirm,
}: {
  open: boolean;
  busy?: boolean;
  batchKey: string;
  assetCount: number;
  slotKeys: string[];
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <SheetBackdrop open={open} onClose={onClose} title="LOCK BATCH" id="assts-lock-title">
      <p className="site00-assts-sheet__hint">
        Lock <strong>{batchKey}</strong> and promote {assetCount} approved asset{assetCount === 1 ? '' : 's'} to canonical
        production versions.
      </p>
      {slotKeys.length ? (
        <ul className="assts-lock-slots">
          {slotKeys.map((s) => (
            <li key={s} className="site00-mono">
              {s}
            </li>
          ))}
        </ul>
      ) : null}
      <p className="site00-assts-sheet__hint">Locked versions become production assets for their semantic slots.</p>
      <div className="site00-assts-sheet__actions">
        <button type="button" className="site00-assts-btn" onClick={onClose} disabled={busy}>
          CANCEL
        </button>
        <button type="button" className="site00-assts-btn site00-assts-btn--approve" disabled={busy} onClick={onConfirm}>
          LOCK BATCH
        </button>
      </div>
    </SheetBackdrop>
  );
}

export { AsstsRegenerateSheet } from './AsstsRegenerateSheet';
