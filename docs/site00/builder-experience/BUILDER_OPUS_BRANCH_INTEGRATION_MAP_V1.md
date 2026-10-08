# Opus branch integration map — Hybrid Spatial Studio

Opus implementation branch (read-only for Composer):

- **Branch:** `claude/digital-foundation-authority-audit-8d42xk`
- **Commit:** `e32e67e2` — *feat(bldr): Hybrid Spatial Studio builder — four rooms and Blueprint reveal*

Composer does **not** merge this branch. Opus rebases onto current `main` and opens a integration PR.

## File ownership

| Owner | Paths |
| --- | --- |
| Opus | `src/site00/builder-studio/**`, `src/site00/styles/site00-builder-studio.css`, Three.js / room UX |
| Composer | `src/site00/builder-experience/**`, `shared/site00-builder-spatial-intake/**`, `api/_lib/site00Intakes/**`, `api/_lib/site00BuilderSpatial/**`, intake hooks |
| Shared shell | `src/site00/pages/bldr/BldrSpatialStudioPage.tsx` — Opus replaces inner presentation; **keep** `useBuilderSpatialIntakeSession` boundary |

## Route reconciliation

| Opus (old) | Main (founder preview URL) |
| --- | --- |
| `/bldr/builder/place` … `/bldr/builder/blueprint` | `/bldr/studio` (single route; room in state) |

Founder expects: **`/bldr/studio`** on the Cloudflare dev preview tunnel (mobile preview URL file on canonical env: `/tmp/site00-cloud-preview-url.txt`).

Opus should either:

- Mount `BuilderStudio` at `/bldr/studio` with room driven from `SpatialBuilderState.room`, or
- Add redirect `/bldr/builder/*` → `/bldr/studio` after merge.

## Hook replacement

| Opus | Replace with |
| --- | --- |
| `useStudioDraft()` | `useBuilderSpatialIntakeSession()` |
| `useBlueprintSubmission()` / `buildSubmissionPayload()` | `submitForReview()` when `snapshot.submission_ready` |
| `STUDIO_INTAKE_STORAGE_PREFIX` | `'site00-bldr-spatial'` (via hook — do not fork prefix) |

### Intake hook return (consume in Opus shell)

```typescript
const {
  state,
  persist,
  selection,
  snapshot,
  buildObject,
  goRoom,
  resetSession,
  showEstimate,
  syncStatus,
  conflictReason,
  canEdit,
  isSubmitted,
  submitForReview,
  serverIntakeId,
} = useBuilderSpatialIntakeSession();
```

Map Opus room ids (`place` | `feel` …) ↔ `SpatialRoomId` (`PLACE` | `FEEL` …) in one adapter module (Composer can add `spatialStudio/opusRoomMap.ts` on request).

## Submission schema

| Opus draft submit | Main canonical |
| --- | --- |
| `BuilderStudioPayload` (`builderStudio.version: 1`) | `builder-spatial-v1` draft envelope + `BuilderSpatialSubmittedPayload` on submit |

Server path on main: `submitBuilderSpatialIntake` / spatial branch inside `submitIntake`. Opus must **not** bypass with a custom payload shape.

## Build Object

Opus: `builder-studio/buildObject/engine.ts`  
Main contract: `buildObjectParametersFromSpatialState(state)` — Opus Three.js layer should consume **parameters** from the hook's `buildObject`, not re-derive estimator inputs.

## Preview deploy after Opus PR

1. Merge Opus PR to `main`.
2. CI syncs `preview/tunnel`.
3. Canonical env: `bash .cursor/scripts/post-merge-preview-tunnel-refresh.sh`
4. Verify `/tmp/site00-preview-runtime-lineage.txt` SHA matches merged `main`.
5. Live smoke: five rooms + Blueprint on `/bldr/studio`.

## Tests Opus should run

```bash
npm test -- src/site00/builder-experience/ api/_lib/site00BuilderSpatial/ api/site00/intakes.test.ts
npm run build
```

Add visual QA scripts from Opus branch only after reconciliation (`scripts/site00/builder-studio-qa/*`).
