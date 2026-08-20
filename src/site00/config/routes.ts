/**
 * SITE 00 route constants — single source for navigation and routing.
 * Future reserved namespaces documented in docs/site00/ROUTES.md
 */

export const SITE00_ROUTES = {
  origin: '/',
  originAlias: '/origin',
  originDesktop: '/origin/desktop',
  locations: '/origin/locations',
  enter: '/enter',
  idnty: '/idnty',
  idntySignInSecurity: '/idnty/sign-in-security',
  idntyState: '/idnty/state',
  idntyStateDesktop: '/idnty/state/desktop',
  bldr: '/bldr',
  bldrTemplates: '/bldr/templates',
  bldrStart: '/bldr/start',
  bldrState: '/bldr/state',
  bldrStateDesktop: '/bldr/state/desktop',
  evolve: '/evolve',
  evolveState: '/evolve/state',
  evolveStateDesktop: '/evolve/state/desktop',
  evolveStart: '/evolve/start',
  evolveMarketing: '/evolve/marketing',
  evolveMarketingServices: '/evolve/marketing/services',
  evolveMarketingIntake: '/evolve/marketing/intake/:serviceId',
  evolveMarketingBrief: '/evolve/marketing/brief/:engagementId',
  evolveMarketingEngagement: '/evolve/marketing/engagement/:engagementId',
  evolveMarketingDebug: '/admin/site00/debug/evolve-marketing',
  assts: '/assts',
  asstsBatch: '/assts/batches/:batchId',
  asstsAsset: '/assts/:assetId',
  sites: '/sites',
  services: '/services',
  system: '/system',
  about: '/about',
  journal: '/journal',
  signIn: '/origin/sign-in',
  loaderPreview: '/loader-preview',
  accessDebug: '/access/debug',
  access: '/access',
  accessCredential: (code: string) => `/access/${code}`,
  control: '/control',
  controlSites: '/control/sites',
  controlDomains: '/control/domains',
  controlBilling: '/control/billing',
  controlTeam: '/control/team',
  controlSettings: '/control/settings',
  controlSecurity: '/control/security',
  /** Founder/admin operator dashboard — gated by AdminGuard */
  adminDashboard: '/admin/site00',
  projects: '/projects',
  projectDetail: '/projects/:projectSlug',
  support: '/support',
  /** Client post-payment provisioning — project slug in path */
  projectProvisioning: '/project/:projectSlug/provisioning',
  /** Client Studio operating environment — project slug in path */
  studio: '/studio/:projectSlug',
  studioInput: '/studio/:projectSlug/input',
  studioOperations: '/studio/:projectSlug/operations',
  studioBlueprint: '/studio/:projectSlug/blueprint',
  studioAssets: '/studio/:projectSlug/assets',
  studioReviews: '/studio/:projectSlug/reviews',
  studioReviewDetail: '/studio/:projectSlug/reviews/:reviewId',
  studioMilestones: '/studio/:projectSlug/milestones',
  studioActivity: '/studio/:projectSlug/activity',
} as const;

export function site00ProjectPath(projectSlug: string): string {
  return `/projects/${projectSlug}`;
}

export function site00StudioPath(projectSlug: string, section?: 'input' | 'operations' | 'blueprint' | 'assets' | 'reviews' | 'milestones' | 'activity'): string {
  const base = `/studio/${projectSlug}`;
  return section ? `${base}/${section}` : base;
}

export function site00StudioReviewPath(projectSlug: string, reviewId: string): string {
  return `/studio/${projectSlug}/reviews/${reviewId}`;
}

export function isSite00StudioPath(pathname: string): boolean {
  return pathname.startsWith('/studio/');
}

/** Future reserved stage namespaces — not yet populated */
export const SITE00_FUTURE_ROUTES = {
  bluprint: '/bluprint',
  build: '/build',
  live: '/live',
  account: '/account',
} as const;

export type Site00RouteKey = keyof typeof SITE00_ROUTES;

export function isSite00BldrStateDesktopPath(pathname: string): boolean {
  const desktop = SITE00_ROUTES.bldrStateDesktop;
  return pathname === desktop || pathname.startsWith(`${desktop}/`);
}

export function isSite00EvolveStateDesktopPath(pathname: string): boolean {
  const desktop = SITE00_ROUTES.evolveStateDesktop;
  return pathname === desktop || pathname.startsWith(`${desktop}/`);
}

export function isSite00IdntyStateDesktopPath(pathname: string): boolean {
  const desktop = SITE00_ROUTES.idntyStateDesktop;
  return pathname === desktop || pathname.startsWith(`${desktop}/`);
}

export const IDNTY_ASSESSMENT_STATE_SLUGS = [
  'starting-at-zero',
  'some-pieces-exist',
  'ready-for-evolution',
  'build-ready',
] as const;

export type IdntyAssessmentRouteSlug = (typeof IDNTY_ASSESSMENT_STATE_SLUGS)[number];

export function isSite00IdntyAssessmentPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/desktop(\/|$)/, '/');
  return IDNTY_ASSESSMENT_STATE_SLUGS.some(
    (slug) => normalized === `/idnty/${slug}` || normalized.startsWith(`/idnty/${slug}/`),
  );
}

export function isSite00IdntyAssessmentDesktopPath(pathname: string): boolean {
  return IDNTY_ASSESSMENT_STATE_SLUGS.some(
    (slug) => pathname === `/idnty/${slug}/desktop` || pathname.startsWith(`/idnty/${slug}/desktop/`),
  );
}

