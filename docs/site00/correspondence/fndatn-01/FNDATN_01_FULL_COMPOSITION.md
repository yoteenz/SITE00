# FNDATN-01 — Full email header, footer, typography and spatial convergence

Sprint `P0.SITE00.CORRESPONDENCE.FNDATN-01.FULL-EMAIL-HEADER-FOOTER-TYPOGRAPHY-AND-SPATIAL-CONVERGENCE1`. Review route `/admin/site00/correspondence-studio` (pack FNDATN-01, view Compare).

## Source of truth

The 14 founder authorities in `public/site00-correspondence-studio/fndatn-01/authority/<email>/{desktop,mobile}.jpg`, byte-identical to the founder upload `SITE00_FNDATN_7_EMAILS_UNDER_4MB.zip` (checked by SHA-256). No current render and no R1–R4 composition was used as a target.

**Missing asset, reported, not substituted:** there is no official SITE 00 wordmark file in the repository. `public/site00-correspondence-type-authority/v1/08_AUTHORITY/wordmark.json` records `official_logo_file: null`; the official mark is CSS text in a different face (Martian Mono). The emails keep SITE 00 as live text in the display face traced from these references (`SITE 00 Display`, on `main`), set at each reference's measured size and tracking.

**Typography baseline:** `main` now carries the traced `SITE 00 Display` face, red display marks and the +2 px headline bump (Cursor PRs #1617/#1619). They are kept; this sprint changes geometry, not glyphs. Grok's separate, unmerged typography work is untouched.

## Differences recorded before changing anything

| Area | Reference | Previous render |
| --- | --- | --- |
| Masthead | One compact line, ~32 px at 680: wide-tracked wordmark, hairline divider, two-line service label, red strokes, four-word list, divider, grey sign-off | 68 px tall; tight wordmark tracking; loose list leading; mobile was the desktop block squeezed |
| Labels | Per email (05 desktop ORDER COMPLETE; 03/04/05 mobile variants) | 05 desktop said ORDER COMPLETE & DELIVERED; mobile variants missing |
| Footer | Colophon: top rule, wordmark, DIGITAL FOUNDATION / tagline, centre divider, classification block; mobile keeps one row (04 has its own variant) | Taller; classification right-justified; mobile stacked into two blocks; 04 desktop used the mobile wording |
| Hero | Headline lines nearly touching; body a narrow ~33-character column | Looser headline leading; body twice the relative size on a wide measure, running into the objects |
| Bands | Compact, ~65 px; marker grammar per email (number→icon, icon→number, icon only) | ~150 px; one grammar for all |
| Mobile sections | 05/06/07: a white panel starting over the hero, CTA inside it; 03 title and description side by side; 07 icons only | Flat full-width rows after the hero; separate CTA blocks |
| 04 mobile | Receipt directly under the hero copy; CTA OPEN YOUR PROJECT | Empty band of sky above the receipt; OPEN YOUR FOUNDATION with caption |

## What changed

- **Masthead** (`layout.ts` `mast`): desktop and mobile are separate blocks, each measured from its reference. Wordmark 18 px / .27 em (desktop) and 22 px / .25 em (mobile); service labels .3 em; red strokes; list; sign-off with the short rule on 01/02. Microcopy lines are blocks with exact leading. Height 46 px desktop, 52 px mobile (reference ≈ 32 / 41 px; type is ~1.5x the reference for legibility).
- **Footer** (`foot`): top hairline, wordmark 14.5 px / .19 em, label pair, centre divider at the reference's x, classification as a left-aligned block on the right. Mobile is one row with a three-line classification; 04 mobile has its authority variant. Design microcopy only: no address, contact or legal claim is invented. The emails are transactional; the reference's "SERVICE NOTICE. NO MARKETING UNSUBSCRIBE." is kept as written.
- **Hero**: headline leading 0.9 (reference) on the traced face; desktop body 9.5 px on a ~34-character measure, per-email where the art is closer (01, 02, 07).
- **Bands** (`deskBand`): compact (112 px art cell), marker grammar per email: 01/02/04 number→icon, 03/05 icon→number, 07 icon only.
- **Mobile sections** (`mobileRows`, `panelHead`, `mobileHero({ lip })`): compact rows; 03 inline; 07 icons only. 05/06/07 panels start over the hero, email-safe: the hero's last rows are a second cell drawn with the same locked art, carrying the panel head; rows and the CTA continue in an inset white panel. No negative margins or absolute positioning.
- **Add-ons** (03/07): desktop keeps its line; on mobile it moves into the panel as one quiet line (the mobile references show none).
- **04 mobile**: hero cut to its copy so the receipt follows directly; CTA OPEN YOUR PROJECT, no caption (as referenced).
- **Subject / preheader**: the real values travel in the delivery contract (`render` returns `subject` and `preheader`; the hidden preheader is the first text in the message). The 01 preheader now matches the art board exactly. The art board's SUBJECT / PREHEADER strip is review metadata and is not rendered as client content; the studio shows both in its inspector.
- **Main bug fixed on the way**: `main` escaped band item fields, which printed literal `<br>`/`<span>` tags in 05 and 06. Band items are now plain text with structured value / tone fields; a test guards every preview.

## QA acceptance matrix

Evidence: `composition-qa/reference-vs-render-<device>-<email>.jpg` (each reference beside the live render at the same width), `composition-qa/{mast,foot}-{desktop,mobile}.jpg` (all seven, reference over render), `composition-qa/studio-compare-01-mobile.png`, `composition-qa/qa-report.json` (`qa-artifact-data.ts`: 760 / 360 / 390 / 430 px, web fonts, fallback fonts, transforms stripped).

| Email | Header | Hero type | Body | Artifact | CTA | Footer | Mobile reflow | Demo data | Email-safe fallback |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 01 Invitation | PASS | PARTIAL | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 02 Intake received | PASS | PARTIAL | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 03 Recommendation | PASS | PARTIAL | PARTIAL | PASS | PASS | PASS | PASS | PASS | PARTIAL |
| 04 Payment | PASS | PARTIAL | PASS | PASS | PASS | PASS | PARTIAL | PASS | PASS |
| 05 Complete | PASS | PARTIAL | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 06 Resume intake | PASS | PARTIAL | PASS | PASS | PASS | PASS | PASS | PASS | PASS |
| 07 Quote expiry | PASS | PARTIAL | PASS | PASS | PASS | PASS | PASS | PASS | PARTIAL |

- Hero type PARTIAL everywhere: the traced display face is narrower than the reference lettering (e.g. FOUNDATION ≈ 70% of the reference width at the same cap height). Matching it would mean altering glyphs (not approved) or CSS scaling (fragile); neither was done.
- 03 body PARTIAL: the add-ons line has no place in the reference composition; it stays because it is real quote data.
- 04 mobile PARTIAL: the reference sets the whole mobile email as an inset column on grey; ours is full width.
- 03 / 07 fallback PARTIAL: without web fonts, the 03 recommendation value crosses the card's printed rule (≤ 19 px) and its long CTA label wraps at 360 px (tip blunts); 07 mobile hero grows 4 px. Every web-font and no-transform check passes (64 / 64); with fonts blocked 25 / 32.

## Unresolved deviations

1. Microcopy, body and band type are ~1.5–2x the reference relative to the art, for legibility at a 680 / 390 px canvas; components are correspondingly taller than the reference (masthead 46 vs ≈ 32 px).
2. Display glyph width (above).
3. No official wordmark asset exists; live traced lettering is used.
4. 04 mobile is full width rather than an inset column.
5. 06 shows no PAYMENT RECEIVED step (the reference's step is not encoded: payment is not part of resuming an intake).
6. Fallback-font residuals on 03 and 07 (above). No live client (Gmail, Outlook, Apple Mail) test has been run.
