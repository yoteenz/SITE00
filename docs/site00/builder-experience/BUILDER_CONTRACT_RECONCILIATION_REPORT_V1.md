# Builder Hybrid Spatial Studio — contract reconciliation report V1

Sprint: `P0.SITE00.BUILDER.HYBRID-SPATIAL-STUDIO.V1-COMPOSER-CONTRACT-RECONCILIATION-AND-FOUNDER-PREVIEW-READINESS1`  
Agent: **Composer** · Baseline **`origin/main`** (verify SHA at merge; do not assume older baselines).

## A. Current-main technical contract (integration map)

| Concern | Canonical surface | Notes |
| --- | --- | --- |
| Spatial session (server-backed) | `useBuilderSpatialIntakeSession()` · `src/site00/builder-experience/spatialStudio/useBuilderSpatialIntakeSession.ts` | **Authoritative** for `/bldr/studio`. Wraps `useIntakeSync('BUILDER', 'site00-bldr-spatial')`. |
| Local-only session (legacy / tests) | `useBuilderSpatialSession()` · same folder | **Do not** ship as primary UX; no intake sync. |
| UI state schema | `SpatialBuilderState` · `spatialStudio/types.ts` | Rooms: `PLACE` \| `FEEL` \| `WORK` \| `PACE` \| `BLUEPRINT`. |
| Canonical selection | `spatialSelectionToBuilder(state)` · `mapping.ts` | Feeds estimator; do not duplicate math in UI. |
| Draft envelope (DB `answers`) | `builder-spatial-v1` · `shared/site00-builder-spatial-intake/types.ts` | `envelopeFromSpatialState` / `parseBuilderSpatialDraft` · `intakeDraft.ts`. |
| Intake ID resolution | Query `?intakeId=` + `useIntakeSync.adoptIntakeId` / `reloadIntake` | Resume: `builderIntakeResumeHref()` → `/bldr/studio?intakeId=…`. |
| Draft hydration | Server draft → `spatialStateFromEnvelope`; conflict → `resolveSpatialDraftConflict`; legacy hints → `applyLegacyIntakeHints` | LocalStorage key `site00.bldr.spatialStudio.v1` is **cache only**. |
| Configuration updates | `persist(partial)` on intake hook (debounced autosave via intake sync) | Also updates local cache via `saveSpatialBuilderState`. |
| Save status semantics | `syncStatus`: `idle` \| `restoring` \| `restored` \| `unsaved` \| `saving` \| `saved` \| `local_only` \| `sync_failed` \| `conflict` \| `submitting` \| `submitted` \| `submission_failed` | Wire `IntakeSaveStatus` (already on scaffold page). |
| Estimator I/O | `snapshotFromSpatialState` · `blueprintSessionContract.ts` | `showEstimate` when `clientEstimatePreviewEnabled()` and room is `BLUEPRINT`. |
| Build Object params | `buildObjectParametersFromSpatialState` · `buildObjectContract.ts` | No baked asset URLs. |
| Blueprint submit | `submitForReview()` on intake hook | Server: `submitIntake` + `submitBuilderSpatialIntake` path when draft uses spatial schema. |
| Submitted payload | `BuilderSpatialSubmittedPayload` · `submitted_payload` jsonb | `current` + `history` + `revisionRequests`; immutable snapshots. |
| Revision / resubmit | Admin `REQUEST_REVISION` · `intakeService.applyAdminIntakeAction` | Reopens draft `ACTIVE`; prior submission preserved in `history`. |
| Auth | Guest start allowed; autosave/submit via guest token or authenticated user | `/api/site00/intakes` · pattern in `api/site00/intakes.ts`. |
| Feature flags | `templateSystemEnabled()` · `clientEstimatePreviewEnabled()` · `src/studioos/estimation/flags.ts` | Dev tunnel only: see §F. |
| Route (main) | `/bldr/studio` · `BldrSpatialStudioPage.tsx` | Gated by `VITE_SITE00_TEMPLATE_SYSTEM_V1`. |

## B. Opus branch vs main (reconciliation, not merge)

| Item | Opus branch `claude/digital-foundation-authority-audit-8d42xk` @ `e32e67e2` | Current `main` |
| --- | --- | --- |
| Visual implementation | `src/site00/builder-studio/*` (Five.js engine, rooms, Blueprint) | Scaffold: `components/bldr/spatial-studio/*` |
| Route | `/bldr/builder/:room` · `BuilderStudioPage.tsx` | `/bldr/studio` · `BldrSpatialStudioPage.tsx` |
| Draft hook | `useStudioDraft()` · localStorage `site00.builderStudio.draft.v1` | `useBuilderSpatialIntakeSession()` |
| Submit payload | `BuilderStudioPayload` v1 · `submitBlueprint.ts` | `builder-spatial-v1` envelope + blueprint session snapshot |
| Intake prefix | `site00-builder-studio` | `site00-bldr-spatial` |

**Required Opus adaptation (smallest path):**

