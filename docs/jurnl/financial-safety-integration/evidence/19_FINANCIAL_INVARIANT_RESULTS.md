# Financial invariant results (automated subset)

| Suite | Result |
|-------|--------|
| `jurnlFinancialInvariants.test.ts` | 40/40 PASS |
| `jurnlFinancialStabilization.test.ts` | 27/27 PASS |
| `jurnlF05Dot01.test.ts` | 61/61 PASS (includes D59 direct `recordTransfer` overpay) |
| `jurnlF05Pockets.test.ts` | 11/11 PASS |
| **F01–F36 matrix** | Full F05 E2E not re-run this session; unit coverage for H. card payment, archive, settlement |

Command: `npm test -- tests/jurnl` → **810/810 PASS**
