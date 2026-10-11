# Email V2 benchmark — composition comparison

Same brand. Different conversations.

## Side by side

| | B01 Invitation | B02 Completion | B03 BLDR introduction |
|---|---|---|---|
| Composition | PERSONAL LETTER | MILESTONE RECORD | EDITORIAL FEATURE |
| Register | LETTER | RECORD | FEATURE |
| Emotional job | Attention, welcome, trust | Accomplishment, ownership, confidence | Curiosity, ambition, possibility |
| Opening | Letterhead naming the business | Status seal, then a monument | Full-bleed architectural hero |
| Image count (desktop) | 1 narrow photograph | 1 code-native monument, 1 closing photograph | 5 photographs, 3 code-native plans |
| Image scale | 128 px column | Full width, no crop of the subject | Full-bleed hero, alternating halves, full-width finale |
| Headline | 30 px, weight 600, sentence | 50 px, weight 700, red full stop | 52 px, weight 700, red full stop, side column lede |
| Numbering | None | 01–05, real delivery stages | 01–03, a walk through a building |
| Grid | Asymmetric two-column letter | Single column, ledger in two columns | Changes per section: split left, split right, full width |
| Red | Hairline, crosshair, inline button | Seal, slab edge, full stop | Hero glass, numerals, plan rooms, full-width band |
| CTA | Inline red button, link printed beneath | Black button | Full-width red band |
| Human close | Sign-off and P.S. | Ownership statement | One dry line, no urgency |
| Footer | Access notice with recipient email | Service notice | Full marketing footer |
| Words (body, measured) | 218 | 197 | 308 |
| Mobile recomposition | Doorway becomes a top band | Monument re-cropped, ledger stacks | Tall hero, full-bleed sections, plans become rows |

## What V1 did

V1 (`scripts/df-v2-lean-email-pack/build_pack.py` on `cursor/df-lean-email-pack-a9f7`) varied the middle block per template, but every email kept the same shell: envelope block, wordmark, one cropped photo at one of three fixed heights (`hero`, `hero slim`, `hero tall`) with empty alt text, a status line, short system sentences, and a button. Swapping crops and middle blocks inside one shell did not make twenty different conversations.

## How the variety was decided

Each composition follows from the reasoning in the email's editorial intent brief:

- An invitation from someone who wants to understand you first is a letter. A letter does not open on a hero.
- A completion is a moment, then proof. A monument, then a ledger.
- An introduction to a creative product needs to make the reader imagine. It earns the most images and the loudest red.

Automated check: `scripts/df-email-v2-benchmark/qa_copy.py` compares eleven structural features across each pair. Every pair differs in at least eight, including composition and CTA type. Shared five-word phrases between any two emails: none.
