/**
 * Full-height mobile sheet / desktop work panel for SKINS child flows.
 */

import type { ReactNode } from 'react';

type Props = {
  open: boolean;
  title: string;
  breadcrumb?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  variant?: 'sheet' | 'panel';
};

export function SkinWorkspaceSheet({
  open,
  title,
  breadcrumb,
  onClose,
  children,
  footer,
  variant = 'sheet',
}: Props) {
  if (!open) return null;

  return (
    <div className="site00-dw-skins-sheet" data-variant={variant} role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="site00-dw-skins-sheet__backdrop" aria-label="Close" onClick={onClose} />
      <div className="site00-dw-skins-sheet__panel">
        <header className="site00-dw-skins-sheet__head">
          <button type="button" className="site00-dw-skins-sheet__back" onClick={onClose}>
            ← BACK
          </button>
          <div className="site00-dw-skins-sheet__titles">
            {breadcrumb ? <span className="site00-dw-skins-sheet__crumb">{breadcrumb}</span> : null}
            <strong>{title}</strong>
          </div>
        </header>
        <div className="site00-dw-skins-sheet__body">{children}</div>
        {footer ? <footer className="site00-dw-skins-sheet__foot">{footer}</footer> : null}
      </div>
    </div>
  );
}
