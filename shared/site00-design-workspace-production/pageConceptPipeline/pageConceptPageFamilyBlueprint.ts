/**
 * P0.VR.PAGE-FAMILY-BLUEPRINT-BEFORE-OPUS1
 */

import { buildPageSystemReviewModel } from '../designPageSystemReview.js';
import type { PageSystemReviewModel } from '../designPageSystemReview.js';
import { getDesignBoundPage } from '../designProjectBinding/designPageRegistry.js';
import {
  assertPageFamilyHierarchyResolved,
  discoverProjectPageFamilyLayout,
  type PageFamilyHierarchyReceipt,
} from './projectPageFamilyHierarchyDiscovery.js';
import type { DesignDivergenceLevel } from './pageConceptPageFamilySkinBehavior.js';
import type {
  OpusRepresentativeShellKind,
  PageFamilySkinBehaviorContract,
} from './pageConceptPageFamilySkinBehavior.js';
import type { PageExperienceExpressionContract } from './pageConceptViewportAuthorityFamily.js';
import type { PageConceptCgptCreativeBrief, PageFunctionContract } from './types.js';

export type PageFunctionRole =
  | 'OVERVIEW'
  | 'INDEX'
  | 'LIST'
  | 'DETAIL'
  | 'EDITOR'
  | 'REVIEW'
  | 'EVIDENCE'
  | 'PRODUCTION'
  | 'HISTORY'
  | 'ASSET_VIEW'
  | 'CONFIGURATION'
  | 'HUB'
  | 'EXPERIMENT'
  | 'DESIGN_SYSTEM';

export type PageFamilyShellArchetype =
  | 'OVERVIEW_SHELL'
  | 'INDEX_SHELL'
  | 'LIST_SHELL'
  | 'DETAIL_SHELL'
  | 'EDITOR_SHELL'
  | 'REVIEW_SHELL'
  | 'EVIDENCE_SHELL'
  | 'ASSET_SHELL'
  | 'INSPECTOR_SHELL'
  | 'HUB_SHELL';

export type PageInheritanceLevel = 'INHERITED' | 'ADAPTABLE' | 'PAGE_SPECIFIC' | 'LOCKED';

export type PageFamilyBlueprintNode = {
  pageId: string;
  pageName: string;
  parentPageId: string | null;
  depth: 0 | 1 | 2;
  pageRole: string;
  functionRole: PageFunctionRole;
  functionType: string;
  route: string;
  shellArchetype: PageFamilyShellArchetype;
  inheritance: {
    inherited: readonly string[];
    adaptable: readonly string[];
    pageSpecific: readonly string[];
    locked: readonly string[];
  };
  divergenceLevel: DesignDivergenceLevel;
};

export type ChildPageExpressionDirective = {
  pageId: string;
  pageName: string;
  page: string;
  function: string;
  inheritedAuthority: string;
  shellType: PageFamilyShellArchetype;
  primaryHierarchy: string;
  graphicBehavior: string;
  imageBehavior: string;
  navigationRelationship: string;
  experiencePatterns: readonly string[];
  mobileRules: readonly string[];
  tabletRules: readonly string[];
  desktopRules: readonly string[];
  divergenceLevel: DesignDivergenceLevel;
  functionRole: PageFunctionRole;
};

export type GrandchildPageExpressionDirective = {
  pageId: string;
  pageName: string;
  parentPageId: string;
  function: string;
  narrowMode: 'DETAIL' | 'INSPECT' | 'EDIT' | 'REVIEW' | 'HISTORY' | 'ASSET' | 'EVIDENCE' | 'CONFIGURE';
  shellType: PageFamilyShellArchetype;
  inheritedAuthority: string;
  childContext: string;
  divergenceLevel: DesignDivergenceLevel;
  functionRole: PageFunctionRole;
};

export type PageArchetypeResponsiveShell = {
  archetype: PageFamilyShellArchetype;
  mobile: readonly string[];
  tablet: readonly string[];
  desktop: readonly string[];
};

export type PageFamilyBlueprint = {
  blueprintId: string;
  version: string;
  projectId: string;
  parentPageId: string;
  parentPageName: string;
  sourceViewportFamilyId: string;
  pageFamilySkinBehaviorContractId: string;
  experienceExpressionContractId: string;
  nodes: readonly PageFamilyBlueprintNode[];
  childDirectives: readonly ChildPageExpressionDirective[];
  grandchildDirectives: readonly GrandchildPageExpressionDirective[];
  archetypeShells: readonly PageArchetypeResponsiveShell[];
  experiencePackageInheritance: readonly string[];
  parentCount: number;
  childCount: number;
  grandchildCount: number;
  totalPageCount: number;
  deeperDescendantCount: number;
  hierarchyReceipt: PageFamilyHierarchyReceipt;
  coverageMatrix: PageFamilyCoverageMatrix;
  coverageSummary: PageFamilyCoverageSummary;
  handoffPreview: OpusPageFamilyHandoffPreview;
  approvedAt: string | null;
  createdAt: string;
  /** Founder-approved functional expansions (P0.VR.EXISTING-TRUTH-PLUS-FUNCTIONAL-EXPANSION-INTELLIGENCE1). */
  expansionNotes?: readonly string[];
};

