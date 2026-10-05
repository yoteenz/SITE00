# SITE 00 — Ground Zero Master Brief

- **Sprint:** P0.SITE00.GROUND-ZERO-FULL-PRODUCT-COMPLETION-AUTHORITY-TREE-FORENSIC1
- **Agent:** Opus
- **Repo truth:** `yoteenz/SITE00` main @ `eedc9c8` (2026-10-05)
- **Mode:** forensic, planning and canon only
- **Not done in this sprint:**
  - no code changes
  - no tree changes applied
  - no generations
  - no client accounts
  - no AIO or Frontal Slayer edits

All files listed here are in `docs/site00/ground-zero/`. Raw audits are in `evidence/`.

---

## 1. What SITE 00 is

SITE 00 is a commercial **digital location**. It turns graphics into pages, products and worlds through three locked products:

- **IDNTY** — states 00–03
- **BLDR** — SITE / WORLD / SYSTEMS / EXTENSIONS
- **EVOLVE** — REFINE / INSTALL / TRANSFORM, plus marketing

These run on **STUDIO OS**, the internal machinery. **STUDIO WORLD** is the reserved digital office.

It is also the **host production system**. The founder's production workspace and the client app should serve SITE 00 itself, JURNL, AIO, FRONTAL SLAYER and future clients from one project truth, with each project firewalled from the others.

## 2. What currently exists

| Area | Reality at `eedc9c8` |
|---|---|
| Router | 367 route elements, 357 unique URL patterns, 402 tree nodes (incl. 35 non-route tabs/overlays/shell parts). Parsed from code via the TypeScript AST; 0 unresolved paths. |
| Public | 41 surfaces: 11 live, 20 partial, 10 placeholder. ORIGIN, IDNTY and the EVOLVE hub are strongest. Nine pages are draft-gated, and legal links 404. |
| Client side | Four parallel project rooms (`/app`, `/client/projects`, `/studio/:slug`, `/projects/:slug`) plus CTRL ROOM. Only `site00_client_review_*` is real persistence. |
| Production workspace | The 7-tab nav matches canon. Only DESIGN, EXPERIENCE and EXPRESSION are project-scoped; HUB, INBOX, LIBRARY and ACTIVITY resolve to ndxbook. Requests and activity live in localStorage. |
| Bench/experiment sprawl | 53 bench/experiment/debug routes vs 10 production registrations; 17 are unguarded. |
| 00 / CONTROL | 59 operator routes on Supabase. A separate data plane from the workspace. |
| Visual authorities | 2,111 tracked images in 41 sets (20 canonical). Most founder originals are **not** in the repo. |
| Auth | Supabase sign-in works. Admin is an email allowlist. There are no roles, no membership and no invites, and password reset is broken. |
| CI | 73 of the last 100 `main` runs failed. Last green was 2026-09-28. |

## 3. Current page tree

See `SITE00_CURRENT_DISCOVERED_PAGE_TREE.json` (repo truth) and Part A3 of `SITE00_INDEPENDENT_TREE_REVIEW_PACKET.md` (readable, by family).

Route registrations by current family:

| Family | Routes |
|---|---:|
| ADMIN 00/CONTROL | 61 |
| CLIENT APP | 39 |
| LEGACY FOUNDER WORKSPACE | 31 |
| EXPERIMENT LAB | 31 |
| LEGACY /desktop ALIASES | 30 |
| DESIGN BENCH | 25 |
| PRODUCTION WORKSPACE | 18 |
| PROJECTS / STUDIO OS | 16 |
| EVOLVE | 14 |
| DEV/DEBUG | 13 |
| PUBLIC INFO | 12 |
| STUDIO (client) | 11 |
| ASSET VAULT | 10 |
| CTRL ROOM | 8 |
| AUTH | 7 |
| ACCOUNT/INTAKE | 7 |
| LEGACY REDIRECTS | 7 |
| IDNTY | 6 |
| CLIENT PROJECT ROOM | 6 |
| PUBLIC ORIGIN | 5 |
| BLDR | 5 |
| PROJECT RUNTIME | 2 |

## 4. What is wrong with the current tree

1. **Four client project rooms.** None is reachable with auth in production, and CTRL ROOM links to none of them.
2. **The review loop is broken in three places.**
   - **Send:** no publish action exists.
   - **Auth:** client fetches carry no token, so they get a 401.
   - **Return:** the workspace never reads client decisions, and gates never unlock.
3. **The production workspace is not project-scoped** for four of its seven tabs, and SITE 00 is missing from the project switcher.
4. **53 one-off routes sit in the product namespace**, 17 of them unguarded.
5. **Public site gaps.**
   - There are two directories.
   - Nine pages are draft-gated and bounce to `/`.
   - Legal and support CTAs are dead.
   - Eight `/desktop` aliases render blank.
   - There is no 404 page.
