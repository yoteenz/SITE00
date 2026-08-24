import { Link } from 'react-router-dom';
import type { ExperimentStagePresentation } from '../../../../shared/site00-studio-world-production/founderWorkspace/types';
import { getProjectExperimentsHubEntries } from '../../config/projectExperimentsHub';

function findEntry(projectSlug: string, id: string): { title: string; path: string } | null {
  const entries = getProjectExperimentsHubEntries(projectSlug);
  for (const e of entries) {
    if (e.id === id) return { title: e.title, path: e.path };
    for (const c of e.children ?? []) {
      if (c.id === id) return { title: c.title, path: c.path };
    }
  }
  return null;
}

type ExperimentJourneyProps = {
  stages: ExperimentStagePresentation[];
  projectSlug: string;
  currentExperimentId?: string;
};

export function ExperimentJourney({ stages, projectSlug, currentExperimentId }: ExperimentJourneyProps) {
  return (
    <section className="site00-fws-journey" aria-label="Methodology journey">
      <header className="site00-fws-journey__header">
        <h2 className="site00-fws-journey__title">METHODOLOGY JOURNEY</h2>
        <Link to={`/projects/${projectSlug}/experiments`} className="site00-fws-journey__all">
          VIEW ALL EXPERIMENTS →
        </Link>
      </header>
      <div className="site00-fws-journey__track">
        {stages.map((stage) => {
          const isCurrent = stage.experimentIds.includes(currentExperimentId ?? '');
          const links = stage.experimentIds
            .map((id) => findEntry(projectSlug, id))
            .filter((x): x is { title: string; path: string } => x != null);

          return (
            <article
              key={stage.stageId}
              className={isCurrent ? 'site00-fws-journey__stage site00-fws-journey__stage--current' : 'site00-fws-journey__stage'}
            >
              <p className="site00-fws-journey__stage-label">{stage.label}</p>
              <p className="site00-fws-journey__purpose">{stage.purpose}</p>
              <ul className="site00-fws-journey__experiments">
                {links.slice(0, 3).map((exp) => (
                  <li key={exp.path}>
                    <Link to={exp.path}>{exp.title}</Link>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function VersionTimeline({ entries }: { entries: readonly { version: string; summary: string }[] }) {
  return (
    <section className="site00-fws-version-timeline" aria-label="What changed">
      <h3 className="site00-fws-version-timeline__title">WHAT CHANGED</h3>
      <ol className="site00-fws-version-timeline__list">
        {entries.map((e) => (
          <li key={e.version}>
            <strong>{e.version}</strong>
            <span>{e.summary}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
