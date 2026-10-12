# B01 — Personal Foundation Invitation — R3 copy contract

Copy authority: `../benchmarks/B01_personal-foundation-invitation/COPY.md`. Not one customer word is changed. R3 changes where
each sentence sits and how it is set. `scripts/df-email-v2-benchmark/r3/qa_r3.mjs` checks every sentence.

Build: `scripts/df-email-v2-benchmark/r3/emails/B01_R3.html` · send template `emails/templates/B01_R3.template.html`

## Envelope (unchanged)

| Field | Copy |
|---|---|
| Subject | WE'VE SET ASIDE A FOUNDATION FOR {{business_name}} |
| Subject, no name | WE'VE SET ASIDE A DIGITAL FOUNDATION FOR YOU |
| Preheader | A FEW QUESTIONS ABOUT HOW YOU WORK, THEN A SCOPE YOU SEE BEFORE ANYTHING IS CHARGED. |
| From | Pending sender registration |

## Editorial moments

| Moment | Copy | Setting |
|---|---|---|
| Letterhead | SITE 00 · DIGITAL FOUNDATION | Saira 600 micro with the door-swing mark |
| Addressee | PREPARED FOR / {{business_name}} | Micro label over Saira 500 22px; right-aligned (stacks left on mobile) |
| Headline, first voice | BEFORE WE SET ANYTHING UP, | Saira 500 21px grey |
| Headline, second voice | WE'D LIKE TO KNOW HOW YOU WORK. | Barlow 900 68px; the full stop is the red square |
| Lede | SITE 00 HAS PREPARED A DIGITAL FOUNDATION FOR {{business_name}}. IT'S THE GROUNDWORK A BUSINESS NEEDS AND RARELY HAS TIME TO GET RIGHT: | Saira 500 20px |
| Legend | A DOMAIN THAT IS UNMISTAKABLY YOURS, / EMAIL THAT ARRIVES FROM IT, / AND THE RECORDS THAT TELL OTHER INBOXES YOUR MAIL IS GENUINELY FROM YOU. | The end of the same sentence, set as a drawing legend with the plaque, envelope and seal marks |
| Briefing | THE LINK BELOW OPENS YOUR BRIEFING. … REBUILT FOR THE SAKE OF IT. | Body at a 430px measure |
| Promise | FROM YOUR ANSWERS WE PREPARE A SCOPE AND A PRICE. / YOU READ BOTH BEFORE ANYTHING IS CHARGED, / AND EVERY ACCOUNT WE SET UP IS REGISTERED TO YOU. | One paragraph set as a pull quote: grey body, Barlow 800 40px, grey body, against the red-glass sliver |
| Aside | TAKE IT AT YOUR OWN PACE. / WHATEVER YOU'VE ENTERED WILL BE THERE WHEN YOU COME BACK. | Right-aligned; first sentence Saira 500 17px |
| Action | BEGIN YOUR FOUNDATION → | Ink button in the perforated reply card → `/foundation/{{public_token}}?step=intake` |
| Printed link | site00.com/foundation/{{public_token}} | Saira 400 11px under the button (case preserved) |
| Sign-off | SITE 00 / DIGITAL FOUNDATION | Barlow 800 24px over a micro label, with the registration mark |
| P.S. | IF THE BRIEFING ASKS WHO REGISTERED YOUR DOMAIN AND NOBODY QUITE REMEMBERS, SAY SO. UNTANGLING THAT IS PART OF THE WORK. | Body beside a red Barlow 800 "P.S." |
| Footer | THIS MESSAGE WAS SENT TO {{recipient_email}} BECAUSE A DIGITAL FOUNDATION WAS PREPARED FOR {{business_name}}. IF YOU WEREN'T EXPECTING IT, NO ACTION IS NEEDED. / SITE 00 · site00.com | Caption |

## Drawing furniture added in R3

These are labels on the drawing, not prose. They are the only visible words not in COPY.md.

| Text | Where | Why |
|---|---|---|
| FIG. 01 · THE DOORWAY | Under the desktop doorway | Figure label; tells the reader the image is a figure in the letter, not decoration |

## Alt text (unchanged)

| Image | Alt |
|---|---|
| Doorway (desktop column and mobile band) | RED GLASS DOORWAY SET INTO A PALE MARBLE WALL, OPEN TO DAYLIGHT. |
| Icons, perforation | `alt=""` (decorative; the words beside them carry the meaning) |

## Fields and fallbacks (unchanged)

`business_name` missing: subject uses the no-name line; the PREPARED FOR block is dropped; lede reads "PREPARED A DIGITAL
FOUNDATION FOR YOU"; footer reads "BECAUSE A DIGITAL FOUNDATION WAS PREPARED FOR YOU". `public_token` required. `recipient_email`
required.
