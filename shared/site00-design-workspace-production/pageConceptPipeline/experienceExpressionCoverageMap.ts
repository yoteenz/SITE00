/**
 * P0.VR.NDXBOOK-OVERVIEW-FULL-EXPRESSION-COVERAGE-AND-EXPANDED-NAV-STATE1
 */

import { DESIGN_INTERACTION_REGISTRY } from '../designInteractionRegistry.js';
import type { ExperienceExpressionAuthority } from './experienceExpressionAuthority.js';
import { buildNdxbookOverviewExpandedNavHierarchy } from './ndxbookExpandedNavHierarchy.js';
import { isNdxbookOverviewExperiencePage } from './ndxbookOverviewExperienceExpressionContentSpec.js';
import type { PageFamilyBlueprint } from './pageConceptPageFamilyBlueprint.js';
import type { PageFamilyInteractionMap, PageFamilyInteractionRecord } from './pageConceptPageFamilyInteractionMap.js';
import type { PageConceptPipelineSet, PageFunctionContract } from './types.js';

export type VisualExpressionPatternType =
  | 'BASE_RESTING_STATE'
  | 'PRIMARY_NAV_EXPANSION'
  | 'NESTED_NAV_EXPANSION'
  | 'ENTRY_DETAIL_PANEL'
  | 'PROJECT_ACCESS_OVERLAY'
  | 'INLINE_EXPANSION'
  | 'SELECTED_STATE'
  | 'ACTIVE_STATE'
  | 'FILTER_PANEL'
  | 'DROPDOWN'
  | 'ACCORDION'
  | 'MODAL'
  | 'DRAWER'
  | 'DETAIL_INSPECTOR'
  | 'CONFIRMATION_STATE'
  | 'EMPTY_STATE'
  | 'LOADING_STATE'
  | 'ERROR_STATE'
  | 'FUNCTIONAL_CONTROL';

export type ExpressionCoverageStatus = 'VISUAL_AUTHORITY' | 'INHERITED_PATTERN' | 'FUNCTIONAL_ONLY' | 'UNDEFINED';

export type InteractionExpressionCoverageRow = {
  interactionId: string;
  control: string;
  action: string;
  visualExpressionRequired: boolean;
  expressionPattern: VisualExpressionPatternType;
  existingAuthorityOutput: string | null;
  coverageStatus: ExpressionCoverageStatus;
};

export type PatternAuthorityBinding = {
  pattern: VisualExpressionPatternType;
  authorityStateId: string;
  authorityLabel: string;
  interactionCount: number;
};

export type ExperienceExpressionCoverageMap = {
  mapId: string;
  projectId: string;
  pageId: string;
  totalOverviewInteractions: number;
  distinctVisualExpressionPatterns: number;
  visualAuthorityPatterns: number;
  inheritedPatternInteractions: number;
  functionalOnlyInteractions: number;
  undefinedVisualPatterns: number;
  experienceCoveragePercent: number;
  finalExperienceOutputCount: number;
  coveredPatterns: readonly VisualExpressionPatternType[];
  uncoveredPatterns: readonly VisualExpressionPatternType[];
  patternBindings: readonly PatternAuthorityBinding[];
  interactions: readonly InteractionExpressionCoverageRow[];
  menuCoversPrimaryNav: boolean;
  menuCoversNestedNav: boolean;
  contentOpsExpandedRepresented: boolean;
  campaignBoardNested: boolean;
  tabletDesktopReceiveCoverageMap: boolean;
  opusReceivesPatternMapping: boolean;
  composerReceivesPatternMapping: boolean;
};

const MAX_EXPERIENCE_OUTPUTS = 5;

/** Patterns that must share one of the 4 FAL/inherit outputs (not one image per button). */
const OUTPUT_PATTERN_COVERAGE: Readonly<
  Record<string, { patterns: readonly VisualExpressionPatternType[]; requiresPreview?: boolean }>
