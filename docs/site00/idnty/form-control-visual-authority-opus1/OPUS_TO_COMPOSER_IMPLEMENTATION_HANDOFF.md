# Opus → Composer implementation handoff (finalized)

**Authority:** FD-1 to FD-6 are founder-approved (`FOUNDER_APPROVAL_REGISTER.md`). This handoff replaces the OPUS1 version: where they differ, this one wins. Open items are in `UNRESOLVED_ITEMS_REGISTER.md`; none of them blocks the phases below, except where a phase says so.

**Not implemented in the authority sprint.** Each phase below is its own Composer PR (or PRs), reviewed and verified before the next one starts. Do not build the whole set in one unverified sprint.

## 0. Ground rules for every phase

1. **One component layer.** Extend `src/site00/foundation-client/components.tsx` and `src/site00/styles/site00-df-components.css`. Do not create a second UI system (PR #1573 convention, `motherboard/MEMORY.md`).
2. **Proposal CSS is a reference, not an import.** `boards/src/proposal.css` shows every value under `ix-` names. Port the rules into `site00-df-components.css` under the existing `df-` names. Never import from `docs/`.
3. **Exact data contracts.** `industry` writes a `BUSINESS_TYPES` string, `''` or the untouched legacy value (U-1: never rename values). `phone` stays the dashed display string. Needs, add-on IDs, quantities, disclosures and `CommunicationPrefs` keys are unchanged.
4. **Autosave stays exactly as it is.** Do not change `AUTOSAVE_MS` (900), `saveIntake`, `retry()`, `useIntakeDraft` or `draftFromPayload`.
5. **Persistence workstream protection (§9).** Never touch artifact creation, public tokens, Supabase persistence, intake save/resume, API response contracts (except the one FD-2 completion check, Phase 4b), session handling, grants or lifecycle transitions.
6. **Rejected treatments are never implemented:**
   - System A red-filled check
   - Territory A on phones, B on desktop, C for Business Type
   - index strip, back text link, blocked summary, P05 counter line, resume banner
   - rounded sheet skin
   - the phone `OPTIONAL` tag
7. **Copy discipline (U-2).** Ship founder-approved copy (the FD-2 field copy) and existing copy only. The proposed lines listed in U-2 need founder confirmation, or founder wording, before release. Build them behind constants so wording can change without code churn.
8. **Rollback unit:** one revertable commit per family; a feature flag where marked.

## 1. Collisions and defects to resolve first (Phase 1)

| ID | Problem | Fix |
| --- | --- | --- |
| **C-1** | `site00-df-client.css` `.df-select__chev { position: absolute; …; transform: translateY(-50%) rotate(90deg) }` also hits DfSelect's down chevron (measured `matrix(0,1,-1,0,0,-8)`). | Scope to the native control (`.df-select > select ~ .df-select__chev`), or delete it when FC-004 moves to IdntySelect |
| **NF-01** | `site00-df-components.css` `.df-input { font-size: 14px }` overrides the client sheet's 16 px anti-zoom rule | `@media (pointer: coarse) { .df-input, .df-select__trigger { font-size: 16px } }`; placeholders keep 10 px tracked caps |
| **NF-02** | `.df-chip` has no CSS | Tab styles (specs §1.11) |
| **NF-06** | Unchecked `.df-check` edge 1 px `#b8b6b1` = 2.03:1 (fails 1.4.11) | Rest edge `#8f8d88` (3.32:1); hover `--df-ink-2` |
| Focus ring | `.df-choice:focus-within .df-check { outline: 2px solid rgba(229,1,7,.35) }` ≈ 1.9:1 | `outline: 2px solid var(--df-red)`, offset 2 |
| Selected option | `.df-select__option--selected { background: #ebeae6 }` | Red period (`::before` 6 px square) + 700 weight; keep `--active` `#f4f3f0` |

## 2. Phases

### Phase 1: Foundation

| Item | Detail |
| --- | --- |
| Scope | Shared tokens and grammar, existing input-shell preservation, state consistency, safe component architecture, accessibility corrections. **No behavioural contract changes, no markup changes in parents.** |
| Files | `src/site00/styles/site00-df-components.css`; `src/site00/styles/site00-df-client.css` (C-1 scope only); `src/site00/foundation-client/components.tsx` (`DfField`: `optional`, `required`, `hint`, `readOnlyTag` props; defaults render today's markup) |
| Components | `DfField`, `df-input`, `df-select__trigger`, `df-check`, `df-choice`, `.df-chip` |
| Source contracts | None changed. `DfField` new props are additive and default off. |
| Visual acceptance | Board 07 §02–§04: active frame (1 px + 1 px inset red), red period on the label while active or in error, error mark, read-only lock, `OPTIONAL` micro tag style, 16 px coarse values, System B mark CSS available (classes only; not yet applied in parents), focus ring solid red. Captures at 375, 390, 430 and 1280 match the boards. |
| Functional acceptance | No change in any flow. Every DF test is green without modification. |
| Automated tests | `tests/digitalFoundationComponents.test.ts` (extend for the new `DfField` props, default markup unchanged); `npm run typecheck`; `npm test`; `npm run build`; computed-style assertions in a Playwright script (NF-01 16 px coarse, C-1 no rotation, NF-06 edge `#8f8d88`, focus ring red) |
| Manual device checks | iPhone Safari: tapping BUSINESS NAME no longer zooms the page (NF-01). |
| Rollback | Revert the CSS commit; `DfField` props are inert by default. |
| Deployment dependencies | None. Safe to ship to staging alone. |

### Phase 2: Selection controls (FD-1)

| Item | Detail |
| --- | --- |
| Scope | Mobile editorial sheet; desktop anchored listbox; FC-004 Business Type integration; exact enum preservation; focus management; touch and keyboard behaviour; persistence regression tests |
| Files | `components.tsx` (new `IdntySelectionSheet`, new `IdntySelect`; restyle `DfSelect`); `site00-df-components.css` (sheet and listbox styles; FD-6 geometry); `src/site00/foundation-client/parents/EntryIntake.tsx` 188–208 (swap the native select behind the flag); flag read in the same module |
| Components | `IdntySelect` (one API: `id`, `value`, `options`, `placeholder`, `onChange`, `disabled`, `invalid`, `describedBy`, `labelledBy`); `IdntySelectionSheet` on `useDfDialogFocus` + `useDfScrollLock` + `df-portal`; `DfSelect` as Territory A |
| Presentation rule | B when `matchMedia('(pointer: coarse) and (max-width: 600px)')`, A otherwise; re-evaluated on change, never while open |
| Source contracts | `update({ industry })` with an exact `BUSINESS_TYPES` string, `''` (Clear) or the untouched legacy value; legacy value listed first with `ON FILE · NOT IN THE LIST`; `editable=false` disables; `intakeFromDraft` output unchanged |
| Visual acceptance | Boards 01A (B frames), 01B (A frames), 06 (keyboard hand-off, toolbar, landscape, 320 px). Sheet: square, 2 px red edge, index rail, display title, 48 px rows, red index + red period + red inset edge on the selected row, 44 px close, no shadow, scrim without blur. Listbox: hangs from the trigger inside the active frame, 40 px rows, all 10 visible with a fine pointer (cap 402 px), 6½ rows on touch (cap 300). |
| Functional acceptance | Opening blurs any focused text field first; commit on click, never pointerdown; Escape, scrim and Close never change the value; focus returns to the trigger; page scroll restored; scroll-lock count back to 0; one overlay at a time; Clear writes `''`. |
| Automated tests | Every `BUSINESS_TYPES` value round-trips through `intakeFromDraft`; legacy value preserved; Clear → `''`; Escape, scrim and Tab paths leave the value; focus in on open and back on close; scroll lock returns to 0; DfSelect keyboard model (existing tests) green; Playwright opens, picks and asserts the closed label at 390 and 1280 (WebKit if installable). **Persistence regression:** select OTHER → autosave → reload → OTHER restored (mock API). |
| Manual device checks | iPhone Safari on staging with the flag on: sheet rises on the toolbar, never under it; keyboard drops first; landscape 844 × 390; VoiceOver reads "BUSINESS TYPE, pop-up button" then "<label>, selected, n of 10". |
| Rollback | `VITE_DF_CUSTOM_INDUSTRY_SELECT` off falls back to the native select; one-commit revert. |
| Deployment dependencies | Phase 1 (C-1 must be scoped first). The flag stays **off in production** until the founder verifies staging. Sheet meta and Clear copy are U-2 (confirm before production). |

### Phase 3: Choice controls (FD-3)

| Item | Detail |
| --- | --- |
| Scope | System B on service selections, add-ons, P05 consent, portal preferences; visual-state consistency; existing value contracts preserved. Retained Board 03 proposals: one control per add-on row, portal rows with an ink required item, P05 legend count, domain-radio error and keyboard fix, record-filter tabs. |
| Files | `site00-df-components.css` (`.df-check` checked state = white fill, 1 px ink edge, 8 px red `::after`; hover, disabled, invalid, indeterminate); `EntryIntake.tsx` `ServiceRow` (mark class only), domain path inputs (remove `pointer-events: none`); `parents/Recommendation.tsx` 60–110 (single `role=checkbox` control; mark becomes `aria-hidden` span); `parents/CheckoutActivation.tsx` 347–360 (legend count text); `parents/ProjectPortal.tsx` 414–428 (preferences to `DfCheckbox` rows), 324–329 (tabs, roving focus); extract `IdntyStepper` from `EntryIntake.tsx` 316–340 / 512–518 and `Recommendation.tsx` 90–97 |
| Components | `DfCheckbox`, `IdntyChoiceRow` (shared row shell), `IdntyStepper`, tabs |
| Source contracts | `needs[]` / `toggleNeed`; `addon_id`, quantity bounds (1–50), `useQuoteSelections`; `DF_DISCLOSURES` text and the accept gate (CTA disabled until all three); `CommunicationPrefs` keys and payload; `team_size` bounds |
| Visual acceptance | Board 03 §01–§04 and Board 07 §04. Checked = period in an ink-edged box; included / accepted / done = ink fill + white check; radios keep the circle and red dot; add-on row frame red when on. |
| Functional acceptance | One tab stop per add-on row; Space toggles; disclosures announce "n of 3"; preferences save and reload unchanged; P05 accept still disabled until all three are checked. The **P05 invalid trigger is not implemented** (U-8). |
| Automated tests | Markup snapshot per mark state; P03 toggle tests; quote sync (`digitalFoundationClientBoard0102.test.ts`); accept-gate test; preferences save and reload; a11y: one focusable per row, `aria-checked` reflects state; domain radios reachable with arrow keys; stepper bounds at both call sites |
| Manual device checks | VoiceOver on P03, P04, P05 and portal preferences: each row reads its label and state once. |
| Rollback | One commit per surface (services, add-ons, P05, portal, tabs, stepper); each reverts independently. Portal preferences may go first (lowest risk, audit plan). |
| Deployment dependencies | Phase 1 |

### Phase 4: Contact number requirement (FD-2)

Specification: [`CONTACT_NUMBER_REQUIREMENT.md`](CONTACT_NUMBER_REQUIREMENT.md).

| Item | Detail |
| --- | --- |
| Scope | Required CONTACT NUMBER field; approved label, placeholder and helper; form validation; submission validation; existing-draft compatibility; founder-side projection; save/resume verification; no marketing-consent assumptions |
| **4a · client** files | `src/site00/foundation-client/model.ts` (`IntakeField` + `phone`; `validateBusinessInfo` empty / 10-digit rule); `parents/EntryIntake.tsx` 223–236 (label `CONTACT NUMBER`, required asterisk, placeholder, helper, `aria-required`, `aria-invalid`, error wiring through `Field`, `enterKeyHint="done"`); client mapping of `INTAKE_CONTACT_NUMBER_REQUIRED` to the P02 field error (`useFoundationArtifact.ts` `complete()` already returns the `DfApiError` code) |
| **4b · server** files | `api/site00/digital-foundation-artifact.ts` `update-intake` (or `api/_lib/digitalFoundation/service.ts` `updateIntake`): when `markComplete` is true and the merged intake's phone has fewer than 10 digits, return 400 `INTAKE_CONTACT_NUMBER_REQUIRED` before `completeIntake()`. `api/_lib/digitalFoundation/founderReadiness.ts` `advanceSyntheticIntakeSubmitted`: supply a fictional `202-555-0143` when none is stored. Fixture scenarios that complete an intake: same. |
| **4c · founder side** files | `src/site00/admin/pages/foundation/FoundationAdminDetailPage.tsx:79`: show `NOT PROVIDED · FOLLOW UP` instead of `—` for completed intakes without a phone. The founder workspace record (separate package) uses the same flag. |
| Source contracts | Key `phone` unchanged; dashed format unchanged; `formatUsPhoneDisplay` unchanged; autosave (`markComplete: false`) **never** rejected; no `CommunicationPrefs` change; no schema change |
| Visual acceptance | Board 02 §05 (all states), Board 05 §05, Board 04 §03 |
| Functional acceptance | Empty or incomplete number blocks CONTINUE, with focus on the field; partial drafts keep autosaving; completed intakes without a number still load as COMPLETE with their link intact; the synthetic journey completes; restored numbers reappear formatted with no re-save on load |
| Automated tests | All rows in `CONTACT_NUMBER_REQUIREMENT.md` §8. Existing `foundationClientPhoneFormat`, `digitalFoundationClientBoard0102`, `digitalFoundationCriticalRepair`, `digitalFoundationArtifactHandler` and `founderReadinessE2e` stay green. |
| Manual device checks | iPhone Safari: tel keypad, DONE, error above the keyboard; VoiceOver reads the required state and helper |
| Rollback | 4a, 4b and 4c are separate commits. Reverting 4b alone keeps the client gate; reverting 4a restores the optional field. Neither touches stored data. |
| Deployment dependencies | Phase 1. **4b is a backend contract change:** it needs its own review and must ship with or after 4a, never before (otherwise an out-of-date client would hit the 400 without a message). Error copy is U-2: confirm wording before production. |

### Phase 5: Feedback + completion (FD-4, Board 07)

| Item | Detail |
| --- | --- |
| Scope | Approved feedback states; SaveStatus integration (marks only); completion control alignment; completion layout preserved |
| Files | `parents/EntryIntake.tsx` `SaveChip` (marks: ink square saved, red failed, spinner in flight; **labels unchanged** until U-2 is decided); `src/site00/pages/foundation/DigitalFoundationCompleteSurface.tsx` 72–79 (`DfButton` primary and outline; ownership list with the ink done mark); `site00-digital-foundation.css` only if needed to host `DfButton` without layout change |
| Components | `SaveChip` → `IdntySaveStatus` (same props: `status`, `savedAt`, `onRetry`); `DfButton`; done mark |
| Source contracts | `SaveStatus` values, `AUTOSAVE_MS`, `retry()`, `captureBuildInterest`, completion copy and order |
| Visual acceptance | Board 05 §01 (marks), Board 07 §07 (completion: same composition, aligned controls) |
| Functional acceptance | `SAVED` only after `saveIntake()` resolves; `role="status"` stays quiet while dirty; build-interest capture unchanged |
| Not in scope | New status words (`UNSAVED CHANGES`, `RESTORED`, `OFFLINE — NOT SAVED`), page banners, toast copy (U-2); the rejected blocked summary (FD-5); any completion rebuild (FD-4); completion copy case (U-9) |
| Automated tests | Status mapping per `SaveStatus`; build-interest capture test; completion visual capture diff limited to the controls |
| Manual device checks | Save, reload and resume on iPhone Safari: no `SAVED` before the server responds |
| Rollback | One commit per surface |
| Deployment dependencies | Phase 1; Phase 3 for the done mark |

### Phase 6: Responsive and accessibility verification

| Item | Detail |
| --- | --- |
| Scope | iPhone Safari, keyboard interaction, VoiceOver, safe area, zoom, landscape, reduced motion, touch-target verification |
| Matrix | 320 × 568, 375 × 667, 390 × 844, 430 × 932, 844 × 390, 768 × 1024, 1024 × 768, 1280 × 800, 1920 × 1080; 200 % zoom; iOS large text |
| Checks | Board 06 §04 requirement table (safe area, keyboard, scroll, dismissal, orientation, zoom, reduced motion, geometry); `ACCESSIBILITY_CONTRACTS.md` C-01 to C-10; targets ≥ 44 px; no horizontal overflow; contrast ≥ 4.5:1 for text and ≥ 3:1 for marks and edges (NF-06) |
| Automated tests | Playwright viewport matrix with `@axe-core/playwright` (no serious or critical issues); WebKit project if installable |
| Manual device checks | **Real iPhone Safari + VoiceOver (closes U-6)**, with device and iOS version recorded; Mac keyboard-only pass |
| Rollback | n/a (verification). Defects found loop back to the owning phase. |
| Deployment dependencies | Phases 1–5 on staging |

### Phase 7: Regression and founder acceptance

| Item | Detail |
| --- | --- |
| Scope | Compare implemented components with the approved boards; verify unchanged intake data contracts, persistence, navigation, validation and client lifecycle integrity |
| Checks | Side-by-side captures against Boards 01A, 01B, 02, 03, 04, 05, 06, 07 at board viewports; `intakeFromDraft` snapshots byte-identical except the populated `phone`; save → close → reopen keeps every answer (#1657 durability); the permanent link resolves after an API restart; the drawer and rail unchanged (FD-5); P05 accept and Stripe checkout unchanged |
| Founder acceptance | Founder reviews on Railway staging per family and records acceptance in `FOUNDER_APPROVAL_REGISTER.md`; production flags flip only after that |
| Rollback | Flags off; per-family reverts |
| Deployment dependencies | Phase 6 sign-off |

## 3. Data-contract checklist (every PR)

- [ ] `intakeFromDraft(draft)` output is byte-identical for the same draft (snapshot); in Phase 4, only validation changes.
- [ ] `industry` ∈ `BUSINESS_TYPES ∪ {''} ∪ {legacy value as loaded}`; no enum renamed.
- [ ] `needsFromDraft` and `domainPathFromNeeds` untouched.
- [ ] `AUTOSAVE_MS`, `saveIntake`, `retry`, `draftFromPayload` untouched.
- [ ] Quote selections and the accept payload unchanged (`digitalFoundationClientBoard0102.test.ts`).
- [ ] No Supabase migration, policy, grant, token or lifecycle change. The only API change in this whole handoff is Phase 4b.
- [ ] No `CommunicationPrefs` key set or changed by the contact number.

## 4. Family map (finalized)

| Family | Source today | Audit IDs | Approved treatment | Phase |
| --- | --- | --- | --- | --- |
| Tokens and grammar | `site00-df-components.css` | — | Active frame, red period, `--ix-*` values, NF-01/02/06, C-1, focus ring | 1 |
| Field shell + text | `EntryIntake.tsx` `Field` / `DfField` | FC-003, 005, 006, 012, 013, 019 | Board 07 states; keyboard attributes | 1 (CSS) · 3/4 (markup where touched) |
| Contact number | `EntryIntake.tsx` 223–236 | FC-007 | FD-2 required backup contact | 4 |
| Selector | `EntryIntake.tsx` 188–208; `DfSelect` | FC-004, FC-043 | FD-1 IdntySelect (B mobile / A desktop) | 2 |
| Radio group | `EntryIntake.tsx` 429–448 | FC-011 | Keep visuals; group error; keyboard fix | 3 |
| Service rows | `ServiceRow` | FC-010, 016–020 | Row locked; System B chosen mark | 3 |
| Disclosures | `CheckoutActivation.tsx` 347–360 | FC-027 | System B; legend count; gate unchanged; trigger U-8 | 3 |
| Portal preferences | `ProjectPortal.tsx` 414–428 | FC-036 | System B rows; ink required item | 3 |
| Add-ons | `Recommendation.tsx` 60–110 | FC-023–025 | One control; System B; frame | 3 |
| Stepper | `EntryIntake.tsx`, `Recommendation.tsx` | FC-015, 025 | `IdntyStepper` extraction | 3 |
| Tabs | `ProjectPortal.tsx` 324–329 | FC-035 | NF-02 tabs; roving focus | 3 |
| Sheets / modal | `DfBottomSheet`, `DfModal` | FC-022, 030, 045 | FD-6 skin; behaviour kept | 2 (selection sheet) · 3 (information sheets) |
| Status line | `SaveChip` | FC-009 | Marks only; labels U-2 | 5 |
| Progression | `shell.tsx` drawer, `DfRail`, `DfProgress`, CTAs | FC-001, 008, 021, 026, 029, 051 | **No change** (FD-5) | — |
| Completion | `DigitalFoundationCompleteSurface.tsx` | FC-038 | FD-4 controls aligned; composition kept | 5 |
| Admin inputs | `FoundationReadinessPage.tsx` | FC-039–042 | Deferred (U-5) | — |
| Stripe | Hosted | FC-047 | No change | — |

## 5. Persistence workstream protection

`P0.SITE00.IDNTY.PERSISTENT-ARTIFACT-AND-INTAKE-RECOVERY1` (PR #1657, `a99d914d`) repaired:
- silent Supabase write failures
- referral-source foreign keys
- memory-only artifact creation
- dashboard persistence
- token continuity
- save/resume error reporting

**Rules for every phase:**
- Branch from the **current** integration branch `cursor/idnty-founder-readiness-e2e-be3b`, not from the authority branch. The authority branch contains docs only (it merged #1657 to stay current; its diff against the integration branch is `docs/` only).
- Never reset or force-push the integration branch, and never merge old source state over it.
- Do not edit `api/_lib/digitalFoundation/persistence/**`, `createArtifactForLeadDurable`, `persistArtifactGraph`, token resolution or `loadArtifactGraphByToken`.
- Phase 4b adds one guard before `completeIntake()` and changes nothing after it.
- Re-run `tests/digitalFoundationCriticalRepair.test.ts` and `tests/digitalFoundationArtifactHandler.test.ts` in every PR.

## 6. Where the visuals live

- **Boards:** `boards/board-*.png`; sources in `boards/src/`.
- **Reproduce:** `node docs/site00/idnty/form-control-visual-authority-opus1/boards/render-boards.mjs`.
- **Finding measurements:** `node docs/site00/idnty/form-control-visual-authority-opus1/boards/verify-findings.mjs` → `evidence/finding-measurements.json` (NF-01, NF-02, C-1, NF-06).
- **Values:** `boards/src/proposal.css`. `ix-` classes map to the family rows above; System B is `.ix-check-period` plus the OPUS2 block at the end of the file.
