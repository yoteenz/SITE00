/**
 * P0.PROD.PROJECTS-ROUTE-RELIABILITY1 — production path ownership (frontend vs API).
 */

/** GoDaddy/cPanel SPA route-prefix folders (must match scripts/spa-route-prefixes.mjs). */
export const SPA_ROUTE_PREFIXES = [
  'projects',
  'services',
  'control',
  'origin',
  'studio-world',
  'admin',
  'app',
  'assts',
  'idnty',
  'bldr',
  'evolve',
  'validation',
  'astral-world',
  'bluprint',
  'build',
  'live',
  'system',
  'sign-in',
  'identity',
  'register',
  'create-account',
] as const;

export const PRODUCTION_ROUTING_CONTRACT = {
  frontendHost: 'site00.com',
  apiHost: 'api.site00.com',
  frontendPaths: ['/', ...SPA_ROUTE_PREFIXES.map((p) => `/${p}/*`)],
  apiPaths: ['/api/*'],
  staticPaths: ['/assets/*', '/favicon.ico', '/release-manifest.json', '/site00-assts-*'],
} as const;

export const CANONICAL_SPA_SHELL_ROUTES = [
  '/',
  '/projects',
  '/projects/',
  '/projects/ndxbook',
  '/projects/ndxbook/design',
  '/projects/frontal-slayer/experience',
  '/system/design/workspace-concepts',
] as const;

export function isSite00SpaShellHtml(html: string): boolean {
  return html.includes('id="root"') || html.includes("id='root'");
}

export function isRawHostingForbiddenPage(html: string): boolean {
  const head = html.slice(0, 1200).toLowerCase();
  return head.includes('403 forbidden') && !isSite00SpaShellHtml(html);
}
