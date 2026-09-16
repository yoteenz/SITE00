import { useEffect, type ReactNode } from 'react';

import type { ChildSurfacePresentationMode } from '../../../../../shared/site00-design-workspace-production/childSurfacePresentation.js';

type Props = {
  mode: ChildSurfacePresentationMode;
  title: string;
  subtitle?: string;
  contextLabel?: string;
  overlayId: string;
  onClose: () => void;
  onBack?: () => void;
  /** WORKSPACE inline — occupies content stage inside the artboard (no viewport-fixed layer). */
  inline?: boolean;
  children: ReactNode;
};

export function DesignChildSurfaceFrame({
  mode,
  title,
  subtitle,
  contextLabel = 'DESIGN · IN-SHELL',
  overlayId,
  onClose,
  onBack,
  inline = false,
  children,
}: Props) {
  useEffect(() => {
    if (inline) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [inline, onClose]);

  const modeClass = mode.toLowerCase();

  if (inline) {
    return (
      <section
        className={`tod-dcs tod-dcs--workspace-inline`}
        data-overlay={overlayId}
        aria-label={title}
        data-testid="design-child-surface-inline"
      >
        <header className="tod-dcs__head">
          <div className="tod-dcs__headText">
            <p className="tod-dcs__context">{contextLabel}</p>
            <h2 className="tod-dcs__title">{title}</h2>
            {subtitle ? <p className="tod-dcs__sub">{subtitle}</p> : null}
          </div>
          <div className="tod-dcs__headActions">
            {onBack ?
              <button type="button" className="tod-dcs__ghost" onClick={onBack}>
                BACK
              </button>
            : null}
            <button type="button" className="tod-dcs__close" onClick={onClose} aria-label="Close">
              CLOSE
            </button>
          </div>
        </header>
        <div className="tod-dcs__body">{children}</div>
      </section>
    );
  }

  return (
    <>
      <button
        type="button"
        className="tod-dcs-backdrop"
        aria-label="Close panel"
        data-testid="design-child-backdrop"
        onClick={onClose}
      />
      <aside
        className={`tod-dcs tod-dcs--${modeClass}`}
        data-overlay={overlayId}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        data-testid="design-child-surface"
      >
        <header className="tod-dcs__head">
          <div className="tod-dcs__headText">
            <p className="tod-dcs__context">{contextLabel}</p>
            <h2 className="tod-dcs__title">{title}</h2>
            {subtitle ? <p className="tod-dcs__sub">{subtitle}</p> : null}
          </div>
          <div className="tod-dcs__headActions">
            {onBack ?
              <button type="button" className="tod-dcs__ghost" onClick={onBack}>
                BACK
              </button>
            : null}
            <button type="button" className="tod-dcs__close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
        </header>
        <div className="tod-dcs__body">{children}</div>
      </aside>
    </>
  );
}

export function DesignGateBadge({ result }: { result: string }) {
  const normalized = result.replace(/_/g, ' ');
  return (
    <span className={`tod-dcs-badge tod-dcs-badge--${result.toLowerCase()}`} data-result={result}>
      {normalized}
    </span>
  );
}