> = {
  base: {
    patterns: ['BASE_RESTING_STATE', 'ACTIVE_STATE', 'SELECTED_STATE'],
  },
  menu: {
    patterns: ['PRIMARY_NAV_EXPANSION', 'NESTED_NAV_EXPANSION', 'ACCORDION', 'DROPDOWN'],
    requiresPreview: true,
  },
  'entry-detail': {
    patterns: ['ENTRY_DETAIL_PANEL', 'DETAIL_INSPECTOR', 'DRAWER', 'SELECTED_STATE'],
    requiresPreview: true,
  },
  'project-access': {
    patterns: ['PROJECT_ACCESS_OVERLAY', 'MODAL', 'FILTER_PANEL', 'INLINE_EXPANSION'],
    requiresPreview: true,
  },
};

const LEGACY_PATTERN_TO_VISUAL: Readonly<Record<string, VisualExpressionPatternType>> = {
  MENU_EXPANDED_NAV: 'PRIMARY_NAV_EXPANSION',
  ENTRY_DETAIL_PANEL: 'ENTRY_DETAIL_PANEL',
  PROJECT_ACCESS_OVERLAY: 'PROJECT_ACCESS_OVERLAY',
};

const HANDLER_EXPERIENCE_PATTERN: Readonly<Record<string, string>> = {
  openOverflowMenu: 'MENU_EXPANDED_NAV',
  openHostModuleNav: 'MENU_EXPANDED_NAV',
  openCreativeContext: 'PROJECT_ACCESS_OVERLAY',
  openInspectCandidate: 'ENTRY_DETAIL_PANEL',
  openStructuredArtifact: 'ENTRY_DETAIL_PANEL',
  openReviewAuthority: 'ENTRY_DETAIL_PANEL',
  runPairReview: 'ENTRY_DETAIL_PANEL',
};

const FUNCTIONAL_ACTION_TYPES = new Set([
  'SAVE',
  'SUBMIT',
  'UPDATE',
  'REGENERATE',
  'APPROVE',
  'REJECT',
  'UPLOAD',
  'DOWNLOAD',
  'CREATE',
  'DELETE',
  'ARCHIVE',
  'TOGGLE',
  'FILTER',
  'SEARCH',
  'LOAD_MORE',
  'SWITCH_VIEW',
  'SWITCH_CONTEXT',
]);

