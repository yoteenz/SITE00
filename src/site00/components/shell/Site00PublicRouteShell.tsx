import { type ReactNode } from 'react';
import { Site00PublicLayoutSwitch } from './Site00PublicLayoutSwitch';
import { Site00DesktopPresentationShell } from './Site00DesktopPresentationShell';
import { Site00MobilePresentationShell } from './Site00MobilePresentationShell';
import { useSite00 } from '../../state/Site00Context';

type Site00PublicRouteShellProps = {
  children: ReactNode;
  /** Legacy `/desktop` routes — always use scaled artboard shell. */
  forceArtboard?: boolean;
};

/**
 * Public Composer pages — desktop presentation driven by shared preview mode.
 * Phone + Mobile → native full-width; laptop + Mobile → scaled 390×844 phone preview.
 */
export function Site00PublicRouteShell({ children, forceArtboard = false }: Site00PublicRouteShellProps) {
  const { isPreviewDesktop } = useSite00();

  return (
    <>
      <Site00PublicLayoutSwitch />
      {isPreviewDesktop ? (
        <Site00DesktopPresentationShell forceArtboard={forceArtboard}>{children}</Site00DesktopPresentationShell>
      ) : (
        <Site00MobilePresentationShell>{children}</Site00MobilePresentationShell>
      )}
    </>
  );
}
