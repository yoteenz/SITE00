# 02 — Repository financial baseline

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

## Branches and pull requests

Verified with `git rev-parse` and `gh pr list` on 4 Nov 2026. Ancestor checks are against the inspected tip.

| Ref | SHA | Relation | PR |
| --- | --- | --- | --- |
| `main` | `e413590e1` | Default branch. Ledger path absent. | — |
| `origin/integration/jurnl-production-workspace` | `7752eae2f` | Ancestor of the inspected tip. Not an ancestor of `main`. | integration base |
| `origin/claude/jurnl-financial-os-unification-um0u93` | `c56691ecb` | Ancestor of the inspected tip. Not merged. | #1705 draft, base `main` |
| `origin/claude/jurnl-financial-os-stabilization-um0u93` | `274d7956a` | Ancestor of the inspected tip. Not merged. | #1706 draft, stacked on #1705 |
| `origin/cursor/jurnl-financial-safety-integration-4e5a` | `f7e2739c6` | Ancestor of the inspected tip. Not merged. | #1713 draft, base `main` |
| `origin/cursor/jurnl-tunnel-opus-v3-overlays-4e5a` | `8ba653faf` | Inspected tip. Contains the financial engine and later visual work. | #1714 draft, base integration |

`git merge-base --is-ancestor` returned 0 for unification, stabilization, safety, and integration against `8ba653faf`.

Open MONEY UI pull requests #1709–#1712 target `main` and are visual or copy. They are not this audit and were not modified.

## Functional in the inspected tree

VERIFIED_IN_REPOSITORY.

- One ledger: `RepositorySnapshot.transactions`, interpreted by `accounting.ts`. Asset versus liability. Scheduled future dates do not move balances. `MOCK` entries do not move balances.
- Transfer settlement state machine in `transferSettlement.ts`: SCHEDULED, PENDING, IN_TRANSIT, COMPLETED, CANCELLED, FAILED, RETURNING, REVERSED, NEEDS_RECONCILIATION. Comments state no bank or issuer confirmation exists.
- `ledgerOps.ts` records transfer legs and `findDuplicateTransfer` for a repeated user-entered transfer.
- DOT 01 corrections append `correction_history` and do not rewrite the prior values. Receipts stay `stored: 'DEVICE'`.
- `findDuplicatePurchase` warns on amount, date, merchant, account, and receipt hash. It does not own provider identity.
- Spend categories in `foundation/categories.ts`. Account types include checking, savings, debit, credit, cash, loan, business.
- `MoneyPurpose` maps a purpose such as BILLS or RIDESHARE_EARNINGS to a preferred pocket. It is not a transaction purpose model.
- Server snapshot sync (`serverSnapshotSync.ts`) pushes the JSON repository to `/api/jurnl/repository`. That is device-to-server persistence, not bank aggregation.
- `consentSync.ts` stores consent flags, including `LINKED_ACCOUNTS` and `AI_CATEGORIZATION`. Flags are not connections and not a classifier.
- Supabase migration `20261006103000_jurnl_production_persistence.sql` creates `jurnl_user_snapshots`, `jurnl_record_files`, and `jurnl_mutation_idempotency` with owner RLS.

## Mocked or simulated

VERIFIED_IN_REPOSITORY.

- `scripts/jurnl/structural-blueprint/model.ts` states there is no Plaid, MX, Teller, Finicity, or Yodlee, and that F02.02 connect patches the draft to CONNECTED.
- Blocker B12: bank connection is simulated but shown as connected.
- `JURNL/MANIFEST/PRODUCT_UTILITY_AUDIT_V1/JURNL_CURRENT_PRODUCT_UTILITY_BASELINE.md`: Bank/Plaid feed NOT_IMPLEMENTED.
- Sample accounts `acct-checking` and `acct-card` carry sample balances until the user enters one.
- F01 copy withholds encryption, bank-level security, and fraud-monitoring claims because they are not implemented (`data/f01/copy.ts`).

## Partial

- `SourceType` already includes `MANUAL | IMPORT | CONNECTED | MOCK`, but import and connected have no pipeline.
- `EntryConfirmation` includes `BANK_CONFIRMED`, and `BalanceBasis` includes it, with an explicit comment that this build never produces it.
- `TxnClass` covers income, expense, transfer, credit purchase, credit payment, debt payment, refund, and adjustment. It does not have distinct values for fee, interest, reversal, reimbursement, cash withdrawal, or pending authorization.
- Obligations, Safe to Spend, and outlook consume the manual ledger. They do not consume a bank feed.
- Idempotency exists for repository mutations, not for provider webhooks.

## Missing

Provider adapter, link token, access token store, webhook receiver, sync cursor, raw provider transaction table, canonical event separate from the user ledger, pending-to-posted link, classification rule table, purpose and allocation dimensions, split lines, review queue, per-tenant learning.

## Conflict with the connected-first correction

The product copy and the accounting comments tell the user that no bank is connected and that the balance is what they typed. That is honest for this build. It is the opposite of the default the founder just set. The UI must not be redesigned in this sprint. The contract for a later sprint is in document 04.
