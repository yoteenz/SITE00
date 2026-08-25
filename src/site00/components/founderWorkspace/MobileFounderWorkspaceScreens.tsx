/**
 * P0.VR.1D.A — Mobile founder workspace screen family (Image B authority).
 * Coded interactive layouts — independent from desktop, not responsive shrink.
 */

import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  site00ProjectBrandMarketingExpressionExperiment01Path,
  site00ProjectContentOperationsCampaignBoardPath,
  site00ProjectContentOperationsPath,
  site00ProjectContentOperationsPerformancePath,
  site00ProjectCulturalIntelligencePath,
  site00ProjectExperimentsPath,
  site00ProjectFilmProductionPath,
  site00ProjectFounderCharacterDiscoveryPath,
} from '../../config/routes';
import {
  NDX_CAMPAIGN_BOARD_DATE_RANGE,
  NDX_CAMPAIGN_BOARD_DAYS,
  NDX_CAMPAIGN_BOARD_WEEK,
  NDX_CAMPAIGN_MARGIN_CARDS,
  NDX_CAMPAIGN_MARGINS_PER_DAY,
  NDX_CAMPAIGN_MOTION,
  NDX_CAMPAIGN_MOTION_PER_DAY,
  NDX_CAMPAIGN_PAGE_CARDS,
  NDX_CAMPAIGN_PAGES_PER_DAY,
} from '../../config/ndxCampaignBoardMobileReference';
import {
  NDX_EXPERIMENT_01_CANONICAL_SUBJECT,
  NDX_EXPERIMENT_01_CARDS,
  NDX_EXPERIMENT_01_DIRECTION_VERSION,
  NDX_EXPERIMENT_01_METRICS,
  NDX_EXPERIMENT_01_RATINGS,
  NDX_EXPERIMENT_01_STATUS,
  NDX_EXPERIMENT_01_SUBJECT_COPY,
} from '../../config/ndxExperiment01MobileReference';
import { OverviewMobileHomeScreen } from './OverviewFounderWorkspaceBoard';
import { Experiment01UnderstandLayer } from './Experiment01OperateLayer';
import { useFounderWorkspaceInspector } from './FounderWorkspaceShell';
import { NDX_VR_REGION, vrRegionAttr } from '../../config/ndxVisualRegionIds';

type ScreenProps = {
  projectSlug: string;
};

const CAMPAIGN_DAYS = NDX_CAMPAIGN_BOARD_DAYS;

function CampaignSectionHead({
  label,
  count,
  countLabel,
  viewAllHref,
}: {
  label: string;
  count: number;
  countLabel: string;
  viewAllHref: string;
}) {
  return (
    <div className="site00-fws-mobile-campaign__section-head">
      <p className="site00-fws-mobile-campaign__section-title">
        <span>{label}</span>
        <span className="site00-fws-mobile-campaign__section-count">
          {count} / {countLabel}
        </span>
      </p>
      <Link to={viewAllHref} className="site00-fws-mobile-screen__see-all">
        VIEW ALL
      </Link>
    </div>
  );
}

