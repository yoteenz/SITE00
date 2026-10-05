# SITE 00 — Independent Tree Review Packet

**For:** a second architectural reviewer (e.g. ChatGPT) who has not seen the repo history.
**Repo truth at:** `eedc9c8` (yoteenz/SITE00 main, 2026-10-05).
**Machine-readable twin:** `SITE00_INDEPENDENT_TREE_REVIEW_PACKET.json`. It has per-node evidence for all 305 material routes and a fill-in response template.

**How to read this packet**
- **Parts A–C are facts and constraints.** They were extracted from code; they are not opinions.
- **Parts D–E are Opus's opinion.** Please form your own view from A–C before reading them.
- **Part F lists the open decisions.**
- Answer `SITE00_TREE_REVIEW_QUESTIONS.md`.

---

# PART A — FACTS

## A1. What SITE 00 is meant to be (product intent)

| System | Purpose |
|---|---|
| **SITE 00** | A commercial digital location that turns graphics into pages, products and worlds; host for its own production and for client projects (SITE 00, JURNL, AIO, FRONTAL SLAYER, future). |
| **IDNTY** | Identity product. Diagnoses where a brand is (00–03) and captures an identity intake; first step for most clients. |
| **BLDR** | Build product. Classifies what is being built (SITE / WORLD / SYSTEMS / EXTENSIONS) and captures a build intake. |
| **EVOLVE** | Evolution product for existing properties (REFINE / INSTALL / TRANSFORM), plus ongoing marketing & content. |
| **STUDIO OS** | Internal production machinery (agents, pipelines, benches, experiments). Never client-facing. |
| **STUDIO WORLD** | Digital office / spatial world / resident system. Production infrastructure, not a client brand. No surface exists yet. |
| **CLIENT APP** | The client's project room for one project: what needs them, where things are, review/approve, talk, files. |
| **PRODUCTION WORKSPACE** | The founder's per-project production environment across seven lenses (HUB … ACTIVITY). |
| **PROJECT SYSTEM** | Registry + membership + review/approval + events that let one project be seen by founder and client from one shared truth, isolated from other projects. |

## A2. How the current tree was discovered

- Routes were parsed from `src/App.tsx`, `src/routes/Site00Routes.tsx` and `src/routes/Site00AdminRoutes.tsx` with the TypeScript compiler. Every path constant was evaluated against `src/site00/config/routes.ts`; none were left unresolved.
- Helper-generated routes, including the `/desktop` legacy aliases, were expanded.
- Implementation status comes from read-only code audits (`evidence/*.json`). Guards listed are **client-side** React guards; server enforcement is separate (Part B).

| Measure | Count |
|---|---:|
| Route elements in router code | 367 |
| Unique URL patterns | 357 |
| Material page routes (ROUTE / CHILD / GRANDCHILD) | 261 |
| Redirects + legacy /desktop aliases | 52 |
| Non-route material surfaces (tabs, lenses, overlays, shell components) | 35 |
| Total tree nodes | 402 |

**Nodes by surface type:** CHILD_ROUTE 114 · GRANDCHILD_ROUTE 109 · STATE 57 · ROUTE 38 · LEGACY_ROUTE 30 · REDIRECT 22 · SYSTEM_SURFACE 10 · INLINE_EXPANSION 9 · OVERLAY 9 · COMPONENT_STATE 4

## A3. Current tree, grouped the way the code organises it

`current_family` describes today's organisation; it is **not** a proposal. Statuses come from the audits; NOT_INDIVIDUALLY_AUDITED means exactly that.

### PUBLIC_ORIGIN — 5 route registrations (PUBLIC 5)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/` | Site00OriginPage | ROUTE | LIVE_COMPLETE | NONE | CONDITIONAL:site00Root |
| `/` | Site00OriginPage | ROUTE | LIVE_COMPLETE | NONE | CONDITIONAL:site00Root |
| `/origin/locations` | Site00LocationsPage | CHILD_ROUTE | LIVE_COMPLETE | NONE |  |
| `/origin` | Site00OriginPage | ROUTE | LIVE_COMPLETE | NONE | DEAD_END |
| `/enter` | Site00EnterPage | ROUTE | LIVE_COMPLETE | NONE |  |

### PUBLIC_INFO — 12 route registrations (PUBLIC 12)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/sites` | SitesPortfolioPage | ROUTE | PLACEHOLDER | NONE |  |
| `/services` | ServicesPage | ROUTE | PARTIAL | NONE |  |
| `/system` | SystemPage | ROUTE | PARTIAL | NONE | DEAD_END |
| `/about` | AboutPage | ROUTE | PARTIAL | NONE |  |
| `/journal` | JournalPage | ROUTE | PLACEHOLDER | NONE | DEAD_END |
| `/support` | SupportPage | ROUTE | PARTIAL | NONE | DEAD_END |
| `/guide` | GuidePage | ROUTE | PLACEHOLDER | DRAFT_GATED | ORPHAN |
| `/sound` | SoundPage | ROUTE | PLACEHOLDER | DRAFT_GATED | ORPHAN |
| `/faq` | FaqPage | ROUTE | PLACEHOLDER | DRAFT_GATED | ORPHAN |
| `/contact` | ContactPage | ROUTE | PLACEHOLDER | DRAFT_GATED | ORPHAN |
| `/blueprints` | BlueprintsPage | ROUTE | PLACEHOLDER | DRAFT_GATED | ORPHAN |
| `/brand` | BrandPage | ROUTE | PLACEHOLDER | DRAFT_GATED | ORPHAN |

### IDNTY — 6 route registrations (PUBLIC 6)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/identity/*` | Site00IdentityAliasRedirect | REDIRECT | REDIRECT_ONLY | NONE |  |
| `/identity` | → /idnty | REDIRECT | REDIRECT_ONLY | NONE |  |
| `/idnty` | Site00IdntyPage | ROUTE | LIVE_COMPLETE | NONE |  |
| `/idnty/state` | Site00IdntyStatePage | CHILD_ROUTE | LIVE_COMPLETE | NONE |  |
| `/idnty/sign-in-security` | IdntySignInSecurityPage | CHILD_ROUTE | PARTIAL | NONE |  |
| `/idnty/:stateSlug/*` | IdntyAssessmentRouterPage | CHILD_ROUTE | PARTIAL | NONE |  |

### BLDR — 5 route registrations (PUBLIC 5)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/bldr` | Site00BldrPage | ROUTE | LIVE_COMPLETE | NONE |  |
| `/bldr/state` | Site00BldrStatePage | CHILD_ROUTE | PARTIAL | NONE |  |
| `/bldr/templates` | BldrTemplatesPage | CHILD_ROUTE | PLACEHOLDER | NONE | DEAD_END, ORPHAN |
| `/bldr/start` | BldrStartPage | CHILD_ROUTE | PARTIAL | NONE |  |
| `/bldr/:classSlug/*` | BldrAssessmentRouterPage | CHILD_ROUTE | PARTIAL | NONE |  |

