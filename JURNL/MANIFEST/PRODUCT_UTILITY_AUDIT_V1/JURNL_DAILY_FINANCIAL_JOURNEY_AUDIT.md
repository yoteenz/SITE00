# JURNL daily financial journey audit

Synthetic user `E2E@JURNL.TEST` · local dev `http://127.0.0.1:5174` · evidence in `JURNL_QA_JOURNEY_RESULTS.json`

| Journey | Entry | Expected | Actual | Execution | Defect class |
| --- | --- | --- | --- | --- | --- |
| **A — Add subscription** | F07 → ADD WHAT REPEATS | Name, price, cadence, persists | Add + reload shows STREAMING SERVICE @ $17.99 | **PLAYWRIGHT PASS** | SUBSCRIPTION kind stored as BILL; no account/category |
| **B — Prepare for bill ($95/$140)** | Reserve toward obligation | See reserved / remaining / ADD MONEY | No UI for per-obligation reserve; STS deducts full $140 when amount set | CODE + FAIL (STS text) | **NOT_IMPLEMENTED** funding progress |
| **C — Multiple upcoming** | F07 timeline | Sort, funded vs unfunded | Timeline buckets work; **no funded dimension** | CODE REVIEW | FRAGMENTED |
| **D — Organize income** | F06 | Record + assign to obligations | Income CRUD yes; **no assign-to-bill** | CODE REVIEW | PARTIAL |
| **E — Monthly subscriptions review** | Subscriptions view | Active list, monthly total | **No view**; obligations list only | CODE REVIEW | MISSING |
| **F — Safe to Spend trace** | F09 + WHY | Traceable breakdown | Formula in `safeToSpend.ts`; WHY sheet lists buckets | CODE + partial E2E | IMPLEMENTED; obligation math ignores reservations |
| **G — Pay upcoming bill** | Mark paid | Ledger + release reserve | **No mark-paid** on obligations | CODE REVIEW | NOT_IMPLEMENTED |
| **H — Correct mistake** | Edit obligation | Edit amount/date | Edit sheet for obligations; journey failed on seeded non-obligation row | **PLAYWRIGHT FAIL** | PARTIAL (obligation-only edit) |
| **I — Return after week** | F03 TODAY | What changed / due | Attention line + upcoming preview (max 2); no change digest | CODE REVIEW | PARTIAL |
| **J — Failed/changed subscription** | Price change detection | FACT-based notice | **No** price history or failed payment states | CODE REVIEW | NOT_IMPLEMENTED |

## Journey A detail (verified)

- **Route:** `/production/jurnl/runtime/upcoming`
- **Actions:** 4 (nav, add, fill 3 fields, save)
- **Data owner:** F07 → `getRepository().upsertObligation`
- **Gap:** `createObligation` always sets `kind: 'BILL'` (`UpcomingScreens.tsx`); model supports `SUBSCRIPTION`

## Journey B detail (founder scenario blocked)

Car insurance $140 / $95 set aside: **no data field** links plan assign or goal set-aside to a specific obligation. `JurnlPlanIntention.linked_obligation_id` exists in schema but is never set in UI.

## Cross-family dependencies (journeys)

- Add obligation → upcoming projection → STS **`upcoming` sum** (full amount)
- Plan assign → STS **`assigned`** (global pool, not bill-specific)
- Goal set-aside → STS **`goalReserved`**
- Trip/purchase reserve → STS (verified in code; E2E flaky on dev)
