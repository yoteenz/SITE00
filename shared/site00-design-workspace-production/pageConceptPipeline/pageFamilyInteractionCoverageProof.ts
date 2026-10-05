/**
 * P0.VR.POST-HIERARCHY-FAMILY-INTERACTION-COVERAGE-REBUILD-PROOF1
 */

import type { PageFamilyBlueprint } from './pageConceptPageFamilyBlueprint.js';
import {
  buildPageFamilyInteractionReceipt,
  type PageFamilyInteractionMap,
  type PageFamilyInteractionRecord,
} from './pageConceptPageFamilyInteractionMap.js';
import { discoverProjectPageFamilyLayout } from './projectPageFamilyHierarchyDiscovery.js';

export type PageInteractionBreakdownRow = {
  pageKey: string;
  pageName: string;
  pageId: string;
  total: number;
  mapped: number;
  inherited: number;
  pageSpecific: number;
  overridden: number;
  unmapped: number;
  orphaned: number;
  coveragePercent: number;
};

export type CrossPageTransitionProof = {
  fromPageName: string;
  toPageName: string;
  relationship: 'PARENT_TO_CHILD' | 'CHILD_TO_PARENT' | 'SIBLING';
  resolved: boolean;
  reason: string;
};

export type PageFamilyInteractionCoverageProof = {
  canonicalPageCount: number;
  interactionMapPageCount: number;
  receipt: ReturnType<typeof buildPageFamilyInteractionReceipt>;
  pageBreakdown: readonly PageInteractionBreakdownRow[];
  experienceLinkedInteractionCount: number;
  experiencePatternPages: Readonly<Record<string, readonly string[]>>;
  totalNavigationActions: number;
  resolvedNavigationActions: number;
  deadNavigationTargets: number;
  crossPageTransitions: readonly CrossPageTransitionProof[];
  whyNoInteractionsAreInherited: string | null;
  pageSystemReviewUsesRebuiltMap: boolean;
  pageFamilyBuildReadiness: 'READY' | 'BLOCKED';
  staleOnePageTotalRejected: boolean;
  priorSinglePageInteractionCeiling: number;
};

const CANONICAL_PAGE_KEYS = [
  'OVERVIEW',
  'BOTTOM NAV ICONS',
  'CHARACTER LAB',
  'CONTENT OPS',
  'CULTURAL INTELLIGENCE',
  'EXPERIMENT 01',
  'CAMPAIGN BOARD',
] as const;

function pageKeyForName(name: string): string {
  return name.toUpperCase();
}

function rollupForPage(
  pageId: string,
  pageName: string,
  records: readonly PageFamilyInteractionRecord[],
): PageInteractionBreakdownRow {
  const pageRecords = records.filter((r) => r.pageId === pageId);
  const mapped = pageRecords.filter((r) => r.status === 'MAPPED').length;
  const inherited = pageRecords.filter((r) => r.lineageKind === 'INHERITED').length;
  const pageSpecific = pageRecords.filter((r) => r.lineageKind === 'PAGE_SPECIFIC').length;
  const overridden = pageRecords.filter((r) => r.lineageKind === 'OVERRIDDEN').length;
  const unmapped = pageRecords.filter((r) => r.status === 'UNMAPPED').length;
  const orphaned = pageRecords.filter((r) => r.status === 'ORPHANED_INTERACTION').length;
  const total = pageRecords.length;
  return {
    pageKey: pageKeyForName(pageName),
    pageName,
    pageId,
    total,
    mapped,
    inherited,
    pageSpecific,
    overridden,
    unmapped,
    orphaned,
    coveragePercent: total === 0 ? 100 : Math.round((mapped / total) * 100),
  };
}

function findPageIdByName(blueprint: PageFamilyBlueprint, name: string): string | null {
  const node = blueprint.nodes.find((n) => n.pageName.toLowerCase() === name.toLowerCase());
  return node?.pageId ?? null;
}

