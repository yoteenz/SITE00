# Accessibility contracts

Each custom interaction must meet its contract before it ships. Where an existing accessible primitive already does the job, the contract is "keep it".

**Patterns:** WAI-ARIA Authoring Practices for select-only combobox, listbox, dialog (modal), radio group, checkbox and tabs. Targets meet WCAG 2.2 AA: 2.4.7 focus visible, 2.4.11 focus not obscured, 2.5.8 target size, 1.4.11 non-text contrast, 3.3.1 error identification, 4.1.3 status messages.

## C-01 · IdntySelect, Territory A (DfSelect): keep, plus visual changes

| Item | Contract | Already in DfSelect |
| --- | --- | --- |
| Semantics | `button[role=combobox][aria-haspopup=listbox][aria-expanded][aria-controls]` plus `ul[role=listbox]` > `li[role=option][aria-selected]` | Yes |
| Label | `aria-labelledby` points to the visible label (`df-industry-label`); the field shell must pass `labelledBy` | Yes (prop) |
| Description and error | `aria-describedby` points to the hint or error id; `aria-invalid` when invalid | Yes (props) |
| Active option | `aria-activedescendant` on the trigger while open | Yes |
| Keys, closed | Enter, Space, ↓ and ↑ open; ↑ on an empty value starts at the last option | Yes |
| Keys, open | ↓ ↑ Home End move (disabled options skipped); Enter and Space commit and close; Escape closes and keeps focus; Tab closes without committing; letters run a 700 ms typeahead | Yes |
| Pointer | Option `pointerdown` is prevented (keeps focus); `click` commits; an outside `pointerdown` closes without committing | Yes |
| Focus | Focus returns to the trigger on close with `preventScroll` | Yes |
| Visible focus | Active frame (2 px red) on the trigger; the active option is tinted `#f4f3f0`. The selected option shows the red period **and** a 700 weight, so the state is never carried by colour alone. | **Change** (CSS only) |
| Announcements | Value change is announced through the combobox value (button text). No extra live region. | Yes |
| Tests to add | Each `BUSINESS_TYPES` value commits and calls `onChange` with the exact string; a legacy value is rendered and preserved; the Escape, Tab and outside-click paths do not change the value | — |

## C-02 · IdntySelectionSheet, Territory B: new

| Item | Contract |
| --- | --- |
| Semantics | Portal (`df-portal`). `div[role=dialog][aria-modal=true][aria-labelledby=<title id>]` containing `ul[role=listbox][aria-labelledby=<title id>]` > `li[role=option][aria-selected]`. The close button is a `button` with `aria-label="CLOSE"`. |
| Trigger | The same combobox trigger as C-01, with `aria-haspopup="dialog"` and `aria-expanded` while the sheet is open |
| Open | Focus moves into the sheet: the listbox gets focus with `aria-activedescendant` on the selected option, or the first option. Uses `useDfDialogFocus` (focus trap plus return target). |
| Keys | Same as C-01 inside the listbox; Escape closes; Tab cycles listbox → CLEAR → CLOSE inside the dialog (trapped) |
| Touch and VoiceOver | Each option is a separate swipe stop, read as "<label>, selected, n of 10". Double-tap commits. The two-finger scrub (Z gesture) closes (dialog semantics). |
| Close | Scrim tap, CLOSE, Escape and a committed choice all close it. Focus returns to the trigger. Page scroll is restored. |
| Background | Inert while open (`aria-modal` plus the scroll lock). Only one dialog at a time. |
| Clear | `CLEAR SELECTION` is a `button`. It sets `''` (identical to the native placeholder option), and its announcement comes from the trigger reading `SELECT A BUSINESS TYPE`. |
| Index numerals | `aria-hidden="true"`: presentation only |
| Motion | Respects `prefers-reduced-motion` |
| Targets | Rows are 48 px (44 px in landscape); close is 44 × 44 |
| Tests to add | Focus moves in on open and returns on close; Escape and the scrim leave the value unchanged; every option commits its exact string; Clear writes `''`; a legacy value is listed and preserved; the scroll lock count returns to 0 |

## C-03 · Territory C (if chosen): disclosure plus native radio group

