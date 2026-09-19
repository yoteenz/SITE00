/**
 * P0.VR.REBUILD.1 — Authority-first NDX mobile overview (composition from design authority, live function/data).
 */

import { Link } from 'react-router-dom';
import {
  site00ProjectContentOperationsCampaignBoardPath,
  site00ProjectContentOperationsPath,
  site00ProjectCulturalIntelligencePath,
  site00ProjectExpressionEngineCampaignPath,
} from '../../config/routes';
import { NDX_OVERVIEW_IN_PRODUCTION_VIEW_ALL, NDX_OVERVIEW_RADAR_VIEW_ALL } from '../../config/ndxOverviewMobileReference';
import { useProjectOperatingState } from '../../hooks/useProjectOperatingState';
import { useCampaignBoardWeekCalendar } from '../../hooks/useCampaignBoardWeekCalendar';
import { formatNdxTodayDateLabel } from '../../utils/campaignBoardWeekCalendar';
import { entryProductionArtwork } from '../../utils/entryProductionArtwork';
import { AssetPendingPlaceholder } from '../designWorkspace/AssetPendingPlaceholder';
import { MobileFounderWorkspaceChrome } from '../founderWorkspace/MobileFounderWorkspaceChrome';
import '../../styles/site00-authority-first-twin.css';

type Props = {
  projectSlug: string;
  regionOrder?: string[] | null;
};

const MODULE_NAV = [
  { id: 'overview', label: 'OVERVIEW', active: true },
  { id: 'content-ops', label: 'CONTENT OPS', active: false },
  { id: 'campaign', label: 'CAMPAIGN', active: false },
  { id: 'intel', label: 'INTEL', active: false },
];

