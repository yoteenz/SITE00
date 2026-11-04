# JURNL personal financial operating system — implementation evidence

**Sprint:** P0.JURNL.PERSONAL-FINANCIAL-OPERATING-SYSTEM.UNIFIED-ACCOUNTING-AND-UTILITY-CONVERGENCE1
**Branch:** `claude/jurnl-financial-os-unification-um0u93` · **Main baseline:** `e413590e` · **Status:** FOUNDER_REVIEW (draft PR, not merged, not deployed)

## In one paragraph

JURNL now keeps one ledger and works out every account from it: money held in the bank, payout card and cash; money owed on cards. One end-of-day entry records a day's rideshare (or any) earnings — digital money into the chosen account, cash tips into cash, tips never counted twice — and can be edited or removed without leaving duplicates. Spending lands on the account that paid (a card purchase raises what the card owes; it does not lower cash). Transfers and card payments are never income or spending. Bills and subscriptions can be paid, part-paid, skipped, moved, undone and stopped; money can be set aside toward one bill from a specific account, and **$95 set aside toward a $140 bill leaves Safe to Spend at $360, not $265**. Cards show the minimum still due after payments, the statement balance, the due date and a utilization target the user chooses — no credit score, no invented terms, no automatic payments. TODAY states a counted fact ("1 BILL DUE THIS WEEK", "CARD DUE FRIDAY") and SEE WHY explains the number line by line. Approved compositions are unchanged.

## Gates

| Gate | Status | Evidence |
| --- | --- | --- |
| A · Canonical money model | VERIFIED | doc 02; invariants A, B, E–J, V, X, Z |
| B · Daily earnings | VERIFIED | doc 03-04; invariants A–D; journey "daily earnings" ×4 viewports |
| C · Transfers and liabilities | VERIFIED | doc 06-08; invariants G–J; journeys "transfer", "spending", "credit" |
| D · Subscriptions and bills | VERIFIED | doc 06-08; invariants K, L, Y, skip / reschedule / cancel; journeys "subscriptions", "bill funding" |
| E · Reservation mathematics | VERIFIED | invariants M, N, O, reassign, settle-on-payment |
| F · Safe to Spend | VERIFIED | `JURNL_SAFE_TO_SPEND_INVARIANT.md`; invariant N ($360); journey asserts no change on set-aside / card purchase |
| G · Credit payment planning | VERIFIED | doc 10-11; invariants P, Q, R, W, interest; journey "credit" |
| H · TODAY cross-family | VERIFIED | doc 10-11, 13; journey "today" (no page overflow at 360 / 393 / 834 / 1440) |
| I · Plain language | PARTIAL | doc 12: 46 replaced, every flagged string decided; family questions (editorial) await the founder's call on #1704's proposals |
| J · Full product regression | VERIFIED WITH PRE-EXISTING FAILURES | unit 678 / 680 (2 fail on main too); E2E doc 20: 160 pass, 21 fail identically on main, 1 regression found and fixed (Journey A), 1 setup timeout passed on rerun; build passes |

## Results at a glance

| Check | Result |
| --- | --- |
| Financial invariant suite (A–Z) | 40 / 40 PASS (`14_FINANCIAL_INVARIANT_TEST_RESULTS.json`) |
| New user journeys (8) × 360 / 393 / 834 / 1440 | 32 / 32 PASS (`15_USER_JOURNEY_E2E_RESULTS.json`) |
| JURNL unit suite | 678 / 680 — the 2 failures are the F01 production-mode tests that fail identically on main |
| Existing JURNL E2E (mobile, tablet, desktop) | see `20_FULL_JURNL_E2E_REGRESSION.json` |
| TypeScript (`tsc --noEmit`) | PASS |
| Production build (`npm run build`) | PASS |
| Accessibility (axe: serious / critical) | PASS — new sheets ×4 viewports, existing a11y suite ×3 (`17_ACCESSIBILITY_RESULTS.json`) |
| Visual regression vs main | root-authority parents ≤ 0.86 % pixels changed (text only); frame families gained panels inside the existing rail (`16_RESPONSIVE_VISUAL_REGRESSION.json`) |
| Production security / live RLS proof | BLOCKED — secrets absent (`18_SECURITY_AND_PERSISTENCE_REPORT.md`) |

## Documents

| # | File |
| --- | --- |
| 01 | `01_REPOSITORY_RECONCILIATION.md` |
| 02, 05 | `02_CANONICAL_FINANCIAL_ACCOUNTING_MODEL.md` |
| 03, 04, 05 | `03-04_ACCOUNT_PURPOSES_AND_DAILY_EARNINGS.md` |
| 06, 07, 08 | `06-08_TRANSFERS_BILLS_SUBSCRIPTIONS_FUNDING.md` |
| 09 | `JURNL_SAFE_TO_SPEND_INVARIANT.md` |
| 10, 11 | `10-11_CREDIT_GUIDANCE_AND_TODAY.md` |
| 12 | `12_FUNCTIONAL_COPY_REPLACEMENT_MATRIX.md` + `.csv` |
| 13 | `13_CROSS_FAMILY_DATA_FLOW.md` |
| 14 | `14_FINANCIAL_INVARIANT_TEST_RESULTS.json` (suite: `tests/jurnlFinancialInvariants.test.ts`) |
| 15 | `15_USER_JOURNEY_E2E_RESULTS.json` (suite: `e2e/jurnl/jurnl-financial-os.e2e.ts`) |
| 16 | `16_RESPONSIVE_VISUAL_REGRESSION.json` |
| 17 | `17_ACCESSIBILITY_RESULTS.json` |
| 18 | `18_SECURITY_AND_PERSISTENCE_REPORT.md` |
| 19 | `19_IMPLEMENTATION_CHANGE_MANIFEST.md` |
| 20 | `20_FULL_JURNL_E2E_REGRESSION.json` |
| ZIP | `JURNL_FINANCIAL_OS_FOUNDER_REVIEW.zip` (compact), `JURNL_FINANCIAL_OS_FULL_EVIDENCE.zip` (all docs, screenshots at 4 viewports, main-vs-branch images, raw results) |

## Decisions for the founder

1. **Safe to Spend window** — bills count when due within the next 30 days (overdue included). Alternative: until the next expected income.
2. **Card minimums in Safe to Spend** — now deducted (minimum still due within the window). Previously shown in UPCOMING but not deducted.
3. **F08 "SET MONEY ASIDE"** — your example replaced "ADD AN INTENTION". The bill page also says "SET MONEY ASIDE" (bill-specific, from an account). Keep both, or rename one?
4. **Family questions** (`parents/catalog.ts`) — #1704's proposed replacements still kept as editorial; approve or reject.
5. **Merge order with #1704** — this branch carries #1704's audit files byte-for-byte; either order merges. Only `motherboard/MEMORY.md` needs a trivial append-merge.

## What this is not

Not a bank connection; every balance is entered by the user or derived from what they recorded, and says so. No production database writes, no migrations, no deployment, no images generated, no OpenArt credits.
