type Props = {
  open: boolean;
  targetTerritory: string | null;
  onClose: () => void;
  onSubmit: (preserve: string, reject: string, push: string) => void;
};

export function HybridizePanel({ open, targetTerritory, onClose, onSubmit }: Props) {
  if (!open) return null;
  return (
    <div className="ec-cw-hybrid" role="dialog" aria-label="Hybridize territories">
      <h3>Hybridize · {targetTerritory ?? 'select territories'}</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          onSubmit(String(fd.get('preserve') ?? ''), String(fd.get('reject') ?? ''), String(fd.get('push') ?? ''));
        }}
      >
        <label className="ec-cw-field">
          Preserve from A
          <textarea name="preserve" rows={2} />
        </label>
        <label className="ec-cw-field">
          Preserve from B
          <textarea name="reject" rows={2} placeholder="Also use for reject / do not repeat" />
        </label>
        <label className="ec-cw-field">
          Push further
          <textarea name="push" rows={2} />
        </label>
        <div className="ec-cw-hybrid__actions">
          <button type="button" className="ec-cw-btn ec-cw-btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="ec-cw-btn">
            Request hybrid artifact
          </button>
        </div>
      </form>
    </div>
  );
}
