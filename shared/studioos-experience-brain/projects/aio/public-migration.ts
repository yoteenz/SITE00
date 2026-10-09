/**
 * AIO PUBLIC WEBSITE — LIVE / LEGACY AUDIT, RESPONSIVE CREATIVE RECONCILIATION AND MIGRATION READINESS
 * (P0.AIO.PUBLIC-WEBSITE.LIVE-LEGACY-AUDIT-RESPONSIVE-CREATIVE-RECONCILIATION-AND-MIGRATION-READINESS1).
 *
 * The founder approved the cinematic public design (complete-product.ts, Stage B) as the foundation. Before it can replace
 * the current website, three things: (A) audit what the current site actually does, from the deployed site and the source,
 * and decide what is preserved, reused, reconnected, repaired, replaced, removed (only with approval) or deferred; (B) give
 * the desktop and tablet their own compositions while the approved phone stays the benchmark; (C) shorten the long pages
 * without hiding anything that matters.
 *
 * Honesty rules for this record: no production URL could be verified (AIO_PM_LIVE) — the audit is of the current SOURCE and
 * a LOCAL BUILD of it, labelled as such, never as live findings. Historical findings were re-checked against the source
 * (AIO_PM_ISSUES). Nothing here is deployed; no auth, database, business rule, price, migration or IFTA authority changed;
 * Brokerage stays paused; the twelve privacy gaps stay separate Composer work.
 *
 * Measured numbers (QA, page lengths, screenshots) live in public-migration-evidence.ts, generated from the runs.
 */
import { AIO_UO_SECURITY_HANDOFF } from './office-unified-experience.js';
import { AIO_PM_EVIDENCE } from './public-migration-evidence.js';

export const AIO_PM_SPRINT = 'P0.AIO.PUBLIC-WEBSITE.LIVE-LEGACY-AUDIT-RESPONSIVE-CREATIVE-RECONCILIATION-AND-MIGRATION-READINESS1';
export const AIO_PM_DATE = '2026-10-09';
export const AIO_PM_NEXT_GATE = 'FOUNDER REVIEW: AIO PUBLIC WEBSITE — FINAL RESPONSIVE DESIGN AND LEGACY MIGRATION READINESS';
export const AIO_PM_RULE = 'DO NOT REPLACE THE PRODUCTION WEBSITE UNTIL THE FOUNDER APPROVES THE FINAL DESKTOP / TABLET DESIGN AND THE FUNCTIONAL PRESERVATION PLAN.';
/** Where this sprint started. */
export const AIO_PM_BASE = { site00: '03ad00b9', fsbw: '56c661c6' } as const;
export const AIO_PM_LINKS = {
  review: 'https://claude.ai/artifact/BzsjSbyLHoLAxhGZBr27UE',
  office_review: 'https://claude.ai/artifact/DKYZUHjSdiTw1qSC1evdbk',
} as const;

export const AIO_PM_STATUS = {
  live_site: 'NOT VERIFIED — NO PRODUCTION URL COULD BE VERIFIED OR REACHED FROM THIS ENVIRONMENT (SEE AIO_PM_LIVE)',
  audit_basis: 'THE CURRENT SOURCE (fsbw all-in-one-enterprises/) AND A LOCAL BUILD OF IT IN DEMO MODE — NOT PRODUCTION',
  public_design: 'REFINED IN REVIEW — DESKTOP AND TABLET RECOMPOSED, PHONE PRESERVED, LONG PAGES SHORTENED, LIVE CONTENT RECOVERED — CANDIDATES, AWAITING FOUNDER REVIEW; NOT DEPLOYED',
  migration: 'NOT READY — PRODUCTION BLOCKERS RECORDED (AIO_PM_BLOCKERS); REPAIRS ARE COMPOSER TASKS (AIO_PM_COMPOSER_TASKS)',
  live_app: 'NOT CHANGED — nothing deployed; no auth, database, business rule, price, migration or IFTA authority changed',
  brokerage: 'PAUSED — shown paused in the design (pages, intake goal, explorer); the live app still has unpaused paths (issue B, CT-02, CT-19)',
  security: `${AIO_UO_SECURITY_HANDOFF.length} PRIVACY GAPS STILL OPEN — separate Composer work; not resolved here`,
} as const;

/* ═══════════════ the live site — what could and could not be verified ═══════════════ */
export const AIO_PM_LIVE = {
  production_url: null as string | null,
  verified: false,
  attempts: [
    'https://frontalslayer.com/all-in-one — the legacy host path that the source says shows “All In One has moved” (src/pages/debug/LegacyAioMovedNotice.tsx in fsbw root) — CONNECTION DENIED by this environment’s network policy',
    'https://www.frontalslayer.com/all-in-one — DENIED',
    'https://allinoneenterprises.com — DENIED; the name appears only as an example in docs/EXTRACTION_PLAN.md:112, not as a verified domain',
  ],
  domain_record: 'docs/DOMAIN_AND_DNS.md: “NOT_SELECTED — owner must confirm/purchase domain”; docs/PRODUCTION_INFRASTRUCTURE.md: “PUBLIC LAUNCH READY: NO”; index.html sets robots noindex, nofollow',
  preview: 'AGENTS.md: until production, the AIO app runs on a Cloudflare preview tunnel (AIO_CLOUDFLARE_TUNNEL_HOSTNAME, ephemeral otherwise) — no tunnel URL was available in this session',
  screen_recordings: 'NONE INSPECTED — no founder screen recording of the AIO website was attached to this session or found in either repository (the only videos are unrelated Frontal Slayer assets)',
  local_render: 'A production build (vite build) of the current source in demo mode, served locally, every public route rendered at 360, 390, 834, 1440 and 2560 — labelled LOCAL BUILD OF CURRENT SOURCE, NOT PRODUCTION',
  remedy: 'To audit the deployed site: add its host to this environment’s allowed domains (cloud environment settings → Network access) or supply the production URL; the route list, captures and checks rerun unchanged.',
} as const;

/* ═══════════════ 01 + 03 · functional inventory and preservation matrix (one row = one current capability) ═══════════════ */
export type AioPmClass =
  | 'PRESERVE EXACTLY'
  | 'REUSE AND RESTYLE'
  | 'RECONNECT TO NEW DESIGN'
  | 'REPAIR BEFORE MIGRATION'
  | 'REPLACE PRESENTATION ONLY'
  | 'REMOVE ONLY WITH APPROVAL'
  | 'DEFER';
