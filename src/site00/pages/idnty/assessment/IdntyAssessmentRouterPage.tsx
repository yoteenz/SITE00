import { Navigate, useLocation, useParams } from 'react-router-dom';
import {
  IDNTY_ASSESSMENT_STATE_SLUGS,
  type IdntyAssessmentRouteSlug,
  isSite00IdntyAssessmentDesktopPath,
  SITE00_ROUTES,
} from '../../../config/routes';
import type { IdntyAssessmentStateId } from '../../../config/idnty-assessment';
import IdntyAssessmentLandingPage from './IdntyAssessmentLandingPage';
import IdntyAssessmentStepPage from './IdntyAssessmentStepPage';
import IdntyAssessmentReviewPage from './IdntyAssessmentReviewPage';
import IdntyAssessmentCompletePage from './IdntyAssessmentCompletePage';

function isValidSlug(slug: string | undefined): slug is IdntyAssessmentStateId {
  return Boolean(slug && IDNTY_ASSESSMENT_STATE_SLUGS.includes(slug as IdntyAssessmentRouteSlug));
}

function parseAssessmentSegments(pathname: string, stateSlug: string): string | null {
  const prefix = `/idnty/${stateSlug}`;
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

/** Resolves /idnty/:stateSlug[/:step|review|complete][/desktop]. */
export default function IdntyAssessmentRouterPage() {
  const { stateSlug } = useParams<{ stateSlug: string }>();
  const { pathname } = useLocation();

  if (!isValidSlug(stateSlug)) {
    return <Navigate to={SITE00_ROUTES.idntyState} replace />;
  }

  const stepSegment = parseAssessmentSegments(pathname, stateSlug);
  const isDesktop = isSite00IdntyAssessmentDesktopPath(pathname);

  if (!stepSegment) {
    return <IdntyAssessmentLandingPage stateSlug={stateSlug} key={`${stateSlug}-${isDesktop ? 'd' : 'm'}`} />;
  }

  if (stepSegment === 'review') {
    return <IdntyAssessmentReviewPage stateSlug={stateSlug} />;
  }

  if (stepSegment === 'complete') {
    return <IdntyAssessmentCompletePage stateSlug={stateSlug} />;
  }

  if (stepSegment === 'desktop') {
    return <IdntyAssessmentLandingPage stateSlug={stateSlug} />;
  }

  return <IdntyAssessmentStepPage stateSlug={stateSlug} stepId={stepSegment} />;
}
