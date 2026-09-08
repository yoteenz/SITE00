/**
 * B5.9R3 — NDXBOOK Evolve founder workspace (desktop hub + mobile screens inside POS shell).
 */

import { Link } from 'react-router-dom';
import {
  site00ProjectCampaignBoardEntryPath,
  site00ProjectContentOperationsCampaignBoardPath,
  site00ProjectContentOperationsPath,
  site00ProjectContentOperationsPerformancePath,
  site00ProjectExpressionEngineCampaignPath,
  site00ProjectExperimentsPath,
  site00ProjectLabPath,
} from '../../config/routes';
import { useProjectOperatingState } from '../../hooks/useProjectOperatingState';
import { useSite00OriginWideViewport } from '../shell/useSite00OriginWideViewport';
import { renderMobileFounderWorkspaceScreen } from './MobileFounderWorkspaceScreens';
import { entryProductionArtwork } from '../../utils/entryProductionArtwork';
import { getProjectEvolveAdapter } from '../../../../shared/site00-projects/evolve/projectEvolveAdapterRegistry.js';

type Props = {
  projectSlug: string;
  activeSubnav: string;
};

function EvolveDesktopBoard({ projectSlug }: { projectSlug: string }) {
  const { state: operatingState } = useProjectOperatingState(projectSlug);
  const adapter = getProjectEvolveAdapter(projectSlug);
  const evolveState = adapter.deriveEvolveState({
    generalized: {
      projectId: projectSlug,
      projectStateVersion: operatingState?.projectStateVersion ?? 1,
      lastUpdatedAt: operatingState?.lastUpdatedAt ?? '',
      summary: {
        displayName: 'NDXBOOK',
        tagline: null,
        progressPercent: evolveStateFallbackProgress(operatingState),
        phase: operatingState?.chapterTitle ?? 'EVOLVE',
        lifecycleStage: 'EVOLVE',
      },
      capabilityManifest: {} as never,
      needsYourEye: [],
      activity: [],
      blockers: [],
      currentFocus: null,
      moduleStatuses: [],
      identityState: null,
      builderState: null,
      evolveState: null,
      productionState: null,
      reviewsState: [],
      libraryState: null,
      codebaseState: {} as never,
    },
    ndxOperatingState: operatingState,
  });

  const metrics = operatingState?.pulse.counts ?? {
    beingMade: 0,
    needYourEye: 0,
    developing: 0,
    fromAudience: 0,
  };
  const entries = operatingState?.entries ?? [];
  const labSystems = operatingState?.labSystems ?? [];
  const inProduction = operatingState?.inProduction ?? [];

  return (
    <div className="site00-fws-evolve-board" data-visual-reconstruction="ndxbook-evolve-desktop">
      <header className="site00-fws-evolve-board__hero">
        <p className="site00-fws-evolve-board__eyebrow">EVOLVE · NDXBOOK MARKETING OS</p>
        <h2 className="site00-fws-evolve-board__title">CHAPTER 01 — {operatingState?.chapterTitle ?? 'WHICH ONE IS IT?'}</h2>
        <p className="site00-fws-evolve-board__phase">{evolveState.currentPhase}</p>
        <div className="site00-fws-evolve-board__metrics">
          <div>
            <strong>{metrics.beingMade}</strong>
            <span>BEING MADE</span>
          </div>
          <div>
            <strong>{metrics.needYourEye}</strong>
            <span>NEED YOUR EYE</span>
          </div>
          <div>
            <strong>{evolveState.activeCampaigns}</strong>
            <span>ACTIVE CAMPAIGNS</span>
          </div>
          <div>
            <strong>{inProduction.length}</strong>
            <span>IN PRODUCTION</span>
          </div>
        </div>
      </header>

      <section className="site00-fws-evolve-board__section">
        <div className="site00-fws-evolve-board__section-head">
          <h3>ENTRIES</h3>
          <Link to={site00ProjectContentOperationsCampaignBoardPath(projectSlug)}>CAMPAIGN BOARD →</Link>
        </div>
        <div className="site00-fws-hub-carousel site00-fws-hub-carousel--mobile-row">
          {entries.map((entry) => {
            const art = entryProductionArtwork(entry.entryId);
            return (
              <Link
                key={entry.entryId}
                to={entry.href}
                className={`site00-fws-hub-carousel__card site00-fws-hub-carousel__card--mobile site00-fws-hub-carousel__card--art${entry.needsFounderReview ? ' site00-fws-hub-carousel__card--priority' : ''}`}
              >
                {art ? (
                  <div
                    className="site00-fws-hub-carousel__card-art"
                    style={{ backgroundImage: `url(${art.path})`, backgroundPosition: art.objectPosition }}
                    role="img"
                    aria-label={`${entry.title} artwork`}
                  />
                ) : null}
                <div className="site00-fws-hub-carousel__card-body">
                  {entry.needsFounderReview ? <span className="site00-fws-hub-tag">NEEDS REVIEW</span> : null}
                  <p className="site00-fws-hub-carousel__card-title">
                    ENTRY {String(entry.entryNumber).padStart(3, '0')} — {entry.title}
                  </p>
                  <p className="site00-fws-hub-carousel__card-sub">{entry.subtitle}</p>
                  <p className="site00-fws-hub-carousel__card-sub">{entry.stageLabel}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="site00-fws-evolve-board__grid">
        <section className="site00-fws-evolve-board__panel">
          <h3>CAMPAIGNS</h3>
          <p className="site00-fws-evolve-board__stat">{evolveState.activeCampaigns} ACTIVE</p>
          <Link to={site00ProjectContentOperationsCampaignBoardPath(projectSlug)} className="site00-fws-hub-cta">
            OPEN CAMPAIGN BOARD →
          </Link>
          <Link to={site00ProjectCampaignBoardEntryPath(projectSlug, '001')} className="site00-fws-hub-link">
            ENTRY 001 PACKAGE →
          </Link>
        </section>

        <section className="site00-fws-evolve-board__panel">
          <h3>CONTENT OPS</h3>
          <p className="site00-fws-evolve-board__stat">{evolveState.contentInProduction} IN PRODUCTION</p>
          <Link to={site00ProjectContentOperationsPath(projectSlug)} className="site00-fws-hub-cta">
            OPEN CONTENT OPS DESK →
          </Link>
        </section>

        <section className="site00-fws-evolve-board__panel">
          <h3>LAB</h3>
          <p className="site00-fws-evolve-board__stat">{labSystems.length} SYSTEMS</p>
          <Link to={site00ProjectLabPath(projectSlug)} className="site00-fws-hub-cta">
            OPEN LAB HUB →
          </Link>
        </section>

        <section className="site00-fws-evolve-board__panel">
          <h3>EXPRESSION ENGINE</h3>
          <Link to={site00ProjectExpressionEngineCampaignPath(projectSlug)} className="site00-fws-hub-cta">
            ENTRY 002 · 003 →
          </Link>
          <Link to={site00ProjectContentOperationsPerformancePath(projectSlug)} className="site00-fws-hub-link">
            PERFORMANCE →
          </Link>
          <Link to={site00ProjectExperimentsPath(projectSlug)} className="site00-fws-hub-link">
            EXPERIMENTS HUB →
          </Link>
        </section>
      </div>

      {operatingState?.approvalsNeeded.length ? (
        <section className="site00-fws-evolve-board__approvals">
          <h3>NEEDS YOUR EYE</h3>
          <ul>
            {operatingState.approvalsNeeded.map((item) => (
              <li key={item.id}>
                <Link to={item.href ?? '#'}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function evolveStateFallbackProgress(
  operatingState: ReturnType<typeof useProjectOperatingState>['state'],
): number {
  if (!operatingState) return 0;
  const total = operatingState.entries.length || 1;
  const active = operatingState.inProduction.length;
  return Math.min(100, Math.round((active / total) * 100));
}

export function EvolveFounderWorkspaceBoard({ projectSlug, activeSubnav }: Props) {
  const isWide = useSite00OriginWideViewport();
  const adapter = getProjectEvolveAdapter(projectSlug);
  const screenId = adapter.resolveMobileScreenId(activeSubnav);

  if (isWide) {
    return <EvolveDesktopBoard projectSlug={projectSlug} />;
  }

  return (
    <div className="site00-fws-evolve-mobile" data-evolve-subnav={activeSubnav}>
      {renderMobileFounderWorkspaceScreen(screenId, projectSlug)}
    </div>
  );
}
