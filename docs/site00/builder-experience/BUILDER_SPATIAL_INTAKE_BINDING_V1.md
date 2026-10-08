# Builder spatial intake server binding V1

Sprint: `P0.SITE00.BUILDER.INTAKE-SPATIAL-SERVER-BINDING.V1`  
Baseline audit: `BUILDER_INTAKE_ARTIFACT_AUDIT_V1.md` (SHA `f88f3bb0`)

## Summary

Hybrid Spatial Studio (`/bldr/studio`) now uses the **existing** canonical Builder intake (`site00_bldr_intakes` + `/api/site00/intakes`) for **server-backed drafts**, **resume hydration**, and **versioned blueprint submission**. No new intake tables.

## Client integration (Opus)

| Hook | Purpose |
| --- | --- |
| `useBuilderSpatialIntakeSession()` | Spatial state + intake sync + `submitForReview()` |
| `syncStatus` | Presentation-neutral save/submit states for UI |
| `IntakeSaveStatus` | Reused component (wired on scaffold page) |

Resume URL: `builderIntakeResumeHref()` → `/bldr/studio?intakeId=…`

## Draft envelope (`answers` jsonb)

`schemaVersion: builder-spatial-v1` with `spatialStudio`, `clientRevision`, `serverRevision`, optional `revisionOpen` / `revisionRequests`.

LocalStorage (`site00.bldr.spatialStudio.v1`) is **cache only**; server draft wins on conflict unless local `savedAt` is newer.

## Submission (`submitted_payload`)

Versioned `BuilderSpatialSubmittedPayload`:

- `current` — immutable blueprint session snapshot + estimator version
- `history` — prior submissions preserved on resubmit
- `revisionRequests` — founder revision audit trail

Server validates readiness via same rules as `snapshotFromSpatialState()` (estimator math unchanged).

## Founder review

| Action | API |
| --- | --- |
| Mark in review | `POST /api/admin/site00-intakes` `action=mark-in-review` |
| Request revision | `action=request-revision` (reopens draft `ACTIVE`, preserves submitted snapshot) |

Admin inbox: `/admin/site00/intakes/builder/:id` — submitted JSON includes full blueprint snapshot.

## Production activation

`shared/site00-builder-spatial-intake/projectActivation.ts` — `builderProjectActivationHint()`; activation **gated** (`CONVERTED` + `project_id` + submitted blueprint). No auto-production on submit.

## Tests

- `api/_lib/site00BuilderSpatial/spatialIntakeSubmit.test.ts` — handler path via `intakeService` + memory store
- `spatialStudio/intakeDraft.test.ts` — conflict + legacy mapping
- Supabase-backed adapter: **BLOCKED** in cloud VM without live schema probe (same as intake service production-mode test)

## Opus handoff

See `BUILDER_INTAKE_OPUS_HANDOFF_V1.md` + `BUILDER_OPUS_TECHNICAL_HANDOFF.md`. Use `useBuilderSpatialIntakeSession`; do not call submit until `snapshot.submission_ready`.
