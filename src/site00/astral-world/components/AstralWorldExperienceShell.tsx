import { Outlet } from 'react-router-dom';
import { AstralWorldProvider } from '../context/AstralWorldContext';
import { AstralWorldDesktopNav, AstralWorldMobileNav } from './AstralWorldNav';
import { AstralWorldRightRail } from './AstralWorldRightRail';
import type { AstralWorldRouteMode } from '../../../../shared/site00-astral-world/routes.js';

export function AstralWorldExperienceShell({ mode = 'experience' }: { mode?: AstralWorldRouteMode }) {
  const isFastTrack = mode === 'fast-track';
  return (
    <AstralWorldProvider mode={mode}>
      <div
        className="aw-experience-root"
        data-truth-layer="CREATIVE_EXPLORATION"
        data-fast-track-prototype={isFastTrack ? 'true' : 'false'}
        data-source={isFastTrack ? 'FOUNDER_REFERENCE' : 'CREATIVE_EXPLORATION'}
      >
        <span className="aw-exploration-badge aw-desktop-only">
          {isFastTrack ? 'FOUNDER FAST TRACK · CREATIVE EXPLORATION' : 'CREATIVE EXPLORATION · AWAITING FOUNDER JUDGMENT'}
        </span>
        <div className="aw-shell">
          <AstralWorldDesktopNav />
          <div className="aw-shell__main">
            <main className="aw-shell__canvas">
              <span className="aw-exploration-badge aw-mobile-only">
                {isFastTrack ? 'FAST TRACK' : 'CREATIVE EXPLORATION'}
              </span>
              <Outlet />
            </main>
            <AstralWorldRightRail />
          </div>
        </div>
        <AstralWorldMobileNav />
      </div>
    </AstralWorldProvider>
  );
}
