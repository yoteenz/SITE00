import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { CanonicalCreativeRangeReview } from '../components/validation/CanonicalCreativeRangeReview';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { CanonicalCreativeRangeRun } from '../../../shared/site00-brand-lore/canonicalCreativeRangeTypes';
import '../styles/site00-replay-execution.css';
import '../styles/site00-six-direction-consistency.css';

export default function ProjectCanonicalCreativeRangePage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<CanonicalCreativeRangeRun | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.canonicalCreativeRangeGet(projectSlug);
      setRun((result.run as CanonicalCreativeRangeRun | null) ?? null);
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
        <p>Canonical creative range validation is NDXBOOK-only.</p>
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
            <p className="site00-project-lore-calibration__headline">CANONICAL CREATIVE RANGE VALIDATION</p>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>
          <ProjectExperimentsHubNav projectSlug={projectSlug} />

          {loading ? (
            <p className="site00-six-dir-review__pending">LOADING…</p>
          ) : (
            <CanonicalCreativeRangeReview projectSlug={projectSlug} run={run} onUpdate={() => void reload()} />
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
