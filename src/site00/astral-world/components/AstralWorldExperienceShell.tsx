import { useLocation, Outlet } from 'react-router-dom';
import { AstralWorldProvider } from '../context/AstralWorldContext';
import { AstralWorldDesktopNav, AstralWorldMobileNav } from './AstralWorldNav';
import { AstralWorldRightRail } from './AstralWorldRightRail';
import { AstralGenerationDebugPanel } from './AstralGenerationDebugPanel';
import { isAstralDebugMode } from '../../../../shared/site00-astral-world/referenceAssets.js';
import type { AstralWorldRouteMode } from '../../../../shared/site00-astral-world/routes.js';

export function AstralWorldExperienceShell({ mode = 'experience' }: { mode?: AstralWorldRouteMode }) {
  const isFastTrack = mode === 'fast-track';
  const { search } = useLocation();
  const showDebug = isAstralDebugMode(search);

  return (
    <AstralWorldProvider mode={mode}>
      <div
        className="aw-experience-root"
        data-truth-layer="CREATIVE_EXPLORATION"
        data-fast-track-prototype={isFastTrack ? 'true' : 'false'}
        data-source={isFastTrack ? 'FOUNDER_REFERENCE' : 'CREATIVE_EXPLORATION'}
      >
        {showDebug ? (
          <span className="aw-exploration-badge aw-desktop-only">
            {isFastTrack ? 'FOUNDER FAST TRACK · CREATIVE EXPLORATION' : 'CREATIVE EXPLORATION · AWAITING FOUNDER JUDGMENT'}
          </span>
        ) : null}
        <div className="aw-shell">
          <AstralWorldDesktopNav />
          <div className="aw-shell__main">
            <main className="aw-shell__canvas">
              {showDebug ? (
                <span className="aw-exploration-badge aw-mobile-only">
                  {isFastTrack ? 'FAST TRACK' : 'CREATIVE EXPLORATION'}
                </span>
              ) : null}
              <Outlet />
              <AstralGenerationDebugPanel />
            </main>
            <AstralWorldRightRail />
          </div>
        </div>
        <AstralWorldMobileNav />
      </div>
    </AstralWorldProvider>
  );
}
