# 18 · Global migration matrix (revalidated)

Re-counted on this branch: 74 `JurnlDrawer` call sites (77 at V3 − the three rebuilt here), 1 `material="v3"` (CONSENTS),
21 `Dot01Overlay`, 6 `JurnlModal`, 2 `JurnlSheet`, 2 `SelectionSheet` (hardened), 3 `JurnlPopover`, 5 V3 surfaces,
4 `EditorialOverlay`. The V3 inventory (303 surfaces, `JURNL_GLOBAL_INTERACTIVE_V3_V1/reports/02_APPENDIX_FULL_INVENTORY.md`)
is reclassified:

| Classification | Surfaces | Notes |
|---|---|---|
| ALREADY_CONFORMANT | 40 | V3 count (V9 DOT 01 pages / overlays, approved replicas) |
| MIGRATED (V3 + this sprint) | 13 + 7 | V3: menu, membership, add-ons, unlock, consents, transfer→now editorial, fragment, caution; this sprint: 01 02 03 05 rebuilt, 04 07 08 adapted |
| REUSE_APPROVED_COMPOSITION | ≈ 52 | the remaining form `JurnlDrawer`s with a pick / ledger shape → `register` or `transfer` composition (F04 entry, F06 earnings, F07 bills / pay, F08 set-aside, F10 / F11 forms) |
| ADAPT_APPROVED_SURFACE_FAMILY | ≈ 22 | detail / analysis drawers → `search` ledger or the V3 folio with board materials |
| NEW_UNIQUE_AUTHORITY_REQUIRED | 6 | the `JurnlModal`s (confirmations) and the F09 SECURITY set: no board panel governs them |
| FUNCTIONAL_REMEDIATION_REQUIRED | 5 | confirmations missing on F06 ARCHIVE, F10 I BOUGHT IT, F11 MARK COMPLETE, F16 UNLINK, SIGN OUT (V3 U9) |
| NOT_IMPLEMENTED | 8 | V3 functional dependencies (HELP, NOTIFICATIONS, SECURITY, CALENDAR, DATA EXPORT, LEGAL, MANAGE MEMBERSHIP, billing) |
| BLOCKED | 1 | 06 ACCOUNT / SETTINGS (authority conflict with the F09 replica) |

Approximate counts (≈) come from the call-site mapping by file (finance/FinanceSheets 15, screens/SecurityScreens 13,
HomeScreens 5, GoalsScreens 4, EntryScreens 4, CreditSheets 4, Trips / Setup / Records / Plan 3 each, …); each needs its own
review before migration. No family rollout is authorised before the founder reviews the eight pilots.
