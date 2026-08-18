/**
 * Authenticated SITE 00 Operating World navigation.
 * Public routes (Services, Journal, public Sites, etc.) do NOT belong here.
 */

import { SITE00_ROUTES } from './routes';

export type EcosystemNavId = 'control' | 'projects' | 'sites' | 'idnty';

export type OperatingWorldNavItem = {
  id: string;
  label: string;
  href: string;
};

/** Desktop top navigation — Operating World board canon. */
export const OPERATING_WORLD_TOP_NAV: OperatingWorldNavItem[] = [
  { id: 'control', label: 'CTRL ROOM', href: SITE00_ROUTES.control },
  { id: 'projects', label: 'PROJECTS', href: SITE00_ROUTES.projects },
  { id: 'sites', label: 'SITES', href: SITE00_ROUTES.controlSites },
  { id: 'studio', label: 'STUDIO', href: '/admin/site00/studio' },
  { id: 'approvals', label: 'APPROVALS', href: '/admin/site00/approvals' },
  { id: 'access', label: 'ACCESS', href: SITE00_ROUTES.controlSecurity },
  { id: 'billing', label: 'BILLING', href: SITE00_ROUTES.controlBilling },
];

/** @deprecated Left rail replaced by top nav — kept for mobile reference. */
export type EcosystemRailItem = OperatingWorldNavItem & { dividerBefore?: boolean };

export const ECOSYSTEM_RAIL_NAV: EcosystemRailItem[] = OPERATING_WORLD_TOP_NAV.map((item) => ({ ...item }));

export type EcosystemMobileNavItem = {
  id: EcosystemNavId;
  topLabel: string;
  bottomLabel: string;
  href: string;
};

/** Mobile bottom nav — five primary operating destinations. */
export const ECOSYSTEM_MOBILE_NAV: EcosystemMobileNavItem[] = [
  { id: 'control', topLabel: 'CTRL', bottomLabel: 'ROOM', href: SITE00_ROUTES.control },
  { id: 'projects', topLabel: 'PROJ', bottomLabel: 'ECTS', href: SITE00_ROUTES.projects },
  { id: 'sites', topLabel: 'SITES', bottomLabel: '', href: SITE00_ROUTES.controlSites },
  { id: 'idnty', topLabel: 'IDNTY', bottomLabel: '', href: SITE00_ROUTES.idnty },
];

export function ecosystemNavIdFromPath(pathname: string): EcosystemNavId {
  if (pathname.startsWith(SITE00_ROUTES.projects)) return 'projects';
  if (pathname.startsWith(SITE00_ROUTES.controlSites)) return 'sites';
  if (pathname.startsWith(SITE00_ROUTES.idnty)) return 'idnty';
  if (pathname.startsWith(SITE00_ROUTES.control)) return 'control';
  return 'control';
}

export function isOperatingWorldNavActive(pathname: string, item: OperatingWorldNavItem): boolean {
  if (item.id === 'control') {
    return pathname === SITE00_ROUTES.control;
  }
  if (item.id === 'projects') {
    return pathname.startsWith(SITE00_ROUTES.projects);
  }
  if (item.id === 'sites') {
    return pathname.startsWith(SITE00_ROUTES.controlSites);
  }
  if (item.id === 'studio') {
    return pathname.startsWith('/admin/site00/studio');
  }
  if (item.id === 'approvals') {
    return pathname.startsWith('/admin/site00/approvals');
  }
  if (item.id === 'access') {
    return pathname.startsWith(SITE00_ROUTES.controlSecurity);
  }
  if (item.id === 'billing') {
    return pathname.startsWith(SITE00_ROUTES.controlBilling);
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/** @deprecated Use isOperatingWorldNavActive */
export function isEcosystemRailActive(pathname: string, item: EcosystemRailItem): boolean {
  return isOperatingWorldNavActive(pathname, item);
}

export function isEcosystemMobileNavActive(pathname: string, id: EcosystemNavId): boolean {
  return ecosystemNavIdFromPath(pathname) === id;
}

export type EcosystemPageMeta = {
  title: string;
  subtitle: string;
};

export function ecosystemPageMeta(pathname: string): EcosystemPageMeta {
  if (pathname.startsWith(SITE00_ROUTES.projects)) {
    return { title: 'PROJECTS', subtitle: 'WHAT ARE WE WORKING ON?' };
  }
  if (pathname.startsWith(SITE00_ROUTES.controlSites)) {
    return { title: 'SITES', subtitle: 'MANAGE YOUR DIGITAL PROPERTIES.' };
  }
  if (pathname.startsWith(SITE00_ROUTES.idnty)) {
    return { title: 'IDNTY', subtitle: 'CONTROL YOUR ACCESS. PROTECT WHAT MATTERS.' };
  }
  return { title: 'CTRL ROOM', subtitle: 'WHAT NEEDS MY ATTENTION?' };
}
