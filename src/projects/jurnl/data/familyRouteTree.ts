/**
 * Design-viewport route tree for JURNL.
 *
 * F05–F16 production contracts stay parent-only. This module is the screen tree the
 * DESIGN route control and the live path reporter use. It does not expand those contracts.
 *
 * Param routes use a concrete preview segment so the iframe can open the detail screen.
 * The match pattern still accepts any one segment, so in-app navigation reports the same id.
 */

export type JurnlRouteRole = 'PARENT' | 'CHILD' | 'GRANDCHILD';

export type JurnlRouteNode = {
  id: string;
  familyId: string;
  name: string;
  role: JurnlRouteRole;
  /** Concrete path the design viewport iframe loads. */
  runtimeRoute: string;
  /** Segment pattern. A token starting with ":" matches one path segment. */
  match: string;
};

const parent = (familyId: string, name: string, route: string): JurnlRouteNode => ({
  id: `${familyId}.00`,
  familyId,
  name,
  role: 'PARENT',
  runtimeRoute: route,
  match: route,
});

const node = (
  id: string,
  familyId: string,
  name: string,
  role: Exclude<JurnlRouteRole, 'PARENT'>,
  match: string,
  runtimeRoute = match,
): JurnlRouteNode => ({ id, familyId, name, role, runtimeRoute, match });

/** Parents are listed so live paths resolve. The route menu already has them from the contract. */
export const JURNL_FAMILY_ROUTE_TREE: readonly JurnlRouteNode[] = [
  parent('F05', 'MONEY', 'money'),
  node('F05.ACCOUNTS', 'F05', 'PLACES', 'CHILD', 'money/places'),
  node('F05.ACCOUNT', 'F05', 'PLACE', 'GRANDCHILD', 'money/places/:placeId', 'money/places/preview'),
  parent('F06', 'INCOME', 'income'),
  node('F06.SOURCE', 'F06', 'SOURCE', 'CHILD', 'income/:sourceId', 'income/preview'),
  parent('F07', 'UPCOMING', 'upcoming'),
  node('F07.ITEM', 'F07', 'ITEM', 'CHILD', 'upcoming/:itemId', 'upcoming/preview'),
  parent('F08', 'PLAN', 'plan'),
  node('F08.ITEM', 'F08', 'INTENTION', 'CHILD', 'plan/:intentionId', 'plan/preview'),
  parent('F09', 'SAFE TO SPEND', 'safe'),
  node('F09.WHY', 'F09', 'WHY THIS NUMBER', 'CHILD', 'safe/why'),
  parent('F10', 'PURCHASES', 'purchases'),
  node('F10.CHECKED', 'F10', 'CHECK A PURCHASE', 'CHILD', 'purchases/checked'),
  node('F10.OBJECT', 'F10', 'PURCHASE', 'CHILD', 'purchases/:purchaseId', 'purchases/preview'),
  parent('F11', 'TRIPS', 'trips'),
  node('F11.TRIP', 'F11', 'TRIP', 'CHILD', 'trips/:tripId', 'trips/preview'),
  parent('F12', 'CREDIT', 'credit'),
  node('F12.ACCOUNT', 'F12', 'ACCOUNT', 'CHILD', 'credit/:accountId', 'credit/preview'),
  parent('F13', 'PAYDOWN', 'paydown'),
  node('F13.WHAT_IF', 'F13', 'WHAT IF', 'CHILD', 'paydown/what-if'),
  parent('F14', 'GOALS', 'goals'),
  node('F14.GOAL', 'F14', 'GOAL', 'CHILD', 'goals/:goalId', 'goals/preview'),
  parent('F15', 'AHEAD', 'ahead'),
  node('F15.BRANCH', 'F15', 'BRANCH', 'CHILD', 'ahead/:branchId', 'ahead/preview'),
  parent('F16', 'RECORDS', 'records'),
  node('F16.DOCUMENT', 'F16', 'DOCUMENT', 'CHILD', 'records/:documentId', 'records/preview'),
];

/** Descendants only. The parent screen stays on the family contract so it is not listed twice. */
export function jurnlFamilyRouteNodes(familyId: string): JurnlRouteNode[] {
  return JURNL_FAMILY_ROUTE_TREE.filter((n) => n.familyId === familyId && n.role !== 'PARENT');
}

export function jurnlFamilyOfScreen(screenId: string): string | null {
  return JURNL_FAMILY_ROUTE_TREE.find((n) => n.id === screenId)?.familyId ?? null;
}

export function jurnlRuntimeRoute(screenId: string): string | null {
  return JURNL_FAMILY_ROUTE_TREE.find((n) => n.id === screenId)?.runtimeRoute ?? null;
}

function matchScore(pattern: string, segments: string[]): number | null {
  const parts = pattern.split('/').filter(Boolean);
  if (parts.length !== segments.length || parts.length === 0) return null;
  let param = false;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]!;
    if (part.startsWith(':')) param = true;
    else if (part !== segments[i]) return null;
  }
  // Longer exact paths beat a param sibling (`purchases/checked` beats `purchases/:purchaseId`).
  return parts.length * 10 - (param ? 1 : 0);
}

/** Best screen for a runtime path. Exact routes outrank a param route of the same length. */
export function jurnlFamilyScreenForPath(path: string): JurnlRouteNode | null {
  const segments = path.replace(/^\/+|\/+$/g, '').split('/').filter(Boolean);
  let best: JurnlRouteNode | null = null;
  let bestScore = -1;
  for (const node of JURNL_FAMILY_ROUTE_TREE) {
    const score = matchScore(node.match, segments);
    if (score != null && score > bestScore) {
      best = node;
      bestScore = score;
    }
  }
  return best;
}
