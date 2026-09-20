/**
 * P0.PROD.PROJECTS-ROUTE-RELIABILITY1 — authoritative SPA route-prefix list for GoDaddy/cPanel.
 * Keep public/.htaccess prefix rule in sync (same segments, pipe-separated).
 */
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
];

/** Direct GET probes after deploy (HTML shell routes — not API). */
export const CANONICAL_SPA_SHELL_ROUTES = [
  '/',
  '/projects',
  '/projects/',
  '/projects/ndxbook',
  '/projects/ndxbook/design',
  '/projects/frontal-slayer/experience',
  '/system/design/workspace-concepts',
  '/services',
  '/sign-in',
];

export const SPA_SHELL_MARKER = 'id="root"';

export function isRawApacheErrorHtml(html) {
  const t = html.slice(0, 800).toLowerCase();
  return (
    (t.includes('403 forbidden') || t.includes('<title>403 forbidden</title>')) &&
    !t.includes('id="root"')
  );
}
