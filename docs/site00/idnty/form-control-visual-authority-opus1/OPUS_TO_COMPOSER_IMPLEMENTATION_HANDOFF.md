# Opus → Composer implementation handoff

**Do not start before the founder has answered FD-1, FD-3 and FD-4** (see `FOUNDER_APPROVAL_REGISTER.md`). FD-5 and FD-6 only gate Phase 3 visuals.

Everything below is presentation. Field names, enum strings, React state, validation, intake mappings, API payloads, Supabase, autosave timing, quote inputs, lifecycle states and token handling stay exactly as they are.

## 0. Ground rules

1. **One component layer.** Extend `src/site00/foundation-client/components.tsx` and `site00-df-components.css`. Do not create a second UI system. This is the PR #1573 convention in `motherboard/MEMORY.md`.
2. **Proposal CSS is a reference, not an import.** `boards/src/proposal.css` shows every value. Port the rules into `site00-df-components.css` under the existing `df-` names. Never import anything from `docs/`.
3. **Exact strings.** `industry` writes a `BUSINESS_TYPES` string, `''`, or the untouched legacy value. Never index numbers or labels that differ from values.
4. **Autosave stays exactly as it is:**
   - Do not change `AUTOSAVE_MS` (900), `saveIntake`, `retry()` or `useIntakeDraft`.
   - The status line only re-presents `SaveStatus`.
