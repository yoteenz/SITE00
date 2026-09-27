/**
 * P0.VR.NDXBOOK-PAGE-FAMILY-HIERARCHY-DISCOVERY-AND-INGESTION-FIX1
 */

import {
  buildProjectDesignPageRegistry,
  getDesignBoundPage,
  NDXBOOK_CANONICAL_PAGE_FAMILY_SCREEN_IDS,
} from '../designProjectBinding/designPageRegistry.js';
import type { DesignBoundPageRecord } from '../designProjectBinding/types.js';
import { discoverProjectRoutes } from '../../site00-studio-world-production/visualReconstruction/p0vr8/routeDiscoveryService.js';
import { listDesignScreensForProject } from '../../site00-studio-world-production/visualReconstruction/p0vr2/designScreenRegistry.js';

export type HierarchyDiscoveryStatus = 'NOT_RUN' | 'RUNNING' | 'RESOLVED' | 'INCOMPLETE' | 'FAILED';

export type PageInventoryClassification =
  | 'CANONICAL'
  | 'LEGACY'
  | 'SUPERSEDED'
  | 'DEPRECATED'
  | 'ORPHANED';

export type NdxbookPageInventoryEntry = {
  pageId: string;
  pageName: string;
  route: string;
  parentPageId: string | null;
  depth: number;
  sourceRegistry: 'DESIGN_BOUND' | 'ROUTE_DISCOVERY' | 'MERGED';
  status: PageInventoryClassification;
  isCanonical: boolean;
  functionRole: string;
  screenId: string;
};

export type PageFamilyHierarchyDiagnostics = {
  routeRegistryPageCount: number;
  projectNavPageCount: number;
  pageSystemReviewPageCount: number;
  pageFamilyBlueprintPageCount: number;
  canonicalResolvedPageCount: number;
};

export type PageFamilyHierarchyReceipt = {
  hierarchyDiscoveryStatus: HierarchyDiscoveryStatus;
  diagnostics: PageFamilyHierarchyDiagnostics;
  parentPageCount: number;
  childPageCount: number;
  grandchildPageCount: number;
  deeperDescendantCount: number;
  totalPageCount: number;
  childPages: readonly string[];
  grandchildPages: readonly string[];
  deeperDescendants: readonly string[];
  sourceCountReconciled: 'PASS' | 'FAIL';
  blockedReason: string | null;
};

export type CanonicalPageFamilyLayout = {
  discoveryStatus: HierarchyDiscoveryStatus;
  anchorPageId: string;
  anchorPageName: string;
  inventory: readonly NdxbookPageInventoryEntry[];
  /** Descendant cards aligned with Page System Review (depth 1 / 2 relative to anchor). */
  children: readonly DesignBoundPageRecord[];
  grandchildren: readonly DesignBoundPageRecord[];
  deeperDescendants: readonly DesignBoundPageRecord[];
  familyDepthByPageId: Readonly<Record<string, 0 | 1 | 2>>;
  absoluteDepthByPageId: Readonly<Record<string, number>>;
  diagnostics: PageFamilyHierarchyDiagnostics;
  receipt: PageFamilyHierarchyReceipt;
};

const DEPRECATED_SCREEN_IDS = new Set(['desktop-overview']);

/** Same parent resolution as designProjectLibraries (declared parent, then route prefix). */
export function resolveDesignPageParent(
  page: DesignBoundPageRecord,
  all: readonly DesignBoundPageRecord[],
): DesignBoundPageRecord | null {
  if (page.parentPageId) {
    const declared = all.find((candidate) => candidate.pageId === page.parentPageId);
    if (declared) return declared;
  }
  let best: DesignBoundPageRecord | null = null;
  for (const candidate of all) {
    if (candidate.pageId === page.pageId) continue;
    if (!page.route.startsWith(`${candidate.route}/`)) continue;
    if (!best || candidate.route.length > best.route.length) best = candidate;
  }
  return best;
}

function classifyPage(page: DesignBoundPageRecord): PageInventoryClassification {
  if (DEPRECATED_SCREEN_IDS.has(page.screenId)) return 'DEPRECATED';
  if (page.mirrorStatus === 'REMOVED') return 'LEGACY';
  if (!page.isConceptOrphan && page.mirrorStatus === 'ROUTE_MISSING') return 'ORPHANED';
  return 'CANONICAL';
}

function absoluteDepth(
  page: DesignBoundPageRecord,
  parentById: ReadonlyMap<string, DesignBoundPageRecord | null>,
): number {
  let depth = 0;
  let cursor: DesignBoundPageRecord | null = page;
  const seen = new Set<string>();
  while (cursor && depth < 12) {
    if (seen.has(cursor.pageId)) break;
    seen.add(cursor.pageId);
    const parent: DesignBoundPageRecord | null = parentById.get(cursor.pageId) ?? null;
    if (!parent) break;
    depth += 1;
    cursor = parent;
  }
  return depth;
}

