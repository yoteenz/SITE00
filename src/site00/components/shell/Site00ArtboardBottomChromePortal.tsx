import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { useSite00DesktopArtboardPreview } from './Site00DesktopArtboardContext';
import { useSite00EnterArtboardChromeHostElement } from './Site00EnterArtboardChromeContext';

/**
 * Phone Desktop toggle — pin bottom chrome (summary/status strips) to the artboard shell,
 * outside the scaled 1440×900 stage (same mount as Enter status strip).
 */
export function Site00ArtboardBottomChromePortal({ children }: { children: ReactNode }) {
  const inDesktopArtboard = useSite00DesktopArtboardPreview();
  const hostElement = useSite00EnterArtboardChromeHostElement();

  if (inDesktopArtboard && hostElement) {
    return createPortal(children, hostElement);
  }

  return <>{children}</>;
}
