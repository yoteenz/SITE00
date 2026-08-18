/**
 * SITE 00 Origin — IDNTY expanded panel framework pillar icons (desktop).
 * Supabase live-preview/site00/IDNTY/
 */

import { resolveSite00PublicAsset } from '../components/loader/site00LoaderConfig';
import { site00SupabasePublicStorageBase } from './site00-supabase-env';

export const SITE00_IDNTY_FRAMEWORK_ICON_PATHS = {
  strategy: 'IDNTY/E8AC966E-FC27-47EF-BEE5-181EC58A9C30.png',
  visual: 'IDNTY/BFA612F0-079B-4C3B-95B2-409C5FABC7B1.png',
  voice: 'IDNTY/F37252D9-6E1F-43DA-97FB-CBC4E63F972E.png',
  values: 'IDNTY/1FE1C0A1-F969-4D47-8E93-399C5D56DDF3.png',
  experience: 'IDNTY/B7ACDA18-C35E-435A-B053-04D5D3447847.png',
} as const;

export type IdntyFrameworkIconId = keyof typeof SITE00_IDNTY_FRAMEWORK_ICON_PATHS;

const SITE00_ICON_BASE = site00SupabasePublicStorageBase();

export function site00IdntyFrameworkIconUrl(id: IdntyFrameworkIconId): string {
  const path = SITE00_IDNTY_FRAMEWORK_ICON_PATHS[id];
  const resolved = resolveSite00PublicAsset(path);
  if (resolved.includes('/storage/v1/')) return resolved;
  return `${SITE00_ICON_BASE}${path}`;
}
