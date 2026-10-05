# F02 SETUP — OPUS final audit: architecture decisions

Sprint `P0.JURNL.F02-OPUS-FINAL-FAMILY-STRUCTURAL-VISUAL-INTERACTION-RESPONSIVE-AUDIT1`.

This audit corrected Grok's live F02 family in place. It did not rebuild the family. Founder visual approval is still pending.

Status: `READY_FOR_FOUNDER_VISUAL_REVIEW`.

## Pipeline finding

F02 was produced in this order:

1. VISUAL AUTHORITY PRODUCTION
2. SAME-SESSION LINKED-ASSET SIDEKICK
3. BOTANICAL / LOCKUP REPAIR
4. GROK CANONICAL MOUNT
5. GROK FULL FAMILY LIVE IMPLEMENTATION
6. OPUS FINAL AUDIT

The pipeline delivered every asset correctly:

- 4/4 plates
- 13/13 botanicals
- 2/2 lockups
- 12/12 inherited icons

The audit found no asset gaps, so `F02_GROK_SURGICAL_REPAIR_QUEUE.json` is empty. Every defect was in layout, typography or interaction, and each one was fixed in shared code.

Sonnet was not used for F02.

`SONNET_USAGE_POLICY = OPTIONAL_BY_FAMILY_COMPLEXITY`. A middle Sonnet pass is optional. Use it only when a family has more screens, states or interaction types than one Grok implementation plus one Opus audit can carry.

## 1. Left content rail

Copy, panels, rows, fields, inline errors, helper copy and secondary actions now sit in one left rail per screen. The exception is the mobile primary CTA (see §5).

- `.jrn-setup` gets `max-width: var(--f02-rail)`.
- On tablet and desktop, `.jrn-cta` gets the same width.
- The rail starts on the F01 grid line:
  - mobile: `--jrn-m` (34 px)
  - tablet: 72 px
  - desktop: 72 px
- The rail never centres. Tablet used to centre a 440 px column; it now stays on the left.

## 2. Curtain boundary

Each plate's environment edge is measured on the plate itself, as a fraction of plate width, at the band where the content sits:

| Plate | Edge | Fraction |
|-------|------|----------|
| ARRIVAL | sheer curtain | 0.545 |
| DESK | sheer curtain in front of the wall corner | 0.649 |
| EDIT | olive leaves and stone pilaster | 0.666 |
| QUIET | lit stone column | 0.643 |

The CSS maps that fraction through the same `object-fit: cover` and `object-position` the `<img class="jrn-plate">` uses:

```
plate width = max(100cqw, 56.25cqh)                    /* 2016 × 3584 under cover */
edge x      = px · 100cqw + (f − px) · plate width     /* px = 0.50 mobile · 0.56 tablet · 0.62 desktop */
rail        = clamp(160px, edge − gap − left, max)     /* gap 14 mobile, 32 tablet/desktop; max 400 tablet, 420 desktop */
```

`.jrn-screen[data-jrn-family='F02']` is a size container (`container-type: size`). This means the rail follows the photograph at any canvas size, including the design viewport iframe and real devices. It is not one global pixel width.

Values per screen and viewport are in `F02_CONTENT_RAIL_MAP.json`.

The QA checks every rail item against an independent measured edge. The edges come from gridded crops of the plates, not from the CSS (`ENV_EDGE` in `scripts/jurnl/f02-final-audit-qa.mjs`).

## 3. Panel width

Panels take their typographic width; they are not stretched as bands.

- Read-only lists (path on F02.00, recap on F02.08) are `width: max-content`, with a 200 px minimum and the rail as maximum.
- Selection rows, consents, fields and errors fill the rail, so trailing controls line up in one column.
- Tablet caps the rail at 400 px. The old centred column was 440 px.
- Desktop keeps its existing 420 px column at x = 72. That column already sat left of every environment edge.

## 4. Headline and body wrap

**Headlines:** each line is authored, one `<span>` per line. At 34 px (mobile) and 40 px (tablet/desktop) every authored line fits its rail, so no headline wraps on its own. `text-wrap: balance` is kept as a guard.

**Helper copy:**

