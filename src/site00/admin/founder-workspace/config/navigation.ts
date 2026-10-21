import { IDNTY_FOUNDER_WORKSPACE_ROUTES, type FounderWorkspaceDestinationId } from './routes';

export type WorkspaceNavItem = {
  id: FounderWorkspaceDestinationId;
  ordinal: string;
  label: string;
  href: string;
  /** Shown in mobile drawer / workspace menu (not bottom bar). */
  mobileMenuOnly?: boolean;
};

/** Desktop / tablet sidebar — Referrals before System (founder lock FD-R20). */
export const FOUNDER_WORKSPACE_SIDEBAR_NAV: WorkspaceNavItem[] = [
  { id: 'overview', ordinal: '01', label: 'Overview', href: IDNTY_FOUNDER_WORKSPACE_ROUTES.overview },
  { id: 'foundations', ordinal: '02', label: 'Foundations', href: IDNTY_FOUNDER_WORKSPACE_ROUTES.foundations },
  { id: 'reviews', ordinal: '03', label: 'Reviews', href: IDNTY_FOUNDER_WORKSPACE_ROUTES.reviews },
  { id: 'operations', ordinal: '04', label: 'Operations', href: IDNTY_FOUNDER_WORKSPACE_ROUTES.operations },
  { id: 'correspondence', ordinal: '05', label: 'Correspondence', href: IDNTY_FOUNDER_WORKSPACE_ROUTES.correspondence },
  { id: 'referrals', ordinal: '06', label: 'Referrals', href: IDNTY_FOUNDER_WORKSPACE_ROUTES.referrals },
  { id: 'system', ordinal: '07', label: 'System', href: IDNTY_FOUNDER_WORKSPACE_ROUTES.system },
];

/** Mobile bottom bar — SYSTEM stays; Referrals via menu only. */
export const FOUNDER_WORKSPACE_MOBILE_BOTTOM_NAV: Array<
  | { kind: 'link'; id: FounderWorkspaceDestinationId | 'create'; label: string; href?: string }
  | { kind: 'action'; id: 'create'; label: string }
> = [
  { kind: 'link', id: 'overview', label: 'Home', href: IDNTY_FOUNDER_WORKSPACE_ROUTES.overview },
  { kind: 'link', id: 'foundations', label: 'Foundations', href: IDNTY_FOUNDER_WORKSPACE_ROUTES.foundations },
  { kind: 'action', id: 'create', label: 'Create' },
  { kind: 'link', id: 'reviews', label: 'Reviews', href: IDNTY_FOUNDER_WORKSPACE_ROUTES.reviews },
  { kind: 'link', id: 'system', label: 'System', href: IDNTY_FOUNDER_WORKSPACE_ROUTES.system },
];

export const FOUNDER_WORKSPACE_MOBILE_MENU_EXTRA: WorkspaceNavItem[] = [
  { id: 'operations', ordinal: '04', label: 'Operations', href: IDNTY_FOUNDER_WORKSPACE_ROUTES.operations, mobileMenuOnly: true },
  { id: 'correspondence', ordinal: '05', label: 'Correspondence', href: IDNTY_FOUNDER_WORKSPACE_ROUTES.correspondence, mobileMenuOnly: true },
  { id: 'referrals', ordinal: '06', label: 'Referrals', href: IDNTY_FOUNDER_WORKSPACE_ROUTES.referrals, mobileMenuOnly: true },
];

export function destinationFromPathname(pathname: string): FounderWorkspaceDestinationId {
  if (pathname.includes('/foundations')) return 'foundations';
  if (pathname.includes('/reviews')) return 'reviews';
  if (pathname.includes('/operations')) return 'operations';
  if (pathname.includes('/correspondence')) return 'correspondence';
  if (pathname.includes('/referrals')) return 'referrals';
  if (pathname.includes('/system')) return 'system';
  return 'overview';
}

export function navItemIsActive(pathname: string, href: string): boolean {
  if (href.endsWith('/overview')) return pathname === href || pathname.endsWith('/founder-workspace');
  return pathname === href || pathname.startsWith(`${href}/`);
}
