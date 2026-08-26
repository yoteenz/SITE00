import { Outlet } from 'react-router-dom';
import { AstralWorldProvider } from '../context/AstralWorldContext';
import { AstralWorldDesktopNav, AstralWorldMobileNav } from './AstralWorldNav';
import { AstralWorldRightRail } from './AstralWorldRightRail';

export function AstralWorldExperienceShell() {
  return (
    <AstralWorldProvider>
      <div className="aw-experience-root" data-truth-layer="CREATIVE_EXPLORATION">
        <span className="aw-exploration-badge aw-desktop-only">CREATIVE EXPLORATION · AWAITING FOUNDER JUDGMENT</span>
        <div className="aw-shell">
          <AstralWorldDesktopNav />
          <div className="aw-shell__main">
            <main className="aw-shell__canvas">
              <span className="aw-exploration-badge aw-mobile-only">CREATIVE EXPLORATION</span>
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