export type AioPmRow = {
  id: string;
  area: 'PUBLIC PAGE' | 'JOURNEY' | 'FORM' | 'ACCOUNT' | 'SYSTEM' | 'CROSS-CUTTING';
  route: string;
  fn: string;
  backend: string;
  destination: string;
  preserve: string;
  restyle: string;
  security: string;
  risk: 'HIGH' | 'MEDIUM' | 'LOW';
  test: string;
  classes: AioPmClass[];
  evidence: string;
};
export const AIO_PM_INVENTORY: AioPmRow[] = [
  { id: 'home', area: 'PUBLIC PAGE', route: '/', fn: 'Homepage: hero, four pathways, six-stage roadmap, connected-value section, final CTA.', backend: 'None. Hero CTA reads Start-Your-Business progress from the demo store.', destination: 'Design HOME (panel 04 hero unchanged; WHAT CAN AIO DO · WHICH ONE ARE YOU · WHY AIO · ROAD READY · NEXT).', preserve: 'The four pathway destinations (homepageMobileContent.ts) and the six roadmap stages and their routes (startBusinessJourneyDef).', restyle: 'Everything visual.', security: 'Anonymous visitors see the seeded demo client’s setup progress (useStartBusinessJourney → client-a).', risk: 'MEDIUM', test: 'Every pathway and stage link resolves; no demo-client data for anonymous visitors.', classes: ['REPLACE PRESENTATION ONLY', 'REPAIR BEFORE MIGRATION'], evidence: 'src/pages/HomePage.tsx; src/journeys/useStartBusinessJourney.ts:127-131' },
  { id: 'services', area: 'PUBLIC PAGE', route: '/services', fn: 'Services hub: seven category links, twelve popular services, disclaimer.', backend: 'None (catalog in code).', destination: 'Design SERVICES: family bar + the whole catalog as one grouped index; cards once narrowed.', preserve: 'Category destinations; the compliance disclaimer.', restyle: 'All; the duplicate popular rows are dropped.', security: '—', risk: 'LOW', test: 'Every catalog service reachable from the index.', classes: ['REPLACE PRESENTATION ONLY'], evidence: 'src/pages/ServicesPage.tsx:18-24,46-56' },
  { id: 'finder', area: 'PUBLIC PAGE', route: '/services/find', fn: 'Need → optional business-profile step → recommended services (recommendServicesFromIntake).', backend: 'None (client-side recommender).', destination: 'Design FIND A SERVICE.', preserve: 'recommendServicesFromIntake including the not-sure business-profile branch (interstate, CDL, power units, new entrant).', restyle: 'All; result labels must be service names, not raw slugs.', security: '—', risk: 'LOW', test: 'Each need returns the live recommendation set.', classes: ['RECONNECT TO NEW DESIGN'], evidence: 'src/pages/ServiceFindPage.tsx:12-32,77-122,136' },
  { id: 'division-hubs', area: 'PUBLIC PAGE', route: '/services/{permitting,business-formation,insurance,dispatching,brokerage}', fn: 'Division hubs: service rows, context rail, mobile ADD TO MY PLAN per service.', backend: 'Service plan → demo store.', destination: 'Design SERVICE FAMILY: explorer (tablet/desktop), six cards + SHOW ALL (phone).', preserve: 'Membership of each division; ADD TO MY PLAN.', restyle: 'All.', security: 'Mobile ADD TO MY PLAN is ungated — paused/held services can be planned.', risk: 'MEDIUM', test: 'Paused and held services cannot be planned or started.', classes: ['REPLACE PRESENTATION ONLY', 'RECONNECT TO NEW DESIGN'], evidence: 'src/pages/ServiceCatalogDetailPage.tsx:60-91; src/components/mobile/service/MobileDivisionServicesView.tsx:50-52' },
  { id: 'service-detail', area: 'PUBLIC PAGE', route: '/services/:serviceSlug', fn: 'Service detail: description, audience, requirements, process, documents, FAQ, related, status, price label, ADD TO MY PLAN, CHECK MY STATUS (→ /login), journey back.', backend: 'Service plan → demo store; price from DEFAULT_SERVICE_PRICING (demo).', destination: 'Design SERVICE PAGE: hero + facts + ON THIS PAGE bar + WHAT AIO PROVIDES / WHO IT IS FOR / WHAT YOU PROVIDE + HOW IT WORKS + AFTER + QUESTIONS + PAIRED + next step.', preserve: 'The per-service words in src/data/services.ts (audience, requirements, process, documents, faq) and the operating-authority process/FAQ (mobileServicePageConfig.ts) — now drawn verbatim; ADD TO MY PLAN; CHECK MY STATUS; the launch CTA label.', restyle: 'All.', security: 'CTA fails open for unmapped slugs (brokerage children, BOC-3, held insurance/factoring, internal fuel tax show GET STARTED); unapproved prices shown; ?from open redirect on the journey back link.', risk: 'HIGH', test: 'CTA state per slug equals the single activation source; no price; ?from=//host rejected.', classes: ['RECONNECT TO NEW DESIGN', 'REPAIR BEFORE MIGRATION'], evidence: 'src/pages/ServiceCatalogDetailPage.tsx:93-238; src/launch/serviceActivationLaunch.ts:290-291; src/journeys/journeyContext.ts:26-29' },
  { id: 'legacy-slugs', area: 'PUBLIC PAGE', route: '/services/{rate-confirmation-management,pod-management,invoice-funding-review,factoring-transition-assistance}', fn: 'Four detail pages that exist in src/data/services.ts but not in the canonical catalog.', backend: 'None.', destination: 'NOT IN THE DESIGN TREE (the tree follows the catalog).', preserve: 'The URLs until the founder decides.', restyle: '—', security: '—', risk: 'LOW', test: 'Each URL either renders or redirects to its family.', classes: ['DEFER'], evidence: 'src/data/services.ts:476,493,562,579' },
  { id: 'ifta-public', area: 'PUBLIC PAGE', route: '/services/ifta-filing', fn: 'The approved IFTA public page (own layout, sample quarter, FAQ search popover).', backend: 'None.', destination: 'Unchanged — the approved authority, shown as approved.', preserve: 'Layout, imagery, typography, components — a separate founder decision is required for any change.', restyle: 'Nothing.', security: 'GET STARTED is ungated while fuel-tax is INTERNAL_ONLY; copy says “automated tracking” against its own guardrail.', risk: 'MEDIUM', test: 'Visual regression against the approved captures.', classes: ['PRESERVE EXACTLY', 'REPAIR BEFORE MIGRATION'], evidence: 'src/ifta/ui/IftaPublicPage.tsx:13-14,27,93; src/ifta/ui/IftaPublicLayout.tsx:114' },
  { id: 'bookkeeping', area: 'JOURNEY', route: '/services/bookkeeping · /assessment · /recommendation', fn: 'Plans with monthly/annual toggle, comparison, Books Rescue, FAQ; 14-answer assessment → sessionStorage; recommendation page.', backend: 'sessionStorage aio_bookkeeping_assessment_v1 / _recommendation_v1.', destination: 'Design BOOKKEEPING (plans without prices, explorer), ASSESSMENT, RECOMMENDATION.', preserve: 'The assessment questions and the recommendation engine; plan names and features.', restyle: 'All.', security: 'Prices $249/$449/$749 (+ annual) shown; no lead captured; #plans anchor dead; titles never restored.', risk: 'MEDIUM', test: 'Assessment → recommendation uses the live engine; no price until approved.', classes: ['RECONNECT TO NEW DESIGN', 'REPAIR BEFORE MIGRATION'], evidence: 'src/pages/BookkeepingPage.tsx; src/pages/bookkeeping/*; src/bookkeeping/bookkeepingPlans.ts:41-106' },
  { id: 'factoring', area: 'PUBLIC PAGE', route: '/services/factoring', fn: 'Static page; CHECK ELIGIBILITY / OPEN FACTORING PORTAL → /portal/factoring.', backend: 'None.', destination: 'Design FACTORING (partner referral).', preserve: 'Partner-referral disclosures.', restyle: 'All; “Platform in development · debug preview” copy goes.', security: 'Ungated while factoring is HOLD.', risk: 'LOW', test: 'No start path while HOLD.', classes: ['REPLACE PRESENTATION ONLY', 'REPAIR BEFORE MIGRATION'], evidence: 'src/pages/FactoringPage.tsx:35,65,82-85' },
  { id: 'fleetcare', area: 'PUBLIC PAGE', route: '/services/fleetcare · /plans', fn: 'Marketing + plan list; REQUEST SERVICE → /portal/fleetcare/request.', backend: 'None.', destination: 'Design FLEETCARE + PLANS (price on request).', preserve: 'Steps, disclosures, plan names.', restyle: 'All.', security: 'Prices $0 / $19 / $39 / +$5 per vehicle shown.', risk: 'LOW', test: 'No price until approved.', classes: ['REPLACE PRESENTATION ONLY'], evidence: 'src/pages/fleetcare/FleetCarePublicPages.tsx:9-110; src/fleetcare/fleetcareConfig.ts:13-50' },
  { id: 'fleetcare-apply', area: 'FORM', route: '/fleetcare/providers/join · /apply', fn: 'Provider application: business name, email, location, agreement (draft v0.1).', backend: 'NONE — onSubmit is preventDefault(); the data is discarded in every mode.', destination: 'Design JOIN / APPLY.', preserve: 'Fields and the agreement checkbox (once the agreement exists).', restyle: 'All.', security: 'Agreement is a draft with no document.', risk: 'MEDIUM', test: 'A submitted application reaches the office.', classes: ['REPAIR BEFORE MIGRATION'], evidence: 'src/pages/fleetcare/FleetCarePublicPages.tsx:144,158' },
  { id: 'driverlink', area: 'PUBLIC PAGE', route: '/services/driverlink · /driverlink/signup', fn: 'Two pathways; /driverlink/signup is a heading and a link — no form, no inbound link.', backend: 'None.', destination: 'Design DRIVERLINK; the design DRAWS a driver-profile form that does not exist live.', preserve: 'Disclosures; the driver portal route.', restyle: 'All.', security: '—', risk: 'LOW', test: 'Do not ship the drawn form as working until a profile endpoint exists.', classes: ['REPLACE PRESENTATION ONLY', 'DEFER'], evidence: 'src/pages/driverlink/DriverLinkPublicPages.tsx:60-72' },
  { id: 'start-business', area: 'JOURNEY', route: '/start-your-business · /build · /register · /activate · /roll', fn: 'Six-milestone journey, step pages with sub-steps, progress.', backend: 'Demo store (seeded client) — not auth-gated.', destination: 'Design START YOUR BUSINESS (stage picker in place) + stage pages.', preserve: 'startBusinessJourneyDef (stages, routes, sub-steps); ?journey context.', restyle: 'All.', security: 'Demo-client progress shown to anonymous visitors; ?from open redirect; four sub-step slugs and the INC slug do not exist.', risk: 'MEDIUM', test: 'Sub-step links resolve; ?from sanitized; no demo progress.', classes: ['RECONNECT TO NEW DESIGN', 'REPAIR BEFORE MIGRATION'], evidence: 'src/journeys/startBusinessJourneyConfig.ts:58-77; src/pages/start-business/StartBusinessBuildPage.tsx:40' },
  { id: 'road-ready', area: 'PUBLIC PAGE', route: '/road-ready', fn: 'Road Ready marketing; CTAs into Smart Intake; static 0% ring.', backend: 'None.', destination: 'Design ROAD READY™.', preserve: 'CTA destinations.', restyle: 'All.', security: '—', risk: 'LOW', test: 'Links resolve.', classes: ['REPLACE PRESENTATION ONLY'], evidence: 'src/pages/RoadReadyPublicPage.tsx' },
  { id: 'guide', area: 'PUBLIC PAGE', route: '/roadmap', fn: 'Static mock roadmap that says “mocked for Sprint 01”, linked as COMPLIANCE GUIDE.', backend: 'None.', destination: 'Design COMPLIANCE GUIDE (one family at a time, from the catalog).', preserve: 'The route and its nav label.', restyle: 'All; the developer copy goes.', security: '—', risk: 'LOW', test: '—', classes: ['REPLACE PRESENTATION ONLY'], evidence: 'src/pages/RoadmapPage.tsx:12-15,53-56' },
  { id: 'client-portal-info', area: 'PUBLIC PAGE', route: '/client-portal', fn: 'Portal marketing with a mock dashboard ($12,750 eligible etc.).', backend: 'None (mock data).', destination: 'Design CLIENT PORTAL (approved IFTA client screen, labelled sample).', preserve: 'LOG IN / SIGN UP / REQUEST ACCESS.', restyle: 'All; mock dollar figures go.', security: '—', risk: 'LOW', test: 'No dollar figures.', classes: ['REPLACE PRESENTATION ONLY'], evidence: 'src/pages/ClientPortalInfoPage.tsx; src/components/AIOPortalPreview.tsx:40-48' },
  { id: 'about', area: 'PUBLIC PAGE', route: '/about', fn: 'Tagline, industries, resource links.', backend: 'None.', destination: 'Design ABOUT.', preserve: 'Resource links.', restyle: 'All.', security: '—', risk: 'LOW', test: '—', classes: ['REPLACE PRESENTATION ONLY'], evidence: 'src/pages/AboutPage.tsx' },
  { id: 'contact', area: 'FORM', route: '/contact', fn: 'Intent chips, contact info, inquiry form (name, email, phone, business, message, preferred method incl. TEXT).', backend: 'createLeadFromForm → the visitor’s own localStorage (isDemo: true) in EVERY mode — no server path.', destination: 'Design CONTACT.', preserve: 'Fields, intents, preferred-method choice.', restyle: 'All.', security: 'Leads never reach AIO; TEXT offered with no SMS/TCPA consent; placeholder phone/email.', risk: 'HIGH', test: 'A submitted inquiry appears in the office CRM; consent captured when TEXT chosen.', classes: ['REPAIR BEFORE MIGRATION', 'RECONNECT TO NEW DESIGN'], evidence: 'src/pages/ContactPage.tsx:35-49,100-109,205; src/demo/crmActions.ts:64-133' },
  { id: 'callback', area: 'FORM', route: '/request-callback', fn: 'Name, phone, best time, reason.', backend: 'createLeadFromForm (localStorage only).', destination: 'Design REQUEST A CALLBACK.', preserve: 'Fields.', restyle: 'All; “demo mode” copy goes.', security: 'No consent; never delivered.', risk: 'HIGH', test: 'Callback reaches the office.', classes: ['REPAIR BEFORE MIGRATION', 'RECONNECT TO NEW DESIGN'], evidence: 'src/pages/RequestCallbackPage.tsx:14-26,46' },
  { id: 'schedule', area: 'FORM', route: '/schedule', fn: 'Four-step appointment request: type, date, slot (10-minute hold), contact.', backend: 'Demo store: lead + conversation + appointment; sessionStorage hold id.', destination: 'Design SCHEDULE draws a SIMPLER form (day + time) — FEATURE CONFLICT.', preserve: 'Appointment types, date picker, slot hold — restyle the live four steps, do not adopt the drawn shortcut.', restyle: 'All.', security: 'Only the name is required; never delivered; no calendar event.', risk: 'HIGH', test: 'A booking reaches the office calendar.', classes: ['REPAIR BEFORE MIGRATION', 'RECONNECT TO NEW DESIGN'], evidence: 'src/pages/SchedulePage.tsx:11-72; src/demo/appointmentActions.ts:38-158' },
  { id: 'quote', area: 'FORM', route: '/quote/:secureToken', fn: 'Quote by private token: lines, fees, accept / decline with reason.', backend: 'Looks the token up in the visitor’s own demo store — a staff-issued link cannot resolve on another device.', destination: 'Design YOUR QUOTE (amounts come from the live quote).', preserve: 'Token flow, accept/decline, decline reasons, the “not payment” note.', restyle: 'All.', security: 'Token is the only check; sequential quote numbers exposed; decline of a revised quote silently fails.', risk: 'HIGH', test: 'A quote issued in the office opens, accepts and declines from another device.', classes: ['REPAIR BEFORE MIGRATION', 'RECONNECT TO NEW DESIGN'], evidence: 'src/pages/PublicQuotePage.tsx:13-133; src/demo/crmActions.ts:60-62,412-470' },
  { id: 'intake', area: 'JOURNEY', route: '/get-started', fn: 'Smart Intake: goal → status → business (name check) → operating → Road Ready assets → priorities → factoring/insurance branches → shipper → contact; roadmap + CRM lead on finish; save & exit.', backend: 'Demo store (every mode); POST /api/aio/business-name-check outside demo.', destination: 'Design GET STARTED — now drawn from the live intakeConfig (sections, questions, options, goal branches).', preserve: 'intakeConfig.ts and intakeRules.ts exactly; getVisibleSections; generateRoadmap; ?goal / ?service.', restyle: 'All.', security: 'Intake PII in localStorage; never reaches AIO; MOVE FREIGHT offered while Brokerage is paused; “Perfect Choice Inc.” placeholder; “bank-level encryption” claim in the shell copy is unverified.', risk: 'HIGH', test: 'Every goal’s section order equals getVisibleSections; a finished intake creates a server-side lead and roadmap.', classes: ['RECONNECT TO NEW DESIGN', 'REPAIR BEFORE MIGRATION'], evidence: 'src/intake/intakeConfig.ts:48-425; src/pages/GetStartedPage.tsx:24-116; src/locales/*/intake.json:52' },
  { id: 'roadmap-results', area: 'JOURNEY', route: '/roadmap/results', fn: 'The generated roadmap; ADD TO MY PLAN.', backend: 'Demo store.', destination: 'Design YOUR ROADMAP.', preserve: 'Roadmap engine output; add-to-plan.', restyle: 'All.', security: '—', risk: 'MEDIUM', test: 'Roadmap equals generateRoadmap for the answers.', classes: ['RECONNECT TO NEW DESIGN'], evidence: 'src/pages/RoadmapResultsPage.tsx:15-141' },
  { id: 'service-plan', area: 'JOURNEY', route: '/service-plan', fn: 'The plan, with price labels and requirements; remove.', backend: 'Demo store; the supabase repository uses a different key that nothing writes.', destination: 'Design MY SERVICE PLAN (planned services first; no price).', preserve: 'Plan contents and removal.', restyle: 'All.', security: 'Prices shown.', risk: 'HIGH', test: 'A plan built anonymously survives sign-in and reaches submit.', classes: ['RECONNECT TO NEW DESIGN', 'REPAIR BEFORE MIGRATION'], evidence: 'src/pages/ServicePlanPage.tsx; src/data/repositories/supabaseRepositories.ts:171-208' },
  { id: 'request-submit', area: 'JOURNEY', route: '/request/submit · /request/confirmation/:id', fn: 'Review intake + plan, re-check the name, submit a service request; confirmation.', backend: 'Demo store, or aio_service_requests in supabase mode (first service only).', destination: 'Design SEND YOUR REQUEST + REQUEST RECEIVED.', preserve: 'Name re-check; the account requirement; the request number on confirmation.', restyle: 'All; DEMO copy goes.', security: 'Broken in supabase mode (empty plan → submit disabled); only services[0] stored; errors uncaught.', risk: 'HIGH', test: 'End-to-end: intake → plan → sign-in → submit → office queue → portal request page.', classes: ['REPAIR BEFORE MIGRATION', 'RECONNECT TO NEW DESIGN'], evidence: 'src/pages/RequestSubmitPage.tsx:125-309' },
  { id: 'office-activation', area: 'ACCOUNT', route: '/office-activation/:token', fn: 'Existing-client activation: password, redeem invite token, → /portal/activation/review.', backend: 'Demo store only; the password is never used; links are built as /all-in-one/office-activation/… (404).', destination: 'The approved migration/activation flow (migration visual authority) — not redrawn here.', preserve: 'The approved migration screens and the token-hash check.', restyle: 'Nothing here (migration authority).', security: 'No auth identity created; wrong company name shown regardless of token.', risk: 'HIGH', test: 'An invite link from the office activates a real account.', classes: ['PRESERVE EXACTLY', 'REPAIR BEFORE MIGRATION'], evidence: 'src/pages/activation/OfficeActivationPage.tsx:10-44; src/demo/clientMigrationOfficeActions.ts:19' },
  { id: 'login', area: 'ACCOUNT', route: '/login', fn: 'Email + password (Supabase), sanitized return URL, office flag, demo portal shortcut.', backend: 'supabase.auth.signInWithPassword; session aio-auth-token.', destination: 'Design LOG IN.', preserve: 'authService, sanitizeReturnUrl and its allow-list, AIOAuthProvider — EXACTLY.', restyle: 'Presentation only.', security: 'No role routing; provider/driver/shipper deep links fall to /portal; “remember me” ignored; demo shortcut not production-gated; env-var names in an error.', risk: 'HIGH', test: 'Auth regression suite: client, staff, provider, driver, shipper, return URLs.', classes: ['PRESERVE EXACTLY', 'REUSE AND RESTYLE', 'REPAIR BEFORE MIGRATION'], evidence: 'src/pages/auth/LoginPage.tsx:22-153; src/auth/returnUrl.ts:3-43' },
  { id: 'signup', area: 'ACCOUNT', route: '/signup · /sign-up', fn: 'Three-step sign-up (account · business · account type) → /onboarding; org creation; marketing opt-in.', backend: 'supabase.auth.signUp + aio_organizations / memberships / profiles.', destination: 'Design CREATE ACCOUNT draws ONE step (four fields) — FEATURE CONFLICT.', preserve: 'All three steps, the metadata and org creation — restyle the live flow, do not adopt the drawn shortcut.', restyle: 'Presentation only.', security: 'Terms/Privacy link to /contact; terms acceptance not stored; orphaned auth user + business-name enumeration on duplicate; “Continue (Demo)” in every mode; /sign-up drops ?return.', risk: 'HIGH', test: 'Sign-up in supabase mode creates user + org + profile; terms recorded.', classes: ['PRESERVE EXACTLY', 'REUSE AND RESTYLE', 'REPAIR BEFORE MIGRATION'], evidence: 'src/pages/auth/SignUpPage.tsx:21-408; src/auth/authService.ts:64-152' },
  { id: 'password', area: 'ACCOUNT', route: '/forgot-password · /reset-password · /verify-email', fn: 'Reset email, set new password, resend verification.', backend: 'Supabase auth.', destination: 'Design FORGOT PASSWORD; reset and verify are NOT drawn (same form family).', preserve: 'All three flows exactly.', restyle: 'Presentation only.', security: 'Reset does not check a recovery session; verify silently no-ops without a session; emailVerified never enforced.', risk: 'MEDIUM', test: 'Reset and verify round-trips.', classes: ['PRESERVE EXACTLY', 'REUSE AND RESTYLE'], evidence: 'src/pages/auth/ForgotPasswordPage.tsx; ResetPasswordPage.tsx:19-38; VerifyEmailPage.tsx:14-21' },
  { id: 'onboarding', area: 'ACCOUNT', route: '/onboarding', fn: 'Intent chooser after sign-up (start, Road Ready, portal, services, shipper).', backend: 'Session or demo sign-up draft.', destination: 'Design ONBOARDING.', preserve: 'Intents and the shipper filter.', restyle: 'All.', security: 'Anonymous visitors are told their account is ready.', risk: 'LOW', test: 'Shipper vs carrier intents.', classes: ['REUSE AND RESTYLE'], evidence: 'src/pages/auth/OnboardingPage.tsx:16-94' },
  { id: 'not-found', area: 'SYSTEM', route: '*', fn: '“Page not found”, outside the public layout; HTTP 200 (SPA rewrite).', backend: '—', destination: 'Design 404 (inside the site chrome).', preserve: '—', restyle: 'All.', security: 'Soft 404s; unknown /services/x renders “Service Not Found” with 200.', risk: 'LOW', test: 'Unknown routes show the 404 page.', classes: ['REPLACE PRESENTATION ONLY'], evidence: 'src/routes/AllInOneRoutes.tsx:11-23,42' },
  { id: 'debug-icons', area: 'SYSTEM', route: '/debug/icon-library', fn: 'QA grid of every icon.', backend: '—', destination: 'NOT DESIGNED — should not be public.', preserve: '—', restyle: '—', security: 'Public unless VITE_AIO_ENVIRONMENT=production.', risk: 'MEDIUM', test: 'Route absent or redirected in production.', classes: ['REMOVE ONLY WITH APPROVAL'], evidence: 'src/pages/debug/IconLibraryDebugPage.tsx:66-68' },
  { id: 'layout-mirrors', area: 'SYSTEM', route: '/desktop/* · /mobile/* · /get-started/{desktop,mobile}', fn: 'Layout-preview mirrors of the WHOLE route tree (including /desktop/office/*).', backend: '—', destination: 'NOT DESIGNED.', preserve: '—', restyle: '—', security: 'Mounted in every environment, production included.', risk: 'MEDIUM', test: 'Mirrors absent in production.', classes: ['REMOVE ONLY WITH APPROVAL'], evidence: 'src/routes/AllInOneRoutes.tsx:31-40' },
  { id: 'nav', area: 'CROSS-CUTTING', route: 'every public page', fn: 'AIONav (mega menu with activation badges, header phone, LANGUAGE SELECTOR, auth nav), mobile drawer (adds Enter Demo Portal, tel/mailto), desktop footer, mobile footer accordion, service-plan bar.', backend: 'Session; demo store (plan bar).', destination: 'Design NAV (mega menu, solutions, resources, search, drawer) + footer (lockup only) + MY PLAN pill on service pages.', preserve: 'Every destination; the EN/ES LANGUAGE SELECTOR (absent from the design — must be added); signed-in state (Portal / Log out).', restyle: 'All.', security: 'Demo portal entry in the drawer; badges contradict pages.', risk: 'MEDIUM', test: 'Every nav link resolves; language switch persists.', classes: ['REPLACE PRESENTATION ONLY', 'RECONNECT TO NEW DESIGN'], evidence: 'src/components/AIONav.tsx:178-188; src/components/mobile/MobileNavDrawer.tsx; src/components/AIOFooter.tsx' },
  { id: 'i18n', area: 'CROSS-CUTTING', route: 'every page', fn: 'i18next en-US / es-US, ten namespaces, locale in localStorage.', backend: '—', destination: 'The design is English only.', preserve: 'Both locales and every key (es parity verified).', restyle: '—', security: 'Locale storage not try/caught.', risk: 'MEDIUM', test: 'Spanish renders every migrated page.', classes: ['PRESERVE EXACTLY', 'RECONNECT TO NEW DESIGN'], evidence: 'src/i18n/index.ts:27-82; src/locales/{en,es}/*.json' },
  { id: 'seo', area: 'CROSS-CUTTING', route: 'every page', fn: 'usePageMeta on some pages; robots noindex, nofollow site-wide; no sitemap, canonical or Open Graph.', backend: '—', destination: 'Per-route titles and descriptions in the migration.', preserve: 'Every public URL (no URL changes are proposed).', restyle: '—', security: '—', risk: 'MEDIUM', test: 'Titles, descriptions, robots per environment, sitemap.', classes: ['REPAIR BEFORE MIGRATION'], evidence: 'index.html:4-10; src/hooks/usePageMeta.ts:8-25' },
  { id: 'analytics', area: 'CROSS-CUTTING', route: '—', fn: 'NONE — no analytics, telemetry, cookie or consent code exists.', backend: '—', destination: '—', preserve: '—', restyle: '—', security: 'Adding analytics later needs a consent decision.', risk: 'LOW', test: '—', classes: ['DEFER'], evidence: 'grep of src/ and index.html (gtag, posthog, plausible, segment, cookie…): no hits' },
  { id: 'name-check', area: 'CROSS-CUTTING', route: 'POST /api/aio/business-name-check', fn: 'The only API endpoint: state + business name → availability (Topograph when keyed, else manual review); 30/hour per IP.', backend: 'Vercel function; in-memory cache and rate limit.', destination: 'Called from GET STARTED (business) and SEND YOUR REQUEST.', preserve: 'Endpoint and contract exactly.', restyle: '—', security: 'Rate limit per instance, keyed on spoofable x-forwarded-for; client does not catch failures; Vercel handler signature unverified.', risk: 'MEDIUM', test: '405 / 400 / 429 / result on staging.', classes: ['PRESERVE EXACTLY', 'REPAIR BEFORE MIGRATION'], evidence: 'api/aio/business-name-check.ts:1-9; src/business-formation/businessNameRegistry/server/*' },
  { id: 'activation', area: 'CROSS-CUTTING', route: 'every service CTA', fn: 'Three status sources: SERVICE_LAUNCH_MATRIX (public CTAs), SERVICE_ACTIVATION_MATRIX (office only), catalog activationStatus (unread).', backend: '—', destination: 'The design derives one status word per service (launch matrix, else catalog; Brokerage PAUSED).', preserve: 'The founder’s activation decisions themselves.', restyle: '—', security: 'getPublicServiceCta fails OPEN for unmapped slugs.', risk: 'HIGH', test: 'One source; unmapped = closed.', classes: ['REPAIR BEFORE MIGRATION'], evidence: 'src/launch/serviceActivationLaunch.ts:226-294; src/infrastructure/serviceActivation.ts:20-32' },
  { id: 'pricing', area: 'CROSS-CUTTING', route: 'service pages, plans, FleetCare, service plan', fn: 'DEFAULT_SERVICE_PRICING (“clearly fictional”), BOOKKEEPING_PLANS, FLEETCARE_PRICING_CONFIG.', backend: '—', destination: 'The design shows QUOTE AFTER REVIEW / PRICE ON REQUEST.', preserve: 'The configs (data) until the founder approves prices.', restyle: '—', security: 'Unapproved prices are public today.', risk: 'HIGH', test: 'No $ on any public page until approval.', classes: ['REMOVE ONLY WITH APPROVAL'], evidence: 'src/billing/servicePricingConfig.ts:4-103; src/bookkeeping/bookkeepingPlans.ts; src/fleetcare/fleetcareConfig.ts' },
  { id: 'auth-modes', area: 'CROSS-CUTTING', route: '/portal/* · /office/* · /shipper/* · /provider/* · /driver/*', fn: 'Route guards; demo is the default data mode; every guard is open in demo; office staff switcher outside production.', backend: 'Supabase in supabase mode.', destination: 'Out of the public redesign (portal and office are separate).', preserve: 'Guards and lifecycle guard exactly.', restyle: '—', security: 'A deployment without a valid Supabase config exposes the office and every portal.', risk: 'HIGH', test: 'Production build refuses demo mode; guards enforce.', classes: ['PRESERVE EXACTLY', 'REPAIR BEFORE MIGRATION'], evidence: 'src/auth/guards/RouteGuards.tsx:12-89; src/config/env.ts:20-25' },
  { id: 'assets', area: 'CROSS-CUTTING', route: 'public/', fn: 'Lockup, favicon, service icons, IFTA plates and fonts, migration kit; the retired hero truck preloaded on every page; an 11.9 MB migration-screens zip and ~4.5 MB of QA sheets served publicly; source maps published.', backend: '—', destination: 'Design asset manifest (AIO_PM_ASSETS).', preserve: 'Lockup, IFTA plates, fonts, migration kit.', restyle: '—', security: 'Public zip of staff migration screens; source maps.', risk: 'MEDIUM', test: 'No retired asset, zip, QA sheet or source map in the production build.', classes: ['PRESERVE EXACTLY', 'REMOVE ONLY WITH APPROVAL', 'REPAIR BEFORE MIGRATION'], evidence: 'index.html:10; public/AIO-CLIENT-MIGRATION-AUTHORITIES.zip; vite.config.ts:52' },
  { id: 'page-system-css', area: 'CROSS-CUTTING', route: '28 public page files', fn: 'aio-page-system.css (887 lines, 105 aio-ps-* classes) — imported nowhere.', backend: '—', destination: 'Superseded by the new design’s stylesheet.', preserve: '—', restyle: '—', security: '—', risk: 'LOW', test: '—', classes: ['REPLACE PRESENTATION ONLY'], evidence: 'src/styles/aio-page-system.css; src/App.tsx:3-20' },
];

