/**
 * P0.VR.CAPTURE.1R1 — Family root as first-class page target.
 */

import { SITE00_DESIGN_PROJECT_ID } from '../visualReconstruction/p0vr3/constants.js';
import type { DesignViewportClass } from '../visualReconstruction/p0vr2/types.js';
import type { PageFamily, PageFamilyNode, PageFamilyRowInput } from './types.js';

export const SITE00_WEBSITE_ROOT_SCREEN_ID = 'homepage' as const;
export const SITE00_WEBSITE_ROOT_ROUTE = '/' as const;

export function isSite00WebsiteProject(projectId: string): boolean {
  return projectId === SITE00_DESIGN_PROJECT_ID;
}

export const PAGE_ROOT_TYPES = [
  'HOME',
  'LANDING',
  'OVERVIEW',
  'HUB',
  'DASHBOARD',
  'WORKSPACE_ROOT',
  'SECTION_ROOT',
] as const;

export type PageRootType = (typeof PAGE_ROOT_TYPES)[number];

export type PageFamilyRootTarget = {
  projectId: string;
  familyId: string;
  pageId: string;
  canonicalName: string;
  route: string;
  canonicalRoute: string;
  aliases: string[];
  pageType: PageRootType;
  depth: 0;
  isRoot: true;
  screenId: string | null;
  viewportAuthorities: DesignViewportClass[];
  captureState: string;
  designState: string;
  wiringState: string;
  duplicateRootWarning: string | null;
};

export type JumpToPageTarget = {
  nodeId: string;
  label: string;
  route: string;
  level: number;
  isRoot: boolean;
  screenId: string | null;
};

const VIEWPORT_NAME_PATTERN = /\b(DESKTOP|MOBILE|TABLET)\b.*\b(HUB|OVERVIEW)\b/i;

function normalizeRoute(route: string): string {
  const trimmed = route.split('?')[0]?.replace(/\/+$/, '') ?? '';
  return trimmed.toLowerCase() || '/';
}

export function resolveCanonicalRootDisplayName(projectId: string, row?: PageFamilyRowInput | null): string {
  const fallback = `${projectId.toUpperCase()} OVERVIEW`;
  if (!row?.displayName) return fallback;
  const upper = row.displayName.toUpperCase().trim();
  if (VIEWPORT_NAME_PATTERN.test(upper)) return fallback;
  if (upper.includes(' DESKTOP ') || upper.startsWith('DESKTOP ')) return fallback;
  if (upper === 'DESKTOP OVERVIEW HUB') return fallback;
  if (upper === 'OVERVIEW') return fallback;
  if (!upper.includes(projectId.toUpperCase())) return fallback;
  return upper;
}

export function inferPageRootType(route: string, projectId: string): PageRootType {
  const r = route.toLowerCase();
  const prefix = `/projects/${projectId.toLowerCase()}`;
  if (r === prefix || r.endsWith('/overview')) return 'OVERVIEW';
  if (r.includes('/dashboard')) return 'DASHBOARD';
  if (r.includes('/workspace')) return 'WORKSPACE_ROOT';
  if (r === '/' || r.endsWith('/home')) return 'HOME';
  if (r.includes('/landing')) return 'LANDING';
  if (r.includes('/hub')) return 'HUB';
  return 'SECTION_ROOT';
}

export function resolveCanonicalRootRoute(
  projectId: string,
  rows: PageFamilyRowInput[],
): {
  canonicalRoute: string;
  aliases: string[];
  rootRow: PageFamilyRowInput | undefined;
  duplicateRootWarning: string | null;
} {
  if (isSite00WebsiteProject(projectId)) {
    const homepageRow =
      rows.find((row) => row.screenId === SITE00_WEBSITE_ROOT_SCREEN_ID) ??
      rows.find((row) => normalizeRoute(row.normalizedRoute ?? row.route ?? '') === SITE00_WEBSITE_ROOT_ROUTE);
    return {
      canonicalRoute: SITE00_WEBSITE_ROOT_ROUTE,
      aliases: [],
      rootRow: homepageRow,
      duplicateRootWarning: null,
    };
  }

  const projectPrefix = `/projects/${projectId}`.toLowerCase();
  const overviewAlias = `${projectPrefix}/overview`;
  const rowByRoute = new Map<string, PageFamilyRowInput>();

  for (const row of rows) {
    const route = normalizeRoute(row.normalizedRoute ?? row.route ?? '');
    if (route.startsWith(projectPrefix) || route === projectPrefix) {
      rowByRoute.set(route, row);
    }
  }

  const hasRoot = rowByRoute.has(projectPrefix);
  const hasOverview = rowByRoute.has(overviewAlias);
  const aliases: string[] = [];

  if (hasRoot && hasOverview) {
    aliases.push(overviewAlias);
    return {
      canonicalRoute: projectPrefix,
      aliases,
      rootRow: rowByRoute.get(projectPrefix) ?? rowByRoute.get(overviewAlias),
      duplicateRootWarning: `DUPLICATE_ROOT:${projectPrefix}|${overviewAlias}`,
    };
  }

  if (hasRoot) {
    return {
      canonicalRoute: projectPrefix,
      aliases,
      rootRow: rowByRoute.get(projectPrefix),
      duplicateRootWarning: null,
    };
  }

  if (hasOverview) {
    aliases.push(overviewAlias);
    return {
      canonicalRoute: projectPrefix,
      aliases,
      rootRow: rowByRoute.get(overviewAlias),
      duplicateRootWarning: null,
    };
  }

  return {
    canonicalRoute: projectPrefix,
    aliases,
    rootRow: undefined,
    duplicateRootWarning: null,
  };
}

