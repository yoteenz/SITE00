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
  evolvePlans: '/evolve/plans',
  assts: '/assts',
  asstsBatch: '/assts/batches/:batchId',
  asstsAsset: '/assts/:assetId',
  sites: '/sites',
  services: '/services',
  system: '/system',
  about: '/about',
  journal: '/journal',
  signIn: '/origin/sign-in',
  createAccount: '/origin/create-account',
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
  projectOrigin: '/projects/:projectSlug/origin',
  projectIdentity: '/projects/:projectSlug/identity',
  projectSetup: '/projects/:projectSlug/setup',
  projectEvolve: '/projects/:projectSlug/evolve',
  projectCreativeDirection: '/projects/:projectSlug/creative-direction',
  projectLoreCalibration: '/projects/:projectSlug/calibrate',
  projectCreativeAppetite: '/projects/:projectSlug/creative-appetite',
  projectPersonalityReplay: '/projects/:projectSlug/personality-replay',
  projectPersonalityReplayConsistency: '/projects/:projectSlug/personality-replay/consistency',
  projectCanonicalCreativeRange: '/projects/:projectSlug/canonical-creative-range',
  projectCanonicalCarouselExpansion: '/projects/:projectSlug/canonical-carousel-expansion',
  projectExperimentD: '/projects/:projectSlug/experiment-d-concept-territory',
  projectExperimentF: '/projects/:projectSlug/experiment-f-six-concept-reformation',
  projectExperimentG: '/projects/:projectSlug/experiment-g-brand-presentation-concepts',
  projectExperimentGDirections:
    '/projects/:projectSlug/experiment-g-brand-presentation-concepts/directions',
  projectExperimentGFinalists:
    '/projects/:projectSlug/experiment-g-brand-presentation-concepts/finalists',
  projectExperimentH: '/projects/:projectSlug/brand-character-formation',
  projectBrandCharacterDevelopment: '/projects/:projectSlug/brand-character-development',
  projectBrandCharacterReadiness: '/projects/:projectSlug/brand-character-readiness',
  projectBrandCharacterDeepening: '/projects/:projectSlug/brand-character-deepening',
  projectBrandCharacterSynthesis: '/projects/:projectSlug/brand-character-synthesis',
  projectBrandCharacterArtifactProofs: '/projects/:projectSlug/brand-character-artifact-proofs',
  projectBrandMarketingExpression: '/projects/:projectSlug/marketing-expression',
  projectBrandMarketingExpressionExperiment01: '/projects/:projectSlug/marketing-expression/experiment-01',
  projectContentOperations: '/projects/:projectSlug/content-operations',
  projectContentOperationsPerformance: '/projects/:projectSlug/content-operations/performance',
  projectContentOperationsCampaignBoard: '/projects/:projectSlug/content-operations/campaign-board',
  projectFounderCreativeIngestion: '/projects/:projectSlug/content-operations/founder-creative-ingest',
  projectFilmProduction: '/projects/:projectSlug/content-operations/film-production',
  projectFilmProductionDailies: '/projects/:projectSlug/content-operations/film-production/dailies',
  projectFilmProductionSceneDeck: '/projects/:projectSlug/content-operations/film-production/scene-deck',
  projectContentOperationsDailyPlan: '/projects/:projectSlug/content-operations/daily-plan',
  projectRealismLab: '/projects/:projectSlug/realism-lab',
  projectRealismLabBrief: '/projects/:projectSlug/realism-lab/brief',
  projectRealismLabProviders: '/projects/:projectSlug/realism-lab/providers',
  projectRealismLabRuns: '/projects/:projectSlug/realism-lab/runs',
  projectRealismLabReview: '/projects/:projectSlug/realism-lab/review',
  projectRealismLabContinuity: '/projects/:projectSlug/realism-lab/continuity',
  projectRealismLabDecision: '/projects/:projectSlug/realism-lab/decision',
  projectCulturalIntelligence: '/projects/:projectSlug/cultural-intelligence',
  projectCulturalIntelligenceSources: '/projects/:projectSlug/cultural-intelligence/sources',
  projectCulturalIntelligenceWeeklyForecast: '/projects/:projectSlug/cultural-intelligence/weekly-forecast',
  projectMotionCharacter: '/projects/:projectSlug/motion-character',
  projectEmbodiedCharacterDiscovery: '/projects/:projectSlug/embodied-character',
  projectFounderCharacterDiscovery: '/projects/:projectSlug/character/discovery',
  projectCharacterContinuity: '/projects/:projectSlug/character/continuity',
  projectCharacterContinuityReview: '/projects/:projectSlug/character/continuity/review',
  projectCharacterCasting: '/projects/:projectSlug/character/casting',
  projectExperimentE: '/projects/:projectSlug/experience-expression',
  projectExperimentEVisualDevelopment: '/projects/:projectSlug/experience-expression/visual-development',
  projectExperiments: '/projects/:projectSlug/experiments',
  projectFounderWorkspaceArchive: '/projects/:projectSlug/archive',
  projectNdxIconSheet: '/projects/:projectSlug/inspect/icons',
  projectNotifications: '/projects/:projectSlug/notifications',
  projectContentLibrary: '/projects/:projectSlug/content-library',
  projectPersonalityReplayStep: '/projects/:projectSlug/personality-replay/:stepId',
  projectConnections: '/projects/:projectSlug/connections',
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
  /** Client canonical intake retrieval — Identity + Builder intake persistence infrastructure */
  accountIntakes: '/account/intakes',
  accountIntakeDetail: '/account/intakes/:intakeType/:intakeId',
  /** Guest secure intake access/resume — no sign-in required */
  intakeGuestAccess: '/intake/access/:token',
  /** World-class client guest discovery — private token link */
  worldIntakeGuest: '/intake/:token',
} as const;