/* ═══════════════ 02 · route comparison ═══════════════ */
export const AIO_PM_ROUTES = {
  matched: 'Every current public, journey and account route listed in AIO_PM_INVENTORY has a designed page except the rows below; the 52 catalog services each have a designed page.',
  missing_in_design: [
    '/reset-password and /verify-email — not drawn (same form family as FORGOT PASSWORD); preserve the live flows.',
    '/office-activation/:token — governed by the approved migration/activation authority, not redrawn here.',
    'Four detail slugs outside the catalog (rate-confirmation-management, pod-management, invoice-funding-review, factoring-transition-assistance) — founder decision.',
    '/debug/icon-library and the /desktop/* · /mobile/* mirrors — not designed on purpose (remove only with approval).',
  ],
  new_in_design: [
    'No new public URLs. /not-found is the design’s name for the existing 404.',
    'New on existing pages: the ON THIS PAGE bar, the family explorer, the catalog index, the stage selector, the compliance-guide selector, the MY PLAN pill.',
  ],
  redirects: [
    '/sign-up → /signup (keep; carry ?return — today it is dropped).',
    '/portal/services/ifta(/*) → /portal/workspaces/ifta (existing; keep).',
    '/get-started/desktop · /get-started/mobile → the layout-preview mirrors (remove with the mirrors, approval).',
    'If the founder retires the four non-catalog slugs: 301 each to its family page.',
    'No other URL changes — the new design keeps every public path.',
  ],
  conflicts: [
    'GET STARTED: the earlier design drew three steps; the live Smart Intake has up to ten sections — RESOLVED in this sprint: the design now draws the live sections from intakeConfig.ts.',
    'CREATE ACCOUNT: the design draws one step; the live sign-up has three (account · business · account type) — restyle the live flow.',
    'SCHEDULE: the design draws day + time; the live page has type, date, slot hold and contact — restyle the live flow.',
    'DRIVER PROFILE: the design draws a form; the live page has none — design-only until a profile endpoint exists.',
    'LANGUAGE: the live header has EN/ES; the design has no selector — add it.',
    'BROKERAGE: the design shows Brokerage paused everywhere; the live service pages, intake goal and portal paths do not (CT-02, CT-19).',
  ],
  unrepresented: [
    'Signed-in public header state (Portal / Log out) — not drawn.',
    'The header phone link and the drawer’s tel:/mailto: — the design shows TO BE CONFIRMED until real details exist.',
    'Bookkeeping monthly/annual toggle and the plan comparison matrix — not drawn (prices not approved).',
    'The service-plan bar on every public page — drawn as the MY PLAN pill on service pages only.',
    'Smart Intake save & exit autosave and the name-check result states — drawn as notes.',
  ],
  content_differences: [
    'Service pages now carry the live per-service words (src/data/services.ts) — previously the design used only the catalog.',
    'Prices: live shows them; the design does not (none approved).',
    'Contacts: live shows placeholders; the design labels them TO BE CONFIRMED.',
    'Homepage band: live none; the design shows panel 04’s four principles and four product facts (no unverified figures).',
    'The retired hero-truck photograph (IFTA contract IDNTY_10) is live on the homepage; the design no longer uses it anywhere.',
  ],
  approvals: [
    'Desktop and tablet compositions (REVIEW B).',
    'Shorter journeys (REVIEW C).',
    'Prices, contact details, hours, Terms/Privacy pages.',
    'Removal of /debug/icon-library, the layout mirrors, the public zip and QA sheets.',
    'The four non-catalog detail slugs.',
    'Any change to the approved IFTA public page.',
  ],
} as const;

