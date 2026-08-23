import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { ExperimentEExperienceExpressionReview } from '../components/validation/ExperimentEExperienceExpressionReview';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { ExperienceExpressionRun } from '../../../shared/site00-brand-lore/experienceExpression/types';
import '../styles/site00-replay-execution.css';
import '../styles/site00-experiment-e.css';

export default function ProjectExperimentEPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<ExperienceExpressionRun | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.experimentEGet(projectSlug);
      setRun((result.run as ExperienceExpressionRun | null) ?? null);
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
        <p>Experiment E is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  const projectTitle = projectDisplayName(projectSlug);

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <p className="site00-project-lore-calibration__kicker">HOW THE PROJECT FEELS</p>
            <h1 className="site00-project-lore-calibration__project">{projectTitle}</h1>
            <p className="site00-project-lore-calibration__headline">EXPERIENCE EXPRESSION</p>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p className="site00-experiment-e__pending">LOADING…</p>
          ) : (
            <ExperimentEExperienceExpressionReview projectSlug={projectSlug} run={run} onUpdate={() => void reload()} />
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
