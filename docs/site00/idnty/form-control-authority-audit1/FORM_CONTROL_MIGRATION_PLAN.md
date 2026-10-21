# Form Control Migration Plan — Future Implementation (Not Executed in Audit 1)

This plan describes a **post-Opus** engineering sequence. Audit sprint **did not** implement these steps.

---

## 1. Recommended shared primitives

| Primitive | Based on | Wraps |
|-----------|----------|--------|
| `IdntyField` | `DfField` | label, hint, error id |
| `IdntyTextInput` | native input | `.df-input` classes, aria attrs |
| `IdntyTextarea` | portal textarea | `.df-input--area` |
| `IdntySelect` | **`DfSelect`** | listbox + optional sheet wrapper for mobile |
| `IdntyCheckbox` | **`DfCheckbox`** | hidden input + `DfCheckMark` |
| `IdntyRadioGroup` | **`DfRadio`** + `.df-path` layout | domain paths |
| `IdntyStepper` | extract from EntryIntake / Recommendation | quantity controls |
| `IdntyFormMessage` | `.df-field__error`, `DfAlert` | errors |
| `IdntySelectionSheet` | extend **`DfBottomSheet`** | mobile enum picker |

**Avoid:** second parallel select implementation; duplicating stepper markup a third time.

---

## 2. Replacement sequence (lowest risk first)

| Phase | Target | Inventory IDs | Risk | Rollback |
|-------|--------|---------------|------|----------|
| **0** | Opus authority sign-off | — | — | — |
| **1** | Portal comm prefs → `DfCheckbox` | FC-036 | Low | Revert single file |
| **2** | P05 acks → `DfCheckbox` | FC-027 | Medium | Accept gate QA |
| **3** | P02 Business Type → `IdntySelect` / sheet | FC-004 | **High** | Feature flag `VITE_DF_CUSTOM_INDUSTRY_SELECT` |
| **4** | P04 addon duplicate control removal | FC-024 | Medium | A11y regression |
| **5** | Extract shared `IdntyStepper` | FC-015, FC-025 | Low | — |
| **6** | Complete surface (Board 04) | FC-038 | Low user impact | Separate route flag |

---

## 3. Dependencies

- Opus visual spec + founder FD-1 decision (sheet vs listbox).
- No API migration required for phases 1–5 if field values unchanged.
- Railway staging deploy for founder iPhone verification after phase 3.

---

## 4. Functional risk controls (CLASS F)

| Risk | Mitigation |
|------|------------|
| Wrong `industry` value sent | Unit test: select each `BUSINESS_TYPES` option → `intakeFromDraft` |
| Custom legacy industry | Test `__custom` option path still serializes original string |
| Domain path desync | Existing `validateForRecommendation` + toggle tests |
| Quote desync on P04 | Existing `digitalFoundationClientBoard0102.test.ts` + manual addon toggle |
| Autosave double fire | Do not change `AUTOSAVE_MS` in same PR as control swap |
| Accept without disclosures | E2E: accept disabled until all acks |

---

## 5. Regression coverage

| Suite | Purpose |
|-------|---------|
| `tests/digitalFoundationClientBoard0102.test.ts` | Intake → quote → accept lifecycle |
| `tests/digitalFoundationComponents.test.ts` | DfSelect/DfButton a11y markup |
| `tests/foundationClientPhoneFormat.test.ts` | Phone display contract |
| `scripts/site00/df-client-qa/df-client-flow.cjs` | Visual + server parity (Playwright) |
| `scripts/site00/df-client-qa/df-client-responsive.cjs` | Viewport captures |

**Add when implementing phase 3:**

- Component test: P02 industry change updates draft and saves payload.
- Playwright: open selector, pick option, assert closed label (WebKit project if available).

---

## 6. Rollback strategy

1. Feature flag for P02 select (default off until founder verifies on staging).
2. Single-commit revert per phase; no schema changes tied to UI.
3. Keep native `<select>` behind flag branch for one release if needed.

---

## 7. Acceptance tests (founder-facing)

1. iPhone Safari P02: Business Type open + select **OTHER** — no iOS frosted wheel OR approved sheet matches board.
2. P02: all required validation errors still focus first invalid field.
3. P03: domain select/deselect + recommendation gate unchanged.
4. P05: cannot pay until all disclosures checked.
5. Portal: comm prefs save and reload correctly.

---

## 8. Explicit non-goals

- Stripe Checkout skinning
- Admin readiness desk redesign (unless scheduled separately)
- Renaming Supabase columns or intake JSON keys
