# Email V2 R4 — creative authority

**Sprint:** `P0.SITE00.IDNTY.EMAIL-V2-R4-PREMIUM-EDITORIAL-ASSET-PASS-AND-FULL-PACK-COMPOSITION-REBUILD1`
**Status:** FOUNDER REVIEW PENDING. Agent selection is not founder approval. No send, no ESP wiring.
**Builds on:** R3 (`../r3/ART_DIRECTION_R3.md`, `../r3/TYPOGRAPHIC_AUTHORITY.md`). R3 laws hold unless this file changes them.

R4 takes the R3 benchmark across all twenty Digital Foundation emails. Each email is composed for its job; no two
share a skeleton. Ten new photographs come from the same world as DF-I01 / I02 / I03: travertine, board-formed
concrete, red glass, the sea. They go where a photograph changes how the moment feels. Utility emails stay drawn.

## What stays fixed

| Law | Rule |
|---|---|
| Display | Barlow Condensed 900 / 800 (DF alias "SITE00 DF Display"), literal uppercase, red square full stop after the headline. |
| Body | Saira Semi Condensed 400 / 500 / 600 / 700, literal uppercase. Client values, URLs, emails and tokens keep their case. |
| Red | One red idea per email: the stop, plus at most one red device (number, band, tab, stub, rule). Red is never a background for body copy. |
| Message | 640px table, live text, one `@media (max-width:480px)`, desktop and mobile crops where the composition needs them, alt text on every image. |
| Copy | Subject and primary CTA come from the copy contract. Body stays inside what the contract can prove. No dates, prices, usage terms or completion claims the record does not supply. |
| Mark | No invented wordmark. The masthead is set in type with a drawn line icon. |

## Typographic roles (`scripts/df-email-v2-benchmark/r4/compose/base.css`)

| Role | Face | Size (desk / mobile) | Tracking | Leading | Use |
|---|---|---|---|---|---|
| Headline | Barlow 900 | 50–118px / 40–72px | −0.004em | 0.88 | One per email; size set per composition. |
| Secondary display | Barlow 800 | 24–36px / 22–32px | 0.004em | 0.98 | Pull lines, section heads, values. |
| Kicker | Saira 500 | 19 / 17 | 0.02em | 1.3 | Grey run-in above a headline ("WHEN YOU HAVE A MOMENT,"). |
| Intro | Saira 500 | 20 / 18 | 0.012em | 1.42 | The first sentence under the headline. |
| Body | Saira 400 | 15 / 15 | 0.028em | 1.64 | Everything else. |
| Note | Saira 400 | 13 | 0.06em | 1.6 | Margin note with a 2px red rule. |
| Section head | Saira 600 | 11.5 | 0.26em | 1.4 | Red dash plus label. |
| Micro | Saira 600 | 10 | 0.3em | 1.45 | Masthead, spec keys, status. |
| Figure | Saira 500 | 10 | 0.22em | 1.5 | "FIG. 01 · ■ CAPTION" under photographs. |
| Action | Saira 700 | 13 | 0.2em | 1 | Buttons (ink, red, outline) and bands. |

Line-break discipline is enforced at build and in QA. `build_r4.py` binds the last two words of each text block
(headlines only when the pair is 15 characters or fewer, so a bound pair cannot overflow in a fallback face).
Headlines with a deliberate stack use explicit breaks. `qa_r4.mjs` fails a one-word last line, a one-word
headline line made by a natural wrap, or a word split across lines, at 390, 768 and 1024.

## Device library (R4 additions to R3)

| Device | Built as | Used in |
|---|---|---|
| Figure caption | live text, `.fig` | TR-02, TR-04, TR-05, TR-10, MK-02, MK-03 |
| Margin note | live text, `.note` | TR-02, TR-04 |
| Specification sheet | table, `.spec` | TR-04 (fact-sheet variants in TR-09, OP-03, MK-01) |
| Revision table | table, struck earlier row | TR-05 |
| Countersignature | two ruled signature lines with drawn marks | TR-06 |
| Admission ticket | bordered table with a dashed stub | TR-07 |
| Monument numerals | Barlow 900 amount | TR-08, MK-01 |
| Perforation rule | 2px dotted rule | TR-08 |
| Stage map | five cells, stage 01 in red; stacks on mobile | TR-10 |
| Index card | bordered card with a red tab | TR-12 |
| Pinned card | stone panel with a red pin square | OP-01 |
| Decision strip | ruled band with icon and subject | OP-02 |
| Registration tick | drawn icon beside the headline | OP-03 |
| Red band | full-width action row with an arrow | MK-01, MK-03, MK-05 |
| Sectional markers | numbered red squares on the photograph (composite) | MK-03 |
| Cover nameplate | BLDR set over the sky of the photograph (composite) | MK-04 |
| Drawn icons (12 new) | 48-unit line SVG, black strokes, one red element | scale-rule, revision, countersign, ticket, plumb, drawer, pin, decision, recorded, token, layers, horizon |

## Family dialects

| Family | Voice | Visual dialect |
|---|---|---|
| Transactional (12) | Clear, composed, confident. | Documents: letters, briefs, receipts, records. White ground, ink rules, photographs at the moments that matter (invitation, quote, payment, setting out, completion, archive). |
| Operational (3) | Useful, calm, direct. | Drawn only. One request or decision per message, named in the headline, with its subject in the client's own words. |
| Marketing (5) | Magnetic, editorial, anticipatory. | Features: covers, field guides, a night spread. Larger photographs, red action bands, the only ink panels in the pack. |

## Per template