6. **Ontology drift.**
   - BLDR uses ENTERPRISE / NOT SURE instead of SYSTEMS / EXTENSIONS, and the admin intake page uses a third set (SITE / WORLD / BRAND / SYSTEM).
   - The client nav is PROJECTS / PROFILE instead of PROJECT / LIBRARY.
   - "STUDIO" naming leaks to clients.
7. **No project membership, invites or roles.**
   - About 20 API endpoints are unauthenticated.
   - Two tables are writable with the anon key.
   - The client can choose its own review role inside a project it can already open (project access is checked first).
8. **The registry is split** across 7 or more hard-coded lists with slug drift.

## 5–9. Expand · collapse · merge · split · move · add · deprecate

Full detail is in `SITE00_OPUS_TREE_RECOMMENDATION.md` and `SITE00_PAGE_TREE_CHANGELOG.json` (51 changes).

| Operation | Count | Headline items |
|---|---:|---|
| EXPAND | 1 | INBOX gains a CLIENT REVIEWS lens and a SEND TO CLIENT sheet |
| ADD_MISSING_NODE | 11 | Invite accept, MY PROJECTS, CLIENT RELATIONSHIP, PROJECT tab, NOTIFICATIONS, SEND TO CLIENT, LEGAL, ORIGIN STORY, LAB, BLDR EXTENSIONS, NOT FOUND |
| COLLAPSE | 5 | Review sub-routes, `project/:section`, `library/:categoryId`, CTRL settings sections, `/bldr/start` |
| MERGE | 11 | Client rooms → CLIENT APP; LOCATIONS → WAITING ROOM; CONTACT + FAQ → SUPPORT; ABOUT/BRAND → ORIGIN STORY; GUIDE → SYSTEM; existing-location → EVOLVE; CONTROL REVIEWS + INBOX → one review engine; provisioning → CONTROL PROJECTS; legacy founder modules → EXPRESSION |
| SPLIT | 1 | `/production` becomes all-projects plus a per-project HUB |
| MOVE | 7 | Production INBOX/LIBRARY/ACTIVITY under `:slug`; intakes → CTRL ROOM; evolve-operations → CONTROL; benches, experiments and dev harnesses → `/lab`; runtime → EXPERIENCE LIVE |
| RENAME | 4 | `/app/projects/:slug` → `/app/:slug`; `/production/queue` → `inbox`; ENTERPRISE → SYSTEMS; EXPERIENCE taxonomy |
| DEPRECATE | 2 | DESIGN bench child `workspace`; `/studio/:slug` as a client surface |
| REDIRECT / ALIAS / DEMOTE / RECLASSIFY / PROMOTE | 5 / 1 / 1 / 1 / 1 | — |

Routes are also reclassified into non-route surfaces:

- **21 routes become states:** review compare/comments/annotations/history, `project/:section` and `library/:categoryId` (in both the live and preview trees), 4 CTRL sections (domains, billing, team, security become tabs of `/control/settings`, which stays the route), LOCATIONS, contact, faq, guide and runtime. The full list is `route_reclassification_ledger` in `SITE00_PAGE_TREE_CHANGELOG.json`.
- **4 routes become interactions:** approve and revision, in both trees.
- **`/sound` becomes a global setting.**

## 10. What Opus recommends

**Audience-first.** SITE 00 becomes four audience surfaces joined by one project truth:

- PUBLIC LOCATION
- ACCESS & CTRL ROOM
- CLIENT APP
- PRODUCTION WORKSPACE

Supporting them are 00 / CONTROL for operations, PROJECT RUNTIMES (firewalled), a guarded LAB, and a reserved STUDIO WORLD. That makes 11 families and 72 nodes. Eight cross-cutting systems are **not** pages: registry, membership, review, events, notifications, messages, files and pulse.

## 11. Strongest alternative

**Project-first.** `/projects/:slug` is one address for every role, with role lenses. LOCATIONS stays separate, and CONTROL folds into `/production/ops`.

- **Better for:** the founder (one link per project).
- **Worse for:** firewall safety and the mobile client experience.

See `SITE00_TREE_TRADEOFF_MATRIX.md`.

## 12. Decisions open for founder + independent review

| ID | Decision |
|---|---|
| U1 | Audience-first vs project-first project address |
| U2 | Merge LOCATIONS into WAITING ROOM? |
| U3 | Fold CONTROL into production? |
| U4 | AIO and NDXBOOK project types; canonical AIO slug |
| U5 | Retire the `/projects/:slug` modules and `/studio/:slug` |
| U6 | Public page merges |
| U7 | Existing-location → EVOLVE |
| U8 | Visual conflicts C1–C11 |
| U9 | Legacy founder modules: merge into EXPRESSION or move to LAB |