export function AuthorityFirstNdxOverviewTwin({ projectSlug, regionOrder }: Props) {
  const { state: operatingState } = useProjectOperatingState(projectSlug);
  const metrics = operatingState?.pulse.counts ?? {
    beingMade: 0,
    needYourEye: 0,
    developing: 0,
    fromAudience: 0,
  };
  const productionCards = operatingState?.inProduction ?? [];
  const radarItems = operatingState?.radarItems.length
    ? operatingState.radarItems
    : ['Gathering signals — no live radar items yet'];
  const inProductionViewAll = productionCards.length || NDX_OVERVIEW_IN_PRODUCTION_VIEW_ALL;
  const radarViewAll = radarItems.length || NDX_OVERVIEW_RADAR_VIEW_ALL;
  const campaignWeek = useCampaignBoardWeekCalendar();
  const todayDateLabel = formatNdxTodayDateLabel(
    campaignWeek.days.find((d) => d.active)?.date ?? new Date(),
  );
  const heroArt = productionCards[0] ? entryProductionArtwork(productionCards[0].id) : null;

  return (
    <MobileFounderWorkspaceChrome projectSlug={projectSlug}>
      <div
        className="site00-aft-overview"
        data-authority-first-twin="ndx-overview-mobile"
        data-authority-region-order={regionOrder?.join(',') ?? 'authority-default'}
      >
        <section className="site00-aft-region" data-authority-region="project-identity">
          <p className="site00-aft-eyebrow">NDXBOOK · STUDIO WORLD</p>
          <h1 className="site00-aft-title">PROJECT NDXBOOK</h1>
          <p className="site00-aft-subtitle">Authority-shaped overview · live operating data</p>
        </section>

        <section className="site00-aft-region site00-aft-region--meta" data-authority-region="project-meta">
          <span className="site00-aft-meta-label">CURRENT PHASE</span>
          <span className="site00-aft-meta-value">Content operations · {todayDateLabel}</span>
        </section>

        <nav className="site00-aft-region site00-aft-module-nav" data-authority-region="section-nav" aria-label="Module navigation">
          {MODULE_NAV.map((item) => (
            <span
              key={item.id}
              className={`site00-aft-module-nav__item${item.active ? ' site00-aft-module-nav__item--active' : ''}`}
            >
              {item.label}
            </span>
          ))}
        </nav>

        <section className="site00-aft-region site00-aft-hero-media" data-authority-region="hero-media">
          {heroArt ? (
            <div
              className="site00-aft-hero-media__frame"
              style={{
                backgroundImage: `url(${heroArt.path})`,
                backgroundPosition: heroArt.objectPosition,
              }}
              role="img"
              aria-label="Editorial hero"
            />
          ) : (
            <div className="site00-aft-hero-media__frame site00-aft-hero-media__frame--required">
              <span>ASSET REQUIRED</span>
              <span className="site00-aft-hero-media__hint">Authority hero slot preserved</span>
            </div>
          )}
          <div className="site00-aft-hero-media__copy">
            <p className="site00-aft-hero-media__kicker">EDITORIAL FOCUS</p>
            <p className="site00-aft-hero-media__headline">
              {productionCards[0]?.title?.toUpperCase() ?? 'CURRENT PRODUCTION ENTRY'}
            </p>
          </div>
        </section>

        <section className="site00-aft-region site00-aft-progress" data-authority-region="progress-band">
          <div className="site00-aft-progress__track">
            <div className="site00-aft-progress__fill" style={{ width: '62%' }} />
          </div>
          <p className="site00-aft-progress__label">Phase progress · Assisted autonomy</p>
        </section>

        <section className="site00-aft-region site00-aft-metrics" data-authority-region="metric-cells">
          <div className="site00-aft-metrics__cell">
            <strong>{metrics.beingMade}</strong>
            <span>BEING MADE</span>
          </div>
          <div className="site00-aft-metrics__cell">
            <strong>{metrics.needYourEye}</strong>
            <span>NEED EYE</span>
          </div>
          <div className="site00-aft-metrics__cell">
            <strong>{metrics.developing}</strong>
            <span>DEVELOPING</span>
          </div>
          <div className="site00-aft-metrics__cell">
            <strong>{metrics.fromAudience}</strong>
            <span>AUDIENCE</span>
          </div>
        </section>

        <section className="site00-aft-region site00-aft-content-rail" data-authority-region="content-rail">
          <div className="site00-aft-section-head">
            <p>NEXT MILESTONE</p>
            <Link to={site00ProjectContentOperationsCampaignBoardPath(projectSlug)} className="site00-aft-link">
              View all ({inProductionViewAll})
            </Link>
          </div>
          <div className="site00-aft-card-rail">
            {productionCards.slice(0, 4).map((item, index) => {
              const art = entryProductionArtwork(item.id);
              return (
                <Link key={item.id} to={item.href} className="site00-aft-card">
                  {art ? (
                    <div
                      className="site00-aft-card__art"
                      style={{ backgroundImage: `url(${art.path})`, backgroundPosition: art.objectPosition }}
                    />
                  ) : (
                    <AssetPendingPlaceholder regionId={`aft-card-${index}`} aspectRatio="4 / 3" />
                  )}
                  <p className="site00-aft-card__title">{item.title}</p>
                </Link>
              );
            })}
          </div>
          <Link to={site00ProjectExpressionEngineCampaignPath(projectSlug)} className="site00-aft-inline-link">
            Expression engine →
          </Link>
        </section>

        <section className="site00-aft-region site00-aft-activity" data-authority-region="activity-list">
          <div className="site00-aft-section-head">
            <p>RECENT ACTIVITY</p>
            <Link to={site00ProjectCulturalIntelligencePath(projectSlug)} className="site00-aft-link">
              Radar ({radarViewAll})
            </Link>
          </div>
          <ul className="site00-aft-activity__list">
            {radarItems.slice(0, 5).map((item, index) => (
              <li key={`${item}-${index}`}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <Link to={site00ProjectContentOperationsPath(projectSlug)} className="site00-aft-inline-link">
            Content ops desk →
          </Link>
        </section>
      </div>
    </MobileFounderWorkspaceChrome>
  );
}