export type PageFamilyCoverageStatus =
  | 'COVERED_BY_UNIQUE_SHELL'
  | 'COVERED_BY_APPROVED_ARCHETYPE'
  | 'BLOCKED_UNDEFINED';

export type PageFamilyCoverageRow = {
  pageId: string;
  pageName: string;
  route: string;
  depth: 0 | 1 | 2;
  functionRole: PageFunctionRole;
  assignedArchetype: PageFamilyShellArchetype;
  inheritanceDirectiveId: string;
  responsiveContractId: string;
  experiencePatternIds: readonly string[];
  opusShellRequired: boolean;
  opusShellId: string | null;
  inheritedShellId: string | null;
  coverageStatus: PageFamilyCoverageStatus;
};

export type PageFamilyCoverageMatrix = {
  matrixId: string;
  blueprintId: string;
  rows: readonly PageFamilyCoverageRow[];
};

export type PageFamilyCoverageSummary = {
  parentPageCount: number;
  childPageCount: number;
  grandchildPageCount: number;
  totalPageCount: number;
  uniqueShellCount: number;
  sharedArchetypeCount: number;
  pagesUsingSharedArchetypes: number;
  coveredByUniqueShell: number;
  coveredByApprovedArchetype: number;
  undefinedPageCount: number;
};

export type OpusPageFamilyHandoffPreview = {
  parentShellArchetypes: readonly PageFamilyShellArchetype[];
  childShellArchetypes: readonly PageFamilyShellArchetype[];
  grandchildShellArchetypes: readonly PageFamilyShellArchetype[];
  sharedExperiencePatterns: readonly string[];
  totalOpusShellsToCreate: number;
  uniqueShellCount: number;
  sharedArchetypeCount: number;
};

export type PageFamilySkinLifecycleStatus = 'READY_FOR_FOUNDER_APPROVAL' | 'FINALIZED' | 'NOT_COMPILED';

export type OpusPageFamilyHandoff = {
  handoffId: string;
  blueprintId: string;
  pageFamilyInteractionMapId: string;
  targetSurface: 'TWIN';
  parentPageId: string;
  viewportFamilyId: string;
  experienceExpressionContractId: string;
  pageFamilySkinBehaviorContractId: string;
  childDirectiveIds: readonly string[];
  grandchildDirectiveIds: readonly string[];
  archetypeShellKinds: readonly OpusRepresentativeShellKind[];
  responsiveInheritanceSummary: readonly string[];
  pageHierarchySummary: string;
  pageCoveragePercent: number;
  undefinedPageCount: number;
  handoffPreview: OpusPageFamilyHandoffPreview;
  coverageMatrixId: string;
  interactionCoveragePercent: number;
  createdAt: string;
};

const INHERITED_DEFAULT = [
  'project typography behavior',
  'NDXBOOK graphic language',
  'color-family behavior',
  'image/evidence treatment',
  'material system',
  'project navigation expression',
  'interaction character',
  'section-transition language',
] as const;

const LOCKED_DEFAULT = [
  'SITE 00 host shell',
  'project-context relationship',
  'canonical navigation semantics',
  'bottom-nav function',
  'approved interaction grammar',
  'authority scope',
] as const;

const ADAPTABLE_DEFAULT = [
  'information density',
  'section composition',
  'image quantity',
  'side rails',
  'number of columns',
  'relative emphasis',
  'page rhythm',
] as const;

function inferFunctionRole(pageRole: string, screenId: string, depth: number): PageFunctionRole {
  const role = pageRole.toUpperCase();
  if (depth === 0 || role.includes('OVERVIEW')) return 'OVERVIEW';
  if (role.includes('HUB') || role.includes('OPERATIONS')) return 'HUB';
  if (role.includes('EDITOR') || role.includes('INTELLIGENCE')) return 'EDITOR';
  if (role.includes('EXPERIMENT') || role.includes('LAB')) return 'EXPERIMENT';
  if (role.includes('CAMPAIGN')) return 'LIST';
  if (role.includes('ICON') || role.includes('DESIGN_SYSTEM')) return 'DESIGN_SYSTEM';
  if (screenId.includes('detail')) return 'DETAIL';
  if (depth >= 2) return 'DETAIL';
  return 'INDEX';
}

function inferShellArchetype(functionRole: PageFunctionRole, depth: number): PageFamilyShellArchetype {
  if (depth === 0 || functionRole === 'OVERVIEW') return 'OVERVIEW_SHELL';
  if (functionRole === 'HUB') return 'HUB_SHELL';
  if (functionRole === 'EDITOR' || functionRole === 'REVIEW') return 'EDITOR_SHELL';
  if (functionRole === 'EVIDENCE') return 'EVIDENCE_SHELL';
  if (functionRole === 'ASSET_VIEW' || functionRole === 'DESIGN_SYSTEM') return 'ASSET_SHELL';
  if (functionRole === 'DETAIL' || depth >= 2) return 'DETAIL_SHELL';
  if (functionRole === 'LIST') return 'LIST_SHELL';
  return 'INDEX_SHELL';
}

