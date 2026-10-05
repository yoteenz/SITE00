# SITE 00 — Production Workspace forensic notes (read-only audit, 2026-10-05)

Machine-readable inventory: `workspace.json` (199 surfaces).

## 1. Actual workspace IA

Shell: `ProductionAuthorityFrame` (src/site00/components/productionAuthority/ProductionAuthorityFrame.tsx), portalled to `<body>`. It has one header (project chip, ITEMS NEED YOU, menu) and one 7-tab nav from `src/site00/components/productionHub/nav.tsx`. Access is gated by `Site00InternalProductionGuard` (signed in + `canAccessAdminPages`).

The nav matches canon in labels and order: **HUB · INBOX · DESIGN · EXPERIENCE · EXPRESSION · LIBRARY · ACTIVITY**.

| Tab | Route | Body | Status | Project-filtered |
|---|---|---|---|---|
| HUB | `/production` (+ legacy `?view=machine`) | HubBody / ProductionHub | PARTIAL: real data for NDXBOOK Entry 002 only | NO (hardcoded `ndxbook`) |
| INBOX | `/production/queue` (lenses `?view=needs/watching/resolved/all/messages/system`, children `?item= ?thread= ?notice=`) | InboxBody | PARTIAL: graph data plus device-local localStorage requests; MESSAGES is a placeholder | NO |
| DESIGN | `/production/:slug/design?mode=brand/experience/surfaces/compiler/assets/viewport`; children `/design/{workspace,references,assets,pages,skins,history,more}` | DesignChamber; children = promoted twin-opus-direct bench | modes VISUAL_ONLY (static config) except VIEWPORT (live iframe, WORKING); children PARTIAL | slug yes, content no (except JURNL) |
| EXPERIENCE | `/production/:slug/experience[/world/zones/environments/modules/simulations/assets/review]` | ExperienceBody + ExperienceProductionShellPage | root VISUAL_ONLY; all 7 children PLACEHOLDER ("NO WORKSPACE SURFACE MOUNTED") | slug only |
| EXPRESSION | `/production/:slug/expression[/...40 family routes + character-fabrication]` | ExpressionBody + family screens | PARTIAL: real Entry 002 read model; format-studio/content-package/campaign-board are placeholders | slug yes, data ndxbook only |
| LIBRARY | `/production/libraries` | LibraryBody | mostly fixture plates; actor catalogue is real | NO |
| ACTIVITY | `/production/activity` (`?view=`, `?milestone=`) | ActivityBody | PARTIAL: localStorage log plus graph rows | NO |

Also mounted: `/production/:slug/runtime/*` (JURNL only) and `/production/site00/design` (pure redirect).

**Project context.** The project lives only in the path segment. Global tabs (HUB, INBOX, LIBRARY, ACTIVITY) resolve the project to `ndxbook`; see `projectIdFromPath` in `chrome.tsx` and `projectSlugFromPath` in the frame. `ProductionWorkspaceContext` stores the slug, but chrome and data never read it back. The switcher lists FRONTAL SLAYER, STUDIO WORLD, NDXBOOK, AIO, ASTRAL WORLD and JURNL. **SITE 00 itself is excluded** (it is filtered out). Switching from a global tab always lands on DESIGN.

In practice only NDXBOOK (Entry 002) and JURNL (ingested family chamber + runtime) have real content. Every other project shows the NDXBOOK-authored static design chamber (e.g. "NDX GROTESK") or empty states.

## 2. Overlap and merge/split map

| Concern | Production workspace | 00 / CONTROL (`/admin/site00/*`) | STUDIO (`/studio/:slug`) | CTRL ROOM (`/control`) | Client app / room |
|---|---|---|---|---|---|
| Project status | Hub (ndxbook only) | Projects + Project workspace (Supabase, pipeline bar) | Dashboard / milestones | — | Overview |
| Reviews / approvals | INBOX (founder decisions, localStorage) | REVIEWS = `/approvals` (Supabase `site00_approval_requests`) | `/reviews` | — | `/app/.../reviews`, `/client/projects/.../reviews` (client-reviews API) |
| Activity | ACTIVITY (localStorage) | `/activity` (Supabase) | `/activity` | — | `/activity` |
| Assets / library | LIBRARY (fixtures), DESIGN /assets | ASSETS / VAULT → `/assts` | `/assets` | — | `/library` |
| Messages | INBOX MESSAGES (placeholder) | — | — | — | `/app/.../inbox` (separate) |

Findings:

- **Two disjoint data planes.**
  - The production workspace runs on the expression-engine API plus localStorage.
  - CONTROL, STUDIO and the client surfaces run on Supabase (`/api/admin/site00-production`, `/api/site00/client-reviews`).
  - Nothing crosses between them.
- **Merge candidates:**
  - Production INBOX ⇄ CONTROL REVIEWS (one decision queue, backed by Supabase).
  - Production ACTIVITY ⇄ CONTROL activity.
  - LIBRARY ⇄ `/assts`.
  - CONTROL's "PRODUCTION" nav item (`/admin/site00/studio`) should link to `/production`.
- **Split / keep:**
  - CTRL ROOM is client-account (sites, billing, team). It is not part of production. 5 of its 7 sections are placeholder copy.
  - The shell menu "CONTROL" link goes to `/control` (client) instead of `/admin/site00` (operator). Re-point it.
- **STUDIO vs client app vs client room:** three client-facing review UIs over the same API. That is a consolidation candidate, but outside the workspace.

## 3. Overloaded pages

- `InboxBody.tsx` (1230 lines): 6 lenses, 3 detail children and 4 temporary overlays in one file.
- `ActivityBody.tsx` (751 lines).
- `DesignChamber.tsx` (669 lines): chamber, viewport stage, pipeline and table.
- `ProductionHub.tsx` / `machine.tsx` / `overlays.tsx` (~1.9k lines): a legacy parallel hub that is still reachable.
- `ProductionWorkspaceProjectHubPage.tsx`: a regex-driven router that picks between 6 frame variants (authority frame, chrome overlay, PwFrame, bare). This explains the inconsistent chrome on children.
- DESIGN child routes mount the whole `TwinOpusDirectScreen` bench (768px canvas scaled onto phones; flagged as a responsive authority failure in `artifacts/production-authority-tree/RESPONSIVE_TREE.md`).

## 4. Missing children / dead ends

- **Canon sub-surfaces with no workspace surface:**
  - REVIEWS (client)
  - production-scoped ASSETS
  - PRODUCTION HISTORY (per project)
  - CLIENT RELATIONSHIP
  - PROJECT STATUS
  - CLIENT STATUS
- **EXPERIENCE:** all 7 children are placeholders, and their labels drift from canon (environments = PATHS, modules = INTERACTIONS, etc.).
- **EXPRESSION:** format-studio, content-package and campaign-board are placeholders. Review comments are UNMOUNTED. REVIEW + HANDOFF lock is disabled and links out to legacy `/projects/:slug/content-operations/expression-engine`, which leaves the shell.
- **DESIGN:** all ON YOUR TABLE and pipeline links go to `/design/workspace` (the legacy bench).
- **Three taxonomies for DESIGN disagree:**
  - registry subs: work / authorities / family / interactions / responsive / framework / assets / history
  - modes: 6
  - child routes: 7
- **Dead code:**
  - `PwFrame.NAV_PRODUCTION` (duplicate, hardcoded ndxbook)
  - Orphan pages `DesignProjectsDesignHubPage` and `ProjectAstralWorldExperiencePage`
  - `/production/site00/design` is redirect-only

## 5. Bench / experiment sprawl

- **18 design bench routes** under `/projects/:slug/design/*`:
  - twin, twin-v4, twin-sol-direct, twin-testA, twin-testB, twin-grok-direct, opus-native, twin-fable-direct, twin-spark-direct, twin-spark-responsive, reconstruction-lab
  - twin-opus-direct plus its 6 children
- **17 of the bench/debug routes have NO route guard.** These are the 9 bench pages from twin-sol-direct onward, the 6 twin-opus-direct children, and the 2 debug twin previews. Only twin, twin-v4 and reconstruction-lab use `Site00AccountRouteGuard`, and none of these pages gate themselves.
- **31 experiment/lab routes:**
  - Experiments D/E/F/G (+directions, finalists)/H (+development)
  - marketing-expression/experiment-01
  - experiments hub, lab hub
  - realism-lab ×7
  - personality-replay ×3
  - canonical range / carousel
  - calibrate, creative-appetite
  - brand-character ×4
  - inspect/icons
- **4 debug/concept routes.**
- **~19 legacy founder-workspace route groups** (content-operations ×15 routes, character ×4, cultural-intelligence ×3, and others). Most duplicate a production tab (see `legacy-*` overlaps in the JSON).
- In total that is **~53 bench/experiment/debug routes vs 10 production route registrations**. `src/site00/pages` holds 102 top-level page files; only 8 (`pages/production/*`) plus the design gate are canonical workspace.

Recommendation: move benches and experiments behind one `/lab/*` admin-guarded tree, or tree-shake them from production builds.

## 6. Client status integration