- Size: 11.5 px mobile, 12.5 px tablet/desktop.
- Tracking: 0.18 em.
- `text-wrap: balance`, so it breaks into 1–3 lines inside the rail.
- The QA fails a helper whose last line is a single word. Before the audit, F02.01 and F02.06 left orphans at mobile or tablet; after it, there are 0 orphans.

**Reassurance foot** ("A FEW QUIET MINUTES."): moved from under the bottom CTA into the content, left-aligned under the panel it qualifies. Under the CTA it was centred over stone and cushion at the bottom of the mobile frame.

## 5. CTA width policy

- **Mobile:** the primary CTA stays bottom-anchored and near full width. This is the founder exception, and it matches the F01 runtime contract and thumb reach. At the bottom band on every F02 plate, the CTA sits on the stone ledge or cushion and covers no focal object: the window view, bust, book and bowl stay clear.
- **Tablet:** the CTA follows the content and takes the rail width. The previous 420 px cap crossed the ARRIVAL curtain.
- **Desktop:** unchanged, at the 420 px column width.

**Secondary actions** (SKIP FOR NOW): these used to be transparent text centred under the CTA, over the dark cushion (1.23:1 contrast). They are now a compact chip on the left grid, on the existing paper material: `rgba(249,246,239,.86)` with a hairline border. Measured contrast is ≥ 8.4:1. No scrim, no text-shadow, no photo darkening.

**START OVER**, NOT NOW and GO BACK keep the existing full-width paper secondary.

## 6. Icon + label rows

`JurnlChoice` gains two optional props:

- **`icon`:** renders `[ ICON ] [ LABEL ] [ MARK ]` as `grid-template-columns: auto minmax(0, 1fr) auto`. The icon has its own column, so a wrapped label never starts under it.
  - Previously the icon was passed as a child of `.jrn-row__copy`, a column flexbox. That stacked the icon above the label in 72 row renders across 3 viewports: CONNECT AN ACCOUNT, NAME AN ACCOUNT, and four cadence rows on F02.03 and on the ADD sheet.
- **`multi`:** gives checkbox semantics for pick-several groups (F02.05 priorities). The default stays radio.

Without `icon`, the markup is byte-identical to before, so F01's `JurnlChoice` uses are unchanged.

Other row fixes:

- **Short labels:** F02 rows use 11 px / 0.12 em tracking and 8 px gutters. Measured single-line at 360 × 780, 375 × 667, 393 × 852 and 430 × 932:
  - CONNECT AN ACCOUNT
  - NAME AN ACCOUNT
  - every cadence
  - every recap line
- **Consents:** same grid. The icon aligns to the label's first line, and the toggle centres on the row. The label is 10 px and the note is 9 px, both balanced. LINKED ACCOUNTS STAY OPTIONAL breaks into two intentional lines inside its column. Below 393 px, REMEMBER THIS SETUP also takes two lines, still beside its icon.
- **F02.08 voice:** a check glyph used to be prepended only to the selected row, which shifted that label sideways. It is removed; selection reads from the trailing mark, as on every other F02 selection row. The check icon stays on F02.ST.CONNECTED.
- **ADD ANOTHER:** the plus was passed as a child of the label span, so it touched the text with a 0 px gap. It now uses the `JurnlButton` icon slot: `[ + ] [ ADD ANOTHER ]` with an 8 px gap.
- **Icon size:** 15 px in `--jrn-ink-3`, so icons stay subordinate to the label.

## 7. JurnlDrawer decision: `PRESERVE_SHARED`

**Verdict:** `CORRECT_SHARED_PRIMITIVE`.

PERMISSION, ADD and SKIP are all `LIVE_PAPER_SHEET` in `F02_COMPONENT_ASSET_MAP.json`: one component with screen ids F02.IN.ADD, F02.IN.SKIP and F02.IN.PERMISSION. `JurnlDrawer` gives all three the same contract:

- `role="dialog"`, `aria-modal`, `aria-labelledby`
- focus moved inside, Tab containment, Escape and scrim close, focus returned on close
- short / long size

SKIP confirms a non-destructive choice ("NOTHING HERE IS LOST"), so `dialog` is correct and `alertdialog` would overstate it.

One defect was found in the primitive itself. It is fixed in place rather than split:

