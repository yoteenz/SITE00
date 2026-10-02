import type { IntakeSaveState } from '../../hooks/useIntakeSync';

function ArrowRight() {
  return (
    <svg viewBox="0 0 20 12" width="18" height="11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 6h17M13 1l5 5-5 5" />
    </svg>
  );
}

function ArrowLeft() {
  return (
    <svg viewBox="0 0 20 12" width="18" height="11" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 6H2M7 1 2 6l5 5" />
    </svg>
  );
}

/** Truthful save indicator: only ever claims SAVED after the server write succeeded. */
export function PanelSaveStatus({ state }: { state: IntakeSaveState }) {
  if (state === 'idle') return <span className="s00pr-save" aria-hidden="true" />;
  const label = state === 'saving' ? 'SAVING…' : state === 'saved' ? 'SAVED' : 'NOT SAVED';
  return (
    <span className={`s00pr-save s00pr-save--${state}`} role="status">
      {state === 'saved' ? (
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m3 8.500 3.200 3.200L13 4.500" />
        </svg>
      ) : null}
      {label}
    </span>
  );
}

type PanelActionsProps = {
  onBack: () => void;
  backLabel?: string;
  saveState: IntakeSaveState;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  /** Primary action in flight (submission). */
  busy?: boolean;
};

/** BACK · SAVED · PRIMARY — the one footer grammar for detail, question and review modes. */
export function PanelActions({
  onBack,
  backLabel = 'BACK',
  saveState,
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  busy = false,
}: PanelActionsProps) {
  return (
    <footer className="s00pr-actions">
      <button type="button" className="s00pr-btn s00pr-btn--ghost" onClick={onBack}>
        <ArrowLeft />
        {backLabel}
      </button>
      <PanelSaveStatus state={saveState} />
      <button
        type="button"
        className="s00pr-btn s00pr-btn--primary"
        onClick={onPrimary}
        disabled={primaryDisabled || busy}
        aria-busy={busy || undefined}
      >
        {busy ? 'SUBMITTING…' : primaryLabel}
        <ArrowRight />
      </button>
    </footer>
  );
}

/** Full-width detail-mode call to action. */
export function PanelWideCta({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="s00pr-btn s00pr-btn--wide" onClick={onClick}>
      {label}
      <ArrowRight />
    </button>
  );
}
