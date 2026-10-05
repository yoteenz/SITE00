# SITE 00 navigation forensic notes (Fast Travel + global nav / non-route surfaces)

Read-only audit of `/home/claude/site00` (main checkout). Everything here comes from reading the code. No runtime was available, so items marked PLAUSIBLE are inferred from the code and have not been seen happening. This extends `docs/site00/ground-zero/evidence/navigation.json` (20 nav systems) with Fast Travel internals, shell-by-shell chrome, project and context switchers, and the overlay/transition inventory.

## 1. Fast Travel: what it is

- **Classification:** a *global destination switcher*. It is contextual and mobile-only. It is not a spatial teleport, a project switcher or a workspace switcher. Evidence: the header comment in `config/fast-travel.ts:1-4` says "contextual destination engine (mobile-only)… not a full directory". `resolveFastTravel` (`:417-435`) picks one RouteProfile by pathname and returns fixed link lists. The `world` field (`public|operating|onboarding`) is set on every location, but no component reads it.
- **Trigger:** `FastTravelTrigger` sits in `Site00MobileHeader` (default variant) and in `AccessMobileHeader`. `EntryToggle` (ENTER 00 / EXIT 00) reuses the Fast Travel icon, but it is a plain route link and does not open the panel.
- **Panel:** a right-edge `role=dialog` drawer, `min(92vw,360px)`, z-index 40. It pushes a history entry, closes on popstate, Escape or the backdrop, traps focus, and locks body scroll. UP NEXT cards use the 11 PACK artworks (`fast-travel-assets.ts`, art version 4). Auth-gated rows render "SIGN IN TO ENTER".
- **Context inputs:** two only:
  - `pathname`, matched in first-match order: ctrl, projects, bldr, idnty, sites, services, system, about, journal, origin, then fallback.
  - The `localStorage` flag `isSignedIn`.
  
  It has no notion of founder, admin, client or project. A founder and a client see identical items.
- **Size:** 11 profiles. With the signed-in/signed-out splits that makes 13 context variants, of which 10 are reachable. There are 20 unique destination ids and about 16 distinct routes.
- **Where it appears:** mobile only (<768px).
  - Public `Site00PublicShell` pages.
  - IDNTY/BLDR/EVOLVE state and assessment shells.
  - Auth (sign-in / create-account) mobile view.
  - `/access/:code`.
  - The EcosystemShell mobile layout: CTRL ROOM, intakes, signed-in IDNTY, client PROJECTS and module pages, STUDIO.
- **Where it is absent:** Origin, Locations (EXIT 00 variant), `/enter`, Production, client app, client project room, admin, ASSTS, the design workspace, the NDXBOOK founder workspace, PwFrame founder mobile `/projects`, and the JURNL runtime. It is also absent on tablet and desktop, which use the GlobalNav / ENTER 00 directory and the OperatingWorldTopNav instead.
- **How it relates to the other menus:**
  - FT is the "short" menu and always offers RETURN to LOCATIONS, the full mobile directory.
  - ENTER 00 is the desktop directory route. It does not overlap FT at runtime.
  - FT never offers EVOLVE, SUPPORT, PRODUCTION or any project.
- **Dead or degraded destinations:**
  - The ORIGIN profile can never show: the Origin mobile header is CSS-hidden, so no trigger exists there.
  - The CTRL ROOM signed-out and PROJECTS signed-out variants are pre-empted by `Site00AccountRouteGuard`.
  - CONTINUE BUILD is a self-link.
  - BILLING and SETTINGS lead to stub pages.
  - VIEW SITES redirects to `/control/sites` when signed in.
  - No FT link targets a COMPOSER_DRAFT route or a missing route.
- **Implementation gaps:**
  - EVOLVE has no profile; it gets the fallback (MY SPACE + RETURN only).
  - No tests cover Fast Travel.
  - Escape is handled twice (the shell's window listener and the panel's).
  - `navigateAndClose` calls `replaceState(null,'')`, which can leave a duplicate history step (PLAUSIBLE).
  - The auth state comes from a localStorage flag rather than the session, so links can show as unlocked and then bounce.

## 2. Shell-by-shell chrome (27 systems: 21 rendered, 3 partial, 3 dead code)

