import { Link } from 'react-router-dom';
import type { GeneralizedProjectOperatingState } from '../../../../shared/site00-projects/generalizedProjectOperatingState.js';
import type { ProjectOverviewViewModel } from '../../../../shared/site00-projects/overview/types.js';
import { buildProjectProgressSummary } from '../../../../shared/site00-projects/projectProgressSummary.js';
import { SITE00_ROUTES } from '../../config/routes.js';

type ProjectOperatingHeaderProps = {
  operatingState: GeneralizedProjectOperatingState;
  projectSlug: string;
  currentModuleLabel: string;
  overviewModel?: ProjectOverviewViewModel | null;
};

function progressHeaderDisplay(
  overviewModel: ProjectOverviewViewModel | null | undefined,
  operatingState: GeneralizedProjectOperatingState,
): { text: string; percent: number | null } {
  if (overviewModel) {
    if (overviewModel.progress.percent != null) {
      return { text: `${overviewModel.progress.percent}%`, percent: overviewModel.progress.percent };
    }
    return { text: overviewModel.progress.label ?? 'IN PROGRESS', percent: null };
  }
  const summary = buildProjectProgressSummary(operatingState);
  if (summary.percent != null) {
    return { text: `${summary.percent}%`, percent: summary.percent };
  }
  return { text: summary.label ?? 'IN PROGRESS', percent: null };
}

export function ProjectOperatingHeader({
  operatingState,
  currentModuleLabel,
  overviewModel,
}: ProjectOperatingHeaderProps) {
  const { summary, capabilityManifest } = operatingState;
  const progress = progressHeaderDisplay(overviewModel, operatingState);
  const needsCount = overviewModel?.needsYourEyeCount ?? operatingState.needsYourEye.filter((n) => n.priority === 'HIGH').length;
  const blockerCount = overviewModel?.blockerCount ?? operatingState.blockers.length;
  const phase = overviewModel?.phase ?? summary.phase;

  return (
    <header className="site00-pos-header">
      <div className="site00-pos-header__breadcrumb">
        <Link to={SITE00_ROUTES.projects}>PROJECTS</Link>
        <span aria-hidden> › </span>
        <span>{summary.displayName}</span>
      </div>

      <div className="site00-pos-header__main">
        <div className="site00-pos-header__identity">
          <div className="site00-pos-header__marker" aria-hidden />
          <div>
            <h1 className="site00-pos-header__title">{summary.displayName}</h1>
            {summary.tagline ? <p className="site00-pos-header__tagline">{summary.tagline}</p> : null}
            <div className="site00-pos-header__tags">
              {capabilityManifest.internalProject ? <span>INTERNAL</span> : null}
              {capabilityManifest.founderManaged ? <span>FOUNDER OWNED</span> : null}
              {summary.lifecycleStage ? <span>{summary.lifecycleStage}</span> : null}
            </div>
          </div>
        </div>

        <div className="site00-pos-header__module-label">{currentModuleLabel}</div>

        <div className="site00-pos-header__stats">
          <div className="site00-pos-header__progress">
            <span className="site00-pos-header__progress-label">PROJECT PROGRESS</span>
            <span className="site00-pos-header__progress-value">{progress.text}</span>
            {progress.percent != null ? (
              <div className="site00-pos-header__progress-bar">
                <div style={{ width: `${progress.percent}%` }} />
              </div>
            ) : null}
          </div>
          <div className="site00-pos-header__metrics">
            <div>
              <strong>{needsCount}</strong>
              <span>NEEDS YOUR EYE</span>
            </div>
            <div>
              <strong>{blockerCount}</strong>
              <span>BLOCKERS</span>
            </div>
            <div>
              <strong>{phase}</strong>
              <span>CURRENT PHASE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
