/**
 * P0.PCI.1 — Parent–Child Experience Inheritance Engine — core types.
 * Parent landing = visual/experience authority. Child = function/content authority.
 */

export const PCI_EXPERIENCE_MODES = [
  'EDITORIAL',
  'WIZARD',
  'GALLERY',
  'CONTROL_ROOM',
  'IMMERSIVE',
  'COMMERCE',
  'PORTAL',
  'DASHBOARD',
  'STORY',
  'HYBRID',
] as const;

export type ExperienceMode = (typeof PCI_EXPERIENCE_MODES)[number];

export const PCI_INHERITANCE_MODES = [
  'INHERIT_FULL',
  'INHERIT_GRAMMAR',
  'SPECIALIZED_CHILD',
  'HOST_LOCKED',
  'EXEMPT_WITH_REASON',
] as const;

export type InheritanceMode = (typeof PCI_INHERITANCE_MODES)[number];

export const PCI_CHILD_ARCHETYPES = [
  'LANDING',
  'LIST',
  'LIBRARY',
  'DETAIL',
  'EDITOR',
  'WIZARD',
  'FORM',
  'INTAKE',
  'GALLERY',
  'STATUS',
  'OPERATIONS',
  'SETTINGS',
  'REVIEW',
  'COMPARISON',
  'CHECKOUT',
  'PROFILE',
  'SEARCH',
  'RESULTS',
  'TIMELINE',
  'MESSAGING',
  'MEDIA',
  'MAP',
  'WORKSPACE',
  'FULLSCREEN_TOOL',
  'OTHER',
] as const;

export type ChildSurfaceArchetype = (typeof PCI_CHILD_ARCHETYPES)[number];

export const PCI_ROUTE_RELATIONSHIP_TYPES = [
  'DIRECT_CHILD',
  'GRANDCHILD',
  'TAB_CHILD',
  'MODAL_CHILD',
  'DRAWER_CHILD',
  'WORKFLOW_CHILD',
  'DETAIL_CHILD',
  'EDITOR_CHILD',
  'UTILITY_CHILD',
  'CROSS_LINKED_CHILD',
  'EMBEDDED_CHILD',
] as const;

export type RouteRelationshipType = (typeof PCI_ROUTE_RELATIONSHIP_TYPES)[number];

export const PCI_VIEWPORTS = ['MOBILE', 'DESKTOP', 'TABLET', 'UNIVERSAL'] as const;

export type PciViewport = (typeof PCI_VIEWPORTS)[number];

export const PCI_MIGRATION_RISKS = ['LOW', 'MEDIUM', 'HIGH', 'BLOCKED'] as const;

export type MigrationRisk = (typeof PCI_MIGRATION_RISKS)[number];

export type VisualGrammar = {
  backgroundTreatment: string;
  sectionRhythm: string;
  spacingScale: string;
  gridBehavior: string;
  cardGrammar: string;
  borderGrammar: string;
  radiusGrammar: string;
  shadowGrammar: string;
  typographyHierarchy: string;
  displayType: string;
  bodyType: string;
  labelType: string;
  iconLanguage: string;
  imageTreatment: string;
  decorativeLanguage: string;
  accentBehavior: string;
  statusLanguage: string;
  emptyStateLanguage: string;
  errorStateLanguage: string;
};

export type InteractionGrammar = {
  navigationPattern: string;
  primaryActionPattern: string;
  secondaryActionPattern: string;
  progressiveDisclosure: string;
  drawerBehavior: string;
  sheetBehavior: string;
  modalBehavior: string;
  stepperBehavior: string;
  carouselBehavior: string;
  tabBehavior: string;
  hoverBehavior: string;
  transitionBehavior: string;
  autoAdvanceBehavior: string;
};

export type CompositionGrammar = {
  contentDensity: string;
  numberOfPrimaryPanels: string;
  oneScreenPreference: string;
  heroPresence: string;
  visualFirstRatio: string;
  textToVisualRatio: string;
  alignmentSystem: string;
  mobileComposition: string;
  tabletComposition: string;
  desktopComposition: string;
};

export type HostBoundary = {
  hostLockedRegions: string[];
  parentControlledRegions: string[];
  childFunctionalRegions: string[];
};

export type NavigationGrammar = {
  primaryNavigationElements: string[];
  secondaryNavigationElements: string[];
  expectedChildSurfaces: string[];
  navigationLabels: string[];
  navigationHierarchy: string[];
  returnPatterns: string[];
};

export type ParentExperienceAuthority = {
  authorityId: string;
  projectId: string;
  parentRoute: string;
  parentSurfaceId: string;
  viewport: PciViewport;
  authorityVersion: string;
  visualGrammar: VisualGrammar;
  interactionGrammar: InteractionGrammar;
  compositionGrammar: CompositionGrammar;
  navigationGrammar?: NavigationGrammar;
  experienceMode: ExperienceMode;
  hostBoundary: HostBoundary;
  extractedAt: string;
  source: 'DESIGN_AUTHORITY' | 'SURFACE_SIGNALS' | 'MODULE_CONTRACT' | 'MANUAL_OVERRIDE';
};

export type ParentChildRouteNode = {
  nodeId: string;
  route: string;
  surfaceId: string;
  label: string;
  kind: 'LANDING' | 'ROUTE' | 'TAB_STATE' | 'MODAL' | 'SHEET' | 'DRAWER' | 'EMBEDDED' | 'WORKSPACE';
  viewport?: PciViewport;
  isParentCandidate: boolean;
  metadata?: Record<string, unknown>;
};

export type ParentChildRouteEdge = {
  from: string;
  to: string;
  relationshipType: RouteRelationshipType;
  label?: string;
};

