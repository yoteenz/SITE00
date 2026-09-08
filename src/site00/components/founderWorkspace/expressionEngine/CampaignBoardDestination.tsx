/**
 * B5.0 — Campaign Board destination (terminal workflow state).
 */

import { Link } from 'react-router-dom';

type Props = {
  ready: boolean;
  blockers: string[];
  campaignBoardPath: string;
};

export function CampaignBoardDestination({ ready, blockers, campaignBoardPath }: Props) {
  return (
    <article className={`site00-ee-campaign${ready ? ' site00-ee-campaign--ready' : ''}`}>
      <header>
        <span className="site00-ee-campaign__kicker">DESTINATION</span>
        <h3>CAMPAIGN BOARD</h3>
      </header>
      {ready ? (
        <>
          <p className="site00-ee-campaign__status site00-ee-campaign__status--ready">READY</p>
          <Link to={campaignBoardPath} className="site00-btn site00-btn--primary site00-ee-campaign__action">
            ADD TO CAMPAIGN BOARD
          </Link>
        </>
      ) : (
        <>
          <p className="site00-ee-campaign__status site00-ee-campaign__status--locked">LOCKED</p>
          <p className="site00-ee-campaign__reason">
            {blockers[0] ?? 'FINAL REEL REQUIRED'}
          </p>
        </>
      )}
    </article>
  );
}