export function site00AccountIntakeDetailPath(intakeType: string, intakeId: string): string {
  return `/account/intakes/${intakeType.toLowerCase()}/${intakeId}`;
}

export function site00IntakeGuestAccessPath(token: string): string {
  return `/intake/access/${token}`;
}

export function site00ProjectPath(projectSlug: string): string {
  return `/projects/${projectSlug}`;
}

export function site00ProjectOriginPath(projectSlug: string): string {
  return `/projects/${projectSlug}/origin`;
}

export function site00ProjectIdentityPath(projectSlug: string): string {
  return `/projects/${projectSlug}/identity`;
}

export function site00ProjectSetupPath(projectSlug: string): string {
  return `/projects/${projectSlug}/setup`;
}

export function site00ProjectLoreCalibrationPath(projectSlug: string): string {
  return `/projects/${projectSlug}/calibrate`;
}

export function site00ProjectCreativeAppetitePath(projectSlug: string): string {
  return `/projects/${projectSlug}/creative-appetite`;
}

export function site00ProjectPersonalityReplayPath(projectSlug: string): string {
  return `/projects/${projectSlug}/personality-replay`;
}

export function site00ProjectPersonalityReplayConsistencyPath(projectSlug: string): string {
  return `/projects/${projectSlug}/personality-replay/consistency`;
}

export function site00ProjectCanonicalCreativeRangePath(projectSlug: string): string {
  return `/projects/${projectSlug}/canonical-creative-range`;
}

export function site00ProjectCanonicalCarouselExpansionPath(projectSlug: string): string {
  return `/projects/${projectSlug}/canonical-carousel-expansion`;
}

export function site00ProjectPersonalityReplayStepPath(projectSlug: string, stepId: string): string {
  return `/projects/${projectSlug}/personality-replay/${stepId}`;
}

export function site00ProjectEvolvePath(projectSlug: string): string {
  return `/projects/${projectSlug}/evolve`;
}

export function site00ProjectCreativeDirectionPath(projectSlug: string): string {
  return `/projects/${projectSlug}/creative-direction`;
}

export function site00ProjectExperimentEPath(projectSlug: string): string {
  return `/projects/${projectSlug}/experience-expression`;
}

