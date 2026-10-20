# 05 · Operations (D-10 · TP-07 · TL-07)

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


- Header filter ACTIVE / BLOCKED / VERIFY / ALL (2 × 2 on narrow stages). ACTIVE = paid or staged foundations.
- `ops`: runbooks (`proj`) | runbook (identity, projected days, FULL WORKBENCH, 7-stage rail, blocker banner, task table)
  | side (COMPLETION GATE, CLIENT ACTIONS, VERIFICATION).
- **Data fix:** the workbench endpoint returns `{ buckets, by_mode, command }`; the previous page read a non-existent
  `tasks` key and always showed no tasks. Tasks are now read from `by_mode` (superseded removed) — `data/opsTasks.ts`.
- Execution modes AUTOMATED · ASSISTED · CLIENT ACTION · EXTERNAL MANUAL · VERIFICATION shown as recorded (`WsMode`).
  Status marks never show unexecuted work as complete (`TASK_KIND`); EXTERNAL MANUAL / ASSISTED inspectors state that
  provider work is not executed from the workspace.
- Task inspector docked ≥ 1100 (START TASK… → OL-12, BLOCK → OL-13); below, a task opens OL-12 directly. START is only
  enabled for READY tasks; `startTask` is awaited before any success toast. OL-13 offers the real `BlockerCategory`
  values (the old default `CLIENT` was not a valid category).
- Server truth is reloaded when OL-12 / OL-13 close.

Evidence: `evidence/matrix/operations-14-viewports.jpg`, `evidence/compare/operations-*.jpg`.

OPERATIONS: COMPLETE