5. **Feature-flag the risky swap.** Phase 2 FC-004 sits behind `VITE_DF_CUSTOM_INDUSTRY_SELECT` (the audit's name), default **off** until the founder verifies it on staging.
6. **One revertable commit per family.** No schema, migration or API change in any phase.

## 1. Collisions to resolve first

| ID | Problem | Fix |
| --- | --- | --- |
| **C-1** | `site00-df-client.css` `.df-select__chev { position: absolute; top: 50%; right: 12px; transform: translateY(-50%) rotate(90deg) }` was written for the native select's right-pointing `DfIcon chevron`. It also hits DfSelect's down chevron. Measured: `position: absolute`, `matrix(0,1,-1,0,0,-8)`. | Scope the legacy rule to the native control (`.df-select > select ~ .df-select__chev`), or delete it when FC-004 moves to IdntySelect. Then DfSelect's own `.df-select--open .df-select__chev { rotate(180deg) }` works. |
| **NF-01** | `site00-df-components.css` `.df-input { font-size: 14px }` overrides the client sheet's 16 px anti-zoom rule | `@media (pointer: coarse) { .df-input, .df-select__trigger { font-size: 16px } }`. Placeholders keep 10 px tracked caps (the `::placeholder` rule is separate). |
| **NF-02** | `.df-chip` has no CSS | Add the tab styles (`COMPONENT_STATE_SPECIFICATIONS.md` §1.11) |
| — | `.df-select__option--selected { background: #ebeae6 }` | Replace with the red period (`::before` 6 px square) plus 700 weight; keep `--active` `#f4f3f0` |
| — | `.df-choice:focus-within .df-check { outline: 2px solid rgba(229,1,7,.35) }` is about 1.9:1 | `outline: 2px solid var(--df-red)` |

## 2. Family-by-family map

| Family | Source today | Audit IDs | Treatment | Shared primitive | States (see specs) | Mobile | Desktop | A11y contract | Data-binding constraint | Regression tests | Priority / phase | Rollback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Tokens and grammar | `site00-df-components.css` | — | Port `--ix-*` values (already hard-coded) and the red-period / active-frame rules | — | — | — | — | C-04 focus | none | `digitalFoundationComponents.test.ts` (markup), visual capture | P1 / **Phase 1** | Revert CSS commit |
| Field shell + text | `EntryIntake.tsx` `Field` + `input()`; `DfField` | FC-003, 005, 006, 007, 012, 013, 019 | Optional tag, focus frame plus label mark, error mark, read-only lock | `DfField` (add `optional`, `readOnlyTag`) | §1.1 | 16 px values | 14 px | C-04 | Same `id` / `value` / `onChange`; `df-<field>-error` ids unchanged | `digitalFoundationClientBoard0102.test.ts`; P02 submit focuses the first invalid field | P2 / Phase 2 | Revert |
| Keyboard attrs | Same | FC-005, 006, 007, 012, 013, 019 | `enterkeyhint`, `inputmode="url"`, `autocomplete="off"` | — | — | iOS keyboards | — | C-04 | Attributes only | `foundationClientPhoneFormat.test.ts` stays green | P2 / Phase 2 | Revert |
| Selector | `EntryIntake.tsx` 188–207 native select; `DfSelect` 252–464 | **FC-004**, FC-043 | FD-1 outcome: IdntySelect (B on coarse ≤ 600 px, A otherwise) | `DfSelect` (A) + new `IdntySelectionSheet` (B) + `IdntySelect` wrapper | `SELECTOR_TERRITORIES.md` | B sheet | A listbox | C-01, C-02 | `update({ industry })` with exact strings; the legacy value is listed first and preserved; Clear writes `''`; `editable=false` disables | New: every `BUSINESS_TYPES` value round-trips through `intakeFromDraft`; legacy value preserved; Clear writes `''`; Escape and scrim leave the value unchanged; Playwright opens, picks and asserts the closed label (WebKit if available) | **P1 / Phase 2** behind the flag | Flag off falls back to the native select; one-commit revert |
| Textarea | `ProjectPortal.tsx` 228–230 | FC-033 | Field shell, optional tag, vertical resize | `DfField` | §1.3 | 16 px | 14 px | C-04 | `notes` state unchanged | Portal action submit test | P2 / Phase 3 | Revert |
| Radio group | `EntryIntake.tsx` 429–448 | FC-011 | Keep the visuals; add the group error; make the hidden input focusable | `DfRadio` marks (optional) | §1.5 | — | — | C-06 | `domainPath` and the `DOMAIN_FLAG` mapping unchanged | `validateForRecommendation` tests; keyboard arrow test | P2 / Phase 2 | Revert |
| Service rows | `EntryIntake.tsx` `ServiceRow` | FC-010, 016–020 | Locked; focus ring only | `IdntyChoiceRow` (shared row shell) | §1.6 | — | — | C-05 | `needs[]`, `toggleNeed` unchanged | Existing P03 toggle tests | P3 / Phase 2 | Revert |
| Disclosures | `CheckoutActivation.tsx` 347–360 | FC-027 | Shared mark, legend count, post-attempt invalid line, ink when accepted | `DfCheckbox` | §1.7 | — | — | C-05 | `DF_DISCLOSURES` text and the accept gate unchanged | E2E: accept disabled until all three are checked; accept payload unchanged | P1 / Phase 3 (audit phase 2) | Revert |
| Portal preferences | `ProjectPortal.tsx` 414–428 | **FC-036** | Native box replaced with the `DfCheckbox` row; required item locked in ink | `DfCheckbox` | §1.8 | — | — | C-05 | `CommunicationPrefs` keys unchanged | Prefs save and reload | **P1 / Phase 3** (audit phase 1: lowest risk, may go first) | Revert one file |
| Add-ons | `Recommendation.tsx` 60–110 | FC-023, **024**, 025 | Single control; mark becomes a span; frame when on | `IdntyChoiceRow` | §1.9 | — | — | C-05 | `addon_id`, quantity and `useQuoteSelections` unchanged | `digitalFoundationClientBoard0102.test.ts` quote sync; a11y: one tab stop per row | P1 / Phase 3 | Revert |
| Stepper | `EntryIntake.tsx` 316–340, 512–518; `Recommendation.tsx` 90–97 | FC-015, 025 | Extract; 36 px; tabular value | **`IdntyStepper`** (new, extracted) | §1.10 | 44 px hit area | — | C-07 | `team_size` and quantity bounds (1–50) unchanged | Both call sites' bounds | P2 / Phase 3 | Revert |
| Tabs | `ProjectPortal.tsx` 324–329 | FC-035 | Tabs CSS (NF-02); roving focus | — | §1.11 | Horizontal scroll if needed | — | C-08 | UI filter only | Filter test | P3 / Phase 3 | Revert |
| Sheets / modal | `DfBottomSheet`, `DfModal` | FC-022, 030 | FD-6 outcome (skin only) | `DfBottomSheet` | §1.12 | — | — | C-02 (for selector sheets) | Display only | Component tests | P2 / Phase 3 | Revert CSS |
| Status line | `SaveChip` in `EntryIntake.tsx` | FC-009 | Marks; `dirty` reads `UNSAVED CHANGES`; RESTORED; OFFLINE | `IdntySaveStatus` (re-presented SaveChip, same props) | §5.1 | — | — | C-09 | Reads `status` and `savedAt` only. **No timing change.** OFFLINE reads `navigator.onLine`. RESTORED is computed from the seeded draft. | Status mapping unit test per `SaveStatus` | P2 / Phase 2 | Revert |
| Feedback ladder | `DfAlert`, `DfSystemPanel`, toasts | FC-031, 048, 049 | Section summary, page banners, system panels kept | — | §5.2 | — | — | C-09 | Copy reused verbatim; proposed copy marked | Panel tests | P3 / Phase 3 | Revert |
| Progression | `DfProgress`; drawer; rail | FC-051 | FD-5 outcome (index strip); back link; blocked summary and counter | `DfProgress` (restyle) | §4 | — | — | C-10 | `foundationProgress()` and `buildDfMenu()` unchanged | `digitalFoundationMenuDrawer.test.ts`; progress tests | P3 / Phase 3 | Revert |
| CTAs | `DfButton` / `DfCta` | FC-001, 008, 021, 026, 029, 034, 037 | Unchanged (approved); text back link added | `DfButton tone="text"` | §1.14 | — | — | C-10 | Stripe URLs and accept unchanged | Existing | P3 / Phase 1 | — |
| Completion CTAs | `DigitalFoundationCompleteSurface.tsx` | FC-038 | FD-4: `DfButton` plus ink done marks; layout untouched | `DfButton`, `DfCheckMark` | §1.16 | — | — | C-10 | `captureBuildInterest` unchanged | Build-interest capture test | P2 / Phase 3 | Revert |
| Admin inputs | `FoundationReadinessPage.tsx` | FC-039–042 | Deferred (out of client scope) | `DfField` under `.df-portal` | — | — | — | C-04 | Test APIs only | — | P3 / later | — |
| Stripe | Hosted | FC-047 | No change; SITE 00 side busy and return only | — | — | — | — | — | URLs and params unchanged | Existing checkout tests | — | — |

## 3. Data-contract checklist (verify in every PR)

- [ ] `intakeFromDraft(draft)` output is byte-identical before and after for the same draft (snapshot test).
- [ ] `industry` ∈ `BUSINESS_TYPES ∪ {''} ∪ {legacy value as loaded}`.
- [ ] `needsFromDraft` and `domainPathFromNeeds` are untouched.
- [ ] `AUTOSAVE_MS`, `saveIntake` and `retry` are untouched (`git diff` shows no change in `useFoundationArtifact.ts` save logic).
- [ ] Quote selections and accept payload are unchanged (`digitalFoundationClientBoard0102.test.ts`).
- [ ] No Supabase migration, policy, API route or lifecycle change in the diff.

## 4. Phases

These are validated against `FORM_CONTROL_MIGRATION_PLAN.md`. The audit's ordering (portal preferences first as lowest risk) is kept inside Phase 3, or may lead it.

| Phase | Scope | Gate |
| --- | --- | --- |
| **1: Tokens and safe foundations** | Collisions C-1 (scoped), NF-01 (16 px coarse), NF-02 (tab CSS), focus ring, red-period and active-frame CSS, `--ix-*` values, selected-option styling. No markup changes in parents. | Visual captures at 375, 390, 430 and 1280 match the boards; full test suite green |
| **2: Primary client intake** | P02 field shell (optional tag, marks), keyboard attributes, status line re-presentation, **FC-004 IdntySelect behind `VITE_DF_CUSTOM_INDUSTRY_SELECT`**, domain radio keyboard fix | FD-1 answered; founder iPhone check on Railway staging with the flag on; flag stays off in production until approved |
| **3: Secondary forms and portal** | Portal preferences → DfCheckbox (FC-036), P05 acks (FC-027), add-on single control (FC-024), IdntyStepper extraction, tabs, overlays (FD-6), progress strip (FD-5), completion CTAs (FD-4), textarea | FD-3, FD-4, FD-5 and FD-6 answered |
| **4: Verification** | Responsive pass (375×667, 390×844, 430×932, 844×390, 768, 1280); WebKit Playwright if installable; VoiceOver iPhone pass (C-01, C-02, C-05); keyboard-only pass; reduced motion; 200% zoom | Founder sign-off; then flag on |

Do not implement any phase as part of the Opus sprint. This document is the brief for the next Composer sprint.

## 5. Where the visuals live

- **Boards:** `boards/board-*.png`, sources in `boards/src/`.
- **Reproduce:** `node docs/site00/idnty/form-control-visual-authority-opus1/boards/render-boards.mjs`.
- **Proposal values:** `boards/src/proposal.css`. Every class there is prefixed `ix-` and maps to a family row above.
