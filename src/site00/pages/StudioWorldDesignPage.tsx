import { useParams, useSearchParams } from 'react-router-dom';
import { StudioWorldDesignWorkspace } from '../components/founderWorkspace/StudioWorldDesignWorkspace';

export function StudioWorldDesignPage() {
  return (
    <div className="site00-page site00-page--design-workspace" data-visual-reconstruction="p0vr2b-page">
      <StudioWorldDesignWorkspace />
    </div>
  );
}

export function ProjectDesignWorkspacePage() {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const [searchParams] = useSearchParams();
  const initialScreen = searchParams.get('screen') ?? undefined;
  const initialViewport = searchParams.get('viewport') as 'mobile' | 'desktop' | null;
  return (
    <div className="site00-page site00-page--design-workspace" data-visual-reconstruction="p0vr2b-page">
      <StudioWorldDesignWorkspace
        initialProjectId={projectSlug ?? 'ndxbook'}
        initialScreenId={initialScreen ?? 'campaign-board'}
        initialViewport={initialViewport === 'desktop' ? 'desktop' : 'mobile'}
      />
    </div>
  );
}
