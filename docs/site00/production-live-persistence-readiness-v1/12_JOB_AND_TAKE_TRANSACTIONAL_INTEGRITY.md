# 12 — Job and take transactional integrity

Sprint §13.

## 1. Atomic changes

Each change below is one `RecordStore.apply` batch. It reaches the database as one `site00_spine_commit` call, which is one transaction: all of it lands or none of it does.

| Change | Records in the batch |
| --- | --- |
| Authorize a budget | approval event + budget (AUTHORIZED, approval id) |
| Approve a reference | approval event + shot (reference APPROVED) + every job rebound to the new start frame (and stripped of any authorization) |
| Authorize / revoke a job | approval event + job |
| Take decision | approval event (with previous and new state) + take + any CANONICAL continuity frames invalidated by withdrawing approval |
| Continuity review | approval event + take (status, findings) |
| Capture | asset + take (video jobs) + job CAPTURED |
| Extract a frame | frame asset + continuity reference |

## 2. Concurrency

- **Records.** Every update is compare-and-set on the revision the writer read. In the database, `update … where revision = $expected` affects zero rows if another writer won, and the whole batch raises `SPINE_CONFLICT`.
- **Approvals.** Approval ids are deterministic (`APR-<kind>-<subject>-r<revision>`), and the database allows one decision per subject version. Two people deciding the same take version therefore record one decision; the other gets `CONFLICT` and reloads.
- **Dispatch.** QUEUED is written before the provider call. Of two dispatchers, only the one whose write lands can send. The database also allows one in-flight attempt per job and one row per ticket and per provider operation.
- **Polling and capture.** The loser of a race re-reads and returns the stored state. It never writes over the winner.

## 3. Constraints that hold without the application

| Rule (§12) | Database mechanism |
| --- | --- |
| No duplicate jobs | unique `(project_key, idempotency_key)` |
| No duplicate approvals | unique `(project_key, approval_kind, subject_kind, subject_id, source_version)` |
| No duplicate provider dispatches | unique ticket; unique `(provider, operation_id)`; one OPEN/UNCERTAIN attempt per job |
| No orphan takes | composite FKs to shot, job and asset in the same project |
| No asset without provenance | provenance check (adapter, project and hash in the storage ref); FK to the source job and take |
| No selection of a nonexistent or unapproved take | FK; `selected ⇒ APPROVED`; selection only via a SELECT_FOR_EDIT event by FOUNDER or AUTHORIZED_EDITOR; one selection per shot |
| No approved take without authority | APPROVED only via a founder APPROVE event on that take |
| No authorized job without authority | AUTHORIZED only via a founder generation authorization at the job's input hash |
| Approvals are history | update, delete and truncate refused, even for the owner |
| Closed attempts are history | a SUCCEEDED, FAILED or CANCELED attempt cannot be rewritten |

Every row was exercised by writing straight to `site00_spine_commit` with the application's checks skipped (`tests/productionSpineDurable.test.ts`, "constraints hold even when the application is bypassed").

## 4. Restart

- Records live in PostgreSQL: a second process reads them unchanged (dry-run step 11).
- Work interrupted by a restart is found by `recoverInterrupted()` and moved to a state a person resolves. It is never resent.
