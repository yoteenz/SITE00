# Email V2 R3 — typographic authority

## Verified faces

| Role | Face | Weights | Licence | Status |
|---|---|---|---|---|
| Display (headlines, pulls, numerals, lockups) | **Barlow Condensed** | 900 Black, 800 ExtraBold | SIL OFL 1.1 | Verified from the shipping DF client stylesheet |
| Body and every SITE 00 text role | **Saira Semi Condensed** | 400, 500, 600, 700 | SIL OFL 1.1 | Sprint authority; already the body face of R1 and R2 |

### Display face: evidence

The approved Digital Foundation client headline face is set in code, not guessed:

- `src/site00/styles/site00-df-client.css` declares `@font-face { font-family: 'SITE00 DF Display' }` at weights 800 and 900,
  loading `/site00/fonts/barlow-condensed/barlow-condensed-800.woff2` and `…-900.woff2`.
- The same file sets `--df-display: 'SITE00 DF Display', 'Barlow Condensed', 'Arial Narrow', sans-serif;`.
  `.df-headline` uses `var(--df-display)` at weight 900, `line-height: 0.81`, `letter-spacing: 0`, uppercase.
- `docs/site00/idnty/SITE00_DIGITAL_FOUNDATION_CLIENT_BOARD_01_02_V1.md` (Board 01 + 02, commit `19fd19c0`) records:
  "Barlow Condensed Black was chosen over Anton (tried first) because it matches the board headline's proportions better."
- The same document, deviation VM-09: "Display face is Barlow Condensed Black, close to but not identical to the board's face…
  the board face is not identified."

So the implemented and approved header face is **Barlow Condensed Black (900)**, aliased in CSS as `SITE00 DF Display`.
The original authority-board raster used a face that was never identified. R3 does not claim to match that raster face; it
matches the face the founder approved in the live DF client.

Martian Mono is not the display face. In this repository it is the console and admin monospace
(`--site00-font-mono` in `site00-brand-family-skin.css`, `site00-client-app.css`). R3 does not use it.

The R3 woff2 files are byte copies of `public/site00/fonts/barlow-condensed/barlow-condensed-{800,900}.woff2`, with the OFL
text alongside (`scripts/df-email-v2-benchmark/r3/fonts/`). They cover Latin, the middle dot, the en and em dash, curly quotes and ±.
They do not contain → (U+2192), so every arrow inside a display line is set in Saira (`.arr`).

## Role system

| Role | Face | Size | Tracking | Leading | Where |
|---|---|---|---|---|---|
| Display headline | Barlow Condensed 900 | 62–76px desktop, 46–54px mobile | −0.004em | 0.86 | B01 request, B03 headline, B03 reveal |
| Display lockup (image) | Barlow Condensed 900 | fitted to the 544px measure | −0.01 to +0.004em | 0.74–0.86 | B02 GROUNDWORK, B03 BLDR nameplate |
| Display pull / stage name / numerals | Barlow Condensed 800 | 24–64px | +0.004em | 0.8–0.98 | Pull quotes, schedule, stations, sign-off |
| Intro / lede | Saira 500 | 20px (18px mobile) | +0.012em | 1.42 | First paragraph of each email |
| Body | Saira 400 | 15px | +0.028em | 1.64 | Letter and feature text |
| Section head | Saira 600 | 11.5px | +0.26em | 1.4 | WHAT'S NOW IN PLACE, station labels |
| Micro label | Saira 600 | 10px | +0.30em | 1.45 | Letterhead, PREPARED FOR, DATUM, plan labels |
| Caption / footer | Saira 500 | 10.5px | +0.10–0.14em | 1.6 | FIG. 01, ILLUSTRATIVE PLANS, footers |
| Annotation / printed link | Saira 400 | 11px | +0.10em | 1.55 | Printed foundation link |
| Call to action | Saira 700 | 13px | +0.20em | 1 | Buttons |

Tracking rises as size falls: display is set tight (it carries the voice), labels open wide (they are read as marks, not
words). Body tracking stays slightly open because all SITE 00 copy is uppercase.

## Case

All SITE 00-authored copy is written in literal uppercase in the HTML, not only through `text-transform`, so it survives
clients that drop CSS. Client values and machine strings keep their own case: business name, email address, domain, URL,
public token and the `{{preference_url}}`, `{{unsubscribe_url}}`, `{{postal_address}}` tokens (`.v`, `.url`, `.tok`).
`qa_r3.mjs` checks every visible text node for this.

## Fallback stacks

```
Display: 'Barlow Condensed', 'Arial Narrow', 'Helvetica Neue', Arial, sans-serif
Body:    'Saira Semi Condensed', 'Arial Narrow', Arial, sans-serif
```

Wrapping was tested with web fonts blocked (`render.mjs`, FALLBACK runs). On the test machine the only available fallback is
Liberation Sans (Arial metrics), which is wider than Arial Narrow, so it is the conservative case. Every email at 390, 768
and 1024 renders with no horizontal overflow and no element escaping the 640px column. The live headlines wrap one line
longer than with Barlow.

## What is an image

Only two display moments are images: the B02 GROUNDWORK lockup and the B03 BLDR nameplate. Each is sized to the face's width,
and a fallback face would overflow a phone at that size. Each ships with its exact words as alt text, and neither carries
information found nowhere else in the email. Every other headline, pull, numeral, label, personalization, link and button is
live HTML text. No email is rasterized whole.

## Production font hosting

The review builds load fonts from relative paths. For a real send, host the same woff2/ttf files on a CDN and reference them
with `@font-face` (Apple Mail and iOS Mail honour it). Gmail and Outlook desktop do not load web fonts and will use the
fallback stacks above, which is what the FALLBACK renders show. That is a prediction from known client behaviour, not a
client test. No Gmail, Outlook or Apple Mail test has been run.
