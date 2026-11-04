# 17 — Financial source reconciliation (in-flight addendum)

The addendum named PR #1706 (`274d7956a5cef75911a9492c3fb43a00ca02249f`) as the authoritative financial and functional baseline. This document records how the pilot relates to it.

## Source relationship (verified 2026-11-03)

| | SHA | State |
|---|---|---|
| `main` | `e413590e` | unchanged |
| PR #1705: unified financial OS | `c56691ec` | open draft, **not modified** |
| PR #1706: stabilization (stacked on #1705) | `274d7956` | open draft, **not modified**; CI on #1706: validate ×2, e2e_core and wave5_e2e all **success** |
| This pilot (PR #1707, stacked on #1706) | branch `claude/jurnl-f05-money-motion-pilot-um0u93` | `git merge-base --is-ancestor 274d7956 HEAD` → **true** |

The pilot was created from #1706's head before the addendum arrived (doc 01). No reset, rebase, cherry-pick or merge was needed or done.

- **Overlap:** the pilot's commits change no financial module of #1706. Its only file under `src/projects/jurnl/data` is the new read-only `data/f05/moneyParentReading.ts`.
- **Conflicts:** none.
- **#1705's superseded pending-transfer behaviour** (both legs applied at once) is not present anywhere the pilot reads. The pilot reads #1706's settlement model only.

## Single financial-state owner

Every figure and state on the page comes from the canonical repository through #1706's selectors:

| Shown | Selector (#1706) |
|---|---|
| HELD, OWED, per-account amounts | `computeMoneyPicture` → positions (settled legs only) → `summarizePositions` |
| COMMITTED, AVAILABLE | `computeSafeToSpend()` (30-day F09) |
| Transfer and card-payment states, amounts, labels | `computeMoneyPicture().transfers` (`transferViews`), `TRANSFER_STATE_LABEL` / `CARD_PAYMENT_STATE_LABEL` |
| Per-account in-transit / incoming / waiting | `transferTotals.byAccount` |

A unit test (`Single financial-state owner`) fails the build if the pilot's page, layout, reading or route calls any write operation (`recordTransfer`, `recordTransferStep`, `buildTransferAction`, `createManualAccount`, `setAccountBalance`, `renameAccount`, `archiveAccount`, `applyOp`, `.commit(`), touches `localStorage`, or does balance arithmetic. Every write happens in #1706's existing sheets, which are unchanged.

## Animation represents state, it does not create it

The pilot now draws each unfinished transfer and card payment as a **thread** between its two papers, with a **token** carrying its amount and state. Each paper also carries a **slip** with the same state. All three are derived from the recorded settlement state on every render.

| Recorded state (#1706) | Balances (from the ledger) | Thread / token | Paper slip | Unit | E2E |
|---|---|---|---|---|---|
| SCHEDULED | unchanged | dashed thread; token **rests on the source paper**; PLANNED / SCHEDULED | `→ / ← $80 PLANNED` | ✓ | ✓ (rest position asserted) |
| PENDING (source not debited) | unchanged | dashed; token on the source; NOT LEFT / SUBMITTED | `NOT LEFT YET` / `PAYMENT SUBMITTED` | ✓ | ✓ (card) |
| IN_TRANSIT (source debited) | source −, destination **not** credited, HELD −amount | solid to the token, dashed onwards; token **between** the papers | `IN TRANSIT` / `CARD NOT CONFIRMED` | ✓ | ✓ |
| COMPLETED (recorded arrival or issuer confirmation) | destination +; for a card, owed −amount | the thread **resolves** into the destination (≤ 480 ms) *after* the ledger records COMPLETED | gone | ✓ | ✓ |
| RETURNING (failed, money not back) | source still −, destination unchanged | wine thread; token between; COMING BACK / FAILED | `COMING BACK` / `PAYMENT FAILED` | ✓ | — |
| FAILED (money back), CANCELLED, REVERSED | as recorded by the accounting operation | the thread **closes** (fades), with no motion of money | gone | ✓ | ✓ (failed + returned) |
| NEEDS_RECONCILIATION (legacy) | unchanged | amber dashed; CONFIRM? | `NEEDS CONFIRMATION` | ✓ | — |

Rules this enforces:

- **Steps go through the accounting operations.** Tapping a token opens #1706's `TransferDetailSheet`. Its only actions are `allowedActions(state)`, and each one is `recordTransferStep`. The page then re-renders from the new ledger state; the visual follows it.
- **No animation moves a balance.** The figures are never animated (no count-up), and a resolving thread plays only after the ledger already holds COMPLETED.
- **Nothing restores money visually.** FAILED and CANCELLED close the thread without motion; any restore is the ledger's (`MONEY_RETURNED`, `REVERSE`).
- **Labels are #1706's own.** The token's accessible name is the canonical label (for example `PAID FROM ACCOUNT · CARD NOT CONFIRMED`), plus "RECORDED BY YOU, NOT CONFIRMED BY A BANK". The page never claims bank or issuer confirmation.
- **Card payments are never spending.** The test confirms neither leg is `EXPENSE` or `CREDIT_PURCHASE`. The debt falls only on `RECEIVED` (issuer credit confirmed) and returns on `REVERSE`.
- **Reduced motion:** threads, tokens and slips still show (they are state, not decoration). Only their fade-in and resolve animations are off.
- **Threads are drawn only when both papers are on the current page.** Otherwise the slip on the visible paper carries the state.

## Contracts preserved (re-verified on this branch, not inherited)

| Contract | Evidence on the pilot branch |
|---|---|
| Canonical ledger, account balances, cash and digital accounting, daily earnings, account purposes | `jurnlFinancialInvariants` 40/40 |
| Linked transfers, pending settlement, in-transit funds, confirmation, failed and reversed, credit-payment settlement, minimum dedupe, 30-day and next-income Safe to Spend, shared reservations, legacy compatibility | `jurnlFinancialStabilization` 27/27 |
| The same, through the UI | `jurnl-financial-os` + `jurnl-financial-os-stabilization` E2E (doc 12) |
| Subscriptions, bills, set-asides, credit, Safe to Spend surfaces | the rest of the JURNL unit suite (727/727) and the full E2E (doc 12) |
| Pilot state binding | `jurnlF05MotionPilot` 20/20; pilot E2E incl. `transfer states drive the thread; only recorded steps move money` |

## Unchanged statuses

- **Production security proof:** PREREQUISITE_BLOCKED (nine Actions secrets missing; #1706 doc 14). The pilot adds no server, sync or data path.
- **Deployment, migrations, merges, generations:** none.

## Visual authority

The visual authority is the approved F05 MONEY parent (`JURNL/F05_MONEY_MOTION_PILOT/INPUT/reference/approved_parent.png`).

- The old cabinet composition is **not** a creative authority for the pilot. It remains only as the current default route until you decide; nothing in the pilot is derived from it.
- Child pages are not redesigned. The account route got only the shared-element transition name.
