import { useParams } from 'react-router-dom';
import { StudioWorldDesignWorkspace } from '../components/founderWorkspace/StudioWorldDesignWorkspace';

export function StudioWorldDesignPage() {
  return (
    <div className="site00-page site00-page--design-workspace">
      <StudioWorldDesignWorkspace />
    </div>
  );
}

export function ProjectDesignWorkspacePage() {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  return (
    <div className="site00-page site00-page--design-workspace">
      <StudioWorldDesignWorkspace initialProjectId={projectSlug ?? 'ndxbook'} />
    </div>
  );
}
