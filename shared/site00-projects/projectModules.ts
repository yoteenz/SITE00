/**
 * B5.9R1 — Project module registry, subnav configs, and routing helpers.
 */

export const PROJECT_MODULES = [
  'OVERVIEW',
  'IDENTITY',
  'BUILDER',
  'EVOLVE',
  'PRODUCTION',
  'REVIEWS',
  'LIBRARY',
  'MORE',
] as const;

export type ProjectModuleId = (typeof PROJECT_MODULES)[number];

export type ProjectModuleSubnavItem = {
  id: string;
  label: string;
  hrefSuffix?: string;
};

export type ProjectModuleConfig = {
  id: ProjectModuleId;
  label: string;
  description: string;
  requiredCapabilities: string[];
  mobileSubnav: ProjectModuleSubnavItem[];
  mobileSubnavOverflow?: ProjectModuleSubnavItem[];
};

export const PROJECT_MODULE_CONFIGS: Record<ProjectModuleId, ProjectModuleConfig> = {
  OVERVIEW: {
    id: 'OVERVIEW',
    label: 'OVERVIEW',
    description: 'PROJECT SNAPSHOT & ACTIVITY',
    requiredCapabilities: [],
    mobileSubnav: [
      { id: 'SNAPSHOT', label: 'SNAPSHOT' },
      { id: 'ACTIVITY', label: 'ACTIVITY' },
      { id: 'ALERTS', label: 'ALERTS' },
      { id: 'MORE', label: 'MORE' },
    ],
  },
  IDENTITY: {
    id: 'IDENTITY',
    label: 'IDENTITY',
    description: 'BRAND TRUTH, VISUALS, AND STRATEGY',
    requiredCapabilities: ['IDENTITY'],
    mobileSubnav: [
      { id: 'TRUTH', label: 'TRUTH' },
      { id: 'VOICE', label: 'VOICE' },
      { id: 'DNA', label: 'DNA' },
      { id: 'MORE', label: 'MORE' },
    ],
    mobileSubnavOverflow: [
      { id: 'PERSONALITY', label: 'PERSONALITY' },
      { id: 'TERRITORIES', label: 'TERRITORIES' },
      { id: 'BRAND_BIBLE', label: 'BRAND BIBLE' },
      { id: 'ASSETS', label: 'ASSETS' },
    ],
  },
  BUILDER: {
    id: 'BUILDER',
    label: 'BUILDER',
    description: 'WEBSITE CONSTRUCTION & PRODUCTION',
    requiredCapabilities: ['BUILDER'],
    mobileSubnav: [
      { id: 'PAGES', label: 'PAGES' },
      { id: 'FEATURES', label: 'FEATURES' },
      { id: 'QA', label: 'QA' },
      { id: 'MORE', label: 'MORE' },
    ],
    mobileSubnavOverflow: [
      { id: 'DESIGN', label: 'DESIGN' },
      { id: 'SYSTEMS', label: 'SYSTEMS' },
      { id: 'DEPLOYMENTS', label: 'DEPLOYMENTS' },
      { id: 'HISTORY', label: 'HISTORY' },
    ],
  },
  EVOLVE: {
    id: 'EVOLVE',
    label: 'EVOLVE',
    description: 'CAMPAIGNS, CONTENT & GROWTH',
    requiredCapabilities: ['EVOLVE'],
    mobileSubnav: [
      { id: 'CAMPAIGNS', label: 'CAMPAIGNS' },
      { id: 'CONTENT', label: 'CONTENT' },
      { id: 'ANALYTICS', label: 'ANALYTICS' },
      { id: 'MORE', label: 'MORE' },
    ],
    mobileSubnavOverflow: [
      { id: 'PACKAGES', label: 'PACKAGES' },
      { id: 'CAMPAIGN_BOARD', label: 'CAMPAIGN BOARD' },
      { id: 'LAB', label: 'LAB' },
      { id: 'EMAIL', label: 'EMAIL' },
      { id: 'SOCIAL', label: 'SOCIAL' },
      { id: 'COPY', label: 'COPY' },
      { id: 'CREATIVE_INTELLIGENCE', label: 'CREATIVE INTELLIGENCE' },
    ],
  },
  PRODUCTION: {
    id: 'PRODUCTION',
    label: 'PRODUCTION',
    description: 'LAUNCH READINESS & ENVIRONMENTS',
    requiredCapabilities: ['PRODUCTION'],
    mobileSubnav: [
      { id: 'READINESS', label: 'READINESS' },
      { id: 'RELEASES', label: 'RELEASES' },
      { id: 'ENVIRONMENTS', label: 'ENVIRONMENTS' },
      { id: 'MORE', label: 'MORE' },
    ],
    mobileSubnavOverflow: [
      { id: 'DOMAIN', label: 'DOMAIN' },
      { id: 'DNS', label: 'DNS' },
      { id: 'PERFORMANCE', label: 'PERFORMANCE' },
      { id: 'UPTIME', label: 'UPTIME' },
      { id: 'BLOCKERS', label: 'BLOCKERS' },
      { id: 'LAUNCH_CHECKLIST', label: 'LAUNCH CHECKLIST' },
    ],
  },
  REVIEWS: {
    id: 'REVIEWS',
    label: 'REVIEWS',
    description: 'APPROVALS & FEEDBACK',
    requiredCapabilities: ['REVIEWS'],
    mobileSubnav: [
      { id: 'PENDING', label: 'PENDING' },
      { id: 'APPROVED', label: 'APPROVED' },
      { id: 'HISTORY', label: 'HISTORY' },
      { id: 'MORE', label: 'MORE' },
    ],
  },
  LIBRARY: {
    id: 'LIBRARY',
    label: 'LIBRARY',
    description: 'ASSETS & FILES',
    requiredCapabilities: ['LIBRARY'],
    mobileSubnav: [
      { id: 'ASSETS', label: 'ASSETS' },
      { id: 'DELIVERABLES', label: 'DELIVERABLES' },
      { id: 'REFERENCES', label: 'REFERENCES' },
      { id: 'MORE', label: 'MORE' },
    ],
  },
  MORE: {
    id: 'MORE',
    label: 'MORE',
    description: 'ADDITIONAL PROJECT SURFACES',
    requiredCapabilities: [],
    mobileSubnav: [
      { id: 'SETTINGS', label: 'SETTINGS' },
      { id: 'ACTIVITY', label: 'ACTIVITY' },
      { id: 'CONNECTIONS', label: 'CONNECTIONS' },
      { id: 'MORE', label: 'MORE' },
    ],
  },
};

export function projectModulePath(projectSlug: string, moduleId: ProjectModuleId): string {
  const segment = moduleId === 'OVERVIEW' ? 'overview' : moduleId.toLowerCase();
  return `/projects/${projectSlug}/${segment}`;
}

export function resolveModuleFromPath(pathname: string): ProjectModuleId | null {
  const match = pathname.match(/\/projects\/[^/]+\/([^/?#]+)/);
  if (!match) return 'OVERVIEW';
  const segment = match[1]?.toLowerCase();
  if (segment === 'overview' || segment === undefined) return 'OVERVIEW';
  const found = PROJECT_MODULES.find((m) => m.toLowerCase() === segment);
  return found ?? null;
}

export function getModuleSubnav(moduleId: ProjectModuleId): ProjectModuleSubnavItem[] {
  return PROJECT_MODULE_CONFIGS[moduleId].mobileSubnav;
}
