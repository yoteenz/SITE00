import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ExperimentDConceptTerritoryReview } from '../components/validation/ExperimentDConceptTerritoryReview';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { SixConceptHeroRangeRun } from '../../../shared/site00-brand-lore/conceptTerritory/conceptTerritoryTypes';
import '../styles/site00-replay-execution.css';
import '../styles/site00-experiment-d.css';

export default function ProjectExperimentDPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<SixConceptHeroRangeRun | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.experimentDGet(projectSlug);
      setRun((result.run as SixConceptHeroRangeRun | null) ?? null);
    } catch {
      setRun(null);
    } finally {
      setLoading(false);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Experiment D is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const projectTitle = projectDisplayName(projectSlug);

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <p className="site00-project-lore-calibration__kicker">HOW YOU SHOW UP</p>
            <h1 className="site00-project-lore-calibration__project">{projectTitle}</h1>
            <p className="site00-project-lore-calibration__headline">SIX CONCEPT TERRITORY HERO RANGE</p>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p className="site00-experiment-d__pending">LOADING…</p>
          ) : (
            <ExperimentDConceptTerritoryReview projectSlug={projectSlug} run={run} onUpdate={() => void reload()} />
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
