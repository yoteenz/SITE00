/**
 * P0.VR.DESIGN-PAGE-SYSTEM-REVIEW1 — descendant audit, batch inheritance, assets, interactions.
 */

import { listActivePageAssets } from './designPageActiveAssetManifest.js';
import type { PageAssetLifecycleStatus, PageAssetOrigin } from './designPageActiveAssetManifest.js';
import { DESIGN_INTERACTION_REGISTRY, type DesignInteractionEntry } from './designInteractionRegistry.js';
import { loadPageCaptureHistory } from './designPageCapture.js';
import { listPageConceptCandidates } from './designProjectBinding/designPageConceptModel.js';
import {
  buildProjectDesignPageRegistry,
  getDesignBoundPage,
} from './designProjectBinding/designPageRegistry.js';
import type { DesignBoundPageRecord, DesignPageDesignStatus } from './designProjectBinding/types.js';
import type { PageViewportId } from './designProjectBinding/pageViewportAuthority.js';

export const PAGE_SYSTEM_REVIEW_TITLE = 'PAGE SYSTEM REVIEW';

export type PageSystemDescendantStatus =
  | 'INHERITED'
  | 'OVERRIDDEN'
  | 'DESIGN NEEDED'
  | 'IN REVIEW'
  | 'APPROVED'
  | 'BUILT';

export type PageSystemReviewPanelId =
  | 'children'
  | 'grandchildren'
  | 'batch'
  | 'assets'
  | 'interactions';

export type PageSystemDescendantCard = {
  pageId: string;
  screenId: string;
  pageName: string;
  parentPageId: string | null;
  parentPageName: string | null;
  status: PageSystemDescendantStatus;
  inheritanceStatus: PageSystemDescendantStatus;
  thumbnailSrc: string | null;
  thumbnailKind: 'capture' | 'concept' | 'authority' | 'missing';
  pageRole: string;
  interactionContractVersion: string | null;
};

export type PageSystemAssetRow = {
  assetId: string;
  slot: string;
  displayName: string;
  origin: PageAssetOrigin;
  status: PageAssetLifecycleStatus;
  previewSrc: string;
  version: string;
  runId: string | null;
};

export type InteractionInheritance = 'INHERITED FROM PARENT' | 'PAGE-SPECIFIC' | 'OVERRIDDEN' | 'DISABLED' | 'MISSING';

export type PageSystemInteractionRow = {
  id: string;
  label: string;
  category: string;
  element: string;
  action: string;
  destination: string | null;
  stateEffect: string;
  permission: string;
  inheritance: InteractionInheritance;
  status: 'ACTIVE' | 'INHERITED' | 'OVERRIDDEN' | 'UNMAPPED';
};

export type PageSystemBatchMember = {
  pageId: string;
  pageName: string;
  safety: 'SAFE TO INHERIT' | 'HAS OVERRIDES' | 'CONFLICT' | 'REQUIRES REVIEW';
  pageRole: string;
  groupKey: string;
};

export type PageSystemReviewModel = {
  title: typeof PAGE_SYSTEM_REVIEW_TITLE;
  activePageId: string;
  activePageName: string;
  viewport: PageViewportId;
  directChildCount: number;
  grandchildCount: number;
  totalDescendantCount: number;
  children: readonly PageSystemDescendantCard[];
  grandchildren: readonly PageSystemDescendantCard[];
  batchGroups: readonly { groupKey: string; label: string; members: readonly PageSystemBatchMember[] }[];
  assets: readonly PageSystemAssetRow[];
  interactionSummary: {
    active: number;
    inherited: number;
    overridden: number;
    unmapped: number;
    covered: number;
    total: number;
  };
  interactions: readonly PageSystemInteractionRow[];
};

function mapDesignStatus(status: DesignPageDesignStatus, inheritance: DesignPageInheritanceClass): PageSystemDescendantStatus {
  if (inheritance === 'OVERRIDDEN') return 'OVERRIDDEN';
  if (status === 'BUILT' || status === 'READY_TO_BUILD') return 'BUILT';
  if (status === 'APPROVED') return 'APPROVED';
  if (status === 'IN_REVIEW') return 'IN REVIEW';
  if (status === 'DESIGN_NEEDED' || status === 'DESIGNING' || status === 'PLANNED') return 'DESIGN NEEDED';
  return 'INHERITED';
}

type DesignPageInheritanceClass = 'INHERITED' | 'OVERRIDDEN' | 'NEW';

