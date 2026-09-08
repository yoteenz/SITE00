/**
 * Founder-supplied bottom nav icon PNGs (projects mobile bottom panel).
 * Filenames live in Supabase public bucket `live-preview/Icons`.
 */

import type { NDXIconName } from '../../../shared/site00-studio-world-ui/icons/index.js';

export const NDX_BOTTOM_NAV_ICON_FILES: Partial<Record<NDXIconName, string>> = {
  overview: 'E1338D32-15BE-4B60-B743-E408EE8C99B7.png',
  campaigns: 'CE13C8F0-B45D-4146-A36C-BAFE0A7655A8.png',
  content_ops: 'C2E80426-CE34-4369-B8B6-4B9E035E29D7.png',
  lab: '8DA238D1-0D12-4BD2-BC72-B6EC3742A112.png',
  more: '47B47A35-B9AC-4D3B-A25B-9F6F89ABF2E7.png',
};

function resolveSupabasePublicStorageBase(): string {
  const url =
    (import.meta as unknown as { env?: { VITE_SUPABASE_URL?: string } }).env?.VITE_SUPABASE_URL?.replace(/\/$/, '') ??
    '';
  if (!url) return '';
  return `${url}/storage/v1/object/public/live-preview/Icons`;
}

export function getNdxBottomNavIconUrl(name: NDXIconName): string | null {
  const file = NDX_BOTTOM_NAV_ICON_FILES[name];
  if (!file) return null;
  const base = resolveSupabasePublicStorageBase();
  if (!base) return null;
  return `${base}/${file}`;
}

/** @deprecated use getNdxBottomNavIconUrl — retained for tests inspecting filename map */
export const NDX_BOTTOM_NAV_ICON_URLS = NDX_BOTTOM_NAV_ICON_FILES;