## 13. What is canonical visually

These are canonical:

- **Production PARENT_3VIEW** (12 triptychs), with per-tab packs:
  - DESIGN asset pack OPUS3
  - INBOX root convergence2
  - EXPRESSION LITE (40 routes)
  - ACTIVITY OPUS1 (founder decision)
  - HUB founder trio
- **Public Redesign pack** (ORIGIN, IDNTY, BLDR, EVOLVE, LOCATIONS). Mobile only; records live in code and the images are not in the repo.
- **Projects index reference.**
- **Founder design-pack sheets.**
- **JURNL F01**, as project canon.

Full list: `SITE00_VISUAL_AUTHORITY_REGISTRY.json`.

## 14. Official visual language

`SITE00_DESIGN_LANGUAGE_CANON.json` validates every known principle against the authorities:

- luminous white/off-white architecture;
- red as signal and illumination, never a field;
- a black/red crystal core at the centre axis;
- suspended glass boards;
- off-white host chrome with 1px rules;
- uppercase text and red numerals;
- project personality only via the thumbnail, hero and board content;
- no scaling of host chrome;
- no SaaS card walls.

**LIBRARY is the sanctioned dark exception.**

Component, responsive and per-surface rules are in their own files. **Open conflicts C1–C11** include the two host typographies: Martian Mono for public/client and Saira for production.

## 15. What remains incomplete

30 surfaces, listed in `SITE00_INCOMPLETE_SURFACE_MAP.json`.

## 16–18. Reuse

| Classification | Surfaces |
|---|---:|
| DIRECT_REUSE | 8 |
| DERIVED_REUSE | 10 |
| PARTIAL_REUSE | 7 |
| NEW_AUTHORITY_REQUIRED | 5 |

The five that need a new authority:

- client app HOME;
- client app PROJECT journey;
- client app FAMILY REVIEW mode;
- Character Fabrication tablet/desktop;
- STUDIO WORLD.

Each is a **descendant** of the existing canon. Before any generation, the founder should supply the untracked P0.APP.1 client-app reference; if it covers HOME and REVIEW, the client app needs only reuse. Plan: `SITE00_MISSING_AUTHORITY_PLAN.json`.

## 19. What must be done before the first client

`SITE00_CLIENT_READY_MVP.json` lists 40 items, of which 34 are gate blockers. That is **82 engineer-days**, with a critical path of 21 days:

D04 registry → D05 membership → D10 review engine → D11 approval bridge → A03 client HOME → Q02 responsive QA.

**MVP calendar:**

| Path | Working days | Approx. weeks |
|---|---:|---|
| Fast | 23 | ~4.5 |
| Expected | 36 | ~7 |
| Risk-adjusted | 52 | ~10.5 |

The MVP needs only LEGAL, SUPPORT and the intake hand-off from the public site.

## 20. What can wait until after the first client

The rest of the public site, EXPERIENCE children, LIBRARY descendants, DESIGN children rebuild, LAB redirects, CTRL settings tabs, the client-funded production rails, MFA, payments, STUDIO WORLD and journal content. See `SITE00_FULL_COMPLETION_PLAN.json`: 187 engineer-days in total.

**Full product calendar:**

| Path | Weeks |
|---|---:|
| Fast | ~9 |
| Expected | ~14 |
| Risk-adjusted | ~21 |

## 21. How JURNL continues

Track E. JURNL stays the live proof project, and its family validation is not paused. JURNL is a **PERSONAL_PROJECT** with no client user. Its runtime firewall (`.jrn` scoping, import tests) is the model for the other projects.

## 22. How AIO preparation continues

Tracks F, G and H:

- **F:** forensics. The founder must provide the AIO code repo, which isn't in this repo.
- **G:** IDNTY prep. Identity starts at **00 STARTING AT ZERO**; the product is an **EXISTING PRODUCT · RECONSTRUCTION**.
- **H:** scope, budget and timeline. Budget can be seeded from the JURNL ledgers: 317 credits per 4K image ≈ $0.95, and F02 cost 9,471 credits ≈ $28.

No client account, no invites and no external data until the gate passes.

## 23. When AIO client onboarding is safe

Only when **every** gate below reads PASS (or READY). Today every gate is FAIL or PARTIAL.

