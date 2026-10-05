import { Navigate, useLocation, useParams } from 'react-router-dom';
import { legacyProjectsDesignRedirectTarget } from '../../../../shared/site00-production-workspace/routes.js';

/** Redirect legacy projects-design URLs to production design mounts. */
export function ProjectsDesignModuleRedirect() {
  return <Navigate to="/production" replace />;
}

export function ProjectsDesignProjectRedirect() {
  const { projectSlug = '', '*': splat } = useParams<{ projectSlug: string; '*': string }>();
  const location = useLocation();
  const rest = splat ? splat : '';
  const target = legacyProjectsDesignRedirectTarget(projectSlug, rest, location.search);
  return <Navigate to={target} replace />;
}
