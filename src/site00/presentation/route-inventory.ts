/**
 * SITE 00 presentation route inventory — canonical URL → mobile/desktop components.
 * Shared logic stays in hooks/config; presentations are swappable via PresentationGate.
 */

import { SITE00_ROUTES } from '../config/routes';

export type Site00PresentationRouteEntry = {
  path: string;
  mobile: string;
  desktop: string;
  sharedLogic: string;
  shell: string;
  notes?: string;
};

export const SITE00_PRESENTATION_ROUTE_INVENTORY: Site00PresentationRouteEntry[] = [
  {
    path: SITE00_ROUTES.originAlias,
    mobile: 'MobileOrigin',
    desktop: 'DesktopOrigin',
    sharedLogic: 'useSite00 (homeMode)',
    shell: 'Site00OriginRouteShell',
    notes: 'Canonical origin — mobile bottom nav; desktop artboard + status rail',
  },
  {
    path: SITE00_ROUTES.enter,
    mobile: 'MobileEnter',
    desktop: 'DesktopEnter',
    sharedLogic: 'SITE00_DIRECTORY_SECTIONS',
    shell: 'Site00OriginRouteShell',
  },
  {
    path: SITE00_ROUTES.locations,
    mobile: 'LocationsPage (MobileLocations)',
    desktop: 'Redirect → origin (desktop directory TBD)',
    sharedLogic: 'SITE00_LOCATIONS_SECTIONS',
    shell: 'Site00MobileShell',
  },
  {
    path: SITE00_ROUTES.idntyState,
    mobile: 'IdntyStatePage',
    desktop: 'IdntyStatePage + artboard',
    sharedLogic: 'useSite00, useIdntyAssessment',
    shell: 'Site00OriginRouteShell',
  },
  {
    path: SITE00_ROUTES.sites,
    mobile: 'SitesPortfolioPage via Site00PublicShell',
    desktop: 'SitesPortfolioPage via Site00PublicShell + artboard',
    sharedLogic: 'site00-public-pages seed',
    shell: 'Site00PublicRouteShell',
  },
  {
    path: SITE00_ROUTES.services,
    mobile: 'ServicesPage via Site00PublicShell',
    desktop: 'ServicesPage via Site00PublicShell + artboard',
    sharedLogic: 'SITE00_SERVICES_SEED',
    shell: 'Site00PublicRouteShell',
  },
  {
    path: SITE00_ROUTES.bldr,
    mobile: 'BldrPage via Site00PublicShell',
    desktop: 'BldrPage via Site00PublicShell + artboard',
    sharedLogic: 'useSite00',
    shell: 'Site00PublicRouteShell',
  },
  {
    path: SITE00_ROUTES.evolve,
    mobile: 'EvolvePage via Site00PublicShell',
    desktop: 'EvolvePage via Site00PublicShell + artboard',
    sharedLogic: 'useSite00',
    shell: 'Site00PublicRouteShell',
  },
];
