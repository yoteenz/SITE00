# Visual authority foundation

This document defines what is fixed, what already exists, and what the founder approved for IDNTY form controls. **OPUS2** incorporates the founder decisions FD-1 to FD-6 (`FOUNDER_APPROVAL_REGISTER.md`); they supersede the OPUS1 recommendations. Everything on the boards traces back to an entry here.

## 1. Authority hierarchy applied

| Rank | Source | What it gives this sprint | Status |
| --- | --- | --- | --- |
| 1 | Founder-approved references | P02 and P03 iPhone screenshots (`../form-control-authority-audit1/evidence/`). Founder approval of the menu drawer ("yes i approve", PR #1572, recorded in `motherboard/MEMORY.md`). | **LOCKED** |
| 2 | Approved Digital Foundation compositions | Board 01/02 page grammar (`SITE00_DIGITAL_FOUNDATION_CLIENT_BOARD_01_02_V1.md`): rail, headline with red period, lede, field cards, P03 service rows, domain paths, CTA, trust line, footer. | **LOCKED** for page composition; controls inside it are IMPLEMENTED |
| 3 | SITE 00 brand rules | White and warm-white chambers, black architectural type, red threshold accents, rectilinear geometry (`site00-df-client.css` header). | **LOCKED** |
| 4 | Design tokens | `site00-df-client.css` (`--df-*` palette, display and text faces) and `site00-df-components.css` (control tokens: 40 px controls, 46 px CTA, 3 px radius, 10 px control type). | **IMPLEMENTED** |
| 5 | Accessible implementations | `DfSelect`, `DfCheckbox`, `DfRadio`, `DfBottomSheet`, `useDfDialogFocus` and `useDfScrollLock` in `components.tsx`, covered by `tests/digitalFoundationComponents.test.ts`. | **IMPLEMENTED** |
| 6 | Composer audit | FC-001 to FC-052, classes A to G, decisions FD-1 to FD-4, migration plan. | Input |
| 7 | Founder decisions FD-1 to FD-6 (OPUS2) | FD-1 sheet on mobile + listbox on desktop; FD-2 required CONTACT NUMBER; FD-3 System B; FD-4 completion controls aligned; FD-5 implemented progression preserved; FD-6 square red-edge sheets; Board 07 treatments | **APPROVED** (ranks above the OPUS1 proposals they replace) |
| 8 | Remaining OPUS1 proposals | Items the founder did not decide (`UNRESOLVED_ITEMS_REGISTER.md`) | **UNRESOLVED** |

### Provenance gap found while grounding (RESOLVED BY FD-5 AND FD-6)

`site00-df-components.css` (PR #1573) says it was built to match "founder component boards 01 (controls, states) + 02 (bottom drawer, overlays)". Those two reference images are **not in the repository**. The PR's own memory entry says merging required founder visual approval. The repository does not show whether that approval covered every detail. Three details from that sprint therefore cannot be confirmed as founder decisions:

- the 16 px rounded bottom sheet with a drag handle
- the round progress nodes with a red halo
- the pill switch

OPUS1 raised them as FD-5 and FD-6. **The founder has now ruled:** the round progress nodes stay (FD-5, the implemented progression is preferred), and sheets are square with the 2 px red edge (FD-6, the rounded skin is replaced and its behaviour kept). The pill switch stays unresolved (U-3). Everything else from #1573 (control sizes, the 3 px radius) is kept. The chosen check mark changes to System B (FD-3).

## 2. What is locked and stays untouched

- **Page composition:** rail, display headline with the red period, lede, field order, P03 row layout, footer `IDNTY / 00x`, threshold objects.
- **The closed Business Type field** the founder sees on P02: the card shell, the white control, uppercase placeholder and chevron. All three selector territories keep it identical.
- **Menu drawer** step grammar: index, connector, label, glyph. The whole implemented progression (rail, drawer, DfProgress, CTAs, validate-on-press, P05 gate, resume) is preserved (FD-5).
- **P03 service rows:**
  - red frame on the open row
  - ink check for included core services
  - row layout, icons, tags and copy
  - the chosen-service mark is the one detail that changes: System B replaces the red-filled check (FD-3 names service selections; see `AUTHORITY_CONFLICT_RESOLUTION_REPORT.md` C-05)
- **Domain path rows:** red frame and red dot on the chosen path.
- **Primary CTA:** red, 46 px, 3 px radius, tracked label and arrow.
- **Intake sequence and copy:** every validation message is reused verbatim.

## 3. The approved grammar (Board 07, FD-3, FD-6)

It is one small rule set, applied to every control.

| Element | Definition | Source in the existing identity |
| --- | --- | --- |
| **The red period** | A 6 px red square (5 px at label and status size). It marks a selected value, the current step, or something that needs attention. **Inside a checkbox (System B, FD-3):** an 8 px red square centred in a white box with a 1 px ink edge. | The red period that ends every SITE 00 headline (`.df-headline__period`) |
| **Active frame** | 1 px red border plus a 1 px red inset (2 px total). It marks a focused or open control. | The P03 active row (`.df-row--active`, inset red) |
| **Ink** | Included, locked, done or recorded. Never a choice. | The existing `df-check--locked` convention |
| **Hairline** | `#eeede9` dividers inside lists, `#dcdad5` between surfaces | The existing option divider and rule tokens |
| **Threshold edge** | A 2 px red top edge on every sheet and overlay, with square corners (FD-6) | The pre-#1573 `.df-sheet__panel` |
| **Index numerals** | Saira 12.5 px, tabular, faint; red when current | The approved drawer index (`.df-drawer__index`) |

These are excluded: drop shadows as depth, blur or frosted panels, gradients, pills (apart from the existing unresolved switch), new colours and new typefaces.

## 4. Colour (existing values only)

See `DESIGN_TOKEN_MAPPING.md`. The three `--ix-*` names (`--ix-divider`, `--ix-active-bg`, `--ix-open-bg`) only name values that `site00-df-components.css` already hard-codes.

Red keeps exactly four jobs: primary action, selected value, current step, error. Green and orange stay limited to toasts and status components, as today.

## 5. Typography

- **SITE 00 Display:** headlines, the sheet title (approved, FD-1 / Board 07), rail index.
- **Saira Semi Condensed:** everything else.
- **Index numerals inside lists:** Saira tabular, not the display face. At 12 to 16 px the traced display numerals read poorly, which showed in this sprint's first renders.
- **Entered values:** 16 px on touch devices, so iOS does not zoom (NF-01); 14 px with a fine pointer.

## 6. Findings added by this sprint

These are not in the audit. Each one is measured in `evidence/finding-measurements.json`.

| ID | Finding | Measurement | Class |
| --- | --- | --- | --- |
| **NF-01** | `site00-df-components.css` sets `.df-input` to 14 px. It loads after `site00-df-client.css`, so it overrides that sheet's explicit 16 px rule ("keeps iOS from zooming the page on focus"). | `#df-business_name` computes to `14px`. Expected on iPhone Safari: the page zooms on focus. Not yet confirmed on a device. | D (responsive), new |
| **NF-02** | `.df-chip` (portal record filter, FC-035) has no CSS rule in any stylesheet. The tabs render as browser-default buttons. The audit lists them as APP-styled. | 0 matching rules; border `outset`; appearance `auto` | B (style drift), new |
| **C-1** | The client sheet's legacy `.df-select__chev` rule (absolute positioning plus `rotate(90deg)`, written for the native select's right-pointing icon) also applies to DfSelect's own down chevron. Binding DfSelect into P02 unchanged would show a sideways chevron in the wrong place. | `position: absolute`, `transform: matrix(0, 1, -1, 0, 0, -8)` | Implementation collision, new |
| **NF-03** | While edits wait for the 900 ms autosave debounce (`status = dirty`), the save chip reads `SAVING…` even though no request has been sent. | Source: `SaveChip` in `EntryIntake.tsx` | C (state gap), new |
| **NF-04** | The client payload has no intake saved-at timestamp (only stage records carry `updated_at`). A "restored from <time>" message cannot be shown truthfully without an API change. | Source: `shared/site00-digital-foundation/types.ts` | Constraint |
| **NF-06** (OPUS2) | The unchecked `.df-check` edge computes to 1 px `#b8b6b1`: `site00-df-components.css` overrides the client sheet's 1.5 px `#8f8d88`. 2.03:1 on white, under WCAG 1.4.11's 3:1. | `.df-root .df-check` computes `1px solid rgb(184, 182, 177)` | E (accessibility), new; repaired in the System B spec (`#8f8d88`, 3.32:1) |
| **NF-05** | PR #1573's description says it mounted the "business type select". The current source has never used DfSelect in `EntryIntake.tsx` (`git log -S DfSelect` finds nothing). | Source history | Confirms the audit's FC-043 G finding |
