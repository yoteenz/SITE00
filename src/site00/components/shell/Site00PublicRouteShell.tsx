import { type ReactNode } from 'react';
import { Site00PublicLayoutSwitch } from './Site00PublicLayoutSwitch';
import { Site00PresentationRouteShell } from './Site00PresentationRouteShell';

type Site00PublicRouteShellProps = {
  children: ReactNode;
  forceArtboard?: boolean;
};

/** Public Composer pages — presentation shell + preview toggle. */
export function Site00PublicRouteShell({ children, forceArtboard = false }: Site00PublicRouteShellProps) {
  return (
    <>
      <Site00PublicLayoutSwitch />
      <Site00PresentationRouteShell forceArtboard={forceArtboard}>
        {children}
      </Site00PresentationRouteShell>
    </>
  );
}
