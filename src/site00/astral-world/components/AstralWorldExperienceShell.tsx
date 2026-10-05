import { useLocation, Outlet } from 'react-router-dom';
import { AstralWorldProvider } from '../context/AstralWorldContext';
import { AstralWorldDesktopNav, AstralWorldMobileNav } from './AstralWorldNav';
import { AstralWorldRightRail } from './AstralWorldRightRail';
import { AstralGenerationDebugPanel } from './AstralGenerationDebugPanel';
import { AstralSceneTransition } from './immersive/AstralSceneTransition';
import { isAstralDebugMode } from '../../../../shared/site00-astral-world/referenceAssets.js';
import { isAstralImmersiveRoute } from '../../../../shared/site00-astral-world/scenes/immersiveRoutes.js';
import type { AstralWorldRouteMode } from '../../../../shared/site00-astral-world/routes.js';

export function AstralWorldExperienceShell({ mode = 'experience' }: { mode?: AstralWorldRouteMode }) {
  const isFastTrack = mode === 'fast-track';
  const { search, pathname } = useLocation();
  const showDebug = isAstralDebugMode(search);
  const immersive = isAstralImmersiveRoute(pathname);

  return (
    <AstralWorldProvider mode={mode}>
      <div
        className="aw-experience-root"
        data-truth-layer="CREATIVE_EXPLORATION"
        data-fast-track-prototype={isFastTrack ? 'true' : 'false'}
        data-source={isFastTrack ? 'FOUNDER_REFERENCE' : 'CREATIVE_EXPLORATION'}
        data-immersive-route={immersive ? 'true' : 'false'}
      >
        {showDebug ? (
          <span className="aw-exploration-badge aw-desktop-only">
            {isFastTrack ? 'FOUNDER FAST TRACK · CREATIVE EXPLORATION' : 'CREATIVE EXPLORATION · AWAITING FOUNDER JUDGMENT'}
          </span>
        ) : null}
        <div className={`aw-shell${immersive ? ' aw-shell--immersive' : ''}`}>
          <AstralWorldDesktopNav />
          <div className="aw-shell__main">
            <main className="aw-shell__canvas">
              {showDebug ? (
                <span className="aw-exploration-badge aw-mobile-only">
                  {isFastTrack ? 'FAST TRACK' : 'CREATIVE EXPLORATION'}
                </span>
              ) : null}
              <AstralSceneTransition sceneKey={pathname}>
                <Outlet />
              </AstralSceneTransition>
              <AstralGenerationDebugPanel />
            </main>
            {!immersive ? <AstralWorldRightRail /> : null}
          </div>
        </div>
        <AstralWorldMobileNav />
      </div>
    </AstralWorldProvider>
  );
}
