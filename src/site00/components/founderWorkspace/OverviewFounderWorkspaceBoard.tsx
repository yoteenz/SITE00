/**
 * P0.VR.1D.A — Desktop founder workspace composite board (Image A authority).
 * Coded interactive reconstruction — not a flattened screenshot.
 */

import { Link } from 'react-router-dom';
import {
  site00ProjectBrandMarketingExpressionExperiment01Path,
  site00ProjectContentOperationsCampaignBoardPath,
  site00ProjectContentOperationsPath,
  site00ProjectContentOperationsPerformancePath,
  site00ProjectCulturalIntelligencePath,
  site00ProjectExperimentsPath,
  site00ProjectFounderCharacterDiscoveryPath,
} from '../../config/routes';

type Props = {
  projectSlug: string;
};

const IN_PRODUCTION = [
  { title: 'Subscription Normalization', tag: 'TOP PRIORITY', tone: 'priority' as const, subtitle: 'Precision tool → routine' },
  { title: 'Corporate Layoff Memo', tag: null, tone: 'default' as const, subtitle: 'Layoff memo v2' },
  { title: 'Late Fees Across Decades', tag: null, tone: 'default' as const, subtitle: 'Narrative in motion' },
];

const RADAR_ITEMS = [
  'Corporate Layoff Memo Language',
  'Late Fees Across Decades',
  'Airline Loyalty Normalization',
];

const CAMPAIGN_DAYS = ['Mon 25', 'Tue 26', 'Wed 27', 'Thu 28', 'Fri 29', 'Sat 30', 'Sun 31'];

const EXPERIMENT_TILES = [
  'I HAVE A THEORY',
  'BE SERIOUS.',
  'THE MARGINS',
  'GIRL, LOOK AT THIS',
  'NOPE. NOT NORMAL.',
  'ONE BOOK IN MOTION',
  'CURRENT DIRECTION',
  'V2.3',
  'INSPECT →',
];

const CI_SIGNALS = [
  { label: 'Subscription Fatigue', score: '0.82' },
  { label: 'Loyalty Language Drift', score: '0.76' },
  { label: 'Quiet Luxury Signal', score: '0.71' },
];

const PERFORMANCE_STATS = [
  { label: 'CONTEXT TILES', value: '128K' },
  { label: 'STORIES', value: '8.7K' },
  { label: 'REBELS', value: '3.2K' },
  { label: 'PROFILE VIEWS', value: '+1.1K' },
];

function TapeCard({
  title,
  children,
  className,
  href,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
  href?: string;
}) {
  const body = (
    <article
      className={`site00-fws-hub-tape${className ? ` ${className}` : ''}`}
      data-vr-region={title.replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 48)}
    >
      <span className="site00-fws-hub-tape__pin" aria-hidden />
      <h3 className="site00-fws-hub-tape__title">{title}</h3>
      {children}
    </article>
  );
  return href ? (
    <Link to={href} className="site00-fws-hub-tape-link">
      {body}
    </Link>
  ) : (
    body
  );
}

