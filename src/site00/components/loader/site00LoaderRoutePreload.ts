/**
 * Preload lazy route chunks and destination environment assets during the immersive loader gate.
 * Progress stages advance when these promises settle — not on timers.
 */

import { getEnvironmentForPath, SITE00_ENVIRONMENTS } from '../../config/environments';
import { resolveSite00PublicAsset } from './site00LoaderConfig';
import { resolveSite00LoaderMediaPresentation } from './site00LoaderMedia';
import { preloadSite00LoaderBackground } from './site00LoaderPreload';

type RoutePreload = () => Promise<unknown>;

function preloadModule(loader: RoutePreload): Promise<void> {
  return loader().then(() => undefined).catch(() => undefined);
}

/** Destination page background — what renders under the loader overlay. */
function preloadDestinationEnvironment(pathname: string): Promise<void> {
  const environmentId = getEnvironmentForPath(pathname);
  if (!environmentId) return Promise.resolve();

  const config = SITE00_ENVIRONMENTS[environmentId];
  const presentation = resolveSite00LoaderMediaPresentation();
  const assetPath =
    presentation === 'mobile'
      ? config.mobileAssetPath ?? config.desktopAssetPath
      : config.desktopAssetPath ?? config.mobileAssetPath;

  if (!assetPath) return Promise.resolve();
  return preloadSite00LoaderBackground(resolveSite00PublicAsset(assetPath));
}

function preloadRoutePageChunk(pathname: string): Promise<void> {
  const path = pathname || '/';

  if (path === '/' || path === '/origin' || path.startsWith('/origin/locations')) {
    return path.startsWith('/origin/locations')
      ? preloadModule(() => import('../../pages/LocationsPage'))
      : preloadModule(() => import('../../pages/OriginPage'));
  }
  if (path === '/enter' || path.startsWith('/enter/')) {
    return preloadModule(() => import('../../pages/EnterPage'));
  }
  if (path.startsWith('/idnty/state')) {
    return preloadModule(() => import('../../pages/IdntyStatePage'));
  }
  if (path.startsWith('/idnty')) {
    return preloadModule(() => import('../../pages/IdntyPage'));
  }
  if (path.startsWith('/bldr/state')) {
    return preloadModule(() => import('../../pages/BldrStatePage'));
  }
  if (path.startsWith('/bldr')) {
    return preloadModule(() => import('../../pages/BldrPage'));
  }
  if (path.startsWith('/evolve/state')) {
    return preloadModule(() => import('../../pages/EvolveStatePage'));
  }
  if (path.startsWith('/evolve')) {
    return preloadModule(() => import('../../pages/EvolvePage'));
  }
  if (path.startsWith('/assts')) {
    return preloadModule(() => import('../../assts/pages/LibraryPage'));
  }
  if (path.startsWith('/control')) {
    return preloadModule(() => import('../../pages/control/ControlOverviewPage'));
  }
  if (path === '/projects' || path.startsWith('/projects/')) {
    return preloadModule(() => import('../../pages/ProjectsPage'));
  }

  return Promise.resolve();
}

/** Page chunk + destination environment background for the route under the loader. */
export function preloadSite00RoutePage(pathname: string): Promise<void> {
  return Promise.all([
    preloadRoutePageChunk(pathname),
    preloadDestinationEnvironment(pathname),
  ]).then(() => undefined);
}

/** ASSTS library shell — page chunk preload. */
export function preloadAsstsLibraryPage(): Promise<void> {
  return preloadModule(() => import('../../assts/pages/LibraryPage'));
}
