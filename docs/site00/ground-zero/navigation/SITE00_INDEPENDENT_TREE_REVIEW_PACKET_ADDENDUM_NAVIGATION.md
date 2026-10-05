# SITE 00 — Independent Tree Review Packet · Addendum: Navigation, Spatial Shell & Control

This addendum goes with `../SITE00_INDEPENDENT_TREE_REVIEW_PACKET.md`. It adds evidence that the first packet covered too thinly: how people move through SITE 00, plus the CONTROL ROOM and SITES material. The machine-readable twin, `SITE00_INDEPENDENT_TREE_REVIEW_PACKET_ADDENDUM_NAVIGATION.json`, carries every item with its file:line reference.

**Repo:** yoteenz/SITE00 `main` @ `2ac4059`.

**Runtime:** RUNTIME_VERIFICATION_BLOCKED — npm registry is blocked in this environment, so no dev server; every finding is code evidence (file:line). Items tagged CONFIRM_LIVE in evidence/ need a live pass.

Parts A–C are facts and constraints. Part D is Opus's opinion, so please form your own view before reading it.

---
# PART A — FACTS

## A1. Spatial entry / exit systems

| System | Kind | Trigger / route | Evidence |
|---|---|---|---|
| ORIGIN (arrival point "YOU ARE AT 00.00 ORIGIN POINT") | SPATIAL_ARRIVAL | /, /origin |  |
| SWIPE-UP (Origin mobile) | GESTURE_PORTAL | vertical swipe ≥56px ±40° on Origin mobile, or SWIPE UP button | src/site00/hooks/useSwipeUp.ts:15-33; useOriginLocationsTransition.ts:7-35; OriginMobileSwipeUp.tsx:32-47 |
| LOCATIONS directory (mobile) | DIRECTORY_PLACE | /origin/locations | mobile-only; ≥768px redirects to /origin (LocationsPage.tsx:37-39) |
| ENTER 00 (portal action) | SPATIAL_PORTAL | "ENTER 00" header toggle (EntryToggle.tsx:27-36) · "ENTER SITE 00" link on Origin mobile (OriginMobileSwipeUp.tsx:37) | → /enter (WAITING ROOM) |
| WAITING ROOM (/enter directory) | DIRECTORY_PLACE | /enter | environment ENTER_00_WAITING_ROOM (environments.ts:92-103,121); location label "LOCATION / ENTER 00" |
| EXIT 00 (inverse portal) | SPATIAL_PORTAL | EntryToggle on /enter · DirectoryExitButton on LOCATIONS · design workspace sidebar | → /origin (fixed target, push), design workspace → / |
| World cold-start / loader gates | TRANSITION |  | Site00WorldColdStartGate, AsstsColdStartGate, route loading fallback |

## A2. ENTER 00 / WAITING ROOM destinations (`/enter`)

| Label | Destination | Auth | Status |
|---|---|---|---|
| 01 SITES | /sites | public | OK |
| 02 SERVICES | /services | public | OK |
| 03 SYSTEM | /system | public | OK |
| 04 ABOUT | /about | public | OK |
| 05 JOURNAL | /journal | public | OK |
| BLDR STUDIO | /bldr | public | OK |
| PROJECTS | /projects (signed-out: /origin/sign-in?returnTo=%2Fprojects) | requiresAuth (localStorage flag) + Site00AccountRouteGuard | OK |
| ACCOUNT | /control (CTRL ROOM) (signed-out: sign-in?returnTo=/control) | requiresAuth + Site00AccountRouteGuard | OK |
| SUPPORT | /support | public | OK |

**Swipe-up:** navigate('/origin/locations', {state:{fromSwipe:true}}) after 720ms overlay (useOriginLocationsTransition.ts:7,21,31-32); immediate when prefers-reduced-motion (useSwipeUp.ts:98-101; useOriginLocationsTransition.ts:26-29).

The swipe opens LOCATIONS, not ENTER 00.

## A3. LOCATIONS destinations (`/origin/locations`, mobile only; redirects to `/origin` at 768px and wider)

| Label | Destination | Auth | Status |
|---|---|---|---|
| 01 BLDR | site00MobileBuildNavHref -> /bldr (or bldr state/assessment if already there) | public | OK |
| 02 EVOLVE | site00MobileEvolveNavHref -> /evolve | public | OK |
| 03 SITES | /sites | public | OK |
| 04 SERVICES | /services | public | OK |
| 05 SYSTEM | /system | public | OK |
| 06 ABOUT | /about | public | OK |
| 07 JOURNAL | /journal | public | OK |
| 08 IDNTY | /idnty | public | OK |
| 09 CTRL ROOM | /control | requiresAuth | OK |
| 10 PROJECTS | /projects | requiresAuth | OK |
| 11 MY SITES | /control/sites | requiresAuth | OK |

## A4. EXIT 00 render sites

