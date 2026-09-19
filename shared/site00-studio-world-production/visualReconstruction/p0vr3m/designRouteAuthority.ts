/**
 * P0.VR.3M — Canonical SITE 00 Design route authority.
 */

import { parseDesignWorkspaceUrlState } from '../p0vr2b/designWorkspaceUrlState.js';
import type { DesignViewportClass } from '../p0vr2/types.js';
import type { DesignWorkspaceTab } from '../p0vr2b/types.js';
import { CANONICAL_SITE00_DESIGN_ROUTE } from './constants.js';
import {
  getSite00ManagedProject,
  listDesignEnabledManagedProjects,
} from './managedProjectRegistry.js';
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
  if (input?.screen) params.set('screen', input.screen);
  if (input?.viewport) params.set('viewport', input.viewport);
  if (input?.tab) params.set('tab', String(input.tab).toLowerCase());
  const qs = params.toString();
  const subject = resolveManagedProjectForDesignContext(input?.project ?? null);
  if (subject && subject !== SITE00_DESIGN_PROJECT_ID) {
    const base = perProjectDesignPath(subject);
    return qs ? `${base}?${qs}` : base;
  }
  if (input?.project) params.set('project', input.project);
  const hostQs = params.toString();
  return hostQs ? `${CANONICAL_SITE00_DESIGN_ROUTE}?${hostQs}` : CANONICAL_SITE00_DESIGN_ROUTE;
}

export function buildDesignWorkspaceBreadcrumb(projectId?: string | null): string {
  const managed = getSite00ManagedProject(projectId ?? SITE00_DESIGN_PROJECT_ID);
  const name = (managed?.displayName ?? 'SITE 00').toUpperCase();
  return `PROJECTS > ${name} > DESIGN`;
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

function stripProjectQueryParam(search: string): string {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search);
  params.delete('project');
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

function perProjectDesignPath(projectId: string): string {
  return `/projects/design/${projectId.toLowerCase()}`;
}

/** P0.VR.DESIGN-ROUTE-AUTHORITY1 — legacy Design Reconstruction lab (not product DESIGN route). */
export function designReconstructionLabPath(projectId: string): string {
  return `${perProjectDesignPath(projectId)}/reconstruction-lab`;
}

/** @deprecated Legacy URL segment — prefer designReconstructionLabPath */
export function legacyDesignReconstructionLabPath(projectId: string): string {
  return `/projects/${projectId.toLowerCase()}/design/reconstruction-lab`;
}

export function resolveLegacyProjectDesignRedirect(
  projectSlug: string,
  search: string,
): LegacyDesignRouteResolution {
  const state = parseDesignWorkspaceUrlState(search);
  const managed = getSite00ManagedProject(projectSlug);
  const normalizedSearch =
    search.startsWith('?') || search === '' ? search : search ? `?${search}` : '';

  /** P0.VR.DESIGN-INTEGRATION1 — host route ?project=ndxbook → /projects/ndxbook/design */
  if (projectSlug === SITE00_DESIGN_PROJECT_ID) {
    const subject = resolveManagedProjectForDesignContext(state.project ?? null);
    if (subject && subject !== SITE00_DESIGN_PROJECT_ID) {
      return {
        redirect: true,
        target: mergeLocation(perProjectDesignPath(subject), stripProjectQueryParam(normalizedSearch)),
        loop: false,
      };
    }
    const defaultSubject = resolveManagedProjectForDesignContext('ndxbook');
    if (!state.project && defaultSubject !== SITE00_DESIGN_PROJECT_ID) {
      return {
        redirect: true,
        target: mergeLocation(perProjectDesignPath(defaultSubject), normalizedSearch),
        loop: false,
      };
    }
    return {
      redirect: true,
      target: mergeLocation(designReconstructionLabPath(SITE00_DESIGN_PROJECT_ID), normalizedSearch),
      loop: false,
    };
  }

  if (managed?.designEnabled) {
    return {
      redirect: false,
      target: mergeLocation(perProjectDesignPath(projectSlug), normalizedSearch),
      loop: false,
    };
  }

  const labSearch = new URLSearchParams();
  if (state.screen) labSearch.set('screen', state.screen);
  if (state.viewport) labSearch.set('viewport', state.viewport);
  if (state.tab) labSearch.set('tab', String(state.tab).toLowerCase());
  labSearch.set('project', projectSlug);
  const qs = labSearch.toString();

  return {
    redirect: true,
    target: mergeLocation(
      designReconstructionLabPath(SITE00_DESIGN_PROJECT_ID),
      qs ? `?${qs}` : '',
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
  const pathname = path.split('?')[0] ?? path;
  const pathSearch = path.includes('?') ? `?${path.split('?')[1]}` : '';

  return {
    redirect: true,
    target: mergeLocation(pathname, pathSearch),
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
