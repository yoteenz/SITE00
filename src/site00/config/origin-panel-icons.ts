/**
 * SITE 00 Origin homepage — approved collapsed panel icons (desktop).
 * Supabase live-preview/site00/
 */

import { resolveSite00PublicAsset } from '../components/loader/site00LoaderConfig';
import { site00SupabasePublicStorageBase } from './site00-supabase-env';

export const SITE00_ORIGIN_IDNTY_PANEL_ICON_PATH = 'A97879A2-FFEA-4BD5-AC0A-74359620A851.png';

export const SITE00_ORIGIN_BLDR_PANEL_ICON_PATH = '0C81A5FC-35AD-4C8B-A292-5BF88E14193E.png';

/** Placeholder until production EVOLVE master icon is supplied — swap file at /assets/evolve/evolve-master.svg */
export const SITE00_ORIGIN_EVOLVE_PANEL_ICON_FALLBACK = '/assets/evolve/evolve-master.svg';

const SITE00_ORIGIN_PANEL_ICON_BASE = site00SupabasePublicStorageBase();

function site00OriginPanelIconUrl(path: string): string {
  const resolved = resolveSite00PublicAsset(path);
  if (resolved.includes('/storage/v1/')) return resolved;
  return `${SITE00_ORIGIN_PANEL_ICON_BASE}${path}`;
}

export function site00OriginIdntyPanelIconUrl(): string {
  return site00OriginPanelIconUrl(SITE00_ORIGIN_IDNTY_PANEL_ICON_PATH);
}

export function site00OriginBldrPanelIconUrl(): string {
  return site00OriginPanelIconUrl(SITE00_ORIGIN_BLDR_PANEL_ICON_PATH);
}

export function site00OriginEvolvePanelIconUrl(): string {
  return SITE00_ORIGIN_EVOLVE_PANEL_ICON_FALLBACK;
}
