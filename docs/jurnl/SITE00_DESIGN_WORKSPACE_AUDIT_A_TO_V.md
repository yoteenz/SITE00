# SITE 00 DESIGN WORKSPACE — FORENSIC AUDIT A–V

Sprint: `P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1` · baseline `main@dde3e3d` · 2026-10-05

Method: the baseline repo was read and the **live runtime was opened** (Vite :5174, `/production/ndxbook/design?mode=*`,
`/production/jurnl/design`). Each item records what existed, what the runtime actually did, and what this sprint changed.
Verdicts: **WORKS** (verified in runtime) · **PARTIAL** · **MISSING** · **DEFECT** (exists but wrong).

| # | System | Baseline verdict | After sprint |
|---|--------|------------------|--------------|
| A | Project registry / ontology | PARTIAL | WORKS |
| B | Personal vs client handling | MISSING | WORKS |
| C | Design workspace project selector | DEFECT | WORKS |
| D | Project-reactive context | DEFECT | WORKS |
| E | Project-scoped asset mounting | PARTIAL | WORKS |
| F | Brand / design token injection | MISSING | WORKS (scoped) |
| G | Project component overrides | MISSING | WORKS (project runtime components) |
| H | Screen / page family representation | MISSING | WORKS (family contract) |
| I | Screen tree storage | MISSING | WORKS (data module) |
| J | Viewport preset machinery | PARTIAL | WORKS |
| K | Mobile / tablet / desktop renderer | PARTIAL (NDX only) | WORKS |
| L | Safe area / grid / bounds overlays | PARTIAL | WORKS |
| M | Design authority / reference ingestion | PARTIAL | WORKS (REFERENCE compare + inspector) |
| N | Asset library | PARTIAL | UNCHANGED (asset policy added) |
| O | Component library | MISSING (per project) | WORKS (component → runtime map) |
| P | Interaction authority system | MISSING | WORKS (manifest → bindings) |
| Q | Review / approval state | PARTIAL | WORKS (contract statuses + gate) |
| R | Project routing | DEFECT | WORKS |
| S | Design workspace runtime | MISSING (projects) | WORKS (registry-driven runtime mount) |
| T | OpenArt / expression pipeline hooks | EXISTS (not used) | NOT ACCESSED |
| U | Design workspace mode architecture | DEFECT (static NDX copy) | WORKS (project-reactive) |
| V | Host shell vs project body separation | PARTIAL | WORKS (iframe + scoped CSS firewall) |

---

## A. PROJECT REGISTRY / PROJECT ONTOLOGY

- **Found:** `shared/site00-studio-world-production/visualReconstruction/p0vr3m/managedProjectRegistry.ts` — the client-side
  managed project registry (`site00`, `frontal-slayer`, `studio-world`, `ndxbook`, `all-in-one`, `astral-world`). Server side:
  `api/_lib/site00Projects/projectRegistry.ts` (`FOUNDER_PROJECTS`) + `founderProjectDbId.ts` (slug → `site00_organizations` UUID).
- **Runtime:** the registry drives design routing and the hub list. There is no place to describe *what a product is*
  (product class, voice, viewport authority, families) — only marketing/design role flags.
- **Repair:** JURNL added to the managed registry (`projectType: PERSONAL_PRODUCT`, `ownership: FOUNDER`, `relationship: PERSONAL`,
  `projectRuntime: true`). New project-agnostic ingestion record `shared/site00-project-ingestion/` (`IngestedProjectRecord`:
  product class, status, current family / stage, tagline, voice, platform, viewport profile, brand profile, families, runtime profile).
- **Not changed:** server `FOUNDER_PROJECTS` — JURNL has no `site00_organizations` row; adding a fake UUID would be dishonest.
  Logged as a platform gap (see `SYSTEM_DEFECT_REPAIR_LOG.md` D-14).

## B. PERSONAL VS CLIENT PROJECT HANDLING

- **Found:** `projectType` was a free string; every managed project was a client/managed brand or infrastructure. No `ownership`
  / `relationship` concept. `PersonalProjectsMobile` reads only the server index.
- **Repair:** `ownership` + `relationship` on `Site00ManagedProjectRecord`; `isPersonalFounderProject()` in the ingestion registry;
  hub list appends PERSONAL managed projects even before the server index knows them; switcher subtitle shows `PERSONAL / FOUNDER`.

## C. DESIGN WORKSPACE PROJECT SELECTOR

