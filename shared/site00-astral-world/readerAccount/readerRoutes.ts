/**
 * P0.R.1 — Reader-specific routing (separate from Seeker experience routes).
 */

export const ASTRAL_READER_ROUTE_BASE = '/projects/astral-world/reader' as const;

export type ReaderRouteSection =
  | 'onboarding'
  | 'home'
  | 'profile'
  | 'avatar'
  | 'services'
  | 'availability'
  | 'presence'
  | 'clients'
  | 'alerts'
  | 'readings'
  | 'settings';

export function readerRoutePath(section: ReaderRouteSection, sub?: string): string {
  const base = ASTRAL_READER_ROUTE_BASE.replace(/\/$/, '');
  if (sub) return `${base}/${section}/${sub.replace(/^\//, '')}`;
  return `${base}/${section}`;
}

export const READER_ONBOARDING_ROUTE = `${ASTRAL_READER_ROUTE_BASE}/onboarding` as const;
