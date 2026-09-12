/**
 * P0.VR.REPLICATION.2 — Shell-first NDXBOOK mobile overview (authority geometry, live data bound after shell).
 */

import { Link, useLocation } from 'react-router-dom';
import { isNdxLabRouteGroupPath } from '../../../../shared/site00-studio-world-production/founderWorkspace/labNavigation/index.js';
import {
  site00ProjectContentOperationsCampaignBoardPath,
  site00ProjectContentOperationsPath,
  site00ProjectCulturalIntelligencePath,
} from '../../config/routes';
import { ndxFounderWorkspaceMobileNav } from '../../config/ndxFounderWorkspaceMobileNav';
import {
  NDX_METRIC_STATUS_LABELS,
  NDX_SECTION_NAV_LABELS,
} from '../../../../shared/site00-studio-world-production/visualReconstruction/p0vrReplication2/constants.js';
import { useProjectOperatingState } from '../../hooks/useProjectOperatingState';
import { useCampaignBoardWeekCalendar } from '../../hooks/useCampaignBoardWeekCalendar';
import { formatNdxTodayDateLabel } from '../../utils/campaignBoardWeekCalendar';
import { entryProductionArtwork } from '../../utils/entryProductionArtwork';
import { AssetPendingPlaceholder } from '../designWorkspace/AssetPendingPlaceholder';
import { Site00Diamond } from '../shell/Site00Diamond';
import { NDXBottomNavIcon } from '../../icons/ndx/NDXBottomNavIcon';
import { NDXIcon } from '../../icons/ndx';
import { NDX_ICON_CONTEXT_SIZE } from '../../../../shared/site00-studio-world-ui/icons/index.js';
import type { ReactNode } from 'react';
import '../../styles/site00-shell-first-twin.css';

type Props = {
  projectSlug: string;
  heroOverride?: ReactNode;
  hostClassName?: string;
};

