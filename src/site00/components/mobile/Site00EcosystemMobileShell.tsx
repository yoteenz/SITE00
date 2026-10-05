import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Site00MobileHeader } from './Site00MobileHeader';
import { FastTravelPanel } from '../fast-travel/FastTravelPanel';
import { MobileSiteNavigation } from './MobileSiteNavigation';

type Site00EcosystemMobileShellProps = {
  children: ReactNode;
  shellClassName?: string;
  /** NDXBOOK founder workspace supplies its own header + bottom nav. */
  suppressSiteChrome?: boolean;
};

/** Mobile shell for authenticated SITE 00 ecosystem pages. */
export function Site00EcosystemMobileShell({
  children,
  shellClassName = '',
  suppressSiteChrome = false,
}: Site00EcosystemMobileShellProps) {
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
    <div
      className={[
        'site00-mobile-shell',
        'site00-ecosystem-mobile-shell',
        shellClassName,
        suppressSiteChrome ? 'site00-ecosystem-mobile-shell--suppress-chrome' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="site00-mobile-shell__content">
        {suppressSiteChrome ? null : (
          <Site00MobileHeader
            onFastTravelOpen={() => setFastTravelOpen(true)}
            fastTravelExpanded={fastTravelOpen}
            fastTravelTriggerRef={fastTravelTriggerRef}
          />
        )}
        <main className="site00-mobile-shell__main site00-ecosystem-mobile-shell__main">{children}</main>
        {suppressSiteChrome ? null : <MobileSiteNavigation />}
      </div>
      <FastTravelPanel
        open={fastTravelOpen}
        onClose={() => setFastTravelOpen(false)}
        returnFocusRef={fastTravelTriggerRef}
      />
    </div>
  );
}
