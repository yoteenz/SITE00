import { Navigate, useParams } from 'react-router-dom';
import { shouldRenderExperienceWorkspace } from '../../../shared/site00-experience-workspace/paths.js';
import { canAccessExperienceModule } from '../../../shared/site00-experience-workspace/store.js';
import AstralWorldExperienceRouter from '../astral-world/pages/AstralWorldExperienceRouter';
import { ProjectExperienceWorkspacePage } from './ProjectExperienceWorkspacePage';

/**
 * Routes /projects/:projectSlug/experience/* to production workspace or Astral client runtime.
 */
export default function ProjectExperienceModuleGate() {
  const { projectSlug = '', '*': splat } = useParams();
  const slug = projectSlug.toLowerCase();

  if (!canAccessExperienceModule(slug)) {
    return <Navigate to={`/projects/${slug}`} replace />;
  }

  if (shouldRenderExperienceWorkspace(slug, splat)) {
    return <ProjectExperienceWorkspacePage projectSlug={slug} splat={splat} />;
  }

  if (slug === 'astral-world') {
    return <AstralWorldExperienceRouter mode="experience" />;
  }

  return <Navigate to={`/projects/${slug}/experience`} replace />;
}
