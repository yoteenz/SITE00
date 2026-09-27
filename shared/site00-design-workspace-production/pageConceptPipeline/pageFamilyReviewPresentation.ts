/**
 * P0.VR.PAGE-SYSTEM-REVIEW-FAMILY-EXPANSION-AND-EXPERIENCE-REVIEW-PANEL1
 */

import type { PageSystemReviewModel } from '../designPageSystemReview.js';
import type {
  OpusPageFamilyHandoff,
  PageFamilyBlueprint,
  PageFamilyCoverageRow,
} from './pageConceptPageFamilyBlueprint.js';
import type { PageFamilyInteractionMap } from './pageConceptPageFamilyInteractionMap.js';
import { resolvePageFamilySkinStatus } from './pageConceptPageFamilyBlueprint.js';

export type PageFamilyReviewCounts = {
  parentPageCount: number;
  childPageCount: number;
  grandchildPageCount: number;
  totalPageCount: number;
  coveredPages: number;
  undefinedPages: number;
  countsSource: 'PAGE_FAMILY_BLUEPRINT' | 'PAGE_SYSTEM_REVIEW_ONLY';
};

export type PageFamilyReviewPageRow = {
  pageId: string;
  pageName: string;
  route: string;
  parentPageId: string | null;
  parentPageName: string | null;
  depth: 0 | 1 | 2;
  functionRole: string;
  shellArchetype: string;
  divergenceLevel: string;
  coverageStatus: string;
  inheritanceDirectiveId: string;
  responsiveContractId: string;
  experiencePatternIds: readonly string[];
  inheritanceSummary: string;
  responsiveStatus: 'DEFINED' | 'MISSING';
};

export type PageFamilyReviewPresentation = {
  counts: PageFamilyReviewCounts;
  parent: PageFamilyReviewPageRow | null;
  children: readonly PageFamilyReviewPageRow[];
  grandchildren: readonly PageFamilyReviewPageRow[];
  grandchildrenByParent: Readonly<Record<string, readonly PageFamilyReviewPageRow[]>>;
  familyStatus: 'NOT_COMPILED' | 'READY_FOR_APPROVAL' | 'APPROVED';
  skinStatus: ReturnType<typeof resolvePageFamilySkinStatus>;
  opusHandoffReady: boolean;
  opusHandoffPreview: PageFamilyBlueprint['handoffPreview'] | null;
  pageCoveragePercent: number | null;
};

function rowFromCoverage(
  coverage: PageFamilyCoverageRow,
  blueprint: PageFamilyBlueprint,
  model: PageSystemReviewModel,
): PageFamilyReviewPageRow {
  const thumb =
    model.children.find((c) => c.pageId === coverage.pageId) ??
    model.grandchildren.find((c) => c.pageId === coverage.pageId);
  const node = blueprint.nodes.find((n) => n.pageId === coverage.pageId);
  const parentName =
    coverage.depth === 2 && node?.parentPageId ?
      blueprint.nodes.find((n) => n.pageId === node.parentPageId)?.pageName ??
      model.children.find((c) => c.pageId === node.parentPageId)?.pageName ??
      null
    : null;
  const responsive = blueprint.archetypeShells.find((a) => a.archetype === coverage.assignedArchetype);
  return {
    pageId: coverage.pageId,
    pageName: coverage.pageName,
    route: coverage.route || thumb?.pageName || '',
    parentPageId: node?.parentPageId ?? null,
    parentPageName: parentName,
    depth: coverage.depth,
    functionRole: coverage.functionRole,
    shellArchetype: coverage.assignedArchetype,
    divergenceLevel: node?.divergenceLevel ?? 'LOW',
    coverageStatus: coverage.coverageStatus,
    inheritanceDirectiveId: coverage.inheritanceDirectiveId,
    responsiveContractId: coverage.responsiveContractId,
    experiencePatternIds: coverage.experiencePatternIds,
    inheritanceSummary:
      node?.inheritance.inherited[0] ? 'PROJECT EXPRESSION' : 'INHERITED',
    responsiveStatus: responsive?.mobile.length ? 'DEFINED' : 'MISSING',
  };
}

