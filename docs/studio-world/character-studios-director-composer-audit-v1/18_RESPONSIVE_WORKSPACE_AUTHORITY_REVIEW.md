# 18 — Responsive workspace authority review

No final design is produced here. This records the rules a Composer must keep and where each part should sit.

## 1. Rules in force

| Rule | Where | Enforced by | Class |
| --- | --- | --- | --- |
| The document never scrolls | `useBodyLock()` in `ProductionAuthorityFrame.tsx`, `PwFrame.tsx`, `ProductionHub.tsx`; `.pxa { position: fixed; inset: 0 }` (`site00-production-authority.css:12`) | Code | LIVE_AND_VERIFIED per memory |
| Frame body scrolls by default | `.pxa-scroll { overflow-y: auto }` | HUB, LIBRARY, ACTIVITY, EXPERIENCE, EXPRESSION root | IMPLEMENTED |
| No frame scroll; inner panels scroll | `.pxa[data-screen^='expression-'] .pxa-scroll { overflow: hidden }` (`site00-production-expression-family.css:16`); same for INBOX and DESIGN; inner panes `[data-scroll="internal"]` | `productionExpressionAuthorityConvergenceOpus1.test.ts` (40 routes × 5 viewports); INBOX and DESIGN suites | LIVE_AND_VERIFIED (INBOX, DESIGN, EXPRESSION families) |
| Phone exception | At 699 px and below, a CONTENT media-geometry grid turns frame scroll back on (`site00-production-workspace-density.css:990-997`) | `productionWorkspacePanelMediaGeometry2` | IMPLEMENTED |
| Viewport classes | Mobile under 700, tablet 700–1119, desktop 1120 and up (`src/site00/config/production-authority-registry.ts:24-31`) | `productionAuthorityAlignmentSonnet1R1.test.ts` | LIVE_AND_VERIFIED per memory |
| Phone chrome | 864-px chrome scaled to `min(innerWidth, 520) / 864` on phones only (`productionHub/chrome.tsx:21-57`); tablet and desktop host strips at native size | Host-chrome CSS tests (no zoom, transform, viewport units, rem or clamp) | LIVE_AND_VERIFIED per memory |
| Density authority | `config/production-workspace-density.ts`; media panels declare `data-media-slot` and `data-media-fit` | `productionWorkspaceResponsiveDensityMedia1.test.tsx` | LIVE_AND_VERIFIED per memory |
| Ultra-wide | Only `@media (min-width: 2200px) .pxa .hubx { max-width: 2200px }` (`site00-production-hub-reconstruction.css:913-916`) | — | PARTIALLY_IMPLEMENTED (HUB only) |
| No circular tappable buttons; no generic dashboard or card stack | `docs/studioos/visual-authority-development/BRAND_EXPRESSION_GATE.md` #18, #11, #12; `docs/site00/builder-experience/HYBRID_SPATIAL_STUDIO_V1.md:225` | Visual-authority gate (scoped to that gate) | SPECIFICATION_ONLY for production workspaces |

"Per memory" means the evidence is the motherboard memory and artifact reports (2026-10-06: 105 of 105 routes at 393, 834 and 1440). This audit did not re-run them.

**Navigation.** Code order is HUB, INBOX, EXPERIENCE, DESIGN, EXPRESSION, LIBRARY, ACTIVITY (`PRODUCTION_GLOBAL_TAB_ORDER`, `production-authority-registry.ts:13`). The sprint lists DESIGN before EXPERIENCE. Memory records "DESIGN tab centered" (2026-10-06). Nothing is changed. The founder confirms the order (G-WS-05).

## 2. Composer regions by viewport

| Region | Phone (under 700) | Tablet (700–1119) | Desktop (1120+) | Ultra-wide (2200+, to be defined) |
| --- | --- | --- | --- | --- |
| Primary stage (frame or take) | Full width, always visible | Left, about two thirds | Centre | Centre, capped like HUB |
| Shot list | Horizontal strip under the stage (reuse `Filmstrip`) | Strip | Left rail | Left rail |
| Inspector (references, model, settings, cost detail, checks) | Bottom sheet on demand; internal scroll | Right panel | Right panel | Right panel |
| Model settings | Inside the inspector | Inside the inspector | Inside the inspector | Inside the inspector |
| Timeline | Not shown; a "view timeline" sheet | Collapsed strip | Bottom strip, collapsed by default | Bottom strip, open |
| Asset rail | Inside the inspector (reference tray) | Inside the inspector | Inside the inspector | Its own rail |
| Review panel (takes) | Separate screen: `performance/takes` | Separate screen | Separate screen, or a take strip under the stage | Beside the stage |
| Actions (Generate, Approve) | Fixed action bar, rectangular controls, credit estimate beside Generate | Same | Same | Same |

**Phone rules:**
- one technical panel at most at a time;
- the frame never scrolls, and the Composer must not use the CONTENT media geometry that re-enables it (G-WS-06);
- the shot strip and the inspector sheet scroll internally.

## 3. Existing authority against new exploration

| Surface | Authority |
| --- | --- |
| Storyboard root, keyframes, sequence detail | Existing (`06_Storyboard/*`) |
| Takes | Existing (`04_Cast_Performance/03_takes`) |
| Casting, Look, Sets, Review families | Existing |
| **Shot detail (stage plus inspector)** | **Missing: new visual authority exploration needed** (D-12) |
| **Ultra-wide arrangement** | **Missing** (G-WS-03) |
| Authorization step and budget in Review | Existing family; a budget panel needs exploration inside it |

Only the two missing surfaces need new authority. Nothing else is redesigned.

| # | Recommendation | Owner | Depends on | Acceptance criterion |
| --- | --- | --- | --- | --- |
| W-01 | Shot detail authority at 390, 834 and 1440 (plus 2560) | Studio World | D-12 | Founder approves the authorities before any build |
| W-02 | Composer routes in the EXPRESSION no-scroll suite | Studio World | U-01 | Convergence suite passes for the new route at all viewports |
| W-03 | State the circular-button and dashboard rules for production workspaces | Studio World | none | The Composer authority brief cites them |
