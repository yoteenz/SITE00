import type { IntakeSaveState } from '../../hooks/useIntakeSync';

type IntakeSaveStatusProps = {
  state: IntakeSaveState;
  lastSavedAt?: string | null;
  errorMessage?: string | null;
};

/**
 * Truthful save-state indicator (IX). Never renders SAVED when the server write has not
 * actually succeeded — `state` comes straight from useIntakeSync, which only reaches 'saved'
 * after a 200 from the canonical intake API.
 */
export function IntakeSaveStatus({ state, lastSavedAt, errorMessage }: IntakeSaveStatusProps) {
  if (state === 'idle') return null;

  const label =
    state === 'saving'
      ? 'SAVING…'
      : state === 'saved'
        ? lastSavedAt
          ? `SAVED · ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'SAVED'
        : `SAVE FAILED${errorMessage ? ` · ${errorMessage.toUpperCase()}` : ''}`;

  return (
    <p className={`site00-intake-save-status site00-intake-save-status--${state}`} role="status">
      <span className="site00-intake-save-status__dot" aria-hidden="true" />
      {label}
    </p>
  );
}
