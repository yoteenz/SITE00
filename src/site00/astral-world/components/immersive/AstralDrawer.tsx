import { useEffect, type ReactNode } from 'react';

type AstralDrawerProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
  /** Peek height as fraction of viewport when half-open */
  peek?: boolean;
};

export function AstralDrawer({
  open,
  onClose,
  title,
  children,
  className = '',
  peek = false,
}: AstralDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className={`aw-drawer-root${peek ? ' aw-drawer-root--peek' : ''}`} role="presentation">
      <button type="button" className="aw-drawer-backdrop" aria-label="Close drawer" onClick={onClose} />
      <div
        className={`aw-drawer ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Drawer'}
      >
        <div className="aw-drawer__handle" aria-hidden />
        {title ? <h2 className="aw-drawer__title aw-display">{title}</h2> : null}
        <div className="aw-drawer__body">{children}</div>
      </div>
    </div>
  );
}
