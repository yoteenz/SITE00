import { useFounderWorkspaceOverlay } from './OverlayContext';

export function ToastStack() {
  const { toasts, dismissToast } = useFounderWorkspaceOverlay();
  if (!toasts.length) return null;

  return (
    <div className="ifw-toast-stack" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className={`ifw-toast ifw-toast--${t.tone}`} role="status">
          <span>{t.message}</span>
          <button type="button" className="ifw-toast__dismiss" onClick={() => dismissToast(t.id)} aria-label="Dismiss">
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