1. Rebase visual tree onto `main`; keep `builder-studio/` presentation files.
2. Register **`/bldr/studio`** (founder URL) — alias or redirect from `/bldr/builder/*` if needed.
3. Replace `useStudioDraft` + `useBlueprintSubmission` with **`useBuilderSpatialIntakeSession`** (or thin wrapper that maps UI events → `persist` / `goRoom` on `SpatialBuilderState`).
4. Do **not** submit `BuilderStudioPayload` v1 to production intake; use hook `submitForReview()` so server writes `BuilderSpatialSubmittedPayload`.
5. If Opus UI state cannot map 1:1 to `SpatialBuilderState`, add a **Composer-owned** mapper in `spatialStudio/` (not in Opus CSS/Three files) — coordinate before inventing a second intake schema.

Detail: `BUILDER_OPUS_BRANCH_INTEGRATION_MAP_V1.md`.

## C. Spatial session integration verification

| Check | Status |
| --- | --- |
| Hook exports stable API | **IMPLEMENTED** · **TESTED** (`intakeDraft.test.ts`, page uses hook) |
| Duplicate session engine | **NONE** on main (legacy `useBuilderSpatialSession` documented as non-authoritative) |
| Opus branch wired to hook | **PENDING** Opus reconciliation |

## D. Blueprint / estimator verification

| Check | Status |
| --- | --- |
| Rooms 01–04 hide investment | **TESTED** · `revealEstimateForRoom` + tests |
| Blueprint shows range when flag on | **TESTED** · `spatialStudio.test.ts` |
| Estimator math unchanged | **VERIFIED** · no diff in `src/studioos/estimation/engine` this sprint |
| Hardcoded $12k–$18k / 6–10 weeks | **NOT PRESENT** in contract code |

## E–F. Save/resume and submission tests

| Suite | Result |
| --- | --- |
| `api/site00/intakes.test.ts` | **PASS** (memory store) |
| `api/_lib/site00BuilderSpatial/spatialIntakeSubmit.test.ts` | **PASS** |
| `spatialStudio/intakeDraft.test.ts` | **PASS** |
| `npm run build` | **PASS** |

**Supabase-backed persistence:** **BLOCKED** on cloud preview DB — API logs: `Intake Supabase schema incomplete — run supabase/migrations/20260821010000_site00_intake_persistence.sql`. Do not claim production persistence until migration is applied on the target Supabase project.

**Dev tunnel mitigation (isolated):** `SITE00_INTAKES_USE_MEMORY=1` when `SITE00_CLOUD_PREVIEW_MODE=dev` — ephemeral in-process intakes for founder functional testing only; resets on Vite restart; **not** production persistence.

## G. Isolated preview configuration

| Setting | Value |
| --- | --- |
| Host | Founder Cloudflare dev tunnel (see AGENTS.md) → VM `:5174` |
| Authority branch | `preview/tunnel` (FF from `main`) · worktree `/tmp/site00-preview-main` |
| Mode | `SITE00_CLOUD_PREVIEW_MODE=dev` (Vite HMR) |
| Flags (dev exec only) | `VITE_SITE00_TEMPLATE_SYSTEM_V1=1`, `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1=1` |
| Production GoDaddy / Railway build | Flags **unchanged** (off unless explicitly set in CI deploy) |
| Pin Opus branch for preview | `SITE00_PREVIEW_PIN_REF=<branch-or-sha>` + `SITE00_CLOUD_PREVIEW_MODE=dev` in `run-site00-cloud-preview-server.sh` (after Opus delivers reconciled branch) |

## H. Opus deployment handoff

1. Branch from latest `main`; port `builder-studio/` visuals.
2. Wire `useBuilderSpatialIntakeSession` at page shell (`BldrSpatialStudioPage` or replacement shell only).
3. Open PR; **do not** expect tunnel visibility until merged to `main` (then `preview/tunnel` sync).
4. Optional pre-merge founder preview: founder ops sets `SITE00_PREVIEW_PIN_REF` on canonical tunnel environment (documented in preview script).
5. After merge: `bash .cursor/scripts/post-merge-preview-tunnel-refresh.sh` on canonical connector env.
6. Apply Supabase intake migration on production API DB before claiming durable save/submit on `api.site00.com`.

## I–J. Live preview status (Composer baseline on main)

| Item | Status |
| --- | --- |
| Feature gate removed on tunnel | **LIVE VERIFIED** (flags in dev env) |
| Opus five-screen visual fidelity | **NOT DEPLOYED** — awaits Opus reconciled branch |
| Scaffold rooms 01–05 on `/bldr/studio` | **LIVE VERIFIED** (Composer scaffold + Three.js stage) |
| Founder URL | Path `/bldr/studio` on the founder mobile preview tunnel (base URL: `/tmp/site00-cloud-preview-url.txt` on canonical env) |

**Sprint outcome:** **PARTIAL — DEPLOYMENT BLOCKED** for Opus recovered experience until Opus merges reconciled integration. Technical contracts on `main` are **READY** for that merge.
