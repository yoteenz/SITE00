/**
 * P0.VR.3M — Canonical SITE 00 Design route authority.
 */

import { parseDesignWorkspaceUrlState } from '../p0vr2b/designWorkspaceUrlState.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import type { DesignWorkspaceTab } from '../p0vr2b/types.js';
import { CANONICAL_SITE00_DESIGN_ROUTE } from './constants.js';
import { getSite00ManagedProject, listDesignEnabledManagedProjects } from './managedProjectRegistry.js';
import type {
  CanonicalDesignWorkspaceLocation,
  DesignRouteAuthorityRecord,
  LegacyDesignRouteResolution,
} from './types.js';
import { DESIGN_WORKSPACE_HOST_SHELL, DESIGN_WORKSPACE_OWNER, SITE00_DESIGN_PROJECT_ID } from './types.js';

export function getCanonicalDesignRouteAuthority(): DesignRouteAuthorityRecord {
  return {
    workspaceOwner: DESIGN_WORKSPACE_OWNER,
    hostShell: DESIGN_WORKSPACE_HOST_SHELL,
    canonicalRoute: CANONICAL_SITE00_DESIGN_ROUTE,
    managedProjectId: null,
    legacyRoutes: [
      '/studio-world/design',
      ...listDesignEnabledManagedProjects()
        .filter((p) => p.projectId !== SITE00_DESIGN_PROJECT_ID)
        .flatMap((p) => p.legacyDesignRoutes),
    ],
    redirectPolicy: 'PRESERVE_CONTEXT',
    projectContextMode: 'QUERY_PARAM',
  };
}

export type BuildCanonicalDesignPathInput = {
  project?: string;
  screen?: string;
  viewport?: DesignViewportClass | string;
  tab?: DesignWorkspaceTab | string;
};

export function buildCanonicalDesignWorkspacePath(input?: BuildCanonicalDesignPathInput): string {
  const params = new URLSearchParams();
  if (input?.project) params.set('project', input.project);
  if (input?.screen) params.set('screen', input.screen);
  if (input?.viewport) params.set('viewport', input.viewport);
  if (input?.tab) params.set('tab', String(input.tab).toLowerCase());
  const qs = params.toString();
  return qs ? `${CANONICAL_SITE00_DESIGN_ROUTE}?${qs}` : CANONICAL_SITE00_DESIGN_ROUTE;
}

export function buildDesignWorkspaceBreadcrumb(): string {
  return 'PROJECTS > SITE 00 > DESIGN';
}

export function resolveManagedProjectForDesignContext(projectId: string | null | undefined): string {
  const fallback = SITE00_DESIGN_PROJECT_ID;
  if (!projectId) return fallback;
  const managed = getSite00ManagedProject(projectId);
  if (!managed?.designEnabled) return fallback;
  return managed.projectId;
}

function mergeLocation(
  pathname: string,
  search: string,
): CanonicalDesignWorkspaceLocation {
  return { pathname, search: search.startsWith('?') || search === '' ? search : `?${search}` };
}

export function resolveLegacyProjectDesignRedirect(
  projectSlug: string,
  search: string,
): LegacyDesignRouteResolution {
  const state = parseDesignWorkspaceUrlState(search);

  if (projectSlug === SITE00_DESIGN_PROJECT_ID) {
    const project = resolveManagedProjectForDesignContext(state.project ?? SITE00_DESIGN_PROJECT_ID);
    const needsProjectParam = !state.project;
    const searchOut = needsProjectParam
      ? buildCanonicalDesignWorkspacePath({
          project,
          screen: state.screen,
          viewport: state.viewport,
          tab: state.tab,
        }).slice(CANONICAL_SITE00_DESIGN_ROUTE.length)
      : search.startsWith('?')
        ? search
        : search
          ? `?${search}`
          : '';
    return {
      redirect: needsProjectParam,
      target: mergeLocation(CANONICAL_SITE00_DESIGN_ROUTE, searchOut),
      loop: false,
    };
  }

  const path = buildCanonicalDesignWorkspacePath({
    project: projectSlug,
    screen: state.screen,
    viewport: state.viewport,
    tab: state.tab,
  });

  return {
    redirect: true,
    target: mergeLocation(
      CANONICAL_SITE00_DESIGN_ROUTE,
      path.slice(CANONICAL_SITE00_DESIGN_ROUTE.length),
    ),
    loop: false,
  };
}

export function resolveStudioWorldDesignLegacyRedirect(search: string): LegacyDesignRouteResolution {
  const state = parseDesignWorkspaceUrlState(search);
  const project = resolveManagedProjectForDesignContext(state.project);
  const path = buildCanonicalDesignWorkspacePath({
    project,
    screen: state.screen,
    viewport: state.viewport,
    tab: state.tab,
  });

  return {
    redirect: true,
    target: mergeLocation(CANONICAL_SITE00_DESIGN_ROUTE, path.slice(CANONICAL_SITE00_DESIGN_ROUTE.length)),
    loop: false,
  };
}

export function designWorkspaceHostUsesSite00Red(): boolean {
  return true;
}

export function projectAccentRecolorsDesignHostShell(_projectId: string): boolean {
  return false;
}

export function websiteShellPropagationCanMutateDesignHost(): boolean {
  return false;
}

export function crossProjectShellPropagationDefaultAllowed(): boolean {
  return false;
}
