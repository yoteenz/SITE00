import { Navigate, useLocation, useParams } from 'react-router-dom';
import {
  BLDR_ASSESSMENT_STATE_SLUGS,
  type BldrAssessmentRouteSlug,
  SITE00_ROUTES,
} from '../../../config/routes';
import type { BldrAssessmentStateId } from '../../../config/bldr-assessment';
import BldrAssessmentLandingPage from './BldrAssessmentLandingPage';
import BldrAssessmentStepPage from './BldrAssessmentStepPage';
import BldrAssessmentReviewPage from './BldrAssessmentReviewPage';
import BldrAssessmentCompletePage from './BldrAssessmentCompletePage';
import BldrAssessmentRecommendationPage from './BldrAssessmentRecommendationPage';
import { BldrExperienceMobileStep } from '../../../components/bldr/experience/BldrExperienceMobileStep';
import { getExperienceQuestion } from '../../../../../shared/site00-brand-lore/bldr-experience-questions';

function isValidSlug(slug: string | undefined): slug is BldrAssessmentStateId {
  return Boolean(slug && BLDR_ASSESSMENT_STATE_SLUGS.includes(slug as BldrAssessmentRouteSlug));
}

function parseBldrSegments(pathname: string, classSlug: string): string | null {
  const prefix = `/bldr/${classSlug}`;
  let rest = pathname;
  if (rest.startsWith(`${prefix}/desktop`)) {
    rest = rest.slice(`${prefix}/desktop`.length);
  } else if (rest.startsWith(prefix)) {
    rest = rest.slice(prefix.length);
  }
  rest = rest.replace(/^\//, '');
  if (!rest) return null;
  return rest.split('/')[0] ?? null;
}

/** Resolves /bldr/:classSlug[/:step|review|complete|recommendation][/desktop]. */
export default function BldrAssessmentRouterPage() {
  const { classSlug } = useParams<{ classSlug: string }>();
  const { pathname } = useLocation();

  if (!isValidSlug(classSlug)) {
    return <Navigate to={SITE00_ROUTES.bldrState} replace />;
  }

  const stepSegment = parseBldrSegments(pathname, classSlug);

  if (!stepSegment) {
    return <BldrAssessmentLandingPage classSlug={classSlug} />;
  }

  if (stepSegment === 'review') {
    return <BldrAssessmentReviewPage classSlug={classSlug} />;
  }

  if (stepSegment === 'complete') {
    return <BldrAssessmentCompletePage classSlug={classSlug} />;
  }

  if (stepSegment === 'recommendation' && classSlug === 'not-sure') {
    return <BldrAssessmentRecommendationPage />;
  }

  if (stepSegment === 'desktop') {
    return <BldrAssessmentLandingPage classSlug={classSlug} />;
  }

  const experienceMatch = pathname.match(/\/experience\/([^/]+)/);
  if (experienceMatch?.[1] && getExperienceQuestion(experienceMatch[1])) {
    return <BldrExperienceMobileStep classSlug={classSlug} stepId={experienceMatch[1]} />;
  }

  return <BldrAssessmentStepPage classSlug={classSlug} stepId={stepSegment} />;
}