- **Found:** `designProjectSelectorVisuals.ts` (canonical order + accents) existed, but the production host chrome PROJECT chip
  (`productionHub/chrome.tsx`) was a **non-interactive label** derived from the path. There was no way to switch project from
  inside DESIGN.
- **Repair:** the chip is now a real button (`data-testid="production-chrome-project"`) opening a host-styled PROJECTS menu
  (`production-project-menu`) built from the registry. `projectSwitchPath()` keeps the workspace + mode and drops stale query
  state (`?screen=`, `?state=`, `?inspect=` …). JURNL appended to the canonical selector order with the muted-rose accent.

## D. PROJECT-REACTIVE CONTEXT

- **Found (DEFECT):** `useProductionHubData` resolved the selected project with `projects.find(...) ?? projects[0]` — selecting an
  unknown project silently **showed another project's data** (NDXBOOK). Design modes rendered static NDX copy regardless of slug.
- **Repair:** `resolveHubProjectEntry()` never substitutes; DesignChamber renders `ProjectFamilyChamber` from the ingested project
  record for ingested projects; `ViewportChamber` is keyed by project slug so no viewport state survives a switch.

## E. PROJECT-SCOPED ASSET MOUNTING

- **Found:** project covers via `HubImage` slot ids `project.<id>.cover`; no per-project public asset root.
- **Repair:** `public/site00/projects/<slug>/…` (JURNL: `brand/`, `fonts/`, `f01/authorities/`). `projectCoverUrl()` resolves the
  cover. Authorities are served for inspection/reference only and never mounted as UI.

## F. BRAND / DESIGN TOKEN INJECTION

