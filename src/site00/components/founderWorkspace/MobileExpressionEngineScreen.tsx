/**
 * Expression Engine — mobile full-screen blueprint (Image B family).
 */

import { Link } from 'react-router-dom';
import { ExpressionEngineCampaignWorkspace } from './ExpressionEngineCampaignWorkspace';
import { site00ProjectContentOperationsCampaignBoardPath, site00ProjectLabPath } from '../../config/routes';
import { NDX_VR_REGION, vrRegionAttr } from '../../config/ndxVisualRegionIds';

type Props = {
  projectSlug: string;
};

export function MobileExpressionEngineScreen({ projectSlug }: Props) {
  const boardPath = site00ProjectContentOperationsCampaignBoardPath(projectSlug);
  const labPath = site00ProjectLabPath(projectSlug);

  return (
    <div
      className="site00-fws-mobile-campaign site00-fws-mobile-content-shell site00-fws-mobile-expr"
      data-visual-reconstruction="mobile-expression-engine"
      {...vrRegionAttr(NDX_VR_REGION.campaignContentShell)}
    >
      <nav className="site00-fws-mobile-campaign__breadcrumb" aria-label="Expression Engine navigation">
        <Link to={labPath} className="site00-fws-mobile-campaign__breadcrumb-parent">
          LAB HUB
        </Link>
        <span className="site00-fws-mobile-campaign__breadcrumb-sep" aria-hidden>
          ›
        </span>
        <Link to={boardPath} className="site00-fws-mobile-campaign__breadcrumb-parent">
          CAMPAIGN BOARD
        </Link>
        <span className="site00-fws-mobile-campaign__breadcrumb-sep" aria-hidden>
          ›
        </span>
        <span className="site00-fws-mobile-campaign__breadcrumb-active">EXPRESSION ENGINE</span>
      </nav>

      <header className="site00-fws-mobile-campaign__hero">
        <h2 className="site00-fws-mobile-campaign__heading">EXPRESSION ENGINE</h2>
        <p className="site00-fws-mobile-campaign__tagline">Entry production blueprint</p>
        <p className="site00-fws-mobile-campaign__support">B1 live proof — territory locked, anchor review pending</p>
      </header>

      <ExpressionEngineCampaignWorkspace projectSlug={projectSlug} />
    </div>
  );
}