- **Defect:** `useOverlayFocus` read `ref.current` once on mount. An overlay that mounted a render later never got focus, Tab containment or Escape. This happens when the overlay host arrives after the first paint, for example `?overlay=` deep links or the F02.04 validation sheet. It affected 12 overlay renders.
- **Fix:** the hook now uses a callback ref stored in state, so containment attaches whenever the surface mounts. F01 drawers, sheets and modals share the hook and inherit the fix with no visual change.

## 8. Lockup and emblem decision

- **Emblem 001** is inside `F02_BRANDLOCKUP_JURNL_001.png` (sprig | JURNL). It is the only header mark on F02.00. There is no separate emblem or live wordmark beside it, and `object-fit: contain` at 42 px means no clipping. F02.00 RESUME uses emblem 011 plus the live wordmark, per the state contract.
- **Emblem 012** is inside `F02_BRANDLOCKUP_JURNL_SETUP_001.png` (rose plus "JURNL. SETUP."). It is the only header mark on the validation states.
  - Repair: the separate SETUP label is suppressed beside this lockup, because the lockup already reads SETUP.
  - Repair: its height is 52 px, so the emblem inside matches the 46 px sibling emblems and the wordmark is legible. Before, it was 42 px.
- Emblems 002–010 and 013 stay on their screens and states, unchanged. 13/13 botanicals, 2/2 lockups.

## 9. Shared components

The F02 family uses these shared pieces; no route is copied and pasted:

- **One `Frame` shell:** back, mark, SETUP plus progress, headline, helper, children, foot, CTA group.
- **Shared runtime primitives:** `JurnlScreen`, `JurnlChoice`, `JurnlToggle`, `JurnlInput`, `JurnlDrawer`, `JurnlErrorPanel`, `JurnlSuccessPanel`, `JurnlIconButton`.
- **One sheet component (`SkipSheet`)** for the three skip entry points.

The progress segments moved out of the top-right of the first row and onto the SETUP label row, on the left grid. Before, they sat over the photograph at x ≈ 300–370 on mobile.

## 10. Responsive architecture

| Viewport | Canvas | Rail | CTA |
|----------|--------|------|-----|
| 393 × 852 | full plate, `object-position 50% 50%` | per-plate, 170–228 px | bottom, near full width |
| 834 × 1194 | full plate, `object-position 56% 38%` | per-plate, 351–400 px, left at 72 | after content, rail width |
| 1440 × 900 | full plate, `object-position 62% 34%` | 420 px column at 72 | after content, column width |

The app-canvas contract is unchanged. `.jrn-screen` and `.jrn-col` keep their existing overflow rules. No new `overflow: hidden`, no `transform: scale()`, no masks.

The QA measures page scroll and column overflow on every route at every viewport:

- unintended page scroll: 0
- horizontal overflow: 0
- column scroll: 0

## 11. Interaction and accessibility repairs

**Family boundaries:**

- **F01 → F02:** F01.13 CONTINUE TO SETUP lands on F02.00 inside the same document and the same `.jrn` root. There is no reload, reset or shell break.
- **F02 completion:** F02.08 OPEN TODAY needs a voice. It then routes to `/today`, which on `main` is now the live F03.00 TODAY, built by a separate F03/F04 sprint. This sprint implements no F03. It only checks the hand-off and that the F02 shell is gone.

- **Resume:** CONTINUE SETUP used to overwrite the saved place with F02.01 before navigating. A second resume landed on F02.01. It now keeps the saved place.
- **F02.05 priorities:** exposed as checkboxes in a labelled group. Pick-several was previously announced as radio.
- **Labelled radiogroups:** account source (F02.02) and the ADD sheet cadence.
- **Field errors:** linked with `aria-describedby`, in addition to the `role="alert"` announcement.
- **READ THE BOUNDARY:** now has `aria-controls`. Its panel is hidden, not unmounted.
- **F02.04 validation sheet** (design-workspace state): it can now be closed, and its error clears once a name is typed.

The QA journey (18/18) proves all of this on the real runtime. See the deferred-debt note on radiogroup arrow keys.

## 12. Deferred debt

None of these block founder review.

