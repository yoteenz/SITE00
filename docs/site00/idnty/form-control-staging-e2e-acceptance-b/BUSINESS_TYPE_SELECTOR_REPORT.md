# Business Type selector report

## Live staging

**FAIL / NOT VERIFIED** — deployed bundle lacks `idnty-sel-sheet` marker (pre–Sprint A / flag-off build).

## Integration code + tests

| Check | Result |
| --- | --- |
| Phase 2 unit tests (`tests/idntySelectPhase2.test.ts`) | PASS |
| Mobile sheet vs desktop listbox | Implemented in `idntySelect.tsx` |
| `BUSINESS_TYPES` enum | Unchanged (tests assert) |
| Build script defaults `VITE_DF_CUSTOM_INDUSTRY_SELECT=1` | Sprint B update |

## Post-deploy verification

On iPhone Safari staging: tap Business Type → editorial sheet, SELECT BUSINESS TYPE title, 2px red edge, immediate apply, no native picker.
