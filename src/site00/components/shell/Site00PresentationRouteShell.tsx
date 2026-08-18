import { type ReactNode } from 'react';
import { Site00DesktopArtboardShell } from './Site00DesktopArtboardShell';
import { usePresentationMode } from '../../presentation';

type Site00PresentationRouteShellProps = {
  children: ReactNode;
  /** Legacy `/desktop` routes — force desktop artboard until redirect completes */
  forceArtboard?: boolean;
};

/**
 * Canonical presentation shell — wraps desktop tree in artboard; mobile renders directly.
 * One URL, viewport-driven presentation.
 */
export function Site00PresentationRouteShell({
  children,
  forceArtboard = false,
}: Site00PresentationRouteShellProps) {
  const { isDesktopPresentation } = usePresentationMode();

  if (forceArtboard || isDesktopPresentation) {
    return <Site00DesktopArtboardShell>{children}</Site00DesktopArtboardShell>;
  }

  return <>{children}</>;
}
