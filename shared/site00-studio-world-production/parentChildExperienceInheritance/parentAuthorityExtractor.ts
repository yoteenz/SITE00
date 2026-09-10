/**
 * ParentExperienceAuthority — extract experience grammar from parent landing signals.
 * Authority is more than tokens: rhythm, density, interaction, composition.
 */

import type {
  CompositionGrammar,
  ExperienceMode,
  InteractionGrammar,
  NavigationGrammar,
  ParentExperienceAuthority,
  ParentSurfaceSignals,
  PciViewport,
  VisualGrammar,
} from './types.js';

const PCI_AUTHORITY_VERSION = 'p0.pci.1';

function inferExperienceMode(signals: ParentSurfaceSignals): ExperienceMode {
  if (signals.experienceMode) return signals.experienceMode;
  if (signals.controlRoomIndicators || signals.moduleScreenType?.includes('CONTROL')) return 'CONTROL_ROOM';
  if (signals.wizardSteps && signals.wizardSteps > 1) return 'WIZARD';
  if (signals.editorialSections && signals.editorialSections >= 3) return 'EDITORIAL';
  if (signals.heroPresent && signals.cardGridPresent) return 'HYBRID';
  if (signals.heroPresent) return 'IMMERSIVE';
  if (signals.cardGridPresent) return 'GALLERY';
  return 'PORTAL';
}

function buildVisualGrammar(mode: ExperienceMode, signals: ParentSurfaceSignals): VisualGrammar {
  const editorial = mode === 'EDITORIAL' || mode === 'IMMERSIVE' || mode === 'STORY';
  const controlRoom = mode === 'CONTROL_ROOM' || mode === 'DASHBOARD';

  return {
    backgroundTreatment: editorial ? 'LAYERED_SURFACE_WITH_HERO' : controlRoom ? 'DENSE_INSTRUMENT_PANEL' : 'NEUTRAL_WORLD_SURFACE',
    sectionRhythm: editorial ? 'EDITORIAL_SECTIONS_WITH_BREATHING' : 'TIGHT_OPERATIONAL_RHYTHM',
    spacingScale: controlRoom ? 'COMPACT_INSTRUMENTED' : 'GENEROUS_EDITORIAL',
    gridBehavior: signals.cardGridPresent ? 'CARD_GRID_WITH_STATUS_CUES' : 'SINGLE_COLUMN_FLOW',
    cardGrammar: controlRoom ? 'THIN_BORDER_STATUS_TILE' : 'SOFT_PANEL_WITH_ACCENT',
    borderGrammar: '1PX_LOW_CONTRAST',
    radiusGrammar: controlRoom ? 'MINIMAL_RADIUS' : 'SUBTLE_ROUNDED',
    shadowGrammar: controlRoom ? 'FLAT_OR_HAIRLINE' : 'SOFT_ELEVATION',
    typographyHierarchy: 'DISPLAY_UPPERCASE + BODY_SENTENCE + LABEL_MONO',
    displayType: 'MARTIAN_MONO_UPPERCASE',
    bodyType: 'SYSTEM_SANS_READABLE',
    labelType: 'MARTIAN_MONO_MICRO',
    iconLanguage: 'LINE_ICONS_WITH_STATUS_DOT',
    imageTreatment: editorial ? 'HERO_FIRST_WITH_CROP_DISCIPLINE' : 'THUMBNAIL_SUPPORTING',
    decorativeLanguage: editorial ? 'RING_MOTIF_OR_EDITORIAL_RULE' : 'MINIMAL_INSTRUMENT',
    accentBehavior: 'BRAND_RED_FOR_PRIMARY_AND_ATTENTION',
    statusLanguage: 'READY | ATTENTION | NEUTRAL',
    emptyStateLanguage: 'GUIDED_NEXT_STEP_NOT_BLANK',
    errorStateLanguage: 'INLINE_WITH_RECOVERY_ACTION',
  };
}

function buildInteractionGrammar(mode: ExperienceMode, signals: ParentSurfaceSignals): InteractionGrammar {
  const hasTabs = (signals.tabCount ?? 0) > 0;

  return {
    navigationPattern: hasTabs ? 'TAB_RAIL_WITH_DEEP_LINKS' : 'PRIMARY_GRID_TO_CHILD',
    primaryActionPattern: mode === 'CONTROL_ROOM' ? 'RECOMMENDED_ACTION_CARD' : 'HERO_CTA_OR_TILE',
    secondaryActionPattern: 'GHOST_OR_LINK_ROW',
    progressiveDisclosure: hasTabs ? 'TAB_THEN_PANEL' : 'TILE_TO_DETAIL',
    drawerBehavior: 'FUNCTIONAL_PANEL_INHERIT_SHELL',
    sheetBehavior: 'MOBILE_SHEET_DESKTOP_MODAL',
    modalBehavior: 'CONFIRM_AND_REVIEW_ONLY',
    stepperBehavior: signals.wizardSteps ? 'NUMBERED_STEPS_TOP' : 'NONE',
    carouselBehavior: 'HORIZONTAL_SWIPE_WHEN_GALLERY',
    tabBehavior: hasTabs ? 'UNDERLINE_OR_PILL_IN_PARENT_LANGUAGE' : 'NONE',
    hoverBehavior: 'SUBTLE_ELEVATION_NOT_COLOR_SHIFT',
    transitionBehavior: 'FAST_FADE_OR_SLIDE_CONSISTENT',
    autoAdvanceBehavior: 'NONE_UNLESS_WIZARD',
  };
}