export function buildPageFamilyReviewPresentation(input: {
  model: PageSystemReviewModel;
  blueprint: PageFamilyBlueprint | null;
  handoff: OpusPageFamilyHandoff | null;
  interactionMap?: PageFamilyInteractionMap | null;
  skinContractApprovedAt?: string | null;
}): PageFamilyReviewPresentation {
  const { model, blueprint, handoff, interactionMap } = input;

  if (blueprint) {
    const s = blueprint.coverageSummary;
    const rows = blueprint.coverageMatrix.rows.map((r) => rowFromCoverage(r, blueprint, model));
    const parent = rows.find((r) => r.depth === 0) ?? null;
    const children = rows.filter((r) => r.depth === 1);
    const grandchildren = rows.filter((r) => r.depth === 2);
    const grandchildrenByParent: Record<string, PageFamilyReviewPageRow[]> = {};
    for (const g of grandchildren) {
      const pid = g.parentPageId ?? 'unknown';
      grandchildrenByParent[pid] = [...(grandchildrenByParent[pid] ?? []), g];
    }
    return {
      counts: {
        parentPageCount: s.parentPageCount,
        childPageCount: s.childPageCount,
        grandchildPageCount: s.grandchildPageCount,
        totalPageCount: s.totalPageCount,
        coveredPages: s.coveredByUniqueShell + s.coveredByApprovedArchetype,
        undefinedPages: s.undefinedPageCount,
        countsSource: 'PAGE_FAMILY_BLUEPRINT',
      },
      parent,
      children,
      grandchildren,
      grandchildrenByParent,
      familyStatus:
        blueprint.approvedAt ? 'APPROVED'
        : s.undefinedPageCount === 0 &&
            blueprint.hierarchyReceipt.hierarchyDiscoveryStatus === 'RESOLVED' ?
          'READY_FOR_APPROVAL'
        : 'NOT_COMPILED',
      skinStatus: resolvePageFamilySkinStatus({
        skinContractApprovedAt: input.skinContractApprovedAt ?? null,
        blueprintApprovedAt: blueprint.approvedAt,
      }),
      opusHandoffReady: Boolean(
        handoff &&
          blueprint.approvedAt &&
          interactionMap?.approvedAt &&
          interactionMap.buildReadiness.readyForOpus,
      ),
      opusHandoffPreview: blueprint.handoffPreview,
      pageCoveragePercent: handoff?.pageCoveragePercent ?? null,
    };
  }

  return {
    counts: {
      parentPageCount: 1,
      childPageCount: model.directChildCount,
      grandchildPageCount: model.grandchildCount,
      totalPageCount: 1 + model.totalDescendantCount,
      coveredPages: model.totalDescendantCount,
      undefinedPages: 0,
      countsSource: 'PAGE_SYSTEM_REVIEW_ONLY',
    },
    parent: {
      pageId: model.activePageId,
      pageName: model.activePageName,
      route: '',
      parentPageId: null,
      parentPageName: null,
      depth: 0,
      functionRole: 'OVERVIEW',
      shellArchetype: '—',
      divergenceLevel: '—',
      coverageStatus: 'PENDING_BLUEPRINT',
      inheritanceDirectiveId: '—',
      responsiveContractId: '—',
      experiencePatternIds: [],
      inheritanceSummary: 'PENDING',
      responsiveStatus: 'MISSING',
    },
    children: model.children.map((c) => ({
      pageId: c.pageId,
      pageName: c.pageName,
      route: '',
      parentPageId: model.activePageId,
      parentPageName: model.activePageName,
      depth: 1 as const,
      functionRole: c.pageRole,
      shellArchetype: '—',
      divergenceLevel: '—',
      coverageStatus: 'PENDING_BLUEPRINT',
      inheritanceDirectiveId: '—',
      responsiveContractId: '—',
      experiencePatternIds: [],
      inheritanceSummary: c.inheritanceStatus,
      responsiveStatus: 'MISSING' as const,
    })),
    grandchildren: model.grandchildren.map((c) => ({
      pageId: c.pageId,
      pageName: c.pageName,
      route: '',
      parentPageId: c.parentPageId,
      parentPageName: c.parentPageName,
      depth: 2 as const,
      functionRole: c.pageRole,
      shellArchetype: '—',
      divergenceLevel: '—',
      coverageStatus: 'PENDING_BLUEPRINT',
      inheritanceDirectiveId: '—',
      responsiveContractId: '—',
      experiencePatternIds: [],
      inheritanceSummary: c.inheritanceStatus,
      responsiveStatus: 'MISSING' as const,
    })),
    grandchildrenByParent: model.grandchildren.reduce<Record<string, PageFamilyReviewPageRow[]>>((acc, c) => {
      const pid = c.parentPageId ?? 'unknown';
      const row: PageFamilyReviewPageRow = {
        pageId: c.pageId,
        pageName: c.pageName,
        route: '',
        parentPageId: c.parentPageId,
        parentPageName: c.parentPageName,
        depth: 2,
        functionRole: c.pageRole,
        shellArchetype: '—',
        divergenceLevel: '—',
        coverageStatus: 'PENDING_BLUEPRINT',
        inheritanceDirectiveId: '—',
        responsiveContractId: '—',
        experiencePatternIds: [],
        inheritanceSummary: c.inheritanceStatus,
        responsiveStatus: 'MISSING',
      };
      acc[pid] = [...(acc[pid] ?? []), row];
      return acc;
    }, {}),
    familyStatus: 'NOT_COMPILED',
    skinStatus: 'NOT_COMPILED',
    opusHandoffReady: false,
    opusHandoffPreview: null,
    pageCoveragePercent: null,
  };
}

export function findPageFamilyReviewRow(
  presentation: PageFamilyReviewPresentation,
  pageId: string,
): PageFamilyReviewPageRow | null {
  return (
    presentation.parent?.pageId === pageId ? presentation.parent
    : presentation.children.find((c) => c.pageId === pageId) ??
      presentation.grandchildren.find((g) => g.pageId === pageId) ??
      null
  );
}
