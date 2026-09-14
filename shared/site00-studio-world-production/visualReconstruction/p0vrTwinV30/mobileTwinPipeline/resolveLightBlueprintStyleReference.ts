import { resolveMobileTwinPublicAssetUrl } from './resolveMobileTwinPublicAssetUrl.js';

export const BLUEPRINT_STYLE_REFERENCE_ROLE = 'STYLE_REFERENCE_ONLY' as const;

/** Optional NBP style anchor — palette/linework only (never composition). */
export function resolveLightBlueprintStyleReferenceUrl(publicOrigin?: string): string | null {
  const raw = (
    process.env.SITE00_LIGHT_BLUEPRINT_STYLE_REFERENCE_URL ??
    process.env.VITE_SITE00_LIGHT_BLUEPRINT_STYLE_REFERENCE_URL ??
    ''
  ).trim();
  if (!raw) return null;
  return resolveMobileTwinPublicAssetUrl(raw, publicOrigin);
}
