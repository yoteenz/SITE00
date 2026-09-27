/**
 * P0.VR.PAGE-FAMILY-INTERACTION-MAP-AND-HANDOFF-GATE1
 */

import {
  DESIGN_INTERACTION_HANDLER_ALLOWLIST,
  DESIGN_INTERACTION_REGISTRY,
  type DesignInteractionEntry,
} from '../designInteractionRegistry.js';
import type { PageExperienceExpressionContract } from './pageConceptViewportAuthorityFamily.js';
import type { PageFamilyBlueprint, PageFamilyBlueprintNode } from './pageConceptPageFamilyBlueprint.js';
import { assertPageFamilyBlueprintCoverageComplete } from './pageConceptPageFamilyBlueprint.js';
import type { PageFunctionContract } from './types.js';

export type PageFamilyInteractionActionType =
  | 'NAVIGATE'
  | 'OPEN_DRAWER'
  | 'CLOSE_DRAWER'
  | 'OPEN_MODAL'
  | 'CLOSE_MODAL'
  | 'OPEN_OVERLAY'
  | 'EXPAND'
  | 'COLLAPSE'
  | 'SELECT'
  | 'DESELECT'
  | 'FILTER'
  | 'SEARCH'
  | 'TOGGLE'
  | 'SUBMIT'
  | 'SAVE'
  | 'UPDATE'
  | 'CREATE'
  | 'DELETE'
  | 'ARCHIVE'
  | 'APPROVE'
  | 'REJECT'
  | 'REGENERATE'
  | 'UPLOAD'
  | 'DOWNLOAD'
  | 'SWITCH_VIEW'
  | 'SWITCH_CONTEXT'
  | 'LOAD_MORE'
  | 'CUSTOM';

export type InteractionPersistenceLevel = 'LOCAL_UI' | 'PAGE_SESSION' | 'PROJECT_SESSION' | 'DURABLE';

export type PageFamilyInteractionLineageKind = 'INHERITED' | 'PAGE_SPECIFIC' | 'OVERRIDDEN';

export type PageFamilyInteractionRecordStatus =
  | 'MAPPED'
  | 'UNMAPPED'
  | 'ORPHANED_INTERACTION'
  | 'STALE';

export type PageFamilyInteractionRecord = {
  interactionId: string;
  pageId: string;
  pageName: string;
  pageDepth: 0 | 1 | 2;
  controlLabel: string;
  controlType: string;
  controlLocation: string;
  trigger: 'CLICK' | 'KEYBOARD' | 'DRAG';
  actionType: PageFamilyInteractionActionType;
  destination: string | null;
  destinationPageId: string | null;
  targetObject: string | null;
  stateMutation: string | null;
  dataDependency: string | null;
  permissionRequirement: string | null;
  experiencePatternId: string | null;
  responsiveBehavior: {
    mobile: string;
    tablet: string;
    desktop: string;
  };
  loadingState: string | null;
  successState: string | null;
  errorState: string | null;
  emptyState: string | null;
  disabledState: string | null;
  keyboardBehavior: string | null;
  backBehavior: string | null;
  persistenceBehavior: InteractionPersistenceLevel;
  implementationOwner: 'COMPOSER' | 'OPUS';
  lineageKind: PageFamilyInteractionLineageKind;
  status: PageFamilyInteractionRecordStatus;
  navigation?: {
    sourcePageId: string;
    controlId: string;
    destinationRoute: string | null;
    destinationPageId: string | null;
    backDestination: string | null;
    preservedState: readonly string[];
    scrollRestoration: 'AUTO' | 'MANUAL' | 'NONE';
    activeNavState: string | null;
  };
  stateMutationDetail?: {
    initialState: string;
    trigger: string;
    mutation: string;
    resultingState: string;
    persistenceLevel: InteractionPersistenceLevel;
  };
};

