import type { EvolveEvolutionPathId, EvolveStartEvolveRouteInput, EvolveStartEvolveRouteResult } from './types.js';

/** Resolve START EVOLVE / ENTER PATH destinations from user + project state. */
export function resolveStartEvolveRoute(input: EvolveStartEvolveRouteInput): EvolveStartEvolveRouteResult {
  if (input.pathId) {
    const slug = input.pathId;
    const base = input.isDesktop ? `/evolve/${slug}/desktop/property` : `/evolve/${slug}/property`;
    return { route: base, reason: 'PATH_ASSESSMENT' };
  }

  if (!input.isSignedIn) {
    return { route: '/origin/sign-in?return=/evolve', reason: 'AUTH_REQUIRED' };
  }

  if (input.hasEvolveProject && input.evolveProjectSlug) {
    return { route: `/app/projects/${input.evolveProjectSlug}`, reason: 'OPEN_EVOLVE_HOME' };
  }

  if (input.serviceMode === 'MARKETING_CREATIVE_INTELLIGENCE') {
    return { route: '/evolve/marketing', reason: 'NEW_EVOLVE_PROJECT' };
  }

  return { route: '/evolve/state', reason: 'NEW_EVOLVE_PROJECT' };
}

export function resolveEnterPathRoute(
  pathId: EvolveEvolutionPathId,
  isDesktop: boolean,
): EvolveStartEvolveRouteResult {
  const base = isDesktop ? `/evolve/${pathId}/desktop/property` : `/evolve/${pathId}/property`;
  return { route: base, reason: 'PATH_ASSESSMENT' };
}