function divergenceForDepth(depth: 0 | 1 | 2): DesignDivergenceLevel {
  if (depth === 0) return 'LOCKED';
  if (depth === 1) return 'LOW';
  return 'LOW';
}

function inheritanceForDepth(depth: 0 | 1 | 2): PageFamilyBlueprintNode['inheritance'] {
  const pageSpecific =
    depth === 0 ?
      ['actual content architecture', 'overview modules', 'project entry actions']
    : depth === 1 ?
      ['page-specific actions', 'content ordering', 'page-function modules']
    : ['detail fields', 'inspect/edit modules', 'nested content ordering'];

  return {
    inherited: [...INHERITED_DEFAULT],
    adaptable: [...ADAPTABLE_DEFAULT],
    pageSpecific,
    locked: [...LOCKED_DEFAULT],
  };
}

function responsiveRulesForArchetype(
  archetype: PageFamilyShellArchetype,
  experience: PageExperienceExpressionContract,
): PageArchetypeResponsiveShell {
  const drawer = experience.overlayPatterns.find((p) => /drawer|sheet/i.test(p)) ?? 'MOBILE drawer';
  const modal = experience.overlayPatterns.find((p) => /modal|overlay/i.test(p)) ?? 'modal overlay';

  switch (archetype) {
    case 'DETAIL_SHELL':
    case 'INSPECTOR_SHELL':
      return {
        archetype,
        mobile: ['single-column', 'context drawer', 'bottom actions', drawer],
        tablet: ['main content + side context', 'sheet for secondary inspect'],
        desktop: ['persistent side inspector', 'multi-column summary when warranted'],
      };
    case 'EDITOR_SHELL':
    case 'REVIEW_SHELL':
      return {
        archetype,
        mobile: ['stacked sections', 'full-width editor canvas', drawer],
        tablet: ['split editor + context rail'],
        desktop: ['persistent tool rail + wide canvas'],
      };
    case 'LIST_SHELL':
    case 'INDEX_SHELL':
      return {
        archetype,
        mobile: ['single-column list', 'sticky section headers'],
        tablet: ['two-column index when density allows'],
        desktop: ['grid or table index with filters rail'],
      };
    case 'ASSET_SHELL':
    case 'EVIDENCE_SHELL':
      return {
        archetype,
        mobile: ['asset-forward scroll', 'lightbox via drawer'],
        tablet: ['gallery grid + metadata sheet'],
        desktop: ['gallery + persistent metadata inspector'],
      };
    case 'HUB_SHELL':
      return {
        archetype,
        mobile: ['hub cards stack', 'quick actions footer'],
        tablet: ['two-column hub modules'],
        desktop: ['dashboard grid with side summary'],
      };
    case 'OVERVIEW_SHELL':
    default:
      return {
        archetype: 'OVERVIEW_SHELL',
        mobile: ['hero + stacked sections', 'project nav anchored', drawer],
        tablet: ['widened overview bands', 'sheet for entry detail'],
        desktop: ['persistent project nav + wide overview bands', modal],
      };
  }
}

function buildChildDirective(input: {
  node: PageFamilyBlueprintNode;
  projectExpression: string;
  experience: PageExperienceExpressionContract;
  responsive: PageArchetypeResponsiveShell;
}): ChildPageExpressionDirective {
  return {
    pageId: input.node.pageId,
    pageName: input.node.pageName,
    page: input.node.pageName,
    function: `Delivers ${input.node.functionRole} for ${input.node.pageName}`,
    inheritedAuthority: input.projectExpression,
    shellType: input.node.shellArchetype,
    primaryHierarchy: input.node.depth === 1 ? 'Child under project overview' : 'Nested child surface',
    graphicBehavior: 'Inherits NDXBOOK graphic language and section rhythm from approved viewport family',
    imageBehavior: 'Evidence and imagery follow project image language; density is adaptable',
    navigationRelationship: 'Local subnav + breadcrumbs preserve parent overview context',
    experiencePatterns: input.experience.overlayPatterns.slice(0, 4),
    mobileRules: input.responsive.mobile,
    tabletRules: input.responsive.tablet,
    desktopRules: input.responsive.desktop,
    divergenceLevel: input.node.divergenceLevel,
    functionRole: input.node.functionRole,
  };
}