export function ShellFirstNdxOverviewTwin({ projectSlug, heroOverride, hostClassName }: Props) {
  const location = useLocation();
  const nav = ndxFounderWorkspaceMobileNav(projectSlug);
  const { state: operatingState } = useProjectOperatingState(projectSlug);
  const metrics = operatingState?.pulse.counts ?? {
    beingMade: 0,
    needYourEye: 0,
    developing: 0,
    fromAudience: 0,
  };
  const metricValues = [metrics.beingMade, metrics.needYourEye, metrics.developing, metrics.fromAudience];
  const productionCards = operatingState?.inProduction ?? [];
  const radarItems = operatingState?.radarItems.length
    ? operatingState.radarItems
    : ['Gathering signals — activity pending'];
  const campaignWeek = useCampaignBoardWeekCalendar();
  const todayDateLabel = formatNdxTodayDateLabel(
    campaignWeek.days.find((d) => d.active)?.date ?? new Date(),
  );
  const heroArt = productionCards[0] ? entryProductionArtwork(productionCards[0].id) : null;
  const focusTitle = productionCards[0]?.title ?? 'Current production focus';
  const milestoneTitle = productionCards[1]?.title ?? 'Next milestone';

  return (
    <div className="site00-sft" data-shell-first-twin="ndx-overview-mobile">
      <header className={`site00-sft__band site00-sft__host${hostClassName ? ` ${hostClassName}` : ''}`} data-shell-band="host-header">
        <div className="site00-sft__host-brand">
          <Site00Diamond mode="HOST_DEFAULT" />
          <span className="site00-sft__host-wordmark">SITE 00</span>
        </div>
        <div className="site00-sft__host-actions">
          <button type="button" className="site00-sft__host-icon" aria-label="Menu">
            <NDXIcon name="ellipsis" size={NDX_ICON_CONTEXT_SIZE.header} decorative />
          </button>
          <span className="site00-sft__host-avatar" aria-hidden="true" />
        </div>
      </header>

      <nav className="site00-sft__band site00-sft__breadcrumb" data-shell-band="breadcrumb" aria-label="Breadcrumb">
        <span>PROJECTS</span>
        <span aria-hidden="true">›</span>
        <strong>NDXBOOK</strong>
      </nav>

      <section className="site00-sft__band site00-sft__masthead" data-shell-band="masthead">
        <div className="site00-sft__masthead-main">
          <h1 className="site00-sft__project-title">NDXBOOK</h1>
          <p className="site00-sft__project-sub">Studio world · mobile overview</p>
          <span className="site00-sft__founder-badge">FOUNDER OWNED</span>
        </div>
        <aside className="site00-sft__masthead-context" data-shell-band="masthead-context-column">
          <span className="site00-sft__context-label">CULTURE</span>
          <span className="site00-sft__context-value">Editorial systems</span>
          <span className="site00-sft__context-label">STATUS</span>
          <span className="site00-sft__context-value">{todayDateLabel}</span>
        </aside>
      </section>

      <nav className="site00-sft__band site00-sft__section-nav" data-shell-band="section-nav" aria-label="Module navigation">
        {NDX_SECTION_NAV_LABELS.map((label, i) => (
          <span
            key={label}
            className={`site00-sft__section-nav-item${i === 0 ? ' site00-sft__section-nav-item--active' : ''}`}
          >
            {label}
          </span>
        ))}
      </nav>

      {heroOverride ?? (
        <section className="site00-sft__band site00-sft__hero" data-shell-band="hero-editorial">
          <div className="site00-sft__hero-media">
            {heroArt ? (
              <div
                className="site00-sft__hero-image"
                style={{
                  backgroundImage: `url(${heroArt.path})`,
                  backgroundPosition: heroArt.objectPosition,
                }}
                role="img"
                aria-label="Editorial hero"
              />
            ) : (
              <AssetPendingPlaceholder regionId="sft-hero" aspectRatio="16 / 10" />
            )}
          </div>
          <div className="site00-sft__hero-copy">
            <p className="site00-sft__hero-kicker">EDITORIAL</p>
            <p className="site00-sft__hero-headline">{focusTitle.toUpperCase()}</p>
          </div>
          <div className="site00-sft__hero-side" aria-hidden="true">
            <div className="site00-sft__hero-graphic" />
          </div>
        </section>
      )}

      <section className="site00-sft__band site00-sft__progress" data-shell-band="progress-phase">
        <div className="site00-sft__progress-track">
          <div className="site00-sft__progress-fill" style={{ width: '58%' }} />
        </div>
        <p className="site00-sft__progress-label">Project progress · Current phase active</p>
      </section>

      <section className="site00-sft__band site00-sft__metrics" data-shell-band="metric-status-row">
        {NDX_METRIC_STATUS_LABELS.map((label, i) => (
          <div key={label} className="site00-sft__metric-cell">
            <strong>{metricValues[i] ?? 0}</strong>
            <span>{label}</span>
          </div>
        ))}
      </section>

      <section className="site00-sft__band site00-sft__focus" data-shell-band="focus-milestone">
        <div className="site00-sft__focus-col">
          <p className="site00-sft__band-label">CURRENT FOCUS</p>
          <p className="site00-sft__focus-title">{focusTitle}</p>
        </div>
        <div className="site00-sft__focus-col">
          <p className="site00-sft__band-label">NEXT MILESTONE</p>
          <p className="site00-sft__focus-title">{milestoneTitle}</p>
        </div>
      </section>

      <section className="site00-sft__band site00-sft__activity" data-shell-band="recent-activity">
        <div className="site00-sft__activity-head">
          <p className="site00-sft__band-label">RECENT ACTIVITY</p>
          <Link to={site00ProjectCulturalIntelligencePath(projectSlug)} className="site00-sft__link">
            View radar
          </Link>
        </div>
        <ul className="site00-sft__activity-list">
          {radarItems.slice(0, 4).map((item, index) => (
            <li key={`${item}-${index}`}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <Link to={site00ProjectContentOperationsCampaignBoardPath(projectSlug)} className="site00-sft__link">
          Production board →
        </Link>
        <Link to={site00ProjectContentOperationsPath(projectSlug)} className="site00-sft__link site00-sft__link--secondary">
          Content ops →
        </Link>
      </section>

      <nav className="site00-sft__band site00-sft__bottom-nav" data-shell-band="bottom-nav" aria-label="SITE 00 navigation">
        {nav.map((item) => {
          const active =
            item.id === 'more'
              ? false
              : item.id === 'lab'
                ? isNdxLabRouteGroupPath(location.pathname, projectSlug)
                : item.screenId === 'overview';
          if (item.id === 'more') {
            return (
              <span key={item.id} className="site00-sft__bottom-item">
                <NDXBottomNavIcon name={item.icon} state="inactive" decorative />
                <span>{item.label}</span>
              </span>
            );
          }
          return (
            <Link
              key={item.id}
              to={item.href}
              className={`site00-sft__bottom-item${active ? ' site00-sft__bottom-item--active' : ''}`}
            >
              <NDXBottomNavIcon name={item.icon} state={active ? 'active' : 'inactive'} decorative />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
