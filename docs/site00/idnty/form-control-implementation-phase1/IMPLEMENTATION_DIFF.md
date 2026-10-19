# Implementation diff — Phase 1

## TypeScript / React

| Path | Change |
| --- | --- |
| `src/site00/foundation-client/components.tsx` | `DfField` gains `required` / `optional` label primitives; merges `aria-describedby` onto child control; error line uses `role="alert"`. |
| `src/site00/foundation-client/parents/EntryIntake.tsx` | P02 uses `DfField` (required markers, CONTACT NUMBER optional + backup hint); native Business Type chevron class renamed; P03 reveal fields use `DfField`. |

## Stylesheets (Digital Foundation scope only)

| Path | Change |
| --- | --- |
| `src/site00/styles/site00-df-components.css` | Token aliases (`--df-input-touch-size`, focus ring, check edge); coarse-pointer 16px inputs; solid `:focus-visible` on inputs; label required/optional; `.df-chip` / `.df-chips` (NF-02); `.df-check` border token (NF-06). |
| `src/site00/styles/site00-df-client.css` | Native select chevron → `.df-native-select__chev` (C-1); coarse-pointer font on native select; intake `:focus-visible` on `.df-input`. |

## Tests

| Path | Change |
| --- | --- |
| `tests/dfFormControlPhase1.test.ts` | Label primitives, P02 markup guards, CSS regression strings. |

## Tooling (non-production)

| Path | Change |
| --- | --- |
| `scripts/df-phase1-visual-capture.mjs` | Playwright captures for review P02. |

## Explicitly not changed

- Persistence / Supabase / Railway / API validation
- Business Type `<select>` behavior and `BUSINESS_TYPES` enum
- Phone required schema (Phase 4)
- System B checkbox markup (Phase 3)
- Progression, completion, save state machine
