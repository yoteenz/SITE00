# SONNET — ROUTE → AUTHORITY MAP

Sprint `P0.SITE00.PUBLIC-REDESIGN.SONNET-STRUCTURE1` · produced BEFORE any visual change (Phase 0), then updated with the final component names.

## Pack ingest

| | |
|---|---|
| Total screens in the pack index | 40 |
| ACTIVE authorities (JPEG present) | **37** |
| SUPERSEDED (excluded, never implemented) | **3** — 01_OLD_REFINE_INTAKE_LAYOUT, 02_OLD_REFINE_CONDITION_LAYOUT, 03_OLD_REFINE_GAPS_LAYOUT |
| Note | This is the upload-safe "SONNET LITE" pack: the 3 superseded PNGs are intentionally omitted; their exclusion stays authoritative (`99_SUPERSEDED_DO_NOT_USE/README.md`). |
| Sequence rule | Folder path + numeric filename prefix. Upload chronology is NOT used. |

## 37 ACTIVE authorities → live routes

Every authority is **ACTIVE** (route exists) and **COVERED**. Authorities that have no prior equivalent screen (BLDR path panels, EVOLVE path panels, Build Ready verification) are new surfaces on **existing routes** (`?path=` on the `/state` route; `/idnty/build-ready/<step>`) — no new route entries were added to `Site00Routes.tsx`.

