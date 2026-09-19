/**
 * P0.VR.3M — Design ownership constants.
 */

export const CANONICAL_SITE00_DESIGN_ROUTE = '/projects/site00/design' as const;

export const LEGACY_DESIGN_ROUTE_PATTERNS = [
  '/studio-world/design',
  '/projects/:projectSlug/design',
] as const;

/** Studio World native production / operator routes — not public website design scope. */
export const STUDIO_WORLD_INTERNAL_ROUTE_PREFIXES = [
  '/studio/',
  '/admin/site00',
  '/control',
] as const;

export const DESIGN_HOST_ACCENT_TOKEN = 'SITE00_RED' as const;

export const P0_VR_3M_FAILURE_CODES = [
  'FAIL_MANAGED_PROJECT_OWNS_DESIGN_WORKSPACE',
  'FAIL_DESIGN_HOST_SHELL_NOT_SITE00',
  'FAIL_PROJECT_ACCENT_RECOLORS_HOST_SHELL',
  'FAIL_LEGACY_DESIGN_ROUTE_NOT_REDIRECTED',
  'FAIL_CANONICAL_DESIGN_ROUTE_MISSING',
  'FAIL_WEBSITE_SHELL_PROPAGATION_MUTATES_DESIGN_HOST',
  'FAIL_STUDIO_WORLD_INTERNAL_ROUTES_IN_WEBSITE_SCOPE',
] as const;
