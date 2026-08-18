import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Site00MobileHeader } from './Site00MobileHeader';
import { FastTravelPanel } from '../fast-travel/FastTravelPanel';
import { Site00EcosystemMobileNav } from '../ecosystem/Site00EcosystemMobileNav';
import type { EcosystemNavId } from '../../config/ecosystem-nav';

type Site00EcosystemMobileShellProps = {
  activeNav: EcosystemNavId;
  children: ReactNode;
  shellClassName?: string;
};

/** Mobile shell for authenticated SITE 00 ecosystem pages. */
export function Site00EcosystemMobileShell({ activeNav, children, shellClassName = '' }: Site00EcosystemMobileShellProps) {
  const [fastTravelOpen, setFastTravelOpen] = useState(false);
  const fastTravelTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!fastTravelOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFastTravelOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fastTravelOpen]);

  return (
    <div className={`site00-mobile-shell site00-ecosystem-mobile-shell ${shellClassName}`.trim()}>
      <div className="site00-mobile-shell__content">
        <Site00MobileHeader
          onFastTravelOpen={() => setFastTravelOpen(true)}
          fastTravelExpanded={fastTravelOpen}
          fastTravelTriggerRef={fastTravelTriggerRef}
        />
        <main className="site00-mobile-shell__main site00-ecosystem-mobile-shell__main">{children}</main>
        <Site00EcosystemMobileNav active={activeNav} />
      </div>
      <FastTravelPanel
        open={fastTravelOpen}
        onClose={() => setFastTravelOpen(false)}
        returnFocusRef={fastTravelTriggerRef}
      />
    </div>
  );
}