export function isRootAliasRoute(route: string, _projectId: string, aliases: string[]): boolean {
  const normalized = normalizeRoute(route);
  return aliases.some((a) => normalizeRoute(a) === normalized);
}

export function resolveRootScreenId(projectId: string, rootRow?: PageFamilyRowInput | null): string {
  if (rootRow?.screenId && rootRow.screenId !== 'desktop-overview') {
    return rootRow.screenId;
  }
  if (isSite00WebsiteProject(projectId)) {
    return SITE00_WEBSITE_ROOT_SCREEN_ID;
  }
  return 'overview';
}

export function buildPageId(projectId: string, route: string): string {
  return `${projectId}:${normalizeRoute(route)}`;
}

export function buildPageFamilyRootTarget(input: {
  family: PageFamily;
  rows: PageFamilyRowInput[];
  rootNode: PageFamilyNode;
}): PageFamilyRootTarget {
  const { canonicalRoute, aliases, rootRow, duplicateRootWarning } = resolveCanonicalRootRoute(
    input.family.projectId,
    input.rows,
  );
  const screenId = resolveRootScreenId(input.family.projectId, rootRow ?? undefined);
  const pageId = buildPageId(input.family.projectId, canonicalRoute);

  return {
    projectId: input.family.projectId,
    familyId: input.family.familyId,
    pageId,
    canonicalName: resolveCanonicalRootDisplayName(input.family.projectId, rootRow ?? undefined),
    route: canonicalRoute,
    canonicalRoute,
    aliases,
    pageType: inferPageRootType(canonicalRoute, input.family.projectId),
    depth: 0,
    isRoot: true,
    screenId,
    viewportAuthorities: ['mobile', 'desktop', 'tablet'],
    captureState: input.rootNode.captureStatus,
    designState: input.rootNode.designStatus,
    wiringState: input.rootNode.linkageStatus,
    duplicateRootWarning,
  };
}

export function listJumpToPageTargets(family: PageFamily): JumpToPageTarget[] {
  const sorted = [...family.nodes].sort((a, b) => {
    if (a.level !== b.level) return a.level - b.level;
    return a.route.localeCompare(b.route);
  });

  return sorted.map((node) => ({
    nodeId: node.nodeId,
    label: node.level === 0 ? node.label : node.label,
    route: node.route,
    level: node.level,
    isRoot: node.level === 0,
    screenId: node.screenId,
  }));
}

export function defaultSelectedNodeId(family: PageFamily, savedNodeId?: string | null): string {
  const root = family.nodes.find((n) => n.level === 0);
  if (savedNodeId && family.nodes.some((n) => n.nodeId === savedNodeId)) {
    return savedNodeId;
  }
  return root?.nodeId ?? family.nodes[0]?.nodeId ?? '';
}

export function resolveReviewStepLabel(node: PageFamilyNode | null | undefined): string {
  if (!node) return 'REVIEW PAGE';
  if (node.level === 0) return 'REVIEW PAGE';
  if (node.level === 1) return 'REVIEW CHILD';
  return 'REVIEW PAGE';
}

export function migrateHistoricalRootCapturePageId(
  projectId: string,
  legacyPageId: string,
): string {
  const canonical = resolveCanonicalRootRoute(projectId, []);
  const projectPrefix = `/projects/${projectId}`.toLowerCase();
  const suffix = legacyPageId.includes(':') ? legacyPageId.split(':').slice(1).join(':') : legacyPageId;
  const normalizedSuffix = normalizeRoute(suffix.startsWith('/') ? suffix : `/${suffix}`);
  const lower = suffix.toLowerCase();
  if (
    normalizedSuffix === projectPrefix ||
    normalizedSuffix === `${projectPrefix}/overview` ||
    (isSite00WebsiteProject(projectId) &&
      (normalizedSuffix === SITE00_WEBSITE_ROOT_ROUTE || lower === SITE00_WEBSITE_ROOT_SCREEN_ID)) ||
    lower === 'overview' ||
    lower === 'root' ||
    lower === 'desktop-overview' ||
    lower === 'desktop overview hub'
  ) {
    return buildPageId(projectId, canonical.canonicalRoute);
  }
  return legacyPageId;
}
