# FNDATN-01 — Dynamic artifact data and visual composition recovery

Sprint `P0.SITE00.CORRESPONDENCE.FNDATN-01-DYNAMIC-ARTIFACT-DATA-AND-VISUAL-COMPOSITION-RECOVERY1`. Review route `/admin/site00/correspondence-studio`. Authority: the 14 founder references under `public/site00-correspondence-studio/fndatn-01/authority/`.

## Root cause

Two causes, both confirmed in the code and the assets (not inferred):

| Cause | Evidence |
| --- | --- |
| **A. The artwork was extracted with the card fields erased.** | `scripts/correspondence-studio/fndatn01/extract_assets.py` lists a `quads` region per card (`HEROES[...]['quads']`) and inpaints it. `assets/01_invitation/hero-desktop.jpg` shows the invitation card with its CLIENT / SERVICE / STATUS / ACCESS block blank; the same holds for 02, 03, 04 and 07 on desktop and 01, 02, 03 and 07 on mobile. The scope tags printed beside the 03 and 07 fields were erased with them. This part was correct: personal data must not be baked into images. |
| **D. The compositions sent the data to a generic grid below the art.** | `emails.ts` passed every card field to `ledger()` in `layout.ts` ("live mirror of the card fields that were cleared from the artwork"), a paper-coloured table placed after `desktopHero` / `mobileHero`. Nothing put the values back on the card. |

Not the cause: the data. Every field was derived and present (`contracts.ts`, the fixtures); it was rendered in the wrong place. The invitation overlap was a separate sizing issue: the mobile hero copy was set about 25% larger and wider than the authority with no height budget, so on 01 the body ran into the card's header (and on 06 into the laptop).

## Fix

`shared/site00-correspondence-studio/fndatn01/cards.ts` puts the fields back on the paper as live, escaped HTML text.

- **Geometry from the authority.** `CARD_SPECS` holds, per card and device, the first and last label positions, the value column, the card's printed rule, and the tilt, measured in CSS px of the hero by pushing each authority JPEG through the same crop and scale `extract_assets.py` uses (`scripts/correspondence-studio/fndatn01/qa-artifact-data.ts` draws the same crops).
- **Email-safe positioning.** Table padding places the block; fixed row heights set the pitch; per-row indents follow the card's perspective. No absolute positioning.
- **Tilt as enhancement only.** The rotation is a CSS `transform` on a wrapper of its own. Where a client drops it (Gmail, Outlook), the same rows sit level on the card. Both states are captured.
- **Art locked to the text.** Card heroes draw their background at a fixed size (`bgCell({ lock })`) instead of `cover`, so taller copy (fallback fonts) or a different phone width cannot slide the art under the fields. On mobile the art and its text are locked together at 390 px: centred on wider phones, left-anchored and cropped on the right (scene only) below 390 px. The Outlook VML fill draws the same fixed frame.
- **Values fit the card.** Long values step down in tracking, then size (to 85%), to stay inside the card's printed rule; long labels tighten their tracking to keep a gap before the value.
- **Generic grids removed.** `ledger()` is gone. 05 (gift box, no data card in the art) and 06 (laptop) carry no card layer.
- **Copy fit.** Each mobile hero now has a copy zone that ends above the card or object (`MobileCopyFit`), with headline size and measure set to the authority's column. The mobile tagline renders where the authority prints it (03 and 06 under the body, 07 beside the card), which also covers the inpainted area the old layout left visible. Desktop body copy on 02 and 07 stops short of the crystal; 07 drops its desktop tagline over the book stack, as 02 already did.

### Field map

