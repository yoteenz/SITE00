# 11–18 · MONEY MODEL, CLASSIFICATION, RECONCILIATION, SAFE TO SPEND

## Data modes (section 04)

| Mode | Where | Data |
|---|---|---|
| DESIGN_PREVIEW | `/production/jurnl/runtime` (the SITE 00 design workspace) | Labelled sample data, unchanged. This is the **only** mode with MOCK_ENTRIES, sample accounts and sample bills. |
| PROVIDER_SANDBOX | `/jurnl/app` with `VITE_JURNL_DATA_MODE=PROVIDER_SANDBOX` | Real JURNL account, provider sandbox institutions. Starts **empty**. |
| PRODUCTION | `/jurnl/app` | Real account. Starts **empty**: no sample transactions, accounts, balances, cash or bills. |

- **Device cache:** keyed by mode + auth user id, never by email.
- **No preview import:** `importSnapshotForUser` refuses a snapshot from another mode, and the server refuses `DESIGN_PREVIEW` snapshots.
- **Guest pocket merge:** preview only.

## One ledger (section 08)

Imported transactions are `LedgerEntry` rows with `source: 'IMPORTED'`, kept next to the user's own `ADDED` entries. There is no parallel ledger.

**Provenance (`import`):**
- the provider, Item, account and transaction ids;
- `root_transaction_id`, which is stable from pending to posted;
- the provider sign and every **original** value (source truth, never edited);
- the revision;
- a change history: ADDED, MODIFIED, POSTED, REMOVED, RESTORED.

**The user's corrections** live in `snapshot.bank.overrides`, keyed by the root id, and are re-applied on every sync (requirement K). **Rules** live in `bank.rules`, and every match decision in `bank.matches`.

**Connected accounts** keep their provider facts in `connection`: balance, available balance, limit, as-of time, status, and whether pending activity is reflected. A re-linked institution reuses its JURNL account, by persistent id or by institution + mask + type (requirement L).

## Balances

- A connected account's position is **the provider balance**: available for deposit accounts, current amount owed for cards.
- Imported entries never move it.
- A user entry moves it only when recorded after that balance was taken, and **never** when the bank already reported the same movement.
- A null provider balance is unknown, not zero.
- When the bank gave no available balance, pending items are **not** subtracted on a guess. JURNL says so instead.

## Classification (deterministic, no AI; `classify.ts`)

Precedence:
1. the user's correction;
2. the user's rules;
3. known payers (rideshare platforms);
4. the provider's personal finance category;
5. the account type;
6. merchant patterns.

- **Taxonomy:** JURNL's existing categories, plus a finer `category_detail` (GROCERIES, DINING, GAS, SHOPPING, FEES, SUBSCRIPTION, RIDESHARE PAYOUT, CASH WITHDRAWAL, CARD PAYMENT, REFUND, REVERSAL …).
- **Confidence:** only the provider's own `confidence_level` is carried; none is invented.
- **Fixed during testing:** "AUTOPAY" alone no longer reads as a card payment, because utilities use it.

## Reconciliation (`reconcile.ts`): every event counted once

| Event | Rule | Auto-match needs | Else |
|---|---|---|---|
| Pending → posted | The posted row names its pending one, so they share one entry | provider link | — |
| Internal transfer | OUT on one user account + IN on another, equal amount, −1…+5 days | at least one of: bank says transfer, description says transfer, the description names the other account's mask, a known pair. **An equal amount alone is never enough.** | SUGGESTED |
| Card payment | bank OUT + card IN, equal amount, −1…+7 days | the provider category or the description on either side | — |
| Earnings payout | a rideshare payout vs the daily earnings DIGITAL leg | same account, 0–3 days | SUGGESTED |
| Manual / receipt duplicate | a user entry on a connected account vs an import, same account, direction and amount, ±3 days | merchant matches or same kind, ≤ 2 days | SUGGESTED |
| Cash withdrawal | ATM / withdrawal vs a Cash on Hand IN | equal amount, ±2 days | SUGGESTED "ADD TO CASH ON HAND?" (classified TRANSFER, not spending) |
| Bill payment | an import vs a tracked bill occurrence | name match + exact amount + ±5 days, unique | SUGGESTED (±20 % or ±10 days) |

- **User decisions are final.** CONFIRMED and REJECTED are never overridden, and a rejected pair is never re-suggested.
- **Bills:** a matched bill payment uses or releases its set-aside money **once** (requirement F).
- **Rideshare:** gross earnings are never fabricated from a net payout. Without a manual record, the payout counts as income at its net amount.

## Safe to Spend

The established model is kept: a 30-day window and the next-income view, with credit minimums, reserved funds and pending transfers.

**Added:**
- `calculatedAt`;
- `bank.lastBankSync` and `oldestBalanceAt`;
- stale accounts (more than 24 h, or the connection needs attention);
- accounts whose pending activity is not reflected;
- plain-language `limitations`.

**Completeness:**
- A stale or unhealthy connection lowers it to PARTIAL (requirement G).
- A real account with no counted account is NEEDS_ACCOUNT and never borrows the sample cash.

**Proven in tests:** reserving money for a bill leaves the number unchanged (no double reservation), and the cash figure is the sum of the provider available balances plus the manual cash.

## Cash on Hand

It stays a manual position that needs no bank. A withdrawal is matched only when the user records the cash side, or confirms the suggestion (`confirmCashWithdrawal`).

## Credit

From the provider:
- current balance;
- available credit;
- the limit.

JURNL does not take from the provider:
- due date;
- minimum payment;
- statement close;
- APR.

Those stay in the established manual credit attributes (labelled as entered by you). Card payments reconcile as one liability payment.