| Where | Context | Destination |
|---|---|---|
| `src/site00/components/shell/EntryToggle.tsx:14-25` | /enter only (pathname === '/enter'), header right slot of Site00AppShell; aria-label 'EXIT SITE 00 INTERIOR'; same FastTravel icon as ENTER 00 | /origin (Link push) |
| `src/site00/components/locations/DirectoryExitButton.tsx:5-15 via Site00MobileHeader.tsx:25-26` | Site00MobileShell when headerVariant='directory' or pathname startsWith /origin/locations (Site00MobileShell.tsx:47-48) => LOCATIONS page; replaces the FAST TRAVEL trigger and FastTravelPanel is not mounted (:63-69); aria-label 'EXIT DIRECTORY AND RETURN TO ORIGIN'; mobile gray color (MEMORY.md:736-739) | /origin (Link push) |
| `src/site00/components/designWorkspace/Site00DesignWorkspaceShell.tsx:139-141` | Internal DESIGN RECONSTRUCTION workspace sidebar footer (StudioWorldDesignWorkspace -> /production/site00/design behind Site00InternalProductionGuard, Site00Routes.tsx:1230-1240); desktop sidebar only, not in mobile top bar | '/' (Link push) — Origin only when VITE_SITE00_ROOT=1 (Site00Routes.tsx:540-560); otherwise '/' is not SITE 00 |

## A5. FAST TRAVEL

