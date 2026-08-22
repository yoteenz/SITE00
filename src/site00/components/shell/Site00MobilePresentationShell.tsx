import { type ReactNode } from 'react';
import { useSite00 } from '../../state/Site00Context';
import { Site00MobileArtboardShell } from './Site00MobileArtboardShell';
import { resolveSite00MobilePresentationMode } from './site00MobilePresentation';
import { useSite00OriginWideViewport } from './useSite00OriginWideViewport';

type Site00MobilePresentationShellProps = {
  children: ReactNode;
};

/**
 * Mobile preview on wide viewports — centered phone device with 390×844 screen.
 * On actual phones, children render at native full width.
 */
export function Site00MobilePresentationShell({ children }: Site00MobilePresentationShellProps) {
  const { isPreviewDesktop } = useSite00();
  const isWideViewport = useSite00OriginWideViewport();
  const mode = resolveSite00MobilePresentationMode(isPreviewDesktop, isWideViewport);

  if (mode === 'scaled') {
    return <Site00MobileArtboardShell>{children}</Site00MobileArtboardShell>;
  }

  return <>{children}</>;
}
