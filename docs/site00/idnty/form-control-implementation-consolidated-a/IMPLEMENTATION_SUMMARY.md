# Implementation summary

## System B (Phase 3)

- CSS: optional `.df-check--on` → ink border, white surface, 8px red `::after` period; locked rows keep ink fill + white check SVG.
- Components using `DfCheckMark`: P03 `ServiceRow`, P05 disclosures (`CheckoutActivation`), P04 add-on rows (`Recommendation`).

## Contact number (Phase 4)

- P02: `CONTACT NUMBER` + required `*`; helper copy; placeholder `ENTER PHONE NUMBER`.
- Client: `validateBusinessInfo` uses `contactPhoneFieldError()` with exact approved strings.
- Input: `formatContactPhoneInput()` — US dashed pattern or `libphonenumber-js` `AsYouType` when leading with `+`.
- Server: `completeIntake` requires valid phone for **new** completions; returns early if already `COMPLETE` (legacy grandfather).

## Phase 5

- Error association via existing `DfField` / P02 errors.
- Save chip logic untouched.
- Progression / completion layout unchanged.
