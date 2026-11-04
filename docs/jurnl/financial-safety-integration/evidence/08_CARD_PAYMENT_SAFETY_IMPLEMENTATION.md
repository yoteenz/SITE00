# Card payment safety implementation

- Added `validateTransferFinancialLimits()` in `transferFinancialLimits.ts`.
- `buildTransfer()` calls it before leg construction (authoritative for all `recordTransfer` paths).
- `previewTransfer()` delegates to the same validator; warnings preserved for asset overdraft (non-cash).
- No silent amount clamping; errors are explicit strings matching prior DOT01 UX.