function buildGrandchildDirective(input: {
  node: PageFamilyBlueprintNode;
  parentName: string;
  projectExpression: string;
}): GrandchildPageExpressionDirective {
  const narrowMode =
    input.node.functionRole === 'EDITOR' ? 'EDIT'
    : input.node.functionRole === 'REVIEW' ? 'REVIEW'
    : input.node.functionRole === 'EVIDENCE' ? 'EVIDENCE'
    : input.node.functionRole === 'ASSET_VIEW' ? 'ASSET'
    : input.node.functionRole === 'HISTORY' ? 'HISTORY'
    : 'DETAIL';

  return {
    pageId: input.node.pageId,
    pageName: input.node.pageName,
    parentPageId: input.node.parentPageId!,
    function: `Nested ${narrowMode} for ${input.node.pageName}`,
    narrowMode,
    shellType: input.node.shellArchetype,
    inheritedAuthority: input.projectExpression,
    childContext: `Extends ${input.parentName} without new visual system`,
    divergenceLevel: input.node.divergenceLevel,
    functionRole: input.node.functionRole,
  };
}

export function compilePageFamilyBlueprint(input: {
  projectId: string;
  parentPageId: string;
  sourceViewportFamilyId: string;
  skinContract: PageFamilySkinBehaviorContract;
  experienceContract: PageExperienceExpressionContract;
  cgptBrief: PageConceptCgptCreativeBrief;
  functionContract: PageFunctionContract;
}): PageFamilyBlueprint {
  const familyLayout = discoverProjectPageFamilyLayout(input.projectId, input.parentPageId);
  const review = buildPageSystemReviewModel(input.projectId, input.parentPageId, 'MOBILE');
  const parentBound = getDesignBoundPage(input.projectId, input.parentPageId);
  const projectExpression = [
    input.cgptBrief.typographyStrategy,
    input.cgptBrief.colorStrategy,
    input.cgptBrief.materialStrategy,
    input.cgptBrief.interactionCharacter,
  ].join(' · ');

  const parentNode: PageFamilyBlueprintNode = {
    pageId: input.parentPageId,
    pageName: review.activePageName,
    parentPageId: null,
    depth: 0,
    pageRole: parentBound?.pageRole ?? 'PROJECT_OVERVIEW',
    functionRole: 'OVERVIEW',
    functionType: input.functionContract.route,
    route: parentBound?.route ?? input.functionContract.route,
    shellArchetype: 'OVERVIEW_SHELL',
    inheritance: inheritanceForDepth(0),
    divergenceLevel: 'LOCKED',
  };

  const childNodes: PageFamilyBlueprintNode[] = familyLayout.children.map((c) => {
    const functionRole = inferFunctionRole(c.pageRole, c.screenId, 1);
    const parentId =
      familyLayout.inventory.find((i) => i.pageId === c.pageId)?.parentPageId ?? input.parentPageId;
    return {
      pageId: c.pageId,
      pageName: c.pageName,
      parentPageId: parentId === c.pageId ? input.parentPageId : parentId,
      depth: 1 as const,
      pageRole: c.pageRole,
      functionRole,
      functionType: c.pageRole,
      route: c.route ?? '',
      shellArchetype: inferShellArchetype(functionRole, 1),
      inheritance: inheritanceForDepth(1),
      divergenceLevel: divergenceForDepth(1),
    };
  });

  const grandchildNodes: PageFamilyBlueprintNode[] = [
    ...familyLayout.grandchildren,
    ...familyLayout.deeperDescendants,
  ].map((c) => {
    const functionRole = inferFunctionRole(c.pageRole, c.screenId, 2);
    const parentId =
      familyLayout.inventory.find((i) => i.pageId === c.pageId)?.parentPageId ?? c.parentPageId;
    return {
      pageId: c.pageId,
      pageName: c.pageName,
      parentPageId: parentId,
      depth: 2 as const,
      pageRole: c.pageRole,
      functionRole,
      functionType: c.pageRole,
      route: c.route ?? '',
      shellArchetype: inferShellArchetype(functionRole, 2),
      inheritance: inheritanceForDepth(2),
      divergenceLevel: divergenceForDepth(2),
    };
  });

  const nodes = [parentNode, ...childNodes, ...grandchildNodes];
  const archetypeSet = new Set(nodes.map((n) => n.shellArchetype));
  const archetypeShells = [...archetypeSet].map((a) =>
    responsiveRulesForArchetype(a, input.experienceContract),
  );

  const childDirectives = childNodes.map((node) => {
    const responsive = archetypeShells.find((a) => a.archetype === node.shellArchetype)!;
    return buildChildDirective({ node, projectExpression, experience: input.experienceContract, responsive });
  });

  const grandchildDirectives = grandchildNodes.map((node) => {
    const parentName =
      childNodes.find((c) => c.pageId === node.parentPageId)?.pageName ??
      review.children.find((c) => c.pageId === node.parentPageId)?.pageName ??
      'parent child';
    return buildGrandchildDirective({ node, parentName, projectExpression });
  });

  const experiencePackageInheritance = [
    'MOBILE drawer → child/detail state',
    'TABLET sheet → side panel',
    'DESKTOP → persistent inspector',
    ...input.experienceContract.overlayPatterns,
  ];

  const blueprintId = `pfbp-${input.sourceViewportFamilyId}-${Date.now()}`;
  const draft: Omit<PageFamilyBlueprint, 'coverageMatrix' | 'coverageSummary' | 'handoffPreview'> & {
    blueprintId: string;
  } = {
    blueprintId,
    version: 'v1-blueprint',
    projectId: input.projectId,
    parentPageId: input.parentPageId,
    parentPageName: review.activePageName,
    sourceViewportFamilyId: input.sourceViewportFamilyId,
    pageFamilySkinBehaviorContractId: input.skinContract.contractId,
    experienceExpressionContractId: input.experienceContract.contractId,
    nodes,
    childDirectives,
    grandchildDirectives,
    archetypeShells,
    experiencePackageInheritance,
    parentCount: 1,
    childCount: childNodes.length,
    grandchildCount: grandchildNodes.length,
    totalPageCount: nodes.length,
    deeperDescendantCount: familyLayout.deeperDescendants.length,
    hierarchyReceipt: {
      ...familyLayout.receipt,
      diagnostics: {
        ...familyLayout.receipt.diagnostics,
        pageSystemReviewPageCount: review.totalDescendantCount + 1,
        pageFamilyBlueprintPageCount: nodes.length,
      },
    },
    approvedAt: null,
    createdAt: new Date().toISOString(),
  };
  const coverageMatrix = compilePageFamilyCoverageMatrix({
    blueprintId,
    nodes,
    experiencePatternIds: input.experienceContract.overlayPatterns,
    childDirectives,
    grandchildDirectives,
  });
  const coverageSummary = summarizePageFamilyCoverage(coverageMatrix);
  const assembled: PageFamilyBlueprint = {
    ...draft,
    coverageMatrix,
    coverageSummary,
    handoffPreview: {
      parentShellArchetypes: [],
      childShellArchetypes: [],
      grandchildShellArchetypes: [],
      sharedExperiencePatterns: [],
      totalOpusShellsToCreate: 0,
      uniqueShellCount: 0,
      sharedArchetypeCount: 0,
    },
  };
  assembled.handoffPreview = buildOpusPageFamilyHandoffPreview(assembled, coverageSummary);
  return assembled;
}

