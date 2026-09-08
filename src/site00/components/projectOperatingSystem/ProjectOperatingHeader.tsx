import { Link } from 'react-router-dom';
import type { GeneralizedProjectOperatingState } from '../../../../shared/site00-projects/generalizedProjectOperatingState.js';
import { SITE00_ROUTES } from '../../config/routes.js';

type ProjectOperatingHeaderProps = {
  operatingState: GeneralizedProjectOperatingState;
  projectSlug: string;
  currentModuleLabel: string;
};

export function ProjectOperatingHeader({
  operatingState,
  currentModuleLabel,
}: ProjectOperatingHeaderProps) {
  const { summary, needsYourEye, capabilityManifest } = operatingState;
  const needsCount = needsYourEye.filter((n) => n.priority === 'HIGH').length;

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
            <span className="site00-pos-header__progress-value">{summary.progressPercent}%</span>
            <div className="site00-pos-header__progress-bar">
              <div style={{ width: `${summary.progressPercent}%` }} />
            </div>
          </div>
          <div className="site00-pos-header__metrics">
            <div>
              <strong>{needsCount}</strong>
              <span>NEEDS YOUR EYE</span>
            </div>
            <div>
              <strong>{operatingState.blockers.length}</strong>
              <span>BLOCKERS</span>
            </div>
            <div>
              <strong>{summary.phase}</strong>
              <span>CURRENT PHASE</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
