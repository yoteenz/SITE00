import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { CanonicalCarouselExpansionReview } from '../components/validation/CanonicalCarouselExpansionReview';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import { site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { CanonicalCarouselExpansionRun } from '../../../shared/site00-brand-lore/canonicalCarouselExpansionTypes';
import '../styles/site00-replay-execution.css';
import '../styles/site00-carousel-expansion.css';

export default function ProjectCanonicalCarouselExpansionPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [run, setRun] = useState<CanonicalCarouselExpansionRun | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.canonicalCarouselExpansionGet(projectSlug);
      setRun((result.run as CanonicalCarouselExpansionRun | null) ?? null);
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
        <p>Canonical carousel expansion is NDXBOOK-only.</p>
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
            <p className="site00-project-lore-calibration__headline">CANONICAL CAROUSEL WORLD EXPANSION</p>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>

          {loading ? (
            <p className="site00-carousel-expansion__pending">LOADING…</p>
          ) : (
            <CanonicalCarouselExpansionReview projectSlug={projectSlug} run={run} onUpdate={() => void reload()} />
          )}
        </div>
      </div>
    </EcosystemShell>
  );
}
