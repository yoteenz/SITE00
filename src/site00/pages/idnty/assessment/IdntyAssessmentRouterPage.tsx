import { Navigate, useLocation, useParams } from 'react-router-dom';
import {
  IDNTY_ASSESSMENT_STATE_SLUGS,
  type IdntyAssessmentRouteSlug,
  isSite00IdntyAssessmentDesktopPath,
  SITE00_ROUTES,
} from '../../../config/routes';
import type { IdntyAssessmentStateId } from '../../../config/idnty-assessment';
import {
  IDNTY_LEGACY_NEEDS_COHESION_SLUG,
  migrateLegacyNeedsCohesionSlug,
  migrateLegacyNeedsCohesionStep,
  getIdntyAssessmentState,
} from '../../../config/idnty-assessment';
import IdntyAssessmentLandingPage from './IdntyAssessmentLandingPage';
import IdntyAssessmentStepPage from './IdntyAssessmentStepPage';
import IdntyAssessmentReviewPage from './IdntyAssessmentReviewPage';
import IdntyAssessmentCompletePage from './IdntyAssessmentCompletePage';
import { IdentityLoreMobileStep, IdentityLoreWorldReview } from '../../../components/idnty/lore';
import { IdentityPersonalityMobileStep } from '../../../components/idnty/personality';
import { getLoreQuestion } from '../../../../../shared/site00-brand-lore/idnty-lore-questions';
import { getPersonalityQuestion } from '../../../../../shared/site00-brand-lore/idnty-personality-questions';
import { IdntyAssessmentShell } from '../../../components/idnty-assessment/IdntyAssessmentShell';

function isValidSlug(slug: string | undefined): slug is IdntyAssessmentStateId {
  return Boolean(slug && IDNTY_ASSESSMENT_STATE_SLUGS.includes(slug as IdntyAssessmentRouteSlug));
}

const RESERVED_IDNTY_ROUTE_SLUGS: Record<string, string> = {
  state: SITE00_ROUTES.idntyState,
  'sign-in-security': SITE00_ROUTES.idntySignInSecurity,
};

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

  if (stateSlug && RESERVED_IDNTY_ROUTE_SLUGS[stateSlug]) {
    return <Navigate to={RESERVED_IDNTY_ROUTE_SLUGS[stateSlug]} replace />;
  }

  if (!isValidSlug(stateSlug)) {
    const migratedSlug = migrateLegacyNeedsCohesionSlug(stateSlug ?? '');
    if (migratedSlug) {
      const isDesktop = isSite00IdntyAssessmentDesktopPath(pathname);
      const stepSegment = parseAssessmentSegments(pathname, IDNTY_LEGACY_NEEDS_COHESION_SLUG);
      const migratedStep = migrateLegacyNeedsCohesionStep(stepSegment);
      let target = `/idnty/${migratedSlug}`;
      if (isDesktop) target += '/desktop';
      if (migratedStep) target += `/${migratedStep}`;
      return <Navigate to={target} replace />;
    }
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

  if (stepSegment === 'world-review') {
    return (
      <IdntyAssessmentShell state={getIdntyAssessmentState(stateSlug)!} mobileLayout="calibration" showProcessStrip={false}>
        <IdentityLoreWorldReview stateSlug={stateSlug} />
      </IdntyAssessmentShell>
    );
  }

  const loreWorldMatch = pathname.match(/\/world\/([^/]+)/);
  if (loreWorldMatch?.[1] && getLoreQuestion(loreWorldMatch[1])) {
    return (
      <IdntyAssessmentShell state={getIdntyAssessmentState(stateSlug)!} mobileLayout="calibration" showProcessStrip={false}>
        <IdentityLoreMobileStep stateSlug={stateSlug} stepId={loreWorldMatch[1]} />
      </IdntyAssessmentShell>
    );
  }

  const calibrateMatch = pathname.match(/\/calibrate\/([^/]+)/);
  if (calibrateMatch?.[1] && getLoreQuestion(calibrateMatch[1])) {
    return (
      <IdntyAssessmentShell state={getIdntyAssessmentState(stateSlug)!} mobileLayout="calibration" showProcessStrip={false}>
        <IdentityLoreMobileStep stateSlug={stateSlug} stepId={calibrateMatch[1]} calibrationMode />
      </IdntyAssessmentShell>
    );
  }

  const personalityMatch = pathname.match(/\/personality\/([^/]+)/);
  if (personalityMatch?.[1] && getPersonalityQuestion(personalityMatch[1])) {
    return (
      <IdntyAssessmentShell state={getIdntyAssessmentState(stateSlug)!} mobileLayout="calibration" showProcessStrip={false}>
        <IdentityPersonalityMobileStep stateSlug={stateSlug} stepId={personalityMatch[1]} />
      </IdntyAssessmentShell>
    );
  }

  const calibratePersonalityMatch = pathname.match(/\/calibrate-personality\/([^/]+)/);
  if (calibratePersonalityMatch?.[1] && getPersonalityQuestion(calibratePersonalityMatch[1])) {
    return (
      <IdntyAssessmentShell state={getIdntyAssessmentState(stateSlug)!} mobileLayout="calibration" showProcessStrip={false}>
        <IdentityPersonalityMobileStep stateSlug={stateSlug} stepId={calibratePersonalityMatch[1]} calibrationMode />
      </IdntyAssessmentShell>
    );
  }

  if (stepSegment === 'personality-review') {
    return (
      <IdntyAssessmentShell state={getIdntyAssessmentState(stateSlug)!} mobileLayout="calibration" showProcessStrip={false}>
        <IdentityLoreWorldReview stateSlug={stateSlug} includePersonalityReview />
      </IdntyAssessmentShell>
    );
  }

  if (stepSegment === 'desktop') {
    return <IdntyAssessmentLandingPage stateSlug={stateSlug} />;
  }

  return <IdntyAssessmentStepPage stateSlug={stateSlug} stepId={stepSegment} />;
}