export type PageFamilyInteractionCoverageRow = {
  pageId: string;
  pageName: string;
  pageDepth: 0 | 1 | 2;
  totalInteractiveControls: number;
  mappedControls: number;
  inheritedControls: number;
  pageSpecificControls: number;
  overriddenControls: number;
  unmappedControls: number;
  coveragePercent: number;
};

export type PageFamilyInteractionCoverageMatrix = {
  matrixId: string;
  rows: readonly PageFamilyInteractionCoverageRow[];
  summary: {
    totalInteractiveControls: number;
    mappedControls: number;
    inheritedControls: number;
    pageSpecificControls: number;
    overriddenControls: number;
    unmappedControls: number;
    orphanedControls: number;
    coveragePercent: number;
    experiencePatternLinked: number;
    experiencePatternEligible: number;
  };
};

export type PageFamilyBuildReadiness = {
  pageTreeCoveragePercent: number;
  designInheritanceCoveragePercent: number;
  responsiveCoveragePercent: number;
  interactionCoveragePercent: number;
  undefinedPages: number;
  unmappedInteractions: number;
  orphanedInteractions: number;
  readyForOpus: boolean;
  blockedReason: string | null;
};

export type PageFamilyInteractionMap = {
  mapId: string;
  version: string;
  blueprintId: string;
  projectId: string;
  parentPageId: string;
  sourceViewportFamilyId: string;
  records: readonly PageFamilyInteractionRecord[];
  coverageMatrix: PageFamilyInteractionCoverageMatrix;
  buildReadiness: PageFamilyBuildReadiness;
  approvedAt: string | null;
  staleAt: string | null;
  createdAt: string;
};

const PARENT_WORKSPACE_SURFACES = new Set([
  'hero-rail',
  'authority-pair',
  'gallery',
  'candidate-actions',
  'structured-output',
  'pipeline',
  'concept-record',
  'view-controls',
  'viewport-band',
  'target-band',
  'context-bar',
  'header',
  'hero',
  'bottom-nav',
  'primary-nav',
  'overlay',
  'opus-dock',
]);

const INHERITED_SHELL_SURFACES = new Set(['header', 'bottom-nav', 'primary-nav', 'overlay']);

const EXPERIENCE_PATTERN_BY_HANDLER: Readonly<Record<string, string>> = {
  openOverflowMenu: 'MENU_EXPANDED_NAV',
  openHostModuleNav: 'MENU_EXPANDED_NAV',
  openCreativeContext: 'PROJECT_ACCESS_OVERLAY',
  openInspectCandidate: 'ENTRY_DETAIL_PANEL',
  openStructuredArtifact: 'ENTRY_DETAIL_PANEL',
  openReviewAuthority: 'ENTRY_DETAIL_PANEL',
  runPairReview: 'ENTRY_DETAIL_PANEL',
};

const NAVIGATION_HANDLER_ROUTES: Readonly<Record<string, string>> = {
  goWorkspace: 'WORKSPACE_HOME',
  goDesignHistory: 'DESIGN_HISTORY',
  goChangeHistory: 'CHANGE_HISTORY',
  goMasterAmendment: 'MASTER_AMENDMENT',
  goSectionReferences: 'SECTION_REFERENCES',
  goSectionAssets: 'SECTION_ASSETS',
  goSectionPages: 'SECTION_PAGES',
  goSectionSkins: 'SECTION_SKINS',
  goSectionHistory: 'SECTION_HISTORY',
  goSectionMore: 'SECTION_MORE',
};