function isDescendantOfAnchor(
  anchor: DesignBoundPageRecord,
  page: DesignBoundPageRecord,
  parentById: ReadonlyMap<string, DesignBoundPageRecord | null>,
): boolean {
  let cursor: DesignBoundPageRecord | null = page;
  const seen = new Set<string>();
  while (cursor && seen.size < 12) {
    if (cursor.pageId === anchor.pageId) return true;
    if (seen.has(cursor.pageId)) break;
    seen.add(cursor.pageId);
    cursor = parentById.get(cursor.pageId) ?? null;
  }
  return false;
}

function familyDepthRelativeToAnchor(
  anchor: DesignBoundPageRecord,
  page: DesignBoundPageRecord,
  parentById: ReadonlyMap<string, DesignBoundPageRecord | null>,
): 0 | 1 | 2 | 3 {
  if (page.pageId === anchor.pageId) return 0;
  if (!isDescendantOfAnchor(anchor, page, parentById)) return 3;

  let steps = 0;
  let cursor: DesignBoundPageRecord | null = page;
  const seen = new Set<string>();
  while (cursor && cursor.pageId !== anchor.pageId && seen.size < 12) {
    if (seen.has(cursor.pageId)) break;
    seen.add(cursor.pageId);
    const parent = parentById.get(cursor.pageId) ?? null;
    if (!parent) return 3;
    steps += 1;
    cursor = parent;
  }
  if (cursor?.pageId !== anchor.pageId) return 3;
  if (steps === 1) return 1;
  if (steps === 2) return 2;
  return 2;
}

function buildInventory(
  pages: readonly DesignBoundPageRecord[],
  parentById: ReadonlyMap<string, DesignBoundPageRecord | null>,
): NdxbookPageInventoryEntry[] {
  return pages.map((page) => {
    const classification = classifyPage(page);
    const parent = parentById.get(page.pageId) ?? null;
    return {
      pageId: page.pageId,
      pageName: page.pageName,
      route: page.route,
      parentPageId: parent?.pageId ?? null,
      depth: absoluteDepth(page, parentById),
      sourceRegistry: 'DESIGN_BOUND',
      status: classification,
      isCanonical: classification === 'CANONICAL',
      functionRole: page.pageRole,
      screenId: page.screenId,
    };
  });
}

function filterScreensToPageFamilyCohort(
  projectId: string,
  screens: readonly { screenId: string }[],
): readonly { screenId: string }[] {
  if (projectId !== 'ndxbook') return screens;
  return screens.filter((s) => NDXBOOK_CANONICAL_PAGE_FAMILY_SCREEN_IDS.has(s.screenId));
}

function canonicalFamilyRecords(
  projectId: string,
  registry: readonly DesignBoundPageRecord[],
): DesignBoundPageRecord[] {
  let records = registry.filter((p) => classifyPage(p) === 'CANONICAL');
  if (projectId === 'ndxbook') {
    records = records.filter((p) => NDXBOOK_CANONICAL_PAGE_FAMILY_SCREEN_IDS.has(p.screenId));
  }
  return records;
}

function countSources(projectId: string, canonicalPages: readonly DesignBoundPageRecord[]): PageFamilyHierarchyDiagnostics {
  const routeScreens = filterScreensToPageFamilyCohort(
    projectId,
    discoverProjectRoutes(projectId, { screenSetMode: 'PRIMARY' }).filter(
      (s) => !DEPRECATED_SCREEN_IDS.has(s.screenId),
    ),
  );
  const navScreens = filterScreensToPageFamilyCohort(
    projectId,
    listDesignScreensForProject(projectId, true).filter((s) => !DEPRECATED_SCREEN_IDS.has(s.screenId)),
  );
  return {
    routeRegistryPageCount: routeScreens.length,
    projectNavPageCount: navScreens.length,
    pageSystemReviewPageCount: 0,
    pageFamilyBlueprintPageCount: 0,
    canonicalResolvedPageCount: canonicalPages.length,
  };
}

function reconcileSourceCounts(diagnostics: PageFamilyHierarchyDiagnostics): 'PASS' | 'FAIL' {
  const { routeRegistryPageCount, projectNavPageCount, canonicalResolvedPageCount } = diagnostics;
  if (canonicalResolvedPageCount === 0) return 'FAIL';
  if (routeRegistryPageCount !== canonicalResolvedPageCount) return 'FAIL';
  if (projectNavPageCount !== canonicalResolvedPageCount) return 'FAIL';
  return 'PASS';
}

