# Builder intake — Opus integration handoff V1

**Audience:** Opus (visual/experience). **Composer** owns wiring to APIs; this doc lists **existing contracts to consume** without redesigning intake architecture.

Also read: `BUILDER_OPUS_TECHNICAL_HANDOFF.md` (spatial hooks), `BUILDER_INTAKE_DATA_CONTRACT_V1.md`, `BUILDER_BLUEPRINT_SUBMISSION_HANDOFF_V1.md`.

---

## Integration readiness

**OPUS_INTEGRATION_READINESS: PARTIAL**

- **READY:** Room navigation state, blueprint/estimate views from hooks, feature-flag gating, submission readiness flags (client-side).
- **BLOCKED:** Real submit/resume until Composer binds `useIntakeSync` (GAP-INT-001–003). Opus can mock submit UX but must not claim production submission.

---

## Routes (client)

| Purpose | Path | Flag |
| --- | --- | --- |
| Spatial studio (scaffold) | `/bldr/studio` | `VITE_SITE00_TEMPLATE_SYSTEM_V1` |
| BLDR hub | `/bldr`, `/bldr/state` | public |
| Legacy assessment | `/bldr/:classSlug/*` | public |
| Guest resume | `/intake/access/:token` | public |
| Account intakes | `/account/intakes`, `.../builder/:id` | auth |

---

## State access (use these — do not fork)

```typescript
import { useBuilderSpatialSession } from '@/site00/builder-experience/spatialStudio/useBuilderSpatialSession';
```

| Hook return | Use for |
| --- | --- |
| `state` | PLACE / FEEL / WORK / PACE / BLUEPRINT UI |
| `persist(partial)` | Local save (until server sync lands) |
| `selection` | Canonical `BuilderSelection` |
| `snapshot` | Blueprint + estimate + `submission_ready` / `submission_blockers` |
| `buildObject` | Build Object visual parameters (no image URLs) |
| `goRoom` | Room transitions with `canEnterRoom` guard |
| `showEstimate` | Respect estimate reveal rule |

Types: `spatialStudio/types.ts`  
Mapping: `spatialStudio/mapping.ts`

---

## Estimator (read-only for Opus)

- **Input:** `selection` (never hand-build `ProjectEstimateConfig` in UI)
- **Output:** `snapshot.estimate` (`BuilderEstimateView`) when `showEstimate === true`
- **Never** hardcode illustrative ranges from JPG references
- Flags: `clientEstimatePreviewEnabled()`, `templateSystemEnabled()` from `src/studioos/estimation/flags.ts`

---

## Save / update actions (today vs target)

| Action | Today (spatial) | Target (Composer) |
| --- | --- | --- |
| Autosave | `persist(state)` → localStorage | `useIntakeSync('BUILDER').autosave({ draftPayload })` |
| Start session | implicit on page load | `ensureStarted({ sourceRoute: '/bldr/studio', draftPayload })` |
| Submit | local persist only | `submit()` when `snapshot.submission_ready` |
| Guest email | not on studio page | Reuse `IntakeGuestAccessCapture` pattern from `BldrAssessmentCompletePage` |

**Reuse components:** `IntakeSaveStatus`, `IntakeGuestAccessCapture` — do not duplicate save UX.

---

## Blueprint generation

- Use `snapshot.blueprint` (`BlueprintView`) for reveal layout
- Use `snapshot.scope` for scope meter copy
- Incomplete state: `snapshot.submission_blockers` → disable submit CTA copy (e.g. “two decisions left” pattern from docs)

---

## Submission action (presentation)

When Composer wires API:

1. On submit click → call injected `onSubmit` prop or shared hook (to be added by Composer — **do not** call API directly from scattered components unless using `intakesApi.submitIntake` through one hook).
2. Show states: saving → submitted → link to `/account/intakes/builder/:id`
3. Error states: `INTAKE ALREADY SUBMITTED`, network fail loud (match `useIntakeSync` semantics)

Until wired: label scaffold submit as **NON-PRODUCTION** or hide behind dev flag (founder decision).

---

## Return navigation

- After submit: account intake detail (structured summary — Opus layout)
- Resume: deep link `/bldr/studio?intakeId=` (query param **contract only** — Composer must implement loader)

Guest page currently links to `sourceRoute` — set during `startIntake`.

---

## Access control

- Public studio when flag on
- Account routes require auth guard (existing)
- Intake get/submit requires intake id + guest token or auth (server enforced)

---

## Error states to design

| Condition | User message direction |
| --- | --- |
| `saveState === 'error'` | Server save failed; local may be stale |
| `submission_blockers.length` | List missing PLACE/FEEL/WORK/PACE |
| `estimate_error` | Configuration invalid for estimator |
| Expired guest token | Use existing copy on `IntakeGuestAccessPage` |

---

## Do not edit (Composer-owned)

- `spatialStudio/mapping.ts`, `blueprintSessionContract.ts`, `buildObjectContract.ts` — coordinate via PR if contract change needed
- `api/_lib/site00Intakes/*`, Supabase migrations
- Estimator math under `src/studioos/estimation/`

---

## Visual scope (Opus)

- Replace scaffold: `src/site00/components/bldr/spatial-studio/*`, `site00-builder-spatial-studio.css`, `BldrSpatialStudioPage.tsx`
- Wireframes: `docs/site00/builder-experience/wireframes/BUILDER_APPROVED_*.jpg`
- **Do not** create a second Builder route tree

---

## Testing expectations for Opus QA

With flags on in dev:

1. Complete four rooms → blueprint shows live scope
2. Toggle selections → investment/window strings change (not static)
3. Submit disabled until blockers cleared
4. After Composer wireup: submit appears in admin inbox JSON

Automated: `spatialStudio.test.ts`, `builderExperience.test.ts` — run before merge.
