/**
 * ChildConvergencePlan — per-child migration plan inheriting parent experience grammar.
 */

import type {
  ChildConvergencePlan,
  ChildSurfaceArchetype,
  ConvergenceAction,
  InheritanceMode,
  ParentExperienceAuthority,
  ChildSurfaceDescriptor,
} from './types.js';
import type { ResolvedExperienceParent } from './parentAuthorityResolver.js';
import { inheritanceModeAllowsLayoutClone, inheritanceModeSkipsTransform } from './inheritanceModes.js';

function diagnoseCurrentVisuals(descriptor?: ChildSurfaceDescriptor): string[] {
  const diagnosis: string[] = [];
  if (!descriptor) {
    diagnosis.push('NO_SURFACE_DIAGNOSTIC — assume legacy fallback risk');
    return diagnosis;
  }
  if (descriptor.hasGenericAdminFallback) diagnosis.push('GENERIC_ADMIN_UI_FALLBACK');
  if (descriptor.domClassHints?.some((c) => c.includes('pos-panel') || c.includes('pos-empty'))) {
    diagnosis.push('LEGACY_OPERATING_SYSTEM_PANEL');
  }
  if (descriptor.domClassHints?.some((c) => c.includes('generic') || c.includes('unstyled'))) {
    diagnosis.push('UNSTYLED_COMPONENT_LAYER');
  }
  if (!descriptor.domClassHints?.length) diagnosis.push('MISSING_PARENT_GRAMMAR_CLASSES');
  return diagnosis.length ? diagnosis : ['VISUAL_GRAMMAR_DRIFT_FROM_PARENT'];
}

function functionalPreserveList(archetype: ChildSurfaceArchetype): string[] {
  const base = ['DATA_BINDINGS', 'ROUTING', 'PERMISSIONS', 'MUTATIONS', 'EMPTY_LOADING_ERROR_STATES'];
  switch (archetype) {
    case 'EDITOR':
    case 'FULLSCREEN_TOOL':
      return [...base, 'CANVAS_INTERACTIONS', 'TOOLBAR_ACTIONS', 'UNDO_REDO'];
    case 'FORM':
    case 'INTAKE':
      return [...base, 'VALIDATION', 'SUBMIT_FLOW', 'FIELD_LOGIC'];
    case 'LIST':
    case 'LIBRARY':
      return [...base, 'SORT_FILTER', 'PAGINATION', 'ROW_ACTIONS'];
    case 'SETTINGS':
    case 'OPERATIONS':
      return [...base, 'CONFIG_MUTATIONS', 'STATUS_READOUTS'];
    default:
      return base;
  }
}

function visualReplaceList(mode: InheritanceMode, authority: ParentExperienceAuthority): string[] {
  if (inheritanceModeSkipsTransform(mode)) return [];
  return [
    `TYPOGRAPHY → ${authority.visualGrammar.displayType}`,
    `SPACING → ${authority.visualGrammar.spacingScale}`,
    `CARD_GRAMMAR → ${authority.visualGrammar.cardGrammar}`,
    `ACCENT → ${authority.visualGrammar.accentBehavior}`,
    `STATUS_LANGUAGE → ${authority.visualGrammar.statusLanguage}`,
    `SECTION_RHYTHM → ${authority.visualGrammar.sectionRhythm}`,
  ];
}

function buildLayoutActions(
  mode: InheritanceMode,
  authority: ParentExperienceAuthority,
  archetype: ChildSurfaceArchetype,
): ConvergenceAction[] {
  if (inheritanceModeSkipsTransform(mode)) return [];

  const actions: ConvergenceAction[] = [
    {
      actionId: 'layout-shell',
      category: 'LAYOUT',
      description: `Apply parent section frame: ${authority.visualGrammar.backgroundTreatment}`,
      targetRegion: 'PAGE_SHELL',
      preserveFunction: true,
      priority: 'BLOCKING',
    },
  ];

  if (inheritanceModeAllowsLayoutClone(mode) && archetype === 'LANDING') {
    actions.push({
      actionId: 'layout-hero',
      category: 'LAYOUT',
      description: `Mirror parent hero presence: ${authority.compositionGrammar.heroPresence}`,
      targetRegion: 'HERO',
      preserveFunction: true,
      priority: 'NORMAL',
    });
  } else {
    actions.push({
      actionId: 'layout-composition-adapt',
      category: 'LAYOUT',
      description: `Adapt composition for ${archetype} — do not clone parent layout literally`,
      preserveFunction: true,
      priority: 'BLOCKING',
    });
  }

  return actions;
}

function buildComponentActions(authority: ParentExperienceAuthority, mode: InheritanceMode): ConvergenceAction[] {
  if (inheritanceModeSkipsTransform(mode)) return [];
  return [
    {
      actionId: 'component-buttons',
      category: 'COMPONENT',
      description: `Primary actions: ${authority.interactionGrammar.primaryActionPattern}`,
      preserveFunction: true,
      priority: 'BLOCKING',
    },
    {
      actionId: 'component-cards',
      category: 'COMPONENT',
      description: `Cards/tiles: ${authority.visualGrammar.cardGrammar}`,
      preserveFunction: true,
      priority: 'NORMAL',
    },
    {
      actionId: 'component-status',
      category: 'COMPONENT',
      description: `Status cues: ${authority.visualGrammar.statusLanguage}`,
      preserveFunction: true,
      priority: 'NORMAL',
    },
  ];
}

