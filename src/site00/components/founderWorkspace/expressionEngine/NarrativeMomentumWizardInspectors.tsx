import type { ReactNode } from 'react';

type SheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
};

export function NarrativeMomentumInspectorSheet({ open, title, onClose, children, testId }: SheetProps) {
  if (!open) return null;
  return (
    <div className="site00-nme-wizard__overlay" data-testid={testId ?? 'nme-wizard-inspector'}>
      <button type="button" className="site00-nme-wizard__overlay-backdrop" aria-label="Close" onClick={onClose} />
      <div className="site00-nme-wizard__sheet" role="dialog" aria-modal="true">
        <header className="site00-nme-wizard__sheet-head">
          <h4 className="site00-nme-wizard__sheet-title">{title}</h4>
          <button type="button" className="site00-nme-wizard__btn site00-nme-wizard__btn--ghost" onClick={onClose}>
            CLOSE
          </button>
        </header>
        <div className="site00-nme-wizard__sheet-body">{children}</div>
      </div>
    </div>
  );
}
