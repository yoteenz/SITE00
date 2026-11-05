# 15 · Accessibility and focus QA

* Every composition: `role="dialog" aria-modal="true"`, labelled by its live headline; first control focused; Tab trapped;
  Escape closes; focus returns to the opener (E2E A1: back to `f05m-actions`; B2: back to the pocket card; B5).
* Decorative layers `aria-hidden`, `pointer-events: none`; a tap at the centre of every art layer reaches the control or the
  ground, never the art (E2E A1 / B4 `artTakesTaps = 0`).
* Hit targets: action fragments ≥ 112 px tall (01), choices ≥ 44 px, close 44 × 44, foot actions ≥ 52 px.
* SelectionSheet (legacy, F09 CHECK PURCHASE category / pay-with): now uses the shared `useOverlayFocus` with a stable close —
  focus trapped through 14 Tabs, Escape closes, focus returns to `check-category` (E2E B5). The other legacy overlays
  inherited from JurnlDrawer / JurnlSheet / Dot01Overlay already trap focus.
* Long press is never the only way: MANAGE POCKET also opens by right-click, the ContextMenu key / Shift + F10 and the MANAGE chip.