function assessMigrationRisk(input: {
  mode: InheritanceMode;
  diagnosis: string[];
  archetype: ChildSurfaceArchetype;
}): ChildConvergencePlan['migrationRisk'] {
  if (input.mode === 'EXEMPT_WITH_REASON' || input.mode === 'HOST_LOCKED') return 'LOW';
  if (input.diagnosis.includes('GENERIC_ADMIN_UI_FALLBACK')) {
    return input.archetype === 'EDITOR' || input.archetype === 'FULLSCREEN_TOOL' ? 'HIGH' : 'MEDIUM';
  }
  if (input.archetype === 'FULLSCREEN_TOOL' || input.archetype === 'EDITOR') return 'MEDIUM';
  return 'LOW';
}

export function buildChildConvergencePlan(input: {
  parentAuthority: ParentExperienceAuthority;
  resolvedParent: ResolvedExperienceParent;
  childSurfaceId: string;
  childRoute: string;
  archetype: ChildSurfaceArchetype;
  inheritanceMode: InheritanceMode;
  descriptor?: ChildSurfaceDescriptor;
}): ChildConvergencePlan {
  const diagnosis = diagnoseCurrentVisuals(input.descriptor);
  const mode = input.inheritanceMode;

  return {
    planId: `plan-${input.childSurfaceId}-${Date.now()}`,
    childRoute: input.childRoute,
    childSurfaceId: input.childSurfaceId,
    parentAuthorityId: input.parentAuthority.authorityId,
    resolvedParentRoute: input.resolvedParent.resolvedParentRoute,
    childArchetype: input.archetype,
    inheritanceMode: mode,
    currentVisualDiagnosis: diagnosis,
    functionalMustPreserve: functionalPreserveList(input.archetype),
    visualMustReplace: visualReplaceList(mode, input.parentAuthority),
    layoutActions: buildLayoutActions(mode, input.parentAuthority, input.archetype),
    componentActions: buildComponentActions(input.parentAuthority, mode),
    interactionActions: inheritanceModeSkipsTransform(mode)
      ? []
      : [
          {
            actionId: 'interaction-nav',
            category: 'INTERACTION',
            description: `Navigation: ${input.parentAuthority.interactionGrammar.navigationPattern}`,
            preserveFunction: true,
            priority: 'NORMAL',
          },
          {
            actionId: 'interaction-disclosure',
            category: 'INTERACTION',
            description: input.parentAuthority.interactionGrammar.progressiveDisclosure,
            preserveFunction: true,
            priority: 'NORMAL',
          },
        ],
    contentDensityActions: inheritanceModeSkipsTransform(mode)
      ? []
      : [
          {
            actionId: 'density',
            category: 'DENSITY',
            description: `Target density: ${input.parentAuthority.compositionGrammar.contentDensity}`,
            preserveFunction: true,
            priority: 'NORMAL',
          },
        ],
    responsiveActions: [
      {
        actionId: 'responsive-mobile',
        category: 'RESPONSIVE',
        description: input.parentAuthority.compositionGrammar.mobileComposition,
        preserveFunction: true,
        priority: 'NORMAL',
      },
      {
        actionId: 'responsive-desktop',
        category: 'RESPONSIVE',
        description: input.parentAuthority.compositionGrammar.desktopComposition,
        preserveFunction: true,
        priority: 'NORMAL',
      },
    ],
    hostLockedRegions: [...input.parentAuthority.hostBoundary.hostLockedRegions],
    childSpecificRegions: [...input.parentAuthority.hostBoundary.childFunctionalRegions],
    detailsToHide: mode === 'INHERIT_GRAMMAR' ? ['REDUNDANT_PARENT_HERO', 'DUPLICATE_LANDING_COPY'] : [],
    legacyComponentsToReplace: diagnosis.includes('LEGACY_OPERATING_SYSTEM_PANEL')
      ? ['site00-pos-panel', 'site00-pos-empty', 'site00-pos-link-list']
      : diagnosis.includes('GENERIC_ADMIN_UI_FALLBACK')
        ? ['generic-admin-table', 'unstyled-form']
        : [],
    migrationRisk: assessMigrationRisk({ mode, diagnosis, archetype: input.archetype }),
    createdAt: new Date().toISOString(),
  };
}

export function buildConvergencePlansForBranch(input: {
  parentAuthority: ParentExperienceAuthority;
  resolvedParents: ResolvedExperienceParent[];
  archetypes: Map<string, ChildSurfaceArchetype>;
  inheritanceModes: Map<string, InheritanceMode>;
  descriptors?: ChildSurfaceDescriptor[];
  nodeIdByRoute: Map<string, string>;
}): ChildConvergencePlan[] {
  const descriptorByRoute = new Map((input.descriptors ?? []).map((d) => [d.route, d]));

  return input.resolvedParents.map((resolved) => {
    const nodeId = [...input.nodeIdByRoute.entries()].find(([, route]) => route === resolved.childRoute)?.[0] ?? resolved.childNodeId;
    return buildChildConvergencePlan({
      parentAuthority: input.parentAuthority,
      resolvedParent: resolved,
      childSurfaceId: nodeId,
      childRoute: resolved.childRoute,
      archetype: input.archetypes.get(resolved.childNodeId) ?? 'OTHER',
      inheritanceMode: input.inheritanceModes.get(resolved.childNodeId) ?? 'INHERIT_GRAMMAR',
      descriptor: descriptorByRoute.get(resolved.childRoute),
    });
  });
}
