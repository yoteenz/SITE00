import type { ReactNode } from 'react';

type SheetProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  testId?: string;
  showEvidencePlate?: boolean;
};

export function NarrativeMomentumInspectorSheet({
  open,
  title,
  subtitle,
  onClose,
  children,
  testId,
  showEvidencePlate,
}: SheetProps) {
  if (!open) return null;
  return (
    <div className="site00-nme-wizard__overlay" data-testid={testId ?? 'nme-wizard-inspector'}>
      <button type="button" className="site00-nme-wizard__overlay-backdrop" aria-label="Close" onClick={onClose} />
      <div className="site00-nme-wizard__dossier" role="dialog" aria-modal="true">
        <header className="site00-nme-wizard__dossier-head">
          <div>
            <h4 className="site00-nme-wizard__dossier-title">{title}</h4>
            {subtitle ?
              <p className="site00-nme-wizard__dossier-sub">{subtitle}</p>
            : null}
          </div>
          <button type="button" className="site00-nme-wizard__btn site00-nme-wizard__btn--ghost" onClick={onClose}>
            Close
          </button>
        </header>
        <div className="site00-nme-wizard__dossier-body">
          {showEvidencePlate ?
            <div className="site00-nme-wizard__dossier-evidence" aria-hidden />
          : null}
          {children}
        </div>
      </div>
    </div>
  );
}
