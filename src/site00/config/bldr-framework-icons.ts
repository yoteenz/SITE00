/**
 * SITE 00 Origin — BLDR expanded panel framework pillar icons (desktop).
 * Supabase live-preview/site00/BLDR/
 */

import { resolveSite00PublicAsset } from '../components/loader/site00LoaderConfig';
import { site00SupabasePublicStorageBase } from './site00-supabase-env';

export const SITE00_BLDR_FRAMEWORK_ICON_PATHS = {
  direction: 'BLDR/3BAA4AA4-23A7-49B0-AAD7-C4E0509A0EEE.png',
  structure: 'BLDR/02A0815E-CA19-41EC-BD42-28B1BE2843AF.png',
  function: 'BLDR/9A58E6FC-0316-4351-85E2-93068223558E.png',
  experience: 'BLDR/95F5DCB3-39D9-44D0-A9EA-51391F3CF83A.png',
  scope: 'BLDR/748C57FF-27EA-42F9-8DE5-9C9945F61BD9.png',
} as const;

export type BldrFrameworkIconId = keyof typeof SITE00_BLDR_FRAMEWORK_ICON_PATHS;

const SITE00_ICON_BASE = site00SupabasePublicStorageBase();

export function site00BldrFrameworkIconUrl(id: BldrFrameworkIconId): string {
  const path = SITE00_BLDR_FRAMEWORK_ICON_PATHS[id];
  const resolved = resolveSite00PublicAsset(path);
  if (resolved.includes('/storage/v1/')) return resolved;
  return `${SITE00_ICON_BASE}${path}`;
}