function mapRegistryActionType(
  entry: DesignInteractionEntry,
): PageFamilyInteractionActionType {
  if (entry.actionType === 'NAVIGATION') return 'NAVIGATE';
  if (entry.actionType === 'OVERLAY') {
    if (entry.semanticRole.includes('drawer') || entry.semanticRole.includes('inspector')) return 'OPEN_DRAWER';
    if (entry.semanticRole.includes('modal') || entry.semanticRole.includes('confirm')) return 'OPEN_MODAL';
    return 'OPEN_OVERLAY';
  }
  if (entry.actionType === 'STATE_MUTATION') {
    if (entry.semanticRole.includes('disclosure') || entry.id === 'pair-toggle') return 'EXPAND';
    if (entry.semanticRole.includes('tab')) return 'SELECT';
    if (entry.semanticRole.includes('preview') || entry.semanticRole.includes('viewport')) return 'SWITCH_VIEW';
    if (entry.semanticRole.includes('scroll')) return 'LOAD_MORE';
    return 'UPDATE';
  }
  if (entry.actionType === 'COST_BEARING') {
    if (entry.handler.includes('regenerate')) return 'REGENERATE';
    return 'UPDATE';
  }
  if (entry.actionType === 'PERMISSION_GATED') {
    if (entry.handler.includes('Lock') || entry.handler.includes('promote')) return 'APPROVE';
    if (entry.handler.includes('MoveToBuild')) return 'SUBMIT';
    return 'UPDATE';
  }
  return 'CUSTOM';
}

function responsiveForPattern(patternId: string | null): PageFamilyInteractionRecord['responsiveBehavior'] {
  if (patternId === 'MENU_EXPANDED_NAV') {
    return {
      mobile: 'BOTTOM SHEET NAV',
      tablet: 'SIDE DRAWER NAV',
      desktop: 'PERSISTENT NAV RAIL',
    };
  }
  if (patternId === 'ENTRY_DETAIL_PANEL') {
    return {
      mobile: 'BOTTOM SHEET',
      tablet: 'SIDE PANEL',
      desktop: 'CONTEXT RAIL',
    };
  }
  if (patternId === 'PROJECT_ACCESS_OVERLAY') {
    return {
      mobile: 'FULL SCREEN SHEET',
      tablet: 'SIDE DRAWER',
      desktop: 'CONTEXTUAL OVERLAY',
    };
  }
  return {
    mobile: 'INLINE / TAP',
    tablet: 'INLINE / TAP',
    desktop: 'INLINE / CLICK',
  };
}

function entryAppliesToNode(entry: DesignInteractionEntry, node: PageFamilyBlueprintNode): boolean {
  if (entry.readonly || entry.actionType === 'READONLY') return false;
  if (node.depth === 0) return PARENT_WORKSPACE_SURFACES.has(entry.surface);
  return INHERITED_SHELL_SURFACES.has(entry.surface);
}

function lineageForEntry(entry: DesignInteractionEntry, node: PageFamilyBlueprintNode): PageFamilyInteractionLineageKind {
  if (node.depth === 0) return 'PAGE_SPECIFIC';
  if (entry.permission === 'founder') return 'PAGE_SPECIFIC';
  if (INHERITED_SHELL_SURFACES.has(entry.surface)) return 'INHERITED';
  return 'INHERITED';
}

function approvedExperiencePatterns(experience: PageExperienceExpressionContract | null | undefined): Set<string> {
  const labels = experience?.overlayPatterns ?? [];
  const set = new Set<string>();
  for (const p of labels) {
    set.add(p);
    if (p.includes('MENU')) set.add('MENU_EXPANDED_NAV');
    if (p.includes('ENTRY') || p.includes('DETAIL')) set.add('ENTRY_DETAIL_PANEL');
    if (p.includes('PROJECT')) set.add('PROJECT_ACCESS_OVERLAY');
  }
  return set;
}

function resolveExperiencePattern(
  handler: string,
  approved: Set<string>,
): string | null {
  const pattern = EXPERIENCE_PATTERN_BY_HANDLER[handler] ?? null;
  if (!pattern) return null;
  if (approved.has(pattern)) return pattern;
  return pattern;
}

