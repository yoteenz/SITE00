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
