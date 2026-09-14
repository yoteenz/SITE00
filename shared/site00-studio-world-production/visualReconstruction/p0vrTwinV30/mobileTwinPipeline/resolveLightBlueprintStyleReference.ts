import { resolveMobileTwinPublicAssetUrl } from './resolveMobileTwinPublicAssetUrl.js';
import { readSite00OptionalEnv } from './readSite00OptionalEnv.js';

export const BLUEPRINT_STYLE_REFERENCE_ROLE = 'STYLE_REFERENCE_ONLY' as const;

/** Optional NBP style anchor — palette/linework only (never composition). */
export function resolveLightBlueprintStyleReferenceUrl(publicOrigin?: string): string | null {
  const raw =
    readSite00OptionalEnv('SITE00_LIGHT_BLUEPRINT_STYLE_REFERENCE_URL') ||
    readSite00OptionalEnv('VITE_SITE00_LIGHT_BLUEPRINT_STYLE_REFERENCE_URL');
  if (!raw) return null;
  return resolveMobileTwinPublicAssetUrl(raw, publicOrigin);
}
