/**
 * SITE 00 IDNTY state page — brand state card + investment guide icons.
 * Supabase live-preview/site00/IDNTY/
 */

import { resolveSite00PublicAsset } from '../components/loader/site00LoaderConfig';
import { site00SupabasePublicStorageBase } from './site00-supabase-env';

export const SITE00_IDNTY_BRAND_STATE_ICON_PATHS = {
  'starting-at-zero': 'IDNTY/D4E43816-FA69-4D9A-A45D-66D2339C8B4C.png',
  'some-pieces': 'IDNTY/D95E546E-FDCA-4A96-8803-3115C6E64F80.png',
  'ready-evolution': 'IDNTY/D6A87CF3-DC4A-4411-AEC1-3597BADA5CFF.png',
  'build-ready': 'IDNTY/275DBF51-6D60-4203-BEB3-0BFFE8E6F95F.png',
} as const;

export type IdntyBrandStateIconId = keyof typeof SITE00_IDNTY_BRAND_STATE_ICON_PATHS | 'needs-cohesion';

const SITE00_ICON_BASE = site00SupabasePublicStorageBase();

export function site00IdntyBrandStateIconUrl(id: IdntyBrandStateIconId): string {
  if (id === 'needs-cohesion') return '';
  const path = SITE00_IDNTY_BRAND_STATE_ICON_PATHS[id];
  const resolved = resolveSite00PublicAsset(path);
  if (resolved.includes('/storage/v1/')) return resolved;
  return `${SITE00_ICON_BASE}${path}`;
}
