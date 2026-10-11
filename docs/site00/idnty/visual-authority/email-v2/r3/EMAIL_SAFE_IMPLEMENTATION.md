# Email V2 R3 — email-safe implementation notes

## Structure

- One 640px `role="presentation"` table per email, `align="center"`, with fixed-width cells (`width` attribute plus inline
  `width` style). Every layout move — the doorway beside the headline, the schedule, the stations, the diptych, the plans — is
  rows and cells.
- No JavaScript, no `position`, no floats for layout (the B01 aside is a right-aligned table), no CSS grid or flexbox inside the
  message, no background video, no WebGL. `qa_r3.mjs` fails on any script or absolute/fixed element inside the message.
- A hidden preheader cell repeats the contract preheader.
- Review chrome (the grey stage and the inbox card) sits outside the message table. `build_emails.py` strips it, plus the sample
  styling and anything wrapped in `<!--REVIEW-->`, from the send templates.

## Responsive

- Embedded `<style>` with one breakpoint, `@media (max-width: 480px)`:
  `.col` cells stack (`display:block; width:100%; box-sizing:border-box`), `.px` cells drop to 24px gutters, `.desk` hides
  and `.mob` shows (desktop doorway column → wide door band; GROUNDWORK and BLDR lockups → stacked mobile lockups; slab and
  cover → mobile crops), and display sizes step down.
- Clients that ignore embedded CSS (some Gmail app and account combinations, older Outlook) keep the 640px desktop layout.
  `.mob` blocks carry `display:none; max-height:0; overflow:hidden; mso-hide:all` so they stay hidden there.
- Rendered and checked at 390, 768 and 1024 wide, with and without web fonts (`render.mjs`): no horizontal page overflow and no
  element outside the 640px column in any of the 18 renders. Report: `qa/render_report.json`.

## Production pipeline (before any send)

1. Inline the CSS (juice or the ESP's inliner). Keep the `<style>` block for the media query.
2. Host images and fonts on a CDN and replace `{{asset_base}}` / `{{font_base}}` in the send templates with absolute URLs.
3. Add VML for Outlook where a cell carries a background image (B01 red-glass sliver). Without it Outlook shows the
   `bgcolor` red, which is the intended fallback.
4. Map the template tokens to the ESP's merge syntax: `{{business_name}}`, `{{recipient_email}}`, `{{public_token}}`,
   `{{preference_url}}`, `{{unsubscribe_url}}`, `{{postal_address}}`.
5. B03 only: wait for the BLDR walk-through route and for `unsubscribe_url` and `postal_address` to enter the contract.
6. Test in real clients (Gmail web and app, Outlook desktop and web, Apple Mail macOS and iOS) with images on and off.
   **None of that has been done.** No client-fidelity claim is made.

## Images

| Kind | Format | Notes |
|---|---|---|
| Photographs | JPG (PNG where the plate has transparency-free white needed for the slab) | Reused crops; 2x where the source allows |
| Icons | Transparent PNG at 2x (96px for a 48px mark) | SVG source in `r3/graphics/icons/` |
| Devices (seal, plans, annotated interior) | PNG/JPG at 2x | SVG source in `r3/graphics/devices/` |
| Display lockups | PNG at 2x | `lockups.html` source; exact words in alt |

Inline SVG is not used in the message: Gmail and Outlook do not render it reliably. Every image has an `alt` attribute;
decorative marks use `alt=""`. With images off, every sentence of copy, every heading except the two lockups (whose alt text
reads the same words), every link and both buttons remain.

## Links

| Email | Action | href |
|---|---|---|
| B01 | BEGIN YOUR FOUNDATION → | `https://site00.com/foundation/{{public_token}}?step=intake` |
| B02 | VIEW YOUR FOUNDATION | `https://site00.com/foundation/{{public_token}}` |
| B03 | TAKE A WALK THROUGH BLDR → | `#bldr-route-pending` (route does not exist yet) |
| B03 footer | MANAGE PREFERENCES / UNSUBSCRIBE | `{{preference_url}}`, `{{unsubscribe_url}}` |

Buttons are padded `<a>` elements inside a `bgcolor` cell, so the whole button is clickable and Outlook still draws the ink fill.

## Weight

Review HTML is 14–16 KB per email (below Gmail's ~102 KB clipping threshold after inlining). Images total about 1.1 MB (B01),
1.0 MB (B02) and 1.0 MB (B03) at 2x; compress before send.
