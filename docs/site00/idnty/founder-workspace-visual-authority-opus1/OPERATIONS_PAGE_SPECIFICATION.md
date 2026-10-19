# 04 · Operations page specification

**Status:** PROPOSED. Boards 17 (mobile), 18 (desktop). Registry OP-01…OP-11. No Operations reference screen was attached, so this destination is derived from the operations model in source.
**Route:** `/admin/site00/foundation/operations` (new; R3 `/pipeline` redirects here). Per-client operations: record `?section=operations` (R4, R5 redirect there).
**Question:** what fulfilment work is moving or stuck?

## 1. Source model (real, not invented)

| Concept | Values | Source |
| --- | --- | --- |
| Stages | 01_DETAILS_RECEIVED · 02_DOMAIN · 03_PROFESSIONAL_EMAIL · 04_DNS_SECURITY · 05_DEVICE_SIGNATURE · 06_FINAL_VERIFICATION · 07_FOUNDATION_COMPLETE | `shared/site00-digital-foundation/projectStages.ts` |
| Task status | NOT_READY, READY, IN_PROGRESS, WAITING_CLIENT, WAITING_PROVIDER, BLOCKED, READY_TO_VERIFY, VERIFYING, VERIFIED, FAILED, COMPLETE, SKIPPED, SUPERSEDED | `operations/types.ts:18-31` |
| Execution modes | ASSISTED · EXTERNAL_MANUAL · CLIENT_ACTION · VERIFICATION · AUTOMATED (unused by the generator today) | `operations/types.ts` |
| Blocker categories | CLIENT_AUTH_REQUIRED, PROVIDER_PENDING, DNS_PROPAGATION, TECHNICAL_CONFLICT, … | `BlockerCategory` |
| Dependencies | dns_verify ← mx, spf, dkim, dmarc; final_verification ← dns_verify, send_test, receive_test, domain_ownership | `runbookGenerator` depMap |
| Completion gate | TASKS_INCOMPLETE, VERIFICATION_REQUIRED, OWNERSHIP_RECORD_MISSING, … | `completion-gate` |

**Persistence:** runbook, task, stage, approval and client-action mutations are **memory-only** (G-04). Every confirmation in this destination states that limit until the persistence workstream closes it.

## 2. Layout

| Part | Phone | Desktop |
| --- | --- | --- |
| Overview | ACTIVE · BLOCKED · VERIFY segmented control; project rows (plate, stage + current task, 7-segment stage bar, whose move); NEXT FOR YOU card with the next startable task + START TASK | Project list (R3 data) or the selected project's runbook |
| Project | Back header; plate + name + "RUNBOOK ACTIVE · 11 OF 17 TASKS"; "STAGE 04 OF 07" + projected date; stage rail (scrolls); current stage tasks | Header with providers (EMAIL · GOOGLE WORKSPACE, DNS · GODADDY) + PROVIDERS; stage rail; tasks with TASKS · DEPENDENCIES · VERIFICATION; right column (300): completion gate, client actions, verification checks |
| Task | Bottom sheet: mode, status, depends on, unblocks, metadata fields (e.g. DKIM selector, data), BLOCK · MARK COMPLETE | Inspector: title, mode, status, key (data), started, depends on, unblocks, internal instructions, metadata, MARK COMPLETE · BLOCK |
| Dependencies | List in the task sheet | Diagram (board 18 §02) |

**Stage tiles:** done has an ink cap; current has a red cap; blocked is hatched. **Task rows** show a box (done ✓, wait, blocked), the title and key, an execution-mode tag (CLIENT ACTION outlined, VERIFICATION dotted, AUTOMATED dashed) and the status.

## 3. Actions

| Action | Where | API | Notes |
| --- | --- | --- | --- |
| Generate / activate runbook, set providers | Project header (RUNBOOK SETUP) | `generate-runbook`, `activate-runbook`, `set-providers` | G-04 |
| Start / complete task | Task sheet / inspector | `start-task`, `complete-task` | VERIFICATION tasks go to READY_TO_VERIFY on complete |
| Verify task | Verification center | `verify-task` (pass / fail + note) | |
| Escalate | Task ⋯ | `escalate-task` | |
| Set / clear blocker | BLOCK → sheet with BlockerCategory + reason | `set-blocker` | |
| Request client action | Client actions panel | `client-action` | Visible in the client portal |
| Update stage | Stage tile ⋯ | `update-stage` | |
| Mark complete | Record RECORDS | `mark-complete` | PAID + gate |

## 4. States

- Loading: skeleton rows and stage tiles.
- No runbook: "NO RUNBOOK YET" + GENERATE RUNBOOK (only after PAID).
- No active projects.
- Blocked: hollow red mark, reason, since.
- Error: banner + RETRY.
- Not persisted: confirmation note.
