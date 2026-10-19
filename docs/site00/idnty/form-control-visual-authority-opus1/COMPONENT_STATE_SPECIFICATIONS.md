# Component state specifications

Each audited family is listed with its audit row (FC IDs), what stays, what the founder approved, and every state it needs.

**Family definitions are preserved from the audit.** `FORM_CONTROL_GAP_MATRIX.md` lists **18 family rows**, while `FORM_CONTROL_COVERAGE_REPORT.md` counts **16 unique families**. The difference is the two rows for native `<select>` and DfSelect, which describe one control family, and the two rows for disclosure and portal checkboxes. All 18 rows are covered below.

The sprint brief's conceptual families map onto them in section 2.

**Authority:** OPUS2 incorporates the founder decisions FD-1 to FD-6 (`FOUNDER_APPROVAL_REGISTER.md`). This document is the canonical state specification. Superseded OPUS1 proposals are removed from it, and listed as rejected where useful.

Status key:
- **A:** founder-approved (FD-n, or Board 07's approved treatments)
- **I:** implemented, kept
- **L:** locked (founder evidence)
- **R:** rejected by the founder; do not implement
- **U-n:** unresolved (`UNRESOLVED_ITEMS_REGISTER.md`)

## 1. Families (audit gap-matrix rows)

### 1.1 Field shell + single-line text (FC-003, 005, 006, 007, 012, 013, 019): Board 02

| State | Spec | Status |
| --- | --- | --- |
| Shell | Card `#f9f8f6`, 1 px `#dcdad5`, padding 10/14/12, label above the control | L/I |
| Label | Saira 10 px / 700 / .18em, uppercase | I |
| Optional | `OPTIONAL` tag, 7.5 px / 700 / .2em, `--df-faint`, right of the label. Applies to Business Type (and the registrar and provider fields, whose labels already say "IF YOU KNOW"). **Not** the contact number (FD-2). | A (Board 07) |
| Required | **CONTACT NUMBER:** ink asterisk after the label (`CONTACT NUMBER *`, FD-2 founder copy); asterisk `aria-hidden`, input `aria-required="true"`. Other required fields keep their implemented labels until U-7 is decided (recommendation: same asterisk on every required field). | A (FD-2) · U-7 |
| Empty | White control, 40 px, 1 px `#d9d7d2`, radius 3, placeholder 10 px / .16em caps `#a9a7a2` | I |
| Hover (fine pointer) | Border `#b8b6b1` | I |
| Focus | Active frame (1 px red plus 1 px inset red) **and** the red period before the label | A (Board 07; today: 1 px red border) |
| Filled | Value in its own case; 16 px on touch, 14 px with a fine pointer | A (Board 07, NF-01) |
| Invalid | 1 px red border; card border `rgba(206,16,23,.35)`; message 8.5 px / 700 / .16em red, led by a 5 px red period; message ids from `Field` (`df-<field>-error`) | A (Board 07) |
| Invalid + focused | Active frame plus message | A |
| Hint / helper | 8.5 px / 500 / .16em muted, under the control (`DfField` already has `df-field__hint`). Used for the FD-2 contact-number helper. | I markup, A usage |
| Read-only (intake COMPLETE or PAID) | `#f9f8f6` fill, `#dcdad5` border, ink-2 value, lock glyph inside the control, `SUBMITTED` state tag in the label row | A (Board 07) · tag copy U-2 |
| Disabled | `#efeeeb` fill, `#e4e2dd` border, `#b5b3ae` text | I |
| Validation success | No decoration. Formatting fields (contact number) show the formatted value; nothing turns green. | A |
| Masking | Phone keeps `formatUsPhoneDisplay` as you type. The stored format (dashed string) is unchanged (FC-007). | I |

### 1.1a CONTACT NUMBER (FC-007): FD-2, Boards 02 §05 and 05 §05

**Required backup contact.**
- Label `CONTACT NUMBER *`, placeholder `ENTER PHONE NUMBER`, helper `USED AS A BACKUP CONTACT FOR URGENT ACCOUNT, DOMAIN, OR EMAIL ISSUES.`
- States: empty, focused, formatting, valid (no green), missing on CONTINUE, incomplete, invalid + refocused, saving, saved, save failed, restored, read-only, disabled.
- Messages `ENTER A CONTACT NUMBER` and `CHECK THIS CONTACT NUMBER` are proposed copy (U-2).
- Data key `phone`, dashed string and `formatUsPhoneDisplay` are unchanged.

Validation boundaries, existing-data compatibility and the consent boundary are in [`CONTACT_NUMBER_REQUIREMENT.md`](CONTACT_NUMBER_REQUIREMENT.md).

### 1.2 Email / tel / URL / domain (FC-006, 007, 012): Board 02, section 04

Same shell as 1.1. The keyboard attribute table is on Board 02. Additions are attributes only:

- `enterkeyhint` on every field
- `inputmode="url"` and `autocomplete="off"` on the domain field
- `autocomplete="off"` on registrar and provider

No field names, values or validation rules change.

### 1.3 Textarea: portal notes (FC-033): Board 02

Same shell (A, Board 07). Minimum height 96 px, 11/14 padding, line-height 1.5, resizes vertically only. `YOUR NOTES` label plus the `OPTIONAL` tag (the current label reads `YOUR NOTES (OPTIONAL)`, so the tag replaces the parenthesis). Fixes drift B.

### 1.4 Selector: native select (FC-004) + DfSelect (FC-043)

**FD-1 APPROVED:** `IdntySelect`, the Territory B sheet on coarse pointers up to 600 px, Territory A listbox otherwise. See `SELECTOR_TERRITORIES.md` (Boards 01A, 01B, 06).

### 1.5 Radio group: domain path (FC-011): Board 03

| State | Spec | Status |
| --- | --- | --- |
| Rest | White row, 1 px `#dcdad5`, 14 px circle in `#8f8d88`, title 9.5 / 700, sub 8 px muted, tag right | L |
| Selected | Red row border plus a red dot | L |
| Focus | 2 px red outline, offset 1, on the label (`:focus-within`) | I |
| Keyboard | Arrow keys move within the group. **Fix:** remove `pointer-events: none` from the hidden input and keep it focusable (audit E). | A (Board 03 proposal retained under FD-3; a11y repair) |
| Invalid (no path chosen) | Each row edged red, plus `CHOOSE HOW WE HANDLE YOUR DOMAIN` (existing message) with the red period under the group | A (Board 03 proposal retained) |
| Disabled | Rows muted, dot grey | I |

The circle stays. A one-of-many choice must read as a radio button, so System B (the checkbox grammar) does not apply to it. It shares only the focus, invalid and colour rules.

### 1.6 Custom row checkbox: P03 services (FC-010, 016 to 020): Board 03

| Element | Spec | Status |
| --- | --- | --- |
| Row layout, icon, title, sub, tags | As implemented (P03Configure) | L |
| Open or active row | Red frame (1 px + 1 px inset) | L |
| Included core service | Ink fill + white check, not removable | L |
| **Chosen service** | **System B:** white box, 1 px ink edge, 8 px red period. Replaces the red-filled check because FD-3 names service selections. | **A (FD-3)** |
| Unchosen | White box, 1 px `#8f8d88` edge (NF-06 repair; today `#b8b6b1`, 2.03:1) | A (a11y repair) |
| Focus | Solid 2 px red ring on the row button | A |

`needs[]` and `toggleNeed` are unchanged.

### 1.6a The System B mark (shared by 1.6–1.9 and the completion list): FD-3

| State | Spec |
| --- | --- |
| Unchecked | 20 px, radius 2, white, 1 px `#8f8d88` |
| Hover (fine pointer) | Edge `--df-ink-2` |
| Focus-visible | Solid 2 px `--df-red` outline, offset 2 |
| Checked | White, 1 px `--df-ink` edge, 8 × 8 px `--df-red` square centred |
| Checked + focus | Checked plus the focus ring |
| Included · accepted · done | `--df-ink` fill, white check (the implemented locked state) |
| Disabled | `#efeeeb` fill, `#d3d1cc` edge |
| Disabled · checked | `#efeeeb` fill, `#d3d1cc` edge, `#b5b3ae` period |
| Invalid · required | Red edge, `#fffafa` fill |
| Indeterminate | Red fill, white 9 × 2 px dash (only if a "select all" is ever introduced) |

**Contrast:** ink edge 19.56:1; red period 5.66:1; unchecked edge 3.32:1 (all on white).

### 1.7 Checkbox: disclosures (FC-027): Board 03

| State | Spec | Status |
| --- | --- | --- |
| Mark | System B (§1.6a) | A (FD-3) |
| Count | `2 OF 3` at the right of the legend (in the legend text, so it is announced) | A (Board 03 proposal retained) |
| Accept gate | The CTA stays disabled until all three are checked | I (preserved, FD-5) |
| Invalid appearance | Unchecked rows edged red plus the System B invalid mark | A (appearance) |
| When invalid appears | Not decided: no attempt event exists while the CTA is disabled | U-8 |
| Guidance line | `CONFIRM EACH ITEM TO CONTINUE` | U-2 (copy) · U-8 (trigger) |
| Accepted (fieldset disabled) | Marks turn ink: a record, not a choice | I / A |
| Focus | Solid 2 px red ring, offset 2 (today rgba .35) | A |

### 1.8 Checkbox: portal preferences (FC-036): Board 03

**FD-3 APPROVED.** The native visible checkbox (B) is replaced by the shared row:

- a 48 px `.ix-pref` row with the System B mark and label
- the required category as a non-interactive item with the ink locked check
- the native input kept, visually hidden, covering the full row

The `CommunicationPrefs` payload is unchanged. The FD-2 contact number never sets any preference.

### 1.9 Add-on selector (FC-023, 024, 025): Board 03

- **One focusable control per row:** the row stays a `role="checkbox"` button, and the mark becomes a `<span aria-hidden>`. This removes the duplicate `tabIndex=-1` button (E).
- **Selected:** red frame plus the System B checked mark (FD-3).
- **Quantity add-ons:** the stepper replaces the mark (existing rule).
- **Locked / blocked:** as implemented, with the lock reason via `aria-describedby`.
- **Price:** right-aligned, plus an `EACH` sub-label for quantities.

`addon_id` mapping and quote sync are untouched.

### 1.10 Stepper (FC-015, 025): Board 03

- **Shape:** 36 px tall, radius 3, 1 px `#d9d7d2`; 38 px buttons with minus and plus glyphs.
- **Value:** 13 px / 700 tabular, between hairlines.
- **Disabled end:** glyph `#b5b3ae`.
- **Focus:** 2 px red ring inset on the button.
- **Accessibility:** keeps `role="group"`, the aria labels and `output aria-live`.

Bounds come from the existing logic (`team_size`; quantity 1 to 50). Extract it into a shared `IdntyStepper`.

### 1.11 Segmented chips: record filter (FC-035): Board 03

NF-02 applies: there is no CSS today.

**Approved (Board 03 proposal retained under FD-3):** rectilinear tabs, 9 px / 700 / .2em; muted by default; ink plus a 2 px red underline when current; a 1 px rule under the group.

The existing `role="tablist"` / `role="tab"` / `aria-selected` stay. Add arrow-key roving per the APG tabs pattern.

### 1.12 Bottom sheet / modal (FC-022, 030): Boards 06, 07

**FD-6 APPROVED:** one overlay language for every sheet, selection and information alike: square, 2 px red threshold edge, index rail, 44 px close, no shadow, scrim without blur, `env(safe-area-inset-bottom)` foot padding. The #1573 rounded skin (16 px top radius, soft shadow) is **R**. DfBottomSheet's non-modal peek, snaps and focus behaviour are kept.

### 1.13 Loading / save / error (FC-009, 031): Board 05

See §5 below and Board 05: the status line, severity ladder and promise rules.

### 1.14 Primary / secondary CTA (FC-001, 008, 021, 026, 029, 034, 037): Board 04

Implemented and approved: red 46 px, radius 3; outline secondary; text tertiary. Busy uses `aria-busy` and stays focusable with a busy label. Disabled is `#d3d1cc`.

The OPUS1 text back link (`← BACK TO …`) is **R** (FD-5). The drawer remains the way back.

### 1.15 Admin HTML inputs (FC-039, 040, 041)

Out of client scope (audit P3 "defer or admin pass"). **Recommended:** when the readiness desk is scheduled, apply the same field shell and mark under `.df-portal` scope. Not drawn.

### 1.16 Legacy completion CTAs (FC-038): Board 07, section 07

**FD-4 APPROVED.** Align the controls now: `DfButton` primary (`CONFIGURE MY DIGITAL LOCATION`) and outline (`SAVE THIS FOR LATER`), plus ink "done" marks (System B included state) for the ownership list. Headings, copy, order and spacing stay as they are. A full completion rebuild needs its own founder-approved sprint; the mixed-case copy is U-9.

### 1.17 Stripe Checkout (FC-047)

Hosted, off-origin, and not styleable beyond Stripe's own brand settings. **No control over the hosted UI is promised.**

In scope only:
- the SITE 00 side: the `PROCEED TO CHECKOUT` busy state (`OPENING SECURE CHECKOUT…`)
- the return panels (P06 polling, cancel)

Stripe URLs and query parameters are unchanged.

## 2. Sprint brief families mapped to audit rows

| Brief family | Audit row(s) | Present in IDNTY today? |
| --- | --- | --- |
| 01 Text | 1.1 | Yes |
| 02 Email | 1.1, 1.2 | Yes |
| 03 Phone | 1.1, 1.2 | Yes |
| 04 Domain / URL | 1.2 | Yes |
| 05 Textarea | 1.3 | Yes (portal) |
| 06 Select | 1.4 | Yes (FC-004) |
| 07 Searchable selector | — | **No instance.** Rule: if a list grows past about 15 options, Territory B gains a filter field (field shell 1.1, `role="combobox"` with `aria-autocomplete="list"`). Not drawn. |
| 08 Multi-select | 1.6 / 1.9 | Only as checkbox rows (services, add-ons). No multi-select dropdown; keep it that way. |
| 09 Checkbox | 1.6 to 1.9 | Yes |
| 10 Radio / choice cards | 1.5 | Yes |
| 11 Toggle | DfToggle (U06) | Library only. Proposal: keep it out of client flows (unresolved item U-3). |
| 12 Date / time | — | **No instance.** Rule: never a native date picker in the client artifact. Dates shown are read-only text (turnaround, expiry). |
| 13 File / document | — | **No instance.** Records are read-only. Rule: a future upload uses the field shell plus a CTA outline "CHOOSE FILE", never the native file chrome. |
| 14 Quantity / stepper | 1.10 | Yes |
| 15 Buttons / progression | 1.14 and §4 | Yes |
| 16 Feedback / validation / save | 1.13, §5 and Board 05 | Yes |

## 3. Audit findings covered

| Finding | Rows | Addressed in |
| --- | --- | --- |
| A: native visual break | FC-004, FC-036, FC-039, FC-047 | 1.4, 1.8, 1.15 (deferred), 1.17 (external, documented) |
| B: style drift | FC-033, FC-036, FC-038, FC-039 to FC-041, plus four drift hotspots (gap matrix) | 1.3, 1.8, 1.16, 1.15; hotspot 4 ("false consistency" of the closed select) is resolved by the territories |
| C: state gap | FC-009, FC-031, native select states, focus ring, invalid select | Board 05, 1.4, grammar focus frame, invalid trigger |
| D: responsive | Long add-on list with keyboard, DfSelect list max-height | Board 06, Territory A flip and Territory B inner scroll; NF-01 |
| E: accessibility | FC-011, FC-024, hidden-input focus | 1.5, 1.9, `ACCESSIBILITY_CONTRACTS.md` |
| F: data contract | FC-004 industry, FC-023 quote sync, FC-029 accept / Stripe, autosave | `OPUS_TO_COMPOSER_IMPLEMENTATION_HANDOFF.md` §3 |
| G: approval gap | FC-004, FC-043, FD-1 to FD-4 | `FOUNDER_APPROVAL_REGISTER.md` |

## 4. Progression (Board 04): FD-5 APPROVED, preserve the implemented progression

| Element | Spec | Status |
| --- | --- | --- |
| Page rail | Index (Display 17 px, red), 76 px rule, label 10.5 px / 700 / .25em | I · preserved |
| Menu drawer steps | Index, connector, label, glyph. Current is red; done and locked are muted; locked carries a lock glyph. Built from `buildDfMenu()`. | **L** (#1572) · preserved |
| In-page progress | `DfProgress` as implemented: numbered round nodes, red current, filled completed steps. Library component; no client page mounts it today, and FD-5 does not require mounting it. | I · preserved |
| Continue | Primary CTA, labels unchanged (`CONTINUE`, `VIEW MY RECOMMENDATION`, `CONTINUE TO REVIEW`, `PROCEED TO CHECKOUT`) | I · preserved |
| Busy | Existing busy labels (`STARTING…`, `BUILDING YOUR RECOMMENDATION…`, `UPDATING YOUR QUOTE…`, `OPENING SECURE CHECKOUT…`) | I · preserved |
| Blocked: validate on press (P02, P03) | CTA stays enabled; on press the existing validation runs, each message sits under its field and focus moves to the first invalid field. With FD-2, an empty or incomplete CONTACT NUMBER joins this gate. | I · preserved (+ FD-2 rule) |
| Blocked: gated (P05) | CTA disabled until every disclosure is confirmed (payment safety) | I · preserved |
| Return to an earlier section | Through the drawer (`open` and `done` states are enabled); values come from the saved draft | I · preserved |
| Resume from a saved draft | `draftFromPayload()` seeds the fields; the status line stays empty until the client edits | I · preserved |
| Allowed changes | Verified a11y repairs, documented responsive bugs, functional fixes, and alignment of field and mark states with approved shared components | A (FD-5) |

**Rejected (R), not to be implemented:**
- index strip
- `← BACK TO …` text link
- blocked summary `N ITEMS NEED ATTENTION`
- P05 counter line `CONFIRM N MORE ITEMS TO CONTINUE`
- resume banner `WELCOME BACK…`
- any restructure of intake navigation

## 5. Validation and system feedback (Board 05)

### 5.1 Status line (right side of the trust line)

| State | Label | Mark | Shown when | Status |
| --- | --- | --- | --- | --- |
| UNSAVED | `UNSAVED CHANGES` | Hollow muted square | `status = dirty`: edits are waiting for the 900 ms debounce and no request has been sent | Mark A · label U-2 (today `SAVING…`, NF-03) |
| SAVING | `SAVING…` | 11 px spinner | `status = saving`: `saveIntake()` is in flight | I label, A spinner |
| SAVED | `SAVED 7:08 AM` | Ink square | `status = saved`: **only** after `saveIntake()` resolves; the time is `savedAt` | I label, A mark |
| SAVE FAILED | `NOT SAVED — RETRY` | Red square | `status = error`; RETRY calls the existing `retry()` | I |
| RESTORED | `RESTORED` | Ink square | First render after `draftFromPayload()` seeded a non-empty server draft | U-2 · U-4 (implemented resume shows no label) |
| NETWORK UNAVAILABLE | `OFFLINE — NOT SAVED` | Hollow red square | `navigator.onLine === false`. Read-only signal; it never claims a device copy. | U-2 (new signal and copy) |

### 5.2 Severity ladder

| Level | Use for | Treatment |
| --- | --- | --- |
| 01 Field | One value is wrong or missing | Inline message under the field (1.1) |
| ~~02 Section~~ | ~~Several items block one action~~ | **R (FD-5):** the summary was rejected; each message stays under its field |
| 03 Page | The page works but needs attention: a persistent save failure, offline | Banner under the rail. Red only when work is at risk; ink otherwise. Not reviewed by the founder: treatment and copy U-2. |
| 04 System | The page cannot be used: invalid link, closed link, load failure | `DfSystemPanel` with existing copy and headline voice | 

System cases map onto existing copy:
- **Invalid invitation:** `THIS LINK ISN'T ACTIVE`
- **Session expired / link closed:** `THIS LINK HAS BEEN CLOSED`
- **Server error:** `WE COULDN'T LOAD THIS` with `TRY AGAIN`
- **Network on load:** the same panel with the connection copy

A token that stops working mid-session surfaces as SAVE FAILED, not as a fake expiry panel.

### 5.3 Promise rules (data integrity)

| Message | Allowed when | Never |
| --- | --- | --- |
| SAVED + time | `saveIntake()` resolved | On debounce, on blur, on an optimistic update |
| RESTORED | The server returned a saved draft | From local storage or memory |
| NOTHING YOU SAVED WAS LOST | A load failed (existing copy) | After a failed save |
| OFFLINE — NOT SAVED | `navigator.onLine` is false | "Saved on this device" (there is no device copy) |
| Success toast | After a user-initiated save resolves (portal preferences) | For autosave |