function directiveIdForNode(node: PageFamilyBlueprintNode, childDirectives: readonly ChildPageExpressionDirective[], grandchildDirectives: readonly GrandchildPageExpressionDirective[]): string {
  if (node.depth === 0) return `inherit-parent-${node.pageId}`;
  if (node.depth === 1) {
    const d = childDirectives.find((c) => c.pageId === node.pageId);
    return d ? `child-directive-${d.pageId}` : `inherit-child-${node.pageId}`;
  }
  const d = grandchildDirectives.find((c) => c.pageId === node.pageId);
  return d ? `grandchild-directive-${d.pageId}` : `inherit-grandchild-${node.pageId}`;
}

function opusShellIdForNode(node: PageFamilyBlueprintNode): string | null {
  if (node.depth === 0) return `opus-shell-PARENT-${node.shellArchetype}`;
  if (node.depth === 1) {
    return node.shellArchetype === 'LIST_SHELL' || node.shellArchetype === 'INDEX_SHELL' ?
        `opus-shell-CHILD_LIST-${node.shellArchetype}`
      : `opus-shell-CHILD_DETAIL-${node.shellArchetype}`;
  }
  return `opus-shell-GRANDCHILD_DETAIL-${node.shellArchetype}`;
}

export function compilePageFamilyCoverageMatrix(input: {
  blueprintId: string;
  nodes: readonly PageFamilyBlueprintNode[];
  experiencePatternIds: readonly string[];
  childDirectives: readonly ChildPageExpressionDirective[];
  grandchildDirectives: readonly GrandchildPageExpressionDirective[];
}): PageFamilyCoverageMatrix {
  const archetypeUsage = new Map<PageFamilyShellArchetype, number>();
  for (const node of input.nodes) {
    archetypeUsage.set(node.shellArchetype, (archetypeUsage.get(node.shellArchetype) ?? 0) + 1);
  }

  const rows: PageFamilyCoverageRow[] = input.nodes.map((node) => {
    const hasRole = Boolean(node.functionRole);
    const hasArchetype = Boolean(node.shellArchetype);
    const hasInheritance = node.inheritance.inherited.length > 0 && node.inheritance.locked.length > 0;
    const responsiveContractId = `responsive-${node.shellArchetype}`;
    const inheritanceDirectiveId = directiveIdForNode(node, input.childDirectives, input.grandchildDirectives);
    const usage = archetypeUsage.get(node.shellArchetype) ?? 0;
    let coverageStatus: PageFamilyCoverageStatus = 'BLOCKED_UNDEFINED';
    if (hasRole && hasArchetype && hasInheritance && responsiveContractId) {
      coverageStatus =
        usage === 1 ? 'COVERED_BY_UNIQUE_SHELL' : 'COVERED_BY_APPROVED_ARCHETYPE';
    }
    const opusShellId = coverageStatus === 'BLOCKED_UNDEFINED' ? null : opusShellIdForNode(node);
    return {
      pageId: node.pageId,
      pageName: node.pageName,
      route: node.route,
      depth: node.depth,
      functionRole: node.functionRole,
      assignedArchetype: node.shellArchetype,
      inheritanceDirectiveId,
      responsiveContractId,
      experiencePatternIds: input.experiencePatternIds.slice(0, 4),
      opusShellRequired: node.depth >= 0,
      opusShellId,
      inheritedShellId: usage > 1 ? `shared-archetype-${node.shellArchetype}` : null,
      coverageStatus,
    };
  });

  return {
    matrixId: `pfcm-${input.blueprintId.slice(-12)}`,
    blueprintId: input.blueprintId,
    rows,
  };
}