- **Found:** host tokens only (`site00-production-*.css`). No mechanism for a project's own palette/typography.
- **Repair:** project tokens live in the project runtime scope (`.jrn` custom properties, `@font-face` families `JURNL Display` /
  `JURNL Sans` served from the project's own font folder). Brand data (palette, typography, rules) lives in the ingestion record
  and is displayed by the host in host styling (BRAND mode) — tokens are never injected into host chrome.

## G. PROJECT COMPONENT OVERRIDES

- **Found:** none; NDX components are inside the NDX client app.
- **Repair:** project components are owned by the project runtime (`src/projects/jurnl/runtime/components/`); the family contract
  maps each canonical component ref to its runtime implementation (`JURNL_COMPONENT_RUNTIME`).

## H. SCREEN / PAGE FAMILY REPRESENTATION

- **Found:** no generic representation of a product family (parent / children / grandchildren / states / interactions).
- **Repair:** `shared/site00-product-families/familyProductionContract.ts` (project-agnostic schema) + `familyGate.ts`
  (implementation gate, completeness contract). JURNL F01 instance: `src/projects/jurnl/data/f01/contract.ts`.

## I. SCREEN TREE STORAGE

- **Found:** none.
- **Repair:** data-only modules `src/projects/jurnl/data/f01/screens.ts` (14 screens, routes, authorities, 27 state authorities),
  `interactionBindings.ts` (74 manifest rows), `coverage.ts`. Imported by the host inspector (data only, firewall-safe).

## J. VIEWPORT PRESET MACHINERY

- **Found:** `viewportTargets.ts` with host presets MOBILE 390×844 / MOBILE XL 430×932 / TABLET 834×1194 / DESKTOP 1440×900 —
  hard-coded; JURNL's authority is 393×852.
- **Repair:** `applyProjectViewportSize()` — a project-declared size wins for that preset (orientation / desktop lock preserved).
  JURNL MOBILE = 393×852, default preset MOBILE. Host presets unchanged for NDXBOOK.

## K. MOBILE / TABLET / DESKTOP RENDERER

- **Found:** `ViewportChamber` iframes the NDX client (`/app/preview/fixture-app-ndxbook` in dev, `/app/projects/<slug>` in prod) at
  exact logical px then scales. Works for NDX only.
- **Repair:** for runtime projects the iframe loads `/production/<slug>/runtime/<route>` at the exact target size. Tablet and desktop
  are real responsive layouts (`jurnl-screens.css` ≥600 / ≥1100), not scaled mobile.

## L. SAFE AREA / GRID / BOUNDS OVERLAYS

- **Found:** a SAFE AREA toggle drawing one generic inset box. No GRID, no BOUNDS.
- **Repair:** SAFE AREA draws the project's exact insets (phone 59/34, tablet 24/20) with bands; GRID draws the project grid per
  kind (phone 4 col / 32 margin / 12 gutter; tablet 8/64/24; desktop 12/96/24); BOUNDS measures `[data-runtime-bounds]` inside the
  runtime iframe live (600 ms). REFERENCE shows the screen authority beside the device.

## M. DESIGN AUTHORITY / REFERENCE INGESTION

- **Found:** authority images exist for NDX through the expression / experience compiler; no per-screen authority link for a project.
- **Repair:** each screen carries its authority file; the inspector (`?inspect=screens|states|interactions|…`) and the viewport
  REFERENCE toggle show them. Authorities are references, never runtime UI.

## N. ASSET LIBRARY

- **Found:** `src/site00/productionAssets/` registry + route manifests (provenance classes incl. `OPENART`).
- **Change:** none to the library. Asset classes / policy recorded in `shared/site00-product-families/assetFirstPolicy.ts`; F01 asset
  requirements recorded in the contract (bust = MISSING, harvest = NOT_CANONICAL, controls = IMPLEMENTATION_COMPONENT).

## O. COMPONENT LIBRARY

- **Found:** no per-project component registry.
- **Repair:** contract `components[]` + `JURNL_COMPONENT_RUNTIME` (17 refs → 13 runtime components); inspector COMPONENTS tab.

## P. INTERACTION AUTHORITY SYSTEM

- **Found:** none. The JURNL package ships `MANIFEST/F01_INTERACTION_MANIFEST.json` (74 rows, 11 interaction types).
- **Repair:** `interactionBindings.ts` imports the manifest and binds every row to a runtime trigger (`data-jrn-trigger`), surface
  and result; tests assert every trigger renders; inspector INTERACTIONS tab lists them.

## Q. REVIEW / APPROVAL STATE

- **Found:** production queue / inbox requests (`/production/queue`); no per-family approval lifecycle.
- **Repair:** contract statuses (`approvalStatus`, `implementationStatus`, `qaStatus`, `founderApproval`) per family and per screen;
  `evaluateFamilyGate()` shows SCREEN_COMPLETE vs FAMILY_COMPLETE. F01 parent = FOUNDER_APPROVED; family awaits founder runtime review.

## R. PROJECT ROUTING

- **Found (DEFECT):** `/production/:projectSlug/design` redirected (bounced) any slug that was not design-enabled; the viewport
  validation link was hard-coded to `/production/ndxbook/design/workspace`.
- **Repair:** JURNL registered design-enabled; new route `/production/:projectSlug/runtime/*` (internal production guard, no host
  layout) for project runtimes; validation link points to the project's own gate for runtime projects.

## S. DESIGN WORKSPACE RUNTIME

- **Found:** no way to mount a project's live UI inside SITE 00 besides the NDX client app.
- **Repair:** `src/site00/projectRuntime/projectRuntimeRegistry.ts` (slug → lazy loader), `ProjectRuntimeRoute.tsx`,
  runtime → host `postMessage` protocol (`site00-project-runtime`: route / handoff / family-boundary). Adding a project runtime is
  one registry line; no JURNL-specific host code.

## T. OPENART / EXPRESSION PIPELINE HOOKS

- **Found:** OpenArt references in `productionAssets/types.ts` (provenance enum), `studioos/experience-compiler/map2/*`
  (authority pack batches), loader media. These are pipeline bookkeeping.
- **This sprint:** **not accessed, not queried, not imported** by any JURNL or ingestion code (test-enforced).

## U. DESIGN WORKSPACE MODE ARCHITECTURE

- **Found (DEFECT):** modes BRAND / EXPERIENCE / SURFACES / COMPILER / ASSETS / VIEWPORT rendered a static NDX config for every slug.
- **Repair:** `projectFamilyChamber.ts` builds each mode from the ingested project + family data (no project literals);
  `ProjectFamilyChamber.tsx` reuses the canonical `pxa` chamber classes. NDXBOOK path untouched (tests assert the NDX iframe and copy).

## V. GLOBAL HOST SHELL VS PROJECT BODY SEPARATION

- **Found:** host chrome canonical CSS; no defined project body boundary.
- **Repair:** firewall rules (`src/projects/README.md`):
  1. `src/projects/<slug>/data` = data only (host may import);
  2. `src/projects/<slug>/runtime` = lazy-loaded only via the runtime registry, all styles under `.jrn`;
  3. the runtime renders in a same-origin iframe inside the host viewport stage, so host CSS cannot reach the body and project CSS
     cannot reach the chrome;
  4. tests parse every runtime stylesheet and fail on any selector not scoped to the project root, and on host imports.
