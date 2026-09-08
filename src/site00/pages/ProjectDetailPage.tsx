/**
 * B5.9R1 — Legacy project detail route redirects to modern overview module.
 * Retires first-generation dossier command grid.
 */
import { Navigate, useParams } from 'react-router-dom';
import { projectModulePath } from '../../../shared/site00-projects/projectModules.js';

export default function ProjectDetailPage() {
  const { projectSlug = '' } = useParams();
  return <Navigate to={projectModulePath(projectSlug, 'OVERVIEW')} replace />;
}
