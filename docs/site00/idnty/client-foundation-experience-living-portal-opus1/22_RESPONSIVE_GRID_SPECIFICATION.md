# 22 — Responsive Grid Specification

Five tiers, each with a distinct composition, decided by the viewport (`innerWidth`):

| Tier | Range | Gutter | Navigation | Main | Right column | Hero |
|---|---|---|---|---|---|---|
| **M** | 320–767 | 22 | fixed bottom bar 4 × (64 high) + safe-area inset | single column, max 520, bottom padding 96 | — | text 72% + crown object absolute right (46% × 300), headline `min(54px, 13.6vw)` |
| **TP** | 768–1023 | 40 | tab strip (46 high) under header | single column, max 720 | — | grid `1fr 240px`: text + framed object |
| **TL** | 1024–1279 | 36 | 112 icon rail (labels under icons, 76 high items) | `1fr`; inner two-column `1.2fr 1fr` for paired sections | — | grid `1fr 0.62fr` |
| **D** | 1280–1919 | 48 | 272 sidebar | `1fr`, inner max 1200; paired sections `1.35fr 1fr` | 340 status column | grid `1fr 0.62fr`, object `clamp(260px, 22vw, 400px)` |
| **UW** | 1920+ | 64 | 312 sidebar | inner max 1480 | 420 activity column | as D |

Measured specimen viewports: 320×700, 375×812, 390×844, 430×932, 768×1024, 820×1180, 834×1112, 1024×768, 1194×834, 1280×800, 1366×768, 1440×900, 1600×900, 1920×1080, 2560×1440, 3440×1440 (`32`, layout audit).

## Component reflow

| Component | M | TP | TL | D | UW |
|---|---|---|---|---|---|
| Progress | 7 ticks + caption | 7-cell strip | strip | strip | strip |
| Workstreams | 1 col | 2 col | 2 col | 4 col (2 when in roadmap side column) | 4 col |
| Recommendation cards | 1 col | 1 col | 2 col | 3 col | 3 col |
| Spec blocks | `34px 1fr 0.9fr` | same | same | same | same |
| Paired sections | stacked | stacked | side by side | side by side | side by side |
| CTAs | full width, stacked | auto width (min 260), row | row | row | row |
| Sheets | bottom, full width | bottom, 600 centred | dialog 560 / 820 wide | dialog | dialog |
| Access card preview | 300 | 420 | 460 | 460 | 460 |

## Invariants (audited)

- No horizontal document overflow at any audited viewport.
- No text below 10px. This is a refinement over the live client, which uses 7.5–9.5px in places (OD-01).
- No clipped mandatory labels, and no two-line buttons.
- Touch targets ≥ 44 × 44 on M/TP (bottom bar items 64 high; menu 44).