export function MobileCampaignBoardScreen({ projectSlug }: ScreenProps) {
  const boardPath = site00ProjectContentOperationsCampaignBoardPath(projectSlug);
  const filmPath = site00ProjectFilmProductionPath(projectSlug);

  return (
    <div className="site00-fws-mobile-campaign" data-visual-reconstruction="mobile-campaign-board">
      <div className="site00-fws-mobile-campaign__title-block" {...vrRegionAttr(NDX_VR_REGION.campaignTitle)}>
        <p className="site00-fws-mobile-campaign__eyebrow">CAMPAIGN BOARD</p>
        <h2 className="site00-fws-mobile-campaign__week">{NDX_CAMPAIGN_BOARD_WEEK}</h2>
        <p className="site00-fws-mobile-campaign__date">{NDX_CAMPAIGN_BOARD_DATE_RANGE}</p>
      </div>

      <div
        className="site00-fws-mobile-campaign__day-grid"
        role="list"
        {...vrRegionAttr(NDX_VR_REGION.campaignDaySelector)}
      >
        {CAMPAIGN_DAYS.map((day) => (
          <button
            key={day.id}
            type="button"
            role="listitem"
            className={`site00-fws-mobile-campaign__day${day.active ? ' site00-fws-mobile-campaign__day--active' : ''}`}
            aria-pressed={day.active}
          >
            <span className="site00-fws-mobile-campaign__day-letter">{day.letter}</span>
            <span className="site00-fws-mobile-campaign__day-date">
              {day.month} {day.day}
            </span>
          </button>
        ))}
      </div>

      <CampaignSectionHead
        label="THE PAGES"
        count={NDX_CAMPAIGN_PAGES_PER_DAY}
        countLabel="DAY"
        viewAllHref={boardPath}
      />
      <div
        className="site00-fws-mobile-campaign__pages-lane"
        {...vrRegionAttr(NDX_VR_REGION.campaignPages)}
      >
        {NDX_CAMPAIGN_PAGE_CARDS.map((card, index) => (
          <article
            key={card.id}
            className={`site00-fws-mobile-campaign__page-card${index === 2 ? ' site00-fws-mobile-campaign__page-card--peek' : ''}`}
            {...vrRegionAttr(card.vrRegionId)}
          >
            <div
              className="site00-fws-mobile-campaign__page-art"
              style={{
                backgroundImage: `url(${card.artworkPath})`,
                backgroundPosition: card.artworkObjectPosition,
              }}
              role="img"
              aria-label={`${card.titleLines.join(' ')} artwork`}
            />
            <div className="site00-fws-mobile-campaign__page-body">
              {card.action === 'expand' ? (
                <span className="site00-fws-mobile-campaign__page-action site00-fws-mobile-campaign__page-action--expand" aria-hidden>
                  ↗
                </span>
              ) : null}
              {card.action === 'close' ? (
                <span className="site00-fws-mobile-campaign__page-action site00-fws-mobile-campaign__page-action--close" aria-hidden>
                  ×
                </span>
              ) : null}
              <p className="site00-fws-mobile-campaign__page-title">
                {card.titleLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
              {card.note ? (
                <p
                  className={`site00-fws-mobile-campaign__page-note site00-fws-mobile-campaign__page-note--${card.noteTone ?? 'ink'}`}
                >
                  {card.note}
                </p>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <CampaignSectionHead
        label="THE MARGINS"
        count={NDX_CAMPAIGN_MARGINS_PER_DAY}
        countLabel="DAY"
        viewAllHref={boardPath}
      />
      <div className="site00-fws-mobile-campaign__margins-row" {...vrRegionAttr(NDX_VR_REGION.campaignMargins)}>
        {NDX_CAMPAIGN_MARGIN_CARDS.map((card) => (
          <article
            key={card.id}
            className="site00-fws-mobile-campaign__margin-card"
            {...vrRegionAttr(card.vrRegionId)}
          >
            <div
              className="site00-fws-mobile-campaign__margin-art"
              style={{
                backgroundImage: `url(${card.artworkPath})`,
                backgroundPosition: card.artworkObjectPosition,
              }}
              role="img"
              aria-label={`${card.titleLines.join(' ')} margin artwork`}
            />
            <span className="site00-fws-mobile-campaign__margin-index">{card.index}</span>
            <p className="site00-fws-mobile-campaign__margin-title">
              {card.titleLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </p>
          </article>
        ))}
      </div>

      <CampaignSectionHead
        label="BOOK IN MOTION"
        count={NDX_CAMPAIGN_MOTION_PER_DAY}
        countLabel="DAY"
        viewAllHref={filmPath}
      />
      <article className="site00-fws-mobile-campaign__motion-card" {...vrRegionAttr(NDX_VR_REGION.campaignMotion)}>
        <div
          className="site00-fws-mobile-campaign__motion-art"
          style={{
            backgroundImage: `url(${NDX_CAMPAIGN_MOTION.artworkPath})`,
            backgroundPosition: NDX_CAMPAIGN_MOTION.artworkObjectPosition,
          }}
          role="img"
          aria-label="Book in motion editorial still"
        />
        <div className="site00-fws-mobile-campaign__motion-copy">
          <p className="site00-fws-mobile-campaign__motion-title">
            {NDX_CAMPAIGN_MOTION.titleLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
          <span className="site00-fws-mobile-campaign__motion-play" aria-hidden>
            ▶
          </span>
        </div>
        <span className="site00-fws-mobile-campaign__motion-duration">{NDX_CAMPAIGN_MOTION.duration}</span>
      </article>
    </div>
  );
}

const CI_SIGNALS = [
  { label: 'SUBSCRIPTION FATIGUE', score: '0.92' },
  { label: 'LOYALTY LANGUAGE DRIFT', score: '0.76' },
  { label: 'QUIET LUXURY SIGNAL', score: '0.71' },
  { label: 'CORPORATE MEMO LANGUAGE', score: '0.68' },
];

const CONTENT_OPS_TABS = ['SIGNALS', 'OPPORTUNITIES', 'CURRENT WORK', 'APPROVALS'] as const;

function MobileScreenFrame({
  eyebrow,
  title,
  children,
  screenId,
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
  screenId: string;
}) {
  return (
    <div className="site00-fws-mobile-screen" data-visual-reconstruction={`mobile-screen-${screenId}`}>
      <p className="site00-fws-mobile-screen__eyebrow">{eyebrow}</p>
      <h2 className="site00-fws-mobile-screen__title">{title}</h2>
      {children}
    </div>
  );
}

function LabRatingStars({ filled, total }: { filled: number; total: number }) {
  return (
    <span className="site00-fws-mobile-lab__stars" aria-label={`${filled} of ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`site00-fws-mobile-lab__star${i < filled ? ' site00-fws-mobile-lab__star--filled' : ''}`}
          aria-hidden
        />
      ))}
    </span>
  );
}

function InspectExperimentButton() {
  const { openInspector } = useFounderWorkspaceInspector();
  return (
    <button
      type="button"
      className="site00-fws-mobile-lab__inspect"
      {...vrRegionAttr(NDX_VR_REGION.labInspect)}
      onClick={() => openInspector('EXPERIMENT 01', <Experiment01UnderstandLayer />)}
    >
      INSPECT EXPERIMENT →
    </button>
  );
}

export function MobileExperiment01Screen({ projectSlug }: ScreenProps) {
  const experimentsHubPath = site00ProjectExperimentsPath(projectSlug);

  return (
    <div className="site00-fws-mobile-lab" data-visual-reconstruction="mobile-lab-experiment-01">
      <nav className="site00-fws-mobile-lab__breadcrumb" aria-label="Experiment breadcrumb" {...vrRegionAttr(NDX_VR_REGION.labBreadcrumb)}>
        <Link to={experimentsHubPath}>EXPERIMENTS HUB</Link>
        <span className="site00-fws-mobile-lab__breadcrumb-sep" aria-hidden>
          ›
        </span>
        <span className="site00-fws-mobile-lab__breadcrumb-active">EXPERIMENT 01</span>
      </nav>

      <div className="site00-fws-mobile-lab__title-row" {...vrRegionAttr(NDX_VR_REGION.labTitle)}>
        <h2 className="site00-fws-mobile-lab__title">EXPERIMENT 01</h2>
        <span className="site00-fws-mobile-lab__status">{NDX_EXPERIMENT_01_STATUS}</span>
      </div>

      <div className="site00-fws-mobile-lab__subject" {...vrRegionAttr(NDX_VR_REGION.labSubject)}>
        <h3 className="site00-fws-mobile-lab__subject-heading">{NDX_EXPERIMENT_01_CANONICAL_SUBJECT}</h3>
        <p className="site00-fws-mobile-lab__subject-copy">{NDX_EXPERIMENT_01_SUBJECT_COPY}</p>
      </div>

      <div className="site00-fws-mobile-lab__metrics" {...vrRegionAttr(NDX_VR_REGION.labMetrics)}>
        <div className="site00-fws-mobile-lab__metric">
          <span className="site00-fws-mobile-lab__metric-label">{NDX_EXPERIMENT_01_METRICS.round.label}</span>
          <span className="site00-fws-mobile-lab__metric-value">{NDX_EXPERIMENT_01_METRICS.round.value}</span>
        </div>
        <div className="site00-fws-mobile-lab__metric">
          <span className="site00-fws-mobile-lab__metric-label">{NDX_EXPERIMENT_01_METRICS.slide.label}</span>
          <span className="site00-fws-mobile-lab__metric-value">{NDX_EXPERIMENT_01_METRICS.slide.value}</span>
        </div>
        <div className="site00-fws-mobile-lab__metric">
          <span className="site00-fws-mobile-lab__metric-label">{NDX_EXPERIMENT_01_METRICS.locked.label}</span>
          <span className="site00-fws-mobile-lab__metric-value">{NDX_EXPERIMENT_01_METRICS.locked.value}</span>
        </div>
      </div>

      <div className="site00-fws-mobile-lab__grid" {...vrRegionAttr(NDX_VR_REGION.labGrid)}>
        {NDX_EXPERIMENT_01_CARDS.map((card) => (
          <article
            key={card.id}
            className={`site00-fws-mobile-lab__grid-cell${card.selected ? ' site00-fws-mobile-lab__grid-cell--selected' : ''}`}
            {...vrRegionAttr(card.vrRegionId)}
          >
            {card.showClose ? (
              <button type="button" className="site00-fws-mobile-lab__grid-close" aria-label="Close card">
                ×
              </button>
            ) : null}
            <div
              className="site00-fws-mobile-lab__grid-art"
              style={{
                backgroundImage: `url(${card.artworkPath})`,
                backgroundPosition: card.artworkObjectPosition,
              }}
              role="img"
              aria-hidden
            />
            <div className="site00-fws-mobile-lab__grid-copy">
              {card.titleLines.map((line) => (
                <span key={line} className="site00-fws-mobile-lab__grid-line">
                  {line}
                </span>
              ))}
              {card.accentLine && card.accentTone === 'underline-lime' ? (
                <span className="site00-fws-mobile-lab__grid-accent site00-fws-mobile-lab__grid-accent--underline">
                  {card.accentLine}
                </span>
              ) : null}
              {card.accentLine && card.accentTone === 'lime' ? (
                <span className="site00-fws-mobile-lab__grid-accent site00-fws-mobile-lab__grid-accent--lime">
                  {card.accentLine}
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>

      <section className="site00-fws-mobile-lab__direction" {...vrRegionAttr(NDX_VR_REGION.labDirection)}>
        <h4 className="site00-fws-mobile-lab__direction-heading">
          CURRENT DIRECTION — {NDX_EXPERIMENT_01_DIRECTION_VERSION}
        </h4>
        <ul className="site00-fws-mobile-lab__ratings">
          {NDX_EXPERIMENT_01_RATINGS.map((row) => (
            <li key={row.id}>
              <span>{row.label}</span>
              <LabRatingStars filled={row.filled} total={row.total} />
            </li>
          ))}
        </ul>
        <InspectExperimentButton />
      </section>
    </div>
  );
}

export function MobileContentOpsScreen({ projectSlug }: ScreenProps) {
  return (
    <MobileScreenFrame eyebrow="CONTENT OPS DESK" title="TODAY AT NDX" screenId="content-ops">
      <div className="site00-fws-mobile-content-ops" {...vrRegionAttr(NDX_VR_REGION.contentOpsDesk)}>
      <div className="site00-fws-mobile-tabs" role="tablist">
        {CONTENT_OPS_TABS.map((tab, index) => (
          <span
            key={tab}
            role="tab"
            aria-selected={index === 2}
            className={`site00-fws-mobile-tabs__item${index === 2 ? ' site00-fws-mobile-tabs__item--active' : ''}`}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="site00-fws-mobile-section-head">
        <p className="site00-fws-hub-section-label">REVIEW NEEDED</p>
        <Link to={site00ProjectContentOperationsPath(projectSlug)} className="site00-fws-mobile-screen__see-all">
          See all (6)
        </Link>
      </div>
      <div className="site00-fws-mobile-scroll-row">
        {['Layoff Memo', 'Subscription Norm', 'Loyalty Drift', 'Quiet Luxury'].map((label) => (
          <div key={label} className="site00-fws-mobile-review-card">
            <span>{label}</span>
            <span className="site00-fws-mobile-review-card__chip">HIGH</span>
          </div>
        ))}
      </div>
      <p className="site00-fws-hub-section-label">OPERATING MODE</p>
      <div className="site00-fws-mobile-info-card">Assisted Autonomy · In Production</div>
      <p className="site00-fws-hub-section-label">OPPORTUNITIES (6)</p>
      <ul className="site00-fws-hub-list site00-fws-hub-list--compact">
        <li>Corporate Layoff Memo Language</li>
        <li>Subscription Fatigue Pattern</li>
        <li>Quiet Luxury Signal</li>
      </ul>
      <p className="site00-fws-hub-section-label">THIS NEEDS OUR EYE</p>
      <ul className="site00-fws-mobile-priority-list">
        <li>
          <span>Subscription Normalization</span>
          <span className="site00-fws-mobile-review-card__chip">HIGH</span>
        </li>
        <li>
          <span>Corporate Layoff Memo</span>
          <span className="site00-fws-mobile-review-card__chip site00-fws-mobile-review-card__chip--medium">MED</span>
        </li>
      </ul>
      </div>
    </MobileScreenFrame>
  );
}

export function MobileCulturalIntelligenceScreen({ projectSlug }: ScreenProps) {
  return (
    <MobileScreenFrame eyebrow="CULTURAL INTELLIGENCE" title="LIVE SIGNALS" screenId="cultural-intelligence">
      <div className="site00-fws-mobile-tabs" role="tablist">
        {['LIVE SIGNALS', 'WEEKLY FORECAST', 'ARCHIVE'].map((tab, index) => (
          <span
            key={tab}
            role="tab"
            aria-selected={index === 0}
            className={`site00-fws-mobile-tabs__item${index === 0 ? ' site00-fws-mobile-tabs__item--active' : ''}`}
          >
            {tab}
          </span>
        ))}
      </div>
      <p className="site00-fws-hub-section-label">TOP LIVE SIGNALS</p>
      <ul className="site00-fws-mobile-signal-list">
        {CI_SIGNALS.map((signal) => (
          <li key={signal.label}>
            <span>{signal.label}</span>
            <strong>{signal.score}</strong>
          </li>
        ))}
      </ul>
      <p className="site00-fws-hub-section-label">INTELLIGENCE RADAR</p>
      <div className="site00-fws-mobile-radar" aria-hidden {...vrRegionAttr(NDX_VR_REGION.culturalIntelligenceRadar)}>
        <div className="site00-fws-mobile-radar__hex" />
        <span className="site00-fws-mobile-radar__label site00-fws-mobile-radar__label--business">Business</span>
        <span className="site00-fws-mobile-radar__label site00-fws-mobile-radar__label--tech">Technology</span>
        <span className="site00-fws-mobile-radar__label site00-fws-mobile-radar__label--money">Money</span>
      </div>
      <Link to={site00ProjectCulturalIntelligencePath(projectSlug)} className="site00-fws-mobile-screen__link">
        OPEN FULL INTELLIGENCE DESK →
      </Link>
    </MobileScreenFrame>
  );
}

export function MobileCharacterLabScreen({ projectSlug }: ScreenProps) {
  const stats = [
    { label: 'CONTEXT TILES', value: '128K', delta: '↑ 12%' },
    { label: 'STORIES', value: '8.7K', delta: '↑ 8%' },
    { label: 'REBELS', value: '3.2K', delta: '↑ 5%' },
    { label: 'PROFILE VIEWS', value: '+1.1K', delta: '↑ 14%' },
  ];
  return (
    <MobileScreenFrame eyebrow="CHARACTER LAB" title="LANGUAGE · VOICE · CASTING" screenId="character-lab">
      <div className="site00-fws-mobile-tabs" role="tablist">
        {['LANGUAGE LAB', 'VOICE LAB', 'CASTING'].map((tab, index) => (
          <span
            key={tab}
            role="tab"
            aria-selected={index === 0}
            className={`site00-fws-mobile-tabs__item${index === 0 ? ' site00-fws-mobile-tabs__item--active' : ''}`}
          >
            {tab}
          </span>
        ))}
      </div>
      <div className="site00-fws-mobile-character" {...vrRegionAttr(NDX_VR_REGION.characterProfile)}>
        <div className="site00-fws-mobile-character__portrait" aria-hidden />
        <p className="site00-fws-hub-handwritten site00-fws-hub-handwritten--mobile">
          Smart. Funny. Sees patterns. Doesn&apos;t perform. Explains like a friend talking to her best friend.
        </p>
      </div>
      <span className="site00-fws-hub-sticky site00-fws-hub-sticky--mobile">working draft v2.3</span>
      <p className="site00-fws-hub-section-label">WHO SHE IS</p>
      <ul className="site00-fws-hub-list site00-fws-hub-list--compact">
        <li>Search. Frame. Sees patterns.</li>
        <li>Doesn&apos;t perform — explains.</li>
        <li>Like a friend talking to her best friend.</li>
      </ul>
      <p className="site00-fws-hub-section-label">PERFORMANCE SUMMARY</p>
      <div className="site00-fws-mobile-perf-grid">
        {stats.map((stat) => (
          <div key={stat.label}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
            <em>{stat.delta}</em>
          </div>
        ))}
      </div>
      <Link to={site00ProjectFounderCharacterDiscoveryPath(projectSlug)} className="site00-fws-mobile-screen__link">
        OPEN CHARACTER LAB →
      </Link>
      <Link to={site00ProjectContentOperationsPerformancePath(projectSlug)} className="site00-fws-mobile-screen__link">
        PERFORMANCE + LEARNING →
      </Link>
    </MobileScreenFrame>
  );
}

export function MobileExperimentsHubScreen({ projectSlug }: ScreenProps) {
  return (
    <MobileScreenFrame eyebrow="EXPERIMENTS HUB" title="VALIDATION + EXPRESSION" screenId="experiments-hub">
      <p className="site00-fws-mobile-overview__summary">
        Intake, experiments A–G, expression, visual development, and content library.
      </p>
      <Link to={site00ProjectBrandMarketingExpressionExperiment01Path(projectSlug)} className="site00-fws-hub-cta">
        EXPERIMENT 01 →
      </Link>
      <Link to={site00ProjectExperimentsPath(projectSlug)} className="site00-fws-mobile-screen__link">
        OPEN EXPERIMENTS HUB →
      </Link>
    </MobileScreenFrame>
  );
}

export function MobilePerformanceScreen({ projectSlug }: ScreenProps) {
  return (
    <MobileScreenFrame eyebrow="PERFORMANCE + LEARNING" title="WHAT HIT · WHAT WE LEARNED" screenId="performance">
      <div className="site00-fws-mobile-perf-grid site00-fws-mobile-perf-grid--hero">
        <div>
          <strong>128K</strong>
          <span>CONTEXT TILES</span>
        </div>
        <div>
          <strong>8.7K</strong>
          <span>STORIES</span>
        </div>
        <div>
          <strong>3.2K</strong>
          <span>REBELS</span>
        </div>
        <div>
          <strong>+1.1K</strong>
          <span>PROFILE VIEWS</span>
        </div>
      </div>
      <Link to={site00ProjectContentOperationsPerformancePath(projectSlug)} className="site00-fws-mobile-screen__link">
        OPEN PERFORMANCE DESK →
      </Link>
    </MobileScreenFrame>
  );
}

export function renderMobileFounderWorkspaceScreen(screenId: string, projectSlug: string): ReactNode {
  switch (screenId) {
    case 'overview':
      return <OverviewMobileHomeScreen projectSlug={projectSlug} />;
    case 'campaign-board':
      return <MobileCampaignBoardScreen projectSlug={projectSlug} />;
    case 'experiment-01':
      return <MobileExperiment01Screen projectSlug={projectSlug} />;
    case 'content-ops':
      return <MobileContentOpsScreen projectSlug={projectSlug} />;
    case 'cultural-intelligence':
      return <MobileCulturalIntelligenceScreen projectSlug={projectSlug} />;
    case 'character-lab':
      return <MobileCharacterLabScreen projectSlug={projectSlug} />;
    case 'experiments-hub':
      return <MobileExperimentsHubScreen projectSlug={projectSlug} />;
    case 'performance':
      return <MobilePerformanceScreen projectSlug={projectSlug} />;
    default:
      return <OverviewMobileHomeScreen projectSlug={projectSlug} />;
  }
}
