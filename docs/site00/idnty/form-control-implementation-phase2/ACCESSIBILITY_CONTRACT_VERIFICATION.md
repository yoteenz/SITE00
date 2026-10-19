# Accessibility contract verification

| Contract area | Status | Notes |
| --- | --- | --- |
| Sheet dialog title | Implemented | `role="dialog"` + `aria-labelledby` |
| Listbox/combobox | Implemented | DfSelect roles preserved on desktop |
| Label association | Implemented | `labelledBy="df-industry-label"` from DfField |
| Error association | Ready | Via DfField `describedBy` when errors added |
| Keyboard dismissal | Implemented | Escape via `useDfDialogFocus` |
| Focus restore | Implemented | Returns to `#df-industry` trigger |
| VoiceOver | **NOT RUN** | |
| Color-only selection | Avoided | Red period + weight on selected row |
