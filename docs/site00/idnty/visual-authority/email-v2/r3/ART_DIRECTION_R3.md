# Email V2 R3 — art direction

One integrated composition per email. The copy is the benchmark copy, restructured into editorial moments (pull quotes,
legends, schedules, captions) without changing its words. Agent selection is not founder approval: all three are
**FOUNDER REVIEW PENDING**.

Review: `scripts/df-email-v2-benchmark/r3/review/index.html` (email, R3 / R2 A–C / R1, device, compare, rationale,
graphic provenance). Studio: `/admin/site00/correspondence-studio` → Digital Foundation → client lifecycle → email.

| Email | R3 composition | Central idea |
|---|---|---|
| B01 · PERSONAL FOUNDATION INVITATION | THE INVITATION | A letter that opens like a door. The headline is spoken in two voices beside the red-glass doorway, the foundation is drawn as a legend, and a reply card is torn from the foot to accept. |
| B02 · FOUNDATION COMPLETE | THE RECORD | A certificate of work laid down. The seal and the monument lettering announce it, the slab carries a drawing title block with the client's name, a schedule records the five stages, a datum marks where drawing became building, and ownership is stated once at display size. |
| B03 · M06 — BLDR INTRODUCTION | THE ISSUE | An issue of one feature. Nameplate, cover, a headline that steps across the page, three stations walked in order, an ink spread that reveals three plans, and a closing line that is itself the link. |

<a id="b01"></a>
## B01 · PERSONAL FOUNDATION INVITATION — THE INVITATION

**Job.** Invite the owner into the briefing. A personal letter that is also an editorial invitation; accepting should feel like replying to one.

**Central idea.** A letter that opens like a door. The headline is spoken in two voices beside the red-glass doorway, the foundation is drawn as a legend, and a reply card is torn from the foot to accept.

**Why this composition.** The message is an invitation from people, so the letter structure leads and carries the personal register. The doorway says entry without decoration. Two voices let the headline stay courteous and still carry display weight. Nothing in it reads as a newsletter.

**What it takes from R2.**

- R2 A · A PRIVATE CORRESPONDENCE: Letterhead with the prepared-for block, the red-glass sliver, the perforated reply card.
- R2 B · ARCHITECTURAL OPENING: The doorway stands beside the words as architecture, bleeding off the right edge, not as a picture in a box.
- R2 C · PERSONAL EDITORIAL: The two-voice headline and the promise set as a pull quote.

| Aspect | Direction |
|---|---|
| Composition | Letterhead; a 312px headline column against a 248px doorway that bleeds off the right edge; a lede that runs into a three-line legend indented 64px; the briefing paragraph at a 430px measure; the promise as a pull quote against an 8px red-glass sliver; a right-aligned aside; the perforation; a stone reply card with the route mark and an ink button; a registration-mark sign-off; the P.S. with a red display "P.S." in the margin. |
| Typography | Preface "BEFORE WE SET ANYTHING UP," in Saira 500 21px grey; the request in Barlow 900 68px ending in the red square stop. The legend is Saira 500 17px. The promise is Barlow 800 40px between two Saira body lines. The sign-off "SITE 00" is Barlow 800 tracked +0.06em. |
| Graphic devices | icon-door-swing, icon-address-plaque, icon-envelope-plan, icon-seal, icon-route, icon-registration, perforation, red-glass sliver, red square stop |
| Red | The doorway glass, the sliver beside the promise, the full stop, the P.S. mark and the points of the route and registration marks. The button is ink, not red. |
| Action | An ink button inside the perforated reply card, with the printed link beneath it as the plain-text fallback. |
| Email-safe build | Table rows only. At 480px and below the doorway column is hidden and the wide door crop appears above the headline; the letterhead stacks. The sliver is a bgcolor cell with a background image. No positioning. |
| Known risk | The headline is live Barlow 900. Without web fonts it falls back to Arial bold and wraps to four lines; tested at 390, 768 and 1024 with no overflow. |

