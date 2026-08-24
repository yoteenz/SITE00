import { Link, useParams } from 'react-router-dom';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ExperimentsHubOperateLayer } from '../components/founderWorkspace/ExperimentsHubOperateLayer';
import { FounderWorkspaceShell, useFounderWorkspaceInspector } from '../components/founderWorkspace/FounderWorkspaceShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { useExperimentsHubScrollRestore } from '../hooks/useExperimentsHubScrollRestore';
import {
  getProjectExperimentsHubEntries,
  projectExperimentsHubPhaseLabel,
  type ProjectExperimentHubEntry,
  type ProjectExperimentHubPhase,
} from '../config/projectExperimentsHub';
import { ndxExperimentJourneyStages, ndxFounderWorkspaceEnabled } from '../config/ndxFounderWorkspace';
import { site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import '../styles/site00-projects.css';
import '../styles/site00-founder-workspace.css';
import '../styles/site00-visual-reconstruction.css';

function groupByPhase(entries: ProjectExperimentHubEntry[]): Map<ProjectExperimentHubPhase, ProjectExperimentHubEntry[]> {
  const map = new Map<ProjectExperimentHubPhase, ProjectExperimentHubEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.phase) ?? [];
    list.push(entry);
    map.set(entry.phase, list);
  }
  return map;
}

function ExperimentHubCard({ entry }: { entry: ProjectExperimentHubEntry }) {
  return (
    <li className="site00-experiments-hub-card">
      <Link to={entry.path} className="site00-experiments-hub-card__link">
        <div className="site00-experiments-hub-card__meta">
          <span className="site00-experiments-hub-card__order">{String(entry.order).padStart(2, '0')}</span>
          {entry.letter ? <span className="site00-experiments-hub-card__letter">EXP {entry.letter}</span> : null}
        </div>
        <div className="site00-experiments-hub-card__body">
          <p className="site00-experiments-hub-card__headline">{entry.headline}</p>
          <p className="site00-experiments-hub-card__title">{entry.title}</p>
          <p className="site00-experiments-hub-card__desc">{entry.description}</p>
          {entry.statusNote ? <p className="site00-experiments-hub-card__status">{entry.statusNote}</p> : null}
        </div>
        <span className="site00-experiments-hub-card__cta">OPEN →</span>
      </Link>
      {entry.children?.length ? (
        <ul className="site00-experiments-hub-card__children">
          {entry.children.map((child) => (
            <li key={child.id}>
              <Link to={child.path} className="site00-experiments-hub-card__child-link">
                <span>{child.title}</span>
                {child.description ? <span className="site00-experiments-hub-card__child-desc">{child.description}</span> : null}
                <span className="site00-experiments-hub-card__child-cta">→</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function ExperimentsHubFullIndex({ projectSlug, entries }: { projectSlug: string; entries: ProjectExperimentHubEntry[] }) {
  const grouped = groupByPhase(entries);
  const phaseOrder: ProjectExperimentHubPhase[] = ['INTAKE', 'EXPERIMENT', 'EXPERIENCE', 'LINEAGE'];

  return (
    <div className="site00-page site00-page--experiments-hub site00-page--experiments-hub-inspect">
      <nav className="site00-project-command__back">
        <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
      </nav>
      <header className="site00-experiments-hub-header">
        <p className="site00-label-red">NDXBOOK METHODOLOGY · INSPECT</p>
        <h2 className="site00-experiments-hub-header__title">FULL EXPERIMENT INDEX</h2>
        <p className="site00-body site00-experiments-hub-header__sub">
          Complete ordered inventory — lineage, statuses, and technical notes preserved.
        </p>
      </header>
      <ProjectExperimentsHubNav projectSlug={projectSlug} />
      {phaseOrder.map((phase) => {
        const phaseEntries = grouped.get(phase);
        if (!phaseEntries?.length) return null;
        return (
          <section key={phase} className="site00-experiments-hub-section" aria-label={projectExperimentsHubPhaseLabel(phase)}>
            <h2 className="site00-experiments-hub-section__title">{projectExperimentsHubPhaseLabel(phase)}</h2>
            <ol className="site00-experiments-hub-list">
              {phaseEntries.map((entry) => (
                <ExperimentHubCard key={entry.id} entry={entry} />
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

function ExperimentsHubWorkspaceContent({
  projectSlug,
  entries,
}: {
  projectSlug: string;
  entries: ProjectExperimentHubEntry[];
}) {
  const { openInspector } = useFounderWorkspaceInspector();
  const journeyStages = ndxExperimentJourneyStages();
  const resolveExperimentPath = (experimentId: string) => entries.find((e) => e.id === experimentId)?.path ?? null;

  const openFullIndex = () => {
    openInspector('FULL EXPERIMENT INDEX', <ExperimentsHubFullIndex projectSlug={projectSlug} entries={entries} />);
  };

  return (
    <ExperimentsHubOperateLayer
      projectSlug={projectSlug}
      entries={entries}
      journeyStages={journeyStages}
      resolveExperimentPath={resolveExperimentPath}
      onViewFullIndex={openFullIndex}
    />
  );
}

export default function ProjectExperimentsHubPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  useExperimentsHubScrollRestore(projectSlug);
  const entries = getProjectExperimentsHubEntries(projectSlug);
  const useWorkspace = ndxFounderWorkspaceEnabled(projectSlug);

  if (!entries.length) {
    return (
      <EcosystemShell hidePageHeader>
        <p className="site00-body">Methodology experiments hub is not configured for this project.</p>
      </EcosystemShell>
    );
  }

  const legacyHub = (
    <div className="site00-page site00-page--experiments-hub">
      <nav className="site00-project-command__back">
        <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
      </nav>
      <header className="site00-experiments-hub-header">
        <p className="site00-label-red">NDXBOOK METHODOLOGY</p>
        <h1 className="site00-experiments-hub-header__title">EXPERIMENTS &amp; VALIDATION</h1>
        <p className="site00-experiments-hub-header__project">{projectDisplayName(projectSlug)}</p>
      </header>
      <ProjectExperimentsHubNav projectSlug={projectSlug} />
      <ExperimentsHubFullIndex projectSlug={projectSlug} entries={entries} />
    </div>
  );

  return (
    <EcosystemShell hidePageHeader>
      {useWorkspace ? (
        <FounderWorkspaceShell
          projectSlug={projectSlug}
          title="EXPERIMENTS HUB"
          subtitle="METHODOLOGY JOURNEY"
          operate={<ExperimentsHubWorkspaceContent projectSlug={projectSlug} entries={entries} />}
          inspect={<ExperimentsHubFullIndex projectSlug={projectSlug} entries={entries} />}
          inspectLabel="INSPECT FULL INDEX + METHODOLOGY"
        />
      ) : (
        legacyHub
      )}
    </EcosystemShell>
  );
}
