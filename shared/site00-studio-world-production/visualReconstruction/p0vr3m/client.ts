/**
 * P0.VR.3M — Browser-safe client exports.
 */

export {
  CANONICAL_SITE00_DESIGN_ROUTE,
  DESIGN_HOST_ACCENT_TOKEN,
  LEGACY_DESIGN_ROUTE_PATTERNS,
  STUDIO_WORLD_INTERNAL_ROUTE_PREFIXES,
  P0_VR_3M_FAILURE_CODES,
} from './constants.js';

export {
  listSite00ManagedProjects,
  getSite00ManagedProject,
  listDesignEnabledManagedProjects,
  isKnownManagedProject,
  resolveManagedProjectContextAccent,
  managedProjectUsesNdxLimeContext,
  ndxbookOwnsDesignWorkspace,
  studioWorldOwnsSite00DesignWorkspace,
  site00OwnsDesignWorkspace,
} from './managedProjectRegistry.js';

export {
  resolveActiveDesignProjectId,
  listSelectableDesignProjects,
  formatDesignProjectSelectorLabel,
  isValidActiveDesignProject,
  assertNoDesignProjectDataBleed,
  DESIGN_PROJECT_SELECTOR_FAILURE_CODES,
} from './activeDesignProject.js';

export {
  CANONICAL_DESIGN_PROJECT_SELECTOR_ORDER,
  DESIGN_PROJECT_SELECTOR_VISUAL_FAILURE_CODES,
  formatDesignProjectOptionLabel,
  resolveDesignProjectSelectorAccent,
  resolveDesignProjectSelectorStatus,
  sortDesignProjectsCanonically,
} from './designProjectSelectorVisuals.js';

export {
  getCanonicalDesignRouteAuthority,
  buildCanonicalDesignWorkspacePath,
  buildDesignWorkspaceBreadcrumb,
  resolveManagedProjectForDesignContext,
  resolveLegacyProjectDesignRedirect,
  resolveStudioWorldDesignLegacyRedirect,
  designWorkspaceHostUsesSite00Red,
  projectAccentRecolorsDesignHostShell,
  websiteShellPropagationCanMutateDesignHost,
  crossProjectShellPropagationDefaultAllowed,
} from './designRouteAuthority.js';

export {
  buildManagedProjectDesignAdapterScope,
  studioWorldInternalRoutesImportedAsWebsiteRoutesByDefault,
  studioWorldNativePipelinesMergedIntoSite00Design,
  site00CanDesignStudioWorldWebsite,
  site00CanDesignItsOwnWebsite,
  getManagedProjectRepoBinding,
} from './managedProjectDesignAdapter.js';

export type {
  Site00ManagedProjectRecord,
  DesignRouteAuthorityRecord,
  ManagedProjectDesignAdapterScope,
  LegacyDesignRouteResolution,
} from './types.js';

export {
  DESIGN_WORKSPACE_OWNER,
  DESIGN_WORKSPACE_HOST_SHELL,
  SITE00_WEBSITE_SHELL,
  SITE00_DESIGN_PROJECT_ID,
  P0_VR_3M_LINEAGE,
} from './types.js';

export {
  resolveDesignProjectContext,
  createLoadingDesignProjectContext,
  type DesignProjectContext,
  type DesignProjectContextStatus,
} from './designProjectContext.js';

export {
  buildDesignProjectThemeTokens,
  resolveBrandFamilyKeyForProject,
  designProjectAccentCssVar,
  type DesignProjectThemeTokens,
} from './designProjectThemeTokens.js';

export {
  buildProjectRouteManifest,
  syncProjectRouteManifest,
  resolveProjectPageRegistrySyncState,
  markProjectPagesSynced,
  projectRegistryShowsUnsyncedNotZero,
  clearProjectSyncStateForTest,
  type ProjectRouteManifest,
  type ProjectPageRegistrySyncState,
} from './projectRouteManifest.js';

export {
  upsertProjectPageCapture,
  getProjectPageCapture,
  listProjectPageCaptures,
  buildProjectPageCaptureId,
  assertCaptureProjectScope,
  clearProjectPageCaptureRegistryForTest,
  type ProjectPageCapture,
} from './projectPageCaptureRegistry.js';

export {
  resolveProjectRepositoryBinding,
  listProjectRepositoryBindings,
  type ProjectRepositoryBinding,
} from './projectRepositoryBinding.js';

export {
  assertProjectContextScope,
  filterRecordsForActiveProject,
  blockIfProjectMismatch,
  type ProjectContextFirewallResult,
} from './projectContextFirewall.js';

export {
  detectDesignContextLeaks,
  type DesignContextLeakReport,
  type DesignContextLeakFailure,
} from './designContextLeakDetector.js';

export {
  bootstrapManagedDesignProject,
  bootstrapAllManagedDesignProjects,
  isManagedDesignProjectBootstrapped,
  clearManagedDesignBootstrapForTest,
} from './managedProjectDesignBootstrap.js';

export {
  P0_VR_8R2_LINEAGE,
  recoverProjectRouteInventory,
  ensureProjectRouteRecovery,
  recoverAllManagedProjectRoutes,
  buildRouteRecoveryInspectorState,
  buildPriorRouteAuditRecoveryReport,
  getRouteAuditLineageBreak,
  getProjectCurrentPageCount,
  projectRecoveryShowsInventoryNotZero,
  getGlobalRecoveryStatus,
  clearRouteRecoveryStateForTest,
  type RouteRecoveryInspectorState,
  type RouteRecoveryResult,
  type PriorRouteAuditRecoveryReport,
  type RouteAuditLineageBreak,
} from '../p0vr8r2/client.js';
