/**
 * P0.ORIGIN.1 — approved Origin environment backgrounds (Supabase live-preview/3D images/BG/).
 * Visual authority: founder-attached references — do not regenerate or recolor.
 */

import { site00SupabasePublicStorageBase } from './site00-supabase-env';

/** Storage folder under live-preview/ (space encoded for URLs). */
export const SITE00_ORIGIN_BG_STORAGE_PREFIX = '3D images/BG/';

export type OriginBackgroundAssetRole =
  | 'ORIGIN_DESKTOP_WITH_PANELS'
  | 'ORIGIN_MOBILE_WITH_PANELS'
  | 'ORIGIN_DESKTOP_CLEAN'
  | 'ORIGIN_MOBILE_CLEAN';

/** Canonical filenames — registered roles, not scattered UUID lookups. */
export const SITE00_ORIGIN_BACKGROUND_FILES: Record<OriginBackgroundAssetRole, string> = {
  ORIGIN_DESKTOP_WITH_PANELS: 'C505E8E2-2299-4F99-BCF5-A1592CDD7027.png',
  ORIGIN_MOBILE_WITH_PANELS: '4729B1A3-3E3C-4F2C-9F49-E8AB3C9C46E7.png',
  ORIGIN_DESKTOP_CLEAN: 'A3EDBC2C-A335-4A26-A792-EEE009D366BD.png',
  ORIGIN_MOBILE_CLEAN: 'EBAEDB3E-D0FE-463D-9B41-1C8BF43E44A3.png',
};

export type OriginBackgroundVariant = 'WITH_PANELS' | 'CLEAN';

export type OriginViewportAssetKind = 'desktop' | 'mobile';

export function originBackgroundRole(
  viewport: OriginViewportAssetKind,
  variant: OriginBackgroundVariant,
): OriginBackgroundAssetRole {
  if (viewport === 'mobile') {
    return variant === 'WITH_PANELS' ? 'ORIGIN_MOBILE_WITH_PANELS' : 'ORIGIN_MOBILE_CLEAN';
  }
  return variant === 'WITH_PANELS' ? 'ORIGIN_DESKTOP_WITH_PANELS' : 'ORIGIN_DESKTOP_CLEAN';
}

/** Resolve approved Origin BG asset URL at runtime. */
export function resolveOriginBackgroundAsset(role: OriginBackgroundAssetRole): string {
  const filename = SITE00_ORIGIN_BACKGROUND_FILES[role];
  const base = site00SupabasePublicStorageBase('live-preview/');
  const folder = SITE00_ORIGIN_BG_STORAGE_PREFIX.replace(/ /g, '%20');
  return `${base}${folder}${filename}`;
}

export function resolveOriginBackgroundByViewport(
  viewport: OriginViewportAssetKind,
  variant: OriginBackgroundVariant,
): string {
  return resolveOriginBackgroundAsset(originBackgroundRole(viewport, variant));
}

/** Focal anchors matched to approved reference framing. */
export const SITE00_ORIGIN_BACKGROUND_PRESENTATION: Record<
  OriginBackgroundAssetRole,
  { position: string; size: 'cover' | 'contain' }
> = {
  ORIGIN_DESKTOP_WITH_PANELS: { position: 'center 42%', size: 'cover' },
  ORIGIN_DESKTOP_CLEAN: { position: 'center center', size: 'cover' },
  ORIGIN_MOBILE_WITH_PANELS: { position: 'center 58%', size: 'cover' },
  ORIGIN_MOBILE_CLEAN: { position: 'center 52%', size: 'cover' },
};

export function originBackgroundPresentation(role: OriginBackgroundAssetRole): {
  position: string;
  size: 'cover' | 'contain';
} {
  return SITE00_ORIGIN_BACKGROUND_PRESENTATION[role];
}

/** Legacy env.ts paths — WITH_PANELS variants for default collapsed Origin. */
export const SITE00_ORIGIN_DESKTOP_WITH_PANELS_PATH = SITE00_ORIGIN_BACKGROUND_FILES.ORIGIN_DESKTOP_WITH_PANELS;
export const SITE00_ORIGIN_MOBILE_WITH_PANELS_PATH = SITE00_ORIGIN_BACKGROUND_FILES.ORIGIN_MOBILE_WITH_PANELS;
export const SITE00_ORIGIN_DESKTOP_CLEAN_PATH = SITE00_ORIGIN_BACKGROUND_FILES.ORIGIN_DESKTOP_CLEAN;
export const SITE00_ORIGIN_MOBILE_CLEAN_PATH = SITE00_ORIGIN_BACKGROUND_FILES.ORIGIN_MOBILE_CLEAN;
