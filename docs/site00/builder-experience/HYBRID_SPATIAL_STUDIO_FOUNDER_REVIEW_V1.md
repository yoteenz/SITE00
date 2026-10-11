# SITE 00 Builder — Hybrid Spatial Studio: visual implementation + founder review V1

**Sprint:** `P0.SITE00.BUILDER.HYBRID-SPATIAL-STUDIO.V1-APPROVED-VISUAL-IMPLEMENTATION-AND-FOUNDER-REVIEW1` · OPUS
**Baseline:** `origin/main` @ `7cbcd11a` (PR #1522), which is newer than the reported `1da72cea` (#1521). PRs #1512, #1518–#1522 are in the baseline.
**Visual authority:** `wireframes/BUILDER_APPROVED_SPATIAL_FOUR_ROOMS.jpg`, `wireframes/BUILDER_APPROVED_BLUEPRINT_REVEAL.jpg`.
**Founder approval of this implementation:** **PENDING FOUNDER APPROVAL.** No further design iteration starts without founder review.
**Release:** none. The studio stays behind `VITE_SITE00_TEMPLATE_SYSTEM_V1` (off by default; on only for the cloud dev preview tunnel, per #1522).

Companion documents:

- `hybrid-spatial-studio/FOUNDER_REVIEW_SUMMARY.md`
- `hybrid-spatial-studio/PRODUCTION_ACTIVATION_GAP_REPORT.md`
- `hybrid-spatial-studio/GROK_ASSET_REQUEST_MANIFEST.md`
- `hybrid-spatial-studio/founder-review-qa/` (captures, comparisons and `founder-loop-results.json`)

Status words used in this document: **IMPLEMENTED** (code exists) · **TESTED** (automated test or live check passed) · **VISUALLY VERIFIED** (seen in a live browser capture) · **PARTIAL** · **BLOCKED** · **DEFERRED** · **PENDING FOUNDER APPROVAL**.

---

## 01 · Repository and contract reconciliation

| Finding | What changed |
|---|---|
| `main` had moved 13 commits past my branch: Composer's spatial contracts (#1518), a role redirect, a typecheck fix (#1519), an intake audit (#1520), the server binding (#1521) and preview flags (#1522). | Merged `origin/main` into the branch (no rebase, no force-push). All Composer work is preserved. |
| Composer owns state and persistence: `SpatialBuilderState`, `spatialSelectionToBuilder`, `snapshotFromSpatialState`, `useBuilderSpatialIntakeSession`. The canonical route is `/bldr/studio`. The scaffold UI was marked "replace, do not extend". | The studio was rebound onto Composer's hook and state. The **competing engine was removed**: the `useStudioDraft` local draft, the `submitBlueprint.ts` adapter and the private `toSelection` mapping. The `/bldr/builder` route and Composer's scaffold (`BldrSpatialStudioPage` body, `components/bldr/spatial-studio/*`, `site00-builder-spatial-studio.css`) were replaced by the studio at **`/bldr/studio/:room`**. |
| One route tree only. | `/bldr/studio/*` mounts the studio full-bleed (`Site00Layout` + `Site00Suspense`, no phone-artboard shell). Rooms are sub-paths. `?intakeId=` resumes. The desktop legacy redirect is kept. |
| No new intake database or submission API. | Every save, submit and founder action goes through `/api/site00/intakes` and `/api/admin/site00-intakes` (`site00_bldr_intakes`). The admin client gained a thin `requestRevision` wrapper for the server action Composer had already shipped. |

The presentation registry (`builder-studio/studioModel.ts`) now reads the contract's ids and hints and words them for the rooms. It holds no mapping, estimate or readiness rule of its own. Room access is the contract's `canEnterRoom`. Readiness is the contract's `submission_ready` / `submission_blockers`.

**Contract consequences, shown truthfully rather than worked around:**

- FEEL offers the contract's four directions (MODERN · BOLD · EDITORIAL · IMMERSIVE). WARM and OPERATIONAL from the previous sprint are gone.
- STRUCTURE is fixed by the contract's mapping. The Blueprint's STRUCTURE tab is read-only.
- The core-included strip shows only what the selection backs: WEBSITE and MOBILE. SEO and ANALYTICS are no longer claimed.
- The SIMPLE path plus SHOP, MEMBER AREA or PORTAL raises a contract `NEEDS_DECISION`. The studio asks first, and **ADD IT · MOVE TO ADVANCED** sets the path to ADVANCED, which is the contract's own resolution.
- **A CUSTOM path can never be submitted** (`BLUEPRINT_INCOMPLETE`: typography, colour, image and motion lines stay open). This is reported as **BLOCKED (contract)**, not patched: see R-01. The client sees the exact reason, and the draft stays saved with SITE 00.

## 02 · Four-room builder — IMPLEMENTED · TESTED · VISUALLY VERIFIED (mobile, tablet, desktop)

The rooms keep the approved composition from the previous sprint, now driven by `SpatialBuilderState`:

- **Shell:** wordmark, save status, menu, room id, headline, lede, persistent stage, CTA and progress rail.
- **Build Object:** the three.js model, unchanged in approach. Palettes are keyed to the four contract directions.
- **01 PLACE:** four path cards with live thumbnails, plus stage arrows.
- **02 FEEL:** caption and a four-card rail.
- **03 WORK:** six toggles around the structure, the level decision, core included, comes-with notes. At least one capability is required.
- **04 PACE:** STANDARD / EXPEDITED / FLEXIBLE. EXPEDITED is disabled when the estimator says priority would not shorten the work. Notes become `paceNotes`, the custom direction note for CUSTOM. Pace must be chosen, per the contract's `PACE_NOT_CHOSEN`.

## 03 · Blueprint reveal — IMPLEMENTED · TESTED · VISUALLY VERIFIED

Five tabs: OVERVIEW, STRUCTURE, PAGES, FEATURES, TIMELINE.

- Every figure comes from `snapshot.estimate` (`builderEstimateView`). The estimate is shown only on the Blueprint and only when `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1` is on (`revealEstimateForRoom`); otherwise it reads "AT REVIEW".
- No reference values are hardcoded. Live check C07 shows the range moving with the configuration, from `$17,000 – $32,000` to `$38,000 – $76,000`.
- Once submitted, the Blueprint renders **the submitted version from the server record**, not the local cache, and is labelled "VERSION N AS SUBMITTED · LOCKED FOR REVIEW".

## 04 · Save status and persistence — IMPLEMENTED · TESTED · VISUALLY VERIFIED

The header chip shows the contract's `syncStatus`, worded by `useStudioSession.saveIndicator`.

| State | When | Verified |
|---|---|---|
| RESTORING | Hydrating from SITE 00 (`?intakeId` or the stored intake) | C01, C14 |
| SAVING | A change has not reached the server, including during the hook's ~900 ms debounce | live |
| SAVED · time | Only when the server's copy holds the same choices as the screen | C01, C05 |
| LOCAL ONLY + RETRY | SITE 00 unreachable. Retry starts the intake. | C15 |
| SYNC FAILED + RETRY | An autosave failed. The on-device copy is kept. | C16, C17 |
| CONFLICT · KEEPING NEWER → "CONFLICT RESOLVED" | The device held newer, different choices than SITE 00. They are kept and pushed. | C17b |
| SUBMITTING / SUBMITTED / NOT SUBMITTED | The submission phases | C09–C11, C18 |

Two honesty fixes were made on top of the hook:

- The hook kept reporting SAVED during its autosave debounce. The adapter compares the server copy with the screen instead.
- The hook flags a "conflict" whenever the local timestamp is newer. Its bootstrap re-stamps the local copy on every load, so every reload looked like a conflict. A conflict is now shown only when the choices actually differ.

## 05 · Blueprint submission — IMPLEMENTED · TESTED (real handler, memory store) · Supabase BLOCKED

- SUBMIT FOR REVIEW calls the hook's `submitForReview`: it flushes the draft, then calls `/api/site00/intakes?action=submit`. The server builds a versioned `BuilderSpatialSubmittedPayload` (`current` + `history`, estimator version, full snapshot with the estimate) and validates readiness with the same rules.
- The CTA is enabled only when `submission_ready`, an intake exists and nothing is in flight.
- Guests must leave an email first, through the reused `IntakeGuestAccessCapture`, so SITE 00 can reply and the client can return.
- Success is shown **only** when the server returns `SUBMITTED` with a parsed spatial submission ("SUBMISSION RECEIVED · BLD-… · VERSION 1").
- Duplicate submission is prevented: the CTA is disabled, exactly one submit call is made (C10), and the server is idempotent.
- **No fake success:**
  - If SITE 00 is unreachable, submission is unavailable and the client is told why.
  - If the final save fails, nothing is submitted (C18). This needed a hook fix, H-2.

## 06 · Client post-submission states — IMPLEMENTED · TESTED · VISUALLY VERIFIED (except ACCEPTED)

`reviewModel.clientReviewState` reads only the intake record:

| Record | Client sees | Verified |
|---|---|---|
| `SUBMITTED`, version 1 | SUBMISSION RECEIVED · AWAITING FOUNDER REVIEW | C13, capture 06 |
| `IN_REVIEW` | UNDER REVIEW | C19 |
| `ACTIVE` + `revisionOpen` | REVISION REQUESTED, with the founder's message and the version it applies to. Version N stays inspectable. | C20, capture 07 |
| `SUBMITTED`, version > 1 | REVISION SUBMITTED | C22, capture 07b |
| `CONVERTED` | ACCEPTED · NEXT STEP AVAILABLE (with project link) or "SITE 00 WILL CONTACT YOU" | unit test only. No canonical CONVERTED path exists to drive live. |
| `ARCHIVED` | CLOSED | unit-level |
| REFINED ESTIMATE AVAILABLE | **never shown**: no contract (R-03) | — |

The Blueprint stays central: the state sits above the tabs, and there is no dashboard or portal. Rooms 01–04 lock while submitted (C12). The account intake page now links "OPEN YOUR BLUEPRINT →" instead of printing the payload JSON (IMPLEMENTED; not browser-verified, because it needs Supabase auth).

## 07 · Founder Blueprint review — IMPLEMENTED · TESTED · VISUALLY VERIFIED (desktop)

`admin/components/operations/BuilderBlueprintReview.tsx` sits inside the existing `/admin/site00/intakes/builder/:id`.

- **Header:** client email and owner kind, build kind and level, stage badge, latest version and date.
- **Actions:** OPEN BLUEPRINT (Build Object, facts, pages, what changed) · INSPECT CONFIGURATION (rooms plus the canonical selection) · REVIEW ESTIMATE (initial, automated, not a quote, with assumptions) · VIEW VERSION HISTORY · VIEW CLIENT RESPONSE · REOPEN REVISED BLUEPRINT · MARK IN REVIEW · REQUEST REVISION.
- **Separation panel:** informational review vs revision request vs refined commercial estimate (not available) vs project acceptance (manual and gated).
- Raw JSON moved into a collapsed "DIAGNOSTICS" block. The generic header MARK IN REVIEW is hidden for these intakes, so the guarded one is the only path.

## 08 · Revision and resubmission — IMPLEMENTED · TESTED · VISUALLY VERIFIED

1. The founder requests a revision, using the existing server action. The record moves to `ACTIVE` with `revisionOpen` and a request tied to `forSubmissionVersion` (F03).
2. The client sees the request, edits and resubmits as **version 2**.
3. Version 1 is preserved unchanged in `history` (C21), and the audit log records `INTAKE_RESUBMITTED` (F04).
4. The founder sees REVISED · AWAITING REVIEW (F05), with V1 marked SUPERSEDED.
5. VIEW CLIENT RESPONSE pairs the request with version 2 and lists the changes (WORK, CLIENT NOTE, investment, window) (F06).

## 09 · Outdated decisions — IMPLEMENTED · TESTED

Before MARK IN REVIEW or REQUEST REVISION, the review re-reads the record. If the version or status moved since the founder looked, it refuses, reloads and keeps the revision form closed, so the old message cannot re-target the new version.

Live check F07: the founder's page showed v2, and v3 arrived behind it. The request was refused ("VERSION 3 ARRIVED WHILE YOU WERE REVIEWING VERSION 2"), and the record and audit log were unchanged.

This guard is client-side because the admin API takes no expected version. The server-side guard is request R-02.

## 10 · Project activation — manual, unchanged

Activation stays manual: CONVERTED plus a project link through BLDR operations. Nothing activates automatically (F08). The review shows `builderProjectActivationHint` blockers. See `PRODUCTION_ACTIVATION_GAP_REPORT.md`.

## 11 · Grok assets

`hybrid-spatial-studio/GROK_ASSET_REQUEST_MANIFEST.md` now carries the full field set per asset, plus ASSET BLOCKED / PARTIAL status. No asset was generated. The live procedural Build Object stands in for all of them.

## 12 · Visual QA — VISUALLY VERIFIED for the listed captures; fidelity PENDING FOUNDER APPROVAL

Live Chromium captures (software WebGL) are in `hybrid-spatial-studio/founder-review-qa/`:

| # | Capture | Viewport |
|---|---|---|
| 01–05 | `mobile-01-place` … `mobile-05-blueprint` (plus `mobile-03-work-decision`, `mobile-05b-submit-sheet`) | 390×844 @2x |
| 06 | `mobile-06-client-submission-received` (+ `-full`, `06a` sheet) | mobile |
| 07 | `mobile-07-client-revision-requested` (+ `-full`, `07b` revision submitted) | mobile |
| 08 | `desktop-08-founder-blueprint-review` (+ `08b` configuration, `08c` estimate) | 1440×900 |
| 09 | `desktop-09-founder-revision-request`, `09b` after request | desktop |
| 10 | `desktop-10-founder-revised-blueprint` (+ `10b` client response, `10c` version history, `10d` outdated decision refused) | desktop |
| — | `tablet-01…06`, `desktop-01…06` | 834×1194, 1440×900 |
| — | `mobile-state-local-only`, `mobile-state-sync-failed`, `mobile-state-submit-failed` | mobile |
| — | `comparisons/cmp-*.jpg`: reference vs implementation, rooms 01–05 | mobile |

**Fidelity gaps that remain** (carried from V1, plus new ones):

- Procedural materials and backdrops, not photoreal (GA-01…08).
- The reference phones are taller than 390×844, so vertical rhythm is compressed.
- Core-included shows two tiles, not the reference's four (R-09).
- PACE has no preselected STANDARD: the contract requires an explicit choice.
- There is no AR button (GA-09).

## 13 · Functional QA — 32/32 PASS (real handlers, memory store)

Script: `scripts/site00/builder-studio-qa/founder-loop.cjs`. Results: `founder-review-qa/founder-loop-results.json`.

- The browser talks to the **real** `api/site00/intakes.ts` handler and the **real** admin service functions on the intake service's in-memory store, through `qa-api-server.ts`.
- The admin HTTP auth check is skipped there, because it needs a Supabase session. The harness refuses to run unless the memory store is active.
- Every check reads the record back from the service.

**Supabase-backed persistence was not exercised: BLOCKED** (no Supabase reachable from this environment). No claim is made that production persistence is verified.

## 14 · Tests — TESTED

- `vitest`, builder suites: 6 files, 47 tests pass.
  - `studioModel.test.ts` (12): contract ids, room rule, level decision, CUSTOM gap recorded, compositions, save-status truth, copy rules.
  - `reviewModel.test.ts` (2): the full loop through `intakeService` with the memory store.
  - Composer's `spatialStudio`, `intakeDraft` and `spatialIntakeSubmit` tests, plus `builderExperience`.
- Intake service suites: 3 files, 51 tests pass.
- `tsc --noEmit` is clean.
- `vite build` succeeds: `vendor` is unchanged at 461 kB; `three` stays a separate lazy chunk at 530 kB (133 kB gzip).
- **Flags off, production build:** `/bldr/studio/*` and `?intakeId=` redirect to `/bldr`, with no intake API calls.

## 15 · Missing contracts and requests (Composer / founder)

| # | Request | Why |
|---|---|---|
| R-01 | **CUSTOM path is never submittable.** Proposed: make TYPE / COLOR / IMAGE / MOTION "defined in custom direction" (not open) when `expression.primary === 'CUSTOM'`, or carry the FEEL system as `secondary` and set its defaults. | Blocks one of four paths. Founder decision on what a CUSTOM submission must contain. |
| R-02 | Admin actions accept `expectedSubmissionVersion` and reject a mismatch server-side. | The client-side guard has a race window. |
| R-03 | Refined commercial estimate contract (founder range, reason, version link, client visibility). | Without it, REFINED ESTIMATE AVAILABLE cannot exist. |
| R-04 | A canonical CONVERTED / accept action for spatial intakes (today only legacy BLDR ops). | Acceptance is manual and outside the canonical inbox. |
| R-05 | Flush the debounced autosave on `pagehide`. | A change made in the last ~900 ms reaches SITE 00 only on the next visit, through conflict recovery. |
| R-06 | Strip `revisionRequests[].adminEmail` and, when the preview flag is off, the estimate from **client** reads of the intake. | The client API returns the founder's admin email and the estimate snapshot. The studio does not display them; the payload still contains them. |
| R-07 | Token-scoped resume instead of a bare `?intakeId` (anonymous direct access). | The intake id currently acts as a bearer link for guest intakes. |
| R-08 | Do not re-stamp `savedAt` when the bootstrap re-persists the local copy. | It causes timestamp-only "conflicts" (masked in the UI by comparing choices). |
| R-09 | SEO and analytics in the selection, or drop them from the reference. | The approved WORK reference shows them as included. |
| R-10 | Structure follows the path only (ADVANCED → EDITORIAL even for a shop). Add a structure suggestion or field. | The previous STRUCTURE picker was removed to respect the contract. |
| R-11 | FEEL has four directions. Decide whether SOFT_ORGANIC / INDUSTRIAL_COMMAND should be reachable. | Two canonical systems cannot be reached from the studio. |
| R-12 | Live client updates (poll or push) are not in the hook; the client sees founder actions on return or reload. | It is a return experience by design; noted. |

**Composer-owned files touched (minimal correctness fixes — please review):**

| # | File | Fix |
|---|---|---|
| H-1 | `useIntakeSync.ts` | `flushAutosave` returns `Promise<boolean>` (additive; no other caller). |
| H-2 | `useBuilderSpatialIntakeSession.ts` | `submitForReview` stops if the final flush failed, instead of submitting an older server draft. |
| H-3 | `useBuilderSpatialIntakeSession.ts` | `resetSession` re-runs the bootstrap. START OVER previously stuck at RESTORING and never started a new intake. |
| H-4 | `useBuilderSpatialIntakeSession.ts` | The bootstrap re-arms after a cancelled run. Under React StrictMode (dev) it never finished; `ensureStarted` still de-duplicates the start. |

Untouched:

- mapping, readiness, the Build Object contract and estimator math
- server intake code and migrations
- Digital Foundation, Studio OS and Studio World

## 16 · Founder review summary

See `hybrid-spatial-studio/FOUNDER_REVIEW_SUMMARY.md`.

## 17 · Release status and risks

| Item | Status |
|---|---|
| Builder flags | Unchanged. Off by default; on only on the cloud dev preview (#1522). |
| Production release | **Not authorized; none performed.** |
| Paid workflows | None activated. |
| Production readiness | **Not claimed.** Supabase persistence untested here. R-01, R-02 and R-06 are open. |
| Visual fidelity | **PENDING FOUNDER APPROVAL.** Procedural assets; see §12. |