export type ParentChildRouteGraph = {
  graphId: string;
  projectId: string;
  rootRoute: string;
  nodes: ParentChildRouteNode[];
  edges: ParentChildRouteEdge[];
  discoveredAt: string;
};

export type ChildSurfaceDescriptor = {
  surfaceId: string;
  route: string;
  label: string;
  relationshipType: RouteRelationshipType;
  parentRoute: string;
  viewport: PciViewport;
  moduleScreenType?: string;
  domClassHints?: string[];
  interactionDensity?: 'LOW' | 'MEDIUM' | 'HIGH';
  hasGenericAdminFallback?: boolean;
  hasDataTables?: boolean;
  hasFormFields?: boolean;
  hasMediaCanvas?: boolean;
  isHostShell?: boolean;
  exemptReason?: string;
};

export type ConvergenceAction = {
  actionId: string;
  category: 'LAYOUT' | 'COMPONENT' | 'INTERACTION' | 'DENSITY' | 'RESPONSIVE' | 'CONTENT';
  description: string;
  targetRegion?: string;
  preserveFunction: boolean;
  priority: 'BLOCKING' | 'NORMAL' | 'POLISH';
};

export type ChildConvergencePlan = {
  planId: string;
  childRoute: string;
  childSurfaceId: string;
  parentAuthorityId: string;
  resolvedParentRoute: string;
  childArchetype: ChildSurfaceArchetype;
  inheritanceMode: InheritanceMode;
  currentVisualDiagnosis: string[];
  functionalMustPreserve: string[];
  visualMustReplace: string[];
  layoutActions: ConvergenceAction[];
  componentActions: ConvergenceAction[];
  interactionActions: ConvergenceAction[];
  contentDensityActions: ConvergenceAction[];
  responsiveActions: ConvergenceAction[];
  hostLockedRegions: string[];
  childSpecificRegions: string[];
  detailsToHide: string[];
  legacyComponentsToReplace: string[];
  migrationRisk: MigrationRisk;
  createdAt: string;
};

export type InheritanceException = {
  exceptionId: string;
  childRoute: string;
  inheritanceMode: InheritanceMode;
  reason: string;
  approvedBy?: string;
  createdAt: string;
};

export type InheritanceQAFinding = {
  code: string;
  severity: 'BLOCKING' | 'WARNING';
  childRoute: string;
  message: string;
};

export type InheritanceBranchQAReport = {
  reportId: string;
  projectId: string;
  parentRoute: string;
  childCount: number;
  passed: boolean;
  cohesionScore: number;
  findings: InheritanceQAFinding[];
  genericFallbackCount: number;
  exemptCount: number;
  evaluatedAt: string;
};

export type ConvergenceMigrationManifest = {
  manifestId: string;
  projectId: string;
  parentAuthorityId: string;
  plans: ChildConvergencePlan[];
  appliedPlanIds: string[];
  skippedPlanIds: string[];
  blockedPlanIds: string[];
  dryRun: boolean;
  createdAt: string;
};

export type ParentChildInheritanceRunResult = {
  runId: string;
  projectId: string;
  parentRoute: string;
  routeGraph: ParentChildRouteGraph;
  parentAuthority: ParentExperienceAuthority;
  convergencePlans: ChildConvergencePlan[];
  migrationManifest: ConvergenceMigrationManifest | null;
  qaReport: InheritanceBranchQAReport;
  exceptions: InheritanceException[];
  status: 'PLANNED' | 'APPLIED' | 'QA_PASSED' | 'QA_FAILED' | 'BLOCKED';
  createdAt: string;
};

export type ParentSurfaceSignals = {
  route: string;
  surfaceId: string;
  viewport: PciViewport;
  experienceMode?: ExperienceMode;
  cssClassHints?: string[];
  moduleScreenType?: string;
  heroPresent?: boolean;
  cardGridPresent?: boolean;
  editorialSections?: number;
  controlRoomIndicators?: boolean;
  wizardSteps?: number;
  tabCount?: number;
  primaryPanelCount?: number;
  designAuthorityId?: string;
};

export type ProjectSurfaceRegistryInput = {
  projectId: string;
  rootRoute: string;
  routes: string[];
  declaredSurfaces?: Array<{
    surfaceId: string;
    route: string;
    label: string;
    parentRoute?: string;
    relationshipType?: RouteRelationshipType;
    kind?: ParentChildRouteNode['kind'];
    viewport?: PciViewport;
    moduleScreenType?: string;
    isHostShell?: boolean;
    exemptReason?: string;
  }>;
  parentSignals?: ParentSurfaceSignals;
  childDescriptors?: ChildSurfaceDescriptor[];
  exceptions?: InheritanceException[];
  existingAuthorities?: ParentExperienceAuthority[];
};

export type ParentChildInheritanceEngineInput = {
  registry: ProjectSurfaceRegistryInput;
  viewport?: PciViewport;
  applyMigration?: boolean;
  dryRun?: boolean;
};

export const PCI_FAILURE_CODES = [
  'PCI_PARENT_AUTHORITY_MISSING',
  'PCI_CHILD_NO_RESOLVED_PARENT',
  'PCI_GENERIC_ADMIN_FALLBACK',
  'PCI_HOST_SHELL_MUTATION_ATTEMPT',
  'PCI_INHERITANCE_MODE_MISMATCH',
  'PCI_VISUAL_GRAMMAR_DRIFT',
  'PCI_COMPOSITION_LITERAL_CLONE',
  'PCI_FUNCTION_REGRESSION_RISK',
  'PCI_BRANCH_COHESION_FAILED',
  'PCI_EXEMPT_WITHOUT_REASON',
] as const;

export type PciFailureCode = (typeof PCI_FAILURE_CODES)[number];
