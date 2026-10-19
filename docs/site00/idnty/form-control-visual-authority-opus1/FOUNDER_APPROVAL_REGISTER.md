# Founder approval register

**Status:** FD-1 to FD-6 are **APPROVED** by the founder. Every other item stays open in [`UNRESOLVED_ITEMS_REGISTER.md`](UNRESOLVED_ITEMS_REGISTER.md). Approval is never assumed from silence, and nothing below extends a decision beyond what the founder said.

**Decision source:** the founder's sprint brief `P0.SITE00.IDNTY.FORM-CONTROL-FOUNDER-AUTHORITY-FINALIZATION.OPUS2`, delivered in this Claude Code session. It records the founder's review of Boards 01, 03, 04 and 07 and the founder's resolution of the phone-number question. Its own words: "These decisions supersede conflicting recommendations from OPUS1."

**Decision date:** recorded **2026-10-19**, the date the decisions were received. The founder's own review date is not stated in the brief.

**Precedence when decisions overlap:** the more specific decision wins. Board 07's general approval applies "subject to the higher-priority specific decisions" FD-1, FD-3 and FD-5 (founder's wording). Where one Board 03 proposal conflicts with System B, System B wins.

## Decisions

### FD-1 · Selector system: APPROVED

| Field | Record |
| --- | --- |
| Decision | **Option B: the editorial mobile selection sheet.** Desktop keeps Territory A, the anchored listbox, as its coordinated companion. Territory C is used only where a specific short list justifies it and is not the Business Type default. |
| Founder words | "BOARD 01 — OPTION B. EDITORIAL MOBILE SELECTION SHEET." · "Retain the anchored listbox approach from Territory A where appropriate." · "One reusable selection-control family." |
| Supersedes | Nothing contradicts it. OPUS1 recommended the same split (B on phones, A elsewhere). A on phones, B on desktop and C for Business Type are now **NOT APPROVED**. |
| Affected families | Selector (FC-004 Business Type, FC-043 DfSelect); sheets (shared with FD-6) |
| Required implementation | One `IdntySelect`: B (`IdntySelectionSheet`) when `(pointer: coarse) and (max-width: 600px)`, A (restyled `DfSelect`) otherwise. Same props, options and value contract; exact `BUSINESS_TYPES` strings; legacy value listed and preserved; Clear writes `''`. Resolve collision C-1 first. Ship behind `VITE_DF_CUSTOM_INDUSTRY_SELECT` (default off) until the founder checks staging. |
| Regression coverage | Every `BUSINESS_TYPES` value round-trips through `intakeFromDraft`. Legacy value preserved. Escape, scrim and Tab never change the value. Focus moves into the sheet on open and back to the trigger on close. The scroll-lock count returns to 0. The A keyboard model (`tests/digitalFoundationComponents.test.ts`) stays green. |
| Remaining dependencies | U-1 (`BUSINESS_TYPES` ratification; values not renamed). U-2 (sheet meta copy `OPTIONAL · CHOOSE ONE`, `CLEAR SELECTION`). U-6 (device check). |
| Boards | 01A, 01B, 06, 07 |

### FD-2 · Contact number: APPROVED

| Field | Record |
| --- | --- |
| Decision | **The phone number becomes required, as a backup contact.** Canonical field CONTACT NUMBER. |
| Approved copy | Label `CONTACT NUMBER *` · placeholder `ENTER PHONE NUMBER` · helper `USED AS A BACKUP CONTACT FOR URGENT ACCOUNT, DOMAIN, OR EMAIL ISSUES.` (uppercase rule, the two IDNTY fonts) |
| Purpose | Urgent service issues while the client's primary email may be unavailable: registrar access, mailbox and DNS (MX/SPF/DKIM/DMARC) changes, migration, recovery, security verification, provider coordination. It is the client's or their authorized representative's own number, **not** a third-party emergency contact. |
| Communication boundary | Email and the portal remain the routine channels. The number is **not** marketing consent, SMS enrolment or consent to automated calls or texts. `CommunicationPrefs` stays separate and unchanged. |
| Supersedes | OPUS1 Board 02 showed the phone `OPTIONAL` with the hint `US NUMBERS FORMAT AS YOU TYPE`. Both are removed. |
| Affected families | Field shell (FC-007), P02 validation, save status, founder-side projection, synthetic test path |
| Required implementation | See [`CONTACT_NUMBER_REQUIREMENT.md`](CONTACT_NUMBER_REQUIREMENT.md): field copy and `aria-required`; `validateBusinessInfo` rule (10 digits); a server check at the intake submission boundary (`update-intake` with `markComplete`); autosave never blocked; existing drafts load; completed intakes never invalidated; synthetic fixture number; founder-side "missing" flag. Data key stays `phone`. No schema change. |
| Regression coverage | Validation unit tests (empty, incomplete, 10 digits). Partial autosave accepted without a phone. Completion rejected without one (and accepted with one). Save, reload and restore of the formatted value. Synthetic journey still completes. `foundationClientPhoneFormat.test.ts` unchanged and green. No marketing preference changes. |
| Remaining dependencies | U-2 (error messages `ENTER A CONTACT NUMBER`, `CHECK THIS CONTACT NUMBER`). U-7 (required-marker convention for other required fields). U-10 (non-US numbers cannot be entered with the current formatter). The server check is a backend change and lands in its own Phase 4 PR. |
| Boards | 02, 04, 05, 06, 07 |

