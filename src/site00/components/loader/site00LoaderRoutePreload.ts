/**
 * Preload lazy route chunks during the immersive loader gate.
 * Progress stages advance when these promises settle — not on timers.
 */

type RoutePreload = () => Promise<unknown>;

function preloadModule(loader: RoutePreload): Promise<void> {
  return loader().then(() => undefined).catch(() => undefined);
}

/** Map pathname → destination page module import. */
export function preloadSite00RoutePage(pathname: string): Promise<void> {
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

  return Promise.resolve();
}

/** ASSTS library shell — page chunk preload. */
export function preloadAsstsLibraryPage(): Promise<void> {
  return preloadModule(() => import('../../assts/pages/LibraryPage'));
}