export function summarizePageFamilyCoverage(matrix: PageFamilyCoverageMatrix): PageFamilyCoverageSummary {
  const rows = matrix.rows;
  const parentPageCount = rows.filter((r) => r.depth === 0).length;
  const childPageCount = rows.filter((r) => r.depth === 1).length;
  const grandchildPageCount = rows.filter((r) => r.depth === 2).length;
  const undefinedPageCount = rows.filter((r) => r.coverageStatus === 'BLOCKED_UNDEFINED').length;
  const coveredByUniqueShell = rows.filter((r) => r.coverageStatus === 'COVERED_BY_UNIQUE_SHELL').length;
  const coveredByApprovedArchetype = rows.filter(
    (r) => r.coverageStatus === 'COVERED_BY_APPROVED_ARCHETYPE',
  ).length;
  const sharedArchetypes = new Set(
    rows.filter((r) => r.coverageStatus === 'COVERED_BY_APPROVED_ARCHETYPE').map((r) => r.assignedArchetype),
  );
  const uniqueArchetypes = new Set(
    rows.filter((r) => r.coverageStatus === 'COVERED_BY_UNIQUE_SHELL').map((r) => r.assignedArchetype),
  );
  const pagesUsingSharedArchetypes = coveredByApprovedArchetype;
  return {
    parentPageCount,
    childPageCount,
    grandchildPageCount,
    totalPageCount: rows.length,
    uniqueShellCount: uniqueArchetypes.size,
    sharedArchetypeCount: sharedArchetypes.size,
    pagesUsingSharedArchetypes,
    coveredByUniqueShell,
    coveredByApprovedArchetype,
    undefinedPageCount,
  };
}

export function buildOpusPageFamilyHandoffPreview(
  blueprint: PageFamilyBlueprint,
  summary?: PageFamilyCoverageSummary,
): OpusPageFamilyHandoffPreview {
  const s = summary ?? blueprint.coverageSummary;
  const parentShellArchetypes = blueprint.nodes.filter((n) => n.depth === 0).map((n) => n.shellArchetype);
  const childShellArchetypes = [...new Set(blueprint.nodes.filter((n) => n.depth === 1).map((n) => n.shellArchetype))];
  const grandchildShellArchetypes = [
    ...new Set(blueprint.nodes.filter((n) => n.depth === 2).map((n) => n.shellArchetype)),
  ];
  const navAndOverlayShells = 5;
  const totalOpusShellsToCreate =
    s.uniqueShellCount + s.sharedArchetypeCount + navAndOverlayShells;
  return {
    parentShellArchetypes,
    childShellArchetypes,
    grandchildShellArchetypes,
    sharedExperiencePatterns: blueprint.experiencePackageInheritance?.slice(0, 6) ?? [],
    totalOpusShellsToCreate,
    uniqueShellCount: s.uniqueShellCount,
    sharedArchetypeCount: s.sharedArchetypeCount,
  };
}

export function resolvePageFamilySkinStatus(input: {
  skinContractApprovedAt: string | null | undefined;
  blueprintApprovedAt: string | null | undefined;
}): PageFamilySkinLifecycleStatus {
  if (!input.skinContractApprovedAt && !input.blueprintApprovedAt) return 'READY_FOR_FOUNDER_APPROVAL';
  if (input.blueprintApprovedAt && input.skinContractApprovedAt) return 'FINALIZED';
  if (!input.blueprintApprovedAt) return 'READY_FOR_FOUNDER_APPROVAL';
  return 'NOT_COMPILED';
}

export function assertPageFamilyBlueprintCoverageComplete(blueprint: PageFamilyBlueprint): void {
  if (blueprint.hierarchyReceipt.hierarchyDiscoveryStatus !== 'RESOLVED') {
    throw new Error(blueprint.hierarchyReceipt.blockedReason ?? 'PAGE_FAMILY_HIERARCHY_INCOMPLETE');
  }
  const summary = blueprint.coverageSummary;
  if (summary.undefinedPageCount > 0) throw new Error('PAGE_FAMILY_BLUEPRINT_INCOMPLETE');
  if (summary.totalPageCount !== blueprint.nodes.length) throw new Error('PAGE_FAMILY_BLUEPRINT_INCOMPLETE');
  if (summary.childPageCount !== blueprint.childCount) throw new Error('PAGE_FAMILY_BLUEPRINT_INCOMPLETE');
  if (summary.grandchildPageCount !== blueprint.grandchildCount) throw new Error('PAGE_FAMILY_BLUEPRINT_INCOMPLETE');
  if (summary.parentPageCount !== blueprint.parentCount) throw new Error('PAGE_FAMILY_BLUEPRINT_INCOMPLETE');
  for (const row of blueprint.coverageMatrix.rows) {
    if (!row.functionRole || !row.assignedArchetype) throw new Error('PAGE_FAMILY_BLUEPRINT_INCOMPLETE');
    if (!row.inheritanceDirectiveId || !row.responsiveContractId) throw new Error('PAGE_FAMILY_BLUEPRINT_INCOMPLETE');
    if (row.coverageStatus === 'BLOCKED_UNDEFINED') throw new Error('PAGE_FAMILY_BLUEPRINT_INCOMPLETE');
  }
}