/* ═══════════════ 04 · integrations ═══════════════ */
export const AIO_PM_INTEGRATIONS: { name: string; what: string; status: string; migration: string }[] = [
  { name: 'Supabase Auth', what: 'signInWithPassword, signUp (+ org, membership, profile), resetPasswordForEmail, updateUser, resend', status: 'Built; active only when the data mode is supabase and the project ref matches', migration: 'PRESERVE EXACTLY — restyle screens only' },
  { name: 'Supabase data (public flows)', what: 'aio_service_requests (+ status history, activity) from /request/submit', status: 'Built but broken end-to-end (plan storage mismatch, first service only)', migration: 'REPAIR (CT-09) then reconnect' },
  { name: 'Business name check', what: 'POST /api/aio/business-name-check → Topograph adapter or manual review', status: 'Built; demo mode simulates in the browser', migration: 'PRESERVE EXACTLY; harden (CT-16)' },
  { name: 'Demo store', what: 'localStorage aio_debug_store: intake, roadmap, plan, leads, appointments, quotes — seeded into every browser', status: 'The only destination of every public form today', migration: 'REPLACE with server paths (CT-01); stop seeding outside demo (CT-07)' },
  { name: 'Session / browser storage', what: 'aio-auth-token, aio_demo_signup_draft, aio_bookkeeping_*, aio-schedule-session, aio_preferred_locale, aio_service_plan_<org>', status: 'In use', migration: 'Keep auth and locale; move PII out of localStorage' },
  { name: 'i18next', what: 'en-US / es-US, ten namespaces', status: 'In use (most public copy hardcoded English)', migration: 'PRESERVE; add the selector to the new design' },
  { name: 'Analytics / consent', what: '—', status: 'None exist', migration: 'DEFER — decision first' },
  { name: 'Payments', what: 'Pay invoice page (portal) — simulated, “online payment not yet available”', status: 'Not public; not live', migration: 'Out of scope; do not enable' },
  { name: 'Uploads', what: 'None on public pages (vault uploads are portal-only)', status: '—', migration: '—' },
  { name: 'Fonts', what: 'Live: DM Sans + Plus Jakarta Sans (Google @import). Design: Inter Tight + Inter (self-hosted, decided)', status: '—', migration: 'Replace with the self-hosted pair' },
  { name: 'Vercel', what: 'SPA rewrite; /api functions; sourcemap: true', status: 'Domain NOT_SELECTED; production project pending owner', migration: 'Turn source maps off; environment-aware robots' },
];