<a id="tr-01"></a>
### TR-01 · personal-foundation-invitation — THE INVITATION · P1 · R4-G01
The R3 letter, re-shot. The open red-glass door (G01, native 2:3) replaces the R3 crop beside the two-voice headline;
the reply card, P.S. and icon list stay. Subject and action from the R3 benchmark contract.

<a id="tr-02"></a>
### TR-02 · intake-started — THE DOOR, AJAR · P2 · R4-G01
A short note. The same door returns as a floor-light detail stepped in from the right, so the client sees the place
they left. Margin note: unknown answers are part of the job.

<a id="tr-03"></a>
### TR-03 · intake-completed — RECEIVED · P3
A double-ruled RECEIVED stamp with the client's name and a three-step rail (received, read, quote). No photograph:
the moment is a receipt.

<a id="tr-04"></a>
### TR-04 · quote-ready — THE WORK, MEASURED · P1 · R4-G04
A scale model of the build on a travertine table beside drawings and a steel rule. A specification sheet carries
version, total (in display type) and status; a margin note says the quote in the foundation is the one that counts.

<a id="tr-05"></a>
### TR-05 · quote-updated — REVISION · P2 · R4-G04
A tight detail of the same model beside the headline, then a drawing-style revision table with the earlier version
struck. No business name: the contract does not supply one here.

<a id="tr-06"></a>
### TR-06 · quote-accepted — AGREED · P3
One word at monument scale, then a countersignature: SITE 00 with the quote version, YOU with the terms version.
The photograph planned for this email (G04) was dropped in composition; the signature reads stronger alone.

<a id="tr-07"></a>
### TR-07 · checkout-link-ready — CHECKOUT IS OPEN · P2 · R4-G05
A thin threshold slot as a letterbox header and an admission ticket with a perforated OPEN stub.

<a id="tr-08"></a>
### TR-08 · payment-confirmed — RECEIPT · P1 · R4-G05
The red-glass threshold in full, the amount as monument numerals, a perforation rule, and the thanks split from
the record line.

<a id="tr-09"></a>
### TR-09 · payment-failed — ATTENTION · P3
A status bar with a hollow red square and a three-row fact sheet. No imagery on purpose: nothing decorative while
money is unresolved.

<a id="tr-10"></a>
### TR-10 · project-activated — THE GROUND IS MARKED OUT · P1 · R4-G06
Headline first, then the setting-out photograph: string lines and one footing on a cleared site. A five-stage map
names what will be built, with stage 01 in red.

<a id="tr-11"></a>
### TR-11 · foundation-complete — THE RECORD · P1 · R4-G02
The R3 record. The drawn slab monument becomes the built travertine slab (G02) with its title block; schedule,
datum band, drawn and built plates and ownership panel stay.

<a id="tr-12"></a>
### TR-12 · records-available — THE ARCHIVE · P1 · R4-G07
A travertine archive with one drawer open opens the email. An index card with a red tab lists what the records
cover. The records stay behind the client's link.

<a id="op-01"></a>
### OP-01 · client-action-required — ONE THING NEEDS YOU · P3
A pinned stone card carries the request title and note in the client's original case. Primary action plus a text link.

<a id="op-02"></a>
### OP-02 · approval-requested — YOUR SIGN-OFF, PLEASE · P3
A grey kicker runs into the headline; a ruled decision strip names what is up for approval; two numbered steps.

<a id="op-03"></a>
### OP-03 · approval-completed — DONE. THANK YOU · P3
A registration tick beside a two-line headline, a two-row record, an outlined action. The shortest email in the pack.

<a id="mk-01"></a>
### MK-01 · foundation-credit-issued — SET ASIDE, IN YOUR NAME · P1 · R4-G08
A stacked headline beside a red-glass block on a travertine plinth. A value plate (credit, held until) and a red band.
Nothing about how the credit can be used: the contract does not say.

<a id="mk-02"></a>
### MK-02 · bldr-discovery — YOU MENTIONED YOU MIGHT BUILD · P2 · R4-G03
A letter. The pavilion band from the BLDR cover, three illustrative plans from R3, and a sign-off. Nothing is booked.

<a id="mk-03"></a>
### MK-03 · M01 — WHAT'S UNDER THE FLOOR · P1 · R4-G09
A field guide. A sectional model shows the layers under a pavilion, with numbered markers keyed to a legend
(domain, DNS and security, professional email, devices and signature). A stone panel says what a foundation is not.

<a id="mk-04"></a>
### MK-04 · M06 — THE ISSUE · P1 · R4-G03
The R3 magazine issue with a new cover: BLDR set in the sky above the pavilion (G03 composite). Masthead reads
PREPARED FOR the client. Stations, plan reveal, ink spread and the R3 closing link stay. Subject and closing link from the R3 contract;
the BLDR route is still pending.

<a id="mk-05"></a>
### MK-05 · M13 — AFTER HOURS · P1 · R4-G10
The pavilion at dusk runs into a night band: three vignettes (a name people can find, mail that arrives as you,
room to build) in white on ink, a terrace strip, and a red band.

## Contract notes

- The invitation and M06 take their subject and action from the R3 benchmark copy contracts (`../r3/B01_COPY_R3.md`, `../r3/B03_COPY_R3.md`), which superseded the pack contract for those two.
- `business_name` appears only where the contract supplies it. Seven templates do not receive it: quote-updated, quote-accepted, payment-confirmed, client-action-required, approval-requested, approval-completed, foundation-credit-issued.
- M01's placeholder list omits `public_token` but its destination is `/foundation/{{public_token}}`; the template follows the destination.
- `{{preference_url}}` and `{{unsubscribe_url}}` are still unresolved routes in the contract. The M06 BLDR route is still pending.
