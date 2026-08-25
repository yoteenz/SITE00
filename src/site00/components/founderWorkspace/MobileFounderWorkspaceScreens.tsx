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
  site00ProjectFounderCharacterDiscoveryPath,
} from '../../config/routes';
import { OverviewMobileHomeScreen } from './OverviewFounderWorkspaceBoard';

type ScreenProps = {
  projectSlug: string;
};

const CAMPAIGN_DAYS = ['M 25', 'T 26', 'W 27', 'T 28', 'F 29', 'S 30', 'S 31'];

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

export function MobileCampaignBoardScreen({ projectSlug }: ScreenProps) {
  return (
    <MobileScreenFrame eyebrow="CAMPAIGN BOARD" title="WEEK 01 · MAY 24 – MAY 30" screenId="campaign-board">
      <div className="site00-fws-mobile-days">
        {CAMPAIGN_DAYS.map((day, index) => (
          <span
            key={day}
            className={`site00-fws-mobile-days__chip${index === 0 ? ' site00-fws-mobile-days__chip--active' : ''}`}
          >
            {day}
          </span>
        ))}
      </div>
      <p className="site00-fws-hub-section-label">THE PAGES (3/DAY)</p>
      <div className="site00-fws-mobile-scroll-row">
        {['Corporate Layoff Memo', 'Subscription Normalization', 'Add Page +'].map((label) => (
          <div key={label} className="site00-fws-mobile-page-card">
            <span>{label}</span>
          </div>
        ))}
      </div>
      <p className="site00-fws-hub-section-label">THE MARGINS (4/DAY)</p>
      <div className="site00-fws-mobile-margin-grid">
        {['GIRL, LOOK AT THIS', 'NOPE. NOT NORMAL.', 'NOT THAT DEEP', 'SAVE THIS'].map((label) => (
          <div key={label} className="site00-fws-mobile-margin-card">
            {label}
          </div>
        ))}
      </div>
      <p className="site00-fws-hub-section-label">BOOK IN MOTION (1/DAY)</p>
      <div className="site00-fws-mobile-motion-card">
        <span className="site00-fws-hub-motion__play">▶</span>
        <span>draft script overlay</span>
      </div>
      <Link to={site00ProjectContentOperationsCampaignBoardPath(projectSlug)} className="site00-fws-mobile-screen__link">
        OPEN FULL CAMPAIGN DESK →
      </Link>
    </MobileScreenFrame>
  );
}

export function MobileExperiment01Screen({ projectSlug }: ScreenProps) {
  const experimentPath = site00ProjectBrandMarketingExpressionExperiment01Path(projectSlug);
  return (
    <MobileScreenFrame eyebrow="EXPERIMENTS HUB › EXPERIMENT 01" title="EXPERIMENT 01" screenId="experiment-01">
      <span className="site00-fws-hub-status">IN PRODUCTION</span>
      <div className="site00-fws-mobile-status-row">
        <span>ROUND 01: CONTRACTS READY</span>
        <span>SLIDE 01: 8/9 COMPLETE</span>
        <span>LOCKED: 0/9</span>
      </div>
      <div className="site00-fws-mobile-exp-grid">
        {EXPERIMENT_TILES.map((tile) => (
          <div key={tile} className="site00-fws-mobile-exp-grid__cell">
            {tile}
          </div>
        ))}
      </div>
      <p className="site00-fws-hub-section-label">CURRENT DIRECTION · V2.3</p>
      <ul className="site00-fws-hub-ratings site00-fws-hub-ratings--mobile">
        {['ARTISTIC ENERGY', 'EDITORIAL LOGIC', 'CHARACTER FIT', 'VISUAL FEASIBILITY'].map((label) => (
          <li key={label}>
            <span>{label}</span>
            <span className="site00-fws-hub-dots">●●●●○</span>
          </li>
        ))}
      </ul>
      <Link to={experimentPath} className="site00-fws-hub-cta">
        INSPECT EXPERIMENT →
      </Link>
    </MobileScreenFrame>
  );
}

export function MobileContentOpsScreen({ projectSlug }: ScreenProps) {
  return (
    <MobileScreenFrame eyebrow="CONTENT OPS DESK" title="TODAY AT NDX" screenId="content-ops">
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
      <div className="site00-fws-mobile-radar" aria-hidden>
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
      <div className="site00-fws-mobile-character">
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
