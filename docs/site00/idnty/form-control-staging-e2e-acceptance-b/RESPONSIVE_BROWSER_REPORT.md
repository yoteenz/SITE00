# Responsive browser report

## Live staging

**NOT RUN** — stale deploy; would not reflect Sprint A UI.

## Local review harness (integration @ 255576b5)

**Script:** `scripts/staging/verify-form-control-responsive-local.mjs`  
**Base:** `http://127.0.0.1:5174/foundation/review#df-r-P02`  
**Engine:** Playwright Chromium

| Viewport | Horizontal overflow |
| --- | --- |
| 320×700 … 1920×1080 (11 sizes) | **0 failures** |

**Artifacts:** `/opt/cursor/artifacts/form-control-staging-b/responsive/report.json` + PNG per viewport.

**Limitation:** Local dev is not staging deploy proof. Re-run against carefree-luck after redeploy.