| # | Authority ID | Pack path | Live route (mobile) | Replaced / current component | New component | Status | Asset slots |
|---|---|---|---|---|---|---|---|
| 1 | `01_ORIGIN_MAIN` | `01_ORIGIN/01_ORIGIN_MAIN.jpg` | `/` | OriginPage (mobile branch) · OriginCards · StatusStrip · OriginMobileSwipeUp | `PublicOriginMobile` | ACTIVE · COVERED | YES (4) |
| 2 | `02_ORIGIN_IDNTY_EXPANDED` | `01_ORIGIN/02_ORIGIN_IDNTY_EXPANDED.jpg` | `/` | IdntyExpandedPanel · BldrExpandedPanel · EvolveExpandedPanel | `PublicOriginExpandedPanel` | ACTIVE · COVERED | YES (2) |
| 3 | `03_ORIGIN_BLDR_EXPANDED` | `01_ORIGIN/03_ORIGIN_BLDR_EXPANDED.jpg` | `/` | IdntyExpandedPanel · BldrExpandedPanel · EvolveExpandedPanel | `PublicOriginExpandedPanel` | ACTIVE · COVERED | YES (2) |
| 4 | `04_ORIGIN_EVOLVE_EXPANDED` | `01_ORIGIN/04_ORIGIN_EVOLVE_EXPANDED.jpg` | `/` | IdntyExpandedPanel · BldrExpandedPanel · EvolveExpandedPanel | `PublicOriginExpandedPanel` | ACTIVE · COVERED | YES (5) |
| 5 | `01_IDNTY_DIAGNOSTIC_OVERVIEW` | `02_IDNTY/00_DIAGNOSTIC/01_IDNTY_DIAGNOSTIC_OVERVIEW.jpg` | `/idnty/state` | IdntyStatePage (mobile) → IdntyMobileDiagnostic · IdntyStateGrid | `IdentityDiagnosticOverview` | ACTIVE · COVERED | YES (1) |
| 6 | `02_IDNTY_STATE_00_FOUNDATION` | `02_IDNTY/00_DIAGNOSTIC/02_IDNTY_STATE_00_FOUNDATION.jpg` | `/idnty/starting-at-zero` | IdntyAssessmentLandingPage → IdentityStateLandingV2 | `IdentityDiagnosticFlow(mode=detail)` | ACTIVE · COVERED | YES (2) |
| 7 | `03_IDNTY_STATE_01_REFINE` | `02_IDNTY/00_DIAGNOSTIC/03_IDNTY_STATE_01_REFINE.jpg` | `/idnty/some-pieces-exist` | IdntyAssessmentLandingPage → IdentityStateLandingV2 | `IdentityDiagnosticFlow(mode=detail)` | ACTIVE · COVERED | YES (2) |
| 8 | `04_IDNTY_STATE_02_EVOLUTION` | `02_IDNTY/00_DIAGNOSTIC/04_IDNTY_STATE_02_EVOLUTION.jpg` | `/idnty/ready-for-evolution` | IdntyAssessmentLandingPage → IdentityStateLandingV2 | `IdentityDiagnosticFlow(mode=detail)` | ACTIVE · COVERED | YES (2) |
| 9 | `05_IDNTY_STATE_03_BUILD_READY` | `02_IDNTY/00_DIAGNOSTIC/05_IDNTY_STATE_03_BUILD_READY.jpg` | `/idnty/build-ready` | IdntyAssessmentLandingPage → IdentityStateLandingV2 | `IdentityDiagnosticFlow(mode=detail)` | ACTIVE · COVERED | YES (2) |
| 10 | `01_FOUNDATION_PRIMARY_GOAL` | `02_IDNTY/01_FOUNDATION/01_FOUNDATION_PRIMARY_GOAL.jpg` | `/idnty/starting-at-zero/goal` | IdntyAssessmentStepPage → IdentityCalibrationMobileStep | `IdentityDiagnosticFlow(mode=question)` | ACTIVE · COVERED | YES (2) |
| 11 | `02_FOUNDATION_AUDIENCE` | `02_IDNTY/01_FOUNDATION/02_FOUNDATION_AUDIENCE.jpg` | `/idnty/starting-at-zero/audience` | IdntyAssessmentStepPage → IdentityCalibrationMobileStep | `IdentityDiagnosticFlow(mode=question)` | ACTIVE · COVERED | YES (1) |
| 12 | `03_FOUNDATION_TIMELINE` | `02_IDNTY/01_FOUNDATION/03_FOUNDATION_TIMELINE.jpg` | `/idnty/starting-at-zero/timeline` | IdntyAssessmentStepPage → IdentityCalibrationMobileStep | `IdentityDiagnosticFlow(mode=question)` | ACTIVE · COVERED | YES (1) |
| 13 | `04_FOUNDATION_BUDGET` | `02_IDNTY/01_FOUNDATION/04_FOUNDATION_BUDGET.jpg` | `/idnty/starting-at-zero/budget` | IdntyAssessmentStepPage → IdentityCalibrationMobileStep | `IdentityDiagnosticFlow(mode=question)` | ACTIVE · COVERED | YES (1) |
| 14 | `05_FOUNDATION_REVIEW` | `02_IDNTY/01_FOUNDATION/05_FOUNDATION_REVIEW.jpg` | `/idnty/starting-at-zero/review` | IdntyAssessmentReviewPage → IdentityCalibrationMobileReview | `IdentityDiagnosticFlow(mode=review)` | ACTIVE · COVERED | YES (1) |
| 15 | `01_REFINE_EXISTING_ASSETS` | `02_IDNTY/02_REFINE/01_REFINE_EXISTING_ASSETS.jpg` | `/idnty/some-pieces-exist/assets` | IdntyAssessmentStepPage → IdentityCalibrationMobileStep | `IdentityDiagnosticFlow(mode=question)` | ACTIVE · COVERED | YES (2) |
| 16 | `02_REFINE_CONDITION` | `02_IDNTY/02_REFINE/02_REFINE_CONDITION.jpg` | `/idnty/some-pieces-exist/cohesion-diagnostic` | IdntyAssessmentStepPage → IdentityCalibrationMobileStep | `IdentityDiagnosticFlow(mode=question)` | ACTIVE · COVERED | YES (1) |
| 17 | `03_REFINE_GAPS` | `02_IDNTY/02_REFINE/03_REFINE_GAPS.jpg` | `/idnty/some-pieces-exist/gaps` | IdntyAssessmentStepPage → IdentityCalibrationMobileStep | `IdentityDiagnosticFlow(mode=question)` | ACTIVE · COVERED | YES (1) |
| 18 | `04_REFINE_REVIEW` | `02_IDNTY/02_REFINE/04_REFINE_REVIEW.jpg` | `/idnty/some-pieces-exist/review` | IdntyAssessmentReviewPage → IdentityCalibrationMobileReview | `IdentityDiagnosticFlow(mode=review)` | ACTIVE · COVERED | YES (1) |
| 19 | `01_EVOLUTION_AREAS` | `02_IDNTY/03_READY_FOR_EVOLUTION/01_EVOLUTION_AREAS.jpg` | `/idnty/ready-for-evolution/pathways` | IdntyAssessmentStepPage → IdentityCalibrationMobileStep | `IdentityDiagnosticFlow(mode=question)` | ACTIVE · COVERED | YES (2) |
| 20 | `02_EVOLUTION_GOALS` | `02_IDNTY/03_READY_FOR_EVOLUTION/02_EVOLUTION_GOALS.jpg` | `/idnty/ready-for-evolution/goals` | IdntyAssessmentStepPage → IdentityCalibrationMobileStep | `IdentityDiagnosticFlow(mode=question)` | ACTIVE · COVERED | YES (1) |
| 21 | `03_EVOLUTION_TIMELINE` | `02_IDNTY/03_READY_FOR_EVOLUTION/03_EVOLUTION_TIMELINE.jpg` | `/idnty/ready-for-evolution/timeline` | IdntyAssessmentStepPage → IdentityCalibrationMobileStep | `IdentityDiagnosticFlow(mode=question)` | ACTIVE · COVERED | YES (1) |
| 22 | `04_EVOLUTION_REVIEW` | `02_IDNTY/03_READY_FOR_EVOLUTION/04_EVOLUTION_REVIEW.jpg` | `/idnty/ready-for-evolution/review` | IdntyAssessmentReviewPage → IdentityCalibrationMobileReview | `IdentityDiagnosticFlow(mode=review)` | ACTIVE · COVERED | YES (1) |
| 23 | `01_BUILD_READY_VERIFICATION` | `02_IDNTY/04_BUILD_READY/01_BUILD_READY_VERIFICATION.jpg` | `/idnty/build-ready/verification` | IdntyAssessmentStepPage (services / scope / timeline form) | `IdentityDiagnosticFlow(mode=question) + BuildReadyVerificationList` | ACTIVE · COVERED | YES (2) |
| 24 | `02_BUILD_READY_EVIDENCE` | `02_IDNTY/04_BUILD_READY/02_BUILD_READY_EVIDENCE.jpg` | `/idnty/build-ready/evidence` | IdntyAssessmentStepPage (services / scope / timeline form) | `IdentityDiagnosticFlow(mode=question) + BuildReadyEvidenceList` | ACTIVE · COVERED | YES (1) |
| 25 | `03_BUILD_READY_AUTHORITY_CHECK` | `02_IDNTY/04_BUILD_READY/03_BUILD_READY_AUTHORITY_CHECK.jpg` | `/idnty/build-ready/authority-check` | IdntyAssessmentStepPage (services / scope / timeline form) | `IdentityDiagnosticFlow(mode=question) + BuildReadyAuthorityCheckList` | ACTIVE · COVERED | YES (1) |
| 26 | `04_BUILD_READY_REVIEW_VERIFICATION` | `02_IDNTY/04_BUILD_READY/04_BUILD_READY_REVIEW_VERIFICATION.jpg` | `/idnty/build-ready/review` | IdntyAssessmentReviewPage → IdentityCalibrationMobileReview | `IdentityDiagnosticFlow(mode=review) + BuildReadyReview` | ACTIVE · COVERED | YES (1) |
| 27 | `01_BLDR_COMMAND_CENTER` | `03_BLDR/01_BLDR_COMMAND_CENTER.jpg` | `/bldr/state` | BldrStatePage (mobile) → BldrClassificationMobile | `BuilderCommandCenter` | ACTIVE · COVERED | YES (6) |
| 28 | `02_BLDR_OVERVIEW` | `03_BLDR/02_BLDR_OVERVIEW.jpg` | `/bldr/state?path=overview` | none (nearest: BldrHubPage / BldrEntryPage) | `BuilderPathPanel` | ACTIVE · COVERED | YES (3) |
| 29 | `03_BLDR_SITE` | `03_BLDR/03_BLDR_SITE.jpg` | `/bldr/state?path=site` | none (nearest: BldrHubPage / BldrEntryPage) | `BuilderPathPanel` | ACTIVE · COVERED | YES (3) |
| 30 | `04_BLDR_WORLD` | `03_BLDR/04_BLDR_WORLD.jpg` | `/bldr/state?path=world` | none (nearest: BldrHubPage / BldrEntryPage) | `BuilderPathPanel` | ACTIVE · COVERED | YES (3) |
| 31 | `05_BLDR_SYSTEMS` | `03_BLDR/05_BLDR_SYSTEMS.jpg` | `/bldr/state?path=systems` | none (nearest: BldrHubPage / BldrEntryPage) | `BuilderPathPanel` | ACTIVE · COVERED | YES (3) |
| 32 | `06_BLDR_EXTENSIONS` | `03_BLDR/06_BLDR_EXTENSIONS.jpg` | `/bldr/state?path=extensions` | none (nearest: BldrHubPage / BldrEntryPage) | `BuilderPathPanel` | ACTIVE · COVERED | YES (3) |
| 33 | `01_EVOLVE_INTERVENTION_CENTER` | `04_EVOLVE/01_EVOLVE_INTERVENTION_CENTER.jpg` | `/evolve/state` | EvolveStatePage (mobile) → EvolveMobileExperience | `EvolveInterventionCenter` | ACTIVE · COVERED | YES (5) |
| 34 | `02_EVOLVE_REFINE` | `04_EVOLVE/02_EVOLVE_REFINE.jpg` | `/evolve/state?path=refine` | none (nearest: EvolveHubPathCard) | `EvolvePathPanel` | ACTIVE · COVERED | YES (2) |
| 35 | `03_EVOLVE_INSTALL` | `04_EVOLVE/03_EVOLVE_INSTALL.jpg` | `/evolve/state?path=install` | none (nearest: EvolveHubPathCard) | `EvolvePathPanel` | ACTIVE · COVERED | YES (2) |
| 36 | `04_EVOLVE_TRANSFORM` | `04_EVOLVE/04_EVOLVE_TRANSFORM.jpg` | `/evolve/state?path=transform` | none (nearest: EvolveHubPathCard) | `EvolvePathPanel` | ACTIVE · COVERED | YES (2) |
| 37 | `01_LOCATIONS_MAIN` | `05_LOCATIONS/01_LOCATIONS_MAIN.jpg` | `/origin/locations` | LocationsPage → Site00MobileShell · LocationsDirectory · DirectoryCard | `PublicLocationsDirectory` | ACTIVE · COVERED | YES (8) |

