import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ExperimentFSixConceptReformationReview } from '../components/validation/ExperimentFSixConceptReformationReview';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectPath, site00ProjectExperimentGPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { SixConceptReformationRun } from '../../../shared/site00-brand-lore/conceptTerritoryV2/types';
import '../styles/site00-replay-execution.css';
import '../styles/site00-experiment-f.css';

export default function ProjectExperimentFPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<SixConceptReformationRun | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.experimentFGet(projectSlug);
      setRun((result.run as SixConceptReformationRun | null) ?? null);
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
        <p>Experiment F is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const projectTitle = projectDisplayName(projectSlug);

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <p className="site00-project-lore-calibration__kicker">CONCEPT BEFORE DIRECTION</p>
            <h1 className="site00-project-lore-calibration__project">{projectTitle}</h1>
            <p className="site00-project-lore-calibration__headline">SIX-CONCEPT REFORMATION</p>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>
          <ProjectExperimentsHubNav projectSlug={projectSlug} />

          <div className="site00-experiment-f__g-banner" role="note">
            <p className="site00-experiment-f__g-banner-title">NEED SIX BRAND-PRESENTATION CONCEPTS?</p>
            <p className="site00-experiment-f__g-banner-copy">
              Experiment F below is <strong>content</strong> research (Credit Utilization topic). For the updated six{' '}
              <strong>brand-presentation</strong> hero concepts, use Experiment G.
            </p>
            <Link className="site00-btn site00-btn--primary" to={site00ProjectExperimentGPath(projectSlug)}>
              OPEN EXPERIMENT G →
            </Link>
          </div>

          {loading ? (
            <p className="site00-experiment-f__pending">LOADING…</p>
          ) : (
            <ExperimentFSixConceptReformationReview projectSlug={projectSlug} run={run} onUpdate={() => void reload()} />
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
