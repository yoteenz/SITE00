# 08 · DOT 02 – DOT 04 MOTION COVERAGE

DOT 02 TRANSFERS, DOT 03 COMMITMENTS and DOT 04 OUTLOOK are collections in the MONEY parent's carousel (`CarouselPanelPaper.tsx`). They are not separate runtimes. Collection changes use the swipe contract in 06. Opening a panel opens its owner: `TransferDetailSheet`, `SafeHorizonSheet` or the owning page.

## DOT 02 · TRANSFERS: state-true feedback

Source: `finance/FinanceSheets.tsx` (`transferStateResponse`, `TransferDetailSheet`, `ErrorLine`) and `MoneyMotionParent.tsx` (threads, tokens, balance wash).

| State | Visual (from the record only) | One-shot response | Notes |
|---|---|---|---|
| form interaction | the OV03 plate settles in (420 ms); press transforms on controls | — | inputs respond immediately |
| validation refused | the error line appears and nudges once (`errorNudge` 320 ms) | ERROR | the figure never moves |
| TRANSFER RECORDED | the sheet closes with its shorter copy. If the record changed a stored balance, that pocket's paper washes once. | `balanceAck` on the changed paper | **No completion motion.** A recorded transfer is not a completed external movement. |
| SCHEDULED / PENDING | thread present; the token rests on the source paper (nothing has left) | none | no progress is invented |
| IN TRANSIT | the dashed half-thread; the token rests between the papers | none | no percentage, no arrival time, no travelling animation |
| ARRIVAL CONFIRMED (a recorded step) | the thread resolves into the destination (unchanged `f05m-arrive`); in the detail sheet the status line settles once | `paperSettle` (CONFIRMED) | distinct but restrained |
| FAILED | the thread closes; the status line settles calmly | `warningSettle` (WARNING) | no shake |
| RETURNING | the token rests between the papers again; calm settle | `warningSettle` | — |
| REVERSED | the status settles calmly; the HISTORY list in the sheet keeps the original record | `warningSettle` | the correction never implies the record vanished |
| NEEDS RECONCILIATION | calm settle; neither account changes until the person says what happened | `warningSettle` | — |
| CANCELLED | the thread closes | none | — |

All responses fire from `useStateResponse` on the transfer's stored state: never on open, never on a re-render (unit F1, F2; E2E F3).

**Wax stamp after persistence: not used.** The OV03 shell's direction seal is part of the shell image, not independently mounted. A stamp would need to move the whole shell, which the sprint forbids. Recorded as an extraction need in 17.

## DOT 03 · COMMITMENTS

- These panels read obligations and reservations. Opening one leads to its owner (bills, plans, the planning period).
- There is no new committed-state signal specific to this collection, so it has no material response of its own.
- It shares the carousel motion, overlay entrance and exit, error nudge and the director's pauses.
- Reported honestly: **PARTIAL**. The shared vocabulary applies; there is no commitment-specific choreography.

## DOT 04 · OUTLOOK

- These panels read the planning horizon (`SafeHorizonSheet`).
- The sheet has no stored value of its own to confirm, so it gets no response.
- It shares the carousel and overlay motion.
- Reported honestly: **PARTIAL**, for the same reason as DOT 03.