export function buildPageFamilyCoverageReceipt(blueprint: PageFamilyBlueprint): Record<string, string | number> {
  const s = blueprint.coverageSummary;
  const childNames = blueprint.nodes.filter((n) => n.depth === 1).map((n) => n.pageName).join(', ') || '(none)';
  const grandchildNames =
    blueprint.nodes.filter((n) => n.depth === 2).map((n) => n.pageName).join(', ') || '(none)';
  return {
    PARENT_PAGE_COUNT: s.parentPageCount,
    CHILD_PAGE_COUNT: s.childPageCount,
    GRANDCHILD_PAGE_COUNT: s.grandchildPageCount,
    TOTAL_PAGE_COUNT: s.totalPageCount,
    CHILD_PAGES: childNames,
    GRANDCHILD_PAGES: grandchildNames,
    UNIQUE_SHELL_COUNT: s.uniqueShellCount,
    SHARED_ARCHETYPE_COUNT: s.sharedArchetypeCount,
    COVERED_BY_UNIQUE_SHELL: s.coveredByUniqueShell,
    COVERED_BY_APPROVED_ARCHETYPE: s.coveredByApprovedArchetype,
    UNDEFINED_PAGE_COUNT: s.undefinedPageCount,
  };
}

export function validatePageFamilyBlueprint(
  blueprint: PageFamilyBlueprint,
  review: PageSystemReviewModel,
): { ok: true } | { ok: false; code: string } {
  if (!blueprint.sourceViewportFamilyId) return { ok: false, code: 'VIEWPORT_FAMILY_REQUIRED' };
  if (blueprint.hierarchyReceipt.hierarchyDiscoveryStatus !== 'RESOLVED') {
    return { ok: false, code: blueprint.hierarchyReceipt.blockedReason ?? 'PAGE_FAMILY_HIERARCHY_INCOMPLETE' };
  }
  const layout = discoverProjectPageFamilyLayout(blueprint.projectId, blueprint.parentPageId);
  if (layout.discoveryStatus !== 'RESOLVED') {
    return { ok: false, code: layout.receipt.blockedReason ?? 'PAGE_FAMILY_HIERARCHY_MISMATCH' };
  }
  if (layout.children.length !== blueprint.childCount || layout.grandchildren.length !== blueprint.grandchildCount) {
    return { ok: false, code: 'PAGE_SYSTEM_BLUEPRINT_TREE_PARITY_FAIL' };
  }
  const childIds = new Set(review.children.map((c) => c.pageId));
  const grandchildIds = new Set(review.grandchildren.map((c) => c.pageId));
  for (const id of childIds) {
    if (!blueprint.nodes.some((n) => n.pageId === id && n.depth === 1)) {
      return { ok: false, code: 'CHILD_PAGE_MISSING' };
    }
  }
  for (const id of grandchildIds) {
    if (!blueprint.nodes.some((n) => n.pageId === id && n.depth === 2)) {
      return { ok: false, code: 'GRANDCHILD_PAGE_MISSING' };
    }
  }
  for (const node of blueprint.nodes) {
    if (!node.functionRole) return { ok: false, code: 'FUNCTION_ROLE_MISSING' };
    if (!node.inheritance.inherited.length || !node.inheritance.locked.length) {
      return { ok: false, code: 'INHERITANCE_RULES_MISSING' };
    }
    if (!node.divergenceLevel) return { ok: false, code: 'DIVERGENCE_MISSING' };
  }
  if (!blueprint.archetypeShells.length) return { ok: false, code: 'ARCHETYPE_SHELLS_MISSING' };
  for (const shell of blueprint.archetypeShells) {
    if (!shell.mobile.length || !shell.tablet.length || !shell.desktop.length) {
      return { ok: false, code: 'RESPONSIVE_SHELL_RULES_MISSING' };
    }
  }
  if (!blueprint.experiencePackageInheritance.length) return { ok: false, code: 'EXPERIENCE_PACKAGE_MISSING' };
  try {
    assertPageFamilyBlueprintCoverageComplete(blueprint);
  } catch {
    return { ok: false, code: 'PAGE_FAMILY_BLUEPRINT_INCOMPLETE' };
  }
  return { ok: true };
}

