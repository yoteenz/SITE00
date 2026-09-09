/**
 * Design project selector — light host UI visuals + canonical ordering.
 */

import { getSite00ManagedProject } from './managedProjectRegistry.js';

export const DESIGN_PROJECT_SELECTOR_VISUAL_FAILURE_CODES = [
  'DESIGN_PROJECT_SELECTOR_DARK_THEME_DRIFT',
  'DESIGN_PROJECT_SELECTOR_LOW_CONTRAST',
  'DESIGN_PROJECT_SELECTOR_SELECTED_STATE_UNCLEAR',
  'DESIGN_PROJECT_SELECTOR_HOST_STYLE_MISMATCH',
  'DESIGN_PROJECT_SELECTOR_PERMISSION_REGRESSION',
  'DESIGN_PROJECT_SELECTOR_SCOPE_REGRESSION',
] as const;

export type DesignProjectSelectorVisualFailureCode =
  (typeof DESIGN_PROJECT_SELECTOR_VISUAL_FAILURE_CODES)[number];

/** Canonical founder selector order (Part VIII). */
export const CANONICAL_DESIGN_PROJECT_SELECTOR_ORDER = [
  'site00',
  'frontal-slayer',
  'studio-world',
  'ndxbook',
  'all-in-one-enterprises',
  'astral-world',
] as const;

export type DesignProjectSelectorAccent = {
  dotColor: string;
  accentKey: string;
};

const ACCENT_BY_PROJECT: Record<string, DesignProjectSelectorAccent> = {
  site00: { dotColor: '#EB1C24', accentKey: 'SITE00_RED' },
  'frontal-slayer': { dotColor: '#EB1C24', accentKey: 'FRONTAL_RED' },
  'studio-world': { dotColor: '#C9A227', accentKey: 'STUDIO_GOLD' },
  ndxbook: { dotColor: '#B7D236', accentKey: 'NDX_LIME' },
  'all-in-one-enterprises': { dotColor: '#C9A227', accentKey: 'AIO_GOLD' },
  'astral-world': { dotColor: '#7B5EA7', accentKey: 'ASTRAL_PURPLE' },
};

export function resolveDesignProjectSelectorAccent(projectId: string): DesignProjectSelectorAccent {
  return ACCENT_BY_PROJECT[projectId] ?? { dotColor: '#8A857C', accentKey: 'NEUTRAL' };
}

export function sortDesignProjectsCanonically<T extends { projectId: string }>(projects: T[]): T[] {
  const order = CANONICAL_DESIGN_PROJECT_SELECTOR_ORDER as readonly string[];
  return [...projects].sort((a, b) => {
    const ia = order.indexOf(a.projectId);
    const ib = order.indexOf(b.projectId);
    const rankA = ia === -1 ? order.length : ia;
    const rankB = ib === -1 ? order.length : ib;
    return rankA - rankB;
  });
}

export function formatDesignProjectOptionLabel(displayName: string): string {
  return displayName.toUpperCase();
}

/** Real status only — returns null when not meaningful to show. */
export function resolveDesignProjectSelectorStatus(projectId: string): string | null {
  const record = getSite00ManagedProject(projectId);
  if (!record?.status || record.status === 'ACTIVE') return null;
  return record.status.replace(/_/g, ' ');
}
