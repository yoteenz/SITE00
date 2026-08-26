import { Navigate, useParams } from 'react-router-dom';
import { hasProjectCapability } from '../../../shared/site00-projects/capabilities.js';
import AstralWorldExperienceRouter from '../astral-world/pages/AstralWorldExperienceRouter';

/** Founder preview entry — Astral World client experience (CREATIVE_EXPLORATION) */
export default function ProjectAstralWorldExperiencePage() {
  const { projectSlug = '' } = useParams();
  if (projectSlug !== 'astral-world') {
    return <Navigate to={`/projects/${projectSlug}`} replace />;
  }
  if (!hasProjectCapability(projectSlug, 'BRAND_INTELLIGENCE')) {
    return <Navigate to={`/projects/${projectSlug}`} replace />;
  }
  return <AstralWorldExperienceRouter />;
}
