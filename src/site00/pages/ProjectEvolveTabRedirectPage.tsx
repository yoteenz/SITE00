/**
 * B5.9R4 — Redirect bare /evolve to default campaigns tab.
 */

import { Navigate, useParams } from 'react-router-dom';
import { site00ProjectEvolveTabPath } from '../config/evolveSubshellRoutes';

export default function ProjectEvolveTabRedirectPage() {
  const { projectSlug = '' } = useParams();
  return <Navigate to={site00ProjectEvolveTabPath(projectSlug, 'CAMPAIGNS')} replace />;
}
