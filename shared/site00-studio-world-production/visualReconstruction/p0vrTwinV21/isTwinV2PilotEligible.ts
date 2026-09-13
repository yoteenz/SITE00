import { TWIN_V2_PILOT_PAGE_ID, TWIN_V2_PILOT_PROJECT_ID } from './constants.js';

/** Pilot: NDXBOOK overview mobile only — do not generalize yet. */
export function isTwinV2PilotEligible(input: {
  projectId: string;
  pageId: string;
  viewport: string;
  route?: string;
}): boolean {
  if (input.viewport !== 'mobile') return false;
  if (input.projectId !== TWIN_V2_PILOT_PROJECT_ID) return false;
  const pageOk =
    input.pageId.includes('overview') ||
    input.pageId.includes(TWIN_V2_PILOT_PAGE_ID) ||
    Boolean(input.route?.includes('/ndxbook') && input.route.includes('overview'));
  return pageOk;
}