| World | Mobile | Desktop/tablet | Exit to other worlds |
|---|---|---|---|
| Public | MobileHeader + FT + MOBILE_SITE_NAV + footer | AppShell GlobalNav + ENTER 00 | ENTER 00 / LOCATIONS / FT MY SPACE |
| Account / CTRL ROOM | Ecosystem mobile shell (same header, FT, bottom nav) | OperatingWorldTopNav | Desktop: none back to ORIGIN |
| Client app `/app` | bottom nav | side nav ≥1024 | none |
| Client project room `/client` | bottom nav <768 | sidebar | none |
| STUDIO `/studio` | Ecosystem shell (FT fallback) | OperatingWorldTopNav | via top nav |
| Production `/production` | ph-top + bottom nav (portal) | host top + host nav (700/1120 breakpoints) | MENU → CONTROL only |
| Founder mobile `/projects` (admin) | PwFrame portal z 1200 over ecosystem chrome | n/a | SITE 00 → `/`, avatar → `/control` |
| Admin `/admin/site00` | `<details>` menu <1024 | sidebar + ⌘K search | ASSETS → `/assts`, client experience bar |
| ASSTS | dock | top nav | — |
| Design workspace `/studio-world/design` | mobile top | sidebar | 6/12 links go to draft-gated routes; EXIT 00 → `/` |
| NDXBOOK founder | own bottom nav + MORE menu | rail | RETURN TO ORIGIN, BACK TO PROJECTS, HELP → `/help` (no route) |
| JURNL runtime | in-app nav, no URL | same | none (host/project firewall) |

## 3. Non-route surfaces (38: 29 material, 9 micro)

- **Transitions:**
  - `Site00WorldColdStartGate`: cinematic loader with a 6s failsafe. It is skipped on `/control*`, sign-in, public hubs and the preview tunnel.
  - `AsstsColdStartGate`.
  - The Suspense reference-shell fallback.
  - Production runtime uses `fallback={null}`.
  - The Origin swipe-up transition to LOCATIONS.
- **Context switchers:**
  - Signed-in versus public (localStorage).
  - Preview device mode: decided at mount, and does not switch when the window is resized across 768px.
  - Layout preview toggles: three portalled components, all dead because `isSite00LayoutPreviewSwitchEnabled()` returns false.
  - The `?site00MobileLayout=1` QA override.
  - The `?preview=1` draft gate.
  - The admin/client ExperienceContextBar.
  - The VIEW AS FOUNDER/CLIENT toggle plus the client simulation selector.
  - The PREVIEW_GUEST STUDIO-only mode.
- **Project switchers (6):**
  1. Production header chip. URL-synced, but from HUB/INBOX/LIBRARY/ACTIVITY it always lands on DESIGN, and global production pages hard-code `ndxbook`.
  2. Hub machine selector. Lives in reducer state and sessionStorage, not the URL.
  3. Design workspace selector. React state only, not the URL.
  4. Admin `<select>`. Navigates with `window.location.href`, which forces a full reload.
  5. Client simulation selector. Resets between pages because the provider is re-created on each page.
  6. Module switcher. Works within one project only.
  
  The client app, client room, FT and the operating top nav have no project switcher at all.
- **Site switchers:** none exist. "SITES" is always a link: either the public portfolio or `/control/sites`.
- **Global interactions:**
  - JURNL toast, CharacterFabrication toast and the project-action toast.
  - Bell and More buttons in the client app and client project room have no handlers.
  - The Origin "NEED GUIDANCE" button has no handler.

## 4. Highest-signal problems

1. Fast Travel is unreachable on ORIGIN, the most-trafficked mobile page, so the ORIGIN profile is dead code.
2. Fast Travel has no role or project awareness. A founder on mobile cannot reach PRODUCTION from FT. Inside the ecosystem pages the shared MOBILE_SITE_NAV has no production entry either; the only mobile route there is the PwFrame nav.
3. There are four different "PRODUCTION / ACTIVITY" destinations with the same labels (`/production` vs `/admin/site00/studio`; `/production/activity` vs `/production?panel=activity`).
4. Project switching is not unified: there are 6 switchers using 4 different persistence models, and 3 of them are not URL-addressable.
5. The design workspace and NDX menus link to draft-gated or missing routes (`/guide`, `/sound`, `/faq`, `/contact`, `/blueprints`, `/account`, `/help`). These silently redirect to `/`.
6. On desktop, the operating world has no way back to the public ORIGIN, and the client app and client room have no exit at all.
