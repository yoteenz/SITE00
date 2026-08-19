import { type ReactNode } from 'react';
import { Site00OriginLayoutSwitch } from './Site00OriginLayoutSwitch';
import { Site00DesktopPresentationShell } from './Site00DesktopPresentationShell';
import { useSite00 } from '../../state/Site00Context';

type Site00OriginRouteShellProps = {
  children: ReactNode;
  /** Legacy `/origin/desktop` — always use scaled artboard shell. */
  forceArtboard?: boolean;
};

/**
 * Origin responsive shell — desktop presentation from shared preview mode.
 * Laptop + Desktop uses native full viewport; phones use scaled 1440×900 artboard.
 */
export function Site00OriginRouteShell({ children, forceArtboard = false }: Site00OriginRouteShellProps) {
  const { isPreviewDesktop } = useSite00();

  return (
    <>
      <Site00OriginLayoutSwitch />
      {isPreviewDesktop ? (
        <Site00DesktopPresentationShell forceArtboard={forceArtboard}>{children}</Site00DesktopPresentationShell>
      ) : (
        children
      )}
    </>
  );
}

export { SITE00_ORIGIN_DESKTOP_BREAKPOINT_PX } from './site00OriginViewport';
