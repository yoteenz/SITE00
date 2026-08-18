import { SITE00_ADMIN_ROUTES } from './routes';

export type Site00AdminNavItem = {
  id: string;
  label: string;
  href: string;
  badge?: number;
  icon?: string;
};

export const SITE00_ADMIN_PRODUCTION_NAV: Site00AdminNavItem[] = [
  { id: 'studio', label: 'STUDIO', href: SITE00_ADMIN_ROUTES.studio, icon: 'studio' },
  { id: 'approvals', label: 'APPROVALS', href: SITE00_ADMIN_ROUTES.approvals, icon: 'approvals' },
];

export const SITE00_ADMIN_NAV: Site00AdminNavItem[] = [
  { id: 'dashboard', label: 'DASHBOARD', href: SITE00_ADMIN_ROUTES.dashboard, icon: 'dashboard' },
  { id: 'identities', label: 'IDENTITIES', href: SITE00_ADMIN_ROUTES.identities, icon: 'identities' },
  { id: 'bldr-intakes', label: 'BLDR INTAKE', href: SITE00_ADMIN_ROUTES.bldrIntakes, icon: 'intake' },
  { id: 'projects', label: 'PROJECTS', href: SITE00_ADMIN_ROUTES.projects, icon: 'projects' },
  { id: 'sites', label: 'SITES', href: SITE00_ADMIN_ROUTES.sites, icon: 'sites' },
  { id: 'ctrl-room', label: 'CTRL ROOM', href: SITE00_ADMIN_ROUTES.ctrlRoom, icon: 'ctrl' },
  { id: 'leads', label: 'LEADS', href: SITE00_ADMIN_ROUTES.leads, icon: 'leads' },
  { id: 'discovery', label: 'DISCOVERY', href: SITE00_ADMIN_ROUTES.discovery, icon: 'discovery' },
  { id: 'finance', label: 'FINANCE', href: SITE00_ADMIN_ROUTES.finance, icon: 'finance' },
  { id: 'team', label: 'TEAM', href: SITE00_ADMIN_ROUTES.team, icon: 'team' },
  { id: 'reports', label: 'REPORTS', href: SITE00_ADMIN_ROUTES.reports, icon: 'reports' },
  { id: 'settings', label: 'SETTINGS', href: SITE00_ADMIN_ROUTES.settings, icon: 'settings' },
];

export const SITE00_ADMIN_MOBILE_NAV = [
  { id: 'dashboard', label: 'DASHBOARD', href: SITE00_ADMIN_ROUTES.dashboard, icon: 'dashboard' },
  { id: 'identities', label: 'IDENTITIES', href: SITE00_ADMIN_ROUTES.identities, icon: 'identities' },
  { id: 'projects', label: 'PROJECTS', href: SITE00_ADMIN_ROUTES.projects, icon: 'projects' },
  { id: 'ctrl-room', label: 'CTRL ROOM', href: SITE00_ADMIN_ROUTES.ctrlRoom, icon: 'ctrl' },
  { id: 'more', label: 'MORE', href: SITE00_ADMIN_ROUTES.settings, icon: 'more' },
];

export const PROJECT_WORKSPACE_TABS = [
  { id: 'overview', label: 'OVERVIEW', suffix: '' },
  { id: 'intelligence', label: 'INTELLIGENCE', suffix: '/intelligence' },
  { id: 'studio', label: 'STUDIO', suffix: '/studio' },
  { id: 'approvals', label: 'APPROVALS', suffix: '/approvals' },
  { id: 'deliverables', label: 'DELIVERABLES', suffix: '/deliverables' },
  { id: 'access', label: 'ACCESS', suffix: '/access' },
  { id: 'activity', label: 'ACTIVITY', suffix: '/activity' },
] as const;
