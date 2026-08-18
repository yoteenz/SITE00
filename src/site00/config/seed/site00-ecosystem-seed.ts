/**
 * Structured seed data for SITE 00 authenticated ecosystem pages.
 * Used when production APIs are unavailable — isolated from business logic.
 */

export type ProjectStatus = 'ACTIVE' | 'IN PROGRESS' | 'DRAFT' | 'ARCHIVED' | 'COMPLETED';

export type EcosystemProject = {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  stage: string;
  progress: number;
  lastUpdated: string;
  teamInitials: string[];
  href: string;
  serviceLine?: 'IDNTY' | 'BLDR' | 'EVOLVE';
};

export type EcosystemSite = {
  id: string;
  domain: string;
  name: string;
  status: 'Published' | 'Draft' | 'Not published';
  lastUpdated: string;
  href: string;
};

export type AttentionItem = {
  id: string;
  label: string;
  urgent?: boolean;
  href: string;
};

export type NowItem = {
  id: string;
  label: string;
  href?: string;
};

export type ActiveBuild = {
  id: string;
  name: string;
  stage: string;
  progress: number;
  href: string;
};

export type SignalItem = {
  id: string;
  message: string;
  timeAgo: string;
};

export type UpNextItem = {
  id: string;
  label: string;
  date: string;
};

export type QuickLaunchItem = {
  id: string;
  label: string;
  href: string;
};

export type ActivityItem = {
  id: string;
  entity: string;
  action: string;
  timeAgo: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  initials: string;
};

export type RoleSummary = {
  role: string;
  count: number;
};

export type IdntyBenefit = {
  id: string;
  label: string;
  description: string;
};

export type IdntyValueProp = {
  id: string;
  label: string;
};

/** Demo engagements — replace when project API exists. */
export const ECOSYSTEM_PROJECTS_SEED: EcosystemProject[] = [
  {
    id: 'northquarter',
    name: 'Northquarter Brand + Digital Launch',
    description: 'Brand identity and digital platform launch.',
    status: 'ACTIVE',
    stage: 'Development',
    progress: 75,
    lastUpdated: '2025-08-16T14:30:00Z',
    teamInitials: ['JC', 'TM', 'AR'],
    href: '/projects/northquarter',
    serviceLine: 'BLDR',
  },
  {
    id: 'future-archives',
    name: 'Future Archives Preservation Platform',
    description: 'Digital preservation and archive experience.',
    status: 'IN PROGRESS',
    stage: 'Identity',
    progress: 40,
    lastUpdated: '2025-08-14T09:15:00Z',
    teamInitials: ['JC', 'JL'],
    href: '/projects/future-archives',
    serviceLine: 'IDNTY',
  },
  {
    id: 'jordan-cole-studio',
    name: 'Jordan Cole Studio Website',
    description: 'Personal studio site and portfolio.',
    status: 'IN PROGRESS',
    stage: 'Review',
    progress: 90,
    lastUpdated: '2025-08-17T11:00:00Z',
    teamInitials: ['JC'],
    href: '/projects/jordan-cole-studio',
  },
  {
    id: 'product-research',
    name: 'Product Research Hub',
    description: 'Internal research and discovery workspace.',
    status: 'DRAFT',
    stage: 'Strategy',
    progress: 15,
    lastUpdated: '2025-08-10T16:45:00Z',
    teamInitials: ['JC', 'TM'],
    href: '/projects/product-research',
    serviceLine: 'EVOLVE',
  },
  {
    id: 'internal-tools',
    name: 'Internal Tools Redesign',
    description: 'Operational tooling and admin surfaces.',
    status: 'ARCHIVED',
    stage: 'Complete',
    progress: 100,
    lastUpdated: '2025-06-22T08:00:00Z',
    teamInitials: ['AR'],
    href: '/projects/internal-tools',
  },
];

export const ECOSYSTEM_SITES_SEED: EcosystemSite[] = [
  {
    id: 'jordancole',
    domain: 'jordancole.studio',
    name: 'Jordan Cole Studio',
    status: 'Published',
    lastUpdated: '2025-05-18T12:00:00Z',
    href: '/control/sites/jordancole',
  },
  {
    id: 'northquarter',
    domain: 'northquarter.co',
    name: 'Northquarter',
    status: 'Published',
    lastUpdated: '2025-05-10T09:30:00Z',
    href: '/control/sites/northquarter',
  },
  {
    id: 'futurearchives',
    domain: 'futurearchives.io',
    name: 'Future Archives',
    status: 'Draft',
    lastUpdated: '2025-05-07T15:20:00Z',
    href: '/control/sites/futurearchives',
  },
  {
    id: 'new-project',
    domain: 'new project',
    name: 'New Project',
    status: 'Not published',
    lastUpdated: '2025-05-05T10:00:00Z',
    href: '/control/sites/new-project',
  },
];

