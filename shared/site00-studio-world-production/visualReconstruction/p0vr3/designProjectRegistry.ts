/**
 * P0.VR.3 — Designable project registry (manifest-driven).
 */

import type { DesignableProjectRecord } from './types.js';
import { SITE00_DESIGN_PROJECT_ID } from './constants.js';

const BASE_PROJECTS: DesignableProjectRecord[] = [
  {
    projectId: SITE00_DESIGN_PROJECT_ID,
    displayName: 'SITE 00',
    designable: true,
    hostProject: true,
    selfDesignable: true,
    routeNamespace: 'SITE00 website/customer-facing routes',
    projectAccent: 'SITE00_HOST',
    showInProjectSelector: true,
  },
  {
    projectId: 'ndxbook',
    displayName: 'NDXBOOK',
    designable: true,
    hostProject: false,
    selfDesignable: false,
    routeNamespace: '/projects/ndxbook/*',
    projectAccent: 'NDX_LIME',
    showInProjectSelector: true,
  },
  {
    projectId: 'studio-world',
    displayName: 'STUDIO WORLD',
    designable: true,
    hostProject: false,
    selfDesignable: false,
    routeNamespace: '/projects/studio-world/*',
    projectAccent: 'NEUTRAL',
    showInProjectSelector: true,
  },
  {
    projectId: 'frontal-slayer',
    displayName: 'FRONTAL SLAYER',
    designable: true,
    hostProject: false,
    selfDesignable: false,
    routeNamespace: '/projects/frontal-slayer/*',
    projectAccent: 'PROJECT_CANONICAL',
    showInProjectSelector: true,
  },
  {
    projectId: 'all-in-one-enterprises',
    displayName: 'All In One Enterprises',
    designable: true,
    hostProject: false,
    selfDesignable: false,
    routeNamespace: '/projects/all-in-one-enterprises/*',
    projectAccent: 'PROJECT_CANONICAL',
    showInProjectSelector: true,
  },
];

const EXTRA_PROJECTS: DesignableProjectRecord[] = [];

export function registerDesignableProject(record: DesignableProjectRecord): void {
  const idx = EXTRA_PROJECTS.findIndex((p) => p.projectId === record.projectId);
  if (idx >= 0) {
    EXTRA_PROJECTS[idx] = record;
    return;
  }
  EXTRA_PROJECTS.push(record);
}

export function listDesignableProjects(): DesignableProjectRecord[] {
  const merged = [...BASE_PROJECTS];
  for (const extra of EXTRA_PROJECTS) {
    const idx = merged.findIndex((p) => p.projectId === extra.projectId);
    if (idx >= 0) merged[idx] = extra;
    else merged.push(extra);
  }
  return merged;
}

export function listDesignWorkspaceProjects(): Array<{ slug: string; displayName: string }> {
  return listDesignableProjects()
    .filter((p) => p.showInProjectSelector)
    .map((p) => ({ slug: p.projectId, displayName: p.displayName }));
}

export function getDesignableProject(projectId: string): DesignableProjectRecord | null {
  return listDesignableProjects().find((p) => p.projectId === projectId) ?? null;
}

export function isSite00SelfDesignableProject(projectId: string): boolean {
  const project = getDesignableProject(projectId);
  return project?.selfDesignable === true;
}

export function resolveDesignProjectAccent(projectId: string): DesignableProjectRecord['projectAccent'] {
  return getDesignableProject(projectId)?.projectAccent ?? 'NEUTRAL';
}

export function site00UsesNdxAccentForProject(projectId: string): boolean {
  return resolveDesignProjectAccent(projectId) === 'NDX_LIME';
}
