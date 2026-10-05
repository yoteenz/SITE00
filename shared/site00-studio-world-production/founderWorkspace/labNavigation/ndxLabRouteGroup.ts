/**
 * P0.NAV.1 — NDX Lab route group for bottom-nav active state + navigation hierarchy.
 */

export const NDX_LAB_ROUTE_GROUP = {
  labHub: 'lab-hub',
  experiments: 'experiments',
  experiment01: 'experiment-01',
  characterLab: 'character-lab',
  languageLab: 'language-lab',
  voiceLab: 'voice-lab',
  casting: 'casting',
  continuity: 'continuity',
} as const;

export type NdxLabRouteGroupMember = (typeof NDX_LAB_ROUTE_GROUP)[keyof typeof NDX_LAB_ROUTE_GROUP];

const LAB_HUB_SUFFIX = '/lab';

/** Path segments that belong to the Lab workspace (bottom nav LAB stays active). */
export function isNdxLabRouteGroupPath(pathname: string, projectSlug: string): boolean {
  const normalized = (pathname || '').replace(/\/+$/, '');
  const base = `/projects/${projectSlug}`;
  if (!normalized.startsWith(base)) return false;

  const rest = normalized.slice(base.length);
  if (rest === LAB_HUB_SUFFIX) return true;
  if (rest.startsWith('/experiments')) return true;
  if (rest.startsWith('/marketing-expression')) return true;
  if (rest.startsWith('/character/')) return true;
  return false;
}

export function resolveNdxLabRouteGroupMember(pathname: string, projectSlug: string): NdxLabRouteGroupMember | null {
  if (!isNdxLabRouteGroupPath(pathname, projectSlug)) return null;

  const normalized = pathname.replace(/\/+$/, '');
  const base = `/projects/${projectSlug}`;

  if (normalized === `${base}/lab`) return NDX_LAB_ROUTE_GROUP.labHub;
  if (normalized.includes('/marketing-expression/experiment-01')) return NDX_LAB_ROUTE_GROUP.experiment01;
  if (normalized.includes('/experiments')) return NDX_LAB_ROUTE_GROUP.experiments;
  if (normalized.includes('/character/continuity')) return NDX_LAB_ROUTE_GROUP.continuity;
  if (normalized.includes('/character/casting')) return NDX_LAB_ROUTE_GROUP.casting;
  if (normalized.includes('/character/discovery')) return NDX_LAB_ROUTE_GROUP.characterLab;
  if (normalized.includes('/character/')) return NDX_LAB_ROUTE_GROUP.characterLab;

  return NDX_LAB_ROUTE_GROUP.experiments;
}

export function ndxLabRouteGroupPath(projectSlug: string): string {
  return `/projects/${projectSlug}/lab`;
}
