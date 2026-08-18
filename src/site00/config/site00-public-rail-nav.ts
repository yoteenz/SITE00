import { SITE00_ROUTES } from './routes';

export type Site00PublicRailItem = {
  id: string;
  label: string;
  href: string;
  dividerBefore?: boolean;
};

/** Desktop left rail — public SITE 00 destinations (storyboard IA). */
export const SITE00_PUBLIC_RAIL_NAV: Site00PublicRailItem[] = [
  { id: 'origin', label: 'ORIGIN', href: SITE00_ROUTES.originAlias },
  { id: 'locations', label: 'LOCATIONS', href: SITE00_ROUTES.locations },
  { id: 'sites', label: 'SITES', href: SITE00_ROUTES.sites, dividerBefore: true },
  { id: 'services', label: 'SERVICES', href: SITE00_ROUTES.services },
  { id: 'system', label: 'SYSTEM', href: SITE00_ROUTES.system },
  { id: 'about', label: 'ABOUT', href: SITE00_ROUTES.about },
  { id: 'journal', label: 'JOURNAL', href: SITE00_ROUTES.journal },
  { id: 'idnty', label: 'IDNTY', href: SITE00_ROUTES.idnty },
  { id: 'bldr', label: 'BLDR / START BUILD', href: SITE00_ROUTES.bldr },
];

export function isSite00PublicRailActive(pathname: string, item: Site00PublicRailItem): boolean {
  if (item.id === 'origin') {
    return pathname === SITE00_ROUTES.originAlias || pathname === SITE00_ROUTES.origin || pathname.startsWith('/origin/desktop');
  }
  if (item.id === 'locations') {
    return pathname.startsWith(SITE00_ROUTES.locations);
  }
  if (item.id === 'idnty') {
    return pathname.startsWith(SITE00_ROUTES.idnty);
  }
  if (item.id === 'bldr') {
    return pathname.startsWith(SITE00_ROUTES.bldr);
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
