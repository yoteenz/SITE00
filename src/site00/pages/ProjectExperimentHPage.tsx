import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { ExperimentHBrandCharacterReview } from '../components/validation/ExperimentHBrandCharacterReview';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { BrandCharacterFormationRun } from '../../../shared/site00-brand-lore/brandCharacterTerritory/types';
import '../styles/site00-replay-execution.css';
import '../styles/site00-experiment-g.css';
import '../styles/site00-experiment-g-directions.css';

export default function ProjectExperimentHPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<BrandCharacterFormationRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.experimentHGet(projectSlug);
      setRun((result.run as BrandCharacterFormationRun | null) ?? null);
      setLastRefreshedAt(new Date());
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (run?.status !== 'FORMING') return;
    const pollId = window.setInterval(() => {
      void reload();
    }, 5000);
    return () => window.clearInterval(pollId);
  }, [run?.status, reload]);

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Brand Character Formation is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const projectTitle = projectDisplayName(projectSlug);

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <p className="site00-project-lore-calibration__kicker">BRAND BEFORE PRESENTATION</p>
            <h1 className="site00-project-lore-calibration__project">{projectTitle}</h1>
            <p className="site00-project-lore-calibration__headline">BRAND CHARACTER FORMATION — WHO IS NDXBOOK?</p>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>
          <ProjectExperimentsHubNav projectSlug={projectSlug} />

          {loading ? (
            <p className="site00-experiment-g__pending">LOADING CHARACTER PIPELINE…</p>
          ) : (
            <ExperimentHBrandCharacterReview
              projectSlug={projectSlug}
              run={run}
              lastRefreshedAt={lastRefreshedAt}
              onRefresh={() => void reload()}
              onUpdate={(updated) => {
                if (updated) {
                  setRun(updated);
                  setLastRefreshedAt(new Date());
                  return;
                }
                void reload();
              }}
            />
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
