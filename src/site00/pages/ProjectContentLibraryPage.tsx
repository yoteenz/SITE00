import { Link, useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { ProjectExperimentsHubNav } from '../components/projects/ProjectExperimentsHubNav';
import { EcosystemShell } from '../components/ecosystem/EcosystemShell';
import { NdxbookContentLibrary } from '../components/library/NdxbookContentLibrary';
import { site00ProjectPath } from '../config/routes';
import { projectDisplayName } from '../utils/projectDisplayName';
import type { CreativeLineageLibraryPayload } from '../../../shared/site00-brand-lore/creativeLineage/types';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import '../styles/site00-content-library.css';

export default function ProjectContentLibraryPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [, setLibrary] = useState<CreativeLineageLibraryPayload | null>(null);

  const reload = useCallback(async () => {
    if (projectSlug !== 'ndxbook') return;
    try {
      const result = await site00ProjectsApi.creativeLineageLibrary(projectSlug);
      setLibrary(result.library as CreativeLineageLibraryPayload);
    } catch {
      setLibrary(null);
    }
  }, [projectSlug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  if (projectSlug !== 'ndxbook') {
    return (
      <EcosystemShell hidePageHeader>
        <p>Content library is NDXBOOK-only.</p>
      </EcosystemShell>
    );
  }

  return (
    <EcosystemShell hidePageHeader>
      <div className="site00-cd site00-cd--project-calibration">
        <div className="site00-project-lore-calibration">
          <header className="site00-project-lore-calibration__hero">
            <p className="site00-project-lore-calibration__kicker">HOW YOU SHOW UP</p>
            <h1 className="site00-project-lore-calibration__project">{projectDisplayName(projectSlug)}</h1>
            <p className="site00-project-lore-calibration__headline">CONTENT LIBRARY</p>
            <Link to={site00ProjectPath(projectSlug)}>← PROJECT</Link>
          </header>
          <ProjectExperimentsHubNav projectSlug={projectSlug} />
          <NdxbookContentLibrary projectSlug={projectSlug} />
        </div>
      </div>
    </EcosystemShell>
  );
}