/* ═══════════════ 05 · known issues re-verified against the current source ═══════════════ */
export const AIO_PM_ISSUES: { id: string; claim: string; verdict: 'CONFIRMED' | 'CONFIRMED — WORSE THAN RECORDED' | 'CONFIRMED — NARROWER THAN RECORDED' | 'NOT CONFIRMED'; evidence: string; task: string }[] = [
  { id: 'A', claim: 'aio-page-system.css is not imported', verdict: 'CONFIRMED', evidence: 'No import in any .ts/.tsx/.css/.html; the local production build’s CSS has 0 aio-ps-* selectors; 105 aio-ps-* classes in 28 public files are unstyled.', task: 'CT-08' },
  { id: 'B', claim: 'Activation sources disagree', verdict: 'CONFIRMED — WORSE THAN RECORDED', evidence: 'Three sources plus an implicit fourth (every src/data/services.ts entry is “available”). getPublicServiceCta returns GO for any slug missing from SLUG_MAP (serviceActivationLaunch.ts:290-291): 10 of 56 public slugs disagree on whether the service can be started — including the four Brokerage service pages, BOC-3, held insurance and factoring, and internal-only fuel tax.', task: 'CT-02' },
  { id: 'C', claim: 'Unapproved prices are shown', verdict: 'CONFIRMED', evidence: 'Rendered in the local build: BOC-3 $125, LLC $299, bookkeeping $249/$449/$749 per month and annual, Books Rescue $749, FleetCare $0/$19/$39 + $5 per vehicle; servicePricingConfig.ts:4 calls them “clearly fictional”.', task: 'CT-03' },
  { id: 'D', claim: 'Placeholder contacts', verdict: 'CONFIRMED', evidence: '(866) 000-0000 and contact@allinoneenterprises.example (appConfig.ts:20-24, marked temporary) rendered on /contact, header, both footers, drawer and Smart Intake; no address or hours anywhere.', task: 'CT-04' },
  { id: 'E', claim: 'Retired brand terms in translations', verdict: 'CONFIRMED — NARROWER THAN RECORDED', evidence: 'Only “Perfect Choice Inc.” (the retired identity) as the Smart Intake business-name placeholder, en and es intake.json:52; no other retired variant in the locales. “Frontal Slayer” and “Perfect Choice” are also in the shipped bundle and its public source maps; the legacy-brand audit is a stub that always passes (qaEngine.ts:99-101).', task: 'CT-05' },
  { id: 'F', claim: '/debug/icon-library is exposed', verdict: 'CONFIRMED', evidence: 'Redirects to / only when VITE_AIO_ENVIRONMENT is production; the default is local. Rendered in the local build (12,806 px tall on a phone). The /desktop/* and /mobile/* mirrors of the whole tree are mounted in every environment.', task: 'CT-06' },
  { id: 'G', claim: 'Design-review forms are simulated', verdict: 'CONFIRMED — WORSE THAN RECORDED', evidence: 'The design’s forms say NOTHING WAS SENT (by design). The LIVE forms are effectively simulated too: contact, callback, schedule, Smart Intake and quotes write only to the visitor’s own localStorage in every mode; the FleetCare application discards its data.', task: 'CT-01' },
  { id: 'H', claim: 'Privacy issues are open', verdict: 'CONFIRMED', evidence: 'All 12 recorded gaps are OPEN (docs/aio/office-unified-experience/11_SECURITY_REPAIR_HANDOFF.md:21-32); 6 spot-checked in this tree are still present (anon grant, org self-update of client_lifecycle, internal activity to client, FleetCare ticket org check, client links into /office, draft bookkeeping reports).', task: 'CT-20' },
];

