/**
 * activeDesignProjectId — single source of truth for Design workspace project scope.
 */

import { listDesignEnabledManagedProjects, getSite00ManagedProject } from './managedProjectRegistry.js';
import { resolveManagedProjectForDesignContext } from './designRouteAuthority.js';
import { sortDesignProjectsCanonically } from './designProjectSelectorVisuals.js';
import { SITE00_DESIGN_PROJECT_ID } from './types.js';

export const DESIGN_PROJECT_SELECTOR_FAILURE_CODES = [
  'DESIGN_PROJECT_SELECTOR_NONFUNCTIONAL',
  'DESIGN_PROJECT_CONTEXT_HARDCODED',
  'DESIGN_PROJECT_DATA_BLEED',
  'DESIGN_PROJECT_SELECTOR_STALE_LABEL',
  'DESIGN_PROJECT_BREADCRUMB_STALE',
  'DESIGN_PROJECT_PAGES_STALE',
  'DESIGN_PROJECT_REFERENCES_STALE',
  'DESIGN_PROJECT_ASSETS_STALE',
  'DESIGN_PROJECT_HISTORY_STALE',
  'DESIGN_PROJECT_SKIN_CONTEXT_STALE',
  'DESIGN_PROJECT_PERMISSION_LEAK',
  'DESIGN_PROJECT_CONTEXT_INVALID',
  'DESIGN_PROJECT_SELECTOR_DARK_THEME_DRIFT',
  'DESIGN_PROJECT_SELECTOR_LOW_CONTRAST',
  'DESIGN_PROJECT_SELECTOR_SELECTED_STATE_UNCLEAR',
  'DESIGN_PROJECT_SELECTOR_HOST_STYLE_MISMATCH',
  'DESIGN_PROJECT_SELECTOR_PERMISSION_REGRESSION',
  'DESIGN_PROJECT_SELECTOR_SCOPE_REGRESSION',
] as const;

export type DesignProjectSelectorFailureCode = (typeof DESIGN_PROJECT_SELECTOR_FAILURE_CODES)[number];

export function resolveActiveDesignProjectId(
  urlProjectParam: string | null | undefined,
  fallback: string = SITE00_DESIGN_PROJECT_ID,
): string {
  return resolveManagedProjectForDesignContext(urlProjectParam ?? fallback);
}

export function listSelectableDesignProjects(input?: {
  viewMode?: 'FOUNDER' | 'CLIENT';
  entitledProjectIds?: string[];
}): Array<{ projectId: string; displayName: string }> {
  const viewMode = input?.viewMode ?? 'FOUNDER';
  const entitled = input?.entitledProjectIds;
  let projects = listDesignEnabledManagedProjects().map((p) => ({
    projectId: p.projectId,
    displayName: p.displayName,
  }));

  if (viewMode === 'CLIENT' && entitled?.length) {
    projects = projects.filter((p) => entitled.includes(p.projectId));
  }

  const filtered = projects.filter(
    (p) =>
      p.projectId !== 'design-workspace' &&
      p.displayName.toUpperCase() !== 'DESIGN WORKSPACE' &&
      p.displayName.toUpperCase() !== 'NEW PROJECT',
  );

  return sortDesignProjectsCanonically(filtered);
}

export function formatDesignProjectSelectorLabel(projectId: string): string {
  const managed = getSite00ManagedProject(projectId);
  const name = (managed?.displayName ?? projectId).toUpperCase();
  return `PROJECT ${name}`;
}

export function isValidActiveDesignProject(projectId: string): boolean {
  return Boolean(getSite00ManagedProject(projectId)?.designEnabled);
}

export function assertNoDesignProjectDataBleed(
  previousProjectId: string,
  nextProjectId: string,
  contextProjectId: string,
): { pass: boolean; failureCode: DesignProjectSelectorFailureCode | null } {
  if (previousProjectId === nextProjectId) {
    return { pass: true, failureCode: null };
  }
  if (contextProjectId !== nextProjectId) {
    return { pass: false, failureCode: 'DESIGN_PROJECT_DATA_BLEED' };
  }
  return { pass: true, failureCode: null };
}
