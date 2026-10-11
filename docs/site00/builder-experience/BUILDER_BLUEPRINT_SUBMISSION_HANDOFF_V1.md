# Blueprint submission & founder handoff V1

Traces **SUBMIT FOR REVIEW** from client action through admin visibility. Read-only audit.

---

## Client action today

### Hybrid Spatial Studio (`BldrSpatialStudioPage.tsx`)

- UI label: **CONFIRM & SUBMIT FOR REVIEW →**
- Handler: `persist(state)` only (localStorage via `saveSpatialBuilderState`)
- **Does not** call `intakesApi.submitIntake`
- **Does not** check `snapshot.submission_ready` server-side
- Contract: `blueprintSessionContract.ts` computes `submission_ready` + `submission_blockers` client-side

**Status:** **MISSING** real submission.

### Legacy BLDR assessment complete

- `completeAssessment()` → `intakeSync.submit()` → `intakeService.submitIntake('BUILDER', …)`
- Submitted payload = current `answers` jsonb (questionnaire), **not** `BuilderSelection` / blueprint
- Post-submit UI: `BldrAssessmentCompletePage` + `IntakeSaveStatus` + guest email capture

**Status:** **PARTIAL** — founder receives questionnaire JSON, not Hybrid Spatial Blueprint.

---

## Server behavior on submit (`intakeService.submitIntake`)

1. Auth: guest token, authenticated user, or anonymous direct session
2. Idempotent if already `SUBMITTED` / `IN_REVIEW` / `CONVERTED`
3. Copies **`record.draftPayload` → `submitted_payload`**
4. Sets `status = SUBMITTED`, `submitted_at`, increments `version`
5. Writes audit event `INTAKE_SUBMITTED`
6. Sends **`intake-submission-receipt`** email if email present (`wired: false` creative — async send may log only)
7. **IDENTITY-only:** `activateIdentityCommercialAfterIntakeSubmit` — **not run for BUILDER**

No separate “blueprint table” — blueprint must live inside submitted JSON or downstream project record.

---

## What the founder receives

| Surface | URL | What they see |
| --- | --- | --- |
| Canonical intake inbox | `/admin/site00/intakes/builder/:id` | Status, audit timeline, `draftPayload` / `submitted_payload` JSON, brand lore panel if IDNTY-linked |
| Legacy BLDR operations | Admin BLDR INTAKE list/detail | Row fields: `build_class`, `primary_type`, `budget_range`, `timeline`, `answers` |
| Notifications | Email event definitions | Intake receipt exists; not full founder operational alert audit in this sprint |

**Blueprint preservation:** **PARTIAL** — only if payload includes blueprint snapshot; spatial path never submits one.

**Estimate version on submit:** **MISSING** unless payload includes `estimator_version` / full `BlueprintSessionSnapshot`.

---

## Founder actions (existing)

| Action | API | Effect |
| --- | --- | --- |
| Mark in review | `applyAdminIntakeAction('MARK_IN_REVIEW')` | `SUBMITTED` → `IN_REVIEW` |
| Archive | `ARCHIVE` | → `ARCHIVED` |
| Legacy mark reviewed / convert | `adminOperations.ts` BLDR helpers | Updates status, may set lead `CONVERTED`, link project |

**Not implemented:**

- Request changes → client editable resubmit loop for blueprint
- Founder refined estimate override with reason (documented in `BUILDER_BLUEPRINT_AND_ESTIMATE.md`, not in Builder intake API)
- Automated quote / acceptance / scope lock

---

## Recommended submission handoff (Composer next sprint — not built here)

1. Client: when `snapshot.submission_ready`, call `submitIntake` with draft containing `BlueprintSessionSnapshot`.
2. Server: optional validation hook — reject submit if blockers present (mirror client contract).
3. Set `sourceRoute` to `/bldr/studio` (or deep link with intake id) on `startIntake`.
4. Admin: render structured blueprint summary (Opus UI) from `submitted_payload.selection` + `blueprint` — read-only first.
5. Post-submit client: show `SUBMITTED` state; disable edits unless founder reopens (product decision).

---

## Audit trail

- **IMPLEMENTED:** `site00_intake_events` for create/save/submit/access/claim/admin actions
- **TESTED:** `intakeService.test.ts` (in memory mode); integration **BLOCKED** without Supabase in cloud VM for one production-mode probe

---

## Production handoff

- **`project_id`** on intake can link to `site00_projects`
- Conversion today is **manual** via admin ops
- Experience synthesis: `upsertExperienceFromBuilderIntake` when `experienceAnswers` present in draft — **legacy path only**

**Production handoff without re-intake:** **PARTIAL** — requires founder/process to copy answers into project; no automatic `BuilderSelection` → project scope artifact.
