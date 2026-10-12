# FNDATN-01 — Email client compatibility report

**Scope: static analysis and headless browser rendering only.** No live email-client test (Litmus, Email on Acid, or real Gmail, Outlook, or Apple Mail inboxes) has been run. No email has been sent. Live client status is **NOT TESTED**.

## Static scan of send-mode output

Rendered with `mode: 'send'`, an absolute https asset base, and the disposable fixtures.

| # | Bytes | Images | Missing alt | Missing width | Relative src | Non-https href | `<script>` | MSO blocks |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 | 40,382 | 9 | 0 | 0 | 0 | 0 | no | 9 |
| 02 | 37,200 | 10 | 0 | 0 | 0 | 0 | no | 9 |
| 03 | 43,102 | 13 | 0 | 0 | 0 | 0 | no | 9 |
| 04 | 39,566 | 9 | 0 | 0 | 0 | 0 | no | 9 |
| 05 | 46,252 | 18 | 0 | 0 | 0 | 0 | no | 9 |
| 06 | 34,913 | 15 | 0 | 0 | 0 | 0 | no | 7 |
| 07 | 48,303 | 12 | 0 | 0 | 0 | 0 | no | 9 |

- Every email is under Gmail's 102 KB clipping threshold. `tests/fndatn01.test.ts` enforces this.
- There is no flexbox, grid, or absolute positioning. Layout uses nested `role="presentation"` tables with inline styles.
- Send mode rejects any non-https asset base. All personalized values are HTML-escaped (also tested).

## Techniques

| Concern | Implementation | Expected behaviour (not live-verified) |
| --- | --- | --- |
| Outlook desktop (Word engine) | VML `v:rect` bulletproof buttons; VML `v:fill` hero backgrounds; `mso-line-height-rule:exactly`; `mso-hide:all` on mobile-only blocks | Hero art and buttons render; web fonts fall back to Arial |
| Gmail web and app | Inline styles on every element; one `<style>` block (~4 KB) for media queries | Gmail supports `<style>` in `<head>` but **not `@font-face`**: type falls back to Arial Narrow or sans-serif condensed metrics |
| Apple Mail / iOS | `@font-face` for Saira Semi Condensed and SITE 00 Display; `x-apple-data-detectors` reset | Closest to the authority |
| Mobile (≤480px) | `.desk-only` / `.mob-only` swaps, stacked columns, full-width buttons | Clients without media query support (some Gmail IMAP accounts) show the desktop layout scaled down |
| Dark mode | `color-scheme: light only`; `[data-ogsc]` / `[data-ogsb]` ink and red locks | Outlook.com and Gmail app may still partially invert backgrounds; not verified |
| Images off | Alt text on every image; headline, ledger, and CTA are live text | Content stays readable without images |
| Preheader | Hidden preheader per email | — |

## Fonts

- Body: `Saira Semi Condensed`, served from `public/site00-correspondence-studio/fndatn-01/fonts/`.
- Display, headers and editorial numbers: `SITE 00 Display`, traced from the founder specimen, served from `public/site00-correspondence-studio/fndatn-01/fonts/site00-correspondence-display.woff2`.
- Clients that ignore `@font-face` (Gmail, Outlook desktop) render fallback stacks. This is the largest expected visual difference from the authority outside Apple Mail.

## Known gaps before any live send

1. No live client test. Run a Litmus or Email on Acid pass before enabling any journey.
2. The sender address is not registered. Review previews show `SENDER ADDRESS PENDING REGISTRATION`, and the reply-to copy depends on a real mailbox.
3. Send mode needs a production asset origin for `/site00-correspondence-studio/fndatn-01/assets/`.
4. Dark-mode inversion in the Gmail app and Outlook.com is unverified.
