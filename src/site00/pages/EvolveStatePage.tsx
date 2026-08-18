import { Link, useNavigate } from 'react-router-dom';
import { EnvironmentShell } from '../components/environment/EnvironmentShell';
import { Site00AppShell } from '../components/shell/Site00AppShell';
import { Site00OriginLayoutSwitch } from '../components/shell/Site00OriginLayoutSwitch';
import { EVOLVE_PATHS, EVOLVE_PROCESS_STEPS, EVOLVE_STATE_COPY } from '../config/evolve';
import { ArchitecturalPanel } from '../components/panels/ArchitecturalPanel';
import { WorkflowSummary } from '../components/workflow/WorkflowCards';
import { EvolvePathIcon } from '../components/evolve/EvolvePathIcon';
import { useSite00 } from '../state/Site00Context';
import { useEvolveAssessment } from '../hooks/useEvolveAssessment';
import { evolveAssessmentPath } from '../config/evolve-assessment';
import { useSite00DesktopArtboardPreview } from '../components/shell/Site00DesktopArtboardContext';
import { site00EvolveAssessmentDesktopPath } from '../config/routes';
import type { EvolvePathId } from '../config/evolve';
import { ArrowIconSmall } from '../components/icons/ArrowAction';

function EvolvePathCard({
  path,
  selected,
  onSelect,
}: {
  path: (typeof EVOLVE_PATHS)[number];
  selected?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`site00-state-card ${selected ? 'site00-state-card--selected' : ''}`.trim()}
      onClick={onSelect}
      aria-pressed={selected}
      style={{ minHeight: 320 }}
    >
      <span className="site00-label-red">{path.code}</span>
      <div style={{ margin: '12px 0', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EvolvePathIcon id={path.icon} title={path.title} size={72} />
      </div>
      <p className="site00-panel-title" style={{ marginBottom: 4 }}>
        {path.title}
      </p>
      <p className="site00-label" style={{ marginBottom: 8 }}>
        {path.subtitle}
      </p>
      <p className="site00-body" style={{ fontSize: 11, marginBottom: 16 }}>
        {path.description}
      </p>
      <span className="site00-action-link site00-action-link--red">
        {path.cta.replace(' →', '')}
        <ArrowIconSmall />
      </span>
    </button>
  );
}

export default function EvolveStatePage() {
  const { state, selectEvolvePath } = useSite00();
  const navigate = useNavigate();
  const isDesktop = useSite00DesktopArtboardPreview();
  const { hasResume, resumeTarget, record } = useEvolveAssessment();

  const handleSelectPath = (pathId: EvolvePathId) => {
    selectEvolvePath(pathId);
    const path = evolveAssessmentPath(pathId, 'property');
    navigate(isDesktop ? site00EvolveAssessmentDesktopPath(path) : path);
  };

  return (
    <EnvironmentShell environmentId="WORKFLOW_ENVIRONMENT" className="site00-state-page site00-state-page--evolve">
      <Site00AppShell locationLabel={EVOLVE_STATE_COPY.locationLabel}>
        <div className="site00-state-page-layout">
          <header style={{ textAlign: 'center', marginBottom: 32 }}>
            <p className="site00-label-red" style={{ marginBottom: 8 }}>
              {EVOLVE_STATE_COPY.headline}
            </p>
            <p className="site00-body site00-state-page__subhead" style={{ maxWidth: 560, margin: '0 auto' }}>
              {EVOLVE_STATE_COPY.subhead}
            </p>
            <p className="site00-label" style={{ marginTop: 8 }}>
              {EVOLVE_STATE_COPY.helper}
            </p>
          </header>

          {hasResume && resumeTarget ? (
            <div className="site00-idnty-state-resume">
              <p className="site00-idnty-state-resume__label">
                RESUME EVOLVE — {record.evolvePath?.replace(/-/g, ' ').toUpperCase()}
              </p>
              <Link
                to={isDesktop ? site00EvolveAssessmentDesktopPath(resumeTarget) : resumeTarget}
                className="site00-idnty-state-resume__link"
              >
                CONTINUE →
              </Link>
            </div>
          ) : null}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              marginBottom: 40,
            }}
            role="list"
            aria-label="Evolve paths"
          >
            {EVOLVE_PATHS.map((path) => (
              <EvolvePathCard
                key={path.id}
                path={path}
                selected={state.selectedEvolvePathId === path.id}
                onSelect={() => handleSelectPath(path.id)}
              />
            ))}
          </div>

          <ArchitecturalPanel variant="workflow">
            <div style={{ padding: '24px 20px' }}>
              <p className="site00-label-red">{EVOLVE_STATE_COPY.processHeading}</p>
              <p className="site00-label" style={{ marginBottom: 20 }}>
                {EVOLVE_STATE_COPY.processSubhead}
              </p>
              <ol className="site00-bldr-step-list">
                {EVOLVE_PROCESS_STEPS.map((step) => (
                  <li key={step.num} className="site00-bldr-step-list__item">
                    <span className="site00-bldr-step-list__num">{step.num}</span>
                    <div>
                      <h2 className="site00-bldr-step-list__title">{step.title}</h2>
                      <p className="site00-bldr-step-list__body">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </ArchitecturalPanel>
        </div>

        <WorkflowSummary text={EVOLVE_STATE_COPY.footer} />
      </Site00AppShell>
      <Site00OriginLayoutSwitch />
    </EnvironmentShell>
  );
}
