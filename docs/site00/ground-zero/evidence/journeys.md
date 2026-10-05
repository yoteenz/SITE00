# SITE 00 — User Journeys, Gaps, Authority Inheritance

Read-only audit of `/home/claude/site00`. File:line references are relative to the repo root.

## 1. Public visitor (cold, mobile)

1. `/` → OriginPage (only when `VITE_SITE00_ROOT=1`, `src/routes/Site00Routes.tsx:547-574`). The visitor sees three cards (IDNTY / BLDR / EVOLVE) and a status strip.
   - The status strip shows hard-coded metrics ("047 ACTIVE SITES", "12 BUILDS") that the code itself labels as placeholders (`src/site00/config/status.ts:13-20`).
   - The **NEED GUIDANCE? / TALK TO OUR BUILD GUIDE** button has no handler, so it is a dead CTA (`components/homepage/StatusStrip.tsx:48-50`).
2. Swipe up → `/origin/locations` gives the full map, with PUBLIC WORLD 01-07 and YOUR SPACE 08-11. **ENTER SITE 00** → `/enter` opens the WAITING ROOM directory.
   - Two different directories exist for the same job. `/enter` leaves out IDNTY, EVOLVE and LOCATIONS; LOCATIONS lists everything. **Redundant.**
3. Informational pages: SITES and JOURNAL are empty seeds. SYSTEM has no CTA. ABOUT's "LEARN MORE" goes to the empty JOURNAL. SERVICES reads like an agency menu.
4. Footer PRIVACY and TERMS point to `/brand/privacy` and `/brand/terms`, which have no routes, so the visitor is silently sent to `/`. **There is no legal page at all.**

Desktop visitor: the header shows only SITES / SERVICES / SYSTEM / ABOUT / JOURNAL plus ENTER 00 (`Site00AppShell.tsx:62-68`).
- IDNTY, BLDR and EVOLVE can be reached only through the Origin cards or `/enter`.
- LOCATIONS cannot be reached on desktop (`LocationsPage.tsx:37-39`).
- The richer `Site00PublicTopNav` and `Site00PublicSidebar` are dead code.

## 2. Potential client (evaluating)

Origin card → `/idnty/state` → `/idnty/{starting-at-zero|some-pieces-exist|ready-for-evolution|build-ready}/*` → complete.

- Completion CTAs are **CONTINUE TO BLDR** (`/bldr/state`) and **BOOK DISCOVERY CALL** (`/support`).
  - `/support` has no booking, only a mailto. **Missing step: discovery booking / contact.**
- BLDR also has two parallel entries:
  - `/bldr` → `/bldr/start` → `/bldr/state`
  - Origin → `/bldr/state`

  The `/bldr/start` hop is self-described as "legacy" (`pages/bldr/BldrStartPage.tsx:4`). **Redundant.**
- BLDR classes are SITE / WORLD / ENTERPRISE / NOT SURE, but the locked ontology is SITE / WORLD / SYSTEMS / EXTENSIONS.
  - SYSTEMS maps to ENTERPRISE, and EXTENSIONS has no route (`authority/publicRedesignAuthorityManifest.ts:89-94`). **Ontology gap.**
- EVOLVE: Origin → `/evolve/state` → `/evolve/{refine|install|transform}/property…` → complete → `/control`.
  - The "ENTER STUDIO — authorize, pay" step has no checkout. **Missing step: payment.**
  - "STUDIO" leaks internal STUDIO OS naming to the client.
- EVOLVE pricing (`/evolve/plans`) is unlinked publicly. Its CONSULT button goes to `/contact`, which is draft-gated and redirects to `/`. **Broken.**
- `/existing-location/*` is a full case flow (access → diagnosis → quote → checkout → complete) with **no inbound link**. It overlaps EVOLVE.

## 3. New client (account → intake → project)

1. Account creation: `/origin/create-account`, which is also reachable via the `/register` and `/create-account` aliases.
   - Note that "CREATE IDNTY" on `/idnty` goes to the brand diagnostic, not to account creation. One word, IDNTY, covers two concepts here.
2. Intakes are autosaved to the server (`hooks/useIdntyAssessment.ts:108`, `useIntakeSync`).
   - A signed-out user gets "SIGN IN TO SAVE" plus a guest email token (`/intake/access/:token`).
3. After sign-in, the default destination is `/control` (`utils/signInReturnTo.ts:5`), not the intake just completed.
   - **Missing step:** after completing an intake, nothing hands the user into account → intakes → project.
4. `/account/intakes` is reachable only from the desktop Operating World top nav (INTAKES) and from the draft-gated `/account` page.
   - It is not in the mobile bottom nav, CTRL ROOM overview or fast travel.
5. Project creation: the BLDR completion "CREATE PROJECT →" goes to the `/projects` index, which hard-codes the FOUNDER view mode (`pages/ProjectsPage.tsx:7`). Clients cannot create a project.
   - Provisioning (`/project/:slug/provisioning`) is linked only from admin.
   - **Missing step:** intake approved → project provisioned → client notified with a link.
6. Password reset email redirects to `/account/settings`, which has **no route**, so the reset flow is broken (`utils/auth/site00SignInActions.ts:207`).

## 4. Returning client

Sign in → `/control` (CTRL ROOM). Overview and Sites are real; DOMAINS, BILLING, TEAM, SETTINGS and SECURITY are stub pages.