/* ═══════════════ Composer repair tasks (precise; none performed in this sprint) ═══════════════ */
export const AIO_PM_COMPOSER_TASKS: { id: string; priority: 'P0' | 'P1' | 'P2'; title: string; files: string; do: string; accept: string; approval?: string }[] = [
  { id: 'CT-01', priority: 'P0', title: 'Deliver every public form to AIO', files: 'src/demo/crmActions.ts, src/demo/appointmentActions.ts, src/pages/{Contact,RequestCallback,Schedule,GetStarted}Page.tsx, FleetCarePublicPages.tsx:144', do: 'Add server paths (Supabase table or API) for leads, callbacks, appointments, intake leads and FleetCare applications in supabase mode; keep the demo store for demo mode only.', accept: 'Each form submitted on staging appears in the office CRM/queue; nothing PII-bearing stays in localStorage.', approval: 'Schema changes follow the Supabase migration rule (AIO project only).' },
  { id: 'CT-02', priority: 'P0', title: 'One activation source, closed by default', files: 'src/launch/serviceActivationLaunch.ts:226-294, src/infrastructure/serviceActivation.ts, src/services/catalog/serviceCatalog.ts, src/data/services.ts', do: 'Map every public slug; return allowed:false for unmapped slugs; derive nav badges, CTAs, ADD TO MY PLAN and intake goals from the same function; Brokerage PAUSED wherever it appears.', accept: 'A test asserts every catalog slug’s public CTA; the four freight pages, BOC-3, held insurance/factoring and internal fuel tax cannot be started.' },
  { id: 'CT-03', priority: 'P0', title: 'No price until approved', files: 'src/billing/servicePricingConfig.ts, src/bookkeeping/bookkeepingPlans.ts, src/fleetcare/fleetcareConfig.ts, catalog/service descriptions', do: 'Gate every public price label behind an approved flag; strip “Starting at $…” from public descriptions.', accept: 'No $ on any public page (the design’s honesty check passes against the app).', approval: 'Founder approves prices.' },
  { id: 'CT-04', priority: 'P0', title: 'Real contact details', files: 'src/config/appConfig.ts:19-25', do: 'Replace the placeholders with founder-supplied phone, email (and hours/address if published).', accept: 'No (866) 000 or .example anywhere.', approval: 'Founder supplies the details.' },
  { id: 'CT-05', priority: 'P1', title: 'Remove the retired identity', files: 'src/locales/{en,es}/intake.json:52, src/qa/qaEngine.ts:99-101', do: 'Neutral business-name placeholder; make the legacy-brand audit real (brandAudit.ts FORBIDDEN_CUSTOMER_STRINGS).', accept: 'No “Perfect Choice” in locales or rendered text.' },
  { id: 'CT-06', priority: 'P1', title: 'Debug and preview routes out of production', files: 'src/routes/AioCoreRoutes.tsx:259, src/routes/AllInOneRoutes.tsx:31-40', do: 'Mount /debug/* and the /desktop/* · /mobile/* mirrors only outside production.', accept: 'Production build has neither.', approval: 'Founder approves the removal.' },
  { id: 'CT-07', priority: 'P0', title: 'Production refuses demo mode', files: 'src/config/env.ts:20-25, scripts/prebuild-validate.mjs, src/demo/demoStore.ts:254-256, DemoPortalAccess.tsx, SignUpPage.tsx:196-202', do: 'Fail the production build when the data mode is not supabase; stop seeding the demo store outside demo; hide demo shortcuts outside demo.', accept: 'A production build with VITE_AIO_DATA_MODE unset fails; /office requires a staff session.' },
  { id: 'CT-08', priority: 'P2', title: 'aio-page-system.css', files: 'src/styles/aio-page-system.css, src/components/page-system/**', do: 'Retire it with the templates when the new public design replaces them; until then either import it or remove the dead classes.', accept: 'No unstyled aio-ps-* class ships.' },
  { id: 'CT-09', priority: 'P0', title: 'The request flow in supabase mode', files: 'src/components/AIOServicePlanBar.tsx, src/repositories/servicePlanRepository.ts:25, src/data/repositories/supabaseRepositories.ts:171-300, RequestSubmitPage.tsx:125-187', do: 'One plan repository per mode; carry the anonymous plan into the account on sign-in; store every planned service; catch errors; return URL on the sign-up redirect.', accept: 'End-to-end staging test: intake → plan → sign-in → submit → office queue → /portal/requests/:id.' },
  { id: 'CT-10', priority: 'P0', title: 'Office activation creates a real account', files: 'src/pages/activation/OfficeActivationPage.tsx, src/client-migration/services/activationInviteService.ts, src/demo/clientMigrationOfficeActions.ts:19,23', do: 'Server-side invite redemption that creates/links the auth identity with the entered password; build links as /office-activation/<token>; add the missing API routes.', accept: 'An invite from the office activates on another device; the right company is shown.' },
  { id: 'CT-11', priority: 'P0', title: 'Close the ?from open redirect', files: 'src/journeys/journeyContext.ts:26-29', do: 'Pass ?from through sanitizeReturnUrl.', accept: '?from=//example.com renders an internal link.' },
  { id: 'CT-12', priority: 'P1', title: 'No public source maps', files: 'vite.config.ts:52', do: 'sourcemap: false (or hidden + upload to the error monitor) for production.', accept: 'No .map files in the production build.' },
  { id: 'CT-13', priority: 'P1', title: 'Internal files out of public/', files: 'public/AIO-CLIENT-MIGRATION-AUTHORITIES.zip, public/brand/icons/_qa-*, _qa-cell-preview/*, _source-master-*', do: 'Move them out of the served folder.', accept: 'Not downloadable from the site.', approval: 'Founder approves the removal.' },
  { id: 'CT-14', priority: 'P1', title: 'SEO for launch', files: 'index.html, src/hooks/usePageMeta.ts, the bookkeeping pages', do: 'Per-route titles/descriptions; robots by environment (noindex until launch); sitemap and canonical at launch; restore titles on unmount.', accept: 'Every public route has a title and description; staging is noindex.' },
  { id: 'CT-15', priority: 'P0', title: 'Consent and legal pages', files: 'ContactPage.tsx:205, SignUpPage.tsx:345-367, AioMobileFooterAccordion.tsx:100-102', do: 'SMS/TCPA consent when TEXT is chosen or a phone is collected for messages; real Terms/Privacy/Accessibility pages; record terms acceptance.', accept: 'Consent stored with the lead; legal links resolve.', approval: 'Counsel supplies the texts.' },
  { id: 'CT-16', priority: 'P2', title: 'Harden the name-check endpoint', files: 'src/business-formation/businessNameRegistry/server/rateLimit.ts, nameCheckClient.ts', do: 'Durable rate limit keyed on the platform IP; catch network/JSON failures in the client; confirm the Vercel handler signature on staging.', accept: '429/400/405 behave on staging; the UI shows a friendly failure.' },
  { id: 'CT-17', priority: 'P1', title: 'Retired hero asset', files: 'index.html:10, src/config/appConfig.ts:42, AioHomepageHero.tsx:16', do: 'Stop preloading and using all-in-one-hero-truck.png (IFTA contract IDNTY_10); the new design does not use it.', accept: 'The asset is not requested by any page.' },
  { id: 'CT-18', priority: 'P2', title: 'Broken links', files: 'src/journeys/startBusinessJourneyConfig.ts:58-77, StartBusinessBuildPage.tsx:33-40, BookkeepingPage.tsx:69,189', do: 'Fix the four sub-step slugs and the INC slug; pass ?goal values intake understands; add id="plans".', accept: 'Link checker clean.' },
  { id: 'CT-19', priority: 'P0', title: 'Brokerage paused in the portals', files: 'BrokeragePortalPages.tsx:55-60, LoadBoardPages.tsx:326-379, ShipFreightRequestWizard.tsx:94-100, ShipperPortalPages.tsx:198-221, intakeConfig.ts:67', do: 'Read the pause flag: no carrier offer acceptance (carrier assignment), no load-board offers (live load transactions), no shipper submissions or quote acceptance, no MOVE FREIGHT goal, no brokerage payments; instant book stays disabled.', accept: 'With Brokerage PAUSED none of these actions can be taken.' },
  { id: 'CT-20', priority: 'P0', title: 'The twelve privacy gaps', files: 'docs/aio/office-unified-experience/11_SECURITY_REPAIR_HANDOFF.md', do: 'Separate sprint P0.AIO.SECURITY.PRIVACY-REPAIR1 — unchanged by this sprint.', accept: 'As recorded in the security handoff.' },
  { id: 'CT-21', priority: 'P1', title: 'Quotes resolve from the server', files: 'src/pages/PublicQuotePage.tsx, src/demo/crmActions.ts:60-62,412-470', do: 'Server lookup by token; non-sequential public reference; decline works for revised quotes.', accept: 'An office-issued quote opens on another device.' },
  { id: 'CT-22', priority: 'P1', title: 'Language in the new design', files: 'the new public components', do: 'Carry the EN/ES selector and the i18n keys into the new design; move hardcoded public copy into namespaces as pages are ported.', accept: 'Every ported page renders in Spanish.' },
];