export function mapArchetypesToOpusShellKinds(
  blueprint: PageFamilyBlueprint,
): readonly OpusRepresentativeShellKind[] {
  const kinds = new Set<OpusRepresentativeShellKind>([
    'PARENT',
    'MOBILE_NAV',
    'TABLET_NAV',
    'DESKTOP_NAV',
    'DRAWER_INSPECTOR',
    'MODAL_CONFIRMATION',
  ]);
  for (const node of blueprint.nodes) {
    if (node.depth === 1) {
      if (node.shellArchetype === 'LIST_SHELL' || node.shellArchetype === 'INDEX_SHELL') {
        kinds.add('CHILD_LIST');
      } else {
        kinds.add('CHILD_DETAIL');
      }
    }
    if (node.depth === 2) kinds.add('GRANDCHILD_DETAIL');
  }
  return [...kinds];
}

export function buildOpusPageFamilyHandoff(input: {
  blueprint: PageFamilyBlueprint;
  viewportFamilyId: string;
  interactionMap: import('./pageConceptPageFamilyInteractionMap.js').PageFamilyInteractionMap;
}): OpusPageFamilyHandoff {
  const bp = input.blueprint;
  if (!bp.approvedAt) throw new Error('PAGE_FAMILY_BLUEPRINT_APPROVAL_REQUIRED');
  assertPageFamilyHierarchyResolved(
    discoverProjectPageFamilyLayout(bp.projectId, bp.parentPageId),
  );
  assertPageFamilyBlueprintCoverageComplete(bp);
  if (!input.interactionMap.approvedAt) throw new Error('PAGE_FAMILY_INTERACTION_MAP_APPROVAL_REQUIRED');
  if (input.interactionMap.coverageMatrix.summary.unmappedControls > 0) {
    throw new Error('PAGE_FAMILY_INTERACTION_MAP_INCOMPLETE');
  }
  if (bp.coverageSummary.undefinedPageCount > 0) throw new Error('OPUS_PAGE_FAMILY_HANDOFF_INCOMPLETE');
  const pageCoveragePercent =
    bp.coverageSummary.totalPageCount === 0 ?
      100
    : Math.round(
        ((bp.coverageSummary.totalPageCount - bp.coverageSummary.undefinedPageCount) /
          bp.coverageSummary.totalPageCount) *
          100,
      );
  if (pageCoveragePercent < 100) throw new Error('OPUS_PAGE_FAMILY_HANDOFF_INCOMPLETE');
  return {
    handoffId: `opfh-${bp.blueprintId.slice(-12)}-${Date.now()}`,
    blueprintId: bp.blueprintId,
    pageFamilyInteractionMapId: input.interactionMap.mapId,
    targetSurface: 'TWIN',
    parentPageId: bp.parentPageId,
    viewportFamilyId: input.viewportFamilyId,
    experienceExpressionContractId: bp.experienceExpressionContractId,
    pageFamilySkinBehaviorContractId: bp.pageFamilySkinBehaviorContractId,
    childDirectiveIds: bp.childDirectives.map((d) => d.pageId),
    grandchildDirectiveIds: bp.grandchildDirectives.map((d) => d.pageId),
    archetypeShellKinds: mapArchetypesToOpusShellKinds(bp),
    responsiveInheritanceSummary: bp.archetypeShells.flatMap((a) => [
      `${a.archetype}:MOBILE=${a.mobile[0] ?? ''}`,
      `${a.archetype}:DESKTOP=${a.desktop[0] ?? ''}`,
    ]),
    pageHierarchySummary: `parent=${bp.parentPageName};children=${bp.childCount};grandchildren=${bp.grandchildCount};total=${bp.totalPageCount}`,
    pageCoveragePercent,
    undefinedPageCount: bp.coverageSummary.undefinedPageCount,
    handoffPreview: bp.handoffPreview,
    coverageMatrixId: bp.coverageMatrix.matrixId,
    interactionCoveragePercent: input.interactionMap.coverageMatrix.summary.coveragePercent,
    createdAt: new Date().toISOString(),
  };
}

export function assertPageFamilyBlueprintApproved(blueprint: PageFamilyBlueprint | null | undefined): void {
  if (!blueprint?.approvedAt) throw new Error('PAGE_FAMILY_BLUEPRINT_APPROVAL_REQUIRED');
}

export function findBlueprintNodeForPage(
  blueprint: PageFamilyBlueprint,
  pageId: string,
): PageFamilyBlueprintNode | null {
  return blueprint.nodes.find((n) => n.pageId === pageId) ?? null;
}

export function assertComposerPageFamilyExpressionDefined(input: {
  pageId: string;
  blueprint: PageFamilyBlueprint | null | undefined;
}): void {
  if (!input.blueprint?.approvedAt) throw new Error('PAGE_FAMILY_BLUEPRINT_APPROVAL_REQUIRED');
  const node = findBlueprintNodeForPage(input.blueprint, input.pageId);
  if (!node) throw new Error(`PAGE_FAMILY_EXPRESSION_UNDEFINED:${input.pageId}`);
}