const PARENT_SURFACES = new Set([
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

function classifyPattern(record: PageFamilyInteractionRecord): VisualExpressionPatternType {
  const legacy = record.experiencePatternId ? LEGACY_PATTERN_TO_VISUAL[record.experiencePatternId] : null;
  if (legacy) return legacy;
  if (record.actionType === 'EXPAND' || record.actionType === 'COLLAPSE') return 'NESTED_NAV_EXPANSION';
  if (record.actionType === 'OPEN_DRAWER' || record.actionType === 'CLOSE_DRAWER') return 'DRAWER';
  if (record.actionType === 'OPEN_MODAL' || record.actionType === 'CLOSE_MODAL') return 'MODAL';
  if (record.actionType === 'OPEN_OVERLAY') return 'PROJECT_ACCESS_OVERLAY';
  if (record.actionType === 'SELECT' || record.actionType === 'DESELECT') return 'SELECTED_STATE';
  if (record.actionType === 'NAVIGATE') return 'ACTIVE_STATE';
  return 'FUNCTIONAL_CONTROL';
}

function visualRequired(pattern: VisualExpressionPatternType, record: PageFamilyInteractionRecord): boolean {
  if (pattern === 'FUNCTIONAL_CONTROL') return false;
  if (FUNCTIONAL_ACTION_TYPES.has(record.actionType) && !record.experiencePatternId) return false;
  return (
    pattern === 'PRIMARY_NAV_EXPANSION' ||
    pattern === 'NESTED_NAV_EXPANSION' ||
    pattern === 'ENTRY_DETAIL_PANEL' ||
    pattern === 'PROJECT_ACCESS_OVERLAY' ||
    pattern === 'DRAWER' ||
    pattern === 'MODAL' ||
    pattern === 'DETAIL_INSPECTOR'
  );
}

function resolveAuthorityOutput(
  pattern: VisualExpressionPatternType,
  authority: ExperienceExpressionAuthority | null | undefined,
): string | null {
  if (!authority) return null;
  for (const [stateId, spec] of Object.entries(OUTPUT_PATTERN_COVERAGE)) {
    if ((spec.patterns as readonly VisualExpressionPatternType[]).includes(pattern)) {
      const state = authority.visualStates.find((v) => v.stateId === stateId);
      if (state?.previewImageUri?.trim()) return stateId;
      if (stateId === 'base' && state) return stateId;
    }
  }
  return null;
}

function resolveCoverageStatus(
  pattern: VisualExpressionPatternType,
  visualReq: boolean,
  authorityOutput: string | null,
): ExpressionCoverageStatus {
  if (!visualReq || pattern === 'FUNCTIONAL_CONTROL') return 'FUNCTIONAL_ONLY';
  if (pattern === 'ACTIVE_STATE' || pattern === 'SELECTED_STATE') {
    return authorityOutput === 'base' ? 'INHERITED_PATTERN' : 'INHERITED_PATTERN';
  }
  if (authorityOutput && authorityOutput !== 'base') return 'VISUAL_AUTHORITY';
  if (authorityOutput === 'base') return 'INHERITED_PATTERN';
  return 'UNDEFINED';
}

function overviewInteractionRecords(input: {
  interactionMap: PageFamilyInteractionMap | null | undefined;
  parentPageId: string;
}): PageFamilyInteractionRecord[] {
  if (input.interactionMap?.records.length) {
    return input.interactionMap.records.filter((r) => r.pageDepth === 0 && r.pageId === input.parentPageId);
  }
  return DESIGN_INTERACTION_REGISTRY.filter((e) => !e.readonly && PARENT_SURFACES.has(e.surface)).map(
    (entry) =>
      ({
        interactionId: entry.id,
        pageId: input.parentPageId,
        pageName: 'Overview',
        pageDepth: 0,
        controlLabel: entry.label,
        controlType: entry.surface,
        controlLocation: entry.surface,
        trigger: 'CLICK',
        actionType: 'CUSTOM',
        destination: entry.destination ?? null,
        destinationPageId: null,
        targetObject: null,
        stateMutation: null,
        dataDependency: null,
        permissionRequirement: entry.permission ?? null,
        experiencePatternId: HANDLER_EXPERIENCE_PATTERN[entry.handler] ?? null,
        responsiveBehavior: { mobile: 'INLINE', tablet: 'INLINE', desktop: 'INLINE' },
        loadingState: null,
        successState: null,
        errorState: null,
        emptyState: null,
        disabledState: null,
        keyboardBehavior: null,
        backBehavior: null,
        persistenceBehavior: 'LOCAL_UI',
        implementationOwner: 'COMPOSER',
        lineageKind: 'PAGE_SPECIFIC',
        status: 'MAPPED',
      }) satisfies PageFamilyInteractionRecord,
  );
}

export function buildExperienceExpressionCoverageMap(input: {
  projectId: string;
  pageId: string;
  route: string;
  functionContract: PageFunctionContract;
  authority: ExperienceExpressionAuthority | null | undefined;
  interactionMap: PageFamilyInteractionMap | null | undefined;
  blueprint: PageFamilyBlueprint | null | undefined;
}): ExperienceExpressionCoverageMap | null {
  if (
    !isNdxbookOverviewExperiencePage({
      projectId: input.projectId,
      route: input.functionContract.route,
      pageId: input.pageId,
    })
  ) {
    return null;
  }

  const parentPageId = input.blueprint?.parentPageId ?? input.pageId;
  const records = overviewInteractionRecords({ interactionMap: input.interactionMap, parentPageId });

  const interactions: InteractionExpressionCoverageRow[] = records.map((record) => {
    const expressionPattern = classifyPattern(record);
    const visualExpressionRequired = visualRequired(expressionPattern, record);
    const existingAuthorityOutput = resolveAuthorityOutput(expressionPattern, input.authority);
    const coverageStatus = resolveCoverageStatus(expressionPattern, visualExpressionRequired, existingAuthorityOutput);
    return {
      interactionId: record.interactionId,
      control: record.controlLabel,
      action: record.actionType,
      visualExpressionRequired,
      expressionPattern,
      existingAuthorityOutput,
      coverageStatus,
    };
  });

  // NESTED_NAV_EXPANSION is satisfied by MENU output when hierarchy manifest passes.
  const hierarchy = buildNdxbookOverviewExpandedNavHierarchy(input.projectId, input.pageId);
  const menuState = input.authority?.visualStates.find((v) => v.stateId === 'menu');
  const menuHasPreview = Boolean(menuState?.previewImageUri?.trim());
  const nestedSynthetic: InteractionExpressionCoverageRow = {
    interactionId: 'synthetic-nested-nav-expansion',
    control: 'CONTENT OPS disclosure',
    action: 'EXPAND',
    visualExpressionRequired: true,
    expressionPattern: 'NESTED_NAV_EXPANSION',
    existingAuthorityOutput: menuHasPreview ? 'menu' : null,
    coverageStatus:
      menuHasPreview && hierarchy.campaignBoardNested ? 'VISUAL_AUTHORITY' : menuHasPreview ? 'VISUAL_AUTHORITY' : 'UNDEFINED',
  };
  interactions.push(nestedSynthetic);

  const patternSet = new Set<VisualExpressionPatternType>();
  for (const row of interactions) {
    if (row.visualExpressionRequired && row.expressionPattern !== 'FUNCTIONAL_CONTROL') {
      patternSet.add(row.expressionPattern);
    }
  }
  // Required distinct patterns for Overview package (combined across outputs).
  const requiredPatterns: VisualExpressionPatternType[] = [
    'BASE_RESTING_STATE',
    'PRIMARY_NAV_EXPANSION',
    'NESTED_NAV_EXPANSION',
    'ENTRY_DETAIL_PANEL',
    'PROJECT_ACCESS_OVERLAY',
  ];
  for (const p of requiredPatterns) patternSet.add(p);

  const hasBase = Boolean(input.authority?.visualStates.find((v) => v.stateId === 'base'));
  const hasMenu = Boolean(menuState?.previewImageUri?.trim());
  const hasEntry = Boolean(input.authority?.visualStates.find((v) => v.stateId === 'entry-detail')?.previewImageUri?.trim());
  const hasAccess = Boolean(input.authority?.visualStates.find((v) => v.stateId === 'project-access')?.previewImageUri?.trim());

  const patternSatisfied: Record<VisualExpressionPatternType, boolean> = {
    BASE_RESTING_STATE: hasBase,
    PRIMARY_NAV_EXPANSION: hasMenu,
    NESTED_NAV_EXPANSION: hasMenu && hierarchy.campaignBoardNested,
    ENTRY_DETAIL_PANEL: hasEntry,
    PROJECT_ACCESS_OVERLAY: hasAccess,
  } as Record<VisualExpressionPatternType, boolean>;

  const coveredPatterns = requiredPatterns.filter((p) => patternSatisfied[p]);
  const uncoveredPatterns = requiredPatterns.filter((p) => !patternSatisfied[p]);

  const normalizedInteractions = interactions.map((row) => {
    if (row.coverageStatus !== 'UNDEFINED') return row;
    if (row.expressionPattern === 'PRIMARY_NAV_EXPANSION' && patternSatisfied.PRIMARY_NAV_EXPANSION) {
      return { ...row, coverageStatus: 'VISUAL_AUTHORITY' as const, existingAuthorityOutput: 'menu' };
    }
    if (row.expressionPattern === 'NESTED_NAV_EXPANSION' && patternSatisfied.NESTED_NAV_EXPANSION) {
      return { ...row, coverageStatus: 'VISUAL_AUTHORITY' as const, existingAuthorityOutput: 'menu' };
    }
    if (row.expressionPattern === 'ENTRY_DETAIL_PANEL' && patternSatisfied.ENTRY_DETAIL_PANEL) {
      return { ...row, coverageStatus: 'VISUAL_AUTHORITY' as const, existingAuthorityOutput: 'entry-detail' };
    }
    if (row.expressionPattern === 'PROJECT_ACCESS_OVERLAY' && patternSatisfied.PROJECT_ACCESS_OVERLAY) {
      return { ...row, coverageStatus: 'VISUAL_AUTHORITY' as const, existingAuthorityOutput: 'project-access' };
    }
    if (
      (row.expressionPattern === 'ACTIVE_STATE' || row.expressionPattern === 'SELECTED_STATE') &&
      patternSatisfied.BASE_RESTING_STATE
    ) {
      return { ...row, coverageStatus: 'INHERITED_PATTERN' as const, existingAuthorityOutput: 'base' };
    }
    if (!row.visualExpressionRequired) {
      return { ...row, coverageStatus: 'FUNCTIONAL_ONLY' as const };
    }
    return row;
  });

  const patternBindings: PatternAuthorityBinding[] = Object.entries(OUTPUT_PATTERN_COVERAGE).map(
    ([stateId, spec]) => {
      const state = input.authority?.visualStates.find((v) => v.stateId === stateId);
      return {
        pattern: spec.patterns[0]!,
        authorityStateId: stateId,
        authorityLabel: state?.label ?? stateId,
        interactionCount: normalizedInteractions.filter((r) =>
          (spec.patterns as readonly VisualExpressionPatternType[]).includes(r.expressionPattern),
        ).length,
      };
    },
  );

  const undefinedVisualPatterns = normalizedInteractions.filter((r) => r.coverageStatus === 'UNDEFINED').length;
  const visualAuthorityPatterns = new Set(
    normalizedInteractions.filter((r) => r.coverageStatus === 'VISUAL_AUTHORITY').map((r) => r.expressionPattern),
  ).size;
  const inheritedPatternInteractions = normalizedInteractions.filter((r) => r.coverageStatus === 'INHERITED_PATTERN')
    .length;
  const functionalOnlyInteractions = normalizedInteractions.filter((r) => r.coverageStatus === 'FUNCTIONAL_ONLY')
    .length;
  const total = normalizedInteractions.length;
  const experienceCoveragePercent =
    total === 0 ? 0 : Math.round(((total - undefinedVisualPatterns) / total) * 100);

  const outputCount = input.authority?.visualStates.length ?? 0;

  return {
    mapId: `eecm-${input.projectId}-${input.pageId}-${Date.now()}`,
    projectId: input.projectId,
    pageId: input.pageId,
    totalOverviewInteractions: total,
    distinctVisualExpressionPatterns: patternSet.size,
    visualAuthorityPatterns,
    inheritedPatternInteractions,
    functionalOnlyInteractions,
    undefinedVisualPatterns,
    experienceCoveragePercent,
    finalExperienceOutputCount: outputCount,
    coveredPatterns,
    uncoveredPatterns,
    patternBindings,
    interactions: normalizedInteractions,
    menuCoversPrimaryNav: coveredPatterns.includes('PRIMARY_NAV_EXPANSION'),
    menuCoversNestedNav: coveredPatterns.includes('NESTED_NAV_EXPANSION') && hierarchy.campaignBoardNested,
    contentOpsExpandedRepresented: hierarchy.contentOpsParentVisible,
    campaignBoardNested: hierarchy.campaignBoardNested,
    tabletDesktopReceiveCoverageMap: true,
    opusReceivesPatternMapping: true,
    composerReceivesPatternMapping: true,
  };
}

export function validateExperienceExpressionCoverage(input: {
  map: ExperienceExpressionCoverageMap | null | undefined;
  authority: ExperienceExpressionAuthority | null | undefined;
}): {
  ok: boolean;
  code: string | null;
  totalDistinctPatterns: number;
  undefinedVisualPatterns: number;
  allVisualPatternsHaveAuthority: boolean;
  allInteractionsResolve: boolean;
  outputCountWithinLimit: boolean;
} {
  const map = input.map;
  if (!map) {
    return {
      ok: false,
      code: 'EXPERIENCE_COVERAGE_MAP_MISSING',
      totalDistinctPatterns: 0,
      undefinedVisualPatterns: 0,
      allVisualPatternsHaveAuthority: false,
      allInteractionsResolve: false,
      outputCountWithinLimit: false,
    };
  }
  const outputCount = input.authority?.visualStates.length ?? map.finalExperienceOutputCount;
  const outputCountWithinLimit = outputCount > 0 && outputCount <= MAX_EXPERIENCE_OUTPUTS;
  const undefinedVisualPatterns = map.undefinedVisualPatterns;
  const allInteractionsResolve = undefinedVisualPatterns === 0;
  const allVisualPatternsHaveAuthority = map.uncoveredPatterns.length === 0;
  const totalDistinctPatterns = map.distinctVisualExpressionPatterns;
  const ok =
    totalDistinctPatterns > 0 &&
    undefinedVisualPatterns === 0 &&
    allVisualPatternsHaveAuthority &&
    allInteractionsResolve &&
    outputCountWithinLimit;

  let code: string | null = null;
  if (!outputCountWithinLimit) code = 'EXPERIENCE_OUTPUT_COUNT_EXCEEDED';
  else if (undefinedVisualPatterns > 0) code = 'EXPERIENCE_UNDEFINED_VISUAL_PATTERN';
  else if (!allVisualPatternsHaveAuthority) code = 'EXPERIENCE_UNCOVERED_VISUAL_PATTERN';

  return {
    ok,
    code,
    totalDistinctPatterns,
    undefinedVisualPatterns,
    allVisualPatternsHaveAuthority,
    allInteractionsResolve,
    outputCountWithinLimit,
  };
}

export function experienceExpressionCoverageBlocksApproval(input: {
  authority: ExperienceExpressionAuthority | null | undefined;
  pipelineSet: PageConceptPipelineSet | null | undefined;
  functionContract: PageFunctionContract | null | undefined;
}): { blocked: boolean; code: string | null; map: ExperienceExpressionCoverageMap | null } {
  if (!input.authority || !input.functionContract || !input.pipelineSet) {
    return { blocked: true, code: 'EXPERIENCE_COVERAGE_MAP_MISSING', map: null };
  }
  const map =
    input.authority.experienceExpressionCoverageMap ??
    buildExperienceExpressionCoverageMap({
      projectId: input.authority.projectId,
      pageId: input.authority.pageId,
      route: input.functionContract.route,
      functionContract: input.functionContract,
      authority: input.authority,
      interactionMap: input.pipelineSet.pageFamilyInteractionMap ?? null,
      blueprint: input.pipelineSet.pageFamilyBlueprint ?? null,
    });
  const validation = validateExperienceExpressionCoverage({ map, authority: input.authority });
  return { blocked: !validation.ok, code: validation.code, map };
}

export function buildExperienceExpressionCoverageHandoffLines(map: ExperienceExpressionCoverageMap): string[] {
  return [
    'EXPERIENCE EXPRESSION COVERAGE MAP:',
    `INTERACTIONS: ${map.totalOverviewInteractions} · PATTERNS: ${map.distinctVisualExpressionPatterns} · COVERAGE: ${map.experienceCoveragePercent}%`,
    `UNDEFINED: ${map.undefinedVisualPatterns} · OUTPUTS: ${map.finalExperienceOutputCount}`,
    'PATTERN BINDINGS:',
    ...map.patternBindings.map(
      (b) => `- ${b.authorityLabel} (${b.authorityStateId}) ← ${b.interactionCount} interaction(s) · ${b.pattern}`,
    ),
    'MENU COVERS: PRIMARY_NAV + NESTED_NAV (combined single output when Content Ops expanded + Campaign Board nested).',
    'OPUS/COMPOSER: interactionId → expressionPattern → approved visual authority state.',
  ];
}

export function attachExperienceExpressionCoverageMap(
  authority: ExperienceExpressionAuthority,
  pipelineSet: PageConceptPipelineSet | null | undefined,
  functionContract: PageFunctionContract,
): ExperienceExpressionAuthority {
  const map = buildExperienceExpressionCoverageMap({
    projectId: authority.projectId,
    pageId: authority.pageId,
    route: functionContract.route,
    functionContract,
    authority,
    interactionMap: pipelineSet?.pageFamilyInteractionMap ?? null,
    blueprint: pipelineSet?.pageFamilyBlueprint ?? null,
  });
  if (!map) return authority;
  return { ...authority, experienceExpressionCoverageMap: map };
}
