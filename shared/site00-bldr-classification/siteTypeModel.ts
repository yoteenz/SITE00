/**
 * BLDR site-type selection helpers for intake landing fields.
 */

export const BLDR_SITE_TYPE_OTHER_SPECIFY_KEY = 'type-other-specify';

export function normalizeSiteTypes(value: string | string[] | undefined): string[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function siteTypeSelectionIncludesOther(value: string | string[] | undefined): boolean {
  return normalizeSiteTypes(value).includes('other');
}