| Gate | Today | Items |
|---|---|---|
| SITE00 CLIENT AUTH | FAIL | D01, D07 |
| CLIENT PROJECT ROOM | PARTIAL | A01–A04, A08, A09 |
| PROJECT FIREWALL | FAIL | D02, D08, B01, Q03 |
| REVIEWS | FAIL | D10, A05, B02 |
| APPROVAL RETURN LOOP | FAIL | D11, B03, B05, Q01 |
| CLIENT INBOX | FAIL | D13, A06 |
| CLIENT LIBRARY | FAIL | D09, D15, A07 |
| CLIENT PERMISSIONS | FAIL | D03, D05 |
| CLIENT INVITE | FAIL | D06, A11, B04, B07 |
| AIO SCOPE / BUDGET / TIMELINE | NOT READY | tracks F, H |

## 24. How Frontal Slayer later enters

After the MVP:

1. Register `frontal-slayer` as a FOUNDER_PROJECT in the canonical registry.
2. Keep the `fs_*` tables and the cross-repo asset contract.
3. Revoke the implicit Frontal Slayer staff admin defaults.
4. It then follows the same IDNTY → familyization → production → review pipeline.

Frontal Slayer changes in this sprint: **0**.

## 25. Technical health

| Check | Result |
|---|---|
| **Local build / typecheck / tests** | **NOT RUN.** This session's egress policy blocks `registry.npmjs.org` (HTTP 403 on every package), so `npm ci` could not install. Not routed around. |
| **CI on main (`eedc9c8`)** | `validate` PASS. `test` **FAIL**. `build`, `verify_backend` and `deploy` **SKIPPED**, so typecheck didn't run either: `npm run build` = `tsc --noEmit && vite build`. |
| **CI history** | 73 failure / 24 cancelled / 3 success of the last 100 `main` runs. Last green: 2026-09-28 (`47e2d7e`). |
| **Known failing tests (first 10 CI annotations; the list is truncated)** | `experimentGStaleForming` and `intakeService` — store adapters need a Supabase schema in CI; `site00ExpressionEngineSprintB50R1` ×2 — journey stage count is 13 vs 12; `productionAuthorityConvergenceOpus1` and `productionAuthorityAlignmentSonnet1R1` — host chrome CSS now contains viewport units; `p0vrMobileAuthoritySelectionPersistAcrossRefresh1`; `p0vrHeroRightRailButtonSurfaceCleanup1`; `p0vrExperienceExpressionViewPanelMount1`; `p0ProductionHubMachine1` — EISDIR. |
| **SITE00 / client app / registry / review / auth tests** | Exist: `tests/clientAppP0App1/2`, `clientProjectRoomP0Client1/2/2A`, `clientAppPreviewQa`, `jurnlF01Runtime`, `intakeService`. They exercise **preview fixtures only**: no real send, no token, no role tamper, no cross-project access. |
| **New failures introduced by this sprint** | 0 (documentation only). |
| **Live runtime verification** | **RUNTIME_VERIFICATION_BLOCKED.** There is no preview tunnel in this environment, and no visual pass is claimed. |

---

## INDEPENDENT REVIEW HANDOFF

Give these files to the second reviewer (ChatGPT) in this order. All paths are relative to `docs/site00/ground-zero/`.

| Role | Path |
|---|---|
| NEUTRAL REVIEW PACKET (start here) | `SITE00_INDEPENDENT_TREE_REVIEW_PACKET.md` (+ `.json`) |
| REVIEW QUESTIONS | `SITE00_TREE_REVIEW_QUESTIONS.md` |
| CURRENT TREE | `SITE00_CURRENT_DISCOVERED_PAGE_TREE.json` |
| OPUS PRIMARY | `SITE00_OPUS_RECOMMENDED_CANONICAL_PAGE_TREE.json` + `SITE00_OPUS_TREE_RECOMMENDATION.md` |
| OPUS ALTERNATIVE | `SITE00_OPUS_ALTERNATIVE_TREE.json` |
| TREE CHANGELOG | `SITE00_PAGE_TREE_CHANGELOG.json` |
| TRADEOFF MATRIX | `SITE00_TREE_TRADEOFF_MATRIX.md` |
| VISUAL AUTHORITY REGISTRY | `SITE00_VISUAL_AUTHORITY_REGISTRY.json` |
| DESIGN LANGUAGE CANON | `SITE00_DESIGN_LANGUAGE_CANON.json` |
| RAW EVIDENCE | `evidence/` (route AST extraction + 8 read-only audits) |

**Suggested prompt to the reviewer:** "Read Parts A–C of the packet and form your own tree before reading Parts D–E. Then answer the 14 questions and fill the JSON response template with AGREE_WITH_OPUS / PARTIALLY_AGREE / DISAGREE / ALTERNATIVE_RECOMMENDATION at family, page and classification level."

**Tree status:** PROPOSED_BY_OPUS. The FOUNDER_APPROVED_CANONICAL_TREE is locked only after the founder compares four trees: current, Opus primary, Opus alternative, and the independent reviewer's.