function buildRecordForEntry(input: {
  entry: DesignInteractionEntry;
  node: PageFamilyBlueprintNode;
  blueprint: PageFamilyBlueprint;
  approvedPatterns: Set<string>;
}): PageFamilyInteractionRecord {
  const { entry, node, blueprint, approvedPatterns } = input;
  const actionType = mapRegistryActionType(entry);
  const patternId = resolveExperiencePattern(entry.handler, approvedPatterns);
  const lineageKind = lineageForEntry(entry, node);
  const destinationRoute =
    entry.destination ??
    NAVIGATION_HANDLER_ROUTES[entry.handler] ??
    (actionType === 'NAVIGATE' ? entry.handler : null);
  const destinationPageId =
    actionType === 'NAVIGATE' && destinationRoute?.startsWith('SECTION_') ? node.pageId : null;

  let status: PageFamilyInteractionRecordStatus = 'MAPPED';
  if (!DESIGN_INTERACTION_HANDLER_ALLOWLIST.includes(entry.handler as (typeof DESIGN_INTERACTION_HANDLER_ALLOWLIST)[number])) {
    status = 'UNMAPPED';
  }
  if (
    destinationPageId &&
    !blueprint.nodes.some((n) => n.pageId === destinationPageId)
  ) {
    status = 'ORPHANED_INTERACTION';
  }

  const persistence: InteractionPersistenceLevel =
    entry.actionType === 'STATE_MUTATION' ? 'PAGE_SESSION'
    : entry.actionType === 'NAVIGATION' ? 'PROJECT_SESSION'
    : 'LOCAL_UI';

  const record: PageFamilyInteractionRecord = {
    interactionId: `${node.pageId}::${entry.id}`,
    pageId: node.pageId,
    pageName: node.pageName,
    pageDepth: node.depth,
    controlLabel: entry.label,
    controlType: entry.semanticRole,
    controlLocation: entry.surface,
    trigger: 'CLICK',
    actionType,
    destination: destinationRoute,
    destinationPageId,
    targetObject: entry.handler,
    stateMutation: entry.actionType === 'STATE_MUTATION' ? entry.semanticRole : null,
    dataDependency: entry.permission === 'founder' ? 'FOUNDER_SESSION' : null,
    permissionRequirement: entry.permission ?? 'any',
    experiencePatternId: patternId,
    responsiveBehavior: responsiveForPattern(patternId),
    loadingState: entry.actionType === 'COST_BEARING' ? 'IN_FLIGHT' : null,
    successState: entry.actionType === 'COST_BEARING' ? 'ARTIFACT_UPDATED' : null,
    errorState: entry.actionType === 'COST_BEARING' ? 'GENERATION_FAILED' : null,
    emptyState: null,
    disabledState: entry.actionType === 'DISABLED' ? 'DISABLED' : null,
    keyboardBehavior: 'ENTER ACTIVATES · ESC DISMISSES OVERLAY',
    backBehavior: actionType === 'NAVIGATE' ? 'BROWSER_BACK_OR_PARENT_ROUTE' : 'CLOSE_OVERLAY',
    persistenceBehavior: persistence,
    implementationOwner: patternId ? 'OPUS' : 'COMPOSER',
    lineageKind,
    status,
  };

  if (actionType === 'NAVIGATE') {
    record.navigation = {
      sourcePageId: node.pageId,
      controlId: entry.id,
      destinationRoute,
      destinationPageId,
      backDestination: node.route || blueprint.parentPageId,
      preservedState: ['scroll', 'selection'],
      scrollRestoration: 'AUTO',
      activeNavState: entry.id,
    };
  }

  if (entry.actionType === 'STATE_MUTATION' || entry.actionType === 'PERMISSION_GATED') {
    record.stateMutationDetail = {
      initialState: 'DEFAULT',
      trigger: entry.label,
      mutation: entry.handler,
      resultingState: 'ACTIVE',
      persistenceLevel: persistence,
    };
  }

  return record;
}