export function discoverProjectPageFamilyLayout(
  projectId: string,
  anchorPageId: string,
): CanonicalPageFamilyLayout {
  const registry = buildProjectDesignPageRegistry(projectId).filter((p) => !p.isConceptOrphan);
  const canonicalRecords = canonicalFamilyRecords(projectId, registry);
  const parentById = new Map<string, DesignBoundPageRecord | null>(
    canonicalRecords.map((p) => [p.pageId, resolveDesignPageParent(p, canonicalRecords)]),
  );

  const anchor =
    getDesignBoundPage(projectId, anchorPageId) ??
    canonicalRecords.find((p) => p.pageId === anchorPageId) ??
    null;

  if (!anchor || !canonicalRecords.some((p) => p.pageId === anchor.pageId)) {
    const diagnostics = countSources(projectId, canonicalRecords);
    return {
      discoveryStatus: 'FAILED',
      anchorPageId,
      anchorPageName: anchor?.pageName ?? anchorPageId,
      inventory: [],
      children: [],
      grandchildren: [],
      deeperDescendants: [],
      familyDepthByPageId: {},
      absoluteDepthByPageId: {},
      diagnostics,
      receipt: {
        hierarchyDiscoveryStatus: 'FAILED',
        diagnostics,
        parentPageCount: 0,
        childPageCount: 0,
        grandchildPageCount: 0,
        deeperDescendantCount: 0,
        totalPageCount: 0,
        childPages: [],
        grandchildPages: [],
        deeperDescendants: [],
        sourceCountReconciled: 'FAIL',
        blockedReason: 'ANCHOR_PAGE_NOT_IN_CANONICAL_INVENTORY',
      },
    };
  }

  const inventory = buildInventory(canonicalRecords, parentById);
  const familyDepthByPageId: Record<string, 0 | 1 | 2> = {};
  const absoluteDepthByPageId: Record<string, number> = {};
  const children: DesignBoundPageRecord[] = [];
  const grandchildren: DesignBoundPageRecord[] = [];
  const deeperDescendants: DesignBoundPageRecord[] = [];

  for (const page of canonicalRecords) {
    absoluteDepthByPageId[page.pageId] = absoluteDepth(page, parentById);
    const rel = familyDepthRelativeToAnchor(anchor, page, parentById);
    if (rel === 0) {
      familyDepthByPageId[page.pageId] = 0;
      continue;
    }
    if (rel === 1) {
      familyDepthByPageId[page.pageId] = 1;
      children.push(page);
      continue;
    }
    if (rel === 2) {
      familyDepthByPageId[page.pageId] = 2;
      grandchildren.push(page);
      continue;
    }
    familyDepthByPageId[page.pageId] = 2;
    deeperDescendants.push(page);
  }

  const diagnostics = countSources(projectId, canonicalRecords);
  diagnostics.pageSystemReviewPageCount = canonicalRecords.length;
  diagnostics.pageFamilyBlueprintPageCount = canonicalRecords.length;

  const childPages = children.map((p) => p.pageName).sort();
  const grandchildPages = grandchildren
    .map((p) => {
      const parent = parentById.get(p.pageId);
      return `${parent?.pageName ?? 'parent'} → ${p.pageName}`;
    })
    .sort();
  const deeperList =
    deeperDescendants.length === 0 ?
      (['NONE'] as const)
    : deeperDescendants.map((p) => `${parentById.get(p.pageId)?.pageName ?? '?'} → ${p.pageName}`).sort();

  let discoveryStatus: HierarchyDiscoveryStatus = 'RESOLVED';
  let blockedReason: string | null = null;

  const sourceCountReconciled = reconcileSourceCounts(diagnostics);
  if (sourceCountReconciled === 'FAIL') {
    discoveryStatus = 'INCOMPLETE';
    blockedReason = 'PAGE_FAMILY_SOURCE_DIVERGENCE';
  }

  const routeHasMultiple = diagnostics.routeRegistryPageCount >= 2;
  const suspiciousZeroChildren = routeHasMultiple && children.length === 0 && canonicalRecords.length >= 2;
  if (suspiciousZeroChildren) {
    discoveryStatus = 'INCOMPLETE';
    blockedReason = 'PAGE_FAMILY_HIERARCHY_MISMATCH';
  }

  const receipt: PageFamilyHierarchyReceipt = {
    hierarchyDiscoveryStatus: discoveryStatus,
    diagnostics,
    parentPageCount: 1,
    childPageCount: children.length,
    grandchildPageCount: grandchildren.length,
    deeperDescendantCount: deeperDescendants.length,
    totalPageCount: canonicalRecords.length,
    childPages,
    grandchildPages,
    deeperDescendants: [...deeperList],
    sourceCountReconciled,
    blockedReason,
  };

  return {
    discoveryStatus,
    anchorPageId: anchor.pageId,
    anchorPageName: anchor.pageName,
    inventory,
    children,
    grandchildren,
    deeperDescendants,
    familyDepthByPageId,
    absoluteDepthByPageId,
    diagnostics,
    receipt,
  };
}

export function assertPageFamilyHierarchyResolved(layout: CanonicalPageFamilyLayout): void {
  if (layout.discoveryStatus !== 'RESOLVED') {
    throw new Error(layout.receipt.blockedReason ?? 'PAGE_FAMILY_HIERARCHY_INCOMPLETE');
  }
  if (layout.receipt.sourceCountReconciled === 'FAIL') {
    throw new Error('PAGE_FAMILY_SOURCE_DIVERGENCE');
  }
}
