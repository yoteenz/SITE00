import { type ReactNode } from 'react';
import { Site00OriginLayoutSwitch } from './Site00OriginLayoutSwitch';
import { Site00PresentationRouteShell } from './Site00PresentationRouteShell';

type Site00OriginRouteShellProps = {
  children: ReactNode;
  forceArtboard?: boolean;
};

/** Origin family routes — presentation shell + layout preview toggle. */
export function Site00OriginRouteShell({ children, forceArtboard = false }: Site00OriginRouteShellProps) {
  return (
    <>
      <Site00OriginLayoutSwitch />
      <Site00PresentationRouteShell forceArtboard={forceArtboard}>
        {children}
      </Site00PresentationRouteShell>
    </>
  );
}

export { SITE00_ORIGIN_DESKTOP_BREAKPOINT_PX } from './site00OriginViewport';