| Email | Artifact | Fields on the card (authority order) | Notes |
| --- | --- | --- | --- |
| 01 Invitation | Invitation card, desktop + mobile | CLIENT · SERVICE · STATUS (red) · ACCESS (red) | CLIENT omitted when the record has no name |
| 02 Intake received | Intake confirmation card, desktop + mobile | CLIENT · SERVICE · STATUS (red) · RECEIVED · REFERENCE | RECEIVED from the persisted `INTAKE_COMPLETED` event |
| 03 Recommendation & quote | Quote card, desktop + mobile | CLIENT · SERVICE · RECOMMENDATION · QUOTE · VALID UNTIL · NEXT STEP; scope tags | NEXT STEP is a red link to the client page on desktop, red text on mobile, as printed. RECOMMENDATION omitted when the record has no title. The authority's "$500.00" and "30 DAYS" are not used: the real quote and its real expiry are |
| 04 Payment received | Receipt card, desktop; torn receipt, mobile | CLIENT · SERVICE · AMOUNT · DATE · [PAYMENT METHOD] · REFERENCE · STATUS (red) | PAYMENT METHOD only when the payment event carries `method_label` (no backend writes it today, so it is omitted). REFERENCE, not "RECEIPT NO.": the value is the quote id |
| 05 Complete | No data card in the art | — | The name stays in the kicker; per-item values in WHAT'S INCLUDED |
| 06 Resume intake | No data card in the art (laptop) | — | No payment step anywhere (the authority's PAYMENT RECEIVED step is not encoded) |
| 07 Quote expiry | Quote card, desktop + mobile | CLIENT · SERVICE · QUOTE · ISSUED · VALID UNTIL (red, date) · STATUS (red); scope tags | The countdown keeps the exact expiry time from the backend; no JavaScript countdown |

### CTA buttons

Every CTA uses the angled-edge button (style 02 of the SITE 00 interface elements): a filled body with the label, a thin divider and an arrow, ending in a pointed tip, in red (ink for the 02 mobile intake button). `button()` in `html.ts` builds it from table cells; the tip is two white border triangles cutting a 17 px red cell, meeting in a point at the designed 46 px. Outlook draws the same pentagon as a VML `v:shape`. Only the label link is exposed to assistive technology. Long labels (03) tighten their tracking; below 390 px all labels step down to fit on one line. Evidence: `artifact-data-qa/cta-angled-edge.jpg`.

## Demo scenarios

One centralized, typed, nonproduction timeline in `fndatn01/fixtures.ts`: a fictional client (`Jordan Avery`, `Avery Studio`, `.invalid` addresses, `demo` ids, a token that resolves to nothing), one artifact, one quote ($1,334.00 USD), seven snapshots.

| Scenario | Email | Viewed at (ET) | State |
| --- | --- | --- | --- |
| `INVITED` | 01 | Sep 28, 10:05 AM | Invited, intake not started |
| `INTAKE_IN_PROGRESS` | 06 | Oct 1, 10:00 AM | Opened Sep 29, saved Sep 29 9:42 AM, no quote, no payment |
| `INTAKE_SUBMITTED` | 02 | Oct 2, 12:25 PM | Intake completed Oct 2, 12:24 PM |
| `QUOTE_READY_UNPAID` | 03 | Oct 5, 10:05 AM | Quote issued Oct 5, valid until Oct 19, 11:59 PM |
| `QUOTE_EXPIRING_UNPAID` | 07 | Oct 18, 11:00 AM | Same quote in client review, 1 day 12 h 59 min left |
| `PAID_PROJECT_ACTIVE` | 04 | Oct 19, 10:35 AM | Paid Oct 19, 10:30 AM, project activated (variant: activation pending) |
| `FOUNDATION_VERIFIED_COMPLETE` | 05 | Oct 27, 12:05 PM | Verified and completed Oct 27 |

Review previews and the studio's data-state selector are labelled `DEMO · <SCENARIO>`; the inspector note reads `DEMO DATA · FICTIONAL CLIENT · NOT A REAL CLIENT, PAYMENT OR RECORD`. Version ids are unchanged, so review history and approvals are untouched.

**Live data safety.** Send mode throws on any demo payload (`isFndatn01DemoPayload`). It never substitutes a demo value: an optional field drops its row, a required one makes the email ineligible. Every value is HTML-escaped (tested inside the card). No send, payment or production mutation path is reachable from the fixtures.

## QA

`npx tsx scripts/correspondence-studio/fndatn01/qa-artifact-data.ts [outDir]` renders the committed previews in Chromium at 760 (desktop canvas 680) and 360 / 390 / 430 px, in three modes: web fonts, web fonts blocked (Arial metrics, as in Gmail), and transforms stripped (as in Gmail / Outlook). It checks hero height against the art, the mobile copy zone, every card value against the card's printed rule, the first label against the authority position (±4 px), and horizontal scroll. Results: `artifact-data-qa/qa-report.json`.

| Mode | Result |
| --- | --- |
| Web fonts | 32 / 32 clean |
| Transforms stripped | 32 / 32 clean |
| Web fonts blocked | 23 / 32 clean; the rest listed below |

Every check also confirms each angled-edge CTA renders at its designed 46 px.

Evidence in `artifact-data-qa/`: `compare-<device>-<email>.jpg` (authority hero vs rendered hero, same scale) and `before-after-<device>-<email>.jpg` (full page before and after).

Correspondence Studio, checked on a local dev server: the FNDATN-01 pack lists all seven emails; each opens with its DEMO scenario in the data-state selector and the DEMO DATA note; 04 switches to activation pending; the stage shows the card data; SEND TEST stays off; no page errors and no send requests.

## Unresolved deviations

1. **Card type is larger than printed.** The authority prints card fields at about 6 px. They render at 7.5–8 px (values) and 6–6.5 px (labels) on desktop, 6.5–7.5 / 5.5–6 px on mobile, the most the printed field area holds. 07 mobile is the smallest (6.5 / 5.5 px).
2. **Without web fonts** (Gmail, Outlook): desktop hero copy runs 5–24 px past the 300 px art on 01, 02, 05, 06 and 07, and the 03 recommendation value (`YOUR DIGITAL FOUNDATION`) crosses the card's printed rule by up to 19 px desktop, 5 px mobile. 03 and 07 desktop scroll 8 px in the plan band (pre-existing). Card fields stay on the card.
3. **Tilt** shows only where `transform` is supported; elsewhere the rows are level on the card (captured).
4. **Mobile card heroes** show white gutters on phones wider than 390 px and crop scene on the right below 390 px.
5. **Desktop taglines** on 01 and 03 touch the red glass at the bottom left, as in the authority's composition with larger type.
6. **Inpainting residue** from the asset extraction remains faintly visible in places the live copy does not cover (most visible on 03 mobile right of the body).
7. **CTA tip without web fonts at 360 px:** the 03 label wraps and the tip blunts to a short vertical edge (no notch).
8. **Not tested in live clients.** No Litmus / Email on Acid pass, no real inbox. Outlook VML text placement is untested.
