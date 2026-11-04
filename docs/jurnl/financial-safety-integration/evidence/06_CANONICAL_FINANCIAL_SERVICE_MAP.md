# Canonical financial service map

| Concern | Module |
|---------|--------|
| Positions / balances | `src/projects/jurnl/data/ledger/accounting.ts` → `computeLedgerPositions` |
| Writes | `src/projects/jurnl/data/ledger/ledgerOps.ts` → `buildTransfer`, `recordTransfer`, `applyOp` |
| Settlement states | `src/projects/jurnl/data/ledger/transferSettlement.ts` |
| DOT01 preview/save | `src/projects/jurnl/data/f05/dot01/entry.ts` |
| Transfer/card amount guards | `src/projects/jurnl/data/ledger/transferFinancialLimits.ts` (**new shared**) |
| Safe archive | `src/projects/jurnl/data/f05/dot01/archive.ts` → `archiveBlockers`, `archiveAccountSafely` |
| MONEY parent reads | `src/projects/jurnl/data/f05/moneyParentReading.ts` |
| Safe to Spend | `src/projects/jurnl/data/f09/safeToSpend.ts` |
| Persistence | `src/projects/jurnl/data/repository/deviceRepository.ts` (local synthetic; no Railway card API) |
