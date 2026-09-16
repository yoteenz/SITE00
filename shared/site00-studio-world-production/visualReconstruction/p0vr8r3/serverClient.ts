/**
 * P0.VR.8R3 — Node/API-only capture orchestration (Playwright, pngjs boot probe).
 * Do not import from `src/` — use `browserClient.ts` in the SPA.
 */

export { runBrowserBootProbe, CAPTURE_WORKER_TEST_SCREENSHOT_REL } from './browserBootProbe.js';
