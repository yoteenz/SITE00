import type { ReviewState } from '../../../../../../shared/site00-correspondence-studio/types.js';

type Props = {
  state: ReviewState;
  /** Approval needs a composed version on the stage. */
  canApprove: boolean;
  onSetState: (state: ReviewState) => void;
  className?: string;
};

function primaryFor(state: ReviewState): { label: string; next: ReviewState | null } {
  switch (state) {
    case 'approved':
    case 'approved_with_revisions':
      return { label: 'MARK DELIVERY READY', next: 'delivery_ready' };
    case 'delivery_ready':
      return { label: 'DELIVERY READY', next: null };
    case 'delivered':
      return { label: 'DELIVERED', next: null };
    case 'archived':
      return { label: 'ARCHIVED', next: null };
    default:
      return { label: 'APPROVE VERSION', next: 'approved' };
  }
}

export function CsActions({ state, canApprove, onSetState, className = '' }: Props) {
  const primary = primaryFor(state);
  const primaryEnabled = Boolean(primary.next) && (primary.next !== 'approved' || canApprove);
  const revisionEnabled = canApprove && state !== 'revision_required' && state !== 'delivered' && state !== 'archived';

  return (
    <div className={`csw-actions ${className}`.trim()} role="group" aria-label="Version decisions">
      <button type="button" className="csw-btn csw-btn--outline" disabled={!revisionEnabled} onClick={() => onSetState('revision_required')}>
        REQUEST REVISION
      </button>
      <button
        type="button"
        className="csw-btn csw-btn--muted"
        disabled
        title="Test sends are off: no sender is registered and the studio does not send email."
      >
        SEND TEST · OFF
      </button>
      <button
        type="button"
        className="csw-btn csw-btn--primary"
        disabled={!primaryEnabled}
        onClick={() => primary.next && onSetState(primary.next)}
        title={!canApprove && primary.next === 'approved' ? 'Nothing to approve: this version has no composed email.' : undefined}
      >
        {primary.label}
        {primary.next ? <span aria-hidden="true"> →</span> : null}
      </button>
    </div>
  );
}
