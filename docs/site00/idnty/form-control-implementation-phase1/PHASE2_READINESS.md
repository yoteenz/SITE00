# Phase 2 readiness — selector (FD-1)

## Completed prerequisites

- Shared tokens for control height, border, focus, placeholder, and touch font size
- `DfField` label + description pattern for sheet titles and listbox labels
- Native Business Type instance documented: `#df-industry` `<select>` with `BUSINESS_TYPES` enum unchanged
- C-1 chevron scoping prevents combobox CSS from breaking native chevron

## Phase 2 implementation scope (not started)

- `IdntySelect` wrapper with `VITE_DF_CUSTOM_INDUSTRY_SELECT` flag default **off**
- Mobile: editorial selection sheet (Territory B)
- Desktop: anchored listbox (Territory A)
- Sheet copy: `SELECT BUSINESS TYPE`, dismiss `CANCEL`, immediate apply on selection
- Accessibility tests for listbox/sheet APG patterns

## Blockers

- Founder merge authorization for Phase 1 PR
- Staging verification on real iPhone after deploy (focus zoom + sheet)
