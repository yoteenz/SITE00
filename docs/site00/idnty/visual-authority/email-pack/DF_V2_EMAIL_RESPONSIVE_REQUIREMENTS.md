# Digital Foundation V2 — responsive email requirements

**Sprint:** `P0.SITE00.IDNTY.DIGITAL-FOUNDATION.V2-GROK-COMPLETE-EMAIL-PACK-INVENTORY-CREATIVE-COVERAGE-AND-COST-AUDIT1`  
**Date:** 2026-10-11

Emails are not application screens. The 9:16 product geometry used for foundation parents is not the email master. H02 and H03 are 16:9 visual references (3584×2016). Stage 1 design boards follow the widths below. Stage 2 HTML is a later gate.

## Targets

| View | Width | Role |
| --- | --- | --- |
| Desktop email | 640px outer table, 600px content column | Primary design board |
| Mobile email | Fluid 100% up to 600px, tested at 375px and 320px | Stacked column, full-width button |
| Client preview | Same two widths, rendered later in Apple Mail, Gmail, and Outlook | Stage 2. Not part of this audit. |

Each of the 20 templates carries **2** responsive design contracts (mobile and desktop). That is 40 contracts. They share modules. Premium does not double the OpenArt job count to buy a second aspect ratio. A crop note on a new plate is a design note. The provider bills a job, not a crop.

## Layout rules

- Table-based structure for Outlook, with a bulletproof button (MSO conditional plus a normal link).
- Single column. No side-by-side cards under 600px.
- Critical copy is live HTML text. Hero images are decorative. If images are blocked, the subject, preheader, headline, body, and CTA still read.
- One primary CTA. Minimum tap height 44px. Full width on mobile.
- Body size at least 14px. Headlines can be larger. Uppercase body uses line-height about 1.5 and open tracking so the text stays readable.
- Preheader is hidden preview text, still uppercase, still meaningful when the images do not load.
- Dark mode: design masters stay luminous white. Stage 2 sets explicit background and text colors and tests Apple Mail and Outlook inversion. Do not rely on a screenshot of the white board as the dark-mode spec.
- Alt text on decorative architecture is short. Do not put the only copy of the offer inside the image.

## What not to do

- Do not ship H02 as the mobile HTML.
- Do not frame the email as a phone bezel.
- Do not bake `{{tokens}}` into a generated image.
- Do not use a 9:16 parent plate as the email background.

## Clients named for Stage 2

Apple Mail, Gmail, Outlook (Word engine), plus image blocking, dark mode, and a 320px viewport. This audit does not claim those clients were rendered.
