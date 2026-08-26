import type { ReactNode } from 'react';

type AstralOverlayProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
};

export function AstralOverlay({ open, onClose, title, children, className = '' }: AstralOverlayProps) {
  if (!open) return null;

  return (
    <div className={`aw-world-overlay-root ${className}`.trim()} role="presentation">
      <button type="button" className="aw-world-overlay-backdrop" aria-label="Close overlay" onClick={onClose} />
      <div className="aw-world-overlay" role="dialog" aria-modal="true" aria-label={title ?? 'Overlay'}>
        {title ? (
          <header className="aw-world-overlay__header">
            <h2 className="aw-display aw-display--section">{title}</h2>
            <button type="button" className="aw-world-overlay__close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </header>
        ) : null}
        <div className="aw-world-overlay__body">{children}</div>
      </div>
    </div>
  );
}
