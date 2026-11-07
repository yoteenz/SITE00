# Card overpayment root cause

**Finding:** `previewTransfer` in `entry.ts` enforced max card payment (owed minus open CARD_PAYMENT legs), but `buildTransfer` / `recordTransfer` in `ledgerOps.ts` did not — FinanceSheets and CreditSheets call `recordTransfer` directly.

**Impact:** F13 invariant could fail for MONEY cabinet / F12 credit sheet / programmatic calls bypassing DOT01 preview.

**Evidence:** `tests/jurnlF05Dot01.test.ts` D59 now asserts both `previewTransfer` and `recordTransfer` reject overpay.
