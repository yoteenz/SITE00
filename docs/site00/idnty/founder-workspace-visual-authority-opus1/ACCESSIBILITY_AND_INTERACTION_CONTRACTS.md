# Accessibility and interaction contracts

**Status:** PROPOSED. These contracts apply to every component in the registry. Per-component contracts are in the ACCESSIBILITY CONTRACT column of COMPLETE_COMPONENT_INVENTORY.md. Target: WCAG 2.2 AA.

## 1. Structure and landmarks

- One `<nav>` for primary navigation (bottom nav, rail or sidebar), labelled "WORKSPACE".
- `<main>` for the stage; `<aside aria-label="…">` for the inspector.
- One `<h1>` per page (the display headline). Section headings follow in order, and the index rail (`01 ——`) is decorative.
- Tables are real `<table>`s with `<th scope>` on desktop. Card rows on phones are list items with a single link or button each.

## 2. Keyboard

| Context | Keys |
| --- | --- |
| Global | ⌘K / Ctrl K search · ESC closes the top overlay, then the inspector · `g o` / `g f` / `g r` / `g p` / `g c` / `g s` go to destinations (optional, PROPOSED) |
| Lists and tables | ↑↓ move selection, ↵ open, Space select (desktop inspector) |
| Tabs | ← → move, Home / End, automatic activation |
| Menus | ↑↓, ↵, ESC; typeahead on item labels |
| Dialogs and sheets | Tab cycles within; first focus = first field or primary; ESC = cancel |

Every interactive element is reachable and operable by keyboard. Nothing depends on hover.

## 3. Focus

- Focus is visible on keyboard focus (`:focus-visible`): a 1 px red frame plus a 1 px inset, from the form-control authority. It is never removed.
- Opening an overlay moves focus into it; closing returns focus to the trigger.
- After a destructive or navigating action, focus moves to the resulting page title or the toast region.

## 4. Screen readers (VoiceOver)

| Element | Contract |
| --- | --- |
| Status marks | `aria-hidden`; the adjacent text carries the meaning ("WAITING ON CLIENT") |
| Chips | Text carries meaning; icons are decorative; disabled-by-policy chips include the reason |
| Phase segments | `role="img"` with `aria-label="STEP 3 OF 8, RECOMMEND"` |
| Journey | Ordered list; current item `aria-current="step"`; completed items announce "COMPLETE" |
| Signals | Buttons with `aria-pressed` when selected; label "NEEDS REVIEW, 3" |
| Review badge | Included in the nav item name ("REVIEWS, 3 DECISIONS") |
| Toasts | `role="status"` for success; `role="alert"` for errors; never the only error feedback |
| Loading | Container `aria-busy="true"`; skeletons `aria-hidden` |
| Client plates | Decorative when the name is adjacent; otherwise `aria-label` = business name |
| Threshold objects | `aria-hidden`; never carry data |
| Disabled by policy | `aria-disabled="true"` (focusable) + `aria-describedby` → reason |

**Uppercase and screen readers.**
- Copy is authored in normal case and uppercased with CSS, so screen readers do not spell out words letter by letter.
- Abbreviations that must be spelled (DNS, DKIM, API) are authored as such.
- **Never author application copy in literal capitals in the source.**

## 5. Touch and pointer

- Targets are at least 44 × 44 px on phones and tablets, and at least 24 × 24 px on desktop (WCAG 2.5.8), with 36–40 px recommended.
- Long-press menus always have a visible ⋯ alternative.
- Swipe-to-dismiss sheets also have ×.

## 6. Colour and contrast

- Text contrast is at least 4.5:1. Measured: muted #75736e on #fbfaf8 = 4.54:1; red #ce1017 on white = 5.66:1; OK green #2e7a4b on white = 5.25:1.
- WARN amber was measured at 4.19:1 as first drawn (#c2610f) and **darkened to #a65208 (5.48:1 on white, 4.99:1 on the warn tint)**; the boards use the corrected value.
- Faint grey (#a3a19c, 2.47:1) is only used for decorative rules and disabled items, which are paired with a text reason.
- Meaning is never carried by colour alone: every mark has a label, and every chip has text.

## 7. Text size and zoom

- Sizes in rem. The layout must survive 200 % zoom and iOS text-size settings without loss of content, and reflow at 320 CSS px with no horizontal scroll (WCAG 1.4.10).
- Tracked uppercase labels must not drop below the FD-W8 minimum on phones (recommended 10 px; board scale 8 px).

## 8. Motion

- Sheet and dialog transitions are 160–220 ms ease-out. There is no parallax, no shimmer and no autoplay.
- Under `prefers-reduced-motion: reduce`, transitions are instant.

## 9. Case-sensitive data

Email addresses, domains, links, tokens, ids, template ids, environment names, provider ids, typed search text and message bodies use `.fw-data` and are **never transformed**.
- Inputs for them set `autocapitalize="off"` and `spellcheck="false"`.
- Inputs for them use the correct `inputmode` and `autocomplete`.

## 10. Interaction contracts

1. **No optimistic success.** UI state changes only after the API confirms.
2. **Idempotent presses.** Primary actions disable while in flight.
3. **Errors in place.** The message sits at the control or section, is announced, and keeps user input.
4. **Persistence honesty.** Actions that are not persisted alone say so in their confirmation.
5. **No dead ends.** Every empty, error and unavailable state names one next action.
6. **Refresh safety.** Destination, section, tab, filters and selection survive a browser refresh through the URL.
7. **External links** (client view, public link) open in a new tab and say so (`aria-label` "… OPENS IN NEW TAB").
8. **Session expiry** returns to sign-in through the existing auth redirect and comes back to the same URL.
