/**
 * Parent authority stage. One photographic plate is the page. Live type and controls sit on it.
 * Used by TODAY, MONEY, PLAN, and CREDIT hubs only.
 */

import type { ReactNode } from 'react';
import { JurnlLogo } from './primitives';
import { JurnlScreen, type FamilyPlate } from '../screens/JurnlScreen';

export function ParentAuthorityStage({
  screenId,
  plate,
  tagline = false,
  nav,
  overlays,
  children,
}: {
  screenId: string;
  plate: FamilyPlate;
  tagline?: boolean;
  nav: ReactNode;
  overlays?: ReactNode;
  children: ReactNode;
}) {
  return (
    <JurnlScreen screenId={screenId} familyPlate={plate} family productNav singlePlate>
      <div className="jrn-pa" data-jrn-parent={plate.family} data-runtime-stage="SAFE ZONE">
        <header className="jrn-pa__brand">
          <JurnlLogo />
          <p className="jrn-pa__desc">FINANCIAL LIFE. BEAUTIFULLY ORGANIZED.</p>
          {tagline ? <p className="jrn-pa__tag">PLAN TODAY. GROW FREELY.</p> : null}
        </header>
        <div className="jrn-pa__body">{children}</div>
      </div>
      {nav}
      {overlays}
    </JurnlScreen>
  );
}
