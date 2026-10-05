/**
 * P0.VR.8R3R5R1 — Overlay details drawer (bottom sheet mobile / right drawer desktop).
 */

import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
};

export function DesignDetailsDrawer({ open, title = 'DETAILS', onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="site00-dw-wizard-drawer" data-open={open ? 'true' : 'false'} role="presentation">
      <button type="button" className="site00-dw-wizard-drawer__backdrop" aria-label="Close details" onClick={onClose} />
      <aside className="site00-dw-wizard-drawer__panel" role="dialog" aria-modal="true" aria-label={title}>
        <header className="site00-dw-wizard-drawer__head">
          <strong>{title}</strong>
          <button type="button" className="site00-dw-wizard-drawer__close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </header>
        <div className="site00-dw-wizard-drawer__body">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