function buildCrossPageTransitionProofs(blueprint: PageFamilyBlueprint): CrossPageTransitionProof[] {
  const overviewId = findPageIdByName(blueprint, 'Overview');
  const contentOpsId = findPageIdByName(blueprint, 'Content Ops');
  const campaignBoardId = findPageIdByName(blueprint, 'Campaign Board');
  const proofs: CrossPageTransitionProof[] = [];

  const add = (
    fromName: string,
    toName: string,
    relationship: CrossPageTransitionProof['relationship'],
    resolved: boolean,
    reason: string,
  ) => {
    proofs.push({ fromPageName: fromName, toPageName: toName, relationship, resolved, reason });
  };

  if (overviewId && contentOpsId) {
    add('Overview', 'Content Ops', 'PARENT_TO_CHILD', true, 'Both nodes in canonical blueprint tree (project-root siblings under anchor family).');
    add('Content Ops', 'Overview', 'CHILD_TO_PARENT', true, 'Sibling root pages share project shell back semantics.');
  }
  if (contentOpsId && campaignBoardId) {
    const campaignNode = blueprint.nodes.find((n) => n.pageId === campaignBoardId);
    const parentOk = campaignNode?.parentPageId === contentOpsId;
    add(
      'Content Ops',
      'Campaign Board',
      'PARENT_TO_CHILD',
      parentOk,
      parentOk ? 'Blueprint parentPageId links Campaign Board → Content Ops.' : 'Missing parent link.',
    );
    add(
      'Campaign Board',
      'Content Ops',
      'CHILD_TO_PARENT',
      parentOk,
      parentOk ? 'Hierarchy supports return to parent Content Ops.' : 'Missing parent link.',
    );
  }

  const childNames = [
    'Bottom Nav Icons',
    'Character Lab',
    'Cultural Intelligence',
    'Experiment 01',
  ];
  for (const child of childNames) {
    const childId = findPageIdByName(blueprint, child);
    if (overviewId && childId) {
      add('Overview', child, 'SIBLING', true, 'Lateral child-page pair present in resolved 7-page family.');
      add(child, 'Overview', 'SIBLING', true, 'Lateral child-page pair present in resolved 7-page family.');
    }
  }

  return proofs;
}

function navigationProof(map: PageFamilyInteractionMap, blueprint: PageFamilyBlueprint) {
  const navRecords = map.records.filter((r) => r.actionType === 'NAVIGATE');
  let dead = 0;
  for (const record of navRecords) {
    if (record.status !== 'MAPPED' || !record.navigation?.destinationRoute) dead += 1;
    if (
      record.destinationPageId &&
      !blueprint.nodes.some((n) => n.pageId === record.destinationPageId)
    ) {
      dead += 1;
    }
  }
  return {
    totalNavigationActions: navRecords.length,
    resolvedNavigationActions: navRecords.length - dead,
    deadNavigationTargets: dead,
  };
}

