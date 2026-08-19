import { site00LoaderAnimationPreloadUrl } from './site00LoaderMedia';

/** Resolve which environment animation asset to preload for cold-start. */
export async function resolveSite00LoaderGeometryPreloadUrl(): Promise<string> {
  return site00LoaderAnimationPreloadUrl();
}
