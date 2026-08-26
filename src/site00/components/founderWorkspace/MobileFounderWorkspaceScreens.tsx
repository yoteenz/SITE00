/**
 * P0.VR.1D.A — Mobile founder workspace screen family (Image B authority).
 * Coded interactive layouts — independent from desktop, not responsive shrink.
 */

import { Link } from 'react-router-dom';
import { useState, type ReactNode } from 'react';
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
  NDX_CHARACTER_LAB_DEFAULT_TAB,
  NDX_CHARACTER_LAB_LANGUAGE_NOTE_EMPHASIS,
  NDX_CHARACTER_LAB_LANGUAGE_NOTE_LINES,
  NDX_CHARACTER_LAB_LANGUAGE_NOTE_SURFACE_PATH,
  NDX_CHARACTER_LAB_PERFORMANCE,
  NDX_CHARACTER_LAB_PERFORMANCE_PERIOD,
  NDX_CHARACTER_LAB_PORTRAIT_OBJECT_POSITION,
  NDX_CHARACTER_LAB_PORTRAIT_PATH,
  NDX_CHARACTER_LAB_QUOTE_LINES,
  NDX_CHARACTER_LAB_STICKY_NOTE_LINES,
  NDX_CHARACTER_LAB_STICKY_NOTE_SURFACE_PATH,
  NDX_CHARACTER_LAB_TABS,
  NDX_CHARACTER_LAB_TITLE,
  NDX_CHARACTER_LAB_WHO_SHE_IS,
  type NdxCharacterLabTab,
} from '../../config/ndxCharacterLabMobileReference';
import {
  NDX_CI_ACTIVE_TAB,
  NDX_CI_RADAR_LABELS,
  NDX_CI_TABS,
  NDX_CI_TOP_SIGNALS,
} from '../../config/ndxCulturalIntelligenceMobileReference';
import {
  NDX_CONTENT_OPS_ACTIVE_TAB,
  NDX_CONTENT_OPS_CURRENT_WORK,
  NDX_CONTENT_OPS_NEEDS_EYE,
  NDX_CONTENT_OPS_OPERATING_MODE,
  NDX_CONTENT_OPS_OPPORTUNITIES,
  NDX_CONTENT_OPS_REVIEW_NEEDED,
  NDX_CONTENT_OPS_TABS,
  NDX_CONTENT_OPS_TODAY_ACTION,
} from '../../config/ndxContentOpsMobileReference';
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
  const [activeDayId, setActiveDayId] = useState(
    () => NDX_CAMPAIGN_BOARD_DAYS.find((d) => d.active)?.id ?? NDX_CAMPAIGN_BOARD_DAYS[0]?.id,
  );

  return (
    <div
      className="site00-fws-mobile-campaign site00-fws-mobile-content-shell"
      data-visual-reconstruction="mobile-campaign-board"
      {...vrRegionAttr(NDX_VR_REGION.campaignContentShell)}
    >
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
            className={`site00-fws-mobile-campaign__day${day.id === activeDayId ? ' site00-fws-mobile-campaign__day--active' : ''}`}
            aria-pressed={day.id === activeDayId}
            onClick={() => setActiveDayId(day.id)}
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

const CONTENT_OPS_TABS = NDX_CONTENT_OPS_TABS;

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
  const [selectedCardId, setSelectedCardId] = useState(
    () => NDX_EXPERIMENT_01_CARDS.find((c) => c.selected)?.id ?? NDX_EXPERIMENT_01_CARDS[0]?.id,
  );

  return (
    <div
      className="site00-fws-mobile-lab site00-fws-mobile-content-shell"
      data-visual-reconstruction="mobile-lab-experiment-01"
      {...vrRegionAttr(NDX_VR_REGION.labContentShell)}
    >
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
            className={`site00-fws-mobile-lab__grid-cell${card.id === selectedCardId ? ' site00-fws-mobile-lab__grid-cell--selected' : ''}`}
            {...vrRegionAttr(card.vrRegionId)}
            role="button"
            tabIndex={0}
            onClick={() => setSelectedCardId(card.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedCardId(card.id);
              }
            }}
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
  const opsPath = site00ProjectContentOperationsPath(projectSlug);

  return (
    <div
      className="site00-fws-mobile-shell-screen site00-fws-mobile-shell-screen--content-ops"
      data-visual-reconstruction="mobile-content-ops"
      {...vrRegionAttr(NDX_VR_REGION.contentOpsScreen)}
    >
      <div className="site00-fws-mobile-shell-screen__content" {...vrRegionAttr(NDX_VR_REGION.contentOpsContentShell)}>
        <div className="site00-fws-mobile-content-ops__head">
          <p className="site00-fws-mobile-content-ops__eyebrow">CONTENT OPS DESK</p>
          <h2 className="site00-fws-mobile-content-ops__title">TODAY AT NDX</h2>
        </div>

        <div className="site00-fws-mobile-tabs site00-fws-mobile-tabs--content-ops" role="tablist">
          {CONTENT_OPS_TABS.map((tab) => (
            <span
              key={tab}
              role="tab"
              aria-selected={tab === NDX_CONTENT_OPS_ACTIVE_TAB}
              className={`site00-fws-mobile-tabs__item${tab === NDX_CONTENT_OPS_ACTIVE_TAB ? ' site00-fws-mobile-tabs__item--active' : ''}`}
            >
              {tab}
            </span>
          ))}
        </div>

        <div className="site00-fws-mobile-section-head">
          <p className="site00-fws-hub-section-label">REVIEW NEEDED</p>
          <Link to={opsPath} className="site00-fws-mobile-screen__see-all">
            See all ({NDX_CONTENT_OPS_REVIEW_NEEDED.length})
          </Link>
        </div>
        <div className="site00-fws-mobile-scroll-row">
          {NDX_CONTENT_OPS_REVIEW_NEEDED.map((item) => (
            <div key={item.label} className="site00-fws-mobile-review-card">
              <span>{item.label}</span>
              <span
                className={`site00-fws-mobile-review-card__chip${item.priority === 'MED' ? ' site00-fws-mobile-review-card__chip--medium' : ''}`}
              >
                {item.priority}
              </span>
            </div>
          ))}
        </div>

        <div className="site00-fws-mobile-content-ops__split">
          <div className="site00-fws-mobile-content-ops__col" {...vrRegionAttr(NDX_VR_REGION.contentOpsOperatingMode)}>
            <p className="site00-fws-hub-section-label">{NDX_CONTENT_OPS_OPERATING_MODE.label}</p>
            <div className="site00-fws-mobile-info-card">{NDX_CONTENT_OPS_OPERATING_MODE.value}</div>
            <span className="site00-fws-mobile-content-ops__chip">{NDX_CONTENT_OPS_OPERATING_MODE.chip}</span>
          </div>
          <div className="site00-fws-mobile-content-ops__col" {...vrRegionAttr(NDX_VR_REGION.contentOpsOpportunities)}>
            <p className="site00-fws-hub-section-label">OPPORTUNITIES ({NDX_CONTENT_OPS_OPPORTUNITIES.length})</p>
            <ul className="site00-fws-mobile-content-ops__score-list">
              {NDX_CONTENT_OPS_OPPORTUNITIES.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.score}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="site00-fws-mobile-content-ops__today">
          <p className="site00-fws-hub-section-label">TODAY / THIS WEEK</p>
          <button type="button" className="site00-fws-mobile-content-ops__approve">
            {NDX_CONTENT_OPS_TODAY_ACTION}
          </button>
        </div>

        <p className="site00-fws-hub-section-label">CURRENT WORK</p>
        <div className="site00-fws-mobile-scroll-row" {...vrRegionAttr(NDX_VR_REGION.contentOpsCurrentWork)}>
          {NDX_CONTENT_OPS_CURRENT_WORK.map((label) => (
            <div key={label} className="site00-fws-mobile-content-ops__work-card">
              {label}
            </div>
          ))}
        </div>

        <p className="site00-fws-hub-section-label">THIS NEEDS OUR EYE</p>
        <ul className="site00-fws-mobile-priority-list" {...vrRegionAttr(NDX_VR_REGION.contentOpsNeedsEye)}>
          {NDX_CONTENT_OPS_NEEDS_EYE.map((item) => (
            <li key={item.label}>
              <span>{item.label}</span>
              <span
                className={`site00-fws-mobile-review-card__chip${item.priority === 'MED' ? ' site00-fws-mobile-review-card__chip--medium' : ''}`}
              >
                {item.priority}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function MobileCulturalIntelligenceScreen({ projectSlug }: ScreenProps) {
  const ciPath = site00ProjectCulturalIntelligencePath(projectSlug);

  return (
    <div
      className="site00-fws-mobile-shell-screen site00-fws-mobile-shell-screen--cultural-intelligence"
      data-visual-reconstruction="mobile-cultural-intelligence"
      {...vrRegionAttr(NDX_VR_REGION.intelligenceScreen)}
    >
      <div className="site00-fws-mobile-shell-screen__content" {...vrRegionAttr(NDX_VR_REGION.intelligenceContentShell)}>
        <div className="site00-fws-mobile-intelligence__head">
          <p className="site00-fws-mobile-intelligence__eyebrow">CULTURAL INTELLIGENCE</p>
          <h2 className="site00-fws-mobile-intelligence__title">LIVE SIGNALS</h2>
        </div>

        <div className="site00-fws-mobile-tabs site00-fws-mobile-tabs--intelligence" role="tablist">
          {NDX_CI_TABS.map((tab) => (
            <span
              key={tab}
              role="tab"
              aria-selected={tab === NDX_CI_ACTIVE_TAB}
              className={`site00-fws-mobile-tabs__item${tab === NDX_CI_ACTIVE_TAB ? ' site00-fws-mobile-tabs__item--active' : ''}`}
            >
              {tab}
            </span>
          ))}
        </div>

        <p className="site00-fws-hub-section-label">TOP LIVE SIGNALS</p>
        <ul className="site00-fws-mobile-signal-list site00-fws-mobile-signal-list--full" {...vrRegionAttr(NDX_VR_REGION.intelligenceSignals)}>
          {NDX_CI_TOP_SIGNALS.map((signal) => (
            <li key={signal.label}>
              <span>{signal.label}</span>
              <strong>{signal.score}</strong>
            </li>
          ))}
        </ul>

        <p className="site00-fws-hub-section-label">INTELLIGENCE RADAR</p>
        <div className="site00-fws-mobile-radar site00-fws-mobile-radar--full" aria-hidden {...vrRegionAttr(NDX_VR_REGION.intelligenceRadar)}>
          <div className="site00-fws-mobile-radar__hex" />
          {NDX_CI_RADAR_LABELS.map((label) => (
            <span key={label} className="site00-fws-mobile-radar__label site00-fws-mobile-radar__label--auto">
              {label}
            </span>
          ))}
        </div>

        <Link to={ciPath} className="site00-fws-mobile-screen__link">
          OPEN FULL INTELLIGENCE DESK →
        </Link>
      </div>
    </div>
  );
}

export function MobileCharacterLabScreen({ projectSlug }: ScreenProps) {
  const labPath = site00ProjectFounderCharacterDiscoveryPath(projectSlug);
  const [activeTab, setActiveTab] = useState<NdxCharacterLabTab>(NDX_CHARACTER_LAB_DEFAULT_TAB);

  return (
    <div
      className="site00-fws-mobile-shell-screen site00-fws-mobile-shell-screen--character-lab"
      data-visual-reconstruction="mobile-character-lab"
      {...vrRegionAttr(NDX_VR_REGION.characterScreen)}
    >
      <div className="site00-fws-mobile-shell-screen__content" {...vrRegionAttr(NDX_VR_REGION.characterContentShell)}>
        <div className="site00-fws-mobile-character-lab__head">
          <h2 className="site00-fws-mobile-character-lab__title">{NDX_CHARACTER_LAB_TITLE}</h2>
        </div>

        <div
          className="site00-fws-mobile-tabs site00-fws-mobile-tabs--character-lab"
          role="tablist"
          {...vrRegionAttr(NDX_VR_REGION.characterTabs)}
        >
          {NDX_CHARACTER_LAB_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={tab === activeTab}
              className={`site00-fws-mobile-tabs__item site00-fws-mobile-tabs__item--character${tab === activeTab ? ' site00-fws-mobile-tabs__item--active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="site00-fws-mobile-character-lab__hero" {...vrRegionAttr(NDX_VR_REGION.characterHero)}>
          <div
            className="site00-fws-mobile-character-lab__portrait"
            style={{
              backgroundImage: `url(${NDX_CHARACTER_LAB_PORTRAIT_PATH})`,
              backgroundPosition: NDX_CHARACTER_LAB_PORTRAIT_OBJECT_POSITION,
            }}
            role="img"
            aria-label="NDX canonical character portrait"
            {...vrRegionAttr(NDX_VR_REGION.characterPortrait)}
          />
          <article
            className="site00-fws-mobile-character-lab__language-note"
            {...vrRegionAttr(NDX_VR_REGION.characterLanguageNote)}
          >
            <div
              className="site00-fws-mobile-character-lab__language-note-surface"
              style={{ backgroundImage: `url(${NDX_CHARACTER_LAB_LANGUAGE_NOTE_SURFACE_PATH})` }}
              aria-hidden
            />
            <div className="site00-fws-mobile-character-lab__language-note-copy">
              {NDX_CHARACTER_LAB_LANGUAGE_NOTE_LINES.map((line) => (
                <span key={line}>{line}</span>
              ))}
              <span className="site00-fws-mobile-character-lab__language-note-emphasis">
                {NDX_CHARACTER_LAB_LANGUAGE_NOTE_EMPHASIS}
              </span>
            </div>
          </article>
        </div>

        <div className="site00-fws-mobile-character-lab__identity-row" {...vrRegionAttr(NDX_VR_REGION.characterIdentity)}>
          <div className="site00-fws-mobile-character-lab__identity-copy">
            <p className="site00-fws-mobile-character-lab__section-label">WHO SHE IS</p>
            <ul className="site00-fws-mobile-character-lab__traits">
              {NDX_CHARACTER_LAB_WHO_SHE_IS.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <figure
            className="site00-fws-mobile-character-lab__sticky-note"
            {...vrRegionAttr(NDX_VR_REGION.characterStickyNote)}
          >
            <div
              className="site00-fws-mobile-character-lab__sticky-note-surface"
              style={{ backgroundImage: `url(${NDX_CHARACTER_LAB_STICKY_NOTE_SURFACE_PATH})` }}
              aria-hidden
            />
            <span className="site00-fws-mobile-character-lab__sticky-tape" aria-hidden />
            <figcaption className="site00-fws-mobile-character-lab__sticky-copy">
              {NDX_CHARACTER_LAB_STICKY_NOTE_LINES.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </figcaption>
          </figure>
        </div>

        <blockquote className="site00-fws-mobile-character-lab__quote" {...vrRegionAttr(NDX_VR_REGION.characterQuote)}>
          <span className="site00-fws-mobile-character-lab__quote-mark" aria-hidden>
            &ldquo;
          </span>
          <p>
            {NDX_CHARACTER_LAB_QUOTE_LINES.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </p>
        </blockquote>

        <section className="site00-fws-mobile-character-lab__performance" {...vrRegionAttr(NDX_VR_REGION.characterPerformance)}>
          <div className="site00-fws-mobile-character-lab__performance-head">
            <h3 className="site00-fws-mobile-character-lab__section-label">PERFORMANCE SUMMARY</h3>
            <Link to={site00ProjectContentOperationsPerformancePath(projectSlug)} className="site00-fws-mobile-character-lab__period">
              {NDX_CHARACTER_LAB_PERFORMANCE_PERIOD} →
            </Link>
          </div>
          <div className="site00-fws-mobile-character-lab__perf-grid">
            {NDX_CHARACTER_LAB_PERFORMANCE.map((stat) => (
              <article key={stat.id} className="site00-fws-mobile-character-lab__perf-card" {...vrRegionAttr(stat.vrRegionId)}>
                <span className="site00-fws-mobile-character-lab__perf-label">{stat.label}</span>
                <strong className="site00-fws-mobile-character-lab__perf-value">{stat.value}</strong>
                <em className="site00-fws-mobile-character-lab__perf-delta">{stat.delta}</em>
              </article>
            ))}
          </div>
        </section>

        <Link to={labPath} className="site00-fws-mobile-screen__link site00-fws-mobile-screen__link--sr-only-focus">
          OPEN FULL CHARACTER LAB →
        </Link>
      </div>
    </div>
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
