import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import { useParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { NdxFounderWorkspacePage } from '../components/founderWorkspace';
import { NdxbookContentLibrary } from '../components/library/NdxbookContentLibrary';
import type { CreativeLineageLibraryPayload } from '../../../shared/site00-brand-lore/creativeLineage/types';
import { site00ProjectsApi } from '../services/site00ProjectsApi';
import '../styles/site00-content-library.css';

export default function ProjectContentLibraryPage() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const [, setLibrary] = useState<CreativeLineageLibraryPayload | null>(null);

  const reload = useCallback(async () => {
    if (!hasProjectCapability(projectSlug, 'PROJECT_CORE')) return;
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

  return (
    <NdxFounderWorkspacePage
      projectSlug={projectSlug}
      title="CONTENT LIBRARY"
      subtitle="HOW YOU SHOW UP — CREATIVE LINEAGE"
      nonNdxFallback={<p>Content library is NDXBOOK-only.</p>}
      operate={<NdxbookContentLibrary projectSlug={projectSlug} />}
    />
  );
}