**R2 → R3.** R2 gave three partial answers: a letter, a piece of architecture, an editorial page. R3 uses A's correspondence as the frame, B's doorway as the figure, and C's typographic voice for the headline and the promise, in one composition.

**Premium asset candidate (not commissioned).** A purpose-shot doorway at true portrait ratio (the current one is cropped from a landscape plate). A flat-lit reply-card stock with a real perforation.

<a id="b02"></a>
## B02 · FOUNDATION COMPLETE — THE RECORD

**Job.** Certify completion with a designed record of what now exists: no generic checklist, no five-column table, no claim beyond the completed stages.

**Central idea.** A certificate of work laid down. The seal and the monument lettering announce it, the slab carries a drawing title block with the client's name, a schedule records the five stages, a datum marks where drawing became building, and ownership is stated once at display size.

**Why this composition.** Completion is a record, so the composition borrows the grammar of a drawing set: title block, schedule, datum. The monument lettering supplies the moment of achievement without confetti, and ownership gets the second-largest type because it is the promise that outlasts the project.

**What it takes from R2.**

- R2 A · MONUMENT ESTABLISHED: The monument-scale headline and the slab.
- R2 B · ARCHITECTURAL RECORD: The title block, the schedule and the datum line.
- R2 C · MILESTONE REVEAL: The seal and the closing horizon.

| Aspect | Direction |
|---|---|
| Composition | Masthead and the completion seal; the GROUNDWORK lockup; the slab bleeding full width with a title block (GROUND · LAID | client) hung from its lower right; the lede; the schedule with faint display numerals, stage icons and Barlow stage names, row 05 set on stone with a red numeral and the benchmark mark; the drawn plate, the red datum band (±0.00), the built plate; ownership as a Barlow 800 statement under the property-line mark; the continuity note beside the envelope mark; the ink button with the route mark; the horizon; the service footer. |
| Typography | "THE GROUNDWORK IS DONE." is an image lockup (Barlow 900; GROUNDWORK fitted to the full measure) with exact alt text. Stage names Barlow 800 24px; numerals Barlow 800 40px in #d9d6d0; meanings Saira 400 15px. Ownership Barlow 800 38px (30px mobile). |
| Graphic devices | completion-seal, lockup-groundwork, title block, icon-address-plaque, icon-envelope-plan, icon-seal, icon-device-signature, icon-benchmark, datum band, icon-property-line, icon-route |
| Red | The full stop, the slab's leading edge (from the plate), the schedule rule, the 05 numeral, the datum band and the bar in the seal. |
| Action | An ink button, VIEW YOUR FOUNDATION, with the route mark beside it on desktop. |
| Email-safe build | Schedule rows are a three-column table that keeps its columns on mobile (narrower numerals, smaller icons). Only completed stages render; skipped stages are omitted and renumbered, per the copy contract. The datum is a bgcolor row. No positioning. |
| Known risk | The lockup is an image, so it is invisible with images off; the alt text carries the exact headline and the lede follows immediately in live text. |

**R2 → R3.** R2 split the record three ways: monument, drawing set, reveal. R3 lets the monument announce, the drawing set record, and the reveal close, so the email has a beginning, a body and an end instead of one device repeated.

**Premium asset candidate (not commissioned).** A photograph of a real travertine slab edge at monument scale to replace the drawn slab. An embossed seal photographed in raking light.

<a id="b03"></a>
## B03 · M06 — BLDR INTRODUCTION — THE ISSUE

**Job.** Introduce BLDR as a miniature architecture magazine feature. The most expressive of the three, and still not a long article.

**Central idea.** An issue of one feature. Nameplate, cover, a headline that steps across the page, three stations walked in order, an ink spread that reveals three plans, and a closing line that is itself the link.

**Why this composition.** BLDR is the product that designs buildings for addresses, so its introduction should behave like the magazine that would publish one: a nameplate at full measure, a cover, a feature that walks from approach to inside to use, and a reveal spread. It is the only one of the three with an ink spread, which keeps the family from looking alike.

**What it takes from R2.**