export function OverviewFounderWorkspaceBoard({ projectSlug }: Props) {
  const experimentPath = site00ProjectBrandMarketingExpressionExperiment01Path(projectSlug);

  return (
    <div
      className="site00-fws-hub-board"
      data-visual-reconstruction="project-hub-desktop-board"
      data-vr-region="DESKTOP_COMPOSITE_OVERVIEW"
    >
      <div className="site00-fws-hub-board__top">
        <TapeCard
          title="OVERVIEW · CONTENT OPERATIONS + PERFORMANCE LEARNING"
          href={site00ProjectContentOperationsPath(projectSlug)}
          className="site00-fws-hub-tape--overview"
        >
          <div className="site00-fws-hub-kpis">
            <div>
              <strong>5</strong>
              <span>BEING MADE</span>
            </div>
            <div>
              <strong>2</strong>
              <span>NEED YOUR EYE</span>
            </div>
            <div>
              <strong>3</strong>
              <span>DEVELOPING</span>
            </div>
            <div>
              <strong>1</strong>
              <span>FROM AUDIENCE</span>
            </div>
          </div>
          <Link to={site00ProjectContentOperationsCampaignBoardPath(projectSlug)} className="site00-fws-hub-cta">
            REVIEW NEEDS ME →
          </Link>
          <p className="site00-fws-hub-section-label">IN PRODUCTION</p>
          <div className="site00-fws-hub-carousel">
            {IN_PRODUCTION.map((item) => (
              <div
                key={item.title}
                className={`site00-fws-hub-carousel__card${item.tone === 'priority' ? ' site00-fws-hub-carousel__card--priority' : ''}`}
              >
                {item.tag ? <span className="site00-fws-hub-tag">{item.tag}</span> : null}
                <p>{item.title}</p>
                <span className="site00-fws-hub-link">Review →</span>
              </div>
            ))}
          </div>
          <div className="site00-fws-hub-split">
            <div>
              <p className="site00-fws-hub-section-label">ON NDX&apos;S RADAR</p>
              <ul className="site00-fws-hub-list">
                {RADAR_ITEMS.map((item, index) => (
                  <li key={item}>
                    {String(index + 1).padStart(2, '0')} {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="site00-fws-hub-radar" aria-hidden>
              <div className="site00-fws-hub-radar__ring" />
              <div className="site00-fws-hub-radar__spoke" />
            </div>
          </div>
        </TapeCard>

        <TapeCard
          title="CAMPAIGN BOARD · WEEK 01"
          href={site00ProjectContentOperationsCampaignBoardPath(projectSlug)}
          className="site00-fws-hub-tape--campaign"
        >
          <p className="site00-fws-hub-meta">May 24 – May 30</p>
          <div className="site00-fws-hub-days">
            {CAMPAIGN_DAYS.map((day, index) => (
              <span
                key={day}
                className={`site00-fws-hub-days__chip${index === 0 ? ' site00-fws-hub-days__chip--active' : ''}`}
              >
                {day}
              </span>
            ))}
          </div>
          <p className="site00-fws-hub-section-label">THE PAGES</p>
          <div className="site00-fws-hub-page-grid">
            {['Corporate Layoff Memo', 'Subscription Normalization', 'Add Page +'].map((label) => (
              <div key={label} className="site00-fws-hub-page-grid__cell">
                <span>{label}</span>
              </div>
            ))}
          </div>
          <p className="site00-fws-hub-section-label">THE MARGINS</p>
          <div className="site00-fws-hub-margin-row">
            {['GIRL, LOOK AT THIS', 'NOPE. NOT NORMAL.'].map((label) => (
              <div key={label} className="site00-fws-hub-margin-row__cell">
                {label}
              </div>
            ))}
          </div>
          <p className="site00-fws-hub-section-label">BOOK IN MOTION</p>
          <div className="site00-fws-hub-motion">
            <span className="site00-fws-hub-motion__play">▶</span>
            <span>draft script overlay</span>
          </div>
        </TapeCard>

        <TapeCard
          title="EXPERIMENTS HUB · EXPERIMENT 01"
          href={experimentPath}
          className="site00-fws-hub-tape--experiment"
        >
          <span className="site00-fws-hub-status">IN PRODUCTION</span>
          <div className="site00-fws-hub-exp-grid">
            {EXPERIMENT_TILES.map((tile) => (
              <div key={tile} className="site00-fws-hub-exp-grid__cell">
                {tile}
              </div>
            ))}
          </div>
          <p className="site00-fws-hub-section-label">CURRENT DIRECTION · V2.3</p>
          <ul className="site00-fws-hub-ratings">
            {['Artistic Energy', 'Editorial Logic', 'Character Fit'].map((label) => (
              <li key={label}>
                <span>{label}</span>
                <span className="site00-fws-hub-dots">●●●●○</span>
              </li>
            ))}
          </ul>
          <Link to={experimentPath} className="site00-fws-hub-cta site00-fws-hub-cta--secondary">
            INSPECT EXPERIMENT →
          </Link>
        </TapeCard>
      </div>

      <div className="site00-fws-hub-board__bottom">
        <TapeCard title="CULTURAL INTELLIGENCE" href={site00ProjectCulturalIntelligencePath(projectSlug)}>
          <ul className="site00-fws-hub-signal-compact">
            {CI_SIGNALS.map((signal) => (
              <li key={signal.label}>
                <span>{signal.label}</span>
                <strong>{signal.score}</strong>
              </li>
            ))}
          </ul>
        </TapeCard>

        <TapeCard title="CHARACTER LAB" href={site00ProjectFounderCharacterDiscoveryPath(projectSlug)}>
          <div className="site00-fws-hub-character">
            <div className="site00-fws-hub-character__portrait" aria-hidden />
            <p className="site00-fws-hub-handwritten">
              Smart. Funny. Sees patterns. Doesn&apos;t perform. Explains like a friend talking to her best friend.
            </p>
          </div>
          <span className="site00-fws-hub-sticky">working draft v2.3</span>
        </TapeCard>

        <TapeCard title="PERFORMANCE + LEARNING" href={site00ProjectContentOperationsPerformancePath(projectSlug)}>
          <div className="site00-fws-hub-perf-grid">
            {PERFORMANCE_STATS.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </TapeCard>

        <TapeCard title="CONTENT OPS DESK" href={site00ProjectContentOperationsPath(projectSlug)}>
          <p className="site00-fws-hub-meta">Operating Mode · Assisted Autonomy</p>
          <ul className="site00-fws-hub-list site00-fws-hub-list--compact">
            <li>6 opportunities queued</li>
            <li>Current work · 4 packages</li>
            <li>This needs our eye · 2</li>
          </ul>
        </TapeCard>

        <TapeCard title="EXPERIMENT 01 REVIEW" href={experimentPath}>
          <ul className="site00-fws-hub-checklist">
            <li>Learnings captured</li>
            <li>Next moves staged</li>
            <li>Regenerate current round</li>
          </ul>
          <Link to={site00ProjectExperimentsPath(projectSlug)} className="site00-fws-hub-link">
            Experiments Hub →
          </Link>
        </TapeCard>
      </div>

      <footer className="site00-fws-hub-footer">
        <span>You guide. We build. One book in motion.</span>
        <span className="site00-fws-hub-footer__mark">00 · NDXBOOK</span>
      </footer>
    </div>
  );
}

export function OverviewMobileHomeScreen({ projectSlug }: Props) {
  return (
    <div className="site00-fws-mobile-overview" data-visual-reconstruction="mobile-overview">
      <div data-vr-region="ndx-overview-heading">
        <p className="site00-fws-mobile-overview__eyebrow">OVERVIEW</p>
        <h2 className="site00-fws-mobile-overview__headline">
          <span>CONTENT OPERATIONS</span>
          <span>PERFORMANCE LEARNING</span>
        </h2>
        <p className="site00-fws-mobile-overview__summary">
          Studio World builds with intelligence. You guide with judgment. Your voice is the final approval.
        </p>
        <div className="site00-fws-mobile-overview__today">
          <span className="site00-fws-mobile-overview__today-label">TODAY AT NDX</span>
          <span className="site00-fws-mobile-overview__today-date">May 24</span>
        </div>
      </div>

      <div className="site00-fws-hub-kpis site00-fws-hub-kpis--mobile" data-vr-region="ndx-metrics">
        <div>
          <strong>5</strong>
          <span>BEING MADE</span>
        </div>
        <div>
          <strong>2</strong>
          <span>NEED YOUR EYE</span>
        </div>
        <div>
          <strong>3</strong>
          <span>DEVELOPING</span>
        </div>
        <div className="site00-fws-hub-kpis__empty">
          <strong aria-hidden>&nbsp;</strong>
          <span>FROM AUDIENCE</span>
        </div>
      </div>

      <div className="site00-fws-mobile-section-head">
        <p className="site00-fws-hub-section-label">IN PRODUCTION</p>
        <Link to={site00ProjectContentOperationsCampaignBoardPath(projectSlug)} className="site00-fws-mobile-screen__see-all">
          View all (5)
        </Link>
      </div>
      <div className="site00-fws-hub-carousel site00-fws-hub-carousel--mobile-row" data-vr-region="ndx-production">
        {IN_PRODUCTION.map((item) => (
          <article
            key={item.title}
            className={`site00-fws-hub-carousel__card site00-fws-hub-carousel__card--mobile${item.tone === 'priority' ? ' site00-fws-hub-carousel__card--priority' : ''}`}
          >
            {item.tag ? <span className="site00-fws-hub-tag">{item.tag}</span> : null}
            <p className="site00-fws-hub-carousel__card-title">{item.title.toUpperCase()}</p>
            {item.subtitle ? <p className="site00-fws-hub-carousel__card-sub">{item.subtitle}</p> : null}
          </article>
        ))}
      </div>

      <div className="site00-fws-mobile-section-head">
        <p className="site00-fws-hub-section-label">ON NDX&apos;S RADAR</p>
        <Link to={site00ProjectCulturalIntelligencePath(projectSlug)} className="site00-fws-mobile-screen__see-all">
          View all (6)
        </Link>
      </div>
      <ul className="site00-fws-hub-list site00-fws-hub-list--radar" data-vr-region="ndx-radar">
        {RADAR_ITEMS.map((item, index) => (
          <li key={item}>
            <span className="site00-fws-hub-list__num">{String(index + 1).padStart(2, '0')}</span>
            <span className="site00-fws-hub-list__label">{item}</span>
            <span className="site00-fws-hub-list__arrow" aria-hidden>
              →
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