Per-record data/state source and interaction behavior: see `SONNET-AUTHORITY-IMPLEMENTATION-PLAN.json`.

## Current data / state sources reused (function kept)

- **IDNTY:** `useIdntyAssessment` (localStorage `site00_idnty_assessment_v1`) + `useIntakeSync` → `/api/site00/intakes` (`site00_idnty_submissions`). Answers keep their legacy step ids/keys; no schema change.
- **Origin:** `Site00Context.homeMode` (`origin | idnty-expanded | bldr-expanded | evolve-expanded`), `useOriginLocationsTransition`, `origin-background-assets` (approved CLEAN plate stays mounted).
- **BLDR / EVOLVE:** `Site00Context.selectBuildClass / selectEvolvePath`, `useBldrAssessment`, `useEvolveAssessment`; assessment routes unchanged.
- **Locations:** `config/locations-directory.ts`, `resolveDirectoryEntryHref`, `useSignedInFromStorage`.

## Uncovered live routes (UNCOVERED → WAITING_FOR_AUTHORITY, **visually untouched**)

| Route | Reason |
|---|---|
| `/bldr` | BLDR hub / build-process page — not in this pack. |
| `/bldr/start` | BLDR direction entry — not in this pack. |
| `/bldr/:classSlug/*` | BLDR assessment / intake steps — additional Builder pages pending. |
| `/evolve` | EVOLVE hub (long marketing page) — not in this pack. |
| `/evolve/:pathSlug/*` | EVOLVE assessment steps — additional Evolve pages pending. |
| `/evolve/marketing/*` | EVOLVE marketing services — not in this pack. |
| `/idnty/:state/complete` | IDNTY completion — no authority supplied. |
| `/idnty/:state/discovery-result` | IDNTY discovery result — no authority supplied. |
| `/origin/sign-in` | Auth — no authority supplied. |
| `/origin/create-account` | Auth — no authority supplied. |
| `/sites` | Locations child page — no authority supplied. |
| `/services` | Locations child page — no authority supplied. |
| `/system` | Locations child page — no authority supplied. |
| `/about` | Locations child page — no authority supplied. |
| `/journal` | Locations child page — no authority supplied. |
| `/checkout/*` | Checkout pages — authority arrives in a later pack; do not invent. |

