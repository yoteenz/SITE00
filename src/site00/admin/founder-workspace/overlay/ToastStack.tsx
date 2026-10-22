import { WsIcon, WsIconButton } from '../shell/wsKit';
import { useFounderWorkspaceOverlay, type WorkspaceToast } from './OverlayContext';

const KICK: Record<WorkspaceToast['tone'], string> = { success: 'CONFIRMED', error: 'NOT SAVED', info: 'NOTE', action: 'ACTION REQUIRED', blocked: 'BLOCKED BY POLICY' };
const ICON: Record<WorkspaceToast['tone'], string> = { success: 'complete', error: 'warning', info: 'info', action: 'notification', blocked: 'lock' };
const CLS: Record<WorkspaceToast['tone'], string> = { success: 'ws-toast', error: 'ws-toast ws-toast--err', info: 'ws-toast ws-toast--info', action: 'ws-toast ws-toast--action', blocked: 'ws-toast ws-toast--blocked' };

/**
 * Global feedback (OPUS2 SC-14): success · error · info · action required · blocked. Positioned above the phone
 * bottom bar and clear of the sidebar; errors are announced assertively and stay until dismissed.
 * Callers only push success after the server confirms — the toast never claims a save that did not happen.
 */
export function ToastStack() {
  const { toasts, dismissToast } = useFounderWorkspaceOverlay();
  if (!toasts.length) return null;
  return (
    <div className="ifw-toasts" aria-live="polite" aria-atomic="false">
      {toasts.map((t) => (
        <div key={t.id} className={CLS[t.tone]} role={t.tone === 'error' ? 'alert' : 'status'} data-toast-tone={t.tone}>
          <WsIcon name={ICON[t.tone]} />
          <span>
            <span className="ws-toast__k">{KICK[t.tone]}</span>
            {t.message.toUpperCase()}
          </span>
          {t.action ? (
            <button
              type="button"
              className="ws-btn ws-btn--ghost ws-btn--xs"
              onClick={() => {
                t.action?.run();
                dismissToast(t.id);
              }}
            >
              <span>{t.action.label}</span>
            </button>
          ) : null}
          <WsIconButton icon="close" label="DISMISS" onClick={() => dismissToast(t.id)} />
        </div>
      ))}
    </div>
  );
}
