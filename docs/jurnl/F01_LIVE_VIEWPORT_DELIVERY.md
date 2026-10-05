# JURNL F01 — LIVE VIEWPORT DELIVERY

Follow-up: `P0.JURNL.SITE00-F01-LIVE-VIEWPORT-DELIVERY1` (adds a hard delivery gate to
`P0.JURNL.SITE00-INGEST-F01-DESIGN-WORKSPACE-PROOF1`).

## How to open it

| Surface | Path | What you get |
|---------|------|--------------|
| **Primary: DESIGN viewport** | `/production/jurnl/design?mode=viewport&family=F01` | The real JURNL runtime mounted inside SITE 00 DESIGN → VIEWPORT. Controls: VIEWPORT PRESET (MOBILE 393×852 · TABLET 834×1194 · DESKTOP 1440×900), FAMILY (F01 ENTRY · F02 SETUP boundary), ROUTE (F01.00–F01.13), STATE (27 state authorities + overlays), SCENARIO (network error, offline, OS outcomes, link states), SAFE AREA, GRID, BOUNDS, REFERENCE, ORIENTATION, ZOOM. |
| From anywhere in DESIGN | host PROJECT chip → **JURNL** → BRAND → **FAMILY RUNTIME · OPEN LIVE** (or the VIEWPORT tab) | Same as above. SURFACES → MOBILE / TABLET / DESKTOP REVIEW open the viewport at that preset. Inspector SCREENS / STATES rows → OPEN › deep-link into the viewport. |
| **Secondary: direct preview** | `/production/jurnl/runtime/entry` (any F01 route: `/production/jurnl/runtime/entry/sign-in`, …) or **OPEN DIRECT PREVIEW ↗** in the viewport panel | The same runtime, full screen, no workspace chrome. On a phone it is the app at native size. |

Both surfaces are behind the internal production guard (founder sign-in), exactly like the rest of `/production/*`.

**One implementation, one component tree, one routing system.** The viewport iframe and the direct preview load the same
lazy module (`src/projects/jurnl/runtime/JurnlRuntimeRoot.tsx` → `JurnlRuntimeRoot.<hash>.js` in production) through the same
registry (`src/site00/projectRuntime/projectRuntimeRegistry.ts`) and route (`/production/:projectSlug/runtime/*`). Verified
live: the viewport iframe and the direct preview request the identical runtime root module.

Inspection controls (STATE, SCENARIO, overlays) live only in the host viewport panel. The JURNL app itself has no debug UI;
the runtime only honours `?state=` / `?overlay=` / `?scenario=` query switches in design-preview mode.

## Hosting audit (existing machinery only — no new stack)

| Mechanism | Status | Used for JURNL |
|-----------|--------|----------------|
| SITE 00 SPA (Vite build → `dist/`) | canonical | **Yes** — JURNL is a lazy chunk of the same SPA; `/production/jurnl/runtime/*` is a route of it. |
| GoDaddy cPanel static hosting (`site00.com`) via `.github/workflows/site00-production-deploy.yml` | canonical; repo vars `SITE00_AUTO_PROMOTE=true`, `GODADDY_DEPLOY_ENABLED=true` (FTP) | Intended path: merge to `main` → test → build → deploy. **Blocked**: the `test` job has failed on every `main` run since at least #696 (pre-existing failures: missing Supabase migrations in CI, stale expression-engine assertions, …), so `build` / `deploy_frontend` never run. |
| `.github/workflows/deploy-godaddy.yml` (legacy, manual dispatch) | kept for emergency | Builds `main` with production secrets **without** the test gate; with `GODADDY_DEPLOY_ENABLED=true` it FTP-deploys to site00.com. A production action — run only on founder decision. |
| `scripts/package-cpanel-deploy.sh` (emergency ZIP) | fallback | Needs the `VITE_*` build env; not available in this session's container. |
| Cursor cloud preview tunnel (`.cursor/scripts/*`, Cloudflare) | Cursor-only | Serves the CI `site00-production-dist` artifact (none exists while the pipeline is red); tunnel token lives in Cursor Secrets, not in this environment. |
| Vite dev server `:5174` | local | Used for all QA in this sprint. |

## Live QA through the viewport

`npx tsx scripts/jurnl/viewport-delivery-qa.ts http://127.0.0.1:5174 artifacts/jurnl-f01-live-viewport`
→ **163 / 163 PASS · page errors 0** (`artifacts/jurnl-f01-live-viewport/VIEWPORT_DELIVERY_REPORT.json`).

| Phase | Result |
|-------|--------|
| A. SITE 00 → DESIGN → switcher → JURNL → FAMILY RUNTIME → VIEWPORT (F01 ENTRY) | PASS |
| B. 14 screens × MOBILE / TABLET / DESKTOP via the ROUTE control — live text, buttons, inputs; only raster = official logo (< 8 % of screen); no full-screen background image; no authority image loaded; 0 lowercase glyphs; exact device size | **42 / 42** |
| B. SAFE AREA (project insets) + GRID (4 / 8 / 12 col) + BOUNDS (live runtime blocks) on each preset | 3 / 3 |
| C. 17 required interaction types clicked naturally inside the viewport | **17 / 17** |
| D. every bound manifest trigger clicked inside the viewport, result asserted (route / overlay / inline / toast / loading / focus / family boundary) | **62 / 62** |
| D. global primitive rows rendered by those interactions | 12 / 12 → **74 / 74 manifest interactions triggerable** |
| E. direct preview: same route, same runtime module, no workspace chrome, fully interactive (sign-in) | PASS |
| F. JURNL → ASTRAL WORLD → NDXBOOK → JURNL: no stale runtime / controls; next project loads cleanly | PASS |
| phone-sized host: DESIGN → VIEWPORT with JURNL live | PASS |

The 17 interaction types: short drawer · long / scrollable drawer · full-screen sheet · confirmation modal · inline expansion ·
error panel · success banner / toast · loading button · focused input · password requirements · show / hide password ·
social auth boundary · email app handoff · biometric handoff · switch account · sign-out confirmation · F01 → F02 transition.

## Defects found and repaired (this follow-up)

See `SYSTEM_DEFECT_REPAIR_LOG.md` D-19 – D-24.
