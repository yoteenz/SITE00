import { SITE00_ROUTES } from './routes';

export type Site00NavItem = {
  id: string;
  label: string;
  href: string;
  /** When false, link is disabled until screen inventory completes */
  enabled: boolean;
};

/** Global top navigation — active state derives from route, never hardcoded */
export const SITE00_GLOBAL_NAV: Site00NavItem[] = [
  { id: 'sites', label: 'SITES', href: SITE00_ROUTES.sites, enabled: true },
  { id: 'services', label: 'SERVICES', href: SITE00_ROUTES.services, enabled: true },
  { id: 'system', label: 'SYSTEM', href: SITE00_ROUTES.system, enabled: true },
  { id: 'about', label: 'ABOUT', href: SITE00_ROUTES.about, enabled: true },
  { id: 'journal', label: 'JOURNAL', href: SITE00_ROUTES.journal, enabled: true },
];
