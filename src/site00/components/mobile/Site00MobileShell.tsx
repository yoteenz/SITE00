import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { MobileEnvironmentBackground } from './MobileEnvironmentBackground';
import { Site00MobileHeader, type Site00MobileHeaderVariant } from './Site00MobileHeader';
import { Site00MobileNav } from './Site00MobileNav';
import { FastTravelPanel } from '../fast-travel/FastTravelPanel';
import type { Site00MobileNavId } from '../../config/locations-directory';
import { isLocationsCompositionDebugEnabled } from '../../config/locations-composition-map';
import { isBldrCompositionDebugEnabled } from '../../config/bldr-composition-map';
import { LocationsCompositionDebug } from '../locations/LocationsCompositionDebug';
import { BldrCompositionDebug } from '../bldr/BldrCompositionDebug';

type Site00MobileShellProps = {
  activeNav: Site00MobileNavId;
  children: ReactNode;
  enterClassName?: string;
  /** When false, page supplies its own pale shell background (Screen 02 BLDR entry). */
  showEnvironmentBackground?: boolean;
  shellClassName?: string;
  headerVariant?: Site00MobileHeaderVariant;
};

/**
 * Mobile-only SITE 00 shell — Locations directory, BLDR entry, and related surfaces.
 * Desktop routes must not use this component.
 */
export function Site00MobileShell({
  activeNav,
  children,
  enterClassName = '',
  showEnvironmentBackground = true,
  shellClassName = '',
  headerVariant = 'default',
}: Site00MobileShellProps) {
  const { search, pathname } = useLocation();
  const [fastTravelOpen, setFastTravelOpen] = useState(false);
  const fastTravelTriggerRef = useRef<HTMLButtonElement>(null);
  const locationsDebug = isLocationsCompositionDebugEnabled(search) && pathname.startsWith('/origin/locations');
  const bldrDebug = isBldrCompositionDebugEnabled(search) && pathname.startsWith('/bldr');

  useEffect(() => {
    if (!fastTravelOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setFastTravelOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [fastTravelOpen]);

  const resolvedHeaderVariant =
    headerVariant === 'directory' || pathname.startsWith('/origin/locations') ? 'directory' : 'default';

  return (
    <div className={`site00-mobile-shell ${shellClassName} ${enterClassName}`.trim()}>
      {showEnvironmentBackground ? <MobileEnvironmentBackground /> : null}
      <div className="site00-mobile-shell__content">
        <Site00MobileHeader
          variant={resolvedHeaderVariant}
          onFastTravelOpen={() => setFastTravelOpen(true)}
          fastTravelExpanded={fastTravelOpen}
          fastTravelTriggerRef={fastTravelTriggerRef}
        />
        <main className="site00-mobile-shell__main">{children}</main>
        <Site00MobileNav active={activeNav} />
      </div>
      {resolvedHeaderVariant === 'default' ? (
        <FastTravelPanel
          open={fastTravelOpen}
          onClose={() => setFastTravelOpen(false)}
          returnFocusRef={fastTravelTriggerRef}
        />
      ) : null}
      {locationsDebug ? <LocationsCompositionDebug /> : null}
      {bldrDebug ? <BldrCompositionDebug /> : null}
    </div>
  );
}
