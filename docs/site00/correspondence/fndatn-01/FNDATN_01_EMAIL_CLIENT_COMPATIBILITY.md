# FNDATN-01 — Email client compatibility report

**Scope: static analysis and headless browser rendering only.** No live email-client test (Litmus, Email on Acid, or real Gmail, Outlook, or Apple Mail inboxes) has been run. No email has been sent. Live client status is **NOT TESTED**.

## Static scan of send-mode output

Rendered with `mode: 'send'`, an absolute https asset base, and the demo scenarios re-keyed as live records (send mode refuses demo payloads).

| # | Bytes | Images | Missing alt | Missing width | Relative src | Non-https href | `<script>` | MSO blocks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | 43,579 | 9 | 0 | 0 | 0 | 0 | no | 9 |
| 02 | 41,730 | 10 | 0 | 0 | 0 | 0 | no | 9 |
| 03 | 54,266 | 13 | 0 | 0 | 0 | 0 | no | 9 |
| 04 | 42,842 | 9 | 0 | 0 | 0 | 0 | no | 9 |
| 05 | 42,065 | 18 | 0 | 0 | 0 | 0 | no | 9 |
| 06 | 37,661 | 15 | 0 | 0 | 0 | 0 | no | 7 |
| 07 | 58,493 | 12 | 0 | 0 | 0 | 0 | no | 9 |

- Every email is under Gmail's 102 KB clipping threshold. `tests/fndatn01.test.ts` enforces this.
- There is no flexbox, grid, or absolute positioning. Layout uses nested `role="presentation"` tables with inline styles. The quote, intake and receipt card fields are positioned on the hero art with table padding and fixed row heights.
- Send mode rejects any non-https asset base. All personalized values are HTML-escaped (also tested).

## Techniques

| Concern | Implementation | Expected behaviour (not live-verified) |
| --- | --- | --- |
| Outlook desktop (Word engine) | VML `v:shape` pentagon buttons (angled edge); VML `v:fill` hero backgrounds; `mso-line-height-rule:exactly`; `mso-hide:all` on mobile-only blocks | Hero art and buttons render; web fonts fall back to Arial |
| Gmail web and app | Inline styles on every element; one `<style>` block (~4 KB) for media queries | Gmail supports `<style>` in `<head>` but **not `@font-face`**: type falls back to Arial Narrow or sans-serif condensed metrics |
| Apple Mail / iOS | `@font-face` for Saira Semi Condensed and Barlow Condensed; `x-apple-data-detectors` reset | Closest to the authority |
| Mobile (≤480px) | `.desk-only` / `.mob-only` swaps, stacked columns, full-width buttons | Clients without media query support (some Gmail IMAP accounts) show the desktop layout scaled down |
| Dark mode | `color-scheme: light only`; `[data-ogsc]` / `[data-ogsb]` ink and red locks | Outlook.com and Gmail app may still partially invert backgrounds; not verified |
| Card fields on the art | Live text in table rows over a background-image cell; the art is locked at its design size (`lock`) so the text stays on the card; the card's perspective is per-row indents; its tilt is a CSS `transform` on its own wrapper | Tilt shows in Apple Mail / iOS (WebKit) and Chromium. Clients that drop `transform` (Gmail, Outlook) show the same rows level, on the card. Verified in Chromium with and without transforms; not verified in a live client |
| Mobile card heroes | The art and its text are locked together at 390 px: centred on wider phones, left-anchored and cropped on the right (scene only) below 390 px | Verified at 360, 390 and 430 px in Chromium |
| CTA buttons (angled edge) | Style 02 of the SITE 00 interface elements: filled body, label, divider, arrow, pointed tip. Built from table cells; the tip is white border triangles cutting the corners of a 17 px cell, so it needs no image and survives images-off. A wrapped label blunts the tip rather than notching it | Verified in Chromium at 760 / 360 / 390 / 430 px, with and without web fonts (`artifact-data-qa/cta-angled-edge.jpg`). The tip assumes the white CTA band behind it |
| Images off | Alt text on every image; headline, card fields and CTA are live text; card heroes fall back to a white cell | Content stays readable without images |
| Preheader | Hidden preheader per email | — |

## Fonts

- Body: `Saira Semi Condensed`, served from `public/site00-correspondence-studio/fndatn-01/fonts/`.
- Display: `Barlow Condensed`, served from the existing `public/site00/fonts/barlow-condensed/`.
- Clients that ignore `@font-face` (Gmail, Outlook desktop) render fallback stacks: `Arial Narrow`, `Roboto Condensed` / `sans-serif-condensed` (Android), `Impact` for display type, then Arial. This is the largest expected visual difference from the authority outside Apple Mail.
- Measured with web fonts blocked (Arial metrics): desktop hero copy grows past the 300 px art by 5 to 24 px on 01, 02, 05, 06, 07 (white below a locked card hero, art rescaled on the others), and the 03 recommendation value crosses the card's printed rule by up to 19 px. Card fields stay on the card. See `artifact-data-qa/qa-report.json`.

## Known gaps before any live send

1. No live client test. Run a Litmus or Email on Acid pass before enabling any journey.
2. The sender address is not registered. Review previews show `SENDER ADDRESS PENDING REGISTRATION`, and the reply-to copy depends on a real mailbox.
3. Send mode needs a production asset origin for `/site00-correspondence-studio/fndatn-01/assets/`.
4. Dark-mode inversion in the Gmail app and Outlook.com is unverified.