export function site00ProjectExperimentDPath(projectSlug: string): string {
  return `/projects/${projectSlug}/experiment-d-concept-territory`;
}

export function site00ProjectExperimentFPath(projectSlug: string): string {
  return `/projects/${projectSlug}/experiment-f-six-concept-reformation`;
}

export function site00ProjectExperimentGPath(projectSlug: string): string {
  return `/projects/${projectSlug}/experiment-g-brand-presentation-concepts`;
}

export function site00ProjectExperimentGDirectionsPath(projectSlug: string): string {
  return `/projects/${projectSlug}/experiment-g-brand-presentation-concepts/directions`;
}

export function site00ProjectExperimentGFinalistsPath(projectSlug: string): string {
  return `/projects/${projectSlug}/experiment-g-brand-presentation-concepts/finalists`;
}

export function site00ProjectExperimentHPath(projectSlug: string): string {
  return `/projects/${projectSlug}/brand-character-formation`;
}

export function site00ProjectBrandCharacterFormationPath(projectSlug: string): string {
  return `/projects/${projectSlug}/brand-character-formation`;
}

export function site00ProjectBrandCharacterDevelopmentPath(projectSlug: string): string {
  return `/projects/${projectSlug}/brand-character-development`;
}

export function site00ProjectBrandCharacterReadinessPath(projectSlug: string): string {
  return `/projects/${projectSlug}/brand-character-readiness`;
}

export function site00ProjectBrandCharacterDeepeningPath(projectSlug: string): string {
  return `/projects/${projectSlug}/brand-character-deepening`;
}

export function site00ProjectBrandCharacterSynthesisPath(projectSlug: string): string {
  return `/projects/${projectSlug}/brand-character-synthesis`;
}

export function site00ProjectBrandCharacterArtifactProofsPath(projectSlug: string): string {
  return `/projects/${projectSlug}/brand-character-artifact-proofs`;
}

export function site00ProjectBrandMarketingExpressionPath(projectSlug: string): string {
  return `/projects/${projectSlug}/marketing-expression`;
}

export function site00ProjectBrandMarketingExpressionExperiment01Path(projectSlug: string): string {
  return `/projects/${projectSlug}/marketing-expression/experiment-01`;
}

export function site00ProjectContentOperationsPath(projectSlug: string): string {
  return `/projects/${projectSlug}/content-operations`;
}

export function site00ProjectContentOperationsPerformancePath(projectSlug: string): string {
  return `/projects/${projectSlug}/content-operations/performance`;
}

export function site00ProjectContentOperationsCampaignBoardPath(projectSlug: string): string {
  return `/projects/${projectSlug}/content-operations/campaign-board`;
}

export function site00ProjectFounderCreativeIngestionPath(projectSlug: string): string {
  return `/projects/${projectSlug}/content-operations/founder-creative-ingest`;
}

export function site00ProjectFilmProductionPath(projectSlug: string): string {
  return `/projects/${projectSlug}/content-operations/film-production`;
}

export function site00ProjectFilmProductionDailiesPath(projectSlug: string): string {
  return `/projects/${projectSlug}/content-operations/film-production/dailies`;
}

export function site00ProjectFilmProductionSceneDeckPath(projectSlug: string): string {
  return `/projects/${projectSlug}/content-operations/film-production/scene-deck`;
}

export function site00ProjectContentOperationsDailyPlanPath(projectSlug: string): string {
  return `/projects/${projectSlug}/content-operations/daily-plan`;
}

export function site00ProjectRealismLabPath(projectSlug: string): string {
  return `/projects/${projectSlug}/realism-lab`;
}

export function site00ProjectRealismLabBriefPath(projectSlug: string): string {
  return `/projects/${projectSlug}/realism-lab/brief`;
}

export function site00ProjectRealismLabProvidersPath(projectSlug: string): string {
  return `/projects/${projectSlug}/realism-lab/providers`;
}