- Desktop top nav shows STUDIO and APPROVALS, but both are admin routes. AdminGuard silently bounces clients back to `/control`.
- There are **three parallel client project surfaces**, and none is linked from CTRL ROOM:
  - `/projects/:slug/*`: founder/STUDIO OS modules.
  - `/client/projects/:slug/*`: the Project Room, reachable only via "REVIEW DESIGN" links on project cards.
  - `/app/*`: the client app, with no inbound link.

  **Redundant and unclear authority.**
- On desktop there is no way back from the Operating World to the public site: the logo goes to `/control`, with no ORIGIN or EXIT 00.

## 5. Status and recommended authority inheritance

| Surface | Status | Gate / issue | Inherit authority from |
|---|---|---|---|
| ORIGIN (`/`, `/origin`) | LIVE_COMPLETE | Home is ORIGIN. **No separate origin page about inception / starting at zero.** | An "origin story" belongs as a section of ORIGIN, or should reuse IDNTY state 00 (STARTING AT ZERO) framing. Do not create a new family. |
| PROJECTS (`/projects`) | PARTIAL | FOUNDER role hard-coded; mixes STUDIO OS internals with client view | Clients should land in **Client Project Room** (`/client/projects`, ACCOUNT family). Keep `/projects/:slug/*` as internal STUDIO OS. |
| SERVICES (`/services`) | PARTIAL, GENERIC | Agency menu; no per-service pages; broken anchors | Should become a router into **IDNTY / BLDR / EVOLVE** family hubs (and EVOLVE marketing). No standalone service pages. |
| SYSTEM (`/system`) | PARTIAL | Dead end; 4-layer seed | Inherit from **EVOLVE hub** "SYSTEMS" section plus BLDR SYSTEMS once that class exists. GUIDE and SOUND live under SYSTEM. |
| GUIDE (`/guide`) | PLACEHOLDER, draft-gated | Seed already links ORIGIN / IDNTY / BLDR / EVOLVE / CTRL | Inherit **LOCATIONS / ENTER 00** directory (same IA); could merge into fast travel. Origin "NEED GUIDANCE" should point here. |
| SOUND (`/sound`) | PLACEHOLDER, draft-gated | Explicit placeholder | Inherit **ORIGIN environment** (ENV layer); a settings toggle rather than a page. |
| ABOUT (`/about`) | PARTIAL, MIXED | Generic principles | Inherit **ORIGIN** copy authority ("WHERE DIGITAL PLACES BEGIN"). |
| BRAND (`/brand`) | PLACEHOLDER, draft-gated | `/brand/privacy`, `/brand/terms`, `/brand/contact` linked but missing | Legal subpages are needed now (footer). Brand terminal inherits **IDNTY** family. |
| FAQ (`/faq`) | PLACEHOLDER, draft-gated | 4 seed Q&As | Inherit **EVOLVE hub FAQ** component pattern; extend per family. |
| CONTACT (`/contact`) | PLACEHOLDER, draft-gated | Live link from EVOLVE pricing is broken | Inherit **SUPPORT** (merge), plus add discovery booking for IDNTY/BLDR "BOOK DISCOVERY CALL". |
| ACCOUNT (`/account`) | PLACEHOLDER, draft-gated and auth-gated | All "ACCOUNT" nav already targets `/control` | Inherit **CTRL ROOM** (`/control`). Make `/account` redirect to `/control`, and add the `/account/settings` route (or retarget the reset email). |
| ASSET VAULT (`/assts`) | LIVE_COMPLETE, admin only | Internal | STUDIO OS (admin control nav). Not public. |
| LOCATIONS (`/origin/locations`) | LIVE_COMPLETE, mobile only | Desktop redirect | Canonical IA source; desktop needs an equivalent (resurrect `Site00PublicSidebar` / public rail). |
| JOURNAL (`/journal`) | PLACEHOLDER (empty) | `/journal/:id` missing | PUBLIC family; keep. |
| SUPPORT (`/support`) | PARTIAL | Anchors missing; no tickets | Absorb CONTACT and FAQ. |
| IDNTY | LIVE_COMPLETE (hub, state); PARTIAL (build-ready verification) | Ontology OK | n/a |
| BLDR | PARTIAL | Classes mismatch SITE / WORLD / SYSTEMS / EXTENSIONS; templates empty; `/bldr/start` redundant | n/a |
| EVOLVE | LIVE_COMPLETE (hub, state); PARTIAL (assessment, plans, marketing) | No checkout; plans unlinked | `/existing-location` should inherit **EVOLVE** (it is an existing-property flow). |

## 6. Highest-priority fixes (in order)

1. Add routes or retarget the links for `/brand/privacy`, `/brand/terms`, `/brand/contact` and `/account/settings`. The reset email is broken.
2. Fix the EVOLVE pricing CONSULT link: either un-draft `/contact` or point it to `/support`.
3. Give "BOOK DISCOVERY CALL" and "NEED GUIDANCE" real destinations.
4. Hide STUDIO and APPROVALS from non-admins in `OPERATING_WORLD_TOP_NAV`.
5. Add the post-intake handoff: completion → sign in → `/account/intakes/:id` → project. Add INTAKES to CTRL ROOM and the mobile surfaces.
6. Pick one client project surface (`/client/projects` vs `/app`) and link it from CTRL ROOM.
7. Add the BLDR SYSTEMS and EXTENSIONS classes, and remove the `/bldr/start` hop.
8. Add `/evolve/plans`, `/existing-location` and the draft pages to `SITE00_PUBLIC_PAGE_BASES`, or drop their `/desktop` routes. They currently render blank.
9. Delete or wire the dead nav components: `Site00PublicTopNav`, `Site00PublicSidebar`, `Site00MobileMenuDrawer`, `CtrlRoomSidebar`, `Site00EcosystemMobileNav`.
