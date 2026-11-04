# JURNL financial integrity and regression matrix

| ID | Invariant | Status | Notes |
| --- | --- | --- | --- |
| FIN-01 | Reserve does not create money | PASS | |
| FIN-02 | Double payment count | UNVERIFIED | No pay flow |
| FIN-03 | Reserve vs expense distinct | PARTIAL | Trips/purchases yes; bills no |
| FIN-04 | Income not double-counted | PASS | single ledger append |
| FIN-05 | Paid obligation not in upcoming | FAIL | No paid state |
| FIN-06 | Recurrence without fake txn | PARTIAL | static next_due_date |
| FIN-07 | Archive ≠ merchant cancel | FAIL copy | END button |
| FIN-08 | Balance vs projected labeled | PARTIAL | MOCK labeled in F05 hint |
| FIN-09 | Unconfirmed not shown confirmed | PASS | |
| FIN-10 | Insights traceable | PARTIAL | STS WHY ok |
| FIN-11 | Manual correction | PASS | edit/delete paths |
| FIN-12 | Transfers double-count | UNVERIFIED | |
| FIN-13 | Goals+bills+plan deduct once | **RISK** | see obligation funding doc |
| FIN-14 | Currency precision | PASS USD 2dp inputs |
| FIN-15 | Recurrence edge dates | UNVERIFIED | |
| FIN-16 | Stale data labeled | PARTIAL | STS completeness |
| FIN-17 | Sync conflict | UNKNOWN | device-first |
| FIN-18 | RLS | OUT OF SCOPE audit | live-proof separate |
| FIN-19 | Reserve ≠ bank hold | PASS | |
| FIN-20 | STS not guarantee | PASS copy |

## Critical defects (product)

- **DEF-001** — No per-obligation funding / funded display  
- **DEF-002** — No mark-paid / ledger linkage for obligations  
- **DEF-003** — Subscription kind not selectable; no subscription hub  
- **DEF-004** — STS upcoming uses full bill amount (no net funded)  
- **DEF-005** — Plan `linked_obligation_id` unused  

## Regression tests required (implementation phase)

- STS math when `funded_amount` added  
- Obligation pay advances date + ledger single entry  
- Subscription monthly total normalization unit tests  

**Do not change formulas in this audit.**