function buildCompositionGrammar(mode: ExperienceMode, signals: ParentSurfaceSignals): CompositionGrammar {
  const controlRoom = mode === 'CONTROL_ROOM' || mode === 'DASHBOARD';

  return {
    contentDensity: controlRoom ? 'HIGH_INSTRUMENTED' : 'MEDIUM_EDITORIAL',
    numberOfPrimaryPanels: String(signals.primaryPanelCount ?? (controlRoom ? 3 : 1)),
    oneScreenPreference: controlRoom ? 'ABOVE_FOLD_METRICS' : 'HERO_PLUS_ONE_SCROLL',
    heroPresence: signals.heroPresent ? 'PROMINENT' : controlRoom ? 'COMPACT_HEADER' : 'MINIMAL',
    visualFirstRatio: signals.heroPresent ? '60_VISUAL_40_TEXT' : '40_VISUAL_60_TEXT',
    textToVisualRatio: signals.heroPresent ? 'HEADLINE_LED' : 'LABEL_LED',
    alignmentSystem: 'LEFT_RAIL_WITH_GRID',
    mobileComposition: 'SINGLE_COLUMN_STACK',
    tabletComposition: 'TWO_COLUMN_WHERE_APPROPRIATE',
    desktopComposition: controlRoom ? 'SIDEBAR_PLUS_GRID' : 'CENTERED_MAX_WIDTH',
  };
}

function buildHostBoundary(mode: ExperienceMode): ParentExperienceAuthority['hostBoundary'] {
  return {
    hostLockedRegions: ['GLOBAL_NAV', 'NOTIFICATION_BELL', 'PROJECT_MENU', 'AUTH_SESSION'],
    parentControlledRegions: ['PAGE_BACKGROUND', 'SECTION_FRAME', 'TYPOGRAPHY_SCALE', 'ACCENT_SYSTEM'],
    childFunctionalRegions:
      mode === 'WIZARD'
        ? ['WORKSPACE_CANVAS', 'TOOLBAR', 'DATA_BINDINGS']
        : ['DATA_TABLE', 'FORM_FIELDS', 'ACTION_BAR'],
  };
}

export function extractParentExperienceAuthority(input: {
  projectId: string;
  signals: ParentSurfaceSignals;
  existingAuthority?: ParentExperienceAuthority | null;
}): ParentExperienceAuthority {
  if (input.existingAuthority) return input.existingAuthority;

  const mode = inferExperienceMode(input.signals);
  const authorityId =
    input.signals.designAuthorityId ??
    `auth-${input.projectId}-${input.signals.surfaceId}-${input.signals.viewport}`.toLowerCase();

  return {
    authorityId,
    projectId: input.projectId,
    parentRoute: input.signals.route,
    parentSurfaceId: input.signals.surfaceId,
    viewport: input.signals.viewport,
    authorityVersion: PCI_AUTHORITY_VERSION,
    visualGrammar: buildVisualGrammar(mode, input.signals),
    interactionGrammar: buildInteractionGrammar(mode, input.signals),
    compositionGrammar: buildCompositionGrammar(mode, input.signals),
    experienceMode: mode,
    hostBoundary: buildHostBoundary(mode),
    extractedAt: new Date().toISOString(),
    source: input.signals.designAuthorityId ? 'DESIGN_AUTHORITY' : 'SURFACE_SIGNALS',
  };
}

export function buildNavigationGrammar(input: {
  primaryElements: string[];
  expectedChildSurfaces: string[];
  returnPattern: string;
}): NavigationGrammar {
  return {
    primaryNavigationElements: input.primaryElements,
    secondaryNavigationElements: [],
    expectedChildSurfaces: input.expectedChildSurfaces,
    navigationLabels: input.primaryElements,
    navigationHierarchy: input.expectedChildSurfaces,
    returnPatterns: [input.returnPattern],
  };
}

export function attachNavigationGrammar(
  authority: ParentExperienceAuthority,
  grammar: NavigationGrammar,
): ParentExperienceAuthority {
  return { ...authority, navigationGrammar: grammar };
}

export function mergeAuthorityViewport(
  authority: ParentExperienceAuthority,
  viewport: PciViewport,
): ParentExperienceAuthority {
  return { ...authority, viewport };
}