function buildCoverageMatrix(
  records: readonly PageFamilyInteractionRecord[],
  blueprint: PageFamilyBlueprint,
): PageFamilyInteractionCoverageMatrix {
  const rows: PageFamilyInteractionCoverageRow[] = blueprint.nodes.map((node) => {
    const pageRecords = records.filter((r) => r.pageId === node.pageId);
    const mapped = pageRecords.filter((r) => r.status === 'MAPPED').length;
    const inherited = pageRecords.filter((r) => r.lineageKind === 'INHERITED').length;
    const pageSpecific = pageRecords.filter((r) => r.lineageKind === 'PAGE_SPECIFIC').length;
    const overridden = pageRecords.filter((r) => r.lineageKind === 'OVERRIDDEN').length;
    const unmapped = pageRecords.filter((r) => r.status === 'UNMAPPED').length;
    const total = pageRecords.length;
    const coveragePercent = total === 0 ? 100 : Math.round((mapped / total) * 100);
    return {
      pageId: node.pageId,
      pageName: node.pageName,
      pageDepth: node.depth,
      totalInteractiveControls: total,
      mappedControls: mapped,
      inheritedControls: inherited,
      pageSpecificControls: pageSpecific,
      overriddenControls: overridden,
      unmappedControls: unmapped,
      coveragePercent,
    };
  });

  const totalInteractiveControls = records.length;
  const mappedControls = records.filter((r) => r.status === 'MAPPED').length;
  const inheritedControls = records.filter((r) => r.lineageKind === 'INHERITED').length;
  const pageSpecificControls = records.filter((r) => r.lineageKind === 'PAGE_SPECIFIC').length;
  const overriddenControls = records.filter((r) => r.lineageKind === 'OVERRIDDEN').length;
  const unmappedControls = records.filter((r) => r.status === 'UNMAPPED').length;
  const orphanedControls = records.filter((r) => r.status === 'ORPHANED_INTERACTION').length;
  const experiencePatternEligible = records.filter((r) => r.experiencePatternId).length;
  const experiencePatternLinked = records.filter(
    (r) => r.experiencePatternId && r.status === 'MAPPED',
  ).length;

  return {
    matrixId: `pfim-${blueprint.blueprintId.slice(-10)}-${Date.now()}`,
    rows,
    summary: {
      totalInteractiveControls,
      mappedControls,
      inheritedControls,
      pageSpecificControls,
      overriddenControls,
      unmappedControls,
      orphanedControls,
      coveragePercent:
        totalInteractiveControls === 0 ?
          100
        : Math.round((mappedControls / totalInteractiveControls) * 100),
      experiencePatternLinked,
      experiencePatternEligible,
    },
  };
}

export function buildPageFamilyBuildReadiness(input: {
  blueprint: PageFamilyBlueprint;
  interactionMap: PageFamilyInteractionMap | null;
}): PageFamilyBuildReadiness {
  const { blueprint, interactionMap } = input;
  const pageTreeCoveragePercent =
    blueprint.coverageSummary.undefinedPageCount === 0 ? 100 : (
      Math.round(
        ((blueprint.coverageSummary.totalPageCount - blueprint.coverageSummary.undefinedPageCount) /
          Math.max(blueprint.coverageSummary.totalPageCount, 1)) *
          100,
      )
    );
  const designInheritanceCoveragePercent = blueprint.approvedAt ? 100 : 0;
  const responsiveCoveragePercent =
    blueprint.archetypeShells.every((s) => s.mobile.length && s.tablet.length && s.desktop.length) ?
      100
    : 0;
  const interactionCoveragePercent = interactionMap?.coverageMatrix.summary.coveragePercent ?? 0;
  const unmappedInteractions = interactionMap?.coverageMatrix.summary.unmappedControls ?? 999;
  const orphanedInteractions = interactionMap?.coverageMatrix.summary.orphanedControls ?? 999;
  const undefinedPages = blueprint.coverageSummary.undefinedPageCount;
  const interactionApproved = Boolean(interactionMap?.approvedAt);
  const readyForOpus =
    pageTreeCoveragePercent === 100 &&
    designInheritanceCoveragePercent === 100 &&
    responsiveCoveragePercent === 100 &&
    interactionCoveragePercent === 100 &&
    undefinedPages === 0 &&
    unmappedInteractions === 0 &&
    orphanedInteractions === 0 &&
    interactionApproved &&
    Boolean(blueprint.approvedAt);

  let blockedReason: string | null = null;
  if (!readyForOpus) {
    if (unmappedInteractions > 0) blockedReason = 'PAGE_FAMILY_INTERACTION_MAP_INCOMPLETE';
    else if (orphanedInteractions > 0) blockedReason = 'ORPHANED_INTERACTION';
    else if (!interactionApproved) blockedReason = 'PAGE_FAMILY_INTERACTION_MAP_APPROVAL_REQUIRED';
    else if (undefinedPages > 0) blockedReason = 'PAGE_FAMILY_BLUEPRINT_INCOMPLETE';
  }

  return {
    pageTreeCoveragePercent,
    designInheritanceCoveragePercent,
    responsiveCoveragePercent,
    interactionCoveragePercent,
    undefinedPages,
    unmappedInteractions,
    orphanedInteractions,
    readyForOpus,
    blockedReason,
  };
}

