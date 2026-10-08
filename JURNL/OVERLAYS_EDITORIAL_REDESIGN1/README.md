# Overlays — editorial redesign 1 (QUICK ADD + HAMBURGER MENU)

Sprint `P0.JURNL.OVERLAYS.QUICK-ADD-AND-HAMBURGER-EDITORIAL-REDESIGN1`.

**Status: approved by the founder on 2026-10-08 and built into the runtime.** ENTRY, SETUP and the other overlays are
unchanged.

## Runtime

| Overlay | Component | Runtime shell |
|---|---|---|
| QUICK ADD | `src/projects/jurnl/runtime/global/GlobalSheets.tsx` `QuickAddV2Sheet` | `src/projects/jurnl/runtime/global/overlays/QUICK_ADD_SHELL.webp`: the approved shell from frame y 100 down, 1260 × 1919 |
| HAMBURGER MENU | `src/projects/jurnl/runtime/screens/AccountScreens.tsx` `AccountDrawer` (opened by the corner menu chip) | `src/projects/jurnl/runtime/global/overlays/ACCOUNT_MENU_SHELL.webp`: the same composition on a taller 393 × 852 frame, the folio grown with its own plain paper, 1260 × 2731 |

- **Layout.** Each overlay is laid out in the design px of its authority and scaled to the screen as one object (`OverlayAuthority.tsx`, `jurnl-overlays.css`). The scale is width ÷ 393 on a phone. Wide screens use the root hubs' column, capped at 1.35.
- **Paper.** The shell is painted in two layers. The top layer is drawn at its own proportions, so the clip, print, tabs, portrait and ribbon never stretch. The foot layer fades in from the bottom over plain paper.
- **Controls.** The live controls sit on the paper as on the authority.
- **Inputs.** The NAME field is a 16 px input drawn at 11.5 px, so iOS does not zoom on focus.

| Overlay | Class | Parent under it | Authority (941 × 1672) | Shell (2016 × 3584 RGBA) |
|---|---|---|---|---|
| QUICK ADD | `BOTTOM_SHEET` | SAFE TO SPEND (`safe`) | `QUICK_ADD/QUICK_ADD_AUTHORITY.png` | `QUICK_ADD/QUICK_ADD_SHELL.png` |
| HAMBURGER MENU | `ACCOUNT_DRAWER` (from the right) | TODAY (`today`) | `HAMBURGER_MENU/HAMBURGER_MENU_AUTHORITY.png` | `HAMBURGER_MENU/HAMBURGER_MENU_SHELL.png` |

`CAPTURES/BEFORE_AUTHORITY_SHELL.jpg` puts the current overlay, the new authority and the new shell side by side.

## Overlay model

Each authority is one phone screen (393 × 699 css px at 941/393), never a page plate:

- **L0** the live parent, captured from `main` f8a8e9e3. It stays visible.
- **L1** a warm scrim, `rgba(20, 16, 10, 0.55)` for QUICK ADD and `0.60` for the menu. No blur.
- **L2** the overlay body. This is the shell.
- **L3** chrome: the QUICK ADD handle and the close control.
- **L4** content.
- **L5** the primary action.

Each shell is that same frame at 5.13× with only L2. It keeps the silhouette, materials, edges, collage inserts, shadow and asymmetry, and has no copy, controls, handle, close, scrim or parent. Outside the paper it is transparent. In the menu's left gutter the drop shadow keeps alpha at or below 26/255. Laid over the parent at cover-fit, the shell lands exactly where the authority shows it.

## QUICK ADD: tactile transaction slip

- **Primary editorial gesture.** A torn cypress-landscape engraving sits under the slip's brass clip, above the sheet, running off the screen's left edge.
- **Secondary tactile detail.** The slip itself: two torn, deckled sheets held by the brass clip.
- **Hierarchy (no five equal boxes):**
  1. QUICK ADD in display serif (43 px).
  2. AMOUNT as the slip's total, a 66 px serif figure over a double rule.
  3. SAVE TRANSACTION, the one full-width solid.
  4. TYPE as one segmented object, the chosen half inked olive.
  5. NAME on a ledger line.
  6. ACCOUNT as printed check squares, the chosen one burgundy.
- **Form layout.** Labels sit in a margin column, as on a printed form, so no field is an input box.
- **Burgundy** appears only on the short mark under the subtitle and on the chosen account square.
- **Square-rounded controls:**

  | Control | Radius |
  |---|---|
  | Close | 7 px |
  | TYPE | 7 px |
  | SAVE | 8 px |
  | Check squares | 2.5 px |

  Nothing is circular.

Geometry in css px at a 393-wide phone:

| Layer | Box |
|---|---|
| Slip (shell) | x −2, y 200, w 400. Front sheet x 18–377; content x 40–355 |
| Print (shell) | x −26, y 114, w 176, rotated 5°. Tucked under the slip, clip over it |
| Handle | x 178, y 247, 37 × 4 |
| Close | x 324, y 258, 31 × 31 |
| QUICK ADD / subtitle / mark | x 40: y 262 (43 px) / y 313 (8.6 px, 2.7 tracking) / y 334 (24 × 2 burgundy) |
| Label column | x 41, 8.5 px, 2.4 tracking |
| NAME | field x 118–355, placeholder y 362, ledger rule y 383 |
| AMOUNT | `$` 28 px + figure 66 px at x 118, y 394; double rule y 464 / 468 |
| TYPE | x 118, y 492, 237 × 38 |
| ACCOUNT | squares 13 px at x 118 and x 241, y 554 |
| SAVE TRANSACTION | x 40, y 606, 315 × 50 |

