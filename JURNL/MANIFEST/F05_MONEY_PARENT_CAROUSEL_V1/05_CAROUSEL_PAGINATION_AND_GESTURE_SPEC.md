# 05 — Pagination and gesture spec

## Four dots, four collections

- Four dots, always, one per collection: ACCOUNTS · TRANSFERS · COMMITMENTS · OUTLOOK. The dots never count accounts.
- **More than four places** do not add dots. ACCOUNTS shows three places and a fourth paper, ALL PLACES · +n MORE, which opens the full list (`money/places`).
  - A place just added is shown beside ALL PLACES, so its confirmation is visible.
- The dots sit centred under the four papers, where the reference puts them (C01: centre x 471, y 1280 source px).
- The active dot is filled. It changes with the collection, and the URL keeps the same state (`?c=`).
- No automatic rotation, no timers, and no wrap-around: the first and last collections are ends.

### Size: reference versus touch target

| | Reference (C01) | Pilot |
|---|---|---|
| dot | 17 source px, outlined, active filled | 17 source px, 2.4 px outline, active filled |
| pitch | 30 source px (≈ 13 screen px on a phone) | max(30 source px, 24 screen px) |
| target | — | each dot is a rectangular button: at least 24 screen px wide (WCAG 2.2 target size) and 44 screen px tall |

On phones the pitch therefore opens to about 54 source px. This is the one deliberate departure from the reference's dot spacing, made for touch and accessibility. It is in the fidelity record (doc 09).

## Gestures

| Input | Behaviour |
|---|---|
| Touch / pen drag | inside the carousel only (papers, the gaps between them, the dots). `touch-action: pan-y` keeps vertical gestures with the browser. The drag starts after 8 px and when \|dx\| > 1.2 × \|dy\|. It commits at 56 px or a 0.45 px/ms flick; otherwise it settles back. |
| Mouse drag | the same rules |
| Trackpad | a deliberate horizontal two-finger swipe (Σ\|deltaX\| ≥ 60, horizontal-dominant) steps once, then rests 600 ms. Vertical wheel is ignored. |
| Keyboard | ← / → anywhere in the carousel; focus moves to the paper in the same place of the new collection |
| Dots | select directly (direction follows order) |
| Previous / next | real buttons, visible on focus, `aria-disabled` at the ends |

## What gestures never do

- **Trigger a transaction.** A change only chooses which collection is read. The snapshot is byte-identical afterwards (E2E 20).
- **Open a paper by accident.** A drag that ends over a paper is swallowed by a capture-phase click guard.
- **Leave the carousel boundary.**
  - A horizontal drag over the title, the band or the dock does nothing.
  - A touch that starts within 20 px of the screen edge is left to the system's back / forward gesture.
- **Add history.** Changes use replace navigation (E2E 23: `history.length` is unchanged after several swipes, and back from a child route returns to the same collection).

## Known limits

- **macOS trackpad history swipe.** On Chrome for macOS, a horizontal two-finger swipe that the page does not consume can still trigger browser back or forward. The carousel consumes deliberate horizontal swipes over itself only. Outside it, the browser's behaviour is untouched, by design.
- **Device testing.** The motion constants (threshold, flick, resistance) are tuned in emulation. They need confirming on the founder's phone (directive §09F: "use actual device testing to refine timing").
