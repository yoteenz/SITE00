# Email V2 benchmark — QA report

Result: PASS. Data: `V2_COPY_QA.json`, produced by `scripts/df-email-v2-benchmark/qa_copy.py`.

## Copy QA

| Check | B01 | B02 | B03 |
|---|---|---|---|
| SITE 00-authored text uppercase | PASS | PASS | PASS |
| Internal system language | 0 | 0 | 0 |
| AI rhetorical patterns | 0 | 0 | 0 |
| NDX leak / generic luxury | 0 | 0 | 0 |
| Urgency or fake demand (B03) | — | — | 0 |
| BLDR, credit, or offer in completion email (B02) | — | 0 | — |
| Repeated sentences (4+ words) | 0 | 0 | 0 |
| Subject restates headline | NO | NO | NO |
| Images missing alt text | 0 | 0 | 0 |
| Word count | 218 | 197 | 308 |

Original case is preserved, and exempt from the uppercase check, for client names, email addresses, domains, URLs, and tokens.

## Cross-email variety

Shared five-word sequences between any two emails: 0.

Structural differences out of 11 tracked features (minimum required: 5, plus different composition and call to action):

| Pair | Differences |
|---|---|
| B01–B02 | 8 |
| B01–B03 | 10 |
| B02–B03 | 9 |

## Negative test

The checker was run against eleven lines from the rejected V1 pack, including "NO PAYMENT IS CONFIRMED IN THIS MESSAGE.", "THIS SEND REQUIRES MARKETING OPT-IN.", and "CLASSIFICATION: PLANNED_CONTRACT.". It flagged 11 of 11.

## Contrast (on white unless noted)

| Colour | Role | Ratio |
|---|---|---|
| #141414 | Ink | 18.42 |
| #1e1e1e | Body | 16.67 |
| #5e5e5e | Muted | 6.48 |
| #72706c | Faint (labels, footer) | 4.94 |
| #d90c0c | Red | 5.24 |
| White on red | Button and band text | 5.24 |
| Muted on stone | Footer | 5.95 |

All text meets WCAG AA (4.5:1). Faint grey was #8a8a8a (3.45:1) in the first pass and was darkened.

## Visual QA, cycle 1

| Finding | Fix |
|---|---|
| B02 slab texture carried a shadow and a dark seam | Moved the travertine sample box; drew the dashed planned outline before the slab and dropped its front line |
| B01 desktop doorway strip read as almost solid red | Recropped to include the marble wall beside the door |
| B03 section 03 label floated to the vertical centre | Top-aligned the column |
| B02 mobile slab showed a sliver of the red crosshair | Recropped the mobile slab |
| B02 mobile ledger meanings ran inline with the stage name | Set each meaning on its own line |

## Visual QA, cycle 2

| Finding | Fix |
|---|---|
| Faint grey under AA contrast | Darkened to #72706c |
| B03 subject repeated the headline | Subject changed to "WHAT STANDS AT YOUR ADDRESS?" |

After cycle 2, all six renders were re-checked at 2x: fonts loaded, no broken images, no clipped text, no horizontal scroll on mobile.

## Not covered here

Real inbox rendering (Outlook, Gmail, Apple Mail, dark mode) needs table-based HTML. That is Gate 4 of `ROLLOUT_PLAN.md` and is not authorized in this sprint.
