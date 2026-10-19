# Selector territories — FC-004 Business Type

**Authority:** **FD-1 APPROVED** (founder). Mobile uses **Territory B**, the editorial selection sheet. Desktop uses **Territory A**, the anchored listbox, as its coordinated companion. Territory C is reserved for a specific short list that justifies it and is **not** the Business Type default. A on phones, B on desktop and C for Business Type are **NOT APPROVED**; they stay on the boards as greyed history.
**Boards:** 01A (iPhone), 01B (desktop) and 06 (mobile edge cases).
**Values:** the ten `BUSINESS_TYPES` strings in `src/site00/foundation-client/model.ts`, verbatim. `model.ts` marks the list "pending founder ratification"; this package does not change it.
**Placeholder:** `SELECT A BUSINESS TYPE` (the existing `<option value="">`).

## The problem

The closed field already matches the page; the founder's own screenshot confirms it. Tapping it opens the iOS picker, with SF typography, a frosted panel and a system checkmark. CSS cannot restyle that picker, so the control has to be replaced. The audit classifies this as A (native visual break) and G (approval gap).

**All three territories keep the closed field exactly as it is.** They differ only in what opens.

## Closed states (shared)

| State | Treatment | Status |
| --- | --- | --- |
| Empty | Placeholder in caps, `#a9a7a2`, chevron in ink | IMPLEMENTED |
| Selected | Value in caps, ink | IMPLEMENTED |
| Hover (fine pointer) | Border `#b8b6b1` | IMPLEMENTED |
| Keyboard focus | Active frame (2 px red) plus the red period before the label | APPROVED (Board 07) |
| Open | Active frame, `#fffafa` fill, chevron turned 180° | IMPLEMENTED (`df-select--open`) plus the approved frame |
| Disabled (intake submitted) | `#efeeeb` fill and grey text | IMPLEMENTED |
| Invalid | Red border plus the red period and a message | APPROVED treatment (Board 07). **Illustrative only:** Business Type stays optional. |
| Optional marker | `OPTIONAL` micro tag at the right of the label row | APPROVED (Board 07) |

## Territory A — architectural dropdown (anchored listbox) · APPROVED FOR DESKTOP

The list is part of the field. It hangs from the trigger with the same edge, inside the red active frame, with no gap and no shadow. Rows are 40 px tall with hairline dividers. The selected row carries the red period and ink weight. The row under the pointer or arrow key is tinted `#f4f3f0`.

| Aspect | Specification |
| --- | --- |
| Closed | Shared closed states |
| Expanded | Panel below the trigger; it flips above when space below is short (DfSelect `place()` already measures `visualViewport` and a peeking sheet) |
| Active / focused | Tinted row; `aria-activedescendant` moves |
| Selected | Red period, ink, 700 weight; the list opens scrolled to the selected row |
| Invalid | Trigger in red with a message below; the list itself is unchanged |
| Long list | Shows 6½ rows (a half row signals scroll) with a 2 px ink scroll indicator. On desktop all 10 rows fit (400 px) with no scroll. That needs `place()` constants changed: rows 38 → 40 px, cap 300 → 402 px with a fine pointer. |
| Mobile | Works, but on a 667 px phone only about 5½ rows fit, and it competes with the keyboard |
| Desktop | Strongest option: anchored, fast, pointer and keyboard |
| Accessibility | APG select-only combobox, **already built and tested** in DfSelect: Enter, Space and arrow keys open; Home and End; typeahead; Escape closes; Tab closes without committing |
| Complexity | **Low.** Restyle DfSelect and bind P02. Resolve collision C-1 first. |
| Data-contract risk | Low. `onChange` writes the same string to `draft.industry`. |
| Use cases | Desktop and tablet, fine pointer, lists of 10 or fewer |

## Territory B — editorial mobile selection sheet · APPROVED FOR MOBILE (FD-1)

A square sheet with the 2 px red threshold edge rises from the bottom over a `rgba(12,12,12,.46)` scrim. The scrim has no blur.

- **Geometry (FD-6, approved):** square corners, 2 px red top edge, no shadow, no blur; never the native translucent iOS picker or a rounded browser menu.
- **Head:**
  - index rail (`02 —— BUSINESS TYPE`)
  - display title `SELECT A BUSINESS TYPE.` with the red period
  - meta line `OPTIONAL · CHOOSE ONE` (copy U-2)
  - 44 px close button
  - a 1 px ink rule below it
- **Rows:** 48 px, full width. Index numerals 01 to 10 are presentation only and never stored. Labels are 11 px caps. The selected row has a red numeral, ink 700 label, the red period and a 2 px red inset edge.
- **Foot:** `10 OPTIONS`, plus `CLEAR SELECTION` when a value is set (copy U-2). This preserves the native select's ability to return to `''`.

