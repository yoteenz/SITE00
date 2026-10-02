import { Navigate, useParams } from 'react-router-dom';
import { site00ProductionDesignPath } from '../../config/routes';

/** Back-compat: `/production/:projectSlug/design-workspace` → canonical `/design`. */
export function ProductionDesignWorkspaceAliasRedirect() {
  const { projectSlug = 'ndxbook' } = useParams<{ projectSlug: string }>();
  return <Navigate to={site00ProductionDesignPath(projectSlug.toLowerCase())} replace />;
}