/* ═══════════════ 06–08, 11 · what changed in the design ═══════════════ */
export const AIO_PM_DESIGN = {
  desktop: [
    'HOME — WHAT CAN WE HELP YOU DO is a split explorer: the four live pathways on the left, the chosen road on the right over its photograph with up to six of its services (status chips) and the pathway’s own call to action.',
    'HOME — START · OPERATE · MAINTAIN is a stage selector: a vertical road of three stages (who each is for) beside one glass panel with the stage’s families and a WHERE TO BEGIN first step.',
    'HOME — WHY ALL IN ONE adds “clear about who does what” (AIO prepares, licensed partners provide, agencies decide) beside the approved client screen; ROAD READY™ is one compact band (heading and steps | six stages).',
    'SERVICE FAMILY — one explorer replaces the list + the grid of the same services: pick on the left, read on the right (who it is for, what you provide, delivery, pricing basis, renewal, next step); the panel stays in view.',
    'SERVICE PAGE — ON THIS PAGE bar; WHAT AIO PROVIDES + WHO IT IS FOR beside the photograph with WHAT YOU PROVIDE laid over it; the live process as numbered steps (as many columns as steps) + AFTER IT IS DONE; QUESTIONS beside the disclosure; a next-step band with the service’s own action.',
    'SERVICES — the whole catalog as a three-column index by family; cards only once a family or a search narrows it.',
    'GET STARTED — the live Smart Intake with a step rail (labels from the live intake locale); the Road Ready asset checklist in two columns.',
    'START YOUR BUSINESS and the COMPLIANCE GUIDE — pick a stage / a family and read it in place.',
    'Section rhythm tightened (desktop 112 → 96 px, ultra-wide 168 → 144 px); the ultra-wide keeps every composition at its own scale.',
  ],
  tablet: [
    'HOME — a touch segmented selector (four 74 px tabs) above the chosen road’s photograph panel; the stage selector as the approved pill tabs with a two-column family grid and WHERE TO BEGIN on one row; WHY ALL IN ONE pillars in two columns.',
    'SERVICE FAMILY — the explorer in two narrower columns (status under each name).',
    'SERVICE PAGE — overview stacked, the photograph with WHAT YOU PROVIDE as a split card; AFTER in three columns.',
    'SERVICES — a two-column catalog index; COMPLIANCE GUIDE — the family list beside the panel.',
    'Plans side by side (three columns); four-step rows (FleetCare, DriverLink) in two columns instead of four cramped ones.',
    'Landscape (1194 × 834) takes the desktop compositions.',
  ],
  phone: [
    'PRESERVED: hero, band, pathway snap cards, stage pill tabs, office, Road Ready rail, closing band, footer, drawer — the approved composition.',
    'Genuine-issue fixes only: SERVICES was 13.65 screens (a card for each of 52 services) → a family index of accordions; long families show six cards + SHOW ALL; related services become a bounded snap rail; four-step rows that were squeezed into four columns now stack.',
    'Added because the brief requires the answer: WHERE TO BEGIN under each stage; on service pages WHO IT IS FOR, WHAT YOU PROVIDE, AFTER and QUESTIONS (from the live service words) and a six-item ON THIS PAGE bar.',
    'The retired hero-truck photograph is no longer used (start-a-business card and pages now use approved plates).',
  ],
  journeys: [
    'Homepage pathway explorer (tablet/desktop) — choose a road, see its services, go.',
    'Homepage stage selector — which one are you → where to begin.',
    'Service family explorer — pick a service, read it, open it or start it.',
    'Service page ON THIS PAGE bar — anchored sections; ADD TO MY PLAN → MY PLAN pill → MY SERVICE PLAN.',
    'Services catalog index — family accordions (phone), family filter, live text filter.',
    'Start Your Business — stage picker with NEXT stage, services of the stage, open the stage page.',
    'Compliance guide — one family at a time with NEXT FAMILY.',
    'Get Started — the live Smart Intake sections for the chosen goal; required answers enforced; MOVE FREIGHT shown paused and not selectable.',
  ],
  motion: 'Reveal once on arrival (900 ms) and short panel fades (320 ms); nothing loops; reduced motion turns every animation off (none: not 1 ms).',
} as const;

/* ═══════════════ 16 · assets ═══════════════ */
export const AIO_PM_ASSETS: { asset: string; source: string; used: string; status: string }[] = [
  { asset: 'img/hero-home.jpg · img/aio-login.jpg', source: 'public/brand/aio-login-hero.png (founder black-truck master)', used: 'Homepage hero; account pages; Start Your Business; business formation', status: 'APPROVED' },
  { asset: 'img/highway-gold.jpg', source: 'public/brand/ifta/plates/client-hero.jpg', used: 'Money, factoring, Road Ready, paths', status: 'APPROVED (IFTA plate)' },
  { asset: 'img/mountain-road.jpg', source: 'public/brand/ifta/plates/public-road.jpg', used: 'Compliance, services, photo cards', status: 'APPROVED (IFTA plate)' },
  { asset: 'img/night-interstate.jpg', source: 'public/brand/ifta/plates/public-hero.jpg', used: 'Start-a-business pathway, insurance, DriverLink, contact', status: 'APPROVED (IFTA plate)' },
  { asset: 'img/fleet-yard.jpg', source: 'public/brand/ifta/plates/staff-hero.jpg', used: 'Operations, dispatching, FleetCare', status: 'APPROVED (IFTA plate)' },
  { asset: 'img/freight-map.jpg', source: 'public/brand/ifta/plates/public-map.jpg', used: 'Brokerage, Road Ready map, guide', status: 'APPROVED (IFTA plate)' },
  { asset: 'img/valley-trail.jpg · img/mountains-dusk.jpg', source: 'public/brand/ifta/plates/public-footer-tablet.jpg · public-footer-desktop.jpg', used: 'Bookkeeping, plan, closing band, 404', status: 'APPROVED (IFTA plate)' },
  { asset: 'brand/aio-mark-on-dark.png · brand/aio-lockup-on-dark.png', source: 'public/brand/ifta/', used: 'Nav mark; footer lockup only (logo rule)', status: 'APPROVED' },
  { asset: 'fonts/inter-tight-latin-wght.woff2 · inter-latin-wght.woff2', source: 'public/fonts/ifta/ (OFL)', used: 'All public type', status: 'DECIDED (D-TYPOGRAPHY)' },
  { asset: 'ifta/CLIENT_1440.jpg · PUBLIC_{393,834,1440}.jpg', source: 'docs/aio/ifta/visual-reconstruction/captures/after/', used: 'Client portal sample; the approved IFTA public page shown unchanged', status: 'APPROVED' },
  { asset: 'Line icons (72)', source: 'lucide-static 1.52.0 (ISC) via make-icons.py', used: 'Every icon', status: 'IFTA family source' },
  { asset: 'public/brand/all-in-one-hero-truck.png', source: '—', used: 'NOT USED — retired', status: 'RETIRED (IFTA public contract, IDNTY_10)' },
];

