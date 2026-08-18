import { type ReactNode } from 'react';
import { Site00DesktopArtboardShell } from './Site00DesktopArtboardShell';
import { Site00OriginLayoutSwitch } from './Site00OriginLayoutSwitch';
import { useSite00 } from '../../state/Site00Context';

type Site00OriginRouteShellProps = {
  children: ReactNode;
  /** Legacy `/origin/desktop` — always use artboard shell. */
  forceArtboard?: boolean;
};

/**
 * Origin responsive shell — desktop presentation from shared preview mode.
 */
export function Site00OriginRouteShell({ children, forceArtboard = false }: Site00OriginRouteShellProps) {
  const { isPreviewDesktop } = useSite00();

  const useArtboard = forceArtboard || isPreviewDesktop;

  if (useArtboard) {
    return (
      <>
        <Site00OriginLayoutSwitch />
        <Site00DesktopArtboardShell>{children}</Site00DesktopArtboardShell>
      </>
    );
  }

  return (
    <>
      <Site00OriginLayoutSwitch />
      {children}
    </>
  );
}

export { SITE00_ORIGIN_DESKTOP_BREAKPOINT_PX } from './site00OriginViewport';
