# 14 · Live React screenshot manifest

Sprint: `P0.SITE00.IDNTY.FOUNDER-WORKSPACE.OPUS-VISUAL-IMPLEMENTATION-RECOVERY2` · Branch `cursor/founder-workspace-full-authority-implementation-composer1-be3b` · PR #1665 (draft) · Base `8761463ec` · Implementation `0095c8b3d`


How: the real React app on the local Vite dev server (`/admin/site00/founder-workspace/*`, opened through the existing local
`AdminGuard` path — **not** an authenticated production session). Playwright (Chromium) intercepts
`/api/admin/site00-foundation` with clearly fictional rows (OPUS1 demo names, `.invalid` emails); every POST is refused
(409) except two capture-only fixtures used to reach OL-02 and the Test Lab journey. Harness and job lists:
`evidence/data/capture-harness.mjs`, `jobs-matrix.json`, `jobs-ov.json`. Per-capture audits: `react-matrix-captures.jsonl`
(168), `overlay-captures.jsonl` (116).

| Set | Count | Files |
| --- | --- | --- |
| Page families × 14 viewports | 140 | `evidence/matrix/*-14-viewports.jpg` |
| States (empty, error, quote, toast) | 28 | `evidence/states/states-1…4.jpg` |
| Overlays, 40 families × applicable tiers | 116 | `evidence/overlays/{OL,RO}-{phone,tablet,desktop}.jpg` |
| Authority vs React pairs | 16 | `evidence/compare/*.jpg` |
| Recovery 1 regression | 4 | `evidence/recovery1-regression/*.jpg` |

Authenticated screenshots: NOT CLAIMED (no authorized authenticated access from this container).