/* ═══════════════ 17–19 · handoff, release, rollback ═══════════════ */
export const AIO_PM_HANDOFF: { section: string; content: string }[] = [
  { section: 'ROUTE MAP', content: 'Keep every current public URL (AIO_PM_ROUTES). Port page by page behind a flag; old and new components share the same route until switched.' },
  { section: 'COMPONENT REUSE', content: 'Reuse logic, not markup: intakeConfig/intakeRules/getVisibleSections, generateRoadmap, recommendServicesFromIntake, useServicePlan, authService, sanitizeReturnUrl, usePageMeta, i18n, the name-check client. Replace AIONav/AIOFooter/page-system templates with components ported from design-authority/aio-public (site.js/site.css are the visual spec).' },
  { section: 'BACKEND PRESERVATION', content: 'No database or auth change is needed to port the presentation. Server paths for forms (CT-01) and the request flow (CT-09) are repairs with their own migrations under the AIO Supabase rule.' },
  { section: 'DATA FLOWS', content: 'Catalog + launch matrix → status words and CTAs (one function, CT-02); src/data/services.ts → service page words; intakeConfig → GET STARTED; plan → submit → aio_service_requests; leads → CRM (CT-01).' },
  { section: 'ACTIVATION RULES', content: 'AVAILABLE · LIMITED PILOT · PREPARING · COMING SOON · REQUEST INFO · NOT YET OFFERED · PAUSED · STAFF-COORDINATED · PARTNER REFERRAL — derived once; closed by default; Brokerage PAUSED.' },
  { section: 'ASSET MANIFEST', content: 'AIO_PM_ASSETS; the retired hero truck is not ported.' },
  { section: 'CONTENT MIGRATION', content: 'Words come from the live sources (catalog, src/data/services.ts, homepage content, journey config, intake locale) — the design adds headings and labels only; every label uppercase by CSS.' },
  { section: 'RESPONSIVE SPECS', content: 'One container (.pub, container queries): phone < 600, tablet 600–1099, desktop 1100–1899, ultra-wide ≥ 1900. Phone = the approved composition; tablet and desktop as AIO_PM_DESIGN.' },
  { section: 'AUTH AND FORM PRESERVATION', content: 'Restyle the live login, three-step sign-up, forgot/reset/verify, onboarding, Smart Intake, schedule (four steps) and quote — never the design’s simplified drawings.' },
  { section: 'SEO AND REDIRECTS', content: 'No URL changes; /sign-up keeps ?return; titles/descriptions per route; robots by environment (CT-14).' },
  { section: 'SECURITY', content: 'CT-06, CT-07, CT-11, CT-12, CT-13, CT-15, CT-19 before launch; the twelve privacy gaps (CT-20) on their own track.' },
  { section: 'FEATURE TESTS', content: 'Per row of AIO_PM_INVENTORY (“test”); the design-authority QA (honesty, uppercase, overflow, links, interactions) rerun against the ported app at the six sizes.' },
  { section: 'ROLLBACK', content: 'AIO_PM_ROLLBACK.' },
  { section: 'DEPLOYMENT READINESS', content: 'Nothing deploys without “deploy now”; production waits for the domain, the production Supabase project, the Vercel project and the blockers (AIO_PM_BLOCKERS).' },
];
export const AIO_PM_RELEASE: { stage: string; name: string; gate: string }[] = [
  { stage: '01', name: 'FOUNDER APPROVAL', gate: 'Desktop/tablet design (REVIEW B), shorter journeys (REVIEW C) and the preservation plan (REVIEW A) approved.' },
  { stage: '02', name: 'REPAIR THE CURRENT APP', gate: 'P0 Composer tasks merged (CT-01, 02, 03, 04, 07, 09, 10, 11, 15, 19) with tests.' },
  { stage: '03', name: 'PROVISION PRODUCTION', gate: 'Domain selected; production Supabase project; Vercel project; environment validated (no demo mode).' },
  { stage: '04', name: 'PORT THE PRESENTATION', gate: 'New public components behind a flag on staging, page by page; every URL kept.' },
  { stage: '05', name: 'RECONNECT THE FUNCTIONS', gate: 'Forms, Smart Intake, plan, request, auth flows, language selector wired to the live logic.' },
  { stage: '06', name: 'STAGING QA', gate: 'Design QA + feature tests + auth regression + accessibility + performance + security at the six sizes; no price, no placeholder, Brokerage paused.' },
  { stage: '07', name: 'FOUNDER ACCEPTANCE ON STAGING', gate: 'The founder walks the staging site on phone, tablet and desktop.' },
  { stage: '08', name: 'PRODUCTION RELEASE', gate: '“deploy now” only; flag switched; redirects verified; monitoring on.' },
  { stage: '09', name: 'WATCH AND CLOSE', gate: 'Error and form-delivery monitoring for the rollback window; old components removed after it.' },
];
export const AIO_PM_ROLLBACK: string[] = [
  'The port ships behind a flag: rolling back is switching the flag off (old presentation, same routes, same data).',
  'Vercel keeps the previous deployment: instant rollback to it if the flag is not enough.',
  'No database migration is coupled to the presentation; form/request repairs ship separately with reversible migrations.',
  'Regression suite before and after each stage: auth (client, staff, provider, driver, shipper), Smart Intake per goal, plan → submit, contact/callback/schedule delivery, quote token, language switch, Brokerage paused, no price, no placeholder, every public URL 200.',
  'Rollback triggers: any auth failure, any form not delivered, any paused service startable, any price shown, error rate above the agreed threshold.',
];

/* ═══════════════ 20 · blockers and decisions ═══════════════ */
export const AIO_PM_BLOCKERS: string[] = [
  'No production URL — the deployed site could not be audited (domain NOT_SELECTED; hosts denied from this environment).',
  'Public forms do not reach AIO in any mode (CT-01).',
  'Paused/held/internal services can be started from public pages; Brokerage has unpaused paths in the portals (CT-02, CT-19).',
  'Unapproved prices and placeholder contacts are public (CT-03, CT-04).',
  'Demo mode is the default and opens the office and every portal (CT-07).',
  'The request flow and office activation do not work against Supabase (CT-09, CT-10).',
  'Open redirect, public source maps, internal files in public/ (CT-11, CT-12, CT-13).',
  'No consent capture or legal pages (CT-15).',
  `${AIO_UO_SECURITY_HANDOFF.length} privacy gaps open (CT-20).`,
];
export const AIO_PM_FOUNDER_DECISIONS: string[] = [
  'Approve the desktop and tablet compositions (REVIEW B) — or name what to change.',
  'Approve the shorter journeys (REVIEW C), including the phone genuine-issue fixes (services index, SHOW ALL, related rail) and the additions (WHERE TO BEGIN, the service-page sections).',
  'Approve the preservation plan (REVIEW A): restyle the live sign-up, schedule and Smart Intake rather than simplify them.',
  'Supply the production URL (or approve the domain) so the deployed site can be audited.',
  'Approve prices before any are published; supply verified phone, email, hours.',
  'Approve removal of /debug/icon-library, the layout mirrors, the public migration zip and the QA icon sheets.',
  'Decide the four non-catalog detail pages (keep, fold into the catalog, or redirect).',
  'Decide analytics and consent (none exist today).',
  'Confirm the start-a-business imagery now that the retired hero truck is out (approved plates are used).',
];

/* ═══════════════ quality gate ═══════════════ */
export function validatePublicMigration(): string[] {
  const out: string[] = [];
  const E = AIO_PM_EVIDENCE;
  if (AIO_PM_LIVE.verified || AIO_PM_LIVE.production_url) out.push('a production URL is claimed — it was not verified');
  if (!/NOT VERIFIED/.test(AIO_PM_STATUS.live_site)) out.push('the live site is recorded as not verified');
  if (!/^NOT CHANGED/.test(AIO_PM_STATUS.live_app)) out.push('the live app is not changed');
  if (!/NOT DEPLOYED$/.test(AIO_PM_STATUS.public_design)) out.push('the design is not deployed');
  if (!/^PAUSED/.test(AIO_PM_STATUS.brokerage)) out.push('Brokerage paused');
  if (!/PRIVACY GAPS STILL OPEN/.test(AIO_PM_STATUS.security)) out.push('privacy gaps are not resolved here');
  if (AIO_PM_ISSUES.map((i) => i.id).join('') !== 'ABCDEFGH') out.push('issues A–H each verified');
  for (const i of AIO_PM_ISSUES) if (!AIO_PM_COMPOSER_TASKS.some((t) => t.id === i.task)) out.push(`issue ${i.id} has a Composer task`);
  for (const r of AIO_PM_INVENTORY) if (!r.classes.length || !r.test || !r.evidence) out.push(`${r.id}: classification, test and evidence`);
  if (new Set(AIO_PM_INVENTORY.map((r) => r.id)).size !== AIO_PM_INVENTORY.length) out.push('inventory ids are unique');
  if (AIO_PM_RELEASE.map((s) => s.stage).join() !== '01,02,03,04,05,06,07,08,09') out.push('release stages 01–09');
  if (Number(E.qa.fail) !== 0) out.push('QA failures recorded');
  if (E.qa.sizes.join() !== 's360,phone,tablet,tabletL,desktop,wide') out.push('QA ran at the required sizes');
  if (Number(E.legacy.routes) < 40 || Number(E.legacy.renders) !== Number(E.legacy.routes) * 5) out.push('the current app was rendered at five sizes');
  const home = E.scroll.find((p) => p.path === '/');
  if (!home || home.after.desktop >= home.before.desktop) out.push('the desktop homepage is shorter');
  const svc = E.scroll.find((p) => p.path === '/services');
  if (!svc || svc.after.phone >= svc.before.phone) out.push('the services page is shorter on the phone');
  if (/\$\s?\d/.test(JSON.stringify([AIO_PM_DESIGN, AIO_PM_ASSETS, AIO_PM_ROUTES]))) out.push('no price in the design record');
  if (!/^https:\/\/claude\.ai\/artifact\//.test(AIO_PM_LINKS.review)) out.push('review link');
  return out;
}
