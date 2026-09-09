/**
 * BLDR Site classification — multi-select site types + single-select audience.
 */

export const BLDR_SITE_TYPE_IDS = [
  'business',
  'ecommerce',
  'portfolio',
  'booking',
  'membership',
  'web-app',
  'other',
] as const;

export type BldrSiteTypeId = (typeof BLDR_SITE_TYPE_IDS)[number];

export const BLDR_AUDIENCE_TYPE_IDS = ['b2c', 'b2b', 'both', 'internal'] as const;

export type BldrAudienceTypeId = (typeof BLDR_AUDIENCE_TYPE_IDS)[number];

export const BLDR_SITE_TYPE_OTHER_SPECIFY_KEY = 'type-other-specify';

export function normalizeSiteTypes(value: string | string[] | undefined | null): BldrSiteTypeId[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : [value];
  const out: BldrSiteTypeId[] = [];
  for (const item of raw) {
    const id = String(item).trim().toLowerCase();
    if ((BLDR_SITE_TYPE_IDS as readonly string[]).includes(id) && !out.includes(id as BldrSiteTypeId)) {
      out.push(id as BldrSiteTypeId);
    }
  }
  return out;
}

export function siteTypeSelectionIncludesOther(value: string | string[] | undefined | null): boolean {
  return normalizeSiteTypes(value).includes('other');
}

export function normalizeAudienceType(value: string | string[] | undefined | null): BldrAudienceTypeId | null {
  if (!value) return null;
  const raw = Array.isArray(value) ? value[value.length - 1] : value;
  const id = String(raw).trim().toLowerCase();
  return (BLDR_AUDIENCE_TYPE_IDS as readonly string[]).includes(id) ? (id as BldrAudienceTypeId) : null;
}

/** Legacy single siteType → siteTypes[] */
export function hydrateSiteTypeAnswer(answers: Record<string, string | string[]>): Record<string, string | string[]> {
  const next = { ...answers };
  const siteTypes = normalizeSiteTypes(next.type ?? (next as Record<string, unknown>).siteType as string | undefined);
  if (siteTypes.length) {
    next.type = siteTypes;
  }
  if ('siteType' in next) {
    delete (next as Record<string, unknown>).siteType;
  }
  if (next.audience) {
    const audience = normalizeAudienceType(next.audience);
    if (audience) next.audience = audience;
  }
  return next;
}

export function toggleSiteTypeSelection(current: string[], id: string): string[] {
  return current.includes(id) ? current.filter((s) => s !== id) : [...current, id];
}

export function toggleAudienceSelection(_current: string[], id: string): string {
  return id;
}
