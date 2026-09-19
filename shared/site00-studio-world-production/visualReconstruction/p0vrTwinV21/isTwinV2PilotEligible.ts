import { TWIN_V2_PILOT_PAGE_ID, TWIN_V2_PILOT_PROJECT_ID } from './constants.js';

/** Pilot: NDXBOOK overview mobile only — do not generalize yet. */
export function isTwinV2PilotEligible(input: {
  projectId: string;
  pageId: string;
  viewport: string;
  route?: string;
  /** Family root overview (canonical route is often `/projects/ndxbook` without "overview" in pageId). */
  isRootOverview?: boolean;
  screenId?: string | null;
}): boolean {
  if (input.viewport !== 'mobile') return false;
  if (input.projectId !== TWIN_V2_PILOT_PROJECT_ID) return false;

  const projectRoot = `/projects/${TWIN_V2_PILOT_PROJECT_ID}`;
  const routeNorm = (input.route ?? '').split('?')[0]?.replace(/\/+$/, '').toLowerCase() ?? '';
  const pageIdNorm = input.pageId.toLowerCase();

  const pageOk =
    input.isRootOverview === true ||
    input.screenId === 'overview' ||
    pageIdNorm.includes('overview') ||
    pageIdNorm.includes(TWIN_V2_PILOT_PAGE_ID) ||
    pageIdNorm.endsWith(projectRoot) ||
    pageIdNorm === `${TWIN_V2_PILOT_PROJECT_ID}:${projectRoot}` ||
    routeNorm === projectRoot ||
    routeNorm.endsWith('/overview') ||
    (routeNorm.includes('/ndxbook') && (routeNorm.endsWith('/ndxbook') || routeNorm.includes('overview')));

  return pageOk;
}
