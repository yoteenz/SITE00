import { type ReactNode } from 'react';
import { Site00DesktopArtboardShell } from './Site00DesktopArtboardShell';
import { Site00PublicLayoutSwitch } from './Site00PublicLayoutSwitch';
import { useSite00 } from '../../state/Site00Context';

type Site00PublicRouteShellProps = {
  children: ReactNode;
  /** Legacy `/desktop` routes — always use artboard shell. */
  forceArtboard?: boolean;
};

/**
 * Public Composer pages — desktop presentation driven by shared preview mode + artboard shell.
 */
export function Site00PublicRouteShell({ children, forceArtboard = false }: Site00PublicRouteShellProps) {
  const { isPreviewDesktop } = useSite00();

  const useArtboard = forceArtboard || isPreviewDesktop;

  return (
    <>
      <Site00PublicLayoutSwitch />
      {useArtboard ? (
        <Site00DesktopArtboardShell>{children}</Site00DesktopArtboardShell>
      ) : (
        children
      )}
    </>
  );
}
