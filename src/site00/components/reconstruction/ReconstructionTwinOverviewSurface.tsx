/**
 * P0.VR.CONVERGE.1R1 — Twin preview body: same NDX mobile overview, no POS redirect shell.
 */

import { OverviewMobileHomeScreen } from '../founderWorkspace/OverviewFounderWorkspaceBoard.js';
import '../../styles/site00-founder-workspace.css';
import '../../styles/site00-project-overview.css';

type Props = {
  projectSlug: string;
};

export function ReconstructionTwinOverviewSurface({ projectSlug }: Props) {
  return (
    <div
      className="site00-reconstruction-twin-page site00-ecosystem-shell--ndx-founder-mobile"
      data-reconstruction-twin-surface="overview"
    >
      <div className="site00-mobile-shell site00-ecosystem-mobile-shell site00-ecosystem-mobile-shell--suppress-chrome">
        <main className="site00-mobile-shell__main site00-ecosystem-mobile-shell__main">
          <div className="site00-pov site00-pov--ndxbook-authority-mobile" data-screen-replication="NDX_OVERVIEW_MOBILE">
            <OverviewMobileHomeScreen projectSlug={projectSlug} />
          </div>
        </main>
      </div>
    </div>
  );
}
