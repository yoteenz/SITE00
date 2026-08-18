/**
 * SITE 00 BLDR state page — build class card + investment guide icons.
 * Supabase live-preview/site00/BLDR/
 */

import { resolveSite00PublicAsset } from '../components/loader/site00LoaderConfig';
import { site00SupabasePublicStorageBase } from './site00-supabase-env';

export const SITE00_BLDR_BUILD_CLASS_ICON_PATHS = {
  site: 'BLDR/33910244-AF13-479A-8861-1CE66A1D68C4.png',
  world: 'BLDR/D5F4496A-52AB-491F-A3C4-7CE01FAF0D05.png',
  enterprise: 'BLDR/5144412A-BD84-4299-950C-48252FE7F4DD.png',
  'not-sure': 'BLDR/CA16B9A4-AA16-445F-9C05-AB24C979BFD0.png',
} as const;

export type BldrBuildClassIconId = keyof typeof SITE00_BLDR_BUILD_CLASS_ICON_PATHS;

const SITE00_ICON_BASE = site00SupabasePublicStorageBase();

export function site00BldrBuildClassIconUrl(id: BldrBuildClassIconId): string {
  const path = SITE00_BLDR_BUILD_CLASS_ICON_PATHS[id];
  const resolved = resolveSite00PublicAsset(path);
  if (resolved.includes('/storage/v1/')) return resolved;
  return `${SITE00_ICON_BASE}${path}`;
}
