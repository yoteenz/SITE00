# B01 — Personal Foundation Invitation — customer copy

Final, customer-ready copy. Uppercase is the type style. Tokens keep original case.

## Envelope

| Field | Copy |
|---|---|
| Subject | WE'VE SET ASIDE A FOUNDATION FOR {{business_name}} |
| Subject, no business name | WE'VE SET ASIDE A DIGITAL FOUNDATION FOR YOU |
| Preheader | A FEW QUESTIONS ABOUT HOW YOU WORK, THEN A SCOPE YOU SEE BEFORE ANYTHING IS CHARGED. |
| From | Pending sender registration. Not shown to the customer until registered. |

## Body

**Letterhead**
SITE 00 · DIGITAL FOUNDATION
PREPARED FOR
{{business_name}}

**Headline**
BEFORE WE SET ANYTHING UP, WE'D LIKE TO KNOW HOW YOU WORK.

**Letter**

SITE 00 HAS PREPARED A DIGITAL FOUNDATION FOR {{business_name}}. IT'S THE GROUNDWORK A BUSINESS NEEDS AND RARELY HAS TIME TO GET RIGHT: A DOMAIN THAT IS UNMISTAKABLY YOURS, EMAIL THAT ARRIVES FROM IT, AND THE RECORDS THAT TELL OTHER INBOXES YOUR MAIL IS GENUINELY FROM YOU.

THE LINK BELOW OPENS YOUR BRIEFING. IT ASKS WHAT YOU ALREADY HAVE — A DOMAIN, A MAIL PROVIDER, PEOPLE WHO NEED AN ADDRESS — SO NOTHING YOU'VE ALREADY BUILT GETS REBUILT FOR THE SAKE OF IT.

FROM YOUR ANSWERS WE PREPARE A SCOPE AND A PRICE. YOU READ BOTH BEFORE ANYTHING IS CHARGED, AND EVERY ACCOUNT WE SET UP IS REGISTERED TO YOU.

TAKE IT AT YOUR OWN PACE. WHATEVER YOU'VE ENTERED WILL BE THERE WHEN YOU COME BACK.

**Action**
[ BEGIN YOUR FOUNDATION → ] → `/foundation/{{public_token}}?step=intake`
site00.com/foundation/{{public_token}}

**Sign-off**
SITE 00
DIGITAL FOUNDATION

**P.S.**
IF THE BRIEFING ASKS WHO REGISTERED YOUR DOMAIN AND NOBODY QUITE REMEMBERS, SAY SO. UNTANGLING THAT IS PART OF THE WORK.

**Footer**
THIS MESSAGE WAS SENT TO {{recipient_email}} BECAUSE A DIGITAL FOUNDATION WAS PREPARED FOR {{business_name}}. IF YOU WEREN'T EXPECTING IT, NO ACTION IS NEEDED.
SITE 00 · site00.com

## Image alt text

| Image | Alt |
|---|---|
| Doorway | RED GLASS DOORWAY SET INTO A PALE MARBLE WALL, OPEN TO DAYLIGHT. |

## Fields and fallbacks

| Field | Used in | Fallback |
|---|---|---|
| `business_name` | Subject, letterhead, letter, footer | Subject uses the no-name line. Letterhead drops "PREPARED FOR". Letter reads "PREPARED A DIGITAL FOUNDATION FOR YOU". Footer reads "BECAUSE A DIGITAL FOUNDATION WAS PREPARED FOR YOU". |
| `public_token` | CTA and printed link | Required. Do not send without it. |
| `recipient_email` | Footer | Required by the trigger. |

## Board sample data

Rendered with `business_name = Halden & Rowe`, `recipient_email = studio@haldenrowe.com`, `public_token = hr7Kq2Lm9x`. Sample values are underlined with a dotted rule in the board only.
