# 02 · Canonical financial accounting model

One ledger, derived balances. No second ledger was introduced.

## Ownership

| Domain | Owner | Storage (RepositorySnapshot, schema v5, additive) |
| --- | --- | --- |
| Money locations (accounts, cards, cash) | F05 MONEY | `accounts` |
| Every money movement | F04 ACTIVITY | `transactions` (the one ledger) |
| Daily earnings source records | F06 INCOME | `dailyEarnings` (new, defaults to `[]`) |
| Bills and subscriptions | F07 UPCOMING | `obligations` (extended) |
| Money set aside toward a payment | F07 (bills) / F12 (cards) | `reservations` (new, defaults to `[]`) |
| Card terms | F12 CREDIT | `creditAttributes` (extended) |
| Usual-account preferences | GS.SETTINGS | `settings.purposeAccounts` |
| Safe to Spend | F09 | derived only (`computeSafeToSpend`) |
| TODAY reading | F03 | derived only (`computeTodayOperating`) |

## Money locations (`data/ledger/accounting.ts`)

| Field | Meaning |
| --- | --- |
| `account_id` | Stable id (now `acct-<time>-<seq><rand>`; was `acct-<ms>`) |
| `display_name`, `account_type`, `currency`, `status`, `as_of`, `updated_at` | as before |
| Nature | `ASSET` (CHECKING, SAVINGS, DEBIT_CARD, CASH, INVESTMENT, BUSINESS, OTHER) or `LIABILITY` (CREDIT_CARD, LOAN) |
| Holding | `EXTERNAL_ACCOUNT` (bank, card, payout provider) or `MANUAL_CASH_LOCATION` (CASH) |
| `is_payout_card` | Preference flag for an asset card that receives rideshare pay. A payout card set up as a credit card stays a liability. Two payout cards are two accounts. |
| Basis | `ENTERED_BY_YOU`, `SAMPLE` (the two seeded preview accounts until the user enters a balance), `NOT_VERIFIED`, `BANK_CONFIRMED` (never produced: no provider) |
| Freshness | `TODAY`, `THIS_WEEK`, `OLDER`, `UNKNOWN` from the last entered balance or recorded entry |

New account type: `DEBIT_CARD` — a card-based asset account that is not a bank checking account (Uber / Lyft payout cards, prepaid debit). The user picks the type; JURNL does not assume it.

## The balance rule

```
position(account) = entered balance + Σ effect(recorded entries on that account, dated today or earlier)
  ASSET:      money in → +amount   money out → −amount          (position = money held)
  LIABILITY:  charge  → +amount    payment / refund → −amount   (position = amount owed)
```

- Preview (`MOCK`) entries never change a balance — they are history already inside the entered balance (existing convention).
- Entries dated after today are scheduled and change nothing until their date.
- Entries naming no known account are counted as **unassigned** and reported ("N ENTRIES HAVE NO ACCOUNT"); they are never routed into an unrelated account.
- Credit available (`limit − owed`) is shown separately and is **never** money held. Net worth is a separate, labelled figure.
- Every amount is rounded to cents per entry (`toCents`); totals are summed in integer cents (`sumCents`).

## Transaction classes (`LedgerEntry.txn_class`)

| Class | Effect | Counts as |
| --- | --- | --- |
| INCOME | asset + | income |
| EXPENSE | asset − | spending |
| CREDIT_PURCHASE | card owed + | spending (no cash leaves) |
| TRANSFER | OUT leg asset −, IN leg asset + | neither (counted once, OUT leg) |
| CREDIT_PAYMENT / DEBT_PAYMENT | OUT leg asset −, IN leg owed − | neither — a liability settlement |
| REFUND | asset + or owed − | refund |
| ADJUSTMENT | either | neither — a balance correction |

Legacy entries without a class are classed from direction + account nature (an expense on a card is a CREDIT_PURCHASE). Every write path (Quick Add, income received, purchase bought) now gets `account_id`, `txn_class` and `occurred_on` at write time (`deviceRepository.appendTransaction`).

Each entry also carries: `occurred_on`, `recorded_at`, `confirmation` (`RECORDED_BY_YOU`, `PENDING_CONFIRMATION`, `SAMPLE`; `BANK_CONFIRMED` reserved), `origin_family`, `link { kind, id, leg }`, `obligation_id`, `occurrence_date`, `counterparty_account_id`.

## Linked events and atomic writes

`JurnlRepository.commit(FinancialCommit)` applies changes across collections in **one persist** (one notification, one sync push). One daily earnings save, one transfer (two legs), one bill payment plus its set-aside settlement each land together or not at all. Re-applying a commit is idempotent (upsert by id).

## Corrections

- **Balance edits** (F05 edit, F12 "balance owed"): with no recorded entries yet, the entered balance is set; afterwards a single ADJUSTMENT entry records the difference. Nothing is counted twice and history stays.
- **Renaming an account** stamps the stable id on older entries that only knew the name, in the same commit.
- **Linked entries** (earnings legs, transfer legs, bill payments) are changed where they were made; Activity sends you there. Transfers and card payments can be removed as one event (both legs).

## Files

`data/ledger/accounting.ts` (pure engine) · `data/ledger/ledgerOps.ts` (builders → commits, plain-language errors) · `data/ledger/moneyPositions.ts` (repository readers + hooks) · `data/ledger/purposes.ts` (doc 03) · `data/repository/ids.ts` · `data/repository/deviceRepository.ts` (`commit`, enrichment, unique ids).
