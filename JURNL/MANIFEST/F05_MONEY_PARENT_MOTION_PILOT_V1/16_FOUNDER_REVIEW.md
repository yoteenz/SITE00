# 16 — Founder review: F05 MONEY parent motion pilot

**Status: FOUNDER_REVIEW (draft PR, stacked on #1706). Nothing is merged or deployed, and nothing was generated.**

**See it:** open `/production/jurnl/runtime/money?parent=motion` in the preview, and `?parent=cabinet` to go back. The current MONEY page stays the default until you approve.

## What was proven

1. **Your approved picture can become a real, layered page.** At its own 2:3 proportion, the live page sits on the approved composition: same bust, arch, lemons, seal, title paper, band, papers and nav paper. The environment matches the reference within about 5/255 on average.
2. **The pictures carry no text.** JURNL, MONEY, *where your money lives*, HELD / OWED / COMMITTED / AVAILABLE, every account name and amount, and the nav are live text. Names and amounts come from your accounts, not the image.
3. **The objects move on their own:**
   - the room establishes;
   - the title paper settles, and the seal presses in;
   - MONEY and the script reveal like ink;
   - the figures appear, never counting up from invented numbers;
   - the papers settle;
   - tapping a paper lifts it, and it becomes the title of that account's page;
   - coming back, it settles home.

   The whole entrance takes 650 ms, the dock never waits, and reduced-motion mode turns all of it off without losing anything.
4. **Money stays correct, and the motion follows it (#1706 settlement).**
   - A thread between two papers shows each unfinished transfer or card payment as recorded:
     - planned or submitted: the token rests on the paper the money will leave;
     - left but not arrived: the token sits midway, and the receiving paper says `← $80 IN TRANSIT` without adding to it;
     - arrived: the thread resolves into the destination, after the ledger has recorded it.
   - Failed or cancelled simply close; any money coming back is recorded by the accounting step, never by the animation.
   - A card payment says `CARD NOT CONFIRMED` until you confirm it, and only then does the debt fall.
   - Tapping a token opens the existing step sheet. AVAILABLE is exactly the Safe to Spend number, and nothing on the page changes a record by itself (doc 17).
5. **It holds up beyond the approved picture.** It handles 0, 1, 4 and 7 places, long names and big amounts, all four screen sizes, and keyboard use. Tests were rerun on this branch, not inherited (doc 12).

## What it is not (yet)

| Limit | Why | Fix |
|---|---|---|
| Not production-resolution | The only source is 1024 × 1536; a 3× phone wants ≈ 1266 px across | a native master at ≥ 2048 × 3072 |
| The panel ground between papers is reconstructed | The approved picture has cards painted over it, so what lies beneath does not exist. JURNL rebuilt it from the same paper; it is clean but flatter than the original, which shows most on tall phones and with few places. | deliver the panel paper on its own |
| The nav paper, band and title paper are partly reconstructed (under text and icons) | text was baked in | a text-free master of each paper |
| The bust and branches do not parallax | Moving them would expose wall that is not in the picture | the bust and branches delivered as separate layers |
| The typefaces are close, not identical | JURNL's serif (Playfair) is heavier than the reference's; the script is Pinyon (free licence) | your choice of the exact faces, with licences |

## Your decisions

1. **Founder decision gate.** Recommendation: **OPTION B — APPROVE WITH CORRECTIONS.**
   - The layered method works: real alpha, live data, independent motion, verified envelopes, responsive, tested.
   - The correction is to the source: production layers should come from a **native, layered master** (each paper, the seal, the bust and the panel as its own image at ≥ 2048 × 3072), not be extracted from a flattened picture.
   - With that master, the same pipeline and page drop in unchanged, and every "reconstructed" and "covered" region in this report disappears.
   - Please do not apply this to the F05 child pages until you approve.
2. **AVAILABLE.** Your picture's numbers mean HELD − OWED − COMMITTED ($2,450 − $780 − $420 = $1,250), which takes off whole card balances. JURNL's Safe to Spend takes off the card minimums due, and the pilot shows Safe to Spend. Keep that, or change Safe to Spend everywhere?
3. **Corner chips.** The picture has search and "+". The pilot keeps the global menu (account drawer) as a third square beside them, and the search goes to ACTIVITY because JURNL has no global search. Keep the menu on MONEY, or remove it there?
4. **Tall phones.** The extra height becomes a third row: up to 6 places per page, or ADD A PLACE and MOVE MONEY. Is that the right use of the space?
5. **Make it the MONEY default?** It is a one-line switch, done after the corrections in item 1, or before them if you prefer the pilot now.

## Files

| | |
|---|---|
| Motion preview | `13_MOTION_CAPTURE/F05_MOTION_PREVIEW.gif` (and `.webp`) |
| Fidelity | `11_VISUAL_FIDELITY_COMPARISON.md`, `11_FIDELITY/` |
| Before / after | `14_BEFORE_AND_AFTER_SCREENSHOTS/` |
| Asset truth | `02_ASSET_READINESS_REPORT.md`, `05_ALPHA_TRANSPARENCY_QA.md` |
