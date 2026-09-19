/** Astral World prototype route bases — experience vs founder fast track */

export const ASTRAL_EXPERIENCE_BASE = '/projects/astral-world/experience' as const;
export const ASTRAL_FAST_TRACK_BASE = '/projects/astral-world/debug/world' as const;

export type AstralWorldRouteMode = 'experience' | 'fast-track';

export function astralWorldRouteBase(mode: AstralWorldRouteMode): string {
  return mode === 'fast-track' ? ASTRAL_FAST_TRACK_BASE : ASTRAL_EXPERIENCE_BASE;
}

export function astralWorldSectionPath(base: string, section: string): string {
  const clean = section.replace(/^\//, '');
  return `${base.replace(/\/$/, '')}/${clean}`;
}

export function site00ProjectFastTrackWorldPath(projectSlug: string, section?: string): string {
  const base = `/projects/${projectSlug}/debug/world`;
  return section ? astralWorldSectionPath(base, section) : `${base}/home`;
}
