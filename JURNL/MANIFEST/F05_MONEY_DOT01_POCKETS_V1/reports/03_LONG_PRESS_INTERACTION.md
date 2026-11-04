# 03 · Long press (ENTRY A)

`runtime/screens/f05/dot01/PocketManager.tsx` · `useLongPress(onLongPress)` → `bind(pocketId)`.

## Where

| Surface | Element | Opens |
|---|---|---|
| MONEY parent (`money?parent=motion`) | each Pocket paper in the ACCOUNTS collection (`f05m-place-<id>`) | MANAGE POCKET anchored to the paper |
| ALL ACCOUNTS (06) | each Pocket card (`d01-place-<id>`) | the same, anchored to the card |
| Pocket page (02–05) | the balance paper (`d01-pocket-hold`, an `aria-hidden` hit area over the CURRENT BALANCE paper) | the same, anchored to the balance |

## Rules

| Rule | Value / behaviour |
|---|---|
| Hold time | **520 ms** (`LONG_PRESS_MS`): long enough that a tap never fires it, short enough to feel direct |
| Movement slop | **10 px** (`LONG_PRESS_SLOP`): any move past it cancels (a scroll, a swipe, a drag) |
| Cancels | `pointerup`, `pointercancel`, a move past the slop, any `scroll` (capture), any `wheel` / trackpad scroll, unmount |
| Pointer capture | the hold is followed on `window`, so the carousel's pointer capture (swipe) cannot hide the move that cancels it |
| After a hold | the click that follows is swallowed (900 ms window): **a hold never also opens the Pocket** |
| Mouse | primary button only; a held left button works the same as a finger |
| Right-click | `contextmenu` opens the same menu (the browser's menu is prevented). On touch platforms that fire `contextmenu` on a long press, it is de-duplicated with the timer (one menu). |
| Keyboard | **Shift + F10** or the **ContextMenu** key on a focused Pocket; advertised by `aria-keyshortcuts="Shift+F10"` and `aria-description="PRESS AND HOLD, OR SHIFT F10, TO MANAGE THIS POCKET."` |
| Not the only way in | the MANAGE POCKET chip on every Pocket page (doc 04), and ACCOUNT DETAILS → EDIT / ARCHIVE as before |
| Haptics | `navigator.vibrate(12)` where it exists (Android Chrome). iOS Safari has no vibration API, so there is no haptic there and no fallback is faked. |
| Feedback while holding | `data-holding` on the element: a 0.985 settle over 420 ms (transform only); none under reduced motion |
| Platform callouts | `-webkit-touch-callout: none` and `user-select: none` on the cards and papers, so iOS shows no link preview or text selection during a hold |
| Reorder | the reorder list (32) is a separate list with its own drag grip and no hold handlers. A drag in normal mode passes the slop and cancels. |

## Proved (E2E, all four sizes)

On the phone projects (small 360 × 780, mobile 393 × 852) the hold is a real touch sequence: CDP `Input.dispatchTouchEvent` touchStart → wait → touchEnd. On tablet and desktop it is a mouse press.

| Test | Proves |
|---|---|
| T01 | a tap on a card / paper opens its Pocket |
| T02 | a hold on a directory card, a parent paper and the balance paper opens MANAGE POCKET (named `MANAGE POCKET: <name>`) |
| T03 | the URL is unchanged 400 ms after the hold is released; Escape returns focus to the held Pocket |
| T04 | a 60 px finger move during a hold, a wheel scroll during a hold, and a horizontal carousel swipe across a paper each open no menu; a 60 ms tap still opens the Pocket |
| T05 | after a hold, reorder still works by buttons and the saved order persists |
| T19 | Shift + F10 on a focused card and on a focused parent paper opens the menu |
