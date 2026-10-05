import { Navigate, useParams } from 'react-router-dom';
import { ExperienceScreen } from '../../components/productionAuthority/realm/ExperienceScreen';
import { resolveRealmRoute } from '../../components/productionAuthority/realm/realmRoutes';

/**
 * Production → EXPERIENCE — the 7 families / 46 routes (WORLD · ZONES · PATHS · INTERACTIONS · INHABITANTS ·
 * STATES · ACCESS) resolve through one route model and render inside the shared Production authority frame
 * (mounted by ProductionWorkspaceProjectLayout). Legacy sub-workspace ids resolve onto their families.
 */
export function ExperienceProductionShellPage() {
  const { projectSlug = 'ndxbook', '*': rest } = useParams<{ projectSlug: string; '*': string }>();
  const slug = projectSlug.toLowerCase();
  const resolved = resolveRealmRoute('experience', rest);
  if (!resolved) return <Navigate to={`/production/${slug}/experience`} replace />;
  return <ExperienceScreen slug={slug} resolved={resolved} key={`${resolved.route.family}/${resolved.route.id}`} />;
}
