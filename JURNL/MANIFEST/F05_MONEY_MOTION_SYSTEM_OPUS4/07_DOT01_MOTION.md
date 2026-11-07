# 07 · DOT 01 MOTION (ACCOUNTS AND POCKETS)

Files: `screens/f05/dot01/Dot01Frame.tsx`, `PocketManager.tsx`, `jurnl-f05-dot01.css`, `screens/f05/surfaces/JurnlSurfaces.tsx`, `screens/MoneyScreens.tsx` (ADD A POCKET).

| Interaction | Choreography | State it follows | Proof |
|---|---|---|---|
| OPEN ACCOUNT | The selected paper lifts and carries its identity into the account title (shared element, unchanged). The account page then plays its own entrance **without** the 700 ms family blur fade on top (fix A). | the route | E2E F5, recording P01 |
| ADD A POCKET | The OV02 plate settles in (`jm-ovl-in` 420 ms) and closes with the shorter inert copy (220 ms). On save, the new pocket paper settles once (`f05m-return` via `data-settle`). The SIDEKICK never moves. | the store returned the new id | E2E W4, recording P02 |
| MANAGE POCKET | The OV04 note is presented from its pocket: a small lift and turn (`jm-note-in` 380 ms, origin at the pocket side; `-up` when it opens above). It pauses the ambience while open. Escape closes it with its own short copy; RENAME or DELETE replace it with no copy (the two never compete). Focus returns. | — | E2E O4, recording P02 |
| paperclip | **No response.** The paperclip is part of the single OV04 note image, not independently mounted (see 17). | — | — |
| RENAME (cream) | The cream paper presses (`translateY(1px) scale(0.992)`, 140 ms on paper easing). After the name is stored, the renamed pocket paper (parent rail or directory) settles once, delayed until the overlay copy has gone. On the account page the title is live type and does not move. | `renameAccount` returned ok | recording P02 |
| DELETE (blush) | Deliberate press: slower and lower (`translateY(1.5px)`, 200 ms, textile easing), never springy. | — | recording P02 |
| DELETE / ARCHIVE BLOCKED | The bronze warning seal settles once, slowly (`jm-warn-seal` 620 ms, 320 ms delay, one iteration). The caution text does not move and nothing celebrates. | `archiveBlockers` is non-empty | E2E F4, recording P02B |
| BALANCE CHANGES | On the parent, a pocket whose stored balance changed gets one warm opacity wash on its paper. Amounts never bounce or move. The account page's own figures do not animate. | the ledger position changed | E2E F3, recording P03 |
| seal sheen (ambient C) | On DOT 01 pages that draw an independent seal (SK01 field, the SK03 wide heading, screen seal layers). Overlay boards never offer ambience. | the director grant | unit A1 |

## Not added

- No per-row entrances in histories or directories.
- No motion on the account totals.
- No new motion for the directory's reorder drag; it already follows the pointer.
