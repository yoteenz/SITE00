import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { ExperimentGBrandPresentationConceptReview } from '../components/validation/ExperimentGBrandPresentationConceptReview';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { BrandPresentationConceptFormationRun } from '../../../shared/site00-brand-lore/brandPresentationConceptTerritory/types';
import '../styles/site00-replay-execution.css';
import '../styles/site00-experiment-g.css';

export default function ProjectExperimentGPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<BrandPresentationConceptFormationRun | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.experimentGGet(projectSlug);
      setRun((result.run as BrandPresentationConceptFormationRun | null) ?? null);
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
        <p>Experiment G is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const projectTitle = projectDisplayName(projectSlug);

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <p className="site00-project-lore-calibration__kicker">BRAND BEFORE TOPIC</p>
            <h1 className="site00-project-lore-calibration__project">{projectTitle}</h1>
            <p className="site00-project-lore-calibration__headline">BRAND PRESENTATION CONCEPT FORMATION</p>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>
          <ProjectExperimentsHubNav projectSlug={projectSlug} />

          {loading ? (
            <p className="site00-experiment-g__pending">LOADING…</p>
          ) : (
            <ExperimentGBrandPresentationConceptReview
              projectSlug={projectSlug}
              run={run}
              onUpdate={(updated) => {
                if (updated) {
                  setRun(updated);
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