function inheritanceClassForPage(page: DesignBoundPageRecord): DesignPageInheritanceClass {
  if (!page.parentPageId) return 'NEW';
  if (page.designStatus === 'AMENDMENT_REQUIRED') return 'OVERRIDDEN';
  return 'INHERITED';
}

function previewForPage(
  projectId: string,
  page: DesignBoundPageRecord,
  viewport: PageViewportId,
): { src: string | null; kind: PageSystemDescendantCard['thumbnailKind'] } {
  const capture = loadPageCaptureHistory(projectId, page.pageId, viewport);
  if (capture.latest?.artifactPath) return { src: capture.latest.artifactPath, kind: 'capture' };
  const concepts = listPageConceptCandidates(projectId, page.pageId);
  const promoted = concepts.find((c) => c.status === 'PROMOTED' || c.status === 'SELECTED');
  if (promoted?.visualReference) return { src: promoted.visualReference, kind: 'concept' };
  if (viewport === 'DESKTOP' && page.desktopPreviewUrl) return { src: page.desktopPreviewUrl, kind: 'authority' };
  if (viewport !== 'DESKTOP' && page.mobilePreviewUrl) return { src: page.mobilePreviewUrl, kind: 'authority' };
  return { src: null, kind: 'missing' };
}

function toDescendantCard(
  projectId: string,
  page: DesignBoundPageRecord,
  registry: DesignBoundPageRecord[],
  viewport: PageViewportId,
): PageSystemDescendantCard {
  const inheritance = inheritanceClassForPage(page);
  const parent = page.parentPageId ? registry.find((p) => p.pageId === page.parentPageId) : null;
  const thumb = previewForPage(projectId, page, viewport);
  const status = mapDesignStatus(page.designStatus, inheritance);
  return {
    pageId: page.pageId,
    screenId: page.screenId,
    pageName: page.pageName,
    parentPageId: page.parentPageId,
    parentPageName: parent?.pageName ?? null,
    status,
    inheritanceStatus: status,
    thumbnailSrc: thumb.src,
    thumbnailKind: thumb.kind,
    pageRole: page.pageRole,
    interactionContractVersion: page.interactionContractVersion,
  };
}

function batchGroupKey(page: DesignBoundPageRecord): string {
  return `${page.parentPageId ?? 'root'}::${page.pageRole}::${page.interactionContractVersion ?? 'none'}`;
}

function batchSafety(page: DesignBoundPageRecord): PageSystemBatchMember['safety'] {
  if (page.designStatus === 'AMENDMENT_REQUIRED') return 'HAS OVERRIDES';
  if (page.designStatus === 'IN_REVIEW') return 'REQUIRES REVIEW';
  if (!page.parentPageId) return 'CONFLICT';
  return 'SAFE TO INHERIT';
}

function categorizeInteraction(entry: DesignInteractionEntry): string {
  if (entry.actionType === 'NAVIGATION') return 'NAVIGATION';
  if (entry.actionType === 'OVERLAY') {
    if (entry.semanticRole.includes('modal') || entry.semanticRole.includes('drawer')) return 'MODALS / DRAWERS';
    return 'MODALS / DRAWERS';
  }
  if (entry.actionType === 'STATE_MUTATION') return 'STATE CHANGES';
  if (entry.actionType === 'COST_BEARING') return 'AGENT ACTIONS';
  if (entry.actionType === 'PERMISSION_GATED') return 'BUILD / APPROVAL ACTIONS';
  if (entry.surface === 'hero-rail' || entry.surface === 'gallery') return 'BUTTONS / ACTIONS';
  if (entry.surface === 'viewport-band' || entry.surface === 'primary-nav') return 'NAVIGATION';
  return 'BUTTONS / ACTIONS';
}

function interactionInheritance(
  page: DesignBoundPageRecord,
  entry: DesignInteractionEntry,
): InteractionInheritance {
  if (entry.readonly) return 'INHERITED FROM PARENT';
  if (!page.parentPageId) return 'PAGE-SPECIFIC';
  if (entry.permission === 'founder') return 'PAGE-SPECIFIC';
  if (entry.actionType === 'DISABLED') return 'DISABLED';
  return 'INHERITED FROM PARENT';
}

function manifestAssetsToRows(projectId: string, pageId: string): PageSystemAssetRow[] {
  return listActivePageAssets(projectId, pageId).map((a) => ({
    assetId: a.assetId,
    slot: a.slot,
    displayName: a.displayName,
    origin: a.origin,
    status: a.status,
    previewSrc: a.previewDataUrl,
    version: `v${a.versionNumber}`,
    runId: a.runId,
  }));
}

