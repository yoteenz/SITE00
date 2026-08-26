/**
 * P0.VR.3H — Missing route completion constants.
 */

export const P0_VR_3H_LINEAGE = 'P0.VR.3H-SITE00' as const;

export const COMPOSER_DRAFT_SNAPSHOT_LABEL = 'CURRENT · COMPOSER DRAFT' as const;

export const SITE00_REPO_OWNED_PROJECTS = ['SITE00', 'NDXBOOK'] as const;

export const EXTERNAL_REPO_OWNED_PROJECTS = [
  'FRONTAL_SLAYER',
  'ALL_IN_ONE_ENTERPRISES',
  'STUDIO_WORLD_FSBW',
] as const;

export const COMPOSER_PAGE_AUTHORSHIP = {
  authorType: 'COMPOSER' as const,
  createdBySprint: P0_VR_3H_LINEAGE,
  reviewStatus: 'UNREVIEWED' as const,
  publishStatus: 'PREVIEW_ONLY' as const,
};

export const P0_VR_3H_FAILURE_CODES = [
  'FAIL_EXTERNAL_REPO_ROUTE_MODIFIED',
  'FAIL_HOST_SHELL_MUTATED',
  'FAIL_EXISTING_PAGE_OVERWRITTEN',
  'FAIL_UNSUPPORTED_BUSINESS_FACT_INVENTED',
  'FAIL_UNSUPPORTED_NDXBOOK_CANON_INVENTED',
  'FAIL_COMPLEX_PAGE_BATCH_APPROVED',
  'FAIL_UNAPPROVED_ROUTE_PUBLICLY_NAVIGABLE',
  'FAIL_GENERIC_NDXBOOK_SAAS_DESIGN',
] as const;

/** Routes implemented this sprint — preview-only until founder approval. */
export const COMPOSER_DRAFT_ROUTES = [
  '/guide',
  '/sound',
  '/faq',
  '/contact',
  '/blueprints',
  '/origin/forgot-password',
  '/origin/reset-password',
  '/account',
  '/brand',
] as const;

export const PRODUCTION_NAV_BLOCKED_ROUTES = [...COMPOSER_DRAFT_ROUTES] as const;
