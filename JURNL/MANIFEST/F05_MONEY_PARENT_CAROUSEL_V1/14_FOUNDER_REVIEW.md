# 14 — Founder review: F05 MONEY parent, four-collection carousel

**Status: FOUNDER_REVIEW.** This is draft PR #1707, stacked on #1706. Nothing is merged or deployed, nothing was generated, and no database was touched. The pilot's original approval evidence (`F05_MONEY_PARENT_MOTION_PILOT_V1/`) is kept as it was.

**See it.** Open `/production/jurnl/runtime/money?parent=motion` in the preview and swipe the papers. Use `?parent=cabinet` to go back. The current MONEY page stays the default until you approve.

## What you will see

- **One MONEY page with four collections of four papers.** Swipe left and right on the papers, tap a dot, or use ← / → on a keyboard.
  1. ACCOUNTS (first)
  2. TRANSFERS
  3. COMMITMENTS
  4. OUTLOOK
- **Only the papers move.** The statue, arch, lemons, seal, MONEY, the summary band and the five-button dock stay exactly still. They are pixel-identical in all four collections; a test checks this.
- **The change itself.** The papers leave as a group toward the swipe, slightly staggered, and the next four come in from the other side and settle. The whole change takes about half a second. The page's own entrance does not replay. With reduced motion on, the collection simply changes.
- **Every number is live:**
  - TRANSFERS shows what is really in transit, pending or planned (#1706). Nothing in transit says NONE · NOTHING IN TRANSIT.
  - COMMITMENTS shows bills, money set aside for goals, card minimums, and RESERVED. RESERVED is exactly COMMITTED in the band.
  - OUTLOOK shows Safe to Spend (exactly AVAILABLE), your next expected income (or NOT SET · ADD A DATE), and spending you recorded.
- **Every paper opens something real**: an account, a transfer's step sheet, UPCOMING, GOALS, SAFE TO SPEND, INCOME, AHEAD, ACTIVITY, or the period breakdown. Closing a sheet, or coming back from a page, returns you to the same collection.

Preview: `11_MOTION/F05_CAROUSEL_CHANGE_PREVIEW.webp` (real speed) and `…_SLOW_x4.webp`. Side by side with your four screens: `09_FIDELITY/`.

## Where it differs from your four screens, and why

| Difference | Why | Your call? |
|---|---|---|
| The statue, arch and lemons are the SIDEKICK's, the same in all four | your four screens render them slightly differently (9–10 %). The directive asks for one continuous environment. | — |
| The papers sit a few px lower than in screens 2–4 | every collection uses the same four places, so nothing jumps between collections | — |
| The dots are a little further apart on phones | each dot is a real button ≥ 24 × 44 px, so a thumb can hit it | yes, if you prefer tighter dots with only a swipe |
| RESERVED: your screen $420 (= bills + payments); the pilot = COMMITTED | JURNL has one definition. RESERVED also includes money held back (goals, buffer, plans), so it matches COMMITTED above. | yes, if RESERVED should mean only bills + payments |
| IN TRANSIT "ARRIVING TODAY" → "LEFT, NOT ARRIVED" | JURNL records no arrival date and will not guess one | — |
| BILLS "THIS MONTH" → "NEXT 30 DAYS" | the figure is Safe to Spend's 30-day period | — |
| SPENDING INSIGHTS shows recorded 30-day spending and opens ACTIVITY | JURNL has no insights screen yet; nothing speculative is shown (doc 06) | yes: an insights screen is a separate sprint |
| More than four places: three papers + ALL PLACES · +n MORE | the four dots are the four collections, not pages of accounts | — |
| Tall phones: no third row any more | each collection is the 2 × 2 of your screens; the extra height becomes breathing room | — |

## Asset truth

- The papers are your art with true alpha and no baked text (doc 08).
- What would make it exact:
  - a SIDEKICK that includes the JURNL label;
  - a 2× export of the SIDEKICK and papers. At 941 px the art is slightly soft on 3× phones.

## Your decisions

1. **Founder decision gate.** Recommendation: **APPROVE THE CAROUSEL AS THE MONEY PARENT DIRECTION, WITH THE ASSET CORRECTIONS ABOVE.**
   - The four collections, motion, live data and destinations are complete and tested at four sizes.
   - The remaining gaps are source assets (2× export, label in the SIDEKICK) and one product question (RESERVED). Nothing in the method has to change.
2. **RESERVED.** Keep it equal to COMMITTED (the pilot), or show only bills + upcoming payments (your screen's $420)?
3. **Dots.** Keep the larger touch targets, or match the screen's tighter spacing?
4. **Make it the MONEY default?** It is a one-line switch, made only when you say so.

Please do not apply any of this to the F05 child pages or other families until you approve.