Their function, data and routing are unchanged. Nothing was invented to mirror adjacent screens.

## Current public shell components (Phase 0 findings)

- Router shells: `Site00PublicRouteShell` (public pages), `Site00OriginRouteShell` (Origin) → `Site00MobilePresentationShell` (phone native / laptop phone artboard) or `Site00DesktopPresentationShell` (1440 artboard).
- Legacy mobile chrome: `Site00MobileShell` (header + fast-travel + bottom nav), `MobileSiteNavigation` (ORIGIN · IDNTY · LOCATIONS · PROJECTS · CTRL ROOM — kept and reused).
- **New:** `PublicRedesignShell` · `PublicTechnicalHeader` · `SpatialEnvironmentFrame` · `AssetSlot` (`src/site00/components/public-redesign/`).

## Typography system (Phase 0 finding)

Host typography is **Martian Mono** (`--site00-font-family` in `styles/tokens.css`, loaded in `site00-fonts.css`). It is **host/interface** type, not client brand type. The redesign keeps it and enforces uppercase at the presentation layer (`text-transform: uppercase` on `.s00pr`; typed field content is the only exception). The Origin wordmark uses a serif fallback stack (authority serif not yet matched).

## Asset loading patterns (Phase 0 finding)

Remote Supabase storage URLs (`resolveSite00PublicAsset`, `site00SupabasePublicStorageBase`) for Origin plates, panel icons and framework icons; nav/state icons are live SVG. In an offline sandbox all remote images fail — the redesign never depends on them for layout.

## Mobile breakpoints (Phase 0 finding)

- `≥768px` default preview mode = **desktop** (`defaultPreviewDeviceModeForViewport`) → legacy desktop artboard branches (preserved). Mobile preview mode (session key `site00_preview_device_mode`) renders the phone artboard (390×844).
- `/origin/locations` is mobile-only (`max-width: 767px`), redirecting to `/origin` above that (existing behavior).

## Reusable hooks

`useIdntyAssessment` (+ new `submitAssessment`), `useIntakeSync` (autosave now coalesces patches and flushes before submit), `useBldrAssessment`, `useEvolveAssessment`, `useOriginLocationsTransition`, `useSignedInFromStorage`.
