import { Navigate, useLocation, useParams } from 'react-router-dom';

/** P0.VR.DESIGN-PROJECT-BINDING1R1 — legacy `/projects/:slug/design` → `/projects/design/:slug`. */
export function DesignLegacyProjectDesignRedirect() {
  const { projectSlug = '' } = useParams<{ projectSlug: string }>();
  const location = useLocation();
  const slug = projectSlug.toLowerCase();
  const suffix = location.pathname.replace(`/projects/${slug}/design`, '');
  return <Navigate to={`/projects/design/${slug}${suffix}${location.search}`} replace />;
}
