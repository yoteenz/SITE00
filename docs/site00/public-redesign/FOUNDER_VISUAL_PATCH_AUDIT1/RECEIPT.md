# P0.SITE00.PUBLIC-REDESIGN.FOUNDER-VISUAL-PATCH-AUDIT1 — Receipt

Generated: 2026-10-01 (UTC) · Audit-only sprint · No fixes applied.

Evidence: `crawl-raw.json`, `origin-expanded-crawl.json`, `screenshots/`, `publicRedesignAuthorityManifest.ts`, Playwright @ 390×844 / 430×932 / 360×800.

---

## Preview contract verification

| Field | Founder brief | Verified at audit time |
|-------|---------------|-------------------------|
| Branch | `cursor/public-redesign-composer-asset-injection1-1b86` | Same |
| HEAD | `3ad82fa2` | **`1b2dd670`** (includes swipe fix + memory; **`bb3d435f`** = last UI commit) |
| Preview build | `site00-v272-cedb995` | **`site00-v272-bb3d435`** |
| Bundle | `index.CQhCvuXV.js` | **`index.DRTOUbxs.js`** |
| Preview URL | site00.fsbw-dev.com | Tunnel + localhost:5174 both served **`bb3d435f`** manifest |

**Note:** Founder-stated build/bundle is **stale** relative to current branch preview. Re-hard-refresh preview before comparing to this audit.

---

## Route catalog (enumerated)

| Bucket | Count | Source |
|--------|------:|--------|
| Redesign authority screens | 37 | `publicRedesignAuthorityManifest.ts` |
| Unique authority route patterns | 34 | same |
| Public crawl matrix (this audit) | 34 | `founder-visual-patch-audit1.mjs` |
| Origin expanded panel states | 3 | interaction crawl |
| Service hub + ecosystem + auth + control + projects | 14 | crawl (no `.s00pr`) |
| IDNTY assessment step routes (manifest) | 16 | authority manifest (not all visually re-crawled) |
| BLDR / EVOLVE assessment & marketing (downstream) | 12+ | `Site00Routes.tsx` (legacy shells) |
| **Distinct public URL patterns (deduped estimate)** | **~78** | manifest + crawl + hubs |

---

## Patch item registry (finite)

IDs are stable for batching.

