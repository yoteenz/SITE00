# 01 — Four-collection visual authority manifest

Sprint: `P0.JURNL.F05-MONEY.PARENT-FOUR-PANEL-CAROUSEL-AND-MOTION-AUTHORITY-EXPANSION.OPUS1`. Continues the F05 motion pilot (PR #1707), whose financial baseline is PR #1706 at `274d7956`.

## Attachments: verified, by content (not by filename)

| Role (directive) | Received | File (as stored) | Size | Alpha | SHA-256 | Content check |
|---|---|---|---|---|---|---|
| C · CAROUSEL 01: YOUR ACCOUNTS | this message | `INPUT_V3_CAROUSEL/C01_ACCOUNTS.png` | 941 × 1672 RGB | none | `e0e0ec4d7abb6eed…c9712` | BANK ACCOUNT · RIDESHARE CARD · CASH ON HAND · CREDIT CARD; dot 1 |
| D · CAROUSEL 02: MONEY IN TRANSIT | this message | `INPUT_V3_CAROUSEL/C02_TRANSFERS.png` | 941 × 1672 RGB | none | `375fbc7d7e70f319…d1d92` | IN TRANSIT · PENDING · SCHEDULED · RECENT TRANSFERS; dot 2 |
| E · CAROUSEL 03: COMMITMENTS | this message | `INPUT_V3_CAROUSEL/C03_COMMITMENTS.png` | 941 × 1672 RGB | none | `4a5403b7eb4cbcd7…a32a` | BILLS + SUBSCRIPTIONS · SAVINGS · UPCOMING PAYMENTS · RESERVED; dot 3 |
| F · CAROUSEL 04: OUTLOOK | this message | `INPUT_V3_CAROUSEL/C04_OUTLOOK.png` | 941 × 1672 RGB | none | `45bf1574814e3131…5594` | SAFE TO SPEND · NEXT INCOME · 30-DAY OUTLOOK · SPENDING INSIGHTS; dot 4 |
| A · APPROVED MONEY PARENT | previous message | `INPUT_V2_9x16/MONEY_PARENT_REFERENCE_9x16.png` | 941 × 1672 RGB | none | `3de65c506e256c99…f4b7e1` | the parent, accounts collection |
| B · APPROVED SIDEKICK (with JURNL label) | previous message | `INPUT_V2_9x16/MONEY_PARENT_SIDEKICK_9x16.png` | 941 × 1672 RGB | none | `8afec51914001e17…0c` | text-free parent — **but without the JURNL torn-paper label** |

**ATTACHMENTS_VERIFIED: 6 / 6 roles available** (4 in this message, 2 from the previous message).

**One discrepancy (founder to note).** The directive says the approved SIDEKICK keeps the JURNL label at the upper left. The SIDEKICK supplied has no label there; the stone is bare.

- **How it is handled:** the label paper is lifted from the parent reference with real alpha and its ink removed, then placed over the SIDEKICK's own stone (doc 08). The live word JURNL sits on it.
- **What would make it exact:** a SIDEKICK that includes the label. Nothing else is needed.

## How the six relate (measured)

| Pair | Pixels differing by more than 24/255 | Meaning |
|---|---|---|
| C01 vs A (parent reference) | 15.6 % | C01 is a new render of the parent, not a copy |
| C02 / C03 / C04 vs C01, shell above the papers (y < 760) | 8.9 / 9.7 / 9.7 % | each screen re-renders the statue, arch and botanicals slightly differently |
| C02 / C03 / C04 vs C01, papers | 39.5 / 45.3 / 39.8 % | the papers are the intended change |
| C01 vs B (SIDEKICK), shell | 38.4 % | separate render (scale 0.987, 0.32°, 13 px shift; doc 18 of the pilot) |

**Decision (directive §02 and §08).** The parent shell is drawn once, from B, for all four collections. Only the papers come from C01–C04 (C01's papers are the SIDEKICK's own). This keeps the statue, arch and botanicals identical across collections. Per-screen variations in those areas are not reproduced, by design.

## Locked composition (A–K) and where each comes from

| | Element | Source | Moves during a collection change? |
|---|---|---|---|
| A | JURNL torn-paper identity | tag paper lifted from A (true alpha) + live text | no |
| B | statue and upper botanicals | SIDEKICK | no |
| C | architectural opening | SIDEKICK | no |
| D | wax seal | SIDEKICK → extracted layer (true alpha) | no (entrance only) |
| E | MONEY title paper | SIDEKICK → extracted layer (true alpha) + live text | no (entrance only) |
| F | script subtitle | live text (lowercase) | no |
| G | four-column summary | SIDEKICK band + live figures | no |
| H | central four-panel collection | per collection: papers from the SIDEKICK (01) or from C02–C04, live text | **yes: the only moving region** |
| I | four-position indicator | live buttons | the active dot changes |
| J | coastal illustration | SIDEKICK | no |
| K | five-button global navigation | the existing dock on the SIDEKICK's nav paper | no |
