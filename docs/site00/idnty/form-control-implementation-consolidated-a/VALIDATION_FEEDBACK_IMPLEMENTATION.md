# Validation and feedback implementation

## Scope

Phase 5 refinements preserve existing intake layout and progression (FD-5). No Board 04 replacement.

## Client validation

- **P02 CONTINUE:** `validateBusinessInfo` in `src/site00/foundation-client/model.ts` validates required contact number using `validateContactPhoneForCompletion` (`shared/site00-digital-foundation/contactPhone.ts`).
- **Approved messages:** `ENTER A CONTACT NUMBER TO CONTINUE.` (missing) and `ENTER A VALID CONTACT NUMBER.` (invalid).
- **Timing:** Errors surface at the established field-validation boundary (continue / step validation), not on every keystroke.
- **Draft save:** Partial or empty phone does not block autosave or explicit draft persistence.

## Field presentation

- `DfField` continues to provide required `*`, optional `OPTIONAL`, merged `aria-describedby`, and error `role="alert"` (Phase 1).
- Phone field uses helper copy: `USED AS A BACKUP CONTACT FOR URGENT ACCOUNT, DOMAIN, OR EMAIL ISSUES.`

## Save status

- Existing `SaveChip` / persistence repair (#1657) unchanged.
- **SAVED** only after successful authoritative persistence response; save-failure paths do not claim success (verified in persistence regression tests).

## Categories (truthful display)

| Category | Implementation |
| --- | --- |
| UNSAVED / SAVING / SAVED / OFFLINE / SAVE FAILED | Existing save chip + persistence layer |
| REQUIRED INFORMATION MISSING | Step validation including phone |
| INVALID INPUT | Phone + existing field validators |
| ACTION BLOCKED | Existing disclosure / checkout gates |
| SUBMITTED / COMPLETE | Unchanged completion surfaces |

## Accessibility

- `aria-invalid` and stable error IDs via `DfField`.
- No duplicate alert announcements for a single error.

## Verification

- `tests/dfFormControlConsolidatedA.test.ts` — phone messages and server gate.
- `tests/dfFormControlPhase1.test.ts` — label and error association regressions.
