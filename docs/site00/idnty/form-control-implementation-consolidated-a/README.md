# IDNTY form control — consolidated implementation (Phases 3–5)

**Sprint:** `P0.SITE00.IDNTY.FORM-CONTROL-IMPLEMENTATION.COMPOSER-CONSOLIDATED-A`  
**Base:** `cursor/idnty-founder-readiness-e2e-be3b` @ Phase 2 merge `#1660` (`1152f25f`)

## Delivered

| Phase | Scope |
| --- | --- |
| 3 | System B checkbox marks (FD-3) on services, disclosures, add-ons |
| 4 | Required CONTACT NUMBER + intl validation + server completion gate (FD-2) |
| 5 | Validation copy, required labels, save chip unchanged contract, completion CSS alignment |

## Key paths

- `shared/site00-digital-foundation/contactPhone.ts`
- `src/site00/foundation-client/contactPhoneInput.ts`
- `src/site00/foundation-client/model.ts` (`validateBusinessInfo` phone)
- `api/_lib/digitalFoundation/service.ts` (`completeIntake` guard)
- `src/site00/styles/site00-df-components.css` (System B `.df-check--on`)
- `tests/dfFormControlConsolidatedA.test.ts`

## Staging flags

- `VITE_DF_CUSTOM_INDUSTRY_SELECT=1` — custom Business Type selector (Phase 2)
- Contact phone gate is always active on **new** intake completion (no env flag)

## Evidence

`/opt/cursor/artifacts/df-consolidated-a-visual/` (when capture script run)

See sibling markdown files in this folder for matrices and verification status.
