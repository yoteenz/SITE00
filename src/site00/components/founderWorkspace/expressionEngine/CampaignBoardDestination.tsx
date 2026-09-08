/**
 * B5.0R1 — Campaign Board destination (locked behind Social Package completion).
 */

import { Link } from 'react-router-dom';
import type { SocialPackageReadiness } from './socialPackageReadiness';

type Props = {
  readiness: SocialPackageReadiness;
  campaignBoardPath: string;
};

export function CampaignBoardDestination({ readiness, campaignBoardPath }: Props) {
  const ready = readiness.campaignBoardEligible;

  return (
    <article className={`site00-ee-campaign${ready ? ' site00-ee-campaign--ready' : ''}`}>
      <header>
        <span className="site00-ee-campaign__kicker">DESTINATION</span>
        <h3>CAMPAIGN BOARD</h3>
      </header>
      {ready ? (
        <>
          <p className="site00-ee-campaign__status site00-ee-campaign__status--ready">READY</p>
          <p className="site00-ee-campaign__meta">
            {readiness.approvedDerivativeCount}/{readiness.requiredDerivativeCount} derivatives approved
          </p>
          <Link to={campaignBoardPath} className="site00-btn site00-btn--primary site00-ee-campaign__action">
            DEPLOY SOCIAL PACKAGE
          </Link>
        </>
      ) : (
        <>
          <p className="site00-ee-campaign__status site00-ee-campaign__status--locked">LOCKED</p>
          <p className="site00-ee-campaign__reason">
            {readiness.packageStatus === 'LOCKED'
              ? 'COMPLETE SOCIAL PACKAGE REQUIRED'
              : `SOCIAL PACKAGE INCOMPLETE (${readiness.approvedDerivativeCount}/${readiness.requiredDerivativeCount} approved)`}
          </p>
        </>
      )}
    </article>
  );
}
