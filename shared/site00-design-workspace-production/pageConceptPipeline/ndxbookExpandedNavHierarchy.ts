/**
 * P0.VR.EXPANDED-NAV-HIERARCHY-REFINEMENT1 — canonical MENU / EXPANDED NAV tree for NDXBOOK Overview.
 */

import { discoverProjectPageFamilyLayout } from './projectPageFamilyHierarchyDiscovery.js';
import type { ContentManifestItem } from './experienceContentManifest.js';

/** Approved sibling order for expanded project navigation (depth-1 under Overview anchor). */
export const NDXBOOK_OVERVIEW_EXPANDED_NAV_CHILD_SCREEN_ORDER = [
  'experiment-01',
  'content-ops',
  'character-lab',
  'cultural-intelligence',
  'bottom-nav-icons',
] as const;

export type ExpandedNavHierarchyTier = 'ANCHOR' | 'CHILD' | 'GRANDCHILD';

export type ExpandedNavHierarchyEntry = {
  pageId: string;
  screenId: string;
  label: string;
  tier: ExpandedNavHierarchyTier;
  parentScreenId: string | null;
  /** Top-level index (001–006) — null for nested grandchild rows. */
  topLevelIndex: string | null;
  /** Full line for FAL / founder QA (includes indent). */
  promptLine: string;
};

export type ExpandedNavHierarchyReceipt = {
  anchorLabel: string;
  entries: readonly ExpandedNavHierarchyEntry[];
  hierarchyLines: readonly string[];
  contentOpsParentVisible: boolean;
  campaignBoardNested: boolean;
  campaignBoardTopLevel: boolean;
  canonicalPageFamilyMatch: boolean;
};

function padIndex(n: number): string {
  return String(n).padStart(3, '0');
}

function childOrderRank(screenId: string): number {
  const idx = NDXBOOK_OVERVIEW_EXPANDED_NAV_CHILD_SCREEN_ORDER.indexOf(
    screenId as (typeof NDXBOOK_OVERVIEW_EXPANDED_NAV_CHILD_SCREEN_ORDER)[number],
  );
  return idx >= 0 ? idx : 100 + screenId.localeCompare('');
}

export function buildNdxbookOverviewExpandedNavHierarchy(
  projectId: string,
  anchorPageId: string,
): ExpandedNavHierarchyReceipt {
  const layout = discoverProjectPageFamilyLayout(projectId, anchorPageId);
  const anchor =
    layout.inventory.find((p) => p.pageId === anchorPageId) ??
    layout.inventory.find((p) => p.screenId === 'overview') ??
    null;
  const anchorLabel = (anchor?.pageName ?? layout.anchorPageName ?? 'OVERVIEW').toUpperCase();

  const children = [...layout.children].sort(
    (a, b) => childOrderRank(a.screenId) - childOrderRank(b.screenId),
  );
  const grandchildren = [...layout.grandchildren, ...layout.deeperDescendants];

  const entries: ExpandedNavHierarchyEntry[] = [];
  const hierarchyLines: string[] = [];

  let topCounter = 1;
  entries.push({
    pageId: anchor?.pageId ?? anchorPageId,
    screenId: anchor?.screenId ?? 'overview',
    label: anchorLabel,
    tier: 'ANCHOR',
    parentScreenId: null,
    topLevelIndex: padIndex(topCounter),
    promptLine: `${padIndex(topCounter)} ${anchorLabel}`,
  });
  hierarchyLines.push(`${padIndex(topCounter)} ${anchorLabel}`);
  topCounter += 1;

  for (const child of children) {
    const label = child.pageName.toUpperCase();
    const index = padIndex(topCounter);
    entries.push({
      pageId: child.pageId,
      screenId: child.screenId,
      label,
      tier: 'CHILD',
      parentScreenId: anchor?.screenId ?? null,
      topLevelIndex: index,
      promptLine: `${index} ${label}`,
    });
    hierarchyLines.push(`${index} ${label}`);
    topCounter += 1;

    const nested = grandchildren
      .filter((g) => {
        const invParent = layout.inventory.find((i) => i.pageId === g.pageId)?.parentPageId;
        return g.parentPageId === child.pageId || invParent === child.pageId;
      })
      .sort((a, b) => a.pageName.localeCompare(b.pageName));

    for (const grand of nested) {
      const gLabel = grand.pageName.toUpperCase();
      const line = `    └ ${gLabel}`;
      entries.push({
        pageId: grand.pageId,
        screenId: grand.screenId,
        label: gLabel,
        tier: 'GRANDCHILD',
        parentScreenId: child.screenId,
        topLevelIndex: null,
        promptLine: line,
      });
      hierarchyLines.push(line);
    }
  }

  const contentOps = entries.find((e) => e.screenId === 'content-ops' && e.tier === 'CHILD');
  const campaignBoard = entries.find((e) => e.screenId === 'campaign-board');
  const campaignBoardNested =
    Boolean(campaignBoard?.tier === 'GRANDCHILD' && campaignBoard.parentScreenId === 'content-ops');
  const campaignBoardTopLevel = entries.some(
    (e) => e.screenId === 'campaign-board' && e.tier === 'CHILD',
  );
  const canonicalPageFamilyMatch =
    layout.discoveryStatus === 'RESOLVED' &&
    layout.receipt.totalPageCount >= 7 &&
    campaignBoardNested &&
    !campaignBoardTopLevel &&
    contentOps !== undefined;

  return {
    anchorLabel,
    entries,
    hierarchyLines,
    contentOpsParentVisible: Boolean(contentOps),
    campaignBoardNested,
    campaignBoardTopLevel,
    canonicalPageFamilyMatch,
  };
}

