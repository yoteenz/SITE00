/** 00 / CONTROL — operator navigation (maps to existing admin routes). */
import { SITE00_ADMIN_ROUTES } from './routes';

export type ControlNavItem = {
  id: string;
  label: string;
  href: string;
  icon: string;
  kicker?: string;
};

export const CONTROL_OPERATOR_NAV: ControlNavItem[] = [
  { id: 'command', label: 'COMMAND', href: SITE00_ADMIN_ROUTES.dashboard, icon: 'command' },
  { id: 'projects', label: 'PROJECTS', href: SITE00_ADMIN_ROUTES.projects, icon: 'projects' },
  { id: 'production', label: 'PRODUCTION', href: SITE00_ADMIN_ROUTES.studio, icon: 'production' },
  { id: 'reviews', label: 'REVIEWS', href: SITE00_ADMIN_ROUTES.approvals, icon: 'reviews' },
  { id: 'clients', label: 'CLIENTS', href: SITE00_ADMIN_ROUTES.identities, icon: 'clients' },
  { id: 'assets', label: 'ASSETS / VAULT', href: '/assts', icon: 'assets' },
  { id: 'systems', label: 'SYSTEMS', href: SITE00_ADMIN_ROUTES.sites, icon: 'systems' },
  { id: 'automation', label: 'AUTOMATION', href: SITE00_ADMIN_ROUTES.settingsAutomation, icon: 'automation' },
  { id: 'business', label: 'BUSINESS', href: SITE00_ADMIN_ROUTES.finance, icon: 'business' },
  { id: 'reports', label: 'REPORTS', href: SITE00_ADMIN_ROUTES.reports, icon: 'reports' },
  { id: 'settings', label: 'SETTINGS', href: SITE00_ADMIN_ROUTES.settings, icon: 'settings' },
];

export const CONTROL_MOBILE_QUICK_ACTIONS = [
  { id: 'new-project', label: 'NEW PROJECT', href: SITE00_ADMIN_ROUTES.projects, icon: 'plus' },
  { id: 'reviews', label: 'CREATE REVIEW', href: SITE00_ADMIN_ROUTES.approvals, icon: 'reviews' },
  { id: 'launch', label: 'LAUNCH QUEUE', href: SITE00_ADMIN_ROUTES.projects, icon: 'launch' },
  { id: 'health', label: 'SYSTEM HEALTH', href: SITE00_ADMIN_ROUTES.dashboard, icon: 'health' },
] as const;

export function controlNavIsActive(pathname: string, href: string): boolean {
  if (href === SITE00_ADMIN_ROUTES.dashboard) {
    return pathname === href || pathname === `${href}/`;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