Function map, from `GlobalSheets.tsx` `QuickAddV2Sheet`, all kept:

| Element | Trigger |
|---|---|
| NAME | `quick-add-name` |
| AMOUNT | `quick-add-amount` (currency prefix or suffix, keyboard state) |
| TYPE | `quick-add-expense` / `quick-add-income` |
| ACCOUNT | `quick-add-<account id>`, one square per account option |
| SAVE | `quick-add-save` (disabled until valid) |
| Close | close |

Two pieces of state behaviour the authority does not show:

- **More than one record type.** When a family offers TRANSACTION / INCOME / GOAL / PURCHASE / TRIP, that choice is set as a printed check row under the subtitle, and the slip rises 48 px.
- **Save error.** "COULD NOT SAVE. TRY AGAIN." sits under SAVE in burgundy, 8.5 px.

## HAMBURGER MENU: personal JURNL index / account folio

- **Primary editorial gesture.** The bust print is the PROFILE portrait. It is turned −5° and breaks the folio's left edge over the scrim.
- **Secondary tactile detail.** A burgundy bookmark ribbon is tucked under the portrait and hangs down the folio margin with a fishtail cut.
- **The index.** The folio's own olive, sage, stone and tan sheets lead on the left as tabs.
- **Hierarchy:**
  1. JURNL lockup, then ACCOUNT (36 px serif).
  2. PROFILE, the dominant module: portrait plus a 25 px two-line name.
  3. DISPLAY CURRENCY | CONNECTION as two index columns.
  4. ASK JURNL CONTEXT with a square-rounded toggle (track radius 5, knob radius 3.5).
  5. SAFE TO SPEND BUFFER: a ledger figure plus SAVE BUFFER.
  6. PRIVACY & CONSENTS.
  7. SIGN OUT, in burgundy, set apart at the foot.
- **No card stack.** Hairline rules divide the rows.

Geometry in css px:

| Layer | Box |
|---|---|
| Folio (shell) | x 46, y 6, h 690, running off the right edge. Paper x 69–383 below y 174; x 158–383 above y 99 |
| Bust (shell) | x 12, y 104, w 150, rotated −5° |
| Ribbon (shell) | x 66, y 196, w 17, rotated 2.5° |
| Close | x 344, y 22, 30 × 30 |
| JURNL / ACCOUNT | x 176, y 30 / x 174, y 58 |
| PROFILE | kicker y 126, name y 142, email y 204 at x 179; arrow x 354 |
| Utilities | y 266–322; columns x 88 and x 243; divider x 229 |
| ASK | y 356; toggle x 330, y 360, 44 × 24 |
| BUFFER | y 436; figure x 88, y 486 (23 px); SAVE BUFFER x 240, y 481, 134 × 34 |
| PRIVACY | y 553 |
| SIGN OUT | y 634 |
| Row rules | x 88–374 at y 250 / 338 / 420 / 536 / 610 |

Function map, from `AccountScreens.tsx` `AccountDrawer`, all kept:

| Element | Trigger |
|---|---|
| Outside tap | `account-drawer-close` |
| ACCOUNT title | `drawer-account` → `/account` |
| PROFILE | `drawer-profile` |
| CHANGE | `drawer-currency` |
| SET UP | `drawer-connection` |
| Toggle | `drawer-ask-context` |
| Buffer field | `drawer-buffer` |
| SAVE BUFFER | `drawer-buffer-save` |
| PRIVACY & CONSENTS | `drawer-privacy` |
| SIGN OUT | `drawer-sign-out` |

## Materials (approved kits only, nothing generated)

All materials come from `JURNL_CURRENT_AUTHORITIES/`:

| Material | Source | What was done |
|---|---|---|
| Slip | `PURCHASE_OUTCOME/receipt-card.png` | Kept the brass clip and both torn sheets. Patched the printed sprig with nearby paper. Grew the sheet downward with straight (unflipped) bands so the deckled sides never mirror. |
| Print | `PLAN/editorial-overlay.png` | Lifted the cypress-landscape engraving as an alpha component. |
| Bust | `PLAN/editorial-overlay.png` | Lifted the torn bust print as an alpha component. |
| Folio | `WHY_THIS_NUMBER/explanatory-dossier.png` | Mirrored the tabbed stack so the tabs lead on the left. Patched the printed sprig. Grew the body and re-attached the original bottom edge. |
| Ribbon | `CREDIT/editorial-overlay.png` | Isolated the burgundy ribbon by hue, took its clean straight band, grew it to bookmark length and cut a fishtail. |

The current overlays from the founder's handoff were used only to read function and the material vocabulary. Their imagery is not reused.

## Quality gates

| Gate | QUICK ADD | HAMBURGER MENU |
|---|---|---|
| OVERLAY_NOT_PAGE | PASS: sheet over live `safe` with scrim | PASS: drawer over live `today` with scrim |
| TACTILE_TRANSACTION_OBJECT / PERSONAL_ACCOUNT_FOLIO | PASS | PASS |
| STRONG_HIERARCHY | PASS: amount > save > type > name > account | PASS: profile dominates; utilities, settings and sign-out step down |
| GENERIC_BOTTOM_SHEET / GENERIC_CARD_STACK | NO | NO |
| TOO_BUSY | NO: one gesture + one detail | NO: one gesture + one detail |
| ALL_UI_UPPERCASE | PASS (checked: no lowercase in copy) | PASS |
| FUNCTION_PRESERVED | PASS: every trigger mapped above | PASS: every trigger mapped above |