- **Destinations:** 20 unique destinations, defined across 11 page profiles.
- **Classification:** GLOBAL_DESTINATION_SWITCHER (contextual, mobile-only, route-curated shortcut overlay)
- **Appears in:** Public mobile shell (Site00PublicShell -> Site00MobileShell): /sites /services /system /about /journal /support /idnty(signed-out) /bldr /bldr/state /bldr/templates /evolve /evolve/* marketing+pricing, /idnty/sign-in-security, /project/:slug/provisioning, intake guest access, Workflow mobile shells: IDNTY/BLDR/EVOLVE state + assessment (IdntyAssessmentShell, BldrAssessmentShell, EvolveAssessmentShell, BldrIntakeShell, BldrStartPage, Idnty/EvolveStatePage), existing-location entry/case, Auth shell mobile: /origin/sign-in, /origin/create-account, Credential access mobile: /access/:code, CTRL ROOM / account ecosystem mobile: /control/*, /account/intakes*, /idnty (signed-in), /projects (non-admin), /projects/:slug/* module pages (non-NDX), STUDIO shell /studio/:slug/*
- **Absent from:** ORIGIN '/' and '/origin' (header hidden on mobile), /origin/locations (EXIT 00 variant), /enter (desktop-forced), Production workspace /production/* (own chrome; ProductionAuthorityFrame portal + body lock), Client app /app/* (Site00ClientAppShell), Client project room /client/projects/* (ClientProjectRoomShell), Admin /admin/site00/* (Site00AdminShell), ASSTS /assts/*, Design workspace /studio-world/design (Site00DesignWorkspaceShell), NDXBOOK founder workspace /projects/ndxbook* (suppressSiteChrome), Founder mobile /projects + personal project overview (PwFrame covers), JURNL runtime /production/:slug/runtime/*, All desktop/tablet surfaces

## A6. Global navigation systems

| ID | Name | Users | Status |
|---|---|---|---|
| NAV-01 | Public desktop header (Site00AppShell: logo + GlobalNav + EntryToggle) | ANON | RENDERED |
| NAV-02 | Origin status strip + mobile swipe-up | ANON | PARTIAL |
| NAV-03 | ENTER 00 directory (WAITING ROOM) | ANON/CLIENT | RENDERED |
| NAV-04 | Mobile header (Site00MobileHeader) | ANON/CLIENT/FOUNDER | RENDERED |
| NAV-05 | FAST TRAVEL contextual overlay | ANON/CLIENT (no role split) | RENDERED |
| NAV-06 | Mobile bottom nav (MobileSiteNavigation / MOBILE_SITE_NAV) | ANON/CLIENT/FOUNDER | RENDERED |
| NAV-07 | LOCATIONS directory page | ANON/CLIENT | RENDERED |
| NAV-08 | Public mobile footer | ANON | RENDERED |
| NAV-09 | Auth shell (sign-in/create-account) desktop brand rail + mobile header | ANON | RENDERED |
| NAV-10 | Operating World top nav (account/CTRL ROOM desktop) | CLIENT/FOUNDER/PREVIEW_GUEST | RENDERED |
| NAV-11 | Ecosystem mobile shell chrome (header+FT+MOBILE_SITE_NAV) + CTRL sign-out bar | CLIENT/FOUNDER | RENDERED |
| NAV-12 | CTRL ROOM mobile command cells | CLIENT/FOUNDER | RENDERED |
| NAV-13 | Client app shell (/app/projects/:slug/*) | CLIENT (PROJECT_SCOPED) | PARTIAL |
| NAV-14 | Client project room shell (/client/projects/:slug/*) | CLIENT (PROJECT_SCOPED) | PARTIAL |
| NAV-15 | STUDIO shell (/studio/:slug/*) | FOUNDER/CLIENT/PREVIEW_GUEST | RENDERED |
| NAV-16 | Production authority chrome (header + bottom/host nav) | FOUNDER/INTERNAL | RENDERED |
| NAV-17 | Production Hub machine view (?view=machine/panel/node/scene) | FOUNDER/INTERNAL | RENDERED |
| NAV-18 | PwFrame projects variant (founder mobile /projects) | FOUNDER | RENDERED |
| NAV-19 | Admin 00/CONTROL shell (/admin/site00/*) | FOUNDER/INTERNAL | RENDERED |
| NAV-20 | ASSTS vault nav | INTERNAL | RENDERED |
| NAV-21 | Design workspace shell (/studio-world/design) | FOUNDER/INTERNAL | RENDERED |
| NAV-22 | NDXBOOK founder workspace (/projects/ndxbook*) | FOUNDER (PROJECT_SCOPED) | RENDERED |
| NAV-23 | Project operating shell module nav (/projects/:slug/<module>) | FOUNDER/CLIENT (PROJECT_SCOPED) | RENDERED |
| NAV-24 | JURNL runtime product nav (/production/:slug/runtime/*) | PROJECT_SCOPED (end-user runtime) | RENDERED |
| NAV-25 | Public top nav (Site00PublicTopNav) | ANON/CLIENT | DEAD_CODE |
| NAV-26 | Mobile menu drawer (Site00MobileMenuDrawer) | ANON/CLIENT | DEAD_CODE |
| NAV-27 | CTRL ROOM sidebar / ECOSYSTEM_MOBILE_NAV / Site00PublicSidebar / EcosystemSidebar | CLIENT | DEAD_CODE |

## A7. Material non-route surfaces

| ID | Name | Type | Status |
|---|---|---|---|
| NRS-01 | Fast Travel panel | FAST_TRAVEL | RENDERED |
| NRS-02 | Site00WorldColdStartGate cinematic loader | TRANSITION | RENDERED |
| NRS-03 | AsstsColdStartGate | TRANSITION | RENDERED |
| NRS-04 | Route loading fallback (Site00Suspense -> ReferenceShellSuspenseFallback) | TRANSITION | RENDERED |
| NRS-05 | Origin swipe-up -> LOCATIONS transition overlay | GESTURE/TRANSITION | RENDERED |
| NRS-06 | Origin expanded panels (IDNTY/BLDR/EVOLVE) + backdrop | OVERLAY | RENDERED |
| NRS-07 | Layout preview switches (Origin/Public/Ecosystem Mobile|Desktop) | CONTEXT_SWITCHER | DEAD_CODE |
| NRS-08 | Preview device mode (mobile/desktop) resolver | CONTEXT_SWITCHER | RENDERED |
| NRS-09 | Desktop/Mobile artboard presentation shells | CONTEXT_SWITCHER | RENDERED |
| NRS-10 | Signed-in vs public split of /idnty and /sites | CONTEXT_SWITCHER | RENDERED |
| NRS-11 | Experience context bar (ADMIN CONTROL CENTER ↔ CLIENT EXPERIENCE, CLIENT QA toggle) | CONTEXT_SWITCHER | RENDERED |
| NRS-12 | VIEW AS FOUNDER/CLIENT toggle + ClientSimulationSelector popover | CONTEXT_SWITCHER | RENDERED |
| NRS-13 | Production project switcher (header PROJECT chip) | PROJECT_SWITCHER | RENDERED |
| NRS-14 | Production MENU panel | MENU | RENDERED |
| NRS-15 | Production Hub overlays (Scene selector, Lightbox, Decision, Project/Production selector, Attention, HubMenu) | MODAL | RENDERED |
| NRS-16 | Production Hub project/production selector | PROJECT_SWITCHER | RENDERED |
| NRS-17 | INBOX sheets (revision, approve confirm, filter/sort, attachment preview) | SHEET | RENDERED |
| NRS-18 | ProductionAuthorityFrame / PwFrame / ProductionChromeOverlay / CharacterFabrication portals | PORTAL | RENDERED |
| NRS-19 | Admin ⌘K search modal | MODAL | RENDERED |
| NRS-20 | Admin mobile <details> 00/CONTROL menu | MENU | RENDERED |
| NRS-21 | Admin orchestration ProjectSwitcher (<select>) | PROJECT_SWITCHER | RENDERED |
| NRS-22 | Design workspace project selector popover | PROJECT_SWITCHER | RENDERED |
| NRS-23 | Design workspace notifications + overflow menus | MENU | RENDERED |
| NRS-24 | NDX founder project menu + notification center (FounderWorkspacePopoverSurface portal) | MENU/PORTAL | RENDERED |
| NRS-25 | Project module switcher dropdown | PROJECT_SWITCHER(module) | RENDERED |
| NRS-26 | Project actions sheet + toast | SHEET/GLOBAL_INTERACTION | RENDERED |
| NRS-28 | Astral world overlays/drawers (Who's Here, Take Me Somewhere, AstralDrawer) | OVERLAY/DRAWER | RENDERED |
| NRS-29 | JURNL runtime drawers/sheets/modals/handoffs + toast | DRAWER/SHEET/MODAL/GLOBAL_INTERACTION | RENDERED |
| NRS-36 | Client app / project room notification bell + more | MENU (stub) | PARTIAL |
| NRS-X1 | ENTER 00 portal control (header toggle + Origin mobile link) | GLOBAL_INTERACTION/PORTAL | RENDERED |
| NRS-X2 | EXIT 00 control | GLOBAL_INTERACTION/PORTAL | RENDERED |
| NRS-X3 | Swipe-up gesture surface (Origin mobile) | GESTURE | RENDERED |
| NRS-X4 | Mobile bottom-nav centre bay (LOCATIONS) | GLOBAL_INTERACTION | RENDERED |
| NRS-X5 | Client app MENU drawer (stub) | DRAWER | PLACEHOLDER |

## A8. How "control" names are used in code

- **CTRL ROOM** — `src/site00/config/ctrl-room-nav.ts:2`: Doc comment: 'customer-facing account environment for SITE 00' — the /control/* client area (OVERVIEW/SITES/DOMAINS/BILLING/TEAM/SETTINGS/SECURITY).
- **CTRL ROOM** — `src/site00/config/ecosystem-nav.ts:19`: First item of OPERATING_WORLD_TOP_NAV (client top nav) -> /control. Same nav also lists PROJECTS, INTAKES, SITES, STUDIO(/admin), APPROVALS(/admin), ACCESS(/control/security), BILLING(/control/billing) — mixes account, project-management and operator links in one bar.
- **CTRL ROOM** — `src/site00/config/ctrl-room-mobile.ts:5`: 'CTRL ROOM / COMMAND CENTER — WHAT NEEDS MY ATTENTION? MONITOR YOUR PROPERTIES, PROJECTS, ACCESS, AND ACCOUNT ACTIVITY.' — framed as a command center, not account settings.
- **CTRL ROOM** — `src/site00/hooks/useCtrlRoomData.ts:69,77 + :108`: Activity 'system' label for sign_in/sign_out; hook doc 'CTRL ROOM command center data'.
- **CTRL ROOM** — `src/site00/admin/config/nav.ts:24,38 + src/site00/admin/pages/operations/CtrlRoomPage.tsx (title '[ CTRL ROOM ]')`: SAME NAME reused for the operator 'ADMIN ATTENTION CENTER' at /admin/site00/ctrl-room (blockers/approvals/leads/discovery/overdue invoices). Name collision with client CTRL ROOM. (SITE00_ADMIN_NAV is legacy; current shell uses CONTROL_OPERATOR_NAV which does not list it, so it is reachable by URL only.)
- **CTRL ROOM** — `motherboard/CORE.md:127,134`: Canon: 'CTRL ROOM — Customer account-level command center' (/control); distinct from 00 / CONTROL and Studio.
- **CTRL ROOM** — `src/site00/components/auth/Site00AuthIntro.tsx:13; shell/Site00PublicTopNav.tsx:53; shell/Site00PublicSidebar.tsx:55; evolve-assessment/EvolveAssessmentShell.tsx:135`: Public CTA: 'ACCESS YOUR CTRL ROOM' / 'ENTER CTRL ROOM' = sign-in destination.
- **CONTROL ROOM** — `src/site00/pages/complex/AccountPage.tsx:16`: Hub card 'CONTROL ROOM — ACCOUNT SETTINGS AND TEAM MANAGEMENT' -> /control. Closest to founder's intended meaning.
- **CONTROL ROOM** — `src/site00/config/seed/site00-page-seed.ts:100,112`: 'MANAGE SITES, DOMAINS, AND ACCOUNT SETTINGS' -> /control.
- **CONTROL ROOM** — `src/site00/pages/control/EvolveOperationsPage.tsx:35; components/control/evolveOperations/EvolveOperationsCard.tsx:5`: 'Founder Control Room summary card' — founder operations intelligence embedded inside the client-facing /control overview (conflates founder ops with client account room).
- **CONTROL ROOM / CONTROL_ROOM** — `src/site00/components/designWorkspace/useDesignSkinsState.ts:48; brandFamilySkin/ExperienceSkinManagementPanel.tsx:57; shared/site00-brand-lore/projectSkin/brandFamily/screenSlotConfig.ts:62`: Design-skin screen slot '08 CONTROL ROOM' — a project skin screen type (per-project account screen), not the SITE 00 host room.
- **CONTROL ROOM** — `shared/site00-marketing/creativeIntake/copySystem.ts:23`: Marketing copy environment label 'THE CONTROL ROOM'.
- **00 / CONTROL** — `motherboard/CORE.md:125-140; src/site00/admin/components/shell/Site00AdminShell.tsx:121-149; admin/components/control/ControlPageHeader.tsx:10; ControlCommandHero.tsx:21`: Internal operator environment /admin/site00/* ('OPERATOR ENVIRONMENT', V2.0.0) — monitor/approve/intervene/launch. Effectively founder business operations + project management + infra.
- **00 / CONTROL** — `src/site00/components/control/CtrlRoomSidebar.tsx:49; pages/control/ControlSectionPage.tsx:20-26`: Admin-only link from client CTRL ROOM into operator env; ControlSectionPage /control/settings shows '00 / CONTROL · OPERATOR' block for admins.
- **CONTROL ENVIRONMENT** — `src/site00/components/ecosystem/OperatingWorldTopNav.tsx:30`: Env label on the client operating-world top nav.
- **CONTROL (route ns)** — `src/site00/config/routes.ts:61-68`: /control, /control/sites, /domains, /billing, /team, /settings, /security, /evolve-operations.
- **control plane** — `supabase/migrations/20260826123000_site00_design_control_plane_bridge.sql:1-2`: 'Cross-repo design control plane (SITE 00 <-> FSBW handoff). SITE 00 owns design intent; FSBW owns source code; Supabase is shared control plane.' Tables site00_managed_projects, site00_repo_bindings, etc.
- **control plane** — `shared/site00-design-control-plane/{designControlPlane.ts:2,384, constants.ts:2, types.ts, client.ts}; api/site00/design-control-plane.ts (actions prepare_repo_change, approve_for_source_repo, publish_runtime_binding, record_receipt, check_source_divergence); server/routes.ts:41,105; src/site00/components/designWorkspace/DesignRepoChangePanel.tsx:86,119`: The ONLY 'control plane' in code = design/repo change bridge (Site00DesignControlPlane). Store mode defaults to 'memory' (designControlPlane.ts:48). It is infra in the founder's sense but narrowly scoped; no general 'SITE 00 control plane' module exists.
- **control plane** — `motherboard/MEMORY.md:5523-5531; docs/design-workspace/DESIGN-PRODUCTION1R1-PERSISTENCE-AUDIT.md; docs/audits/SITE00_PROJECT_INGESTION_READINESS_AUDIT.md; studio-world visualReconstruction p0vr3m/p0vr8r2`: References to the P0.BRIDGE.1 design control plane only.

## A9. Control-related surfaces, classified

| Route | Classification | Status |
|---|---|---|
| `/control` | MIXED: CLIENT_CONTROL_ROOM (plan/billing/domains intent) + PROJECT_MANAGEMENT (project signals -> ENTER STUDIO) + OPERATIONS (founder EVOLVE ops fixtures leak) | LIVE-PARTIAL; semantic violation (project mgmt + founder ops inside control room) |
| `/control/sites` | SITES (client) — belongs to client's site/property surface; currently placed under CONTROL ROOM namespace | PLACEHOLDER (fake data presented as real) |
| `/control/domains, /control/billing, /control/team, /control/settings, /control/security` | CLIENT_CONTROL_ROOM (intended) — stub | STUB |
| `/control/evolve-operations` | OPERATIONS (founder business ops intelligence) — misplaced under client /control | PROTOTYPE; access-scope defect |
| `/account` | CLIENT_CONTROL_ROOM (entry hub) | PLACEHOLDER |
| `/account/intakes, /account/intakes/:intakeType/:intakeId` | PROJECT_MANAGEMENT (pre-project intake records) living under /account | LIVE |
| `/idnty/sign-in-security` | CLIENT_CONTROL_ROOM (security) | READ-ONLY STUB |
| `(no route) profile edit` | CLIENT_CONTROL_ROOM (missing UI) | MISSING UI; password reset email links /account/settings which has no route (navigation.json broken_links) |
| `/admin/site00` | OPERATIONS + PROJECT_MANAGEMENT | LIVE |
| `/admin/site00/ctrl-room` | OPERATIONS (business + project attention monitor) — misnamed 'CTRL ROOM' | LIVE; orphan from current CONTROL_OPERATOR_NAV (only in legacy SITE00_ADMIN_NAV) |
| `/admin/site00/settings (+ /settings/studio/automation renders same SettingsPage)` | FOUNDER_CONTROL_ROOM (intended: system/personal settings) — stub | STUB; automation route is a self-loop |
| `/admin/site00/finance, /admin/site00/finance/invoices/:id` | OPERATIONS (commercial admin; candidate FOUNDER_CONTROL_ROOM commercial section) | LIVE-DEMO |
| `/admin/site00/team` | FOUNDER_CONTROL_ROOM (team/access) / OPERATIONS | LIVE-DERIVED |
| `/admin/site00/access-credentials, /:id` | CONTROL_PLANE_INFRA management surface (identity/access) — operations | LIVE |
| `/admin/site00/evolve/connections` | CONTROL_PLANE_INFRA management surface (provider connections) | LIVE |
| `/admin/site00/orchestration/:orgSlug/evolve/connections` | CONTROL_PLANE_INFRA management (per org/project) — arguably PROJECT_MANAGEMENT scope | LIVE |
| `/projects/:projectSlug/connections` | PROJECT_MANAGEMENT | EXISTS |
| `/projects/:projectSlug/notifications` | PROJECT_MANAGEMENT (notifications per project) | NON-PERSISTENT |
| `/admin/site00/sites, /admin/site00/sites/:id` | OPERATIONS / CONTROL_PLANE_INFRA (site registry) | LIVE-DEMO |
| `OperatingWorldTopNav (all EcosystemShell pages)` | NAV mixing CLIENT_CONTROL_ROOM + PROJECT_MANAGEMENT + OPERATIONS | LIVE; semantically mixed |
| `/admin/site00/existing-location (constant only)` | OPERATIONS (commercial) — management UI missing | API-ONLY |

## A10. Infrastructure services (control plane)

| Service | Live? |
|---|---|
| auth / identity | YES (JWT real) |
| project registry | YES but fragmented |
| client registry (identities) | YES (with demo seed when empty) |
| membership | NO |
| permissions | PARTIAL |
| firewall | UI-PARTIAL |
| review engine | YES |
| approval engine | YES (admin side) |
| project graph (PCI route graph) | CODE-ONLY (computed; no persisted graph table) |
| cost engine | PARTIAL / filesystem + docs |
| funding | NO |
| discount / promotion engine | PARTIAL (logic real; persistence memory-only) |
| provider connection engine | YES (EVOLVE OAuth); project service_connections state-only |
| notification engine (email registry) | RENDER-ONLY |
| project lifecycle | YES (pre-launch) |
| orchestration | YES (Supabase canonical; memory when ORCHESTRATION_USE_MEMORY=1/VITEST) |
| studio world adapter | CONFIG-DEPENDENT (throws in production without live config) |
| design control plane (the only code 'control plane') | PARTIAL (store defaults to memory) |

## A11. Sites and projects in code

- **Public `/sites`:** Portfolio grid from SITE00_PORTFOLIO_SEED which is [] (src/site00/config/seed/site00-page-seed.ts:15) -> always shows 'NO PUBLISHED PROJECTS YET'. Filters labelled ALL PROJECTS / COMPLETED / IN PROGRESS (conflates sites with projects). Card link /sites/:id has no route (latent broken link). CTA 'START A PROJECT' -> /bldr. Signed-in users are redirected to /control/sites.
- **Client sites:** SPLIT: /control/sites list = hardcoded seed (jordancole.studio, northquarter.co, futurearchives.io..., fake team Jordan Cole/Taylor Morgan) shown identically to every user. /control overview sites panel + counts = REAL site00_sites rows where identity_id = site00_identities.id for the user's email (limit 8), status mapped LIVE/PUBLISHED->ACTIVE. The two screens can therefore disagree.
- **Project status values:** ACTIVE, PRE_INGESTION, ORIGIN_INGESTED, IDENTITY_IN_PROGRESS, IDENTITY_COMPLETE, INGESTION, PRODUCTION, ARCHIVED (no LAUNCHED/LIVE/MAINTENANCE/POST_LAUNCH/DELETED)

## A12. Navigation grammar today

| Action | Today |
|---|---|
| ENTER SITE 00 | Arrive at ORIGIN (/). Mobile: "ENTER SITE 00" link → WAITING ROOM; swipe-up → LOCATIONS. Desktop: ENTER 00 toggle → WAITING ROOM. |
| MOVE | Public header (desktop) / bottom nav (mobile) / FAST TRAVEL (mobile only) / WAITING ROOM / LOCATIONS; no history BACK. |
| FAST-TRAVEL | Mobile header icon; route-curated shortcuts; never on Origin/LOCATIONS/ENTER 00/production/client app/admin. |
| OPEN ENTER 00 | ENTER 00 toggle (desktop header) · ENTER SITE 00 (Origin mobile) → /enter. |
| REACH CONTROL ROOM | ACCOUNT (WAITING ROOM) / CTRL ROOM (bottom nav, FAST TRAVEL, Operating World nav) → /control (a command center, not settings). |
| SELECT PROJECT | 6 switchers, 4 storage mechanisms; client app/project room/FAST TRAVEL have none; production switch from global tabs lands on DESIGN. |
| SELECT SITE | No site switcher; SITES is a link (/sites public empty; /control/sites seed). |
| ENTER PRODUCTION | Operating World top nav PRODUCTION (admin) → /production; CONTROL "PRODUCTION" → /admin/site00/studio. |
| CLIENT ENTERS PROJECT ROOM | Only via review links to /client/projects or direct /app; CTRL ROOM links to none. |
| EXIT | EXIT 00 → /origin from WAITING ROOM/LOCATIONS; design workspace EXIT 00 → /; client SIGN OUT does not sign out. |

## A13. What each kind of user can reach today

| User | global nav | enter00 | fast travel | control room | project | site | production | exit |
|---|---|---|---|---|---|---|---|---|
| ANONYMOUS | public header (desktop) · mobile header + bottom nav | EXPLORE 01–05 + YOUR SPACE items locked (sign-in returnTo) | page profiles; CTRL ROOM/PROJECTS variants unreachable (guard redirects first) | → sign in | none | /sites (empty) | none | EXIT 00 → ORIGIN |
| SIGNED_IN_CLIENT | Operating World top nav (shows admin STUDIO/APPROVALS that bounce) · mobile ecosystem chrome | same items unlocked (lock styling only) | signed-in profiles (CTRL ROOM, PROJECTS, MY SITES, BILLING, SETTINGS) | /control (command center; founder ops card leaks) | /projects (FOUNDER view hard-coded) · /client/projects via review links · /app direct | /control/sites (seed data) | none (bounced) | EXIT 00; SIGN OUT link does not sign out |
| FOUNDER | as client + PRODUCTION; production 7-tab nav; operations console nav | same as client (no founder variant) | same as client (role-blind); absent in production/admin | no founder control room (static settings, env team) | production switcher (lands on DESIGN; global tabs = ndxbook) · admin switcher (full reload) | /admin/site00/sites (demo) | /production | EXIT 00 (public); design workspace EXIT 00 → / |
| INTERNAL_PRODUCTION_USER | identical to founder (no role model — admin = email allowlist) | n/a | n/a | n/a | as founder | as founder | as founder | as founder |
| PROJECT_SCOPED_USER | client app shell (HOME/PROJECTS/REVIEWS/INBOX/PROFILE) or web room nav | n/a inside project shells | absent | via profile → /control | no switcher | none | none | no EXIT PROJECT in client app |

---
# PART B — PROBLEMS

- **dead_fast_travel_destinations:** 6
  - ORIGIN profile (8 links) unreachable — fast-travel.ts:371-396
  - CTRL ROOM signed-out SIGN IN unreachable — fast-travel.ts:314-322
  - PROJECTS signed-out locked cards unreachable — fast-travel.ts:357-358
  - CONTINUE BUILD self-link — fast-travel.ts:236
  - BILLING/SETTINGS -> stub ControlSectionPage — fast-travel.ts:337-338
  - VIEW/EXPLORE SITES redirect to /control/sites when signed in — SitesPortfolioPage.tsx:25
- **duplicate_menu_items:** 7
  - FT BLDR hub: CONTINUE BUILD (/bldr self) == BUILD INVESTMENT GUIDE (/bldr) — fast-travel.ts:236,244
  - FT signed-in: VIEW SITES (-> /control/sites) duplicates MY SITES
  - CTRL ROOM mobile: PLAN and BILLING both /control/billing — ctrl-room-mobile.ts:55-87
  - NDX menu: INSPECT and EXPERIMENTS HUB both site00ProjectExperimentsPath — ndxFounderWorkspaceIcons.ts:74,84
  - Production: chrome MENU (HUB/INBOX/CONTROL) duplicates bottom nav HUB/INBOX — chrome.tsx:186-195
  - Production 'ACTIVITY' in PwFrame NAV_PRODUCTION -> /production?panel=activity vs nav.tsx -> /production/activity (two destinations, same label) — PwFrame.tsx:34; nav.tsx:22-23
  - Two 'PRODUCTION' destinations: Operating nav -> /production; admin control nav 'PRODUCTION' -> /admin/site00/studio — ecosystem-nav.ts:21; control-nav.ts
- **broken_project_switches:** 5
  - Production chip on HUB/INBOX/LIBRARY/ACTIVITY always routes to /design of new project (loses workspace) — projectHostProfile.ts:49-50
  - Global production pages hard-code 'ndxbook' as current project, so switcher shows NDXBOOK there regardless of prior selection — chrome.tsx:58-64
  - Hub machine selector not URL-synced — ProductionHub.tsx:567-577
  - Design selector not URL-synced — StudioWorldDesignWorkspace.tsx:326-340
  - Admin ProjectSwitcher hard reload — ProjectSwitcher.tsx:22-28
- **broken_site_links:** 7
  - /brand/privacy, /brand/terms (footer) — no route — Site00PageFooter.tsx:9-10
  - /brand/terms (PRIVACY label), /brand/contact — Site00AuthShell.tsx:96-98
  - /help — NDX founder menu — ndxFounderWorkspaceIcons.ts:75
  - Design workspace nav: /blueprints /guide /sound /faq /contact /account -> COMPOSER_DRAFT redirect to '/' — p0vr2b/constants.ts:33-40; Site00DesignWorkspaceShell.tsx:136
  - Design workspace EXIT 00 -> '/' (not /origin; '/' only renders Origin when VITE_SITE00_ROOT=1) — Site00DesignWorkspaceShell.tsx:139
  - OperatingWorldTopNav STUDIO/APPROVALS for non-admin -> AdminGuard -> /control — ecosystem-nav.ts:24-25
  - Client app + client room bell/more buttons have no handlers
- **context_loss_bugs:** 8
  - FT auth context from localStorage flag, not session — stale 'true' after token expiry shows unlocked CTRL ROOM then guard bounces (useSignedInFromStorage.ts:11; Site00AccountRouteGuard.tsx:276-277)
  - FT navigateAndClose replaceState(null,'') wipes router history state for the overlay entry (FastTravelPanel.tsx:42-51) — PLAUSIBLE extra back step
  - Origin expanded panel state not URL-encoded
  - ProjectViewModeProvider re-instantiated per page — view-as-client simulation lost between /projects and /projects/:slug
  - PwFrame portal (z 1200) covers still-mounted EcosystemShell mobile chrome incl. FT trigger for founder mobile /projects
  - Preview device mode decided at mount; resizing across 768px does not switch shell family (Site00Context.tsx:51-56)
  - Production /queue,/libraries,/activity reset project to ndxbook
  - Desktop operating world has no link back to public world (logo -> /control)

---
# PART C — NEW FOUNDER CONSTRAINTS

- CONTROL PLANE ≠ CONTROL ROOM
- FOUNDER CONTROL ROOM and CLIENT CONTROL ROOM are account/profile/settings (+ founder commercial admin)
- Project management is not inside a control room
- SITES ≠ PROJECTS; LAUNCHED ≠ DELETED
- No route ≠ not a product surface
- MENU = WAITING ROOM (stated by founder; not yet recorded in repo)

---
# PART D — OPUS CORRECTIONS (opinion)

**Under-modeled in the first packet**

- **FAST TRAVEL** — a contextual global overlay with 11 page profiles, 20 destinations, mobile-only, role-blind — a first-class layer-B system
- **ENTER 00 / WAITING ROOM / LOCATIONS** — a spatial entry system (layer C): ORIGIN → SWIPE-UP/ENTER 00 → WAITING ROOM (mobile composition = LOCATIONS) → EXIT 00
- **SWIPE-UP** — gesture portal to LOCATIONS (not ENTER 00); accessible button alternative exists
- **EXIT 00** — inverse spatial portal with 3 render sites and one conflicting meaning (design workspace)
- **Project switchers** — 6 switchers with 4 storage mechanisms and broken landing behaviour
- **Context switchers / transitions** — 9 context switchers (3 never render) + cold-start/loader transitions
- **Non-route surfaces** — 43 inventoried (34 material)

**Missing from the first packet**

- FOUNDER CONTROL ROOM (account/profile/security/notifications/defaults/commercial)
- Client CONTROL ROOM as account/settings (distinct from project management)
- CONTROL PLANE as an infrastructure layer (vs "system capabilities" list)
- Commercial adjustments (discount/promotion/credits/waivers) engine + management surface
- CLIENT SITES (MY SITES) with site actions
- Project post-launch lifecycle (LAUNCHED/MAINTENANCE/EVOLVE/PAUSED)
- Site ↔ project linkage rules
- LOG OUT / EXIT PROJECT distinctions

**Flattened incorrectly**

- **11 peer families** — Families mixed different kinds of thing: page families (IDNTY), app shells (CLIENT APP), infrastructure (system capabilities), container layers (PROJECT RUNTIMES), machinery (STUDIO OS LAB) and spatial systems (not modeled). Experience tree now uses layers A–J.
- **ACCESS & CTRL ROOM** — Bundled auth entry + account settings + MY PROJECTS + MY INTAKES + MY SITES. Founder rule: control room ≠ project management. Split: ACCESS (entry) · CLIENT CONTROL ROOM (account) · YOUR SPACE (projects, sites, intakes).
- **00 / CONTROL** — Treated as one operator family; it mixes FOUNDER CONTROL ROOM concerns (settings, commercial, team, provider connections), project management (registry, provisioning, reviews) and business operations.
- **SYSTEM CAPABILITIES** — Correct idea, wrong framing: it is the CONTROL PLANE (founder term); code's "control plane" means something narrower (design handoff bridge).
- **PROJECT RUNTIMES** — Listed as a family; evidence shows it is a platform container layer that mounts project outputs into production preview and client live review.
- **STUDIO OS LAB** — Renamed the locked ontology; STUDIO OS is the root (machinery); LAB is its internal surface.
- **SITES** — Only a public showcase node; sites also have a client variant and a lifecycle independent of projects.

**Earlier changes to reconsider**

| Change | What it proposed | Reconsider |
|---|---|---|
| TC010 | ADD CTRL.PROJECTS (/control/projects) | Project list must not live in CONTROL ROOM → YOUR SPACE › MY PROJECTS. |
| TC011 | MOVE /account/intakes → /control/intakes | Intakes are pre-project records → YOUR SPACE › MY INTAKES, not CONTROL ROOM. |
| TC013 | COLLAPSE CTRL settings sections | Keep, but as CLIENT CONTROL ROOM sections (profile, security, notifications, payments, providers, membership) — billing/domains placement re-check. |
| TC014 | MOVE /control/evolve-operations → CONTROL | Still correct; destination becomes OPERATIONS console, not a control room. |
| TC026 | MERGE admin projects + provisioning → CONTROL PROJECTS | Project management belongs with production/operations — confirm it is not placed in FOUNDER CONTROL ROOM. |
| TC027 | MERGE CONTROL REVIEWS + INBOX | Keep; place cross-project review view in operations/production, not a control room. |
| TC028 | Re-point CONTROL/production cross-links | Keep; production menu "CONTROL" should split into CONTROL ROOM (founder account) and OPERATIONS. |
| TC029–TC032 | LAB namespace + moves | Keep routes; rename family to STUDIO OS › LAB. |
| TC033 | MERGE /enter + /origin/locations (MAP state) | Replace with: one WAITING ROOM system, two viewport compositions, one destination registry; SWIPE-UP and ENTER 00 both open it. |
| TC034 | ALIAS /origin → / | Keep, but EXIT 00 and the LOCATIONS desktop redirect target /origin today — update together. |
| TC048 | Intake COMPLETE → CTRL.INTAKES | Hand off to YOUR SPACE › MY INTAKES instead of a control room. |
| TC039 | DEMOTE /sound → setting | Check SOUND against ORIGIN/ENTER environment audio in the spatial layer before demoting. |
| PUB.SITES node | SITES as public showcase only | Add CLIENT SITES (YOUR SPACE › MY SITES) + site lifecycle + site→project link. |
| F05/F08/F09/F10 family definitions | ACCESS & CTRL ROOM · 00/CONTROL · PROJECT RUNTIMES · STUDIO OS LAB | Re-cast as layers per SITE00_EXPERIENCE_TREE.json. |

**Re-evaluations**

- **ACCESS & CTRL ROOM vs 00/CONTROL vs CONTROL ROOM vs CONTROL PLANE:** RELATED BUT DISTINCT + LEGACY NAMING. ACCESS = entry to the account layer; CONTROL ROOM (client/founder) = account/settings UI; 00/CONTROL = operations console mixing founder settings, project management and business ops; CONTROL PLANE = infrastructure. "CTRL ROOM" names two different places today; "control plane" in code names only the design handoff bridge.
- **STUDIO OS LAB:** LAB is a child surface of STUDIO OS (machinery root). Do not rename the ontology.
- **PROJECT RUNTIMES:** PLATFORM_CONTAINER_LAYER — mounts SITE 00, JURNL, AIO, FRONTAL SLAYER and future products; not a page family.
- **ENTER 00:** SPATIAL_PORTAL that opens the WAITING ROOM (DIRECTORY_PLACE).
- **FAST TRAVEL:** GLOBAL_DESTINATION_SWITCHER (contextual shortcut overlay), layer B.

**Proposed experience layers:** A routed surfaces · B global navigation · C spatial entry/exit · D account/control rooms · E project/client experiences · F production (+ operations console) · G control plane · H project runtimes (container) · I STUDIO OS (› LAB) · J STUDIO WORLD. See `SITE00_EXPERIENCE_TREE.json`.

---
# PART E — QUESTIONS FOR THE REVIEWER

1. Should the final architecture be expressed as layers (A–J) rather than peer families? Which layer does each prior family belong to?
2. Is WAITING ROOM one system with two viewport compositions (LOCATIONS on mobile, /enter on desktop)? Should SWIPE-UP open it?
3. Should FAST TRAVEL exist in every shell (client app, production, operations) and be role/project-aware?
4. Where should MY PROJECTS, MY SITES and MY INTAKES live if not in the CONTROL ROOM?
5. Which parts of 00 / CONTROL move to FOUNDER CONTROL ROOM vs stay in an operations console vs move to production?
6. Is a commercial-adjustments engine (control plane) + FOUNDER CONTROL ROOM › COMMERCIAL the right split for discounts/promotions/credits/waivers?
7. Which project and site lifecycle states are needed for launch?
8. Is EXIT 00 reserved for public spatial exits only?
9. For each item in PART_D.prior_changes_to_reconsider: AGREE_WITH_OPUS / PARTIALLY_AGREE / DISAGREE / ALTERNATIVE_RECOMMENDATION.

Use `AGREE_WITH_OPUS`, `PARTIALLY_AGREE`, `DISAGREE` or `ALTERNATIVE_RECOMMENDATION`, at both layer level and item level.
