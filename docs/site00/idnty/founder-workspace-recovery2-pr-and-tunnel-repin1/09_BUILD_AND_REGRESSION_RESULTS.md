# 09 — Build and regression results

Run on review branch `5003cba0` (2026-10-20 UTC):

| Check | Result |
| --- | --- |
| `npm run build` | PASS (FounderWorkspaceApp chunk built) |
| `npm run typecheck` | PASS (`tsc --noEmit`) |
| Workspace tests (5 files, 41 tests) | PASS |
| Recovery2 visual test file | PASS (12 tests in `idntyFounderWorkspaceVisualRecovery2.test.ts`) |

```bash
npm test -- tests/idntyFounderWorkspaceAcceptance.test.ts \
  tests/idntyFounderWorkspaceImplementation.test.ts \
  tests/idntyFounderWorkspaceVisualRecovery2.test.ts \
  tests/idntyFounderWorkspaceCompletion.test.ts \
  tests/idntyFounderWorkspaceVisualRecovery.test.ts
```

**Not rerun this sprint:** full vitest suite (67+ pre-existing/env failures reported by Opus). **Intake regression:** not re-run full DF suite; no Recovery2 changes under `src/site00/foundation-client/`.

**Authenticated E2E:** not performed on public tunnel (no mock auth). Opus fixture captures remain **non-live** evidence only.
