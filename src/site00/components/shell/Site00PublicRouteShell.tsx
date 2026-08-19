import { type ReactNode } from 'react';
import { Site00PublicLayoutSwitch } from './Site00PublicLayoutSwitch';
import { Site00DesktopPresentationShell } from './Site00DesktopPresentationShell';
import { useSite00 } from '../../state/Site00Context';

type Site00PublicRouteShellProps = {
  children: ReactNode;
  /** Legacy `/desktop` routes — always use scaled artboard shell. */
  forceArtboard?: boolean;
};

/**
 * Public Composer pages — desktop presentation driven by shared preview mode.
 * Phone + Desktop → scaled artboard edge-to-edge; laptop + Desktop → native full viewport.
 */
export function Site00PublicRouteShell({ children, forceArtboard = false }: Site00PublicRouteShellProps) {
  const { isPreviewDesktop } = useSite00();

  return (
    <>
      <Site00PublicLayoutSwitch />
      {isPreviewDesktop ? (
        <Site00DesktopPresentationShell forceArtboard={forceArtboard}>{children}</Site00DesktopPresentationShell>
      ) : (
        children
      )}
    </>
  );
}
