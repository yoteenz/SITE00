# SITE 00 SYSTEM DEFECT / REPAIR LOG — JURNL INGESTION

Sprint: `P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1` · 2026-10-05

Every place where ingesting JURNL exposed a SITE 00 production defect. Systemic defects were fixed **in SITE 00** (not patched
around inside JURNL). Classes per sprint §30.

## A. SITE 00 SYSTEM DEFECTS — FOUND + REPAIRED

| ID | Class | Defect (baseline) | Repair | Proof |
|----|-------|-------------------|--------|-------|
| D-01 | PROJECT_INGESTION | No way to register a product with product class, voice, viewport authority, families or runtime — the registry only knew marketing/design role flags. | `shared/site00-project-ingestion/` (`IngestedProjectRecord`, registry). JURNL registered from data. | `tests/jurnlF01ProjectIngestion.test.ts` |
| D-02 | PROJECT_INGESTION | No PERSONAL / FOUNDER ontology (`projectType` free string; no ownership / relationship). | `ownership`, `relationship`, `projectRuntime` on `Site00ManagedProjectRecord`; `isPersonalFounderProject()`. | ingestion tests |
| D-03 | RUNTIME_ROUTING | `/production/:slug/design` bounced any project not in the design-enabled list. | JURNL registered design-enabled through the registry (no route special case). | ingestion test "Design routing does not bounce it"; live QA |
| D-04 | DESIGN_WORKSPACE | Production host PROJECT chip was a static label — no project switching inside DESIGN. | Chip → real button + PROJECTS menu from the registry; `projectSwitchPath()` keeps workspace + mode. | live QA `workspace/002`, `003`, `020` |
| D-05 | PROJECT_CONTEXT | `useProductionHubData` fell back to `projects[0]` → an unknown / new project silently displayed **NDXBOOK data**. | `resolveHubProjectEntry()` — never substitutes; resolves from the managed registry or an empty project of its own. | ingestion test "never substitutes" |
| D-06 | PROJECT_CONTEXT | Hub list dropped founder projects the server index does not know yet. | PERSONAL managed projects appended to the hub list. | ingestion test |
| D-07 | DESIGN_WORKSPACE | DESIGN modes (BRAND / EXPERIENCE / SURFACES / COMPILER / ASSETS) rendered static NDX copy for every slug. | `projectFamilyChamber.ts` + `ProjectFamilyChamber.tsx` build every mode from project + family data; NDX path unchanged. | `tests/jurnlF01DesignWorkspace.test.tsx`; live QA `workspace/003–007` |
| D-08 | RESPONSIVE_RENDERER | Viewport presets hard-coded (MOBILE 390×844); a project's authority size (393×852) could not be honoured. | `applyProjectViewportSize()`; project default preset. | workspace tests; live QA `014`, `017`, `018` |
| D-09 | RESPONSIVE_RENDERER | SAFE AREA drew one generic box; no GRID; no BOUNDS. | Exact project insets with bands; project grid per device kind; live BOUNDS measured from `[data-runtime-bounds]`. | live QA `015` |
| D-10 | RUNTIME_ROUTING | No mechanism to mount a project's live UI in SITE 00 (only the NDX client app iframe). | Project runtime registry + `/production/:projectSlug/runtime/*` + runtime → host message protocol. | runtime tests; live QA |
| D-11 | HOST_PROJECT_FIREWALL | No defined boundary between host chrome and a project body. | Iframe isolation + `.jrn`-scoped CSS + data/runtime split; tests parse CSS selectors and imports. | runtime "host / project firewall" tests |
| D-12 | SCREEN_TREE / INTERACTION_SYSTEM / APPROVAL_STATE | No representation of a product family (tree, states, interactions, approvals, QA gate). | Project-agnostic `FamilyProductionContract`, family gate, completeness contract; JURNL F01 instance. | ingestion + runtime tests |
| D-13 | RUNTIME_ROUTING | Viewport "VALIDATION SHEET" link hard-coded to `/production/ndxbook/design/workspace` for every project. | Runtime projects link to their own gate (`?mode=compiler&inspect=gate`); NDX link unchanged. | workspace tests |
| D-15 | DESIGN_WORKSPACE | PROJECTS menu inside a DESIGN chamber: `.pxa .ph-img { position:absolute; inset:0 }` pulled the row thumbnail out of the grid → labels wrapped in a 30 px column under the thumb. Found during live QA. | `.pxm .pxm__list .pxm__thumb` pinned back into the grid (higher specificity). | live QA check "switcher rows: thumb + label laid out side by side"; `workspace/002` |
| D-16 | ASSET_MOUNTING | No per-project public asset root. | `public/site00/projects/<slug>/` (brand, fonts, authorities); `projectCoverUrl()`. | runtime asset tests |

### Follow-up `P0.JURNL.SITE00-F01-LIVE-VIEWPORT-DELIVERY1` — found while driving JURNL through DESIGN → VIEWPORT