### FD-3 · Choice control system: APPROVED

| Field | Record |
| --- | --- |
| Decision | **System B: the red period inside an ink-edged box**, plus the Board 03 proposals that complement it. |
| Founder words | "BOARD 03 — SYSTEM B." · "The founder also likes the additional proposals shown on Board 03." · "If any proposal directly conflicts with System B, System B takes precedence." |
| Supersedes | OPUS1 recommended System A (red-filled check). **System A is NOT APPROVED.** The P03 service rows' red-filled chosen check (implemented, from the founder screenshot) changes to System B, because FD-3 names service selections. The row layout, red active frame and ink "included" check stay. |
| Retained Board 03 proposals | Solid 2 px red focus ring (offset 2); red-edged invalid state; indeterminate dash; the `N OF 3` legend count on P05; ink marks after acceptance; portal preferences as rows with a non-interactive ink required item and a visually hidden native input; one control per add-on row (removes the duplicate `aria-hidden` button); red row frame when an add-on is on; record-filter tabs (ink + 2 px red underline, roving focus); domain-radio invalid edge and keyboard fix. |
| Not approved by FD-3 | The **trigger** for the P05 invalid edge and line (U-8). The line's copy `CONFIRM EACH ITEM TO CONTINUE` (U-2). The pill switch (U-3). Radios do **not** take the box: a one-of-many choice keeps its circle and red dot. |
| Affected families | Service rows (FC-010, 016–020), add-ons (FC-023–025), P05 disclosures (FC-027), portal preferences (FC-036), DfCheckbox (FC-044), completion done marks (FC-038), tabs (FC-035), domain radios (FC-011, a11y only) |
| Required implementation | `.df-check` chosen state becomes: white fill, 1 px `--df-ink` edge, 8 px `--df-red` square centred. Locked, accepted and done keep the ink fill and white check. Unchecked edge #8f8d88 (NF-06); hover uses an ink-2 edge; disabled · checked uses a grey edge and period; invalid uses a red edge on `#fffafa`; focus is a solid 2 px red ring. The values contract is unchanged: `needs[]`, `addon_id`, quantity, `DF_DISCLOSURES` gate, `CommunicationPrefs` keys. |
| Regression coverage | Markup snapshot per state (`digitalFoundationComponents.test.ts`). P03 toggle tests. Quote sync (`digitalFoundationClientBoard0102.test.ts`). Accept disabled until all three are checked. Preferences save and reload. One tab stop per add-on row. Contrast: ink edge 19.56:1, red period 5.66:1, unchecked edge #8f8d88 3.32:1 on white (NF-06 repair; today #b8b6b1 = 2.03:1). |
| Remaining dependencies | U-2, U-3, U-8 |
| Boards | 03, 07 (also 04 and 05 where marks appear) |

### FD-4 · Completion surface: APPROVED

