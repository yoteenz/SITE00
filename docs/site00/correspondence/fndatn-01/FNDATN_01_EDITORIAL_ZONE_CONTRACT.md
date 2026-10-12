# FNDATN-01 editorial zone contract

Sprint: `P0.SITE00.CORRESPONDENCE.ADAPTIVE-EDITORIAL-TEXT-WRAPPING-AND-SPATIAL-INTELLIGENCE1`.

The hero copy in all seven FNDATN-01 emails is placed by a solver that runs when the HTML is generated. Email clients run no script and cannot measure the DOM, so every wrap decision is made before send, from font advance tables. Each decision is written into the HTML as fixed widths, explicit line breaks, and media queries.

## Source files

| File | Role |
| --- | --- |
| `shared/site00-correspondence-studio/editorial/measure.ts` | Text width from advance tables, break units (spaces and after hyphens), greedy wrap |
| `shared/site00-correspondence-studio/editorial/fontMetrics.generated.ts` | Saira, SITE 00 Display, and Arial-metric tables (`scripts/correspondence-studio/editorial/extract_font_metrics.py`) |
| `shared/site00-correspondence-studio/editorial/zones.ts` | Contract schema: canvas, safe area, protected zones, role rules |
| `shared/site00-correspondence-studio/editorial/solve.ts` | The fit ladder (`planHero`) |
| `shared/site00-correspondence-studio/editorial/clientSimulation.ts` | Studio simulation of clients that ignore webfonts |
| `shared/site00-correspondence-studio/fndatn01/zones.ts` | Fourteen contracts, one desktop and one mobile per email |
| `shared/site00-correspondence-studio/fndatn01/hero.ts` | Renders a plan to table HTML and CSS |
| `docs/site00/correspondence/fndatn-01/FNDATN_01_EDITORIAL_ZONES_MEASURED.json` | Founder authority copy edges (`measure_editorial_zones.py`) |

## Contract

Each contract gives the art canvas size, the text safe area (inset, top, gutter, max right edge), and the protected zones: architecture, red glass, artifacts, figures, and greenery, measured on the cleaned art at its authority width. It also gives a rule per text role: size (preferred, minimum, and fallback minimum), line height, minimum column width, line limits, gap, whether the role is essential, and whether it may follow a stepped edge.

Zones were trimmed until none intersects a founder authority text line. The approved position is kept, and the art keeps its space.

## Fit ladder

Priority: readability, then protected zones, then hierarchy, then the approved position, then the least vertical growth.

| Level | Step |
| --- | --- |
| L1 | Wrap inside the safe area at the preferred sizes |
| L2 | Allow more lines, up to each role's limit |
| L3 | Let the body follow the stepped edge of the art (each line takes the safe width of its own row band) |
| L4 | Shrink within limits, in this order: body, sub, tagline, kicker, headline |
| L5 | Stack: text sits above the art at full width, and the art keeps its full natural image |

The kicker's trailing rule (56px) is dropped before a long name wraps. The headline's red terminal "." is counted in measurement. A role that is not essential, such as the tagline, is left out rather than squeezed. The solver never overlaps art, hides words, clips, leaves the safe area, scales the email, or goes below a role's minimum size. Output is deterministic, so the same copy always gives the same HTML.

Measurement keeps a proportional slack: `fitWidth(col) = col - max(2, col * 0.035)`. Chromium renders 7.5px Saira up to 2.7% wider than its advance table.

## Results for the approved copy

| Email | Desktop webfont | Mobile webfont | Arial fallback |
| --- | --- | --- | --- |
| 01 Invitation | Overlay L4 | Overlay L4 | Stack L5 |
| 02 Intake received | Overlay L4 | Overlay L4 | Stack L5 |
| 03 Recommendation | Overlay L1 | Overlay L4 | Stack L5 |
| 04 Payment received | Overlay L4 | Overlay L1 | Stack L5 |
| 05 Foundation complete | Overlay L1 | Overlay L1 | Stack L5 |
| 06 Resume intake | Overlay L1 | Overlay L4 | Stack L5 |
| 07 Quote expiry | Overlay L4 | Overlay L4 | Stack L5 |

Desktop taglines are left out on every email. The authority taglines measured about 4.5px over the red glass, which is tiny type over art. The mobile compositions keep their taglines where a safe area exists.

The headline face is SITE 00 Display, which is far narrower than Arial. In clients that ignore webfonts, no email keeps overlay at a legal size, so those clients get the stacked layout. This is the honest result of the ladder. It is not a bug.

## Client fallbacks

When the webfont plan and the fallback plan differ, the hero ships two variants:

| Variant | Shown in |
| --- | --- |
| `ez-a` (webfont plan, inline) | Apple Mail, iOS Mail, Thunderbird, Samsung, and any client that honours `@font-face` |
| `ez-b` (Arial plan, hidden by default) | Gmail (via `u + .body` inside media queries), Outlook.com (via `[class~="x_ez-b"]`), and Outlook desktop (via a `<!--[if mso]>` copy, with the other variants inside `<!--[if !mso]><!-->`) |

The breakpoint is 679px. The desktop composition renders only at its native 680px width. Between 600 and 679px, the desktop bands and the act section overflowed horizontally.

A global net, `.email td { overflow-wrap: anywhere; word-break: break-word }`, stops any unmeasured value from widening a table. Ledger values wrap. Button labels wrap, and the Outlook VML button grows by 16px per extra line, measured in Arial. Email 04 keeps its receipt card only while the receipt fits: at most 7 rows, labels up to 108px, and values up to 134px in Arial. Otherwise it renders the ledger.

## Residual risks

- Yahoo and AOL, and Gmail with a non-Google account, strip the `<style>` block. They show the inline `ez-a` variant in their fallback font. Text can then run wider than planned, but the overflow-wrap net still prevents clipping or horizontal scroll.
- An unbroken name of about 24 letters stacks on some mobile heroes. That is an honest L5, and no art is overlapped.
- Desktop taglines are omitted, as described above.

## Verification

- `tests/correspondenceEditorialGeometry.test.ts` uses real Chromium geometry. It runs all seven emails with default, long-stress, and short-stress copy, plus the 04 pending state, in webfont and fallback, at 390, 430, 600, 768, and 1280px. It checks bounding-box intersection with every protected zone, safe-area escape, horizontal overflow, clipping, hero growth, stacked text over art, and whether the CTA is in view and fits its label. A negative control proves that each failure type is detected.
- `tests/editorialZoneContracts.test.ts` checks contract schema, the measured authority match, determinism, the ladder, and client targeting markup.
- Stress fixtures are fictional and disposable (`fixtures.ts`, `stress_long` and `stress_short`, `.invalid` domains).
