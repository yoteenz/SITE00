import type { LoaderPresentation } from './loader-composition-resolver';

/** Text overlay always uses the mobile composition map (711×1536) — desktop media included. */
export function useLoaderPresentation(_loaderId: string): LoaderPresentation {
  return 'mobile';
}
