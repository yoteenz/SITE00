import { Link } from 'react-router-dom';
import type { ExperimentJourneyStageConfig } from '../../../../shared/site00-studio-world-production/founderWorkspace/types';
import {
  mapExperimentsHubPilotPresentation,
  stageKeywordsFor,
  type ExperimentsHubPilotEntry,
} from '../../../../shared/site00-brand-lore/visualReconstruction/experimentsHubPilotAdapter';
import {
  site00ProjectContentOperationsCampaignBoardPath,
  site00ProjectCulturalIntelligencePath,
  site00ProjectFounderCharacterDiscoveryPath,
} from '../../config/routes';

type ExperimentsHubOperateLayerProps = {
  projectSlug: string;
  entries: ExperimentsHubPilotEntry[];
  journeyStages: ExperimentJourneyStageConfig[];
  resolveExperimentPath: (experimentId: string) => string | null;
  onViewFullIndex: () => void;
};

export function ExperimentsHubOperateLayer({
  projectSlug,
  entries,
  journeyStages,
  resolveExperimentPath,
  onViewFullIndex,
}: ExperimentsHubOperateLayerProps) {
  const presentation = mapExperimentsHubPilotPresentation(entries, {
    create: entries[0]?.path,
    campaign: site00ProjectContentOperationsCampaignBoardPath(projectSlug),
    cultural: site00ProjectCulturalIntelligencePath(projectSlug),
    character: site00ProjectFounderCharacterDiscoveryPath(projectSlug),
    inspect: '#inspect',
  });

  return (
    <div className="site00-vr-experiments-hub" data-visual-reconstruction="experiments-hub-pilot">
      <header className="site00-vr-ehub__header">
        <div>
          <p className="site00-vr-ehub__eyebrow">NDXBOOK · STUDIO WORLD</p>
          <h1 className="site00-vr-ehub__title">EXPERIMENTS HUB</h1>
          <p className="site00-vr-ehub__subtitle">How we build NDX, in order.</p>
        </div>
        <button type="button" className="site00-vr-ehub__view-all" onClick={onViewFullIndex}>
          VIEW ALL EXPERIMENTS →
        </button>
      </header>

      <section className="site00-vr-ehub__journey" aria-label="Methodology journey">
        <div className="site00-vr-ehub__journey-track">
          {journeyStages.map((stage) => {
            const firstPath = stage.experimentIds.map(resolveExperimentPath).find(Boolean);
            const keywords = stageKeywordsFor(stage.stage);
            return (
              <article key={stage.stage} className="site00-vr-ehub__stage-card">
                <div
                  className="site00-vr-ehub__stage-art"
                  style={{ backgroundImage: `var(--vr-stage-bg-${stage.order})` }}
                  aria-hidden
                />
                <div className="site00-vr-ehub__stage-body">
                  <span className="site00-vr-ehub__stage-num">{String(stage.order).padStart(2, '0')}</span>
                  <h2 className="site00-vr-ehub__stage-title">{stage.title}</h2>
                  <ul className="site00-vr-ehub__stage-keywords">
                    {keywords.map((kw) => (
                      <li key={kw}>{kw}</li>
                    ))}
                  </ul>
                  {firstPath ? (
                    <Link to={firstPath} className="site00-vr-ehub__stage-enter">
                      ENTER →
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <div className="site00-vr-ehub__columns">
        <section className="site00-vr-ehub__recent" aria-label="Recent experiments">
          <h3 className="site00-vr-ehub__col-title">RECENT EXPERIMENTS</h3>
          <ul className="site00-vr-ehub__recent-list">
            {presentation.recentExperiments.map((exp) => (
              <li key={exp.id} className="site00-vr-ehub__recent-item">
                <div className="site00-vr-ehub__recent-meta">
                  <span className="site00-vr-ehub__recent-label">{exp.label}</span>
                  <span className="site00-vr-ehub__recent-version">{exp.version}</span>
                </div>
                <p className="site00-vr-ehub__recent-title">{exp.title}</p>
                <p className="site00-vr-ehub__recent-status">{exp.status}</p>
                <Link to={exp.path} className="site00-vr-ehub__recent-open">
                  OPEN →
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="site00-vr-ehub__actions" aria-label="Quick actions">
          <h3 className="site00-vr-ehub__col-title">QUICK ACTIONS</h3>
          <ul className="site00-vr-ehub__action-list">
            {presentation.quickActions.map((action) => (
              <li key={action.id}>
                {action.path === '#inspect' ? (
                  <button type="button" className="site00-vr-ehub__action-btn" onClick={onViewFullIndex}>
                    <span className="site00-vr-ehub__action-icon" aria-hidden>
                      ◎
                    </span>
                    {action.label}
                  </button>
                ) : (
                  <Link to={action.path} className="site00-vr-ehub__action-btn">
                    <span className="site00-vr-ehub__action-icon" aria-hidden>
                      ◎
                    </span>
                    {action.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
