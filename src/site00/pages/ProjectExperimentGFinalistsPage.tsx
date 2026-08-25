import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { ExperimentGBrandPresentationFinalistReview } from '../components/validation/ExperimentGBrandPresentationFinalistReview';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectExperimentGDirectionsPath, site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { BrandPresentationVisualFormulationRun } from '../../../shared/site00-brand-lore/brandPresentationVisualFormulation/types';
import '../styles/site00-replay-execution.css';
import '../styles/site00-experiment-g-finalists.css';
import '../styles/site00-experiment-g-directions.css';

export default function ProjectExperimentGFinalistsPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<BrandPresentationVisualFormulationRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const reload = useCallback(async () => {
    if (!hasProjectCapability(projectSlug, 'CREATIVE_CONCEPT_TERRITORIES')) return;
    try {
      const result = await site00ProjectsApi.experimentGVisualGet(projectSlug);
      setRun((result.run as BrandPresentationVisualFormulationRun | null) ?? null);
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
    if (run?.status !== 'FORMULATING_BENCHMARKS' && run?.status !== 'FORMULATING_EXPRESSIONS') return;
    const pollId = window.setInterval(() => {
      void reload();
    }, 5000);
    return () => window.clearInterval(pollId);
  }, [run?.status, reload]);

  if (!hasProjectCapability(projectSlug, 'CREATIVE_CONCEPT_TERRITORIES')) {
    return (
      <EcosystemShell hidePageHeader>
        <p>Finalist visual formulation is NDXBOOK-only.</p>
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
            <p className="site00-project-lore-calibration__headline">BRAND PRESENTATION — PARENT FINALIST VISUAL REVIEW</p>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
            {' · '}
            <Link to={site00ProjectExperimentGDirectionsPath(projectSlug)}>← DIRECTION REVIEW</Link>
          </header>
          <ProjectExperimentsHubNav projectSlug={projectSlug} />

          {loading ? (
            <p className="site00-experiment-g-vf__pending">LOADING VISUAL PIPELINE…</p>
          ) : (
            <ExperimentGBrandPresentationFinalistReview
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