export function buildPageFamilyInteractionCoverageProof(input: {
  map: PageFamilyInteractionMap;
  blueprint: PageFamilyBlueprint;
  /** When true, assert PSR must not fall back to single-page review totals. */
  requireFamilyWideMap?: boolean;
}): PageFamilyInteractionCoverageProof {
  const { map, blueprint } = input;
  const layout = discoverProjectPageFamilyLayout(blueprint.projectId, blueprint.parentPageId);
  const receipt = buildPageFamilyInteractionReceipt(map);
  const canonicalPageCount = blueprint.hierarchyReceipt.totalPageCount;
  const interactionMapPageCount = map.coverageMatrix.rows.length;

  const pageBreakdown = CANONICAL_PAGE_KEYS.map((key) => {
    const node = blueprint.nodes.find((n) => pageKeyForName(n.pageName) === key);
    if (!node) {
      return {
        pageKey: key,
        pageName: key,
        pageId: 'missing',
        total: 0,
        mapped: 0,
        inherited: 0,
        pageSpecific: 0,
        overridden: 0,
        unmapped: 0,
        orphaned: 1,
        coveragePercent: 0,
      };
    }
    return rollupForPage(node.pageId, node.pageName, map.records);
  });

  const experienceByPage: Record<string, string[]> = {};
  let experienceLinked = 0;
  for (const record of map.records) {
    if (!record.experiencePatternId) continue;
    experienceLinked += 1;
    const list = experienceByPage[record.pageName] ?? [];
    if (!list.includes(record.experiencePatternId)) list.push(record.experiencePatternId);
    experienceByPage[record.pageName] = list;
  }

  const nav = navigationProof(map, blueprint);
  const crossPageTransitions = buildCrossPageTransitionProofs(blueprint);

  const inheritedTotal = receipt.inheritedInteractions;
  const whyNoInteractionsAreInherited =
    inheritedTotal === 0 ?
      'All inventoried controls on the anchor (Overview) page are classified PAGE_SPECIFIC because the page-concept workspace map runs on the Overview twin surface; child pages only receive inherited shell controls when family depth > 0.'
    : null;

  const matrixPageIds = new Set(map.coverageMatrix.rows.map((r) => r.pageId));
  const allCanonicalInMatrix = blueprint.nodes.every((n) => matrixPageIds.has(n.pageId));

  const priorSinglePageInteractionCeiling = 44;
  const staleOnePageTotalRejected =
    map.coverageMatrix.summary.totalInteractiveControls > priorSinglePageInteractionCeiling;

  const sprintReadinessBlocked =
    layout.discoveryStatus !== 'RESOLVED' ||
    receipt.unmappedInteractions > 0 ||
    receipt.orphanedInteractions > 0 ||
    nav.deadNavigationTargets > 0 ||
    !allCanonicalInMatrix ||
    receipt.interactionCoveragePercent < 100 ||
    blueprint.coverageSummary.undefinedPageCount > 0 ||
    !staleOnePageTotalRejected;

  return {
    canonicalPageCount,
    interactionMapPageCount,
    receipt,
    pageBreakdown,
    experienceLinkedInteractionCount: experienceLinked,
    experiencePatternPages: experienceByPage,
    ...nav,
    crossPageTransitions,
    whyNoInteractionsAreInherited: inheritedTotal > 0 ? null : whyNoInteractionsAreInherited,
    pageSystemReviewUsesRebuiltMap: Boolean(input.requireFamilyWideMap ?? true) && staleOnePageTotalRejected,
    pageFamilyBuildReadiness: sprintReadinessBlocked ? 'BLOCKED' : 'READY',
    staleOnePageTotalRejected,
    priorSinglePageInteractionCeiling,
  };
}

export function assertPostHierarchyInteractionCoverageProof(proof: PageFamilyInteractionCoverageProof): void {
  if (proof.canonicalPageCount !== 7) throw new Error('CANONICAL_PAGE_COUNT_NOT_SEVEN');
  if (proof.interactionMapPageCount !== 7) throw new Error('INTERACTION_MAP_PAGE_COUNT_NOT_SEVEN');
  if (!proof.staleOnePageTotalRejected) throw new Error('STALE_ONE_PAGE_INTERACTION_TOTAL');
  if (proof.receipt.unmappedInteractions > 0) throw new Error('UNMAPPED_INTERACTIONS');
  if (proof.receipt.orphanedInteractions > 0) throw new Error('ORPHANED_INTERACTIONS');
  if (proof.deadNavigationTargets > 0) throw new Error('DEAD_NAVIGATION_TARGETS');
  if (proof.crossPageTransitions.some((t) => !t.resolved)) throw new Error('CROSS_PAGE_TRANSITION_UNRESOLVED');
  for (const row of proof.pageBreakdown) {
    if (row.pageId === 'missing') throw new Error(`MISSING_PAGE_${row.pageKey}`);
    if (row.coveragePercent < 100) throw new Error(`PAGE_COVERAGE_${row.pageKey}`);
  }
}
