# 08 · Responsive REFERRALS authority

REFERRALS inherits the **OPUS2 responsive system unchanged** (`founder-workspace-responsive-authority-opus2/08_RESPONSIVE_GRID_SPECIFICATION.md`, `ws.css`). This document states what REFERRALS adds on top of it. Each tier is designed independently. No tier is a scaled version of another.

## 1. Inherited rules

| Rule | Value |
| --- | --- |
| Viewport tiers | M < 768 · TP 768–1023 · TL 1024–1279 · D 1280–1919 · UW ≥ 1920 |
| Navigation | M: header + bottom bar + menu drawer · TP/TL: 80 px rail · D: sidebar 224 (1280–1599) / 248 (≥ 1600) |
| Stage gutters | 16 · 24 · 28 · 32 / 40 |
| Stage container | `container: stage`; container tiers cs < 640 · cm 640–919 · cl 920–1439 · cx ≥ 1440 |
| Inspector | Docks only when viewport − nav − inspector ≥ 680 px (from ~1100 px); otherwise bottom sheet. Width clamp(344, 24vw, 420) → clamp(420, 18vw, 480) from 1920 |
| Content max | 1560 / 1760 centred; ultra-wide remainder becomes quiet gutter |
| Overlays | `data-m / data-t / data-d` presentation per overlay (`ov()`), full-screen or sheet on phones |
| Density | ws-relaxed (overview, partner detail) · ws-standard (ledgers) |
| Type | SITE 00 Display (titles, numbers) · Saira Semi Condensed (all else) · uppercase · min 10 px rendered |

## 2. REFERRALS container rules (component-level)

Components read **their own width**, not the viewport:

| Component | Container | < 600 / < 640 | ≥ 600 / 640 | ≥ 900 / 960 / 1100 / 1440 |
| --- | --- | --- | --- | --- |
| Signals strip `.rf-signals` | parent | 2-up; odd last spans 2 | 3-up (`--4`: 4-up) | `--5`: 5-up at 900 |
| Overview grid `.rfo` | stage | sig · focus · partners · money · act · cards | 2 columns | 1100: partners \| money/act, focus hidden · 1440: three columns |
| Partner registry `.prt` | prt | thumb + name/type/status + count | + TYPE · STATUS, REFERRALS (600) | + CONVERTED · OWED · CARD (900) |
| Ledgers `.ldg` | ldg | composite row: left two-line, right amount + state | `--cols-t` (4 columns) at 600 | `--cols-d` (7 columns) at 960 |
| Card Studio `.cs-wb` | stage | stacked | stage \| controls at 920 | picker \| stage \| controls at 1440 |
| Link + QR `.qrsplit` | qs | QR (≤ 160) above facts | QR 136 beside facts at 460 | — |
| Portal `.pt-grid` | stage | stacked | 2 columns at 920 | 3 columns at 1300 |
| Section nav `.rf-secnav` | stage | select button → RO-S sheet | tab row | tab row |

**Bug class prevented:** a container query cannot style the container itself. Column variables are therefore set on the rows (`.prt__h, .prt__r`), not on `.prt`. Found and fixed during this sprint at 834 px (R07).

## 3. Invariants checked at every tier

1. Bottom bar never changes (M); REFERRALS never takes a bottom slot.
2. State chips (`.cs`) and status marks never truncate. Labels wrap; they do not ellipsize. Truncation of a mandatory label fails the audit.
3. Amounts are right-aligned, tabular, and use minor units formatted at the edge. Negative amounts keep the minus sign (`−$50.00`) and are red.
4. Cards (`.rcard`) are `min(100%, var(--cw))` wide, so they never overflow a narrow stage. They keep the 3.5 : 2 ratio and scale type by container (`cqw`).
5. QR placeholders keep a white panel and quiet zone at every size. Their label stays legible (≥ 8 px rendered).
6. No horizontal page scroll. Tab rows may scroll inside their own container.
7. Primary actions remain reachable with the software keyboard open (RO-15 with `kb`, R21).
8. Spec tag (*SPECIMEN · ILLUSTRATIVE VALUES · NO RATE PROPOSED*) wraps at 320 px instead of widening the stage. This was found and fixed during the sprint (R01).

## 4. Tier documents

- Desktop and ultra-wide — doc 09
- Tablet portrait and landscape — doc 10
- Mobile — doc 11
- Component × tier matrix — doc 31 and board R41

## 5. Verification

`boards/audit-layout.mjs` loads every REFERRALS specimen state at the 16 sprint viewports in Chromium. It measures overflow, collisions, zero-size text, inspector docking, truncation of mandatory labels, multi-line buttons, minimum text size and font faces. Results are in `verification/layout-audit-summary.md` and doc 34.