| Field | Record |
| --- | --- |
| Decision | **Align the completion controls now; keep the existing page composition.** A full completion rebuild is deferred to a separate founder-approved sprint. |
| Supersedes | OPUS1 tied a later rebuild to the Board 04 index strip. Board 04's proposals are rejected (FD-5), so no rebuild is implied by this package. |
| Affected families | Completion surface (FC-038) |
| Required implementation | In `DigitalFoundationCompleteSurface.tsx`, the ownership list uses ink "done" marks (System B included state). `CONFIGURE MY DIGITAL LOCATION` becomes `DfButton` primary and `SAVE THIS FOR LATER` becomes `DfButton` outline. Headings, copy, order, spacing and `captureBuildInterest` are unchanged. |
| Regression coverage | Build-interest capture test. A visual capture of the completion page shows an unchanged composition. |
| Remaining dependencies | U-9 (the surface's mixed-case copy predates the uppercase rule; left for the rebuild sprint). |
| Boards | 07 §07 |

### FD-5 · Progression: APPROVED

| Field | Record |
| --- | --- |
| Decision | **Preserve the current implemented progression. Reject the proposed index strip.** The implemented examples on Board 04 are preferred and the new Board 04 proposals are rejected. |
| Preserved | The page rail (`DfRail`); the founder-approved menu drawer (`buildDfMenu`, PR #1572) and its relationship to the page; numbering; completed-step representation; the `DfProgress` component as implemented (library; not mounted in a client flow today); CTAs with their busy and disabled behaviour; P02/P03 validate-on-press with focus on the first invalid field; the P05 disabled accept gate; resume via `draftFromPayload` with no banner. |
| Rejected (NOT APPROVED) | Index strip · `← BACK TO …` text link · blocked summary `N ITEMS NEED ATTENTION` (also removed from the Board 05 severity ladder) · P05 counter line under the CTA · resume banner `WELCOME BACK…` |
| Allowed | Verified accessibility repairs, documented responsive bugs, functional fixes, and minor state alignment with approved shared components (System B marks, Board 07 field states). |
| Affected families | Progression (FC-051), CTAs (FC-001, 008, 021, 026, 029), P05 gate |
| Required implementation | No progression change. Field and mark states inside the steps follow FD-3 and Board 07. |
| Regression coverage | `tests/digitalFoundationMenuDrawer.test.ts`, `DfProgress` markup tests and the P05 gate test stay green without modification. |
| Remaining dependencies | None |
| Boards | 04 |

### FD-6 · Sheet geometry: APPROVED

| Field | Record |
| --- | --- |
| Decision | **Board 07's proposed squared sheet geometry with the 2 px red threshold edge**, consistent with FD-1 Option B. No generic rounded floating sheets. |
| Supersedes | The #1573 rounded skin (16 px top radius, soft shadow, handle styling) on `DfBottomSheet`. The skin is replaced; the non-modal peek, snaps and focus behaviour are kept. |
| Affected families | Selection sheet (FD-1), information sheets (FC-022, FC-030), `DfModal` skin (FC-045) |
| Required implementation | Square corners (`--df-radius-sheet: 0`), 2 px `--df-red` top edge, index rail head, display title where the sheet has one, 44 px close, no shadow, scrim `rgba(12,12,12,.46)` without blur, `env(safe-area-inset-bottom)` foot padding. |
| Regression coverage | Bottom-sheet component tests (focus trap, Escape, peek); visual capture of P02 MORE INFORMATION and P05 scope sheets. |
| Remaining dependencies | U-6 (device check) |
| Boards | 07 §06, 01A, 06 |

## Board 07 general approval (applies under the specific decisions)

Founder words: "THE PROPOSED TREATMENTS ARE PREFERRED." Approved treatments:
- the active frame (2 px red)
- the red period on a field label while it is active or in error
- the red-period error mark
- 16 px entered values on coarse pointers (NF-01)
- the sheet title and option-row type roles
- the `OPTIONAL` micro tag
- the read-only lock treatment
- the state-grammar table
- the component relationships (IdntySelect, IdntySelectionSheet, IdntyStepper, IdntyChoiceRow)
- the overlay language (FD-6)
- the completion control alignment (FD-4)

The approval covers visual treatments, "not unrelated business logic" (founder's wording). Proposed **copy** shown inside these treatments stays in U-2 unless the founder named it, as with the FD-2 copy.

## Not approved (kept on the boards as greyed history)

| Treatment | Board | Reason |
| --- | --- | --- |
| Territory A as the mobile selector | 01A | FD-1 |
| Territory B on desktop | 01B | FD-1 |
| Territory C for Business Type | 01A, 01B | FD-1 |
| System A red-filled check | 03 | FD-3 |
| Index strip, back text link, blocked summary, P05 counter line, resume banner | 04 (and 05 ladder) | FD-5 |
| Rounded #1573 sheet skin | 07 §06 | FD-6 |
| `OPTIONAL` tag and `US NUMBERS FORMAT AS YOU TYPE` hint on the phone | 02 | FD-2 |
