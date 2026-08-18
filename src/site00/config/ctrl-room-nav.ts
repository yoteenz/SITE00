/**
 * CTRL ROOM navigation — customer-facing account environment for SITE 00.
 */

import { SITE00_ROUTES } from './routes';

export type CtrlRoomNavItem = {
  id: string;
  label: string;
  href: string;
};

export const CTRL_ROOM_NAV: CtrlRoomNavItem[] = [
  { id: 'overview', label: 'OVERVIEW', href: SITE00_ROUTES.control },
  { id: 'sites', label: 'SITES', href: SITE00_ROUTES.controlSites },
  { id: 'domains', label: 'DOMAINS', href: SITE00_ROUTES.controlDomains },
  { id: 'billing', label: 'BILLING', href: SITE00_ROUTES.controlBilling },
  { id: 'team', label: 'TEAM', href: SITE00_ROUTES.controlTeam },
  { id: 'settings', label: 'SETTINGS', href: SITE00_ROUTES.controlSettings },
  { id: 'security', label: 'SECURITY', href: SITE00_ROUTES.controlSecurity },
];

export function ctrlRoomNavLabel(pathname: string): string {
  const match = CTRL_ROOM_NAV.find(
    (item) => pathname === item.href || (item.href !== SITE00_ROUTES.control && pathname.startsWith(`${item.href}/`)),
  );
  return match?.label ?? 'OVERVIEW';
}

export function isCtrlRoomNavActive(pathname: string, href: string): boolean {
  if (href === SITE00_ROUTES.control) {
    return pathname === href;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}
