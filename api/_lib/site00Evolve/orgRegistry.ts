/**
 * Canonical organization ID resolution — fixture IDs for tests, real UUIDs for production.
 */

/** In-memory test fixtures only */
export const MEMORY_ORG_SLUG_TO_ID: Record<string, string> = {
  'site-00': 'org-00000000-0000-4000-8000-000000000001',
  'frontal-slayer': 'org-00000000-0000-4000-8000-000000000002',
  'all-in-one-enterprises': 'org-00000000-0000-4000-8000-000000000003',
  'studio-world': 'org-00000000-0000-4000-8000-000000000004',
  ndxbook: 'org-00000000-0000-4000-8000-000000000005',
};

/** Verified SITE 00 operational Supabase org registry */
export const PRODUCTION_ORG_SLUG_TO_ID: Record<string, string> = {
  'site-00': '2f327283-7207-4eb9-80d0-243617747f2c',
  'frontal-slayer': 'b5b9c48a-f9e0-41e9-afd0-8478600b94fd',
  'all-in-one-enterprises': '3781f0b7-cbc5-470d-8af7-69b97cfa5729',
  'studio-world': 'e6b0ee2c-7140-486f-867f-a759ae731f9a',
  ndxbook: '7681ab75-bddc-43e5-b594-79fcf8168205',
};

export function useMemoryOrgIds(): boolean {
  return process.env.EVOLVE_USE_MEMORY === '1' || process.env.VITEST === 'true';
}

export function orgIdFromSlug(slug: string): string | undefined {
  const map = useMemoryOrgIds() ? MEMORY_ORG_SLUG_TO_ID : PRODUCTION_ORG_SLUG_TO_ID;
  return map[slug];
}

export function slugFromOrgId(orgId: string): string | undefined {
  const map = useMemoryOrgIds() ? MEMORY_ORG_SLUG_TO_ID : PRODUCTION_ORG_SLUG_TO_ID;
  return Object.entries(map).find(([, id]) => id === orgId)?.[0];
}

/** @deprecated use orgRegistry.orgIdFromSlug */
export const ORG_SLUG_TO_ID = MEMORY_ORG_SLUG_TO_ID;
