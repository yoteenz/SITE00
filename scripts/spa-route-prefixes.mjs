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

/** Detect SITE 00 SPA index.html (root or nested prefix stub). */
export function isSpaShellHtml(html) {
  if (!html || typeof html !== 'string') return false;
  if (html.includes(SPA_SHELL_MARKER) || html.includes("id='root'")) return true;
  if (html.includes('site00-assts-boot-shell') && /\/assets\/index\.[A-Za-z0-9_-]+\.js/.test(html)) {
    return true;
  }
  if (html.includes('app-build-id') && html.includes('id="root"')) return true;
  return false;
}

export function isRawApacheErrorHtml(html) {
  const t = html.slice(0, 800).toLowerCase();
  return (
    (t.includes('403 forbidden') || t.includes('<title>403 forbidden</title>')) &&
    !t.includes('id="root"')
  );
}
