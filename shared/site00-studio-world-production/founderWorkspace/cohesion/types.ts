/**
 * P0.UI.2 — NDXBOOK founder workspace cohesion types.
 */

export type MigrationStatus =
  | 'CANONICAL'
  | 'PARTIAL'
  | 'LEGACY'
  | 'BROKEN'
  | 'DUPLICATE_SHELL'
  | 'MISSING_WORKSPACE_WRAPPER'
  | 'INCONSISTENT_THEME'
  | 'INCONSISTENT_NAV'
  | 'INCONSISTENT_RESPONSIVE'
  | 'UNKNOWN';

export type VisualGeneration = 'FOUNDER_WORKSPACE_V1' | 'LEGACY_LORE_CALIBRATION' | 'LEGACY_PROJECT_COMMAND' | 'UNKNOWN';

export type ScrollModel =
  | 'NATIVE_DOCUMENT'
  | 'WORKSPACE_CANVAS'
  | 'HORIZONTAL_LANE'
  | 'BOARD'
  | 'REVIEW_MODAL'
  | 'INSPECT_DRAWER'
  | 'TAB_PANEL'
  | 'BOTTOM_SHEET'
  | 'CAROUSEL';

export type LegacyDependencyClass = 'SAFE_TO_REMOVE' | 'USED_OUTSIDE_NDX' | 'MIGRATION_WRAPPER' | 'STILL_REQUIRED' | 'UNKNOWN';

export type NdxWorkspaceRouteEntry = {
  routeId: string;
  path: string;
  component: string;
  parentLayout: string;
  workspaceShell: 'FounderWorkspaceShell' | 'EcosystemShell' | 'NONE' | 'CONDITIONAL';
  visualGeneration: VisualGeneration;
  primarySurface: string;
  responsiveModel: 'DESKTOP_RAIL_MOBILE_BOTTOM' | 'LEGACY_DOCUMENT' | 'MIXED';
  projectAccentSource: 'NDX_LIME' | 'HOST_RED' | 'MISSING' | 'MIXED';
  localNav: 'WORKSPACE_RAIL' | 'ProjectExperimentsHubNav' | 'DUPLICATE' | 'NONE';
  inspectSupport: boolean;
  loadingState: 'WORKSPACE_NATIVE' | 'RAW_TEXT' | 'NONE';
  emptyState: 'WORKSPACE_NATIVE' | 'RAW_TEXT' | 'NONE';
  errorState: 'WORKSPACE_NATIVE' | 'RAW_TEXT' | 'NONE';
  legacyDependencies: string[];
  migrationStatus: MigrationStatus;
  scrollModel?: ScrollModel;
  isTopLevel?: boolean;
  isNested?: boolean;
};

export type CohesionFailureCode =
  | 'FAIL_MISSING_FOUNDER_WORKSPACE_SHELL'
  | 'FAIL_DUPLICATE_WORKSPACE_SHELL'
  | 'FAIL_LEGACY_PAGE_OUTSIDE_WORKSPACE'
  | 'FAIL_NESTED_ROUTE_ESCAPES_SHELL'
  | 'FAIL_ROUTE_SHELL_INCONSISTENCY'
  | 'FAIL_LEGACY_NDX_PAGE_LAYOUT'
  | 'FAIL_GENERIC_WHITE_DOCUMENT_SURFACE'
  | 'FAIL_OLD_CARD_PRIMITIVE'
  | 'FAIL_OLD_SITE00_RED_DOMINANCE'
  | 'FAIL_NDX_LIME_MISSING'
  | 'FAIL_NDX_LIME_WRONG_ROLE'
  | 'FAIL_LEGACY_MONO_TEXT_DUMP'
  | 'FAIL_ENDLESS_DOCUMENT_SCROLL'
  | 'FAIL_OLD_EXPERIMENT_INDEX_STYLE'
  | 'FAIL_OLD_CAMPAIGN_MATRIX_STYLE'
  | 'FAIL_OLD_CONTENT_OPS_LIST_STYLE'
  | 'FAIL_OLD_TECHNICAL_PAGE_PRESENTATION'
  | 'FAIL_GENERIC_ADMIN_PANEL_GRAMMAR'
  | 'FAIL_PROJECT_ACCENT_MISSING'
  | 'FAIL_HOST_ACCENT_LEAKAGE'
  | 'FAIL_PROJECT_ACCENT_BLEED'
  | 'FAIL_RANDOM_ROUTE_ACCENT'
  | 'FAIL_PROJECT_COLOR_INCONSISTENCY'
  | 'FAIL_DUPLICATE_LOCAL_NAV'
  | 'FAIL_MULTIPLE_PRIMARY_NAVS'
  | 'FAIL_INCONSISTENT_BOTTOM_NAV'
  | 'FAIL_NAV_ROUTE_STATE_MISMATCH'
  | 'FAIL_ACTIVE_ROUTE_HIGHLIGHT_MISMATCH'
  | 'FAIL_MOBILE_NAV_OVERLOAD'
  | 'FAIL_LEGACY_BLUE_LINK_NAV'
  | 'FAIL_NAV_VISUAL_GENERATION_MISMATCH'
  | 'FAIL_LOADING_STATE_VISUAL_BREAK'
  | 'FAIL_WHITE_FLASH'
  | 'FAIL_LEGACY_SHELL_FLASH'
  | 'FAIL_STALE_PROJECT_ACCENT'
  | 'FAIL_LAYOUT_SHIFT'
  | 'FAIL_NAV_DISAPPEARS_DURING_LOAD'
  | 'FAIL_DUPLICATE_SHELL_DURING_TRANSITION'
  | 'FAIL_INCONSISTENT_ROUTE_SKELETON'
  | 'FAIL_ENDLESS_SCROLL_AS_PRIMARY_UI'
  | 'FAIL_DESKTOP_DOCUMENT_COLUMN'
  | 'FAIL_MOBILE_MARATHON_SCROLL'
  | 'FAIL_UNBOUNDED_TECHNICAL_SCROLL'
  | 'FAIL_WIDE_SCREEN_UNUSED'
  | 'FAIL_LEGACY_ROUTE_SURFACE'
  | 'FAIL_ROUTE_WORKSPACE_INHERITANCE'
  | 'FAIL_ROUTE_THEME_MISMATCH'
  | 'FAIL_ROUTE_NAV_MISMATCH'
  | 'FAIL_ROUTE_LOADING_BREAK'
  | 'FAIL_ROUTE_RESPONSIVE_MISMATCH';

export type CohesionEvaluationDimension =
  | 'shell'
  | 'palette'
  | 'projectPresence'
  | 'navigation'
  | 'typography'
  | 'surfaceVocabulary'
  | 'spacing'
  | 'responsiveBehavior'
  | 'loadingState'
  | 'inspectBehavior'
  | 'artworkAuthority'
  | 'legacySurfaceDetection';

export type CohesionEvaluationResult = {
  routeId: string;
  migrationStatus: MigrationStatus;
  failures: CohesionFailureCode[];
  dimensions: Record<CohesionEvaluationDimension, number>;
  aggregateScore: number;
  canonicalEligible: boolean;
};

export type ScreenshotCaptureEntry = {
  routeId: string;
  path: string;
  viewport: 'mobile' | 'tablet' | 'desktop';
  migrationStatus: MigrationStatus;
  shellStatus: string;
  accentStatus: string;
  legacyDetected: boolean;
  cohesionScore: number;
  capturePath?: string;
};