export const CTRL_ROOM_NOW_SEED: NowItem[] = [
  { id: 'actions', label: '2 actions need you', href: '/projects' },
  { id: 'approval', label: '1 approval waiting', href: '/projects/jordan-cole-studio' },
  { id: 'milestone', label: 'Next milestone Thursday', href: '/projects/northquarter' },
];

export const CTRL_ROOM_ATTENTION_SEED: AttentionItem[] = [
  { id: 'homepage', label: 'Homepage direction awaiting approval', urgent: true, href: '/projects/jordan-cole-studio' },
  { id: 'domain', label: 'Domain connection required', urgent: true, href: '/control/domains' },
  { id: 'invoice', label: 'Invoice due Aug 24', href: '/control/billing' },
  { id: 'files', label: '3 new files delivered', href: '/projects/northquarter' },
];

export const CTRL_ROOM_UP_NEXT_SEED: UpNextItem[] = [
  { id: 'homepage', label: 'Homepage Approval', date: 'Aug 20' },
  { id: 'content', label: 'Content Delivery', date: 'Aug 22' },
  { id: 'dev', label: 'Development Complete', date: 'Aug 28' },
];

export const CTRL_ROOM_QUICK_LAUNCH_SEED: QuickLaunchItem[] = [
  { id: 'sites', label: 'OPEN SITES', href: '/control/sites' },
  { id: 'build', label: 'START BUILD', href: '/bldr/state' },
  { id: 'billing', label: 'VIEW BILLING', href: '/control/billing' },
  { id: 'support', label: 'CONTACT SITE 00', href: '/support' },
];

export const PROJECT_ACTIVITY_SEED: ActivityItem[] = [
  { id: '1', entity: 'Jordan Cole Studio', action: 'Homepage concept approved', timeAgo: '2h ago' },
  { id: '2', entity: 'Future Archives', action: 'Identity exploration submitted', timeAgo: '1d ago' },
  { id: '3', entity: 'Northquarter', action: 'Development started', timeAgo: '3d ago' },
  { id: '4', entity: 'Product Research Hub', action: 'Content strategy reviewed', timeAgo: '5d ago' },
];

export const SITE_ACTIVITY_SEED: ActivityItem[] = [
  { id: '1', entity: 'northquarter.co', action: 'Site published', timeAgo: '2d ago' },
  { id: '2', entity: 'jordancole.studio', action: 'Content updated', timeAgo: '4d ago' },
  { id: '3', entity: 'futurearchives.io', action: 'Page draft created', timeAgo: '1w ago' },
  { id: '4', entity: 'new project', action: 'Site created', timeAgo: '2w ago' },
];

export const MY_ROLES_SEED: RoleSummary[] = [
  { role: 'OWNER', count: 4 },
  { role: 'COLLABORATOR', count: 3 },
  { role: 'REVIEWER', count: 2 },
];

export const SITE_TEAM_SEED: TeamMember[] = [
  { id: '1', name: 'Jordan Cole', role: 'Owner', initials: 'JC' },
  { id: '2', name: 'Taylor Morgan', role: 'Editor', initials: 'TM' },
  { id: '3', name: 'Alex Rivera', role: 'Developer', initials: 'AR' },
  { id: '4', name: 'Jamie Lee', role: 'Viewer', initials: 'JL' },
];

export const IDNTY_BENEFITS_SEED: IdntyBenefit[] = [
  { id: 'access', label: 'PROJECT ACCESS', description: 'Connect to every project and workspace in your universe.' },
  { id: 'history', label: 'BUILD HISTORY', description: 'Track builds, decisions, and progress across engagements.' },
  { id: 'progress', label: 'SAVED PROGRESS', description: 'Resume exactly where you left off — always in sync.' },
  { id: 'collab', label: 'COLLABORATION', description: 'Work with your team across projects and properties.' },
  { id: 'files', label: 'SECURE FILES', description: 'Protected access to deliverables and shared assets.' },
  { id: 'services', label: 'SITE 00 SERVICES', description: 'Unlock domains, billing, and ecosystem tools.' },
];

export const IDNTY_VALUE_PROPS_SEED: IdntyValueProp[] = [
  { id: 'secure', label: 'Secure Access' },
  { id: 'control', label: 'Complete Control' },
  { id: 'sync', label: 'Always in Sync' },
  { id: 'built', label: 'Built for You' },
];

export function formatEcosystemDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function computeProjectMetrics(projects: EcosystemProject[]) {
  return {
    total: projects.length,
    active: projects.filter((p) => p.status === 'ACTIVE' || p.status === 'IN PROGRESS').length,
    completed: projects.filter((p) => p.status === 'COMPLETED').length,
    archived: projects.filter((p) => p.status === 'ARCHIVED').length,
  };
}

export function computeSiteMetrics(sites: EcosystemSite[]) {
  return {
    active: sites.filter((s) => s.status === 'Published').length,
    draft: sites.filter((s) => s.status === 'Draft' || s.status === 'Not published').length,
    total: sites.length,
    team: sites.length > 0 ? 2 : 0,
  };
}
