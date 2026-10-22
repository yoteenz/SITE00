# Selector migration inventory

| Route | Field | Current (Phase 2) | Category |
| --- | --- | --- | --- |
| P02 intake | `industry` / `#df-industry` | `IdntySelect` when flag on; native `<select>` fallback | **A — migrated** |
| P02 intake | other fields | text inputs | B — N/A |
| P03+ | service rows, radios | not `<select>` | B — out of scope |
| Portal | record chips | tabs, not select | B |
| Admin / Builder | — | not scanned in Phase 2 | D |

No other native `<select>` in `src/site00/foundation-client/`.
