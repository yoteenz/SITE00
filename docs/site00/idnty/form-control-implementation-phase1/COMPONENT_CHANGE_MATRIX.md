# Component change matrix — Phase 1

| Component | Phase 1 | Later phase |
| --- | --- | --- |
| `DfField` | Required `*`, optional `OPTIONAL`, hint/error `aria-describedby` merge | — |
| P02 `Field` (local) | **Removed** — unified on `DfField` | — |
| Native Business Type `<select>` | Chevron class `df-native-select__chev`; optional label | Phase 2: `IdntySelect` sheet / listbox |
| Phone input | Label `CONTACT NUMBER`, optional, backup hint; placeholder `ENTER PHONE NUMBER` | Phase 4: required + intl validation |
| `DfButton` / `.df-cta` | Existing solid `:focus-visible` ring confirmed | — |
| `.df-chip` | Styled tabs for portal records (NF-02) | — |
| `.df-check` | Border token aligned to `#8f8d88` / 1.5px | Phase 3: System B integration |
| `DfSelect` (combobox) | Unchanged behavior; tokens shared | Phase 2 consumer |
| Progression / save chip | **No changes** | — |