export function site00ProjectRealismLabRunsPath(projectSlug: string): string {
  return `/projects/${projectSlug}/realism-lab/runs`;
}

export function site00ProjectRealismLabReviewPath(projectSlug: string): string {
  return `/projects/${projectSlug}/realism-lab/review`;
}

export function site00ProjectRealismLabContinuityPath(projectSlug: string): string {
  return `/projects/${projectSlug}/realism-lab/continuity`;
}

export function site00ProjectRealismLabDecisionPath(projectSlug: string): string {
  return `/projects/${projectSlug}/realism-lab/decision`;
}

export function site00ProjectCulturalIntelligencePath(projectSlug: string): string {
  return `/projects/${projectSlug}/cultural-intelligence`;
}

export function site00ProjectCulturalIntelligenceSourcesPath(projectSlug: string): string {
  return `/projects/${projectSlug}/cultural-intelligence/sources`;
}

export function site00ProjectCulturalIntelligenceWeeklyForecastPath(projectSlug: string): string {
  return `/projects/${projectSlug}/cultural-intelligence/weekly-forecast`;
}

export function site00ProjectMotionCharacterPath(projectSlug: string): string {
  return `/projects/${projectSlug}/motion-character`;
}

export function site00ProjectEmbodiedCharacterDiscoveryPath(projectSlug: string): string {
  return `/projects/${projectSlug}/embodied-character`;
}

export function site00ProjectFounderCharacterDiscoveryPath(projectSlug: string): string {
  return `/projects/${projectSlug}/character/discovery`;
}

export function site00ProjectCharacterContinuityPath(projectSlug: string): string {
  return `/projects/${projectSlug}/character/continuity`;
}

export function site00ProjectCharacterContinuityReviewPath(projectSlug: string): string {
  return `/projects/${projectSlug}/character/continuity/review`;
}

export function site00ProjectCharacterCastingPath(projectSlug: string): string {
  return `/projects/${projectSlug}/character/casting`;
}

export function site00ProjectExperimentEVisualDevelopmentPath(projectSlug: string): string {
  return `/projects/${projectSlug}/experience-expression/visual-development`;
}

export function site00ProjectExperimentsPath(projectSlug: string): string {
  return `/projects/${projectSlug}/experiments`;
}

export function site00ProjectFounderWorkspaceArchivePath(projectSlug: string): string {
  return `/projects/${projectSlug}/archive`;
}

export function site00ProjectNdxIconSheetPath(projectSlug: string): string {
  return `/projects/${projectSlug}/inspect/icons`;
}

export function site00ProjectNotificationsPath(projectSlug: string): string {
  return `/projects/${projectSlug}/notifications`;
}

export function site00ProjectContentLibraryPath(projectSlug: string): string {
  return `/projects/${projectSlug}/content-library`;
}

export function site00CreateAccountHrefWithReturnTo(returnToPath: string): string {
  const safe = returnToPath.startsWith('/') ? returnToPath : `/${returnToPath}`;
  return `${SITE00_ROUTES.createAccount}?returnTo=${encodeURIComponent(safe.slice(0, 1024))}`;
}

/** Preserve raw returnTo from sign-in (or current location) for create-account navigation. */
export function site00CreateAccountLinkTarget(location: {
  pathname: string;
  search: string;
}): { pathname: string; search?: string } {
  const rawReturnTo = new URLSearchParams(location.search).get('returnTo');
  if (rawReturnTo) {
    return {
      pathname: SITE00_ROUTES.createAccount,
      search: `?returnTo=${encodeURIComponent(rawReturnTo.slice(0, 1024))}`,
    };
  }
  const fromPath = `${location.pathname}${location.search}`.slice(0, 1024);
  if (fromPath.startsWith('/') && fromPath !== SITE00_ROUTES.createAccount) {
    return {
      pathname: SITE00_ROUTES.createAccount,
      search: `?returnTo=${encodeURIComponent(fromPath)}`,
    };
  }
  return { pathname: SITE00_ROUTES.createAccount };
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
