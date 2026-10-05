/** Product family firewall — explicit route → family mapping. */

const CHECKOUT_PREFIX = '/checkout';
const AUTH_ROUTES = new Set(['/origin/sign-in', '/origin/create-account', '/idnty/sign-in-security']);

export function resolveProductFamily(route: string): string {
  const r = route.split('?')[0];
  if (r === '/' || r.startsWith('/origin')) {
    if (r.includes('locations')) return 'LOCATIONS';
    if (AUTH_ROUTES.has(r)) return 'AUTH';
    return 'ORIGIN';
  }
  if (r.startsWith('/idnty')) return 'IDNTY';
  if (r.startsWith('/bldr')) return 'BLDR';
  if (r.startsWith('/evolve')) {
    if (r.includes('/marketing')) return 'PUBLIC_EVOLVE_MARKETING';
    return 'PUBLIC_EVOLVE';
  }
  if (r.startsWith(CHECKOUT_PREFIX)) return 'CHECKOUT';
  if (r.startsWith('/sites') || r.startsWith('/services') || r.startsWith('/system') || r.startsWith('/about') || r.startsWith('/journal')) {
    return 'LOCATIONS_CHILD';
  }
  if (r.startsWith('/projects')) return 'PROJECT';
  if (r.startsWith('/access') || r.startsWith('/enter')) return 'ORIGIN';
  return 'PUBLIC_MISC';
}

/** IDNTY evolution state routes must never inherit PUBLIC EVOLVE authorities. */
export function isIdntyEvolutionRoute(route: string): boolean {
  return /\/idnty\/ready-for-evolution/.test(route);
}

export function isPublicEvolveRoute(route: string): boolean {
  return route.startsWith('/evolve') && !route.includes('/projects/');
}

export function isBuildReadyVerification(route: string): boolean {
  return /\/idnty\/build-ready\//.test(route);
}

export function isBldrIntake(route: string): boolean {
  return /^\/bldr\/(site|world|enterprise|not-sure)/.test(route.split('?')[0]);
}