| Aspect | Specification |
| --- | --- |
| Closed | Shared closed states; the trigger shows its open state while the sheet is up |
| Expanded | Sheet anchored to the visual viewport; at least 56 px of page stays visible above it; maximum height `100dvh − 56px` |
| Active / pressed | Tinted `#f4f3f0` row on touch-down; keyboard focus shows a 2 px red ring inset in the row |
| Selected | As above. Choosing a row commits and closes, like the native control. There is no extra confirm step. |
| Invalid | On the trigger only |
| Long list | All 10 visible at 844 px. At 667 px the list scrolls inside the sheet with a fade at the cut row; head and foot stay put; `overscroll-behavior: contain`. |
| Legacy value | A `draft.industry` that is not in `BUSINESS_TYPES` (today's `__custom` option) appears first with a `—` index and the tag `ON FILE · NOT IN THE LIST`. It is selectable and never rewritten. |
| Mobile | **Strongest:** full-width rows, 48 px targets, no clipping, clear dismissal |
| Desktop | Possible as a centred 440 px panel, but heavier than a ten-item choice deserves |
| Accessibility | `role="dialog"` + `aria-modal` + `aria-labelledby` (the title), containing a `role="listbox"` with `aria-selected` options. Focus moves to the selected row (or the first row) on open and back to the trigger on close. Escape and the scrim close without change. Background is inert. |
| Complexity | **Medium.** A new `IdntySelectionSheet` built on DfBottomSheet's plumbing (`useDfDialogFocus`, `useDfScrollLock`, portal with `df-portal`), not on its peek or drag snaps |
| Data-contract risk | Low. Same value contract; Clear writes `''`, exactly what the native placeholder option writes. |
| Use cases | Phones, coarse pointer, long labels, lists of more than 6 |

## Territory C — inline expanded selection · RESERVED, NOT THE BUSINESS TYPE DEFAULT

The field card grows in place. Below the open trigger, each option is a 40 px white tile with a 4 px gap, the same tile grammar as the founder-approved P03 domain paths. The chosen tile takes the red active frame and the red period. Other tiles carry no box or dot, so the list never reads as a multi-select. A `DONE` link and `10 OPTIONS · CHOOSE ONE` close the card.

| Aspect | Specification |
| --- | --- |
| Closed | Shared closed states |
| Expanded | In flow, so it pushes the content below it |
| Focus | 2 px red ring on the tile (offset 1 px) |
| Selected | Red frame plus red period; selecting collapses the list |
| Invalid | On the trigger |
| Long list | All 10 shown: the form below moves about 450 px. Scroll the trigger to the top of the viewport on open to avoid disorientation. |
| Mobile and desktop | Calm, but the displacement is the cost on this field |
| Accessibility | Simplest semantics: a disclosure button (`aria-expanded`) controlling a native radio group (`fieldset` + `legend`). Arrow keys move within the group natively. |
| Complexity | Low to medium |
| Data-contract risk | Low |
| Use cases | 5 options or fewer, in context. It is **already the right pattern for the four domain paths.** |

## Comparison (historical; the decision is FD-1)

| | A · dropdown | B · sheet | C · inline |
| --- | --- | --- | --- |
| iPhone 390 × 844 | Good | **Best** | Long jump |
| iPhone SE 375 × 667 | Cramped (5½ rows) | Good (inner scroll) | Long jump |
| Desktop | **Best** | Heavier than needed | Long jump |
| Keyboard / screen reader | Built and tested | New; contract in `ACCESSIBILITY_CONTRACTS.md` | Native radios |
| Build | Low | Medium | Low to medium |
| Looks like SITE 00 | Yes: the field's own frame | Yes: threshold edge, rail, display title | Yes: P03 tile grammar |

## Founder authority (FD-1 APPROVED)

**One `IdntySelect` component, two presentations:**

- **Territory B (`IdntySelectionSheet`)** when `matchMedia('(pointer: coarse) and (max-width: 600px)')` matches.
- **Territory A (restyled `DfSelect`)** otherwise.

Re-evaluate on `change`, but never while a list is open.

Both presentations share:
- the props: `id`, `value`, `options`, `placeholder`, `onChange`, `disabled`, `invalid`, `describedBy`, `labelledBy` (matching DfSelect);
- the option list and value contract;
- the closed field;
- the typography;
- the red-period selected state;
- the active frame;
- the feedback states.

There is no second selector component.

**Territory C** is used only where a specific short list justifies it in context. The domain-path radios already use its tile grammar. It is never the Business Type default.

**Not approved:** A everywhere, B everywhere, C for Business Type.
