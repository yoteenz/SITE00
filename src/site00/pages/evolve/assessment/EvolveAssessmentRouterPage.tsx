import { Navigate, useLocation, useParams } from 'react-router-dom';
import { EVOLVE_ASSESSMENT_PATH_SLUGS, SITE00_ROUTES, type EvolveAssessmentRouteSlug } from '../../../config/routes';
import type { EvolvePathId } from '../../../config/evolve';
import EvolveAssessmentStepPage from './EvolveAssessmentStepPage';
import EvolveAssessmentCompletePage from './EvolveAssessmentCompletePage';

function isValidSlug(slug: string | undefined): slug is EvolvePathId {
  return Boolean(slug && EVOLVE_ASSESSMENT_PATH_SLUGS.includes(slug as EvolveAssessmentRouteSlug));
}

function parseEvolveSegments(pathname: string, pathSlug: string): string | null {
  const prefix = `/evolve/${pathSlug}`;
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

/** Resolves /evolve/:pathSlug[/:step|complete][/desktop]. */
export default function EvolveAssessmentRouterPage() {
  const { pathSlug } = useParams<{ pathSlug: string }>();
  const { pathname } = useLocation();

  if (!isValidSlug(pathSlug)) {
    return <Navigate to={SITE00_ROUTES.evolveState} replace />;
  }

  const stepSegment = parseEvolveSegments(pathname, pathSlug);

  if (!stepSegment) {
    return <Navigate to={`/evolve/${pathSlug}/property`} replace />;
  }

  if (stepSegment === 'complete') {
    return <EvolveAssessmentCompletePage pathSlug={pathSlug} />;
  }

  if (stepSegment === 'desktop') {
    return <Navigate to={`/evolve/${pathSlug}/property`} replace />;
  }

  return <EvolveAssessmentStepPage pathSlug={pathSlug} stepId={stepSegment} />;
}
