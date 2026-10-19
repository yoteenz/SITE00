type Props = {
  variant: 'workspace' | 'referral';
  overlayId: string;
  onClose: () => void;
  payload?: Record<string, unknown>;
};

export function GenericWorkspaceOverlay({ variant, overlayId, onClose, payload }: Props) {
  const keys = payload ? Object.keys(payload) : [];
  return (
    <div className="ifw-generic-overlay">
      <p className="ifw-lede">
        {variant === 'referral' ? 'Referral overlay family' : 'Workspace overlay family'} · {overlayId}
      </p>
      <p>Interactive shell registered · wire actions when backend contract is authorized.</p>
      {keys.length ? (
        <pre className="ifw-code fw-data">{JSON.stringify(payload, null, 2)}</pre>
      ) : (
        <p className="ifw-muted">No payload</p>
      )}
      <button type="button" className="ifw-btn ifw-btn--primary" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
