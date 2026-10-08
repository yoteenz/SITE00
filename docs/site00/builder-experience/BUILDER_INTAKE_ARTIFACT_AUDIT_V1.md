# Builder intake artifact audit V1

Sprint: `P0.SITE00.BUILDER.INTAKE-ARTIFACT.V1-END-TO-END-CONTRACT-AND-CONTINUITY-AUDIT1`  
Mode: read-only audit (no implementation)  
Baseline SHA: `dfd52d85` (2026-10-08)

## Executive summary

SITE 00 already has a **canonical Builder intake artifact** on **`site00_bldr_intakes`**, exposed through the **shared Identity + Builder intake API** (`/api/site00/intakes`) and **client/admin surfaces** (`/account/intakes`, `/intake/access/:token`, `/admin/site00/intakes`). That stack is **implemented and tested** for the **legacy BLDR classification + questionnaire path** (`useBldrAssessment` → `useIntakeSync`).

The **approved Hybrid Spatial Studio** (`/bldr/studio`, `spatialStudio/*`) has a **strong in-browser configuration + estimator contract** but is **not wired** into the canonical intake artifact. Its save path is **localStorage only**; **SUBMIT FOR REVIEW** on the scaffold does not call `submitIntake`.

**Continuity model today:** one client may accumulate **multiple partial records** (local assessment JSON, local spatial JSON, zero or one server intake row) unless product explicitly merges them. The safe long-term principle remains **one client · one project context · one continuous experience**, but the spatial studio path has **not** been bound to that context yet.

Digital Foundation artifact/commerce is **separate**; do not merge DF persistence into Builder intake.

---

## Intake artifact location

| Layer | Location | Status |
| --- | --- | --- |
| DB table | `public.site00_bldr_intakes` | **IMPLEMENTED** |
| Draft JSON | `answers` jsonb (API: `draftPayload`) | **IMPLEMENTED** |
| Submitted snapshot | `submitted_payload` jsonb | **IMPLEMENTED** |
| Lifecycle | `shared/site00-intakes/types.ts` | **IMPLEMENTED** |
| Service | `api/_lib/site00Intakes/intakeService.ts` | **IMPLEMENTED** |
| Client API | `src/site00/api/intakesApi.ts` | **IMPLEMENTED** |
| Legacy UI sync | `src/site00/hooks/useBldrAssessment.ts` + `useIntakeSync('BUILDER', …)` | **IMPLEMENTED** |
| Spatial studio | `useBuilderSpatialSession` + `persistence.ts` | **PARTIAL** (local only) |
| Admin (canonical) | `/admin/site00/intakes` → `IntakeDetailPage.tsx` | **IMPLEMENTED** |
| Admin (legacy BLDR ops) | `/admin/...` BLDR INTAKE pages → `BldrIntakesPage.tsx` | **IMPLEMENTED** (parallel surface) |

Reference docs (pre-audit): `BUILDER_INFORMATION_ARCHITECTURE.md`, `BUILDER_CLIENT_JOURNEY.md`, `BUILDER_SELECTION_MODELS.md`, `BUILDER_BLUEPRINT_AND_ESTIMATE.md`, `BUILDER_CLIENT_ESTIMATOR_MAPPING.md`.

---

## Central question — 15-step journey

