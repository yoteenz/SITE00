# 23 — Production implementation phases

Inspected tree: `cursor/jurnl-tunnel-opus-v3-overlays-4e5a` @ `8ba653faf`
Worktree: `/tmp/site00-jurnl-integration-wt`
Default branch `main` @ `e413590e1` does not contain `src/projects/jurnl/data/ledger/accounting.ts`.
None of the financial-OS pull requests below are merged to `main`.
Tagline: PLAN TODAY. GROW FREELY.
Sprint: P0.JURNL.FINANCIAL-INTELLIGENCE.CONNECTED-TRANSACTION-UNDERSTANDING-AND-ADAPTIVE-LEARNING-FOUNDATION.AUDIT1
Application code: unchanged. Database: unchanged. Paid calls: none.


Evidence classes:

- VERIFIED_IN_REPOSITORY — read in the inspected tree.
- VERIFIED_IN_TESTS — covered by a named test in that tree.
- VERIFIED_WITH_PROVIDER_DOCS — public page read on 4 Nov 2026 (America/Chicago). Not a live JURNL connection.
- DESIGN_REQUIREMENT — required by this sprint. Not implemented.
- PROPOSED_ARCHITECTURE — design for a later implementation sprint. Not implemented.
- UNKNOWN — not established by repository evidence or a cited source.
- BLOCKED — needs a founder or vendor decision before build.

Not authorized now. Adjusted to the repository: the book and the settlement machine exist on the unmerged financial branches, and the provider stack does not.

### Phase 0 — Baseline convergence

Objective: land the existing financial engine on `main` without pretending it is connected, and freeze the canonical types this plan extends.
Current baseline: engine is on `8ba653faf` and draft PRs #1705, #1706, #1713, #1714. `main` lacks `accounting.ts`.
Dependencies: founder agrees the visual overlay PR and the financial PRs can merge in a chosen order. BLOCKED on that sequencing because this sprint must not merge them.
Changes: merge discipline only. No new product behavior.
Schema: none.
Tests: the existing ledger and settlement tests on that tree.
Success: `main` contains the same settlement states and still has zero provider calls.
Rollback: revert the merge commit.
Complexity: integration, not new design.

### Phase 1 — Ingestion and health

Objective: connect one provider in sandbox, select accounts, store raw rows, show the document 04 statuses.
Baseline: no client.
Dependencies: OD-01 vendor choice, OD-08 history window, server secret storage.
Schema: item, account link, raw event, cursor. RLS by owner.
Provider: sandbox only until a production checklist passes.
Security: document 19.
Tests: 16, 17, 29, 32, 37.
Success: a sandbox account shows last sync and does not mark transactions enabled before the first transaction sync.
Rollback: feature flag off, revoke sandbox items, leave manual ledger.
Blocker: no vendor contract.

### Phase 2 — Identity and reconciliation

Objective: canonical events, pending and posted, transfer and card matching onto the current state machine.
Dependencies: phase 1.
Schema: canonical event and identity link.
Tests: 04, 05, 06, 09, 10, 11, 12, 30, 31, 36.
Success: replays and backfills do not double post. Transfers do not become income.
Rollback: stop the promoter. Raw rows remain. Book returns to manual-only.

### Phase 3 — Deterministic categories and user rules

Objective: user-confirmed category and purpose, no automation.
Dependencies: phase 2.
Schema: classification and rule candidate, automation forced off.
Tests: 01, 02, 14, 21, 22, 23.
Success: a confirmation never changes the amount.

### Phase 4 — Learning

Objective: the fuel contract and the approval gate.
Dependencies: phase 3 and OD-02 tenancy.
Tests: 01, 25, 26, 27, 28.
Success: the third confirmation proposes and does not enable. Tenants cannot read each other.

### Phase 5 — Recurrence and forecast

Objective: likely versus confirmed, outlook and commitments.
Dependencies: phase 2. Learning is optional.
Tests: 19, 20.
Success: a future bill is not spent.

### Phase 6 — Business context and tax labels

Objective: allocation, rideshare net-versus-gross honesty, tax UNDETERMINED.
Dependencies: phases 3 and 4.
Tests: 03, 07, 08, 13, 33, 34, 38.
Success: no invented gross and no automatic deduction.

### Phase 7 — Hardening

Objective: deletion, outage, discrepancy, evaluation of the forty cases, production rollout.
Tests: 35, 39, 40, plus the full contract.
Success: all forty specified cases exist as automated tests, and a classification outage still leaves the import.
Rollback: disable sync per tenant.

Estimated complexity is highest in phases 0 (branch sequencing), 2 (identity), and 7 (security). Phase 4 is unsafe if it starts before phase 2.