export function compilePageFamilyInteractionMap(input: {
  blueprint: PageFamilyBlueprint;
  experienceContract?: PageExperienceExpressionContract | null;
  functionContract?: PageFunctionContract | null;
}): PageFamilyInteractionMap {
  const approvedPatterns = approvedExperiencePatterns(input.experienceContract);
  const records: PageFamilyInteractionRecord[] = [];
  for (const node of input.blueprint.nodes) {
    for (const entry of DESIGN_INTERACTION_REGISTRY) {
      if (!entryAppliesToNode(entry, node)) continue;
      records.push(
        buildRecordForEntry({
          entry,
          node,
          blueprint: input.blueprint,
          approvedPatterns,
        }),
      );
    }
  }

  const coverageMatrix = buildCoverageMatrix(records, input.blueprint);
  const draft: PageFamilyInteractionMap = {
    mapId: `pfim-${input.blueprint.blueprintId}-${Date.now()}`,
    version: '1',
    blueprintId: input.blueprint.blueprintId,
    projectId: input.blueprint.projectId,
    parentPageId: input.blueprint.parentPageId,
    sourceViewportFamilyId: input.blueprint.sourceViewportFamilyId,
    records,
    coverageMatrix,
    buildReadiness: buildPageFamilyBuildReadiness({ blueprint: input.blueprint, interactionMap: null }),
    approvedAt: null,
    staleAt: null,
    createdAt: new Date().toISOString(),
  };
  draft.buildReadiness = buildPageFamilyBuildReadiness({ blueprint: input.blueprint, interactionMap: draft });
  return draft;
}

export function validatePageFamilyInteractionMap(
  map: PageFamilyInteractionMap,
  blueprint: PageFamilyBlueprint,
): { ok: true } | { ok: false; code: string } {
  if (map.blueprintId !== blueprint.blueprintId) return { ok: false, code: 'INTERACTION_MAP_BLUEPRINT_MISMATCH' };
  if (map.coverageMatrix.summary.unmappedControls > 0) {
    return { ok: false, code: 'PAGE_FAMILY_INTERACTION_MAP_INCOMPLETE' };
  }
  if (map.coverageMatrix.summary.orphanedControls > 0) return { ok: false, code: 'ORPHANED_INTERACTION' };
  for (const record of map.records) {
    if (record.actionType === 'NAVIGATE' && record.navigation && !record.navigation.destinationRoute) {
      return { ok: false, code: 'ORPHANED_INTERACTION' };
    }
    if (
      record.destinationPageId &&
      !blueprint.nodes.some((n) => n.pageId === record.destinationPageId)
    ) {
      return { ok: false, code: 'DEAD_DESTINATION' };
    }
  }
  if (map.coverageMatrix.summary.coveragePercent < 100) {
    return { ok: false, code: 'PAGE_FAMILY_INTERACTION_MAP_INCOMPLETE' };
  }
  return { ok: true };
}

