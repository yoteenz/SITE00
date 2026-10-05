# JURNL F01 — LIVE BROWSER QA PROOF

> Viewport delivery proof (everything driven through DESIGN → JURNL → VIEWPORT, 163/163): see
> [F01_LIVE_VIEWPORT_DELIVERY.md](F01_LIVE_VIEWPORT_DELIVERY.md).

Run: `node scripts/jurnl/live-qa-f01.mjs http://127.0.0.1:5174 artifacts/jurnl-f01-live-qa` (Playwright, headless Chromium,
real SITE 00 dev server, real routes — no unit-test claims).

**Result: 103 / 103 PASS · page errors 0** → `artifacts/jurnl-f01-live-qa/LIVE_QA_REPORT.json`

## Route walked

`/production/ndxbook/design?mode=brand` → host PROJECT switcher → **JURNL** → `/production/jurnl/design?mode=brand` → EXPERIENCE →
SURFACES → COMPILER → ASSETS → inspector tabs → VIEWPORT (MOBILE / TABLET / DESKTOP, SAFE AREA, GRID, BOUNDS, REFERENCE, STATE
select) → switch back to NDXBOOK (stale JURNL state cleared) → runtime flows at `/production/jurnl/runtime/entry/*` (393×852).

## Checks by group

| Group | Checks | Group | Checks |
|-------|--------|-------|--------|
| SELECTOR | 6 | DRAWER | 15 |
| CONTEXT | 2 | ERROR | 9 |
| FIREWALL | 2 | TOAST | 7 |
| MODES | 5 | PASSWORD | 5 |
| INSPECT | 6 | HANDOFF | 4 |
| VIEWPORT | 11 | STATE | 4 |
| OVERLAYS | 4 | LOADING | 3 |
| ROUTING | 6 | MODAL | 3 |
| FORM | 2 | SHEET | 2 |
| INLINE / TOGGLE / CHOICE / CHECKBOX | 1 each | TRANSITION / UPPERCASE / GEOMETRY | 1 each |

## Proof outputs (`artifacts/jurnl-f01-live-qa/`)

| Folder | Content |
|--------|---------|
| `workspace/` | 22 captures: NDXBOOK before switch, PROJECTS switcher, JURNL BRAND / EXPERIENCE / SURFACES / COMPILER / ASSETS, inspector (screens, interactions, gate, claims, assets, budget), viewport mobile / safe+grid+bounds / reference compare / tablet / desktop / LOCKED state, NDXBOOK after switch back, mobile host |
| `flows/` | 40 captures: every drawer, sheet, modal, handoff, error, toast, loading and transition exercised (F01.00 → F01.13 → F02 boundary) |
| `screens/` | 42 captures: 14 screens × mobile 393×852 / tablet 834×1194 / desktop 1440×900 + `CAPTURE_REPORT.json` (lowercase glyphs 0, horizontal overflow 0, page errors 0 on all 42) |
| `compare/` | 14 authority-vs-live sheets (child authority left, live runtime right) for the visual fidelity pass |

## Defects found by live QA and fixed in this sprint

- Error-panel action label invisible (descendant `span` colour rule) → child-combinator fix + check asserts `TRY AGAIN` visible.
- PROJECTS menu rows broken inside DESIGN (`.pxa .ph-img` absolute) → host CSS fix + layout check (D-15).
- Headlines ~25–40 % smaller than authorities on recovery / hero screens → display scale steps; authored lines never re-wrap.
- Foreground plant behind CREATE ACCOUNT legal copy / RESET SENT link → scene offsets keep it below the last line of copy.
- Proof captures taken mid-animation → capture helper settles finite enter animations first.