- `button[aria-expanded][aria-controls]` toggles a `fieldset` > `legend` plus native `input[type=radio]` with visually hidden inputs. **Not** `pointer-events: none`.
- Arrow keys move between options natively; Space selects.
- Collapse on selection returns focus to the trigger.

## C-04 · Field shell (IdntyField / DfField)

- Visible `<label for>` is always present; placeholders are never the label.
- Error: `aria-invalid="true"` plus `aria-describedby` pointing to the error id. The message starts with the red period, which is decorative (`aria-hidden`); the text carries the meaning.
- The **`OPTIONAL` tag is text**, so assistive tech reads it with the label. Required fields may add `aria-required="true"`; the validation behaviour is unchanged.
- **Submit-time errors:** focus goes to the first invalid field (existing behaviour). A section summary, when present, is `role="alert"` with in-page links to field ids.
- **Read-only:** use `readonly`, not `disabled`, when the value must stay reachable for reading. The lock glyph is `aria-hidden`; the `SUBMITTED` tag is text.
- **Focus visible:** the 2 px red frame. `--df-red` on white has a contrast of about 5.6:1, so it passes 1.4.11.

## C-05 · Checkbox (DfCheckbox / acks / prefs / service rows)

- **A native `input[type=checkbox]` or `role=checkbox` stays the single focusable control.** The visual mark is a `span[aria-hidden]`.
- **Add-ons (FC-024):** remove the duplicate `button[tabIndex=-1][aria-hidden]`. Keep the row `button[role=checkbox][aria-checked]`.
- **Portal preferences (FC-036):** wrap in `DfCheckbox` (visually hidden native input with a full-row hit area).
- **The locked required category** is a non-interactive list item reading `ESSENTIAL SERVICE + SECURITY, REQUIRED`. Never a disabled checkbox that can be tabbed into and confuses.
- **Acks:** keep the `fieldset` / `legend`. The `2 OF 3` count is in the legend text, so it is announced. The blocked-accept line is `role="alert"`, shown only after an attempt.
- **Focus ring:** solid 2 px red, offset 2. The current `rgba(229,1,7,.35)` ring is under 3:1 on warm white.
- **Indeterminate:** `aria-checked="mixed"`, and only if a "select all" is ever introduced.

## C-06 · Radio group: domain path

- **Fix FC-011:** the hidden radio must stay focusable. Remove `pointer-events: none` from `.df-path input`, keep `opacity: 0` and position it over the label.
- The group is a `fieldset` with a `legend` (existing). The error message is linked with `aria-describedby` on the fieldset.

## C-07 · Stepper

- `role="group"` with `aria-label="QUANTITY — <ITEM>"` (existing).
- The buttons keep their labels (`FEWER — …`, `MORE — …`).
- `output aria-live="polite"` (existing).
- Disabled ends use `disabled`.
- Visual targets are 38 × 36. Expand the hit area to 44 × 44 with a transparent outset, so the row height does not grow.

## C-08 · Tabs (record filter)

- Keep `role="tablist"` / `role="tab"` / `aria-selected`.
- **Add:** roving `tabIndex` and ← → Home End per APG, with `aria-controls` pointing to the list region.

## C-09 · Status and feedback

- The status line keeps `role="status" aria-live="polite"` (existing SaveChip). The retry button stays a `button`.
- **Do not announce `UNSAVED CHANGES` on every keystroke.** Leave the live region quiet while `dirty` and announce only SAVING → SAVED, or SAVED → NOT SAVED.
- Page banners: `role="status"`; the save-failure banner is `role="alert"`.
- System panels are headings (`h1`) plus body text, and focus moves to the `h1` on load.
- Toasts (existing provider): polite for success, assertive for error. They auto-dismiss only for success.

## C-10 · Buttons and progression

- Busy keeps `aria-busy` and `aria-disabled` and stays focusable (existing DfButton).
- A disabled gate (P05) has visible explanatory text linked with `aria-describedby` (`CONFIRM 2 MORE ITEMS TO CONTINUE`).
- Drawer steps keep `aria-current="step"` and `aria-disabled` (existing); the in-page strip is an `ol` with `aria-current="step"` on the current item.
