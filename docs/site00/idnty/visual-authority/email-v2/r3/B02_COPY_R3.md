# B02 — Foundation Complete — R3 copy contract

Copy authority: `../benchmarks/B02_foundation-complete/COPY.md`. Customer words unchanged; `qa_r3.mjs` checks every sentence.

Build: `scripts/df-email-v2-benchmark/r3/emails/B02_R3.html` · send template `emails/templates/B02_R3.template.html`

## Envelope (unchanged)

| Field | Copy |
|---|---|
| Subject | YOUR FOUNDATION IS COMPLETE |
| Preheader | THE PART NOBODY APPLAUDS, AND THE PART EVERYTHING ELSE STANDS ON. |
| From | Pending sender registration |

## Editorial moments

| Moment | Copy | Setting |
|---|---|---|
| Masthead | SITE 00 · DIGITAL FOUNDATION | Micro label |
| Status seal | FOUNDATION COMPLETE | Lettered ring of the completion seal (image; alt "FOUNDATION COMPLETE") |
| Headline | THE GROUNDWORK IS DONE. | Barlow 900 lockup image, GROUNDWORK at full measure; alt carries the exact words |
| Monument | Slab drawing; title block GROUND · LAID / {{business_name}} | Live two-cell title block hung from the slab |
| Lede | AS OF TODAY, {{business_name}} HAS A DOMAIN, MAIL, AND SECURITY THAT ARE SET UP, TESTED, AND REGISTERED TO YOU. HERE IS WHAT THAT MEANS IN PRACTICE. | Saira 500 20px |
| Schedule head | WHAT'S NOW IN PLACE | Section head with a red rule |
| Schedule rows | 01 DOMAIN … 05 FINAL VERIFICATION, each with its meaning | Faint Barlow numeral, stage icon, Barlow 800 stage name, Saira meaning; row 05 on stone with a red numeral |
| Ownership | THE ACCOUNTS BEHIND ALL OF THIS BELONG TO YOU. / SITE 00 SET THEM UP WITH YOU, AND THEY STAY YOURS WHOEVER YOU WORK WITH NEXT. | First sentence Barlow 800 38px under the property-line mark; second sentence body |
| Continuity | YOUR FULL RECORD — … NOTHING ELSE IS NEEDED FROM YOU. | Body beside the envelope mark |
| Action | VIEW YOUR FOUNDATION | Ink button → `/foundation/{{public_token}}` |
| Closing image | Terrace edge and horizon, no caption | Full bleed |
| Footer | A SERVICE MESSAGE ABOUT THE DIGITAL FOUNDATION FOR {{business_name}}. / SITE 00 · site00.com | Caption |

## Drawing furniture added in R3

| Text | Where | Why |
|---|---|---|
| ±0.00 | Datum band | Level mark: where the drawing becomes the building |
| DATUM | Datum band | Names the mark |

No benefit, outcome or completion claim is added. The schedule shows only the five stage lines from the contract.

## Alt text

| Image | Alt | Source |
|---|---|---|
| Monument (desktop and mobile) | LINE DRAWING OF A FOUNDATION SLAB WITH DIMENSION MARKS, ITS TOP SURFACE FILLED WITH WHITE MARBLE AND EDGED IN RED. | Contract |
| Closing | A MARBLE TERRACE EDGE MEETING CALM SEA UNDER A CLEAR SKY. | Contract |
| Headline lockup | THE GROUNDWORK IS DONE. | Contract headline |
| Seal | FOUNDATION COMPLETE | Contract status seal |
| Drawn plate (new in R3) | A LINE DRAWING OF A MARBLE TERRACE AND A RED GLASS PAVILION, STILL ON PAPER. | R2 alt for the same crop |
| Built plate (new in R3) | A RED GLASS PAVILION STANDING ON A MARBLE TERRACE ABOVE THE SEA. | New; describes the crop |
| Icons | `alt=""` | Decorative |

## Fields and fallbacks (unchanged)

`business_name` missing: the title block drops the name cell; lede reads "AS OF TODAY, YOUR BUSINESS HAS…"; footer reads "ABOUT
YOUR DIGITAL FOUNDATION". Schedule renders only completed stages; omit skipped stages and renumber. `public_token` required.