export function assertPageFamilyInteractionMapComplete(map: PageFamilyInteractionMap | null | undefined): void {
  if (!map) throw new Error('PAGE_FAMILY_INTERACTION_MAP_REQUIRED');
  if (map.staleAt) throw new Error('PAGE_FAMILY_INTERACTION_MAP_STALE');
  if (map.coverageMatrix.summary.unmappedControls > 0) {
    throw new Error('PAGE_FAMILY_INTERACTION_MAP_INCOMPLETE');
  }
  if (map.coverageMatrix.summary.orphanedControls > 0) throw new Error('ORPHANED_INTERACTION');
  if (!map.approvedAt) throw new Error('PAGE_FAMILY_INTERACTION_MAP_APPROVAL_REQUIRED');
}

export function markPageFamilyInteractionMapStale(
  map: PageFamilyInteractionMap,
  reason: string,
): PageFamilyInteractionMap {
  return {
    ...map,
    approvedAt: null,
    staleAt: new Date().toISOString(),
    records: map.records.map((r) => ({ ...r, status: r.status === 'MAPPED' ? 'STALE' : r.status })),
    buildReadiness: {
      ...map.buildReadiness,
      readyForOpus: false,
      blockedReason: reason,
    },
  };
}

export type PageFamilyInteractionReceipt = {
  totalInteractions: number;
  mappedInteractions: number;
  inheritedInteractions: number;
  pageSpecificInteractions: number;
  overriddenInteractions: number;
  unmappedInteractions: number;
  orphanedInteractions: number;
  interactionCoveragePercent: number;
  navigationTargetCoverage: 'PASS' | 'FAIL';
  stateMutationCoverage: 'PASS' | 'FAIL';
  experiencePatternLinkage: 'PASS' | 'FAIL';
  responsiveInteractionCoverage: 'PASS' | 'FAIL';
};

export function buildPageFamilyInteractionReceipt(map: PageFamilyInteractionMap): PageFamilyInteractionReceipt {
  const s = map.coverageMatrix.summary;
  const navRecords = map.records.filter((r) => r.actionType === 'NAVIGATE');
  const navPass = navRecords.every((r) => r.status === 'MAPPED' && r.navigation?.destinationRoute);
  const mutationRecords = map.records.filter((r) => r.stateMutationDetail);
  const mutationPass = mutationRecords.every((r) => r.status === 'MAPPED' && r.stateMutationDetail?.mutation);
  const experienceEligible = map.records.filter((r) => r.experiencePatternId);
  const experiencePass =
    experienceEligible.length === 0 ||
    experienceEligible.every((r) => r.status === 'MAPPED' && r.experiencePatternId);
  const responsivePass = map.records.every(
    (r) => r.responsiveBehavior.mobile && r.responsiveBehavior.tablet && r.responsiveBehavior.desktop,
  );
  return {
    totalInteractions: s.totalInteractiveControls,
    mappedInteractions: s.mappedControls,
    inheritedInteractions: s.inheritedControls,
    pageSpecificInteractions: s.pageSpecificControls,
    overriddenInteractions: s.overriddenControls,
    unmappedInteractions: s.unmappedControls,
    orphanedInteractions: s.orphanedControls,
    interactionCoveragePercent: s.coveragePercent,
    navigationTargetCoverage: navPass ? 'PASS' : 'FAIL',
    stateMutationCoverage: mutationPass ? 'PASS' : 'FAIL',
    experiencePatternLinkage: experiencePass ? 'PASS' : 'FAIL',
    responsiveInteractionCoverage: responsivePass ? 'PASS' : 'FAIL',
  };
}

export function assertOpusHandoffInteractionMapReady(blueprint: PageFamilyBlueprint, map: PageFamilyInteractionMap | null): void {
  assertPageFamilyBlueprintCoverageComplete(blueprint);
  assertPageFamilyInteractionMapComplete(map);
}