- **Radiogroups:** every option is its own tab stop; there is no arrow-key roving focus. This is functional and keyboard-complete, but not the full ARIA radio pattern. It is shared with F01's `JurnlChoice`, so it is deferred to a cross-family primitive pass.
- **Overlays on tablet/desktop:** they stay centred modal sheets (560 / 520 px) over a scrim, inherited from F01. They are modal surfaces, not content-rail content.
- **JURNL wordmark beside emblems:** the live `.jrn-setup__word`, in rose ink, measures 2.9–3.6:1 on the plaster. It is a logotype, which WCAG 1.4.3 exempts. It is reported in the QA, not gated.
- **F01 viewport-delivery QA** (`scripts/jurnl/viewport-delivery-qa.ts`) reported 119/163 on `main`, with the same failures before this sprint's changes. The script predated two later sprints:
  - The F01 raster plates (#1339): its SCREEN audit rejected any full-bleed `<img>`.
  - The live F02 family (#1353): its F01 → F02 check waited for the old boundary placeholder.

  This sprint updated the script:
  - The canonical `ENTRY.ENVIRONMENT.*` plate is accepted as the one large image.
  - The F01.13 → F02 check expects the live F02.00.

  It now reports 163/163 on this branch. F01 pixel parity is proven separately by a 42-capture diff against `main`: 40 identical; 2 differ only by noise that `main` reproduces on recapture.

## 13. Follow-up: no text near the white curtain

**Founder note:** on some child screens the text came close to the white curtain. Nothing may touch it, brush it, or crowd it.

**Cause:** the single rail measured the curtain at the panel band. The ARRIVAL and DESK sheers lean LEFT toward the top of the frame. Measured clearance before this fix:
- ARRIVAL headline and helper on a phone: −1 to −2 px (they reached the fringe).
- F02.01 helper on tablet: 10 px.
- F02.01 rows on tablet: the rows overlapped the sheer by up to 36 px.

**Repair:**
- **Traced edges.** Each plate's environment edge is traced per plate height, in `scripts/jurnl/f02-plate-edges.mjs`, and mapped through the plate's own crop.
- **Two rails.**
  - Head rail: mark, SETUP row, headline and helper. It uses the edge where the curtain sits furthest left and keeps type 32 px clear on a phone, 48 px on tablet.
  - Body rail: panels, rows and fields. It keeps the paper 20 px clear on a phone, 36 px on tablet.
- **Phone headline 34 → 32 px.** This is the small adjustment the founder offered. Authored lines never wrap. On a narrower phone, `useFittedHeadline` steps the headline down, never below 24 px.
- **ARRIVAL phone crop: `0% 50%`.** The crop now opens on the plaster wall, which moves the curtain ~43 px right. The arch and sea stay in frame, and the half-cut bust at the far edge leaves it.

**Measured minimum clearance after the repair:**

| Plate | Phone type | Phone paper | Tablet type | Tablet paper |
| --- | --- | --- | --- | --- |
| ARRIVAL | 50 px | 25 px | 92 px | 47 px |
| DESK | 50 px | 26 px | 107 px | 47 px |
| EDIT (leaves) | 33 px | 42 px | 207 px | 114 px |
| QUIET | 45 px | 20 px | 77 px | 66 px |

Desktop clearance is 200 px or more on every plate. Per-screen values are in `F02_CONTENT_RAIL_MAP.json`.

## 14. Global JURNL interactive-text containment

**Implementation:** `useCompactFit()` (in `primitives.tsx`) runs the founder's compact-fit order on every JURNL clickable label: `JurnlButton`, standalone `JurnlTextLink`, `JurnlChoice` and clickable `JurnlRow`. The order is:

1. a modest size step (≤ 1 px);
2. tracking, down to 0.08 em;
3. size, down to the 10 px floor;
4. a controlled, balanced wrap.

Labels that already fit are left untouched.

**Underlines:** link underlines are now `text-decoration`, so the rule follows the words on every line. Before, a `border-bottom` on a flex-item span drew a full-width rule under a wrapped label.

**Results:** the full audit is `scripts/jurnl/interactive-text-qa.mjs`, with its report in `JURNL/MANIFEST/JURNL_INTERACTIVE_TEXT_QA.json`. 1,128 labels across F01–F16 at all three viewports pass, with INTERACTIVE_TEXT_CONTAINMENT_DRIFT = 0. The F02 typography map carries the `interactive_text_*` fields.
