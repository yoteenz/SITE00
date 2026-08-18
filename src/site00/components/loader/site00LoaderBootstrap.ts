import { probeProductionAlphaAvailable, resolveLoaderGeometryMode, resolveLoaderGeometryModeFromQuery } from './site00LoaderGeometryMode';
import { site00LoaderGeometryPreloadUrl } from './site00LoaderMedia';

/** Resolve which geometry asset to preload for cold-start (alpha WebM/APNG, not 6MB master MP4). */
export async function resolveSite00LoaderGeometryPreloadUrl(): Promise<string> {
  const forced = resolveLoaderGeometryModeFromQuery();
  if (forced === 'screen') return site00LoaderGeometryPreloadUrl('screen');
  if (forced === 'alpha') return site00LoaderGeometryPreloadUrl('alpha');

  const hasAlpha = await probeProductionAlphaAvailable();
  const mode = resolveLoaderGeometryMode(hasAlpha);
  return site00LoaderGeometryPreloadUrl(mode);
}
