# Builder intake data contract V1

Defines **what is collected**, **where it lives**, and **how it relates** to `BuilderSelection` and the estimator. No new schema introduced in this audit.

---

## Storage mapping (BUILDER)

| API field | DB column (`site00_bldr_intakes`) | Notes |
| --- | --- | --- |
| `draftPayload` | `answers` jsonb | Merged on autosave |
| `submittedPayload` | `submitted_payload` jsonb | Immutable after submit |
| `domainLabel` | `build_class` text (NOT NULL) | e.g. `site`, `world`, `not-sure` |
| `currentStep` | `current_step` | |
| `email` | `email` | |
| `projectId` | `project_id` | Optional lineage |
| Legacy columns | `primary_type`, `audience`, `budget_range`, `timeline`, `recommendation*` | Original admin ops schema; not automatically filled from spatial studio |

---

## Configuration models

### A. Canonical estimator contract (target for Hybrid Spatial Studio)

**Type:** `BuilderSelection` — `src/site00/builder-experience/types.ts`

**Derived views:**

- Blueprint: `builderBlueprint(selection)`
- Estimate: `builderEstimateView(selection)` → uses `estimateProject(toEstimateConfig(selection))`
- Spatial UI state: `SpatialBuilderState` → `spatialSelectionToBuilder()` — `spatialStudio/mapping.ts`

**Session snapshot (client, presentation-neutral):**

```typescript
BlueprintSessionSnapshot // spatialStudio/blueprintSessionContract.ts
```

Fields include: `estimator_version`, `selection`, `blueprint`, `scope`, `estimate`, `submission_ready`, `submission_blockers`.

### B. Legacy assessment record (live today)

**Type:** `BldrAssessmentRecord` — `useBldrAssessment.ts`

Stored in localStorage key `BLDR_ASSESSMENT_STORAGE_KEY`.

**Server mirror (`answers` jsonb)** via autosave patches, e.g.:

- `buildClass`, `answers`, `completedSteps`
- `experienceAnswers`, `experienceCompletedSteps`
- `inheritedLoreSnapshot`

**Does not** embed a full `BuilderSelection` or blueprint snapshot today.

### C. Recommended submitted payload shape (contract only — not enforced in code)

When spatial + intake are wired, submitted snapshot should include at minimum:

| Field | Purpose |
| --- | --- |
| `schemaVersion` | e.g. `builder-intake-v1` |
| `spatialState` | `SpatialBuilderState` |
| `selection` | canonical `BuilderSelection` |
| `blueprintSession` | `BlueprintSessionSnapshot` at submit time |
| `estimatorVersion` | copy of `ESTIMATOR_VERSION` |
| `clientNotes` | `paceNotes`, custom direction notes when applicable |
| `provenance` | `sourceRoute`, flags, optional `identityIntakeId` |

---

## Intake information audit

### Before Builder (entry / IDNTY)

| Information | Where | Required for Blueprint? |
| --- | --- | --- |
| Brand readiness | IDNTY / lore | Conditional — affects `identityScope` in estimator |
| Identity state + lore answers | IDNTY intake | Optional prefill for legacy BLDR only |
| Build class slug | `/bldr/state` | Legacy path only; spatial uses PLACE path instead |

### Within Builder (spatial contract)

| Room | Fields | Maps to `BuilderSelection` |
| --- | --- | --- |
| PLACE | `placePath` | `build`, `structure`, world defaults |
| FEEL | `feelVibe` | `expression.primary` (visual system) |
| WORK | `workModules[]` | capabilities / features |
| PACE | `pace`, `paceNotes` | `delivery` |
| BLUEPRINT | `blueprintSection`, review UI state | N/A (display) |

### Within Builder (legacy questionnaire — superseded primary)

Phases in `bldr-intake-phases.ts`: property/type, audience, capabilities, content, timeline, budget, experience steps, etc.

**Overlap with spatial:** type/audience ≈ PLACE; features ≈ WORK; timeline/budget ≈ PACE (but legacy asks explicit budget/timeline **questions**, spatial derives estimate from estimator).

### After Blueprint (production onboarding — not in immersive rooms)

Belongs to founder review / project ops, not PLACE–PACE rooms:

- Legal entity, billing, content readiness, access credentials
- Quote acceptance, scope lock, production schedule (`BUILDER_BLUEPRINT_AND_ESTIMATE.md` stages)

---

## Duplicated / redundant questions (avoid asking twice)

See gap register for count; summary:

1. **Site type / audience** (legacy) vs **PLACE path** (spatial) — same intent.
2. **Timeline & budget** (legacy steps) vs **PACE + estimator output** — budget should not be a second pricing source.
3. **Experience questionnaire** (`bldr-experience-questions`) vs **WORK modules** — overlapping capability discovery.
4. **Brand/lore** (IDNTY) vs **FEEL** — should be conditional (brand-ready clients skip re-asking).
5. **Build class** selection at `/bldr/state` vs **PLACE** — parallel entry semantics.

**Minimum for meaningful Blueprint + estimate (spatial model):** PLACE + FEEL + WORK + PACE (+ brand gate outcome from IDNTY when not ready).

---

## Estimator connection (verified)

```
SpatialBuilderState
  → spatialSelectionToBuilder()
  → BuilderSelection
  → toEstimateConfig()
  → estimateProject()
  → builderEstimateView() / BlueprintSessionSnapshot.estimate
```

- **No** hardcoded reference prices in spatial contract tests.
- Illustrative numbers in docs (`BUILDER_BLUEPRINT_AND_ESTIMATE.md`) are examples only.
- **Revisions:** editing selections recalculates live; distinct **submitted** estimate versions are **not** stored unless captured in `submitted_payload` at submit time.

---

## Actions (existing API)

| Action | Endpoint | Owner |
| --- | --- | --- |
| Start | `POST ?action=start` | Composer infrastructure |
| Autosave | `POST ?action=update` | Composer |
| Submit | `POST ?action=submit` | Composer |
| Guest access | `POST ?action=send-access` | Composer |
| Claim | `POST ?action=claim` | Composer |
| List / get | `GET ?action=list`, `GET ?action=get` | Composer |
| Admin review | `/api/admin/site00-intakes` | Composer |

Spatial studio should call these; today it does **not**.
