# B03 — M06 BLDR Introduction — R3 copy contract

Copy authority: `../benchmarks/B03_M06-bldr-introduction/COPY.md`. Customer words unchanged; `qa_r3.mjs` checks every sentence.

Build: `scripts/df-email-v2-benchmark/r3/emails/B03_R3.html` · send template `emails/templates/B03_R3.template.html`

## Envelope (unchanged)

| Field | Copy |
|---|---|
| Subject | WHAT STANDS AT YOUR ADDRESS? |
| Preheader | A LOOK INSIDE BLDR, WHERE SITE 00 DESIGNS WHAT PEOPLE FIND WHEN THEY ARRIVE AT YOUR DOMAIN. |
| From | Pending sender registration |

## Editorial moments

| Moment | Copy | Setting |
|---|---|---|
| Masthead strip | SITE 00 · BLDR — FOR {{business_name}} | Micro label with the north point |
| Nameplate | BLDR | Barlow 900 lockup image at full measure; alt "BLDR" |
| Cover | Hero image | Full bleed |
| Headline | AN ADDRESS / DESERVES / A BUILDING. | Live Barlow 900 76px, middle line stepped 112px; red square stop |
| Lede | YOUR DOMAIN TELLS PEOPLE … WORKS THAT OUT WITH YOU. | Saira 500 20px |
| Opening | MOST WEBSITES ARE PLANNED LIKE BROCHURES: A COVER, A FEW PAGES, A WAY TO GET IN TOUCH. / WE PLAN THEM THE WAY AN ARCHITECT PLANS A BUILDING — / STARTING WITH WHO ARRIVES, WHAT THEY CAME FOR, AND HOW IT SHOULD FEEL TO WALK IN. | One paragraph in three parts: body, sketch, Barlow 800 pull, body |
| Station 01 | 01 · THE APPROACH + its paragraph | Approach panorama, 64px numeral, Saira 600 label |
| Station 02 | 02 · INSIDE + its paragraph | First two sentences beside the numeral; "THESE ARE MATERIAL DECISIONS, AS MUCH AS MARBLE AND GLASS ARE," as a Barlow 800 pull beside the annotated interior; the rest as body |
| Station 03 | 03 · IN USE + its paragraph | Work image bleeding off the right edge, numeral, label |
| Revelation | THREE DIRECTIONS, THEN YOUR DECISION. + its paragraph | Ink spread; Barlow 900 46px white heading |
| Plans | A · GALLERY / B · COURTYARD / C · OPEN HALL · ILLUSTRATIVE PLANS | Three plan drawings with live labels and caption |
| Close | NONE OF THIS ASKS ANYTHING OF YOU TODAY. BLDR IS OPEN TO WALK AROUND WHENEVER CURIOSITY GETS THE BETTER OF YOU. | Saira 500 18px |
| Action | TAKE A WALK THROUGH BLDR → | The closing line is the link: Barlow 900 44px, arrow in Saira red. Route pending |
| Footer | YOU'RE RECEIVING THIS BECAUSE … / MANAGE PREFERENCES → {{preference_url}} · UNSUBSCRIBE → {{unsubscribe_url}} / SITE 00 · {{postal_address}} · site00.com | Caption; tokens visible and case-preserved |

The station headings are split typographically ("01" as a numeral, "THE APPROACH" as a label); the words are the contract's.

## Drawing furniture added in R3

| Text | Where | Why |
|---|---|---|
| MARBLE, RED GLASS | Leader labels on the station 02 interior (inside the image) | Annotation; names the two materials the pull quote mentions |
| ROUTE PENDING | Under the closing link, review build only | Flags that the CTA route does not exist yet. Stripped from the send template by `build_emails.py` |

## Alt text

| Image | Alt | Source |
|---|---|---|
| Cover | A PAVILION WITH TALL RED GLASS WALLS OPENS ONTO A MARBLE TERRACE AND A CALM SEA. | Contract |
| Station 01 | A RED GLASS PANEL AT THE EDGE OF A TERRACE, WITH AN OLIVE TREE AND THE SEA BEYOND. | Contract |
| Station 02 | A QUIET MARBLE ROOM WITH A LOW SOFA, LIT THROUGH RED GLASS. NOTES MARK THE MARBLE AND THE RED GLASS. | Contract + one sentence for the annotations |
| Station 03 | A LONG STONE WORKTABLE WITH CHAIRS AND A LAPTOP, FACING THE SEA. | Contract |
| Plans | Contract alt "THREE SIMPLE FLOOR PLANS, EACH WITH ONE ROOM MARKED IN RED." split into one alt per plan (A gallery, B courtyard, C open hall), so each image describes itself | Contract, split |
| Resting | PALE ROCKS AT THE WATER'S EDGE UNDER A WIDE SKY. | Contract |
| Sketch (new in R3) | A PENCIL SKETCH OF A GLASS PAVILION, ONE WALL ALREADY TURNING RED. | R2 alt for the same crop |
| Nameplate | BLDR | Masthead word |

## Fields and send conditions (unchanged)

`business_name` missing: drop "— FOR …". `preference_url`, `unsubscribe_url`, `postal_address` required for send (the last two
are not yet in the contract). Do not send when `marketing_opt_in` is false. CTA route pending: do not send until it exists.
