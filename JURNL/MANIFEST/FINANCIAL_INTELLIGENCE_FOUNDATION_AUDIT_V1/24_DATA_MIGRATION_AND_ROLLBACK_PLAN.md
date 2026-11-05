# 24 — Data migration and rollback plan

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

No migration runs in this sprint.

## Current store

VERIFIED_IN_REPOSITORY. The book is a JSON `RepositorySnapshot` in device storage and, when configured, in `jurnl_user_snapshots.snapshot`. Entries do not have provider ids. Accounts have `is_connected: false`. Sample accounts `acct-checking` and `acct-card` may hold sample numbers.

## Forward plan

1. Add new tables beside the snapshot. Do not reinterpret old amounts.
2. Existing entries stay `source: MANUAL` or `MOCK`. `MOCK` continues to have no balance effect.
3. When a user later connects a real account, do not auto-merge sample data. Offer an explicit archive of sample accounts first (OD-09).
4. Manual entries remain. Matching them to imports is always a user confirm (scenario 06).
5. Backfill of provider history writes raw rows first and promotes with the identity gate. It does not edit historical manual rows.
6. Rules start empty for every owner.

## Rollback

- Feature flag stops fetch and promote.
- Revoke provider items.
- New tables can be ignored. The manual snapshot still opens.
- Do not drop the snapshot as part of enabling sync.
- A failed classification job never deletes a promoted event.
- Bulk rule disable is a version update, not a data restore.

## Unresolved

Whether the long-term book remains a JSON snapshot or moves to relational rows is a phase 0 design choice. Either way, provider tokens do not go inside the snapshot.
