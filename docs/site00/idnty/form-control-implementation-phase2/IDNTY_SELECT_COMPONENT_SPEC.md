# IdntySelect component spec

**Module:** `src/site00/foundation-client/idntySelect.tsx`

## API

| Prop | Type | Notes |
| --- | --- | --- |
| `id` | string | Trigger element id (matches `DfField` label `htmlFor`) |
| `value` | string | Controlled stored value (exact enum / legacy string) |
| `options` | `DfSelectOption[]` | Stable `value` + display `label` |
| `placeholder` | string | Empty-state trigger label |
| `onChange` | `(value: string) => void` | Parent persists via existing `update()` |
| `disabled` / `readOnly` | boolean | Blocks open |
| `invalid` / `describedBy` / `labelledBy` | a11y | Passed to trigger |
| `sheetTitle` | string | Default `SELECT BUSINESS TYPE` |
| `presentation` | `'sheet' \| 'listbox'` | Optional override (tests) |

## Presentation rule

`(pointer: coarse) and (max-width: 600px)` → editorial sheet (`IdntySelectionSheet` portal).  
Otherwise → `DfSelect` anchored listbox (Territory A).

When presentation media query changes while sheet is open, sheet closes without mutating value.

## Flag

`dfCustomIndustrySelectEnabled()` — true when `VITE_DF_CUSTOM_INDUSTRY_SELECT=1` or `DEV`; false when `=0` / `false`. Cloud preview dev server sets `=1` in `run-site00-cloud-preview-server.sh`.
