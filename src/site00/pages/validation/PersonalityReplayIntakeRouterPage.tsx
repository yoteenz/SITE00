import { Navigate, useParams } from 'react-router-dom';
import { IDNTY_PERSONALITY_QUESTIONS } from '../../../../shared/site00-brand-lore/idnty-personality-questions';
import {
  projectPersonalityReplayPath,
  projectPersonalityReplayStepPath,
  projectPersonalityReplayReviewPath,
} from '../../config/personalityReplayRoutes';

/** Legacy validation URLs redirect to the project tunnel entry. */
export default function PersonalityReplayIntakeRouterPage() {
  const { stepId } = useParams<{ replayId: string; stepId?: string }>();
  const projectSlug = 'ndxbook';

  if (stepId === 'review') {
    return <Navigate to={projectPersonalityReplayReviewPath(projectSlug)} replace />;
  }

  if (stepId && stepId !== 'start' && IDNTY_PERSONALITY_QUESTIONS.some((q) => q.id === stepId)) {
    return <Navigate to={projectPersonalityReplayStepPath(projectSlug, stepId)} replace />;
  }

  return <Navigate to={projectPersonalityReplayPath(projectSlug)} replace />;
}