There is no client status in `/production` at all:

- **No "send to client".** The client-reviews API exposes only client-side actions (comment, annotation, approve, revision, decline, revisit). The only writer of `site00_client_review_objects` is `previewFixtureSeed.ts`.
- **Admin model knows the states but nothing writes them.** `DeliverableStatus` includes `CLIENT_REVIEW` and `CLIENT_APPROVED`. CONTROL reads `site00_approval_requests` with status `CLIENT_REVIEW` / `READY_FOR_CLIENT`, but `decideApproval` only writes `APPROVED_INTERNALLY` or `REVISION`.
- **Client decisions never come back.** A client approval or revision never reaches production INBOX or ACTIVITY.

## 7. Minimal work list for a client-loop-ready workspace

| # | Item | Effort |
|---|---|---|
| 1 | **Project-scope the global tabs.** Add `?project=` (or move to `/production/:slug/{hub,inbox,library,activity}`). Make chrome and frame read the project from the URL first, then `ProductionWorkspaceContext`, then the default. Fix nav hrefs and the switcher landing so you stay on the same tab. | M |
| 2 | **Add SITE 00 to the project switcher** and make the default project explicit (no silent `ndxbook`). | S |
| 3 | **Operator "create/publish review" API.** Add a `publish` action in `api/site00/client-reviews.ts` plus a repository insert into `site00_client_review_objects`/`versions` with `client_status=AWAITING_CLIENT`. Also set `site00_approval_requests.status=CLIENT_REVIEW` (or bridge the two tables). | M |
| 4 | **SEND TO CLIENT action in the workspace:** EXPRESSION REVIEW + HANDOFF lock, DESIGN viewport/pages, INBOX decision-detail. Include a confirmation sheet. | M |
| 5 | **Client status read model in the workspace.** INBOX WATCHING lens rows for AWAITING_CLIENT / REVISION_IN_PROGRESS / APPROVED. Add a status chip in the header or HUB per project. Feed ACTIVITY from client-review events (`site00_client_review_events`). | M |
| 6 | **Persist production requests and activity** server-side (replace localStorage `site00.production.requests.v1` / activity store) and add a `projectSlug` to activity rows. | M–L |
| 7 | **Add a REVIEWS surface** (client reviews for the project: status, versions, client comments). It can be an INBOX lens or a HUB child. | M |
| 8 | **Re-point the menu link** CONTROL → `/admin/site00` for operators. Link CONTROL "PRODUCTION" to `/production`. | S |
| 9 | **Guard the 17 unguarded bench/debug routes** with `Site00InternalProductionGuard`, or exclude them from prod builds. | S |
| 10 | **Remove dead pieces:** `NAV_PRODUCTION`, the 2 orphan pages and `/production/site00/design`. Decide whether to keep or retire `?view=machine`. | S |
| 11 | **Per-project DESIGN chamber content** (stop NDX static config bleeding into FRONTAL SLAYER and AIO), generalising the JURNL `ProjectFamilyChamber` path. | L |
| 12 | **Replace the DESIGN child bench** (`/design/workspace` + 6 children) with authority-frame children, fixing the mobile 768px scaling. | L–XL |
| 13 | **Mount EXPERIENCE children** (7 placeholders). | XL (not required for the client loop) |

Minimum for the client loop: items 1, 3, 4, 5, 8 and 9, roughly 7–9 dev-days. Adding 6 and 7 makes it durable across devices (+4–6 days).

## 8. Evidence pointers

- Nav: `src/site00/components/productionHub/nav.tsx`, `chrome.tsx` (`useProductionWorkspaceChrome`, `projectIdFromPath`, `useProjectSwitchItems`)
- Routes: `src/routes/Site00Routes.tsx` lines 1231–1590 (production + design benches), 2463–2990 (studio / client / app / control); `src/site00/config/routes.ts` lines 154–252
- Data: `src/site00/components/productionHub/useProductionHubData.ts`, `src/site00/state/productionRequestStore.ts` (localStorage)
- Client reviews: `api/site00/client-reviews.ts`, `api/_lib/site00ClientReviews/reviewRepository.ts:660`, `shared/site00-client-reviews/types.ts`
- Admin: `src/site00/admin/config/control-nav.ts`, `src/routes/Site00AdminRoutes.tsx` (59 routes), `api/_lib/site00Production/service.ts:366` (`decideApproval`)
- Intended tree: `artifacts/production-authority-tree/MASTER_TREE.md`, `STALE_FALLBACK_MAP.md`, `RESPONSIVE_TREE.md` (161 nodes; 7 UNMOUNTED, 12 PARTIAL)
