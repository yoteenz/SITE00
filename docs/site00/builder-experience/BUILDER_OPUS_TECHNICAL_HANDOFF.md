# Builder Hybrid Spatial Studio — Opus technical handoff

Interjection: `P0.SITE00.BUILDER.HYBRID-SPATIAL-STUDIO.V1-COMPOSER-ROLE-BOUNDARY-AND-IMPLEMENTATION-REDIRECTION1`  
Original sprint: `P0.SITE00.BUILDER.HYBRID-SPATIAL-STUDIO.V1-APPROVED-VISUAL-AUTHORITY-AND-EXPERIENCE-IMPLEMENTATION1`

## 1. Routes

| Route | Component | Flag |
| --- | --- | --- |
| `/bldr/studio` | `src/site00/pages/bldr/BldrSpatialStudioPage.tsx` | `VITE_SITE00_TEMPLATE_SYSTEM_V1` |
| Legacy BLDR | `/bldr`, `/bldr/start`, `/bldr/:classSlug/*` | unchanged |

Approved visual JPGs (founder authority — **Opus implements**):

- `docs/site00/builder-experience/wireframes/BUILDER_APPROVED_SPATIAL_FOUR_ROOMS.jpg`
- `docs/site00/builder-experience/wireframes/BUILDER_APPROVED_BLUEPRINT_REVEAL.jpg`

## 2. Code locations

| Area | Path |
| --- | --- |
| Canonical Builder contract | `src/site00/builder-experience/` |
| Spatial room UI state | `spatialStudio/types.ts` |
| UI → `BuilderSelection` | `spatialStudio/mapping.ts` |
| localStorage save/resume | `spatialStudio/persistence.ts` |
| Build Object parameters | `spatialStudio/buildObjectContract.ts` |
| Blueprint + estimate snapshot | `spatialStudio/blueprintSessionContract.ts` |
| React integration hook (authoritative) | `spatialStudio/useBuilderSpatialIntakeSession.ts` |
| Local-only hook (tests / legacy) | `spatialStudio/useBuilderSpatialSession.ts` |
| **Temporary UI scaffold** | `src/site00/components/bldr/spatial-studio/`, `BldrSpatialStudioPage.tsx`, `site00-builder-spatial-studio.css` |
| Estimator engine | `src/studioos/estimation/` |
| Feature flags | `src/studioos/estimation/flags.ts` |

## 3. Selection state schema

`SpatialBuilderState` (`spatialStudio/types.ts`):

- `room`: PLACE | FEEL | WORK | PACE | BLUEPRINT
- `placePath`: SIMPLE | ADVANCED | CUSTOM | WORLD
- `feelVibe`: MODERN | BOLD | EDITORIAL | IMMERSIVE
- `workModules`: PAGES | SHOP | BOOKING | MEMBER_AREA | BLOG | PORTAL
- `pace`: STANDARD | EXPEDITED | FLEXIBLE
- `paceNotes`, `blueprintSection`, `buildObjectView`, `savedAt`

Maps to canonical `BuilderSelection` via `spatialSelectionToBuilder()`.

## 4. Estimator I/O

- **Input:** `toEstimateConfig(selection)` (unchanged)
- **Output:** `builderEstimateView(selection)` → `productionWindow`, `investment` (weeks/months + $ ranges — **never** hardcoded mock values)
- **Version:** `ESTIMATOR_VERSION` on `BlueprintSessionSnapshot`
- **Reveal rule:** `revealEstimateForRoom()` — estimate fields only on BLUEPRINT when `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1` is on

## 5. Blueprint I/O

- **Input:** `BuilderSelection` or full `SpatialBuilderState`
- **Output:** `snapshotFromSpatialState()` → `blueprint`, `scope`, `estimate`, `submission_ready`, `submission_blockers`

## 6. Save / resume

- **Authoritative:** `useBuilderSpatialIntakeSession()` → `/api/site00/intakes` → `site00_bldr_intakes.answers` (`builder-spatial-v1` envelope).
- **Cache:** `site00.bldr.spatialStudio.v1` (localStorage) — fallback when offline or sync failed; server wins on conflict unless local `savedAt` is newer.
- Resume: `/bldr/studio?intakeId=<uuid>`
- Submit: `submitForReview()` when `snapshot.submission_ready`.

See `BUILDER_SPATIAL_INTAKE_BINDING_V1.md` and `BUILDER_CONTRACT_RECONCILIATION_REPORT_V1.md`.

## 7. Feature flags

| Flag | Default | Behavior |
| --- | --- | --- |
| `VITE_SITE00_TEMPLATE_SYSTEM_V1` | off | Gates `/bldr/studio` |
| `VITE_SITE00_CLIENT_ESTIMATE_PREVIEW_V1` | off | Gates dollar/week display on Blueprint |

## 8. Build Object mapping

Use `buildObjectParametersFromSpatialState()`:

- `build_kind`, `build_level`, `structural_complexity`, `layer_count_hint`, `capability_ids`, `feel_vibe`, `place_path`, `production_preference`, `spatial_world`

No baked-in image URLs or Three.js choices.

## 9. Reusable hook

```typescript
import { useBuilderSpatialIntakeSession } from '@/site00/builder-experience/spatialStudio/useBuilderSpatialIntakeSession';
```

Returns: `state`, `persist`, `selection`, `snapshot`, `buildObject`, `goRoom`, `resetSession`, `showEstimate`, `syncStatus`, `submitForReview`, `canEdit`, `isSubmitted`, `serverIntakeId`, …

## 10. Limitations

| Item | Status |
| --- | --- |
| Submit for review API | **IMPLEMENTED** — `submitForReview()` + versioned `submitted_payload` |
| Founder-reviewed estimate stage | **DEFERRED** — contract supports `EstimateStage` on canonical path |
| Server persistence of spatial state | **IMPLEMENTED** on main (Supabase when migrated); dev tunnel may use ephemeral memory store |
| Visual fidelity to approved JPGs | **DEFERRED** — Opus |
| AR / true 3D | **DEFERRED** — not in data contract |

## 11. Testing gaps

| Area | Status |
| --- | --- |
| `spatialStudio.test.ts` | **TESTED** — mapping + no DF day language |
| `builderExperience.test.ts` | **TESTED** — canonical contract |
| E2E submit / intake | **MISSING** |
| Visual regression | **DEFERRED** — Opus |

## 12. Scaffold locations (replace, do not extend visually)

- `src/site00/pages/bldr/BldrSpatialStudioPage.tsx`
- `src/site00/components/bldr/spatial-studio/*`
- `src/site00/styles/site00-builder-spatial-studio.css`

## Status summary

| Deliverable | Status |
| --- | --- |
| Technical foundation | **IMPLEMENTED** |
| Builder state contract | **IMPLEMENTED** |
| Estimator integration | **IMPLEMENTED** |
| Blueprint contract | **IMPLEMENTED** |
| Build Object data contract | **IMPLEMENTED** |
| Save/resume (client) | **IMPLEMENTED** |
| Visual implementation | **DEFERRED → OPUS** |
| Assets | **DEFERRED → GROK** |