export function buildPageSystemReviewModel(
  projectId: string,
  pageId: string,
  viewport: PageViewportId,
): PageSystemReviewModel {
  const registry = buildProjectDesignPageRegistry(projectId).filter((p) => !p.isConceptOrphan);
  const active = getDesignBoundPage(projectId, pageId) ?? registry.find((p) => p.pageId === pageId);
  const activePageName = active?.pageName ?? pageId;

  const children = registry
    .filter((p) => p.parentPageId === pageId)
    .map((p) => toDescendantCard(projectId, p, registry, viewport));

  const childIds = new Set(children.map((c) => c.pageId));
  const grandchildren = registry
    .filter((p) => p.parentPageId && childIds.has(p.parentPageId))
    .map((p) => toDescendantCard(projectId, p, registry, viewport));

  const descendantIds = new Set([...children, ...grandchildren].map((d) => d.pageId));
  const batchCandidates = registry.filter((p) => descendantIds.has(p.pageId) || p.parentPageId === pageId);
  const groupMap = new Map<string, PageSystemBatchMember[]>();
  for (const page of batchCandidates) {
    if (page.pageId === pageId) continue;
    const key = batchGroupKey(page);
    const list = groupMap.get(key) ?? [];
    list.push({
      pageId: page.pageId,
      pageName: page.pageName,
      safety: batchSafety(page),
      pageRole: page.pageRole,
      groupKey: key,
    });
    groupMap.set(key, list);
  }
  const batchGroups = [...groupMap.entries()].map(([groupKey, members]) => ({
    groupKey,
    label: members[0]?.pageRole.replace(/_/g, ' ') ?? groupKey,
    members,
  }));

  const assets = manifestAssetsToRows(projectId, pageId);

  const page = active ?? registry[0];
  const interactions: PageSystemInteractionRow[] = DESIGN_INTERACTION_REGISTRY.map((entry) => {
    const inheritance = page ? interactionInheritance(page, entry) : 'INHERITED FROM PARENT';
    const status: PageSystemInteractionRow['status'] =
      inheritance === 'DISABLED' ? 'UNMAPPED'
      : inheritance === 'OVERRIDDEN' ? 'OVERRIDDEN'
      : inheritance === 'INHERITED FROM PARENT' ? 'INHERITED'
      : 'ACTIVE';
    return {
      id: entry.id,
      label: entry.label,
      category: categorizeInteraction(entry),
      element: entry.surface.replace(/-/g, ' ').toUpperCase(),
      action: entry.actionType.replace(/_/g, ' '),
      destination: entry.destination ?? entry.handler,
      stateEffect: entry.semanticRole.replace(/-/g, ' '),
      permission: entry.permission ?? 'any',
      inheritance,
      status,
    };
  });

  const interactionSummary = {
    active: interactions.filter((i) => i.status === 'ACTIVE').length,
    inherited: interactions.filter((i) => i.status === 'INHERITED').length,
    overridden: interactions.filter((i) => i.status === 'OVERRIDDEN').length,
    unmapped: interactions.filter((i) => i.status === 'UNMAPPED').length,
    covered: interactions.filter((i) => i.status !== 'UNMAPPED').length,
    total: interactions.length,
  };

  return {
    title: PAGE_SYSTEM_REVIEW_TITLE,
    activePageId: pageId,
    activePageName,
    viewport,
    directChildCount: children.length,
    grandchildCount: grandchildren.length,
    totalDescendantCount: children.length + grandchildren.length,
    children,
    grandchildren,
    batchGroups,
    assets,
    interactionSummary,
    interactions,
  };
}

/** Similar = same batch group key as source page's children/descendants. */
export function listSimilarDescendantPageIds(
  projectId: string,
  model: PageSystemReviewModel,
  sourcePageId: string,
): string[] {
  const source = getDesignBoundPage(projectId, sourcePageId);
  if (!source) {
    return model.batchGroups.flatMap((g) => g.members.map((m) => m.pageId));
  }
  const key = batchGroupKey(source);
  const group = model.batchGroups.find((g) => g.groupKey === key);
  if (group) return group.members.map((m) => m.pageId);
  const largest = model.batchGroups.reduce(
    (best, g) => (g.members.length > (best?.members.length ?? 0) ? g : best),
    model.batchGroups[0],
  );
  return largest?.members.map((m) => m.pageId) ?? [];
}

export const LEGACY_RECONSTRUCTION_OUTPUT_LABELS = ['GROUNDING', 'BLUEPRINT', 'OVERLAY'] as const;
