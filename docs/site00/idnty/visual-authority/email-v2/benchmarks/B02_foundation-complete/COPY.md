# B02 — Foundation Complete — customer copy

Final, customer-ready copy. Uppercase is the type style. Tokens keep original case.

## Envelope

| Field | Copy |
|---|---|
| Subject | YOUR FOUNDATION IS COMPLETE |
| Preheader | THE PART NOBODY APPLAUDS, AND THE PART EVERYTHING ELSE STANDS ON. |
| From | Pending sender registration. Not shown to the customer until registered. |

## Body

**Masthead**
SITE 00 · DIGITAL FOUNDATION
Status seal: FOUNDATION COMPLETE

**Monument**
Blueprint slab drawing, filled with marble. Labels: GROUND · LAID / {{business_name}}

**Headline**
THE GROUNDWORK IS DONE.

**Lede**
AS OF TODAY, {{business_name}} HAS A DOMAIN, MAIL, AND SECURITY THAT ARE SET UP, TESTED, AND REGISTERED TO YOU. HERE IS WHAT THAT MEANS IN PRACTICE.

**Ledger — WHAT'S NOW IN PLACE**

| No. | Stage | What it means |
|---|---|---|
| 01 | DOMAIN | THE ADDRESS PEOPLE TYPE TO FIND YOU, REGISTERED IN YOUR NAME. |
| 02 | PROFESSIONAL EMAIL | MAILBOXES ON YOUR OWN DOMAIN, AS AGREED IN YOUR SCOPE. |
| 03 | DNS AND SECURITY | THE RECORDS THAT HELP YOUR MAIL REACH INBOXES AND MAKE YOUR NAME HARDER TO IMPERSONATE. |
| 04 | DEVICES AND SIGNATURE | YOUR MAIL ON THE DEVICES YOU USE, SIGNED THE WAY YOU'D SIGN IT. |
| 05 | FINAL VERIFICATION | EACH OF THE ABOVE TESTED AND CONFIRMED, NOT ASSUMED. |

**Ownership**
THE ACCOUNTS BEHIND ALL OF THIS BELONG TO YOU. SITE 00 SET THEM UP WITH YOU, AND THEY STAY YOURS WHOEVER YOU WORK WITH NEXT.

**Continuity**
YOUR FULL RECORD — WHERE EACH ACCOUNT LIVES, WHO ADMINISTERS IT, HOW IT ALL CONNECTS — ARRIVES IN ITS OWN EMAIL, SO IT'S EASY TO FIND ON THE DAY YOU NEED IT. NOTHING ELSE IS NEEDED FROM YOU.

**Action**
[ VIEW YOUR FOUNDATION ] → `/foundation/{{public_token}}`

**Closing image**
Terrace edge and horizon. No caption.

**Footer**
A SERVICE MESSAGE ABOUT THE DIGITAL FOUNDATION FOR {{business_name}}.
SITE 00 · site00.com

## Image alt text

| Image | Alt |
|---|---|
| Monument | LINE DRAWING OF A FOUNDATION SLAB WITH DIMENSION MARKS, ITS TOP SURFACE FILLED WITH WHITE MARBLE AND EDGED IN RED. |
| Closing | A MARBLE TERRACE EDGE MEETING CALM SEA UNDER A CLEAR SKY. |

## Fields and fallbacks

| Field | Used in | Fallback |
|---|---|---|
| `business_name` | Monument label, lede, footer | Monument label drops the name line. Lede reads "AS OF TODAY, YOUR BUSINESS HAS…". Footer reads "ABOUT YOUR DIGITAL FOUNDATION". |
| `public_token` | CTA | Required. |
| Project stage records | Ledger rows | Render only completed stages. Omit skipped stages and renumber. |

## Board sample data

Rendered with `business_name = Halden & Rowe`, `public_token = hr7Kq2Lm9x`, all five stages complete.
