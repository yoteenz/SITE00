import { Navigate, useParams, useSearchParams } from 'react-router-dom';
import { StudioWorldDesignWorkspace } from '../components/founderWorkspace/StudioWorldDesignWorkspace';
import {
  resolveLegacyProjectDesignRedirect,
  resolveManagedProjectForDesignContext,
  resolveStudioWorldDesignLegacyRedirect,
} from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr3m/client.js';
import { SITE00_DESIGN_PROJECT_ID } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr3/constants.js';
import type { DesignViewportClass } from '../../../shared/site00-studio-world-production/visualReconstruction/p0vr2/types.js';

/** Canonical SITE 00-owned Design workspace entry. */
export function Site00OwnedDesignWorkspacePage() {
  const [searchParams] = useSearchParams();
  const projectFromQuery = searchParams.get('project');
  const initialProjectId = resolveManagedProjectForDesignContext(projectFromQuery ?? SITE00_DESIGN_PROJECT_ID);
  const initialScreen =
    searchParams.get('screen') ??
    (initialProjectId === 'ndxbook' ? 'campaign-board' : initialProjectId === 'site00' ? 'guide' : undefined);
  const viewportParam = searchParams.get('viewport') as DesignViewportClass | null;

  return (
    <div
      className="site00-page site00-page--design-workspace"
      data-visual-reconstruction="p0vr2b-page"
      data-app-build-id={import.meta.env.VITE_APP_BUILD_ID}
    >
      <StudioWorldDesignWorkspace
        initialProjectId={initialProjectId}
        initialScreenId={initialScreen}
        initialViewport={viewportParam === 'desktop' || viewportParam === 'tablet' ? viewportParam : 'mobile'}
      />
    </div>
  );
}

/** @deprecated Legacy global entry — redirects to canonical SITE 00 Design route. */
export function StudioWorldDesignPage() {
  const [searchParams] = useSearchParams();
  const resolution = resolveStudioWorldDesignLegacyRedirect(searchParams.toString());
  const target = `${resolution.target.pathname}${resolution.target.search}`;
  return <Navigate to={target} replace />;
}

/** Legacy /projects/:projectSlug/design — redirects to canonical route with project context. */
export function LegacyProjectDesignRedirectPage() {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const [searchParams] = useSearchParams();
  const resolution = resolveLegacyProjectDesignRedirect(projectSlug ?? SITE00_DESIGN_PROJECT_ID, searchParams.toString());
  if (!resolution.redirect) {
    return <Site00OwnedDesignWorkspacePage />;
  }
  const target = `${resolution.target.pathname}${resolution.target.search}`;
  return <Navigate to={target} replace />;
}

/** @deprecated Use LegacyProjectDesignRedirectPage via canonical routing. */
export function ProjectDesignWorkspacePage() {
  return <LegacyProjectDesignRedirectPage />;
}
