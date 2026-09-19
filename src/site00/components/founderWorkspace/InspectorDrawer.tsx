import { type ReactNode, useEffect } from 'react';

type InspectorDrawerProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
};

export function InspectorDrawer({ open, title, onClose, children }: InspectorDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="site00-fws-inspector" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="site00-fws-inspector__backdrop" aria-label="Close inspector" onClick={onClose} />
      <div className="site00-fws-inspector__panel">
        <header className="site00-fws-inspector__header">
          <p className="site00-fws-inspector__layer">LAYER 3 — INSPECT</p>
          <h2 className="site00-fws-inspector__title">{title}</h2>
          <button type="button" className="site00-fws-inspector__close" onClick={onClose}>
            CLOSE
          </button>
        </header>
        <div className="site00-fws-inspector__body">{children}</div>
      </div>
    </div>
  );
}

export function InspectorKeyValue({ data }: { data: Record<string, unknown> }) {
  return (
    <dl className="site00-fws-inspector__kv">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="site00-fws-inspector__row">
          <dt>{key.replace(/([A-Z])/g, ' $1').toUpperCase()}</dt>
          <dd>{typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value ?? '—')}</dd>
        </div>
      ))}
    </dl>
  );
}
