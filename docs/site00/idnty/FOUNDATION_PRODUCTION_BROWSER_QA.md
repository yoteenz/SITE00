# Foundation production browser QA

**Sprint scope:** Gate A mobile + intake path  
**Production live test:** **NOT EXECUTED** (SPA/API SHA mismatch; no authorized Anthony artifact)

## Production probe (2026-10-10)

| Check | Result |
| --- | --- |
| `https://site00.com` loads | 200 |
| Bundle | `index.D8Jaygrd.js` (stale vs `main` `2001e373`) |
| DF catalog via API | 200 from `https://api.site00.com/.../digital-foundation-artifact?action=catalog` |

Full production intake E2E on site00.com deferred until coordinated cPanel + Railway deploy.

## Dev / agent evidence (previous sprint + local)

| Viewport | Evidence |
| --- | --- |
| 393×852 | `/opt/cursor/artifacts/gate-a-intake-initial.png` |
| 393×852 | `gate-a-intake-after-refresh.png` |
| 393×852 | `gate-a-intake-submitted.png`, `gate-a-intake-recommendation.png` |

Environment: cloud Vite + memory store (not production persistence).

## Mobile visual regression (required post-deploy)

Re-capture on **authorized production or preview-at-main** after SPA deploy:

- 390×844, 393×852 — P01, P02, P03
- 834×1194, 1440×900 — spot check

Inspect: uppercase type, component inputs, red CTAs, menu drawer (no blue links / gray overlay regression), bottom sheet safe area.

## Bottom sheet / navigation

- Menu: approved drawer from #1572 / #1573 — verify on deployed SHA only.
- Do not substitute generic modals.

## Status

**MOBILE_VISUAL_QA (production): BLOCKED**  
**MOBILE_VISUAL_QA (dev evidence): PARTIAL** (intake path only)