| ID | Class | Defect | Repair | Proof |
|----|-------|--------|--------|-------|
| D-19 | DESIGN_WORKSPACE | VIEWPORT was hard-wired to a project's **first** family (`projectFamilies(slug)[0]`) — no way to select / open a family; F02+ could never be inspected. | FAMILY control built from the project's declared families (implemented → screens; not started → boundary); `?family=` deep link. | workspace tests; viewport QA phase A |
| D-20 | DESIGN_WORKSPACE | ROUTE / STATE controls did not follow navigation inside the live runtime; choosing a STATE after clicking through jumped the app back to the stale screen. | Controls follow runtime route messages without reloading the runtime; only an explicit control change remounts the iframe (keyed by selection). | viewport QA "SYNC" checks |
| D-21 | DESIGN_WORKSPACE | Runtime-review cards (FAMILY RUNTIME, JOURNEY REVIEW, MOBILE / TABLET / DESKTOP REVIEW, FOUNDER APPROVAL) opened the inspector (authority images) instead of the live app. | Cards open DESIGN → VIEWPORT for the family (and preset). | workspace tests; viewport QA phase A |
| D-22 | RUNTIME_ROUTING | No direct-preview entry from the workspace. | OPEN DIRECT PREVIEW — the same runtime URL as the viewport iframe (follows live navigation), no second app. | workspace tests; viewport QA phase E (same runtime module) |
| D-23 | RESPONSIVE_RENDERER | Project-runtime overlays (drawers, sheets, modals, handoffs) were mounted inside the scrolling screen column: when content is taller than the device (landscape, error-expanded forms, shorter desktop windows) they anchored to the bottom of the content and lost their height limit (long drawers could not scroll). | Overlay host pinned to the runtime viewport; every overlay primitive portals into it. | runtime test; viewport QA "LONG / SCROLLABLE DRAWER" in MOBILE LANDSCAPE |
| D-24 | HOST_PROJECT_FIREWALL | Design-inspection query switches (`?state` / `?overlay` / `?scenario` / `?os` / `?link`) were honoured in every runtime mode — a debug backdoor for a production shell. | Honoured in `design-preview` mode only. | runtime test "no debug surface in the user-facing app" |

## B. SITE 00 PLATFORM GAPS — FOUND, NOT REPAIRED (documented)

| ID | Class | Gap | Why not repaired here | Next step |
|----|-------|-----|----------------------|-----------|
| D-14 | DATA_MODEL | Server `FOUNDER_PROJECTS` + org UUID map (`api/_lib/site00Projects/`) do not contain JURNL; `/projects` index and `PersonalProjectsMobile` read only the server index. | Needs a real `site00_organizations` row (Supabase) — inventing a UUID would be a fake record. | Founder: create the JURNL org row, then add JURNL to `FOUNDER_PROJECTS` with its UUID. |
| D-17 | OTHER | JURNL end-user auth provider is unresolved. SITE 00 Supabase auth is the *studio's* auth, not JURNL customers'. | Sprint forbids a second auth system and fake success. | Founder decision: JURNL auth provider (Supabase project per product, or other). Adapter seam ready (`JurnlAuthAdapter`). |
| D-25 | OTHER (HOSTING) | Production release pipeline (`site00-production-deploy.yml`, auto-promote ON) has been red on every `main` run since at least #696: the `test` job fails on pre-existing failures (CI Supabase missing migrations, stale expression-engine assertions, …), so `build` / `deploy_frontend` never run and nothing reaches site00.com automatically. | Unrelated failures across ~64 test files; fixing them is outside this sprint. Bypassing the gate (legacy `deploy-godaddy.yml` dispatch) is a founder decision. | Founder: dispatch the legacy deploy or upload an emergency ZIP; separately, a CI-repair sprint (apply migrations to the CI database / update stale tests). |
| D-18 | OTHER | Apple / Google sign-in not configured for JURNL. | No provider credentials; boundary implemented, returns `PROVIDER_NOT_CONFIGURED`. | Configure providers with the chosen auth system. |

## C. JURNL AUTHORITY ISSUES (not SITE 00 defects)

| ID | Issue | Resolution |
|----|-------|-----------|
| J-01 | F02 transition authority labels F02 as "FAMILY FINANCE", while the F01.13 child authority's CTA is "CONTINUE TO SETUP". | Runtime follows the child authority: the F02 boundary is named SETUP (not implemented, holding surface only). **Resolved** by the founder product tree in P0.JURNL.MONETIZATION-FOUNDATION1 (02 SETUP). |
| J-02 | State sheets `STATES.EMAIL_RECOVERY` and `STATES.SECURITY_NETWORK` are off-brand (blue / yellow / dark UI). | Used for state *coverage* only; rendered in the JURNL palette. |
| J-03 | Password rule conflict (children: "8+ CHARACTERS / ONE NUMBER / ONE LETTER" vs interaction authorities: uppercase + number + special). | Interaction authorities win (latest, more specific): 8+ / UPPERCASE / NUMBER / SPECIAL. |
| J-04 | Validation authority requires the terms agreement; F01.01 child shows no checkbox. | Square agree checkbox added (validation authority). |
| J-05 | F01.11 / F01.12 eyebrow shows internal codes ("F01.11 PRIVACY PRIMER"). | Internal code dropped from user-facing eyebrow (host-language leak). |
| J-06 | F01.03 child shows a glitched logo. | Official logo used on every screen. |
| J-07 | Marble bust has no canonical asset (harvest failed). | Not reconstructed; recorded `MISSING` in the contract. First asset-first item for F02. |
| J-08 | Support channel, data-export pipeline and account deletion backend do not exist. | Boundaries implemented honestly (handoff / request recorded / confirmation); claims flagged (C10). |
| J-09 | Security / privacy claims in authorities (encryption, "SECURED BY APPLE", etc.). | 7 withheld, 4 flagged — see `F01_IMPLEMENTATION_DECISIONS.md`. |