export function expandedNavHierarchyToManifestDestinations(
  receipt: ExpandedNavHierarchyReceipt,
): ContentManifestItem[] {
  return receipt.entries.map((e) => ({
    id: `nav-${e.screenId}`,
    label: e.label,
    provenance: 'CANONICAL_STATIC' as const,
    source:
      e.tier === 'GRANDCHILD' ?
        `Grandchild under ${e.parentScreenId ?? 'parent'} · page family blueprint`
      : e.tier === 'ANCHOR' ?
        'Overview anchor · page family blueprint'
      : 'Child page · page family blueprint',
    navTier: e.tier,
    navPromptLine: e.promptLine,
    parentScreenId: e.parentScreenId,
    topLevelNavIndex: e.topLevelIndex,
  }));
}

export function buildMenuExpandedNavHierarchyRefinementPromptBlock(input: {
  hierarchyLines: readonly string[];
}): string {
  return [
    'MENU / EXPANDED NAV — HIERARCHY REFINEMENT (DESIGN LOCK)',
    'KEEP THE CURRENT EXPANDED NAV DESIGN.',
    'DO NOT REDESIGN THE PANEL.',
    'ONLY CORRECT THE NAVIGATION HIERARCHY.',
    'CAMPAIGN BOARD IS A GRANDCHILD OF CONTENT OPS AND MUST VISUALLY NEST UNDER IT.',
    'PRESERVE EXACTLY: panel placement, width, light theme, typography, lime accents, borders, spacing, numbering style, header, close control, project-navigation title, composition, approved authority page beneath, bottom navigation.',
    'DO NOT regenerate or alter Entry Detail, Project Access, or Base Page.',
    '',
    'REQUIRED NAVIGATION TREE (canonical Page Family Blueprint — not flat siblings):',
    ...input.hierarchyLines.map((l) => `- ${l}`),
    '',
    'CONTENT OPS must read as a parent-capable row with CAMPAIGN BOARD visibly subordinate (indented child, hierarchy marker, or nested row — choose what best matches the existing approved panel).',
    'Do not number CAMPAIGN BOARD as another top-level sibling index.',
  ].join('\n');
}

export function validateExpandedNavHierarchyManifestStructure(receipt: ExpandedNavHierarchyReceipt): {
  contentOpsParentRelationship: 'PASS' | 'FAIL';
  campaignBoardNested: 'PASS' | 'FAIL';
  campaignBoardNotTopLevel: 'PASS' | 'FAIL';
  canonicalPageFamilyMatch: 'PASS' | 'FAIL';
} {
  return {
    contentOpsParentRelationship: receipt.contentOpsParentVisible ? 'PASS' : 'FAIL',
    campaignBoardNested: receipt.campaignBoardNested ? 'PASS' : 'FAIL',
    campaignBoardNotTopLevel: receipt.campaignBoardTopLevel ? 'FAIL' : 'PASS',
    canonicalPageFamilyMatch: receipt.canonicalPageFamilyMatch ? 'PASS' : 'FAIL',
  };
}