export function site00IdntyAssessmentDesktopPath(mobilePath: string): string {
  if (mobilePath.endsWith('/desktop')) return mobilePath;
  return `${mobilePath.replace(/\/$/, '')}/desktop`;
}

export function site00IdntyAssessmentMobilePath(pathname: string): string {
  return pathname.replace(/\/desktop(\/|$)/, (_, slash) => slash || '');
}

export const BLDR_ASSESSMENT_STATE_SLUGS = ['site', 'world', 'enterprise', 'not-sure'] as const;

export type BldrAssessmentRouteSlug = (typeof BLDR_ASSESSMENT_STATE_SLUGS)[number];

export function isSite00BldrAssessmentPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/desktop(\/|$)/, '/');
  return BLDR_ASSESSMENT_STATE_SLUGS.some(
    (slug) => normalized === `/bldr/${slug}` || normalized.startsWith(`/bldr/${slug}/`),
  );
}

export function isSite00BldrAssessmentDesktopPath(pathname: string): boolean {
  return BLDR_ASSESSMENT_STATE_SLUGS.some(
    (slug) => pathname === `/bldr/${slug}/desktop` || pathname.startsWith(`/bldr/${slug}/desktop/`),
  );
}

export function site00BldrAssessmentDesktopPath(mobilePath: string): string {
  if (mobilePath.endsWith('/desktop')) return mobilePath;
  return `${mobilePath.replace(/\/$/, '')}/desktop`;
}

export function site00BldrAssessmentMobilePath(pathname: string): string {
  return pathname.replace(/\/desktop(\/|$)/, (_, slash) => slash || '');
}

export const EVOLVE_ASSESSMENT_PATH_SLUGS = ['refine', 'install', 'transform'] as const;

export type EvolveAssessmentRouteSlug = (typeof EVOLVE_ASSESSMENT_PATH_SLUGS)[number];

export function isSite00EvolveAssessmentPath(pathname: string): boolean {
  const normalized = pathname.replace(/\/desktop(\/|$)/, '/');
  return EVOLVE_ASSESSMENT_PATH_SLUGS.some(
    (slug) => normalized === `/evolve/${slug}` || normalized.startsWith(`/evolve/${slug}/`),
  );
}

export function isSite00EvolveAssessmentDesktopPath(pathname: string): boolean {
  return EVOLVE_ASSESSMENT_PATH_SLUGS.some(
    (slug) => pathname === `/evolve/${slug}/desktop` || pathname.startsWith(`/evolve/${slug}/desktop/`),
  );
}

export function site00EvolveAssessmentDesktopPath(mobilePath: string): string {
  if (mobilePath.endsWith('/desktop')) return mobilePath;
  return `${mobilePath.replace(/\/$/, '')}/desktop`;
}

export function site00EvolveAssessmentMobilePath(pathname: string): string {
  return pathname.replace(/\/desktop(\/|$)/, (_, slash) => slash || '');
}

export function evolveMarketingIntakePath(serviceId: string): string {
  return `/evolve/marketing/intake/${serviceId}`;
}

export function evolveMarketingBriefPath(engagementId: string): string {
  return `/evolve/marketing/brief/${engagementId}`;
}

export function evolveMarketingEngagementPath(engagementId: string): string {
  return `/evolve/marketing/engagement/${engagementId}`;
}

/** Route helpers for templates */
export const evolveMarketingRoutes = {
  intake: evolveMarketingIntakePath,
  brief: evolveMarketingBriefPath,
  engagement: evolveMarketingEngagementPath,
} as const;

export function site00EvolveMarketingIntake(serviceId: string): string {
  return evolveMarketingIntakePath(serviceId);
}
export function site00EvolveMarketingBrief(engagementId: string): string {
  return evolveMarketingBriefPath(engagementId);
}
export function site00EvolveMarketingEngagement(engagementId: string): string {
  return evolveMarketingEngagementPath(engagementId);
}

export function isSite00OriginDesktopPath(pathname: string): boolean {
  const desktop = SITE00_ROUTES.originDesktop;
  return pathname === desktop || pathname.startsWith(`${desktop}/`);
}

export function isSite00Route(pathname: string): boolean {
  const paths = Object.values(SITE00_ROUTES);
  return paths.some((p) => (p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(`${p}/`)));
}

export function site00NavPathIsActive(pathname: string, href: string): boolean {
  if (href === SITE00_ROUTES.origin) {
    return pathname === '/' || pathname === SITE00_ROUTES.originAlias;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Mobile bottom nav — keep BLDR workflow on state routes instead of bouncing to mobile entry. */
export function site00MobileBuildNavHref(pathname: string): string {
  if (isSite00BldrStateDesktopPath(pathname)) {
    return SITE00_ROUTES.bldrStateDesktop;
  }
  if (pathname.startsWith(SITE00_ROUTES.bldrState)) {
    return SITE00_ROUTES.bldrState;
  }
  if (isSite00BldrAssessmentPath(pathname)) {
    return site00BldrAssessmentMobilePath(pathname);
  }
  return SITE00_ROUTES.bldr;
}

/** Mobile bottom nav — contextual EVOLVE workflow on state/assessment routes. */
export function site00MobileEvolveNavHref(pathname: string): string {
  if (isSite00EvolveStateDesktopPath(pathname)) {
    return SITE00_ROUTES.evolveStateDesktop;
  }
  if (pathname.startsWith(SITE00_ROUTES.evolveState)) {
    return SITE00_ROUTES.evolveState;
  }
  if (isSite00EvolveAssessmentPath(pathname)) {
    return site00EvolveAssessmentMobilePath(pathname);
  }
  return SITE00_ROUTES.evolve;
}