### EVOLVE — 14 route registrations (PUBLIC 14)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/evolve` | Site00EvolvePage | ROUTE | LIVE_COMPLETE | NONE |  |
| `/evolve/state` | Site00EvolveStatePage | CHILD_ROUTE | LIVE_COMPLETE | NONE |  |
| `/evolve/campaign-flavor` | EvolveCampaignFlavorPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/evolve/campaign-director` | EvolveCampaignDirectorPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/evolve/marketing` | MarketingLandingPage | CHILD_ROUTE | PARTIAL | NONE |  |
| `/evolve/marketing/services` | MarketingServicesPage | GRANDCHILD_ROUTE | PARTIAL | NONE |  |
| `/evolve/plans` | EvolvePricingPage | CHILD_ROUTE | PARTIAL | NONE | ORPHAN |
| `/existing-location` | ExistingLocationEntryPage | ROUTE | PARTIAL | NONE | DIRECT_ACCESS_ONLY, ORPHAN |
| `/existing-location/start` | ExistingLocationEntryPage | CHILD_ROUTE | PARTIAL | NONE | ORPHAN |
| `/existing-location/case/:caseId/*` | ExistingLocationCasePage | GRANDCHILD_ROUTE | PARTIAL | NONE | ORPHAN |
| `/evolve/marketing/intake/:serviceId` | MarketingIntakePage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/evolve/marketing/brief/:engagementId` | MarketingBriefPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/evolve/marketing/engagement/:engagementId` | MarketingEngagementPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/evolve/:pathSlug/*` | EvolveAssessmentRouterPage | CHILD_ROUTE | PARTIAL | NONE |  |

### AUTH — 7 route registrations (PUBLIC 7)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/sign-in` | Site00SignInAliasRedirect | REDIRECT | REDIRECT_ONLY | NONE |  |
| `/origin/sign-in` | Site00SignInPage | CHILD_ROUTE | PARTIAL | NONE |  |
| `/origin/create-account` | Site00CreateAccountPage | CHILD_ROUTE | PARTIAL | NONE |  |
| `/register` | → /origin/create-account | REDIRECT | REDIRECT_ONLY | NONE |  |
| `/create-account` | → /origin/create-account | REDIRECT | REDIRECT_ONLY | NONE |  |
| `/origin/forgot-password` | Site00ForgotPasswordPage | CHILD_ROUTE | PARTIAL | DRAFT_GATED | ORPHAN |
| `/origin/reset-password` | Site00ResetPasswordPage | CHILD_ROUTE | PARTIAL | DRAFT_GATED | ORPHAN |

### ACCOUNT_INTAKE — 7 route registrations (CLIENT 7)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/account` | AccountPage | ROUTE | PLACEHOLDER | SIGNED_IN, DRAFT_GATED | ORPHAN |
| `/account/intakes` | AccountIntakesPage | CHILD_ROUTE | LIVE_COMPLETE | SIGNED_IN |  |
| `/account/intakes/:intakeType/:intakeId` | AccountIntakeDetailPage | GRANDCHILD_ROUTE | LIVE_COMPLETE | SIGNED_IN |  |
| `/intake/:token` | WorldIntakeGuestPage | CHILD_ROUTE | LIVE_COMPLETE | NONE | DIRECT_ACCESS_ONLY |
| `/intake/access/:token` | IntakeGuestAccessPage | GRANDCHILD_ROUTE | LIVE_COMPLETE | NONE | DIRECT_ACCESS_ONLY |
| `/project/:projectSlug/provisioning` | ProjectProvisioningPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN | ORPHAN |
| `/access/:credentialId` | AccessCredentialPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE | DIRECT_ACCESS_ONLY |

### CTRL_ROOM — 8 route registrations (CLIENT 8)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/control` | ControlOverviewPage | ROUTE | PARTIAL | SIGNED_IN |  |
| `/control/evolve-operations` | EvolveOperationsPage | CHILD_ROUTE | DATA_ONLY | SIGNED_IN |  |
| `/control/sites` | ControlSitesPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/control/domains` | ControlSectionPage | CHILD_ROUTE | PLACEHOLDER | SIGNED_IN |  |
| `/control/billing` | ControlSectionPage | CHILD_ROUTE | PLACEHOLDER | SIGNED_IN |  |
| `/control/team` | ControlSectionPage | CHILD_ROUTE | PLACEHOLDER | SIGNED_IN | ORPHAN |
| `/control/settings` | ControlSectionPage | CHILD_ROUTE | PLACEHOLDER | SIGNED_IN |  |
| `/control/security` | ControlSectionPage | CHILD_ROUTE | PLACEHOLDER | SIGNED_IN |  |

### CLIENT_APP — 39 route registrations (CLIENT 39)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/app` | AppSplashPage | ROUTE | WORKING_END_TO_END | NONE | ORPHAN |
| `/app/projects` | AppProjectSelectPage | CHILD_ROUTE | PARTIAL | SIGNED_IN | ORPHAN |
| `/app/projects/:projectSlug/*` | AppProjectLayout | ROUTE | PARTIAL | SIGNED_IN |  |
| `/app/projects/:projectSlug/*` | AppHomePage | ROUTE | PARTIAL | SIGNED_IN |  |
| `/app/projects/:projectSlug/projects` | AppProjectsTabPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/app/projects/:projectSlug/profile` | AppProfilePage | CHILD_ROUTE | VISUAL_ONLY | SIGNED_IN |  |
| `/app/projects/:projectSlug/project/:section` | AppProjectHubPage | GRANDCHILD_ROUTE | DATA_ONLY | SIGNED_IN |  |
| `/app/projects/:projectSlug/reviews` | AppReviewsQueuePage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/app/projects/:projectSlug/reviews/:reviewId` | AppReviewDetailPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/app/projects/:projectSlug/reviews/:reviewId/compare` | AppReviewDetailPage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/app/projects/:projectSlug/reviews/:reviewId/comments` | AppReviewDetailPage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/app/projects/:projectSlug/reviews/:reviewId/annotations` | AppReviewDetailPage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/app/projects/:projectSlug/reviews/:reviewId/approve` | AppReviewDetailPage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/app/projects/:projectSlug/reviews/:reviewId/revision` | AppReviewDetailPage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/app/projects/:projectSlug/reviews/:reviewId/history` | AppReviewDetailPage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/app/projects/:projectSlug/inbox` | AppInboxPage | CHILD_ROUTE | VISUAL_ONLY | SIGNED_IN |  |
| `/app/projects/:projectSlug/inbox/:threadId` | AppInboxThreadPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/app/projects/:projectSlug/library` | AppLibraryPage | CHILD_ROUTE | PLACEHOLDER | SIGNED_IN |  |
| `/app/projects/:projectSlug/library/:categoryId` | AppLibraryCategoryPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/app/projects/:projectSlug/library/:categoryId/:fileId` | AppFileViewerPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/app/preview/select` | AppPreviewSelectPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE | ORPHAN |
| `/app/preview/:projectSlug/*` | AppPreviewLayout | ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/*` | AppHomePage | ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/projects` | AppProjectsTabPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/profile` | AppProfilePage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/project/:section` | AppProjectHubPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/reviews` | AppReviewsQueuePage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/reviews/:reviewId` | AppReviewDetailPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/reviews/:reviewId/compare` | AppReviewDetailPage | STATE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/reviews/:reviewId/comments` | AppReviewDetailPage | STATE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/reviews/:reviewId/annotations` | AppReviewDetailPage | STATE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/reviews/:reviewId/approve` | AppReviewDetailPage | STATE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/reviews/:reviewId/revision` | AppReviewDetailPage | STATE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/reviews/:reviewId/history` | AppReviewDetailPage | STATE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/inbox` | AppInboxPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/inbox/:threadId` | AppInboxThreadPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/library` | AppLibraryPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/library/:categoryId` | AppLibraryCategoryPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE |  |
| `/app/preview/:projectSlug/library/:categoryId/:fileId` | AppFileViewerPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE |  |

### CLIENT_PROJECT_ROOM — 6 route registrations (CLIENT 6)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/client/projects/:projectSlug` | ClientProjectRoomOverviewPage | ROUTE | PARTIAL | SIGNED_IN | DIRECT_ACCESS_ONLY |
| `/client/projects/:projectSlug/reviews` | ClientProjectRoomReviewsPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/client/projects/:projectSlug/reviews/:reviewId` | ClientReviewDetailPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/client/projects/:projectSlug/library` | ClientProjectRoomLibraryPage | CHILD_ROUTE | PLACEHOLDER | SIGNED_IN |  |
| `/client/projects/:projectSlug/activity` | ClientProjectRoomActivityPage | CHILD_ROUTE | PLACEHOLDER | SIGNED_IN |  |
| `/client/projects/:projectSlug/messages` | ClientProjectRoomMessagesPage | CHILD_ROUTE | PLACEHOLDER | SIGNED_IN |  |

### STUDIO_CLIENT — 11 route registrations (CLIENT 11)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/studio/:projectSlug/preview-guest` | StudioPreviewGuestLandingPage | CHILD_ROUTE | WORKING_END_TO_END | SIGNED_IN |  |
| `/studio/:projectSlug` | StudioDashboardPage | ROUTE | PARTIAL | SIGNED_IN | DIRECT_ACCESS_ONLY |
| `/studio/:projectSlug/input` | StudioWorkspaceRouterPage | STATE | PARTIAL | SIGNED_IN |  |
| `/studio/:projectSlug/operations` | StudioWorkspaceRouterPage | STATE | PARTIAL | SIGNED_IN |  |
| `/studio/:projectSlug/blueprint` | StudioWorkspaceRouterPage | STATE | PARTIAL | SIGNED_IN |  |
| `/studio/:projectSlug/assets` | StudioWorkspaceRouterPage | STATE | PARTIAL | SIGNED_IN |  |
| `/studio/:projectSlug/reviews` | StudioWorkspaceRouterPage | STATE | PARTIAL | SIGNED_IN |  |
| `/studio/:projectSlug/reviews/:reviewId` | StudioReviewDetailPage | GRANDCHILD_ROUTE | VISUAL_ONLY | SIGNED_IN |  |
| `/studio/:projectSlug/milestones` | StudioWorkspaceRouterPage | STATE | PARTIAL | SIGNED_IN |  |
| `/studio/:projectSlug/activity` | StudioWorkspaceRouterPage | STATE | PARTIAL | SIGNED_IN |  |
| `/studio/:projectSlug/experience-compiler` | ExperienceCompilerWorkspacePage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |

### PROJECTS_STUDIO_OS — 16 route registrations (INTERNAL 16)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/projects` | ProjectsPage | ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug` | ProjectDetailPage | ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN | DIRECT_ACCESS_ONLY |
| `/projects/:projectSlug/overview` | ProjectOperatingModulePage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/builder` | ProjectOperatingModulePage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/production` | ProjectOperatingModulePage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/reviews` | ProjectOperatingModulePage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/library` | ProjectOperatingModulePage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/more` | ProjectOperatingModulePage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/origin` | ProjectOriginPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/identity` | ProjectOperatingModulePage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/identity/explore` | ProjectIdentityPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/setup` | ProjectSetupPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/evolve/plans` | ProjectEvolvePage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/evolve/:evolveTab` | ProjectOperatingModulePage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/evolve` | ProjectEvolveTabRedirectPage | REDIRECT | REDIRECT_ONLY | SIGNED_IN |  |
| `/projects/:projectSlug/notifications` | ProjectNotificationsPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |

### PRODUCTION_WORKSPACE — 18 route registrations (INTERNAL 18)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/production/site00/design` | Site00DesignHostRouteGate | GRANDCHILD_ROUTE | DATA_ONLY | ADMIN_SIGNED_IN, ROUTE_GATE component |  |
| `/production` | ProductionWorkspaceHubPage | ROUTE | WORKING_END_TO_END | ADMIN_SIGNED_IN |  |
| `/production/libraries` | ProductionLibrariesPage | CHILD_ROUTE | VISUAL_ONLY | ADMIN_SIGNED_IN |  |
| `/production/activity` | ProductionActivityPage | CHILD_ROUTE | PARTIAL | ADMIN_SIGNED_IN |  |
| `/production/queue` | ProductionQueuePage | CHILD_ROUTE | PARTIAL | ADMIN_SIGNED_IN |  |
| `/production/:projectSlug/runtime/*` | ProjectRuntimeRoute | CHILD_ROUTE | PARTIAL | ADMIN_SIGNED_IN |  |
| `/production/:projectSlug` | ProductionWorkspaceProjectLayout | ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN_SIGNED_IN |  |
| `/production/:projectSlug/design/*` | DesignProductionRouteGate | CHILD_ROUTE | VISUAL_ONLY | ADMIN_SIGNED_IN, ROUTE_GATE component |  |
| `/production/:projectSlug/design/*` | (index/null element) | STATE | VISUAL_ONLY | ADMIN_SIGNED_IN |  |
| `/production/:projectSlug/design/workspace` | (index/null element) | STATE | PARTIAL | ADMIN_SIGNED_IN |  |
| `/production/:projectSlug/design/references` | DesignProductionSectionReferences | GRANDCHILD_ROUTE | PARTIAL | ADMIN_SIGNED_IN |  |
| `/production/:projectSlug/design/assets` | DesignProductionSectionAssets | GRANDCHILD_ROUTE | PARTIAL | ADMIN_SIGNED_IN |  |
| `/production/:projectSlug/design/pages` | DesignProductionSectionPages | GRANDCHILD_ROUTE | PARTIAL | ADMIN_SIGNED_IN |  |
| `/production/:projectSlug/design/skins` | DesignProductionSectionSkins | GRANDCHILD_ROUTE | PARTIAL | ADMIN_SIGNED_IN |  |
| `/production/:projectSlug/design/history` | DesignProductionSectionHistory | GRANDCHILD_ROUTE | PARTIAL | ADMIN_SIGNED_IN |  |
| `/production/:projectSlug/design/more` | DesignProductionSectionMore | GRANDCHILD_ROUTE | PARTIAL | ADMIN_SIGNED_IN |  |
| `/production/:projectSlug/experience/*` | ExperienceProductionShellPage | CHILD_ROUTE | VISUAL_ONLY | ADMIN_SIGNED_IN |  |
| `/production/:projectSlug/expression/*` | ExpressionProductionShellPage | CHILD_ROUTE | PARTIAL | ADMIN_SIGNED_IN |  |

### LEGACY_FOUNDER_WORKSPACE — 31 route registrations (INTERNAL 31)

<details><summary>Show routes</summary>

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/projects/:projectSlug/creative-direction` | ProjectCreativeDirectionPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/campaign-flavor` | ProjectCampaignFlavorPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/campaign-director` | ProjectCampaignDirectorPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/product-assets` | ProjectProductAssetFactoryPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations` | ProjectContentOperationsPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations/performance` | ProjectContentOperationsPerformancePage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations/campaign-board/entry/:entryNumber/preview` | ProjectCampaignBoardEntryPreviewPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations/campaign-board/entry/:entryNumber/format/:formatFamily` | ProjectCampaignBoardEntryFormatPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations/campaign-board/entry/:entryNumber/deliverable/:deliverableId` | ProjectCampaignBoardEntryDeliverablePage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations/campaign-board/entry/:entryNumber/carousel` | ProjectCampaignBoardEntryCarouselPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations/campaign-board/entry/:entryNumber/story` | ProjectCampaignBoardEntryStoryPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations/campaign-board/entry/:entryNumber` | ProjectCampaignBoardEntryPackagePage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations/campaign-board` | ProjectContentOperationsCampaignBoardPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations/expression-engine` | ProjectExpressionEngineCampaignPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations/founder-creative-ingest` | ProjectFounderCreativeIngestionPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations/film-production` | ProjectFilmProductionPage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations/film-production/dailies` | ProjectFilmProductionPage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations/film-production/scene-deck` | ProjectFilmProductionPage | STATE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/content-operations/daily-plan` | ProjectContentOperationsDailyPlanPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/cultural-intelligence` | ProjectCulturalIntelligencePage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/cultural-intelligence/sources` | ProjectCulturalIntelligenceSourcesPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/cultural-intelligence/weekly-forecast` | ProjectCulturalIntelligenceWeeklyForecastPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/motion-character` | ProjectMotionCharacterPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/embodied-character` | ProjectEmbodiedCharacterDiscoveryPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/character/discovery` | ProjectFounderCharacterDiscoveryPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/character/casting` | ProjectCharacterCastingPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/character/continuity/review` | ProjectCharacterContinuityPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/character/continuity` | ProjectCharacterContinuityPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/experience-expression` | ProjectExperimentEPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/experience-expression/visual-development` | ProjectWorkspaceVisualDevelopmentPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/content-library` | ProjectContentLibraryPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |

</details>

### EXPERIMENT_LAB — 31 route registrations (INTERNAL 31)

<details><summary>Show routes</summary>

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/projects/:projectSlug/lab` | ProjectLabHubPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/experiments` | ProjectExperimentsHubPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/archive` | ProjectFounderWorkspaceArchivePage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/inspect/icons` | ProjectNdxIconSheetPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/calibrate` | ProjectLoreCalibrationPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/creative-appetite` | ProjectCreativeAppetitePage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/personality-replay` | ProjectPersonalityReplayPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/personality-replay/consistency` | ProjectSixDirectionConsistencyPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/canonical-creative-range` | ProjectCanonicalCreativeRangePage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/canonical-carousel-expansion` | ProjectCanonicalCarouselExpansionPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/experiment-d-concept-territory` | ProjectExperimentDPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/experiment-f-six-concept-reformation` | ProjectExperimentFPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/experiment-g-brand-presentation-concepts/directions` | ProjectExperimentGDirectionsPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/experiment-g-brand-presentation-concepts/finalists` | ProjectExperimentGFinalistsPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/brand-character-formation` | ProjectExperimentHPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/brand-character-development` | ProjectExperimentHDevelopmentPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/brand-character-readiness` | ProjectBrandCharacterReadinessPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/brand-character-deepening` | ProjectBrandCharacterDeepeningPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/brand-character-synthesis` | ProjectBrandCharacterSynthesisPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/brand-character-artifact-proofs` | ProjectBrandCharacterArtifactProofsPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/marketing-expression` | ProjectBrandMarketingExpressionPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/projects/:projectSlug/marketing-expression/experiment-01` | ProjectBrandMarketingExpressionExperiment01Page | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/realism-lab/brief` | ProjectRealismLabPage | STATE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/realism-lab/providers` | ProjectRealismLabPage | STATE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/realism-lab/runs` | ProjectRealismLabPage | STATE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/realism-lab/review` | ProjectRealismLabPage | STATE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/realism-lab/continuity` | ProjectRealismLabPage | STATE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/realism-lab/decision` | ProjectRealismLabPage | STATE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/realism-lab` | ProjectRealismLabPage | STATE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/experiment-g-brand-presentation-concepts` | ProjectExperimentGPage | CHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/personality-replay/:stepId` | ProjectPersonalityReplayPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |

</details>

### DESIGN_BENCH — 25 route registrations (INTERNAL 25)

<details><summary>Show routes</summary>

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/system/design/workspace-concepts` | SystemDesignWorkspaceConceptsPage | GRANDCHILD_ROUTE | PARTIAL | NONE | ORPHAN, UNGUARDED_INTERNAL |
| `/projects/:projectSlug/debug/world/*` | ProjectAstralWorldFastTrackPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ASTRAL_WORLD_GUARD |  |
| `/projects/:projectSlug/debug/reconstruction/:pageScope/:sessionId` | ReconstructionTwinPreviewPage | GRANDCHILD_ROUTE | PARTIAL | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/debug/twin-v2/:sessionId` | ConceptDirectedTwinV2PreviewPage | GRANDCHILD_ROUTE | PARTIAL | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/reconstruction-lab` | DesignReconstructionLabPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/site00/master-skin-preview` | MasterSkinExperiencePreviewPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | SIGNED_IN |  |
| `/studio-world/design` | StudioWorldDesignLegacyRedirectPage | REDIRECT | REDIRECT_ONLY | SIGNED_IN |  |
| `/projects/:projectSlug/design/twin` | DesignTwinImplementationPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/design/twin-v4` | DesignTwinV4ProofPage | GRANDCHILD_ROUTE | PARTIAL | SIGNED_IN |  |
| `/projects/:projectSlug/design/twin-sol-direct` | NdxbookSolDirectPage | GRANDCHILD_ROUTE | PARTIAL | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/twin-testB` | SolDesignBenchmarkPage | GRANDCHILD_ROUTE | PARTIAL | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/twin-testA` | DesignTwinTestAPage | GRANDCHILD_ROUTE | PARTIAL | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/twin-grok-direct` | DesignTwinGrokDirectPage | GRANDCHILD_ROUTE | PARTIAL | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/opus-native` | DesignOpusNativePage | GRANDCHILD_ROUTE | PARTIAL | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/twin-opus-direct` | DesignTwinOpusDirectRouteGate | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/twin-opus-direct` | (index/null element) | STATE | NOT_INDIVIDUALLY_AUDITED | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/twin-opus-direct/references` | DesignProductionSectionReferences | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/twin-opus-direct/assets` | DesignProductionSectionAssets | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/twin-opus-direct/pages` | DesignProductionSectionPages | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/twin-opus-direct/skins` | DesignProductionSectionSkins | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/twin-opus-direct/history` | DesignProductionSectionHistory | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/twin-opus-direct/more` | DesignProductionSectionMore | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/twin-fable-direct` | DesignTwinFableDirectPage | GRANDCHILD_ROUTE | PARTIAL | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/twin-spark-direct` | DesignTwinSparkDirectPage | GRANDCHILD_ROUTE | PARTIAL | NONE | UNGUARDED_INTERNAL |
| `/projects/:projectSlug/design/twin-spark-responsive` | DesignTwinSparkResponsivePage | GRANDCHILD_ROUTE | PARTIAL | NONE | UNGUARDED_INTERNAL |

</details>

### PROJECT_RUNTIME_WORLD — 2 route registrations (INTERNAL 2)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/projects/:projectSlug/experience/*` | ProjectExperienceModuleGate | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ASTRAL_WORLD_GUARD |  |
| `/projects/:projectSlug/reader/*` | ProjectAstralWorldReaderPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ASTRAL_WORLD_GUARD |  |

### ADMIN_00_CONTROL — 61 route registrations (INTERNAL 61)

<details><summary>Show routes</summary>

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/admin` | (index/null element) | ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin` | → /admin/site00 | REDIRECT | REDIRECT_ONLY | ADMIN |  |
| `/admin/site00` | Site00AdminDashboardPage | ROUTE | WORKING_END_TO_END | ADMIN |  |
| `/admin/site00/studio` | Site00AdminStudioPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/studio/queue` | Site00AdminStudioPage | STATE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/approvals` | Site00AdminApprovalsPage | CHILD_ROUTE | PARTIAL | ADMIN |  |
| `/admin/site00/projects` | Site00AdminProjectsPage | CHILD_ROUTE | WORKING_END_TO_END | ADMIN |  |
| `/admin/site00/projects/:projectId` | Site00AdminProjectWorkspacePage | STATE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/projects/:projectId/:section` | Site00AdminProjectWorkspacePage | STATE | WORKING_END_TO_END | ADMIN |  |
| `/admin/site00/identities` | IdentitiesPage | CHILD_ROUTE | WORKING_END_TO_END | ADMIN |  |
| `/admin/site00/identities/:id` | IdentityDetailPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/bldr-intakes` | BldrIntakesPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/bldr-intakes/:id` | BldrIntakeDetailPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/intakes` | IntakesPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/client-intakes` | ClientIntakesPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/intakes/:intakeType/:intakeId` | IntakeDetailPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/leads` | LeadsPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/leads/:id` | LeadDetailPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/discovery` | DiscoveryPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/discovery/:id` | DiscoveryDetailPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/sites` | SitesPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/sites/:id` | SiteDetailPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/ctrl-room` | CtrlRoomPage | CHILD_ROUTE | PARTIAL | ADMIN |  |
| `/admin/site00/finance` | FinancePage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/finance/invoices/:id` | InvoiceDetailPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/team` | TeamPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/reports` | ReportsPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/reports/pipeline` | ReportsPipelinePage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/activity` | ActivityPage | CHILD_ROUTE | WORKING_END_TO_END | ADMIN |  |
| `/admin/site00/access-credentials` | AccessCredentialsPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/access-credentials/:id` | AccessCredentialDetailPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/debug/email-pack` | EmailPackGalleryPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/debug/email-pack/:templateId` | EmailTemplateDetailPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/debug/evolve-marketing` | EvolveMarketingDebugPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/evolve` | EvolveOverviewPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/evolve/connections` | EvolveConnectionsPortfolioPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/evolve/approvals` | EvolveApprovalsInboxPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/orchestration/:orgSlug/evolve/connections` | EvolveOrgConnectionsPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/orchestration/:orgSlug/evolve/pilot` | EvolvePilotControlPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/orchestration/:orgSlug/evolve/creative-direction` | EvolveCreativeDirectionPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/debug/evolve-creative-direction` | EvolveCreativeDirectionDebugPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/debug/capture-auth` | CaptureAuthBootstrapPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/orchestration/:orgSlug/evolve/pipeline-replay-validation/:replayId?` | NdxbookPipelineReplayValidationPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/orchestration/:orgSlug/evolve/campaigns` | EvolveCampaignsPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/orchestration/:orgSlug/evolve/campaigns/:campaignId` | EvolveCampaignDetailPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/orchestration/:orgSlug/evolve/calendar` | EvolveCalendarPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/orchestration/:orgSlug/evolve/calendar/:itemId` | EvolveContentDetailPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/orchestration/:orgSlug/evolve/emails` | EvolveEmailOpsPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/orchestration/:orgSlug/evolve/social` | EvolveSocialOpsPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/orchestration/:orgSlug/evolve/production/new` | EvolveProductionBriefPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/orchestration/:orgSlug/evolve/plans` | EvolvePlansPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/orchestration/:orgSlug/evolve` | EvolveOrgPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/debug/evolve` | EvolveDebugPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/reconciliation` | ReconciliationInboxPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/orchestration/:orgSlug` | OrchestrationProjectPage | ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/debug/orchestration` | OrchestrationDebugPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/marketing-engagements` | MarketingEngagementsAdminPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/marketing-engagements/:engagementId` | MarketingEngagementAdminDetailPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/settings` | SettingsPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/settings/studio/automation` | SettingsPage | STATE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/admin/site00/*` | → /admin/site00 | REDIRECT | REDIRECT_ONLY | ADMIN |  |

</details>

### ASSET_VAULT — 10 route registrations (INTERNAL 10)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/assts` | (index/null element) | ROUTE | LIVE_COMPLETE | ADMIN |  |
| `/assts` | AsstsLibraryPage | ROUTE | LIVE_COMPLETE | ADMIN |  |
| `/assts/composition-studio` | AsstsCompositionStudioPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/assts/batches` | AsstsBatchesListPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/assts/batches/:batchId` | AsstsBatchPage | GRANDCHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/assts/loader-pipeline` | AsstsLoaderPipelinePage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/assts/search` | AsstsSearchPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/assts/notifications` | AsstsNotificationsPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/assts/profile` | AsstsProfilePage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |
| `/assts/:assetId` | AsstsInspectionPage | CHILD_ROUTE | NOT_INDIVIDUALLY_AUDITED | ADMIN |  |

### DEV_DEBUG — 13 route registrations (INTERNAL 13)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/debug/email-pack` | EmailPackRedirect | REDIRECT | REDIRECT_ONLY | NONE | UNGUARDED_INTERNAL |
| `/debug/email-pack/:templateId` | EmailPackRedirect | REDIRECT | REDIRECT_ONLY | NONE | UNGUARDED_INTERNAL |
| `/control/debug/email-pack` | EmailPackRedirect | REDIRECT | REDIRECT_ONLY | NONE | UNGUARDED_INTERNAL |
| `/control/debug/email-pack/:templateId` | EmailPackRedirect | REDIRECT | REDIRECT_ONLY | NONE | UNGUARDED_INTERNAL |
| `/control/debug/capture-auth` | CaptureAuthRedirect | REDIRECT | REDIRECT_ONLY | NONE | UNGUARDED_INTERNAL |
| `/debug/capture-auth` | CaptureAuthRedirect | REDIRECT | REDIRECT_ONLY | NONE | UNGUARDED_INTERNAL |
| `/loader-preview` | LoaderPreviewPage | SYSTEM_SURFACE | DEV_SURFACE | NONE | ORPHAN, UNGUARDED_INTERNAL |
| `/jurnl/f01/parent-assembly` | JurnlF01ParentAssemblyPage | SYSTEM_SURFACE | DEV_SURFACE | NONE | ORPHAN, UNGUARDED_INTERNAL |
| `/__dev/hero-outlier-measure` | HeroOutlierMeasureHarnessPage | SYSTEM_SURFACE | DEV_SURFACE | NONE | CONDITIONAL:HeroOutlierMeasureHarnessPage, UNGUARDED_INTERNAL |
| `/__dev/live-character-runtime` | LiveCharacterRuntimePrototypePage | SYSTEM_SURFACE | DEV_SURFACE | NONE | CONDITIONAL:LiveCharacterRuntimePrototypePage, UNGUARDED_INTERNAL |
| `/validation/ndxbook/replay/:replayId/personality/:stepId` | PersonalityReplayIntakeRouterPage | SYSTEM_SURFACE | DEV_SURFACE | SIGNED_IN |  |
| `/validation/ndxbook/replay/:replayId/personality/review` | PersonalityReplayIntakeRouterPage | SYSTEM_SURFACE | DEV_SURFACE | SIGNED_IN |  |
| `/access/debug` | AccessCredentialDebugPage | SYSTEM_SURFACE | DEV_SURFACE | NONE | ORPHAN, UNGUARDED_INTERNAL |

### LEGACY_DESKTOP_ALIAS — 30 route registrations (PUBLIC (redirect) 30)

<details><summary>Show routes</summary>

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/origin/desktop` | Site00OriginDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/idnty/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/idnty/state/desktop` | Site00WorkflowDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/bldr/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/bldr/state/desktop` | Site00WorkflowDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/evolve/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/evolve/state/desktop` | Site00WorkflowDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/sites/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/services/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/system/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/about/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/journal/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/support/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/guide/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/sound/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/faq/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/contact/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/blueprints/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/account/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/brand/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/idnty/sign-in-security/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/bldr/templates/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/idnty/:stateSlug/desktop/*` | Site00WorkflowDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/projects/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/bldr/start/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/bldr/:classSlug/desktop/*` | Site00WorkflowDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/evolve/plans/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/existing-location/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/existing-location/start/desktop` | Site00PublicDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |
| `/evolve/:pathSlug/desktop/*` | Site00WorkflowDesktopLegacyRedirect | LEGACY_ROUTE | REDIRECT_ONLY | NONE |  |

</details>

### LEGACY_REDIRECT — 7 route registrations (PUBLIC (redirect) 7)

| Route | Surface | Type | Status | Auth (client-side) | Flags |
|---|---|---|---|---|---|
| `/*` | → / | REDIRECT | REDIRECT_ONLY | NONE |  |
| `/projects/design` | ProjectsDesignModuleRedirect | REDIRECT | REDIRECT_ONLY | NONE |  |
| `/projects/design/:projectSlug/*` | ProjectsDesignProjectRedirect | REDIRECT | REDIRECT_ONLY | NONE |  |
| `/projects/:projectSlug/design/*` | DesignLegacyProjectDesignRedirect | REDIRECT | REDIRECT_ONLY | NONE |  |
| `/bluprint/*` | → /origin | REDIRECT | REDIRECT_ONLY | NONE |  |
| `/build/*` | → /origin | REDIRECT | REDIRECT_ONLY | NONE |  |
| `/live/*` | → /origin | REDIRECT | REDIRECT_ONLY | NONE |  |

## A4. Current navigation systems

| Nav system | Rendered? | Items → destinations |
|---|---|---|
| PUBLIC DESKTOP HEADER (Site00AppShell: GlobalNav + EntryToggle) | yes | SITE 00 logo → /origin (Site00LogoBlock.tsx:24); SITES → /sites; SERVICES → /services; SYSTEM → /system; ABOUT → /about; JOURNAL → /journal; ENTER 00 (non-/enter) → /enter; EXIT 00 (on /enter) → /origin |
| PUBLIC TOP NAV (Site00PublicTopNav) | **no (dead code)** | SITES → /sites (signed-in: /control/sites); SERVICES → /services; SYSTEM → /system; ABOUT → /about; JOURNAL → /journal; IDNTY → /idnty; BLDR / START BUILD → /bldr; CTRL ROOM → /control or sign-in?returnTo=/control |
| PUBLIC LEFT RAIL (Site00PublicSidebar) | **no (dead code)** | ORIGIN → /origin; LOCATIONS → /origin/locations; SITES → /sites; SERVICES → /services; SYSTEM → /system; ABOUT → /about; JOURNAL → /journal; IDNTY → /idnty; BLDR / START BUILD → /bldr |
| ENTER 00 DIRECTORY (WAITING ROOM menu) | yes | 01 SITES → /sites; 02 SERVICES → /services; 03 SYSTEM → /system; 04 ABOUT → /about; 05 JOURNAL → /journal; BLDR STUDIO → /bldr; PROJECTS (auth) → /projects; ACCOUNT (auth) → /control; SUPPORT → /support |
| EXIT 00 | yes | EXIT 00 → /origin |
| MOBILE HEADER (Site00MobileHeader) | yes | SITE 00 logo → /origin; FAST TRAVEL trigger → opens FastTravelPanel; EXIT 00 (variant=directory on /origin/locations) → /origin |
| MOBILE BOTTOM NAV (MobileSiteNavigation / MOBILE_SITE_NAV) | yes | ORIGIN → /origin; IDNTY → /idnty/state; LOCATIONS (center) → /origin/locations; PROJECTS (auth) → /projects; CTRL ROOM (auth) → /control |
| FAST TRAVEL panel (context-aware) | yes | MY SPACE: IDNTY → /idnty; MY SPACE: CTRL ROOM → /control (auth); RETURN: LOCATIONS → /origin/locations; RETURN: 00 ORIGIN → /origin; UP NEXT: START A BUILD → contextual BLDR href; UP NEXT: FIND MY BUILD TYPE → /bldr/state; QUICK JUMP: SERVICES/SYSTEM/SITES/JOURNAL/ABOUT → public pages; IDNTY signed-out: SIGN IN / CREATE IDENTITY → /origin/sign-in, /idnty/state; IDNTY/CTRL signed-in: CTRL ROOM, PROJECTS, MY SITES, BILLING, SETTINGS → /control, /projects, /control/sites, /control/billing, /control/settings; BLDR: CONTINUE BUILD / BUILD INVESTMENT GUIDE → current path / /bldr |
| LOCATIONS DIRECTORY | yes | 01 BLDR → contextual /bldr; 02 EVOLVE → contextual /evolve; 03 SITES → /sites; 04 SERVICES → /services; 05 SYSTEM → /system; 06 ABOUT → /about; 07 JOURNAL → /journal; 08 IDNTY → /idnty; 09 CTRL ROOM (auth) → /control; 10 PROJECTS (auth) → /projects; 11 MY SITES (auth) → /control/sites |
| MOBILE MENU DRAWER (SITE00_MOBILE_DIRECTORY_PRIMARY) | **no (dead code)** | SERVICES → /services; SYSTEM → /system; ABOUT → /about; JOURNAL → /journal; IDNTY → /idnty; BLDR / START BUILD → /bldr; EVOLVE → /evolve; CTRL ROOM → /control |
| PUBLIC FOOTER (mobile public shell) | yes | PRIVACY → /brand/privacy (NO ROUTE); TERMS → /brand/terms (NO ROUTE); SUPPORT → /support |
| AUTH FOOTER | yes | PRIVACY → /brand/terms (wrong + NO ROUTE); TERMS → /brand/terms (NO ROUTE); SUPPORT → /brand/contact (NO ROUTE) |
| ORIGIN CARDS / EXPANDED PANELS | yes | 01 IDNTY -> BEGIN IDNTY → /idnty/state; 02 BLDR -> BEGIN BLDR → /bldr/state; EVOLVE -> begin → /evolve/state; EVOLVE ghost → /evolve; NEED GUIDANCE? (status strip) → NONE - button without handler |
| ACCOUNT / OPERATING WORLD TOP NAV (desktop) | yes | SITE 00 logo → /control; CTRL ROOM → /control; PROJECTS → /projects; PRODUCTION (admin) → /production; INTAKES → /account/intakes; SITES → /control/sites; STUDIO → /admin/site00/studio (AdminGuard -> non-admins bounced to /control); APPROVALS → /admin/site00/approvals (AdminGuard); ACCESS → /control/security; BILLING → /control/billing; IDNTY profile → /idnty |
| CTRL ROOM SIDEBAR (CTRL_ROOM_NAV) | **no (dead code)** | OVERVIEW → /control; SITES → /control/sites; DOMAINS → /control/domains; BILLING → /control/billing; TEAM → /control/team; SETTINGS → /control/settings; SECURITY → /control/security |
| ECOSYSTEM MOBILE NAV (ECOSYSTEM_MOBILE_NAV) | **no (dead code)** | CTRL ROOM → /control; PROJECTS → /projects; SITES → /control/sites; IDNTY → /idnty |
| ADMIN CONTROL NAV | yes | COMMAND → /admin/site00; PROJECTS → /admin/site00/projects; PRODUCTION → /admin/site00/studio; REVIEWS → /admin/site00/approvals; CLIENTS → /admin/site00/identities; ASSETS / VAULT → /assts; SYSTEMS → /admin/site00/sites; AUTOMATION → settings/studio/automation; BUSINESS → /admin/site00/finance; REPORTS → /admin/site00/reports; EMAIL / DEBUG → debug/email-pack; MARKETING → marketing-engagements; SETTINGS → /admin/site00/settings |
| ASSET VAULT NAV | yes | LIBRARY → /assts; BATCHES → /assts/batches; SEARCH → /assts/search; NOTIFICATIONS → /assts/notifications; PROFILE → /assts/profile |
| CLIENT APP NAV | yes | HOME → /app/projects/:slug; PROJECTS → …/projects; REVIEWS → …/reviews; INBOX → …/inbox; PROFILE → …/profile |
| CLIENT PROJECT ROOM NAV | yes | OVERVIEW → /client/projects/:slug; REVIEWS → /client/projects/:slug/reviews; LIBRARY → /client/projects/:slug/library; ACTIVITY → /client/projects/:slug/activity; MESSAGES → /client/projects/:slug/messages |

## A5. Current visual authority situation

- 2,111 tracked images, grouped into 41 authority sets: 20 canonical, 5 reference-only, 4 legacy-valid, 4 in-review, 3 superseded, 2 conflicting, 1 older-canonical, 1 partial-evolution and 1 incomplete. See `SITE00_VISUAL_AUTHORITY_REGISTRY.json`.
- **Most founder screen originals are not in the repo.** They survive as proof-image halves under `artifacts/`, as code manifests, or as 242 remote OpenArt URLs.
- **Surfaces with no image authority:** the public info pages (services, about, brand, faq, contact, account, system, guide, sound, sites, journal), auth, the BLDR/EVOLVE hubs and steps, and the client app.

---

# PART B — CURRENT PROBLEMS (facts with evidence)

- **P1.** Four parallel client-facing project surfaces exist (/app, /client/projects, /studio/:slug, /projects/:slug) plus CTRL ROOM; none links to the others consistently; CTRL ROOM links to none. _Evidence: evidence/client_components.json, evidence/journeys.md §4_
- **P2.** The review loop is broken at send (no publish action), auth (client fetch lacks token → 401), and return (workspace never reads client decisions; gates never unlock). _Evidence: SITE00_REVIEW_APPROVAL_MAP.json_
- **P3.** Production HUB/INBOX/LIBRARY/ACTIVITY are not project-scoped (resolve to ndxbook); SITE 00 is excluded from the project switcher; requests/activity live in localStorage. _Evidence: evidence/workspace_notes.md §1_
- **P4.** 53 bench/experiment/debug routes live inside the product namespace (vs 10 production route registrations); 17 have no guard. _Evidence: evidence/workspace_notes.md §5_
- **P5.** Public site: two directories (/enter, /origin/locations) with different items; 9 draft-gated pages redirect to / without ?preview=1; footer legal links point to non-existent routes; BOOK DISCOVERY / CONSULT / NEED GUIDANCE CTAs dead-end; 8 /desktop aliases render blank. The auth footer PRIVACY link also points at /brand/terms (Site00AuthShell.tsx:96). _Evidence: evidence/navigation.json, evidence/journeys.md_
- **P6.** BLDR classes in the public flow are SITE / WORLD / ENTERPRISE / NOT SURE (bldr-classification.ts:32-34) and the admin intake page uses a third set SITE / WORLD / BRAND / SYSTEM (BldrIntakesPage.tsx:10), vs locked SITE / WORLD / SYSTEMS / EXTENSIONS. _Evidence: evidence/journeys.md §2_
- **P7.** Client app nav is HOME / PROJECTS / REVIEWS / INBOX / PROFILE (a test locks it) vs locked HOME / PROJECT / REVIEWS / INBOX / LIBRARY; LIBRARY has no nav entry. _Evidence: evidence/client_app.json header_nav_vs_canon_
- **P8.** No invite flow, no project membership, admin = email allowlist (defaults include frontalslayer.com addresses), ~20 unauthenticated API endpoints, 2 tables writable with the anon key, client-chosen review role (project access is still checked first, so the risk is privilege escalation inside a project the client can already open). _Evidence: SITE00_AUTH_PERMISSION_MAP.json, SITE00_PROJECT_FIREWALL_MAP.json_
- **P9.** ≥7 hard-coded project registries + site00_projects with 4 type vocabularies; slug drift (aio vs all-in-one-enterprises, site00 vs site-00); none of FOUNDER/PERSONAL/CLIENT/INTERNAL_SITE00 types exist. _Evidence: SITE00_PROJECT_REGISTRY_MAP.json_
- **P10.** Founder screen authorities are mostly not in the repo (proof halves, code manifests, remote URLs); public/client app/auth/account surfaces have no image authority. _Evidence: SITE00_VISUAL_AUTHORITY_REGISTRY.json_
- **P11.** CI on main: 73 of the last 100 runs failed; last green 2026-09-28; build/deploy jobs skipped while tests fail. _Evidence: Technical health in master brief_

---

# PART C — LOCKED CONSTRAINTS (do not re-litigate unless you find a structural contradiction)

- **L1.** DIGITAL LOCATION language (not agency language); do not casually rename locked systems
- **L2.** Product ontology: IDNTY (00 STARTING AT ZERO · 01 SOME PIECES EXIST/PARTIAL · 02 READY FOR EVOLUTION · 03 BUILD READY); BLDR (SITE · WORLD · SYSTEMS · EXTENSIONS); EVOLVE (REFINE · INSTALL · TRANSFORM); STUDIO OS = internal machinery; STUDIO WORLD = digital office / spatial world / resident system
- **L3.** WAITING ROOM (directory) and EXIT 00 (return to origin) are named navigation concepts
- **L4.** Client app primary nav: HOME · PROJECT · REVIEWS · INBOX · LIBRARY; header: project name · diamond/project marker · notifications · menu; white/off-white shell; SITE 00 red default; bottom nav; must feel like a project room
- **L5.** Production workspace bottom nav: HUB · INBOX · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · ACTIVITY
- **L6.** Host vs project firewall: SITE 00 host chrome keeps SITE 00 language; project personality only inside; JURNL/AIO/FRONTAL SLAYER never rewrite host chrome; project data/assets/canon never bleed
- **L7.** Client permissions MAY: view, comment, review, approve, download, upload reference, send message, request revision; MAY NOT: generate, mutate canon, propagate, capture internal, apply source change, access provider/admin/internal production/model config/internal costs
- **L8.** CTRL ROOM = client account command center; 00 / CONTROL = internal operator environment (CORE.md)
- **L9.** Martian Mono is HOST typography and can never become CLIENT brand typography

---

# PART D — OPUS PRIMARY RECOMMENDATION (opinion)

**Model:** audience-first. SITE 00 is four surfaces (public location · client app · production workspace · operations) joined by one project truth.
- **Benches and experiments** go to `/lab`.
- **Registry, membership, review, events, notifications, messages, files and pulse** become systems, not pages.

**Families (11):** PUBLIC LOCATION · IDNTY · BLDR · EVOLVE · ACCESS & CTRL ROOM · CLIENT APP (PROJECT ROOM) · PRODUCTION WORKSPACE · 00 / CONTROL (OPERATIONS) · PROJECT RUNTIMES · STUDIO OS LAB · STUDIO WORLD

Read `SITE00_OPUS_TREE_RECOMMENDATION.md` (narrative), `SITE00_OPUS_RECOMMENDED_CANONICAL_PAGE_TREE.json` (72 nodes) and `SITE00_PAGE_TREE_CHANGELOG.json` (51 changes, each with reason, impact, risk and confidence).

# PART E — OPUS ALTERNATIVE (opinion)

**Model:** project-first. `/projects/:slug` is one address for every role, with role lenses; LOCATIONS stays separate; CONTROL folds into `/production/ops`.

Read `SITE00_OPUS_ALTERNATIVE_TREE.json` and `SITE00_TREE_TRADEOFF_MATRIX.md`.

---

# PART F — UNRESOLVED FOUNDER DECISIONS

| ID | Decision | Opus primary | Opus alternative |
|---|---|---|---|
| U1 | Audience-first (/app + /production) vs project-first (/projects/:slug with role lenses) project address | audience-first | project-first |
| U2 | Merge LOCATIONS into WAITING ROOM (MAP state) or keep both places | merge | keep both |
| U3 | Keep 00 / CONTROL separate from PRODUCTION or fold into /production/ops | separate | fold |
| U4 | Project types for AIO and NDXBOOK (CLIENT vs FOUNDER), canonical AIO slug | AIO = CLIENT_PROJECT; NDXBOOK = FOUNDER_PROJECT; slug decision open | — |
| U5 | Retire /projects/:slug STUDIO OS modules and /studio/:slug after parity | yes (role-aware redirects) | — |
| U6 | ABOUT + BRAND → ORIGIN STORY; CONTACT + FAQ → SUPPORT; GUIDE → SYSTEM; SOUND → setting | yes | — |
| U7 | Existing-location flow merges into EVOLVE | yes (MEDIUM) | — |
| U8 | Visual conflicts C1–C11 (nav icon position, host title, host typography split, design page canon, EXPERIENCE world + taxonomy, red token, HUB machine, mobile preset) | see SITE00_DESIGN_LANGUAGE_CANON.json | — |
| U9 | Legacy founder-workspace modules: merge into EXPRESSION or move to LAB (per route) | merge where an EXPRESSION family exists | — |

---

## Response format

Use `response_template` in the JSON. For each **family**, each **page node** and each **changelog entry**, give one of `AGREE_WITH_OPUS`, `PARTIALLY_AGREE`, `DISAGREE` or `ALTERNATIVE_RECOMMENDATION`, plus a note.
