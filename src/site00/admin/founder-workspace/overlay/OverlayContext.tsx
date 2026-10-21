import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { normalizeOverlayId, type RegisteredOverlayId } from './overlayRegistry';

/**
 * Toast types (OPUS2 SC-14 + Recovery 2): success · error · info · action (action required) · blocked (policy).
 * `ok` and `neutral` remain accepted aliases of success and info so existing callers keep working.
 */
export type ToastTone = 'success' | 'error' | 'info' | 'action' | 'blocked' | 'ok' | 'neutral';

export type WorkspaceToast = {
  id: string;
  message: string;
  tone: Exclude<ToastTone, 'ok' | 'neutral'>;
  sticky?: boolean;
  action?: { label: string; run: () => void };
};

type OpenOverlay = {
  id: RegisteredOverlayId;
  payload?: Record<string, unknown>;
  /** Bounding box of the trigger, for popover placement (OL-05 · OL-06 · OL-07 · OL-18 · RO-06 · RO-08). */
  anchor?: { top: number; left: number; right: number; bottom: number } | null;
};

type OverlayContextValue = {
  open: OpenOverlay | null;
  openOverlay: (id: RegisteredOverlayId | 'CREATE_CLIENT', payload?: Record<string, unknown>) => void;
  /** `force` skips unsaved-change protection (used after a confirmed save). */
  closeOverlay: (force?: boolean) => void;
  dirty: boolean;
  setOverlayDirty: (dirty: boolean) => void;
  /** True while the host asks the founder to confirm discarding unsaved changes. */
  confirmingDiscard: boolean;
  cancelDiscard: () => void;
  toasts: WorkspaceToast[];
  pushToast: (message: string, tone?: ToastTone, opts?: { sticky?: boolean; action?: { label: string; run: () => void } }) => void;
  dismissToast: (id: string) => void;
};

const OverlayContext = createContext<OverlayContextValue | null>(null);

const TONE: Record<ToastTone, WorkspaceToast['tone']> = { success: 'success', ok: 'success', error: 'error', info: 'info', neutral: 'info', action: 'action', blocked: 'blocked' };

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<OpenOverlay | null>(null);
  const [dirty, setDirty] = useState(false);
  const [confirmingDiscard, setConfirmingDiscard] = useState(false);
  const [toasts, setToasts] = useState<WorkspaceToast[]>([]);
  const lastFocus = useRef<HTMLElement | null>(null);

  const openOverlay = useCallback((id: RegisteredOverlayId | 'CREATE_CLIENT', payload?: Record<string, unknown>) => {
    const normalized = normalizeOverlayId(id);
    if (!normalized) return;
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    // Opening from inside another overlay keeps the original return target.
    if (!active?.closest('[data-ifw-overlay]')) lastFocus.current = active;
    const r = active && active !== document.body ? active.getBoundingClientRect() : null;
    setDirty(false);
    setConfirmingDiscard(false);
    setOpen({ id: normalized, payload, anchor: r ? { top: r.top, left: r.left, right: r.right, bottom: r.bottom } : null });
  }, []);

  const finishClose = useCallback(() => {
    setDirty(false);
    setConfirmingDiscard(false);
    setOpen(null);
    const el = lastFocus.current;
    if (el && document.contains(el)) {
      queueMicrotask(() => el.focus());
    }
  }, []);

  const closeOverlay = useCallback(
    (force?: boolean) => {
      if (dirty && !force) {
        // Unsaved-change protection: the host shows an in-panel confirmation (no browser dialog).
        setConfirmingDiscard(true);
        return;
      }
      finishClose();
    },
    [dirty, finishClose],
  );

  const pushToast = useCallback((message: string, tone: ToastTone = 'info', opts?: { sticky?: boolean; action?: { label: string; run: () => void } }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const t = TONE[tone] ?? 'info';
    setToasts((prev) => [...prev.slice(-3), { id, message, tone: t, sticky: opts?.sticky, action: opts?.action }]);
    // Errors, required actions and policy blocks stay until dismissed; confirmations fade.
    if (!opts?.sticky && (t === 'success' || t === 'info')) {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 4200);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (confirmingDiscard) setConfirmingDiscard(false);
        else closeOverlay();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, closeOverlay, confirmingDiscard]);

  const value = useMemo(
    () => ({
      open,
      openOverlay,
      closeOverlay,
      dirty,
      setOverlayDirty: setDirty,
      confirmingDiscard,
      cancelDiscard: () => setConfirmingDiscard(false),
      toasts,
      pushToast,
      dismissToast,
    }),
    [open, openOverlay, closeOverlay, dirty, confirmingDiscard, toasts, pushToast, dismissToast],
  );

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useFounderWorkspaceOverlay(): OverlayContextValue {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useFounderWorkspaceOverlay requires OverlayProvider');
  return ctx;
}