| ID | Primary class | Sev | Owner | Route / state | Summary |
|----|---------------|-----|-------|---------------|---------|
| DEF-001 | BROKEN_ICON | P0 | COMPOSER | `/origin` · IDNTY expanded | 5× `IdntyFrameworkIcon` Supabase PNGs fail load (`naturalWidth=0`) |
| DEF-002 | BROKEN_ICON | P0 | COMPOSER | `/origin` · BLDR expanded | 5× `BldrFrameworkIcon` Supabase PNGs fail load |
| DEF-003 | ASSET_LOAD_FAILURE | P0 | COMPOSER | `/origin` · IDNTY/BLDR expanded | Framework icons still bound to `live-preview/site00/{IDNTY,BLDR}/*.png` instead of redesign runtime |
| DEF-004 | LIVE_CODE_ASSET_BROKEN | P1 | LIVE_CODE | `/origin` · IDNTY/BLDR expanded | Replace `<img>` Supabase URLs with authority SVG set (match EVOLVE path + BLDR path `FrameworkGlyph`) |
| DEF-005 | LEGACY_PAGE_NOT_REBUILT | P1 | SONNET | `/idnty` | IDNTY gateway hub — `site00-page` / `EcosystemShell`, no `.s00pr-shell` |
| DEF-006 | LEGACY_PAGE_NOT_REBUILT | P1 | SONNET | `/bldr`, `/bldr/start` | BLDR hub + start — legacy mobile CSS stack |
| DEF-007 | LEGACY_PAGE_NOT_REBUILT | P1 | SONNET | `/evolve` | EVOLVE hub — legacy shell |
| DEF-008 | LEGACY_PAGE_NOT_REBUILT | P1 | SONNET | `/enter` | Enter flow — legacy origin-adjacent UI |
| DEF-009 | LEGACY_PAGE_NOT_REBUILT | P1 | SONNET | `/sites`, `/services`, `/system`, `/about`, `/journal`, `/support` | Ecosystem public pages — pre-redesign typography/cards |
| DEF-010 | LEGACY_PAGE_NOT_REBUILT | P1 | SONNET | `/origin/sign-in`, `/origin/create-account` | Auth surfaces — `site00-auth*` not `.s00pr` |
| DEF-011 | LEGACY_PAGE_NOT_REBUILT | P1 | SONNET | `/control`, `/control/sites` | CTRL ROOM — `site00-ctrl-room-mobile`, no redesign environment plates |
| DEF-012 | LEGACY_PAGE_NOT_REBUILT | P1 | SONNET | `/projects` | MY SITES index — `EcosystemShell` / project cards, no public redesign shell |
| DEF-013 | BLANK_PRIVATE_PANEL | P2 | FOUNDER | `/control` (signed-in) | Operator panels are typographic/metric-only — confirm if imagery required |
| DEF-014 | BLANK_PRIVATE_PANEL | P2 | FOUNDER | `/projects` | Project tiles lack Grok/environment art — confirm scope vs product OS |
| DEF-015 | VISUAL_CONTINUITY_MISMATCH | P2 | OPUS | `/` collapsed | `ENV.ORIGIN.COLLAPSED` Grok plate + legacy `resolveOriginBackgroundByViewport` fallback stacked |
| DEF-016 | NO_ACTION_REQUIRED | P3 | — | `/idnty/state` … `/idnty/build-ready` | Machine slots show `data-asset-status=placeholder` but live SVG machines render (quarantined Grok overlays) |
| DEF-017 | NO_ACTION_REQUIRED | P3 | — | `/bldr/state?path=*` | `ILLUSTRATION.BLDR.FRAMEWORK.STEP` live `FrameworkGlyph` SVG — excluded from injection by design |
| DEF-018 | MISSING_STATE | P2 | COMPOSER | `/origin` | Expanded panels not in static route list — require interaction state QA on device |
| DEF-019 | ROUTE_VISUAL_REGRESSION | P2 | COMPOSER | `/idnty/*` assessment steps | 16 authority question/review routes not individually screenshot in this pass |
| DEF-020 | LEGACY_PAGE_NOT_REBUILT | P1 | SONNET | `/evolve/marketing/*`, `/bldr/*` assessment | Downstream intake/marketing still on legacy evolve/bldr mobile CSS |
| DEF-021 | RESPONSIVE_GEOMETRY | P2 | OPUS | BLDR/EVOLVE path panels | Spot-check only @430×932 & 360×800 — no automated clipping defects; founder confirm CTA/nav |
| DEF-022 | WRONG_STATE_RENDER | P2 | FOUNDER | `/idnty/build-ready/*` | Authority deviation: verification copy vs honest “capability unavailable” (manifest notes) |

**Total patch items:** 22 (excluding NO_ACTION rows counted as 0 patch work)

**Patch work items (action required):** 20

---

## Patch batches

| Batch | Defect IDs | Model | Scope |
|-------|------------|-------|-------|
| PATCH A — Broken origin framework icons | DEF-001–004 | COMPOSER + LIVE_CODE | Wire IDNTY/BLDR expanded framework row to bundled SVG/PNG or redesign micro-asset slots |
| PATCH B — Legacy public hubs | DEF-005–012, DEF-020 | SONNET | Rebuild hubs, auth, ecosystem, control, projects under `.s00pr` or approved hybrid |
| PATCH C — Private panel imagery | DEF-013–014 | FOUNDER → GROK/COMPOSER | Decision then optional asset injection for YOUR SPACE |
| PATCH D — Origin environment continuity | DEF-015 | OPUS | Choose single owner plate (Grok vs legacy fallback) |
| PATCH E — Assessment + state coverage | DEF-018–019, DEF-022 | COMPOSER + FOUNDER | Complete mobile state matrix QA + product copy decisions |

---

## Grok required

**0** items — all injected Grok slots resolve on disk and render on crawled redesign routes. Remaining gaps are runtime wiring (framework PNGs) or live-code SVG, not regeneration.

---

## Signed-off / no action (redesign core)

Routes with `.s00pr-shell`, injected assets, no broken imgs @390×844:

- `/`, `/origin`, `/origin/locations`
- `/idnty/state`, `/idnty/starting-at-zero`, `/idnty/some-pieces-exist`, `/idnty/ready-for-evolution`, `/idnty/build-ready`
- `/bldr/state` (+ `path=overview|site|world|systems|extensions`)
- `/evolve/state` (+ `path=refine|install|transform`)

---

## Top 10 post-patch founder review routes

1. `/origin` — collapsed + three expanded panels (framework icons)
2. `/origin/locations`
3. `/idnty/state` → pick a state → one question step
4. `/idnty/build-ready/review`
5. `/bldr/state` command center
6. `/bldr/state?path=systems`
7. `/evolve/state`
8. `/evolve/state?path=transform`
9. `/control` (YOUR SPACE — imagery decision)
10. `/projects` (MY SITES)
