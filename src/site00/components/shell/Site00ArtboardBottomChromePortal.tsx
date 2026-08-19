import { createPortal } from 'react-dom';
import { useLayoutEffect, useState, type ReactNode } from 'react';
import { useSite00DesktopArtboardPreview } from './Site00DesktopArtboardContext';
import { useSite00EnterArtboardChromeHost } from './Site00EnterArtboardChromeContext';

/**
 * Phone Desktop toggle — pin bottom chrome (summary/status strips) to the artboard shell,
 * outside the scaled 1440×900 stage (same mount as Enter status strip).
 */
export function Site00ArtboardBottomChromePortal({ children }: { children: ReactNode }) {
  const inDesktopArtboard = useSite00DesktopArtboardPreview();
  const chromeHost = useSite00EnterArtboardChromeHost();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (inDesktopArtboard && chromeHost?.current) {
      setPortalTarget(chromeHost.current);
      return;
    }
    setPortalTarget(null);
  }, [inDesktopArtboard, chromeHost]);

  if (portalTarget) {
    return createPortal(children, portalTarget);
  }

  return <>{children}</>;
}
