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
import type { RegisteredOverlayId } from './overlayRegistry';

export type ToastTone = 'ok' | 'error' | 'blocked' | 'neutral';

export type WorkspaceToast = {
  id: string;
  message: string;
  tone: ToastTone;
  sticky?: boolean;
};

type OpenOverlay = {
  id: RegisteredOverlayId;
  payload?: Record<string, unknown>;
};

type OverlayContextValue = {
  open: OpenOverlay | null;
  openOverlay: (id: RegisteredOverlayId, payload?: Record<string, unknown>) => void;
  closeOverlay: () => void;
  toasts: WorkspaceToast[];
  pushToast: (message: string, tone?: ToastTone, opts?: { sticky?: boolean }) => void;
  dismissToast: (id: string) => void;
};

const OverlayContext = createContext<OverlayContextValue | null>(null);

export function OverlayProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState<OpenOverlay | null>(null);
  const [toasts, setToasts] = useState<WorkspaceToast[]>([]);
  const lastFocus = useRef<HTMLElement | null>(null);

  const openOverlay = useCallback((id: RegisteredOverlayId, payload?: Record<string, unknown>) => {
    lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setOpen({ id, payload });
  }, []);

  const closeOverlay = useCallback(() => {
    setOpen(null);
    const el = lastFocus.current;
    if (el && document.contains(el)) {
      queueMicrotask(() => el.focus());
    }
  }, []);

  const pushToast = useCallback((message: string, tone: ToastTone = 'neutral', opts?: { sticky?: boolean }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, tone, sticky: opts?.sticky }]);
    if (!opts?.sticky && tone !== 'error') {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
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
        closeOverlay();
      }
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, closeOverlay]);

  const value = useMemo(
    () => ({ open, openOverlay, closeOverlay, toasts, pushToast, dismissToast }),
    [open, openOverlay, closeOverlay, toasts, pushToast, dismissToast],
  );

  return <OverlayContext.Provider value={value}>{children}</OverlayContext.Provider>;
}

export function useFounderWorkspaceOverlay(): OverlayContextValue {
  const ctx = useContext(OverlayContext);
  if (!ctx) throw new Error('useFounderWorkspaceOverlay requires OverlayProvider');
  return ctx;
}
