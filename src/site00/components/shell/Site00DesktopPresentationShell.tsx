import { type ReactNode } from 'react';
import { useSite00 } from '../../state/Site00Context';
import { Site00DesktopArtboardShell } from './Site00DesktopArtboardShell';
import { Site00DesktopNativeViewportShell } from './Site00DesktopNativeViewportShell';
import { resolveSite00DesktopPresentationMode } from './site00DesktopPresentation';

type Site00DesktopPresentationShellProps = {
  children: ReactNode;
  /** Legacy `/origin/desktop` and `/foo/desktop` — always use scaled artboard. */
  forceArtboard?: boolean;
};

/**
 * Shared desktop presentation wrapper — native full viewport whenever Desktop is selected
 * (phone and laptop use the same shell so preview stays in sync).
 */
export function Site00DesktopPresentationShell({
  children,
  forceArtboard = false,
}: Site00DesktopPresentationShellProps) {
  const { isPreviewDesktop } = useSite00();
  const mode = resolveSite00DesktopPresentationMode(isPreviewDesktop, false, forceArtboard);

  if (mode === 'scaled') {
    return <Site00DesktopArtboardShell>{children}</Site00DesktopArtboardShell>;
  }

  if (mode === 'native') {
    return <Site00DesktopNativeViewportShell>{children}</Site00DesktopNativeViewportShell>;
  }

  return <>{children}</>;
}
