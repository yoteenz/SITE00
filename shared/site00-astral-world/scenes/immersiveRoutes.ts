/**
 * P0.E.FT5 — Primary immersive routes (scene-first, not document pages).
 */

export const ASTRAL_IMMERSIVE_ROUTE_PREFIXES = [
  'home',
  'astrea',
  'readers',
  'friends',
  'journal',
  'profile',
] as const;

export type AstralImmersiveRoutePrefix = (typeof ASTRAL_IMMERSIVE_ROUTE_PREFIXES)[number];

/** Strip experience / fast-track base to section segment */
export function astralRouteSection(pathname: string): string {
  const match = pathname.match(/\/projects\/astral-world\/(?:experience|debug\/world)\/?(.*)$/);
  return (match?.[1] ?? '').replace(/^\//, '').replace(/\/$/, '') || 'home';
}

export function isAstralImmersiveRoute(pathname: string): boolean {
  const section = astralRouteSection(pathname);
  return ASTRAL_IMMERSIVE_ROUTE_PREFIXES.some(
    (prefix) => section === prefix || section.startsWith(`${prefix}/`),
  );
}
