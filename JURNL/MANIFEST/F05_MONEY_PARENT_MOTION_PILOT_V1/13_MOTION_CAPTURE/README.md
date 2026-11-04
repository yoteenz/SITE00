# 13 — Motion capture

- **`F05_MOTION_PREVIEW.gif` (320 px) and `F05_MOTION_PREVIEW.webp` (393 px):** the entrance (0 → 650 ms), a hold, then the account route morph.
- **`ENTRANCE_CONTACT_SHEET_mobile.jpg`:** frames at 0, 80, 160, 240, 320, 400, 480, 560 and 650 ms.
- **`ROUTE_TRANSITION_CONTACT_SHEET_mobile.jpg`:** the CASH ON HAND paper morphing into the account title at 0, 100, 200, 300 and 420 ms.
- **`mobile/`:** every frame as a JPEG. The small-phone and desktop frames are in the full ZIP.

The frames are exact, not timed screenshots. The E2E injects `animation-play-state: paused` before the page loads, then seeks every CSS animation (and, for the route, every view-transition pseudo-element) to each time with the Web Animations API.
