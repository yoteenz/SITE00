/**
 * P0.VR.3M-SITE00 — Design workspace ownership + managed project context types.
 */

import { SITE00_DESIGN_PROJECT_ID } from '../p0vr3/constants.js';

export { SITE00_DESIGN_PROJECT_ID };

export const P0_VR_3M_LINEAGE = 'P0.VR.3M-SITE00' as const;

export const DESIGN_WORKSPACE_OWNER = 'SITE00' as const;
export const DESIGN_WORKSPACE_HOST_SHELL = 'SITE00_DESIGN_WORKSPACE_SHELL' as const;
export const SITE00_WEBSITE_SHELL = 'SITE00_WEBSITE_SHELL' as const;

export type DesignWorkspaceOwner = typeof DESIGN_WORKSPACE_OWNER;
export type DesignHostShellId = typeof DESIGN_WORKSPACE_HOST_SHELL;

export type Site00ManagedProjectPlatformRole = 'NONE' | 'INFRASTRUCTURE' | 'MANAGED_BRAND';
export type Site00ManagedWebsiteRole = 'NONE' | 'MANAGED_WEBSITE_PROJECT' | 'SELF';
export type Site00WebsiteDesignAuthority = 'SITE00' | 'EXTERNAL';
export type ManagedProjectRouteAuthority = 'SITE00';
export type ManagedProjectStatus = 'ACTIVE' | 'ARCHIVED';
export type DesignProjectContextMode = 'QUERY_PARAM';

export type ManagedProjectContextAccent =
  | 'SITE00_HOST'
  | 'NDX_LIME'
  | 'PROJECT_CANONICAL'
  | 'NEUTRAL'
  | 'STUDIO_WORLD_WEBSITE';

export type Site00ManagedProjectRecord = {
  projectId: string;
  displayName: string;
  projectType: string;
  websiteDesignAuthority: Site00WebsiteDesignAuthority;
  platformRole: Site00ManagedProjectPlatformRole;
  managedWebsiteRole: Site00ManagedWebsiteRole;
  designEnabled: boolean;
  marketingEnabled: boolean;
  projectAccent: ManagedProjectContextAccent;
  sourceRepo?: string;
  routeAuthority: ManagedProjectRouteAuthority;
  status: ManagedProjectStatus;
  legacyDesignRoutes: string[];
};

export type DesignRouteAuthorityRecord = {
  workspaceOwner: DesignWorkspaceOwner;
  hostShell: DesignHostShellId;
  canonicalRoute: '/projects/site00/design';
  managedProjectId: string | null;
  legacyRoutes: string[];
  redirectPolicy: 'PRESERVE_CONTEXT';
  projectContextMode: DesignProjectContextMode;
};

export type ManagedProjectDesignAdapterScope = {
  projectId: string;
  websiteRoutes: string[];
  excludedInternalRoutes: string[];
  screens: Array<{ screenId: string; displayName: string; route: string }>;
  families: string[];
  authContexts: string[];
};

export type CanonicalDesignWorkspaceLocation = {
  pathname: string;
  search: string;
};

export type LegacyDesignRouteResolution = {
  redirect: boolean;
  target: CanonicalDesignWorkspaceLocation;
  loop: boolean;
};
