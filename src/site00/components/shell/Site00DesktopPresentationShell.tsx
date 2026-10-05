import { type ReactNode } from 'react';
import { useSite00 } from '../../state/Site00Context';
import { Site00DesktopArtboardShell } from './Site00DesktopArtboardShell';
import { Site00DesktopNativeViewportShell } from './Site00DesktopNativeViewportShell';
import { resolveSite00DesktopPresentationMode } from './site00DesktopPresentation';
import { useSite00OriginWideViewport } from './useSite00OriginWideViewport';

type Site00DesktopPresentationShellProps = {
  children: ReactNode;
  /** Legacy `/origin/desktop` and `/foo/desktop` — always use scaled artboard. */
  forceArtboard?: boolean;
};

/**
 * Shared desktop presentation wrapper.
 * Phone + Desktop → scaled 1440×900 edge-to-edge; laptop + Desktop → native full viewport.
 */
export function Site00DesktopPresentationShell({
  children,
  forceArtboard = false,
}: Site00DesktopPresentationShellProps) {
  const { isPreviewDesktop } = useSite00();
  const isWideViewport = useSite00OriginWideViewport();
  const mode = resolveSite00DesktopPresentationMode(isPreviewDesktop, isWideViewport, forceArtboard);

  if (mode === 'scaled') {
    return <Site00DesktopArtboardShell>{children}</Site00DesktopArtboardShell>;
  }

  if (mode === 'native') {
    return <Site00DesktopNativeViewportShell>{children}</Site00DesktopNativeViewportShell>;
  }

  return <>{children}</>;
}