| # | Step | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Enter via invitation or Builder | **PARTIAL** | Public entry: `/bldr`, `/bldr/state`, `/bldr/:classSlug/*`. Guest resume: `/intake/access/:token`. No Builder-specific **invitation** route found; IDNTY/EVOLVE have separate entry patterns. |
| 2 | Begin personalized intake | **PARTIAL** | Legacy: `startClass` + server `startIntake`. Spatial: no `useIntakeSync`. |
| 3 | Select build type | **IMPLEMENTED** (contract) / **PARTIAL** (prod UX) | `BuilderSelection.build` + spatial `placePath` mapping. Production UX split between legacy classification and gated `/bldr/studio`. |
| 4 | Complete four Builder rooms | **CONTRACT ONLY** (spatial) / **IMPLEMENTED** (legacy questionnaire) | Spatial rooms in `spatialStudio/types.ts`; legacy is phased questionnaire (`bldr-intake-phases.ts`, superseded as primary in IA doc). |
| 5 | Receive calculated Blueprint | **IMPLEMENTED** (engine) | `builderBlueprint()`, `snapshotFromSpatialState()`. Not persisted on submit for spatial path. |
| 6 | Save selections | **PARTIAL** | Legacy: server autosave + local. Spatial: `site00.bldr.spatialStudio.v1` localStorage only. |
| 7 | Leave and return without losing progress | **PARTIAL** | Legacy: guest token + `/intake/access/:token` + `sourceRoute`. Spatial: same-browser localStorage only (**not** cross-device). |
| 8 | Edit selections | **IMPLEMENTED** | Canonical `BuilderSelection` + spatial `persist()`. Post-submit edits blocked server-side (`autosaveIntake` throws). |
| 9 | Recalculate estimate | **IMPLEMENTED** | `builderEstimateView(selection)` on each selection change; no hardcoded mock prices in spatial contract. |
| 10 | Submit Blueprint for founder review | **MISSING** (spatial) / **PARTIAL** (legacy) | Legacy submits **questionnaire** via `intakeSync.submit()` on assessment complete — not full `BuilderSelection` blueprint. Spatial button calls `persist(state)` only. |
| 11 | Appropriate submission state | **IMPLEMENTED** (infra) | `SUBMITTED` + `submitted_payload` + audit events. Wrong payload shape for spatial blueprint today. |
| 12 | Return to same project context | **PARTIAL** | `project_id` on intake row; resume uses `sourceRoute` (often `/bldr`, not `/bldr/studio`). No blueprint-specific client project workspace. |
| 13 | Respond to founder requests | **MISSING** | No client UI/API for post-submit blueprint revision loop (docs describe REFINED RANGE; not wired for Builder intake). |
| 14 | Progress toward accepted project | **PARTIAL** | Admin `MARK_IN_REVIEW` / `ARCHIVE`; legacy admin can mark reviewed/convert on `BldrIntakesPage`. No automated blueprint → quote → accept pipeline for Builder comparable to IDNTY commercial activation. |
| 15 | Production handoff without re-intake | **PARTIAL** | `project_id` linkage exists; conversion paths are manual/admin. Experience synthesis from `experienceAnswers` only (brand lore path is IDNTY-only). |

---

## Parallel paths (not a second artifact, but competing UX)

| Path | Route / hook | Persists to `site00_bldr_intakes` | Maps to `BuilderSelection` |
| --- | --- | --- | --- |
| BLDR classification + assessment | `/bldr/:classSlug/*`, `useBldrAssessment` | **YES** | **NO** (questionnaire JSON in `answers`) |
| Hybrid Spatial Studio | `/bldr/studio`, `useBuilderSpatialSession` | **NO** | **YES** (via `spatialSelectionToBuilder`) |
| Template marketplace (superseded) | `/bldr/templates` | **NO** | **NO** |

Docs (`BUILDER_INFORMATION_ARCHITECTURE.md` §6) mark the long questionnaire as **superseded primary path** but **unchanged in repo** — still live alongside spatial scaffold.

---

## Feature flags

| Flag | Default | Effect on audit |
| --- | --- | --- |
| `VITE_SITE00_TEMPLATE_SYSTEM_V1` | off | Gates `/bldr/studio` |
| `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1` | off | Blueprint estimate numbers hidden until on |
| `VITE_SITE00_SCOPE_ESTIMATOR_V1` | on | Estimator engine available |

---

## Testing performed (this sprint)

| Suite | Result |
| --- | --- |
| `src/site00/builder-experience/` (28 tests) | **PASS** |
| `shared/site00-intakes/types.test.ts` | **PASS** |
| `api/site00/intakes.test.ts` | **PASS** |
| `api/_lib/site00Intakes/intakeService.test.ts` | **72/73 PASS**; 1 test **BLOCKED** in this VM (production Supabase schema probe — `IntakeStoreUnavailableError`) |

No live submissions or production record mutations were performed.

---

## Related deliverables

- Continuity map: `BUILDER_INTAKE_CONTINUITY_MAP_V1.md`
- Data contract: `BUILDER_INTAKE_DATA_CONTRACT_V1.md`
- Submission handoff: `BUILDER_BLUEPRINT_SUBMISSION_HANDOFF_V1.md`
- Gaps register: `BUILDER_INTAKE_IMPLEMENTATION_GAPS_V1.md`
- Opus integration: `BUILDER_INTAKE_OPUS_HANDOFF_V1.md`
