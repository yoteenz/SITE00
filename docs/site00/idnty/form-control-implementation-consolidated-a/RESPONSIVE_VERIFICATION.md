# Responsive verification

## Method

Chromium Playwright captures against local Vite (`npm run dev`, port 5174) on the Digital Foundation **review harness** route `/foundation/review`.

Script: `scripts/df-consolidated-a-visual-capture.mjs`

## Viewports targeted (sprint §28)

| Viewport | Capture |
| --- | --- |
| 390 × 844 | P02 contact + System B service row |
| 320 × 700 | P02 field stack (narrow) |
| 834 × 1112 | Tablet portrait P02 / P03 |
| 1194 × 834 | Tablet landscape |
| 1440 × 900 | Desktop proportions |

## Checks

- No horizontal overflow on phone error states.
- Checkbox alignment on service rows.
- Label wrapping for CONTACT NUMBER helper.
- Existing progression chrome unchanged at each width.

## Limits

- **Actual iPhone Safari / VoiceOver:** NOT RUN (Chromium emulation only).
- Font load timeouts may require `domcontentloaded` + reduced wait; captures stored under `/opt/cursor/artifacts/df-consolidated-a-visual/`.

## Results

See `VISUAL_REGRESSION_REPORT.md` and `manifest.json` in the artifact directory after capture run.