- R2 A · ARCHITECTURAL MANIFESTO: The headline scale and the ink spread.
- R2 B · ENTER THE LOCATION: The station sequence: approach, inside, in use.
- R2 C · THE UNBUILT POSSIBILITY: Sketch to plan, and the plans as the reveal.

| Aspect | Direction |
|---|---|
| Composition | A masthead strip with the north point; the BLDR nameplate at the full 544px measure; the cover full bleed; the live headline stepped by 112px on its middle line; the lede; brochure against building (body, sketch, Barlow pull, body); station 01 with the approach panorama and a 64px numeral; station 02 as a diptych of the annotated interior and its pull; station 03 with the work image bleeding off the right edge; the ink reveal with three plans and live labels; the resting strip; the close; the closing line as the link; the marketing footer with visible tokens. |
| Typography | Nameplate is an image (Barlow 900 fitted to the measure). Headline live Barlow 900 76px (50px mobile). Pulls Barlow 800 32px and 28px. Station numerals Barlow 800 64px with Saira 600 labels. Reveal heading Barlow 900 46px white. Closing line Barlow 900 44px with a Saira arrow (Barlow has no arrow glyph). |
| Graphic devices | lockup-bldr, icon-north, icon-station, interior-annotations, plan-a-gallery, plan-b-courtyard, plan-c-open-hall, icon-route, red square stop |
| Red | The cover glass, the marked room in each plan, the full stops and the arrow in the closing line. |
| Action | A typographic link: TAKE A WALK THROUGH BLDR →. The route is pending; the review build shows a ROUTE PENDING chip that the send template strips. |
| Email-safe build | Stations stack to number-and-label rows at 480px and below. The plans stay three across (labels shrink to 9px). The ink spread is a bgcolor cell. Legal footer tokens stay visible and case-preserved. No positioning. |
| Known risk | The CTA route does not exist yet (contract note). Do not send until the route and the unsubscribe and postal address fields are in the contract. |

**R2 → R3.** R2 A was a manifesto without a walk, B was a walk without a reveal, and C was a reveal without a cover. R3 is the issue that contains all three in order.

**Premium asset candidate (not commissioned).** A commissioned cover with clear sky above the pavilion for the nameplate. Three plans drawn by one architect's hand. A dusk interior for station 02.

## Typographic roles

Display: Barlow Condensed Black 900 / ExtraBold 800 (the DF client face, aliased in CSS as "SITE00 DF Display"). Body: Saira Semi Condensed 400 / 500 / 600 / 700. Full evidence in `TYPOGRAPHIC_AUTHORITY.md`.

| Role | Face | Size | Tracking | Leading |
|---|---|---|---|---|
| Display headline | Barlow Condensed 900 | 62–76px desktop, 46–54px mobile | -0.004em | 0.86 |
| Display pull / stage name | Barlow Condensed 800 | 24–40px | +0.004em | 0.98 |
| Intro / lede | Saira 500 | 20px (18px mobile) | +0.012em | 1.42 |
| Body | Saira 400 | 15px | +0.028em | 1.64 |
| Section head | Saira 600 | 11.5px | +0.26em | 1.4 |
| Micro label | Saira 600 | 10px | +0.30em | 1.45 |
| Caption / footer | Saira 500 | 10.5px | +0.10–0.14em | 1.6 |
| Annotation / printed link | Saira 400 | 11px | +0.10em | 1.55 |
| Call to action | Saira 700 | 13px | +0.20em | 1 |

## Family distinction

B01 is a letter on white with one photograph and a stone reply card. B02 is a drawing set: lockup, slab, schedule, datum,
two plates and a horizon. B03 is a magazine issue: nameplate, cover, stations and the only ink spread. With the copy
removed, each still reads as its own kind of document, and each still reads as SITE 00 (red square stop, Barlow display,
Saira text, red glass and marble from the same plates).

## Status

FOUNDER REVIEW PENDING. Full 20-email rollout not authorized. No sending, no merge, no deploy. OpenArt generations: 0.
