/**
 * P0.VR.REBUILD.1 — Twin preview: authority-first composition or legacy patch surface.
 */

import type { ReconstructionTwinSession } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrUpgrade2/types.js';
import { resolveTwinRenderMode } from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrRebuild1/sessionVisualAuthority.js';
import { OverviewMobileHomeScreen } from '../founderWorkspace/OverviewFounderWorkspaceBoard.js';
import { AuthorityFirstNdxOverviewTwin } from './AuthorityFirstNdxOverviewTwin.js';
import { ShellFirstNdxOverviewTwin } from './ShellFirstNdxOverviewTwin.js';
import { VisionLiteralNdxOverviewTwin } from './VisionLiteralNdxOverviewTwin.js';
import { ForensicBlueprintNdxOverviewTwin } from './ForensicBlueprintNdxOverviewTwin.js';
import '../../styles/site00-founder-workspace.css';
import '../../styles/site00-project-overview.css';

type Props = {
  projectSlug: string;
  session: ReconstructionTwinSession;
};

export function ReconstructionTwinOverviewSurface({ projectSlug, session }: Props) {
  const renderMode = resolveTwinRenderMode(session);
  const forensicExecuted = renderMode === 'FORENSIC_BLUEPRINT_EXECUTED_NDX_OVERVIEW';
  const forensic = renderMode === 'FORENSIC_BLUEPRINT_NDX_OVERVIEW' || forensicExecuted;
  const visionLiteralExecuted = renderMode === 'VISION_LITERAL_EXECUTED_NDX_OVERVIEW';
  const visionLiteral =
    !forensic && (renderMode === 'VISION_LITERAL_NDX_OVERVIEW' || visionLiteralExecuted);
  const shellFirst = !forensic && renderMode === 'SHELL_FIRST_NDX_OVERVIEW';
  const authorityFirst = renderMode === 'AUTHORITY_FIRST_NDX_OVERVIEW';

  return (
    <div
      className={`site00-reconstruction-twin-page site00-ecosystem-shell--ndx-founder-mobile${shellFirst || visionLiteral || forensic ? ' site00-reconstruction-twin-page--shell-first' : ''}${visionLiteral ? ' site00-reconstruction-twin-page--vision-literal' : ''}${forensic ? ' site00-reconstruction-twin-page--forensic-blueprint' : ''}`}
      data-reconstruction-twin-surface="overview"
      data-twin-render-mode={renderMode}
      data-visual-authority-status={session.visualAuthorityStatus ?? 'PENDING'}
    >
      {forensic ? (
        <ForensicBlueprintNdxOverviewTwin projectSlug={projectSlug} session={session} />
      ) : visionLiteral ? (
        <VisionLiteralNdxOverviewTwin projectSlug={projectSlug} session={session} executed={visionLiteralExecuted} />
      ) : shellFirst ? (
        <ShellFirstNdxOverviewTwin projectSlug={projectSlug} />
      ) : authorityFirst ? (
        <AuthorityFirstNdxOverviewTwin projectSlug={projectSlug} regionOrder={session.authorityRegionOrder} />
      ) : (
        <div className="site00-mobile-shell site00-ecosystem-mobile-shell site00-ecosystem-mobile-shell--suppress-chrome">
          <main className="site00-mobile-shell__main site00-ecosystem-mobile-shell__main">
            <div
              className="site00-pov site00-pov--ndxbook-authority-mobile"
              data-screen-replication="NDX_OVERVIEW_MOBILE"
              data-legacy-patch-twin="true"
            >
              <OverviewMobileHomeScreen projectSlug={projectSlug} />
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
