# Memory — SITE 00 Agent Log

Append-only conversation summaries. **Do not overwrite earlier entries.** Latest entries + `CORE.md` + `CODEBASE.md` = current operational context.

---

## 2026-08-18 — Motherboard setup + cloud preview + IDNTY four states + GoDaddy mobile deploy guidance

Summary of the **whole conversation so far** in this cloud agent run (source: mobile, repo: `yoteenz/SITE00`).

- **Context:** Founder (Kateena) running Cursor Cloud Agent on SITE 00 from mobile. Needed live preview, Identity state selector fix, GoDaddy hosting guidance without a local machine, and FSBW-style motherboard parity in this repo.

- **Topics covered:**
  1. **Cloud preview setup** — Confirm `/home/ubuntu/SITE00` cloned from `yoteenz/SITE00`; start `site00-vite` (port 5174) and `site00-preview-tunnel` (Cloudflare); do **not** serve SITE 00 from Frontal Slayer port 3001.
  2. **IDNTY state selector** — Remove **NEEDS COHESION** as fifth top-level card; restore four primary states (00–03); single desktop row; 4-column investment guide; move cohesion into **Some Pieces Exist** as internal diagnostic (Scattered Pieces / Mostly Cohesive / Missing Key Pieces); migrate legacy routes and localStorage.
  3. **GoDaddy / cPanel hosting** — Walkthrough for production deploy (`dist/` + `.htaccess`); Supabase auth URLs; API limitation on static cPanel.
  4. **Mobile-only deploy** — Founder not on local machine; adapted flow: cloud agent builds → ZIP → mobile cPanel File Manager upload/extract; optional GitHub Actions FTP later.
  5. **Motherboard** — Founder asked if agent was appending to motherboard like fsbw; confirmed SITE 00 had none; founder approved immediate FSBW-style setup.

- **Decisions / outcomes:**
  - Preview URL: persistent Cloudflare tunnel hostname from `SITE00_CLOUDFLARE_TUNNEL_HOSTNAME` env (written to `/tmp/site00-cloud-preview-url.txt` on cloud VM).
  - PR **#1** opened: `cursor/idnty-four-states-bc8e` — "Remove NEEDS COHESION as top-level Identity state".
  - **Motherboard established** in SITE 00 repo: `motherboard/` folder + `.cursor/rules/motherboard.mdc` + `docs/MOTHERBOARD_COMMANDS.md`. Auto-load at chat start; auto-add MEMORY after tasks (unless "stop adding to motherboard").
  - GoDaddy: Architecture A (static cPanel) is default path; server `api/` routes need separate host or `VITE_API_BASE`.

- **Changes (code/docs):**
  - IDNTY: `identity.ts`, `idnty-assessment.ts`, `IdntyStatePage.tsx`, `site00.css`, routes, environments, hooks migration, assessment router legacy redirect.
  - Motherboard: `motherboard/README.md`, `ADDING.md`, `CORE.md`, `CODEBASE.md`, `MEMORY.md` (this file); `.cursor/rules/motherboard.mdc`; `docs/MOTHERBOARD_COMMANDS.md`.

- **Conventions for future agents:**
  - Read motherboard at every new chat start (rule always applies).
  - Append one MEMORY entry after each completed task summarizing **full chat so far**.
  - Cloud preview: tmux sessions `site00-vite` + `site00-preview-tunnel` on 5174, not fsbw 3001.
  - Founder often on **mobile** — prefer cloud build + ZIP/cPanel or CI deploy over "run npm on your laptop" instructions.
  - IDNTY has **exactly 4** top-level states; cohesion is sub-diagnostic only under Some Pieces Exist.

---

## 2026-08-18 — Production dist build + GoDaddy deploy ZIP (mobile)

Summary of the **whole conversation so far** in this cloud agent run.

- **Context:** Founder on mobile needs production `dist/` built with Supabase env vars and a downloadable ZIP for GoDaddy cPanel upload (no local machine).

- **Topics covered (cumulative):** Cloud preview setup; IDNTY four-state refactor (PR #1); GoDaddy/cPanel guidance; motherboard setup; production build request.

- **Decisions / outcomes:**
  - Production build run in cloud agent with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SITE00_ROOT=1`, `VITE_SITE00_CANONICAL_ORIGIN=https://site00.com`.
  - Deploy bundle published as GitHub **pre-release**: tag `site00-deploy-2026-08-18` on branch `cursor/idnty-four-states-bc8e`.
  - Bundle contains `site00-production-dist-2026-08-18.zip` (~34MB, includes `.htaccess`) + `SITE00-DEPLOY-README.txt`.
  - Static build only — `api/` server routes still require separate hosting (`VITE_API_BASE` if API hosted elsewhere).

- **Changes:**
  - Build artifacts: `/workspace/dist/` (local to VM, not committed).
  - Release: https://github.com/yoteenz/SITE00/releases/tag/site00-deploy-2026-08-18

- **Conventions:**
  - For mobile deploy: GitHub Release ZIP → phone → cPanel File Manager upload/extract.
  - Do not commit `dist/` or `.env.local` to git.
  - Artifacts path `/opt/cursor/artifacts` may be full — use `/tmp` or GitHub Releases for large ZIPs.

---

## 2026-08-18 — Independent API server (`server/` + Railway) repo work

Summary of the **whole conversation so far** in this cloud agent run.

- **Context:** Founder on mobile; `site00.com` live on GoDaddy static cPanel; sign-in/API calls fail without a Node host. Railway project created but blocked because repo had `api/` handlers but no `server/` or `npm run start:api`. User: **"do the repo work first."**

- **Topics covered (cumulative):** Cloud preview; IDNTY four states (PR #1); GoDaddy deploy ZIP + live site; Supabase redirect URL guidance (additive, FSBW-safe); independent API port from FSBW; Railway setup guidance; **this turn:** complete repo API server layer.

- **Decisions / outcomes:**
  - Production split confirmed: **GoDaddy** = SPA (`dist/`), **Railway** = Node API (`https://api.site00.com` via CNAME).
  - Express adapter mounts existing Vercel-style `api/*` handlers — no rewrite of handler logic.
  - `sessionRestore.ts` now respects `VITE_API_BASE` (cross-origin cookies on API host).
  - Ported missing `api/_lib/studioBuilderGeneration.ts` from FSBW so ASSTS admin route loads at server startup.

- **Changes:**
  - `server/index.ts`, `server/vercelAdapter.ts`, `server/routes.ts`
  - `railway.toml` → `npm run start:api`, health `/api/health`
  - `package.json`: `start:api`, `dev:api`, `express`, `@types/express`
  - `docs/DEPLOYMENT.md` Architecture C (Railway + env table)
  - `.env.example`: `SESSION_COOKIE_SECRET`, `SESSION_COOKIE_SECURE`
  - `README.md`: API server dev instructions

- **Railway next steps (founder):**
  1. Redeploy service after merge/push (branch `cursor/idnty-four-states-bc8e` or merge to main).
  2. Service → Variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_COOKIE_SECRET` (random 32+ chars).
  3. Custom domain `api.site00.com`; GoDaddy CNAME `api` → Railway hostname.
  4. Rebuild SPA with `VITE_API_BASE=https://api.site00.com`; re-upload `dist/` to cPanel.

- **Conventions:**
  - Railway start command lives on **Service** settings (not Project settings).
  - Do not change Supabase Site URL (keep FSBW default); only add SITE 00 redirect URLs.

---

## 2026-08-19 — ENTER 00 desktop background focal shift (viewport lock preserved)

Summary of this cloud agent run through ENTER 00 desktop background tuning.

- **Request:** Shift ENTER 00 desktop background image **upward inside the fixed cover container** without changing locked viewport settings (100dvh, overflow hidden, cover, no letterbox, no scroll). Mobile unchanged. Foreground UI untouched.

- **Root cause:** Tall-screen breakpoints used **higher** `background-position` Y values (38% → 41%), which shifts the image **down** — opposite of desired upward focal correction.

- **Changes:**
  - `site00.css` (desktop `@media min-width: 768px`): default focal `center 32%` (was 34%); short desktop `max-height: 799px` → `center 28%`; tall `min-height: 900px` → `center 38%`; ultrawide `min-aspect-ratio: 21/9` → `center 35%`; **removed** `min-height: 1080px` at 41%.
  - `environments.ts`: `ENTER_00_WAITING_ROOM.desktopPosition` → `center 32%`.
  - Viewport lock rules (env-layer inset, fixed positioning, shell 100dvh overflow hidden) **unchanged**.

- **PR:** #9 `cursor/enter-desktop-bg-focal-796f` — focal position only; no transform/margin/scale hacks.

- **Related open PRs:** #8 site-wide text stack margins; #7 origin mobile layout; #5/#6 enter/origin desktop fixes.

---

## 2026-08-19 — Consolidated all agent PRs to main (#8)

- **Request:** Merge everything to `main` on one branch so preview matches production and no work is lost across draft PRs.
- **Action:** PR **#8** (`cursor/site-wide-text-stack-margins-796f`) updated as consolidated branch; merged to `main` as `5e05bb6`.
- **Supersedes:** PR #7 (already merged separately), PR #9 (closed — enter bg focal included in #8), PR #5/#6 commits included in #8.
- **Final stack on main:** Origin desktop (EVOLVE row, hero overlap, scroll lock) · Origin mobile layout · typography stack margins · ENTER 00 letterbox fix (scaleW) · ENTER bg focal · ENTER/EXIT underline removal · mobile tagline +3px.
- **Convention:** `main` is now source of truth for all above fixes; no need to check out feature branches for preview.

---

## 2026-08-19 — Restore Origin bottom panel on Mobile/Desktop layout switch

- **Issue:** Bottom status panel (metrics + NEED GUIDANCE) disappeared when toggling Mobile/Desktop on wide viewports.
- **Cause:** Mobile strip CSS was inside `@media (max-width: 767px)` but layout switch uses class `.site00-origin-page--mobile-layout` at any width; desktop artboard could clip footer when scaled height exceeded viewport.
- **Fix (PR #10 → main):** Class-scoped mobile layout rules; explicit desktop-artboard strip visibility; Origin artboard `min(scaleW, scaleH)` (Enter keeps `scaleW`); flex pin footer in artboard column.

---

## 2026-08-19 — Wire ENTER 00 directory menu links (PR #12)

- Enabled all EXPLORE + YOUR SPACE rows with live routes. Account → `/control`. Projects + Account use `requiresAuth`.

---

## 2026-08-19 — ENTER 00: decouple bg from UI artboard (PR #17)

- Viewport cover bg on shell outside transform; UI top-aligned; status strip portaled; focal 32% baseline.

---

## 2026-08-19 — Laptop Desktop toggle = native full viewport (PR #11)

- Wide viewport + Desktop → native full viewport shell. `/origin/desktop` keeps scaled artboard preview.

---

## 2026-08-19 — EVOLVE Origin desktop panel icon + copy/layout polish (PR #16)

- Icon Supabase PNG; collapsed/expanded EVOLVE copy polish; expanded panels −15% scale.

---

## 2026-08-19 — Origin desktop hero/plaza layout + ungrouped hero copy (PR #18)

- Panel icons up 4px; plaza block up 4px; per-line hero offset tokens for independent copy positioning.

---

## 2026-08-19 — Consolidated open PRs to main (#2, #3, #11, #16, #17, #18)

- **User request:** Merge all pending PRs to `main`; preview should match production.
- **Merged:** #17 ENTER bg/UI decouple · #11 native laptop desktop viewport · #16 EVOLVE panel polish · #18 Origin hero/plaza nudges · #2 identity card colors · #3 Locations/typography recovery.
- **Closed as superseded:** #14/#13 (ENTER bg attempts) · #15 (hero copy — superseded by #18) · #5 (letterboxing — in #17) · #4 (presentation architecture — superseded by #11+).
- **`main` is source of truth** for all above fixes.

---

## 2026-08-19 — Desktop edge-to-edge environment bg (no letterboxing)

- **Issue:** All desktop environment pages showed side letterboxing (gray bars); removing it stretched bg and clipped bottom panel.
- **Root cause:** Scaled artboard used `min(scaleW, scaleH)` for Origin (side margins); env bg inside `transform: scale()`; ENTER bg suppressed on native viewport without replacement; workflow routes bypassed presentation shell.
- **Fix:** Viewport `cover` bg on shell **outside** transform for Origin/Enter/Workflow/Assessment (scaled mode); `scaleW` only (no side margins); native viewport uses in-flow env cover (no suppress); workflow/state/assessment routes use `Site00PublicRouteShell`; legacy `/desktop` workflow paths redirect.

---

## 2026-08-19 — Lock desktop presentation + ENTER upward focal (Enter-only)

- **Lock:** `desktop-environment-presentation.ts` + CORE.md — edge-to-edge formula, scaleW-only, focal-only bg tuning.
- **ENTER focal:** Reversed direction — **higher** Y% shifts Enter bg up on this asset (prior lower-% assumption was inverted). Baseline 32% → **40%** default (+8 mirror of wrong 24%); breakpoints 36% / 46% / 43% (Enter-only).
- **Rule:** Never apply Enter focal breakpoints to `.site00-environment-viewport-bg` globally — scope `[data-environment='ENTER_00_WAITING_ROOM']`.

---

## 2026-08-19 — ENTER focal direction corrected (higher Y% = up)

- **Issue:** Prior shift to 24% moved Enter bg **down** not up — Y% direction inverted for this asset.
- **Fix:** Mirror from 32% baseline: **40%** default, **36%** short / **46%** tall / **43%** ultrawide. UI unchanged.

---

## 2026-08-19 — ENTER focal +12% additional upward shift

- **Request:** After direction fix, bg still low — shift up another ~10–15%.
- **Change:** +12pp on all Enter-only focal breakpoints: **52%** default (was 40%), **48%** short / **58%** tall / **55%** ultrawide. `environments.ts` + Enter-scoped CSS only; UI unchanged.

---

## 2026-08-19 — ENTER focal default 65%

- **Request:** Raise default focal from 52% to **65%** (+13pp); breakpoints shifted same delta: **61%** short / **71%** tall / **68%** ultrawide.

---

## 2026-08-19 — ENTER focal snap-back fix (65% sticks)

- **Issue:** Enter bg shifted up briefly then reverted — laptop hydration switched scaled→native (different bg layers); CSS breakpoint hardcodes overrode `--site00-env-desktop-position`.
- **Fix:** Enter desktop always uses external viewport cover (native + scaled); in-flow env suppressed on artboard. Focal via inline `backgroundPosition` from `resolveSite00EnterDesktopFocal()` / `useSite00EnterDesktopFocal`. All breakpoints **65%** until re-tuned. Removed Enter focal `@media` hardcodes in `site00.css`.

---

## 2026-08-19 — ENTER focal 75%

- **Request:** Try **75%** (was 65%) for all Enter desktop focal breakpoints. Origin desktop bg remains **`center center`** (50% / 50%) in `environments.ts` — no custom Y% focal.

---

## 2026-08-19 — Origin desktop focal 30% + status strip −60% height

- **Origin bg:** `ORIGIN_ENVIRONMENT.desktopPosition` → **`center 30%`** (desktop only; mobile stays `center center`).
- **Bottom panel:** Origin desktop status strip panel min-height **56px → 22px** (−60%) and reduced vertical padding (8px → 3px). Text, icons, and guidance avatar **unchanged** (prior content-scale reverted).

---

## 2026-08-19 — main vs site00.com deploy gap (user not seeing changes)

- **Issue:** Pushes to `main` did not update **https://site00.com** — production served stale bundle (`index.BJYD_lR2.js`) while local/main had newer hashes.
- **Cause:** GoDaddy static hosting is **not** wired to git push; only cloud Vite tunnel (5174) reflects workspace live.
- **Fix:** Added `.github/workflows/deploy-godaddy.yml` (build on push to main; FTP deploy when repo var `GODADDY_DEPLOY_ENABLED=true` + FTP secrets). Release **`site00-deploy-2026-08-19`** with production ZIP for cPanel upload until FTP auto-deploy is enabled.

---

## 2026-08-19 — Unified desktop presentation (phone + laptop in sync)

- **Issue:** Mobile Desktop tab used scaled 1440×900 artboard; laptop Desktop used native full viewport — different bg layers, focal, layout.
- **Fix:** `resolveSite00DesktopPresentationMode` → **always `native`** when Desktop toggle is on (all devices). Scaled artboard only for legacy `/foo/desktop` routes (`forceArtboard`).

---

## 2026-08-19 — Restore Enter 75% focal + ENTER/EXIT underline after native unification

- **Issue:** Unifying phone/laptop to native shell dropped Enter 75% on phones (desktop rules were `@media min-width 768px` only) and restored underlines (typography rule targeted `.site00-desktop-artboard-shell`, not native viewport).
- **Fix:** `data-site00-preview-desktop` on `<html>` when Desktop toggle on; Enter env CSS applies below 768px. Enter viewport bg uses full inline `background*` styles. Native shell mounts Enter bg synchronously from route. Extended underline removal to `.site00-desktop-artboard--native-viewport` + `a.site00-btn-ghost` all states.

---

## 2026-08-19 — Stop Enter 75% / underline auto-regression (root cause)

- **Cause:** Enter bg + `data-site00-preview-desktop` depended on a fragile chain — presentation shell mount → async `useEffect` on `<html>` (cleanup stripped attribute between re-renders) → separate NativeViewportShell Enter layer. Any re-render/unmount reverted focal + underline CSS.
- **Fix:** Enter desktop viewport bg **owned by `EnvironmentShell`** when Desktop toggle is on (`isPreviewDesktop`, not shell mount). Inline `backgroundPosition: center 75%` always. `syncSite00PreviewDesktopDocument()` called **synchronously** in `setPreviewDeviceMode` + `useLayoutEffect` (no effect cleanup flash). Removed hook/async focal state.

---

## 2026-08-19 — Enter refresh regression fix (75% focal + underline persist)

Summary of **this chat**: user reported Enter bg focal (75%) and ENTER/EXIT underline removal **regressed again on hard refresh** after prior fixes on `main` (`f28b8b5`).

- **Context:** Repeated "fix then regress on refresh" on `/enter` with Desktop selected — bg shifted wrong / underlines returned.
- **Root cause:** Enter presentation still gated on `isPreviewDesktop` + `html[data-site00-preview-desktop]` + `@media (min-width: 768px)`. On refresh, preview mode could init as mobile (phone default) before sessionStorage applied; external Enter bg did not mount; phone CSS never applied desktop focal; underline rules missed mobile-shell path.
- **Fix:**
  - **`EnvironmentShell`:** Enter desktop viewport bg always renders on `/enter` (not gated on Mobile/Desktop toggle); only skip when scaled legacy `viewportBackgroundActive`.
  - **`Site00Context`:** `/enter` defaults to **desktop** in `resolveInitialPreviewMode`; sync `data-site00-preview-desktop` **synchronously** in reducer lazy init (before first paint).
  - **`site00.css`:** Enter env rules moved to `.site00-enter-page` at **all viewports** (removed `html[data-site00-preview-desktop]` dependency for Enter bg); explicit `.site00-enter-page a.site00-btn-ghost` underline removal.
  - **`site00-typography.css`:** `.site00-enter-page a[class*='site00-']` underline strip.
- **Branch:** `cursor/enter-refresh-regression-fix-796f`.
- **Note:** Production **site00.com** still needs GoDaddy redeploy (FTP or manual ZIP) to pick up bundle — cloud tunnel 5174 reflects workspace immediately.

---

## 2026-08-19 — Mobile Desktop toggle: edge-to-edge scaled artboard

- **Issue:** Desktop toggle on phone (mobile design composer) was not showing full desktop edge-to-edge — native shell on narrow viewports cropped the 1440px composition instead of scaling it to fill the screen width.
- **Root cause:** PR #16 unification forced `resolveSite00DesktopPresentationMode` → always `native`, and `Site00DesktopPresentationShell` passed hardcoded `false` for `isWideViewport`.
- **Fix:** Restore narrow/wide split — **phone + Desktop → scaled 1440×900 artboard** (scaleW edge-to-edge, env bg outside transform); **laptop + Desktop → native full viewport**. Wire `useSite00OriginWideViewport()` into presentation shell.
- **Branch:** `cursor/mobile-desktop-edge-to-edge-796f`.

---

## 2026-08-19 — Origin desktop bottom panel height = Enter (36px)

- **Issue:** Origin desktop bottom status strip still taller than Enter bottom panel despite prior −60% min-height (22px) attempt.
- **Fix:** Shared `--site00-bottom-panel-height: 36px` token. Origin desktop artboard strip locked to 36px (match Enter); cells row-aligned (label + value inline); guidance compressed (20px avatar, label/title inline); zero vertical cell/guidance padding. Text/copy unchanged.
- **Branch:** `cursor/origin-panel-height-match-enter-796f`.

---

## 2026-08-19 — Laptop Mobile tab: scaled 390×844 phone preview

- **Issue:** Mobile toggle on laptop stretched mobile layout to full browser width — not a true phone preview.
- **Fix:** `Site00MobileArtboardShell` — laptop + Mobile → scaled **390×844** artboard (scaleW edge-to-edge), env bg outside transform (mobile asset for Origin). Phone + Mobile stays native full-width. Re-anchor mobile `fixed` UI to artboard stage in `site00-mobile-artboard.css`. Wired via `Site00MobilePresentationShell` on Origin/Public route shells.
- **Branch:** `cursor/laptop-mobile-scaled-preview-796f`.

---

## 2026-08-19 — Scaled artboard bg inside stage (not full-viewport)

- **Issue:** Phone Desktop toggle — env bg rendered outside artboard transform at full viewport size while UI scaled inside artboard (bg "full screen" behind preview).
- **Fix:** Move `Site00EnvironmentViewportBackground` inside scaled stage for `Site00DesktopArtboardShell` + `Site00MobileArtboardShell` so bg transforms with UI.

---

## 2026-08-19 — Phone Desktop tab: blue panel text (iOS button default)

- **Issue:** On phone with Desktop toggle, Origin IDNTY/BLDR/EVOLVE collapsed panels showed **blue text** instead of desktop palette (red numbers, black titles, muted subtitles).
- **Root cause:** Collapsed cards are `<button class="site00-glass-panel">`; iOS Safari applies default blue `#007AFF` button text that overrides child typography (same class of bug as prior `site00-state-card` anchor fix).
- **Fix:** `site00.css` — explicit palette on `button.site00-glass-panel` + children (`.site00-panel-title`, `.site00-label`, `.site00-label-red`, `.site00-origin-card__number`, `.site00-action-link`) across hover/focus/active; card numbers use `--site00-origin-card-number-color` (red on desktop artboard).
- **Branch:** `cursor/phone-desktop-panel-text-796f`.

---

## 2026-08-19 — Phone Desktop preview: site-wide layout + iOS button parity

- **Issue:** Other desktop pages (Enter, IDNTY/BLDR/Evolve state selectors, assessments, public composer pages) still looked wrong on phone Desktop toggle — mobile layouts/grids and iOS blue button text.
- **Root cause:** `@media (min-width: 768px)` desktop rules do not apply when viewport is phone-width; `@media (max-width: 767px)` phone rules still apply inside scaled artboard. Interactive `<button>` cards on workflow/assessment pages lacked full iOS palette lock (state cards missing `.site00-panel-title`/`.site00-label` + `-webkit-appearance`).
- **Fix:**
  - New `site00-desktop-artboard-preview.css` — artboard-scoped desktop grid/layout parity (state 4-col grids, Enter two-column, public page grids, workflow summary strip pinned to artboard bottom, assessment option grids, hide mobile-only BLDR start).
  - Artboard-scoped iOS button palette for hub cards, filter tabs, assessment controls, ghost/action links.
  - `site00.css` — extend `site00-state-card` with `-webkit-appearance: none`, `.site00-panel-title`/`.site00-label` palette on button cards.
- **Branch:** `cursor/phone-desktop-pages-parity-796f`.

---

## 2026-08-19 — Phone Desktop preview: bottom panels portaled like Enter

- **Issue:** After layout/iOS fixes, workflow/public pages still missing bottom panels on phone Desktop toggle; Enter worked because its status strip portals outside the scaled stage.
- **Root cause:** `position: fixed` bottom strips inside scaled `.site00-desktop-artboard` clip or anchor to phone viewport incorrectly; Enter alone used `Site00EnterArtboardChromeContext` + portal to `site00-desktop-artboard-shell__enter-chrome`.
- **Fix:** `Site00ArtboardBottomChromePortal` shared component; wire Enter status strip, `WorkflowSummary`, `Site00PublicStatusRail`, and Origin `Site00AppShell` status footer through it. Chrome host CSS extended for workflow/public/status strips (desktop grid, 36px height, undo fixed positioning).
- **Branch:** `cursor/phone-desktop-pages-parity-796f`.

---

## 2026-08-19 — Phone preview: restore pinch-to-zoom

- **Issue:** Cloud/tunnel preview locked pinch zoom in/out on phone — incorrect for accessibility and review.
- **Root cause:** `touch-action: none` on desktop/mobile artboard shells (Enter/Origin viewport lock + mobile artboard shell); `installDesktopPreviewShellViewportLock` set `overflow: hidden` on `html`/`body`/`#root` and did not declare `user-scalable=yes` on viewport meta.
- **Fix:** Replace shell `touch-action: none` with `pan-x pan-y pinch-zoom`; viewport lock uses `maximum-scale=10, user-scalable=yes`, drops document overflow lock, sets body `touch-action: pan-x pan-y pinch-zoom`; base `index.html` viewport meta allows zoom.
- **Branch:** `cursor/phone-desktop-pages-parity-796f`.

---

## 2026-08-19 — Phone Desktop bottom panel portal mount fix

- **Issue:** Bottom panels still missing on phone Desktop after portal wiring (workflow/public/origin strips).
- **Root cause:** Chrome host ref mounted after stage children; portal `useLayoutEffect` ran before host existed and never re-ran. Inline fallback used `position: fixed` inside scaled transform → clipped/invisible.
- **Fix:** Context `hostElement` state via callback ref; portal mounts when host ready; `layoutStage` positions chrome at `top: scaledHeight`, `width: scaledWidth` under artboard.
- **Branch:** `cursor/phone-desktop-pages-parity-796f`.

---

## 2026-08-19 — Shipping default: PR + immediate merge to main

- **Context:** Founder on mobile asked why some edits use PRs vs `main`; wanted default where code goes to `main` quickly but PRs still exist for review/history.
- **Decision:** Default agent workflow = feature branch → open PR → **merge to `main` in same session** (PR as receipt, not manual merge gate). Opt out: "draft PR", "don't merge yet", "wait for my review".
- **Changes:** `.cursor/rules/shipping.mdc` (alwaysApply); `motherboard/CORE.md` Shipping section.
- **Note:** `main` merge does not update site00.com until GoDaddy deploy.

---

## 2026-08-19 — Open PR cleanup: merge #2 + #29, close stale

- **Context:** Founder asked to resolve open PR backlog from mobile workflow.
- **Merged:** **PR #2** (Identity card color regression); **PR #29** (phone Desktop site-wide parity, bottom panels, pinch zoom) — only conflict was `MEMORY.md` append-only merge.
- **Superseded:** **PR #28** merged with/overlapped #29; **PR #5, #13, #15** left open (stale Enter/Origin tweaks) — agent lacked GitHub permission to close; founder can close on app if still visible.
- **Still open:** **PR #33** (loader verify script, conflicts), **PR #30** (loader integration overhaul, complicated), **PR #4** (presentation architecture draft).
- **Reminder:** `main` updated; site00.com needs GoDaddy deploy (Actions artifact/ZIP or FTP).

---

## 2026-08-19 — Origin mobile layout tweaks (tagline, swipe, status panels)

- **Request (mobile only):** Move red tagline down 4px; grey SWIPE UP label down 6px only; bottom metric panels 40% shorter (text unchanged); panels edge-to-edge (remove right letterboxing gap).
- **Fix:** `site00.css` — tagline `margin-top +4px`; swipe-btn `margin-top +6px`; status cells `min-height calc(31px * 0.6)`, vertical padding 2px, each cell `50%` width in metrics row; metrics strip `width:100%` no margin. `site00-mobile-artboard.css` — same 50% cell width in scaled mobile preview.

---

## 2026-08-19 — Origin mobile production: missing bg + layout locks

- **Issue:** After GoDaddy deploy, site00.com mobile Origin — background photo missing; tagline/swipe/panel tweaks not visible (fixed positioning + wrong layout mode).
- **Root cause (bg):** `resolveSite00PublicAsset()` returned relative `/storage/v1/...` URLs when `VITE_SUPABASE_URL` empty at build — 404 on GoDaddy; loader boot showed IMG_0404 then React env layer went blank/fallback.
- **Fix:** Fallback to canonical Supabase project host in `site00LoaderConfig.ts` when build env missing. Layout: use `transform: translateY()` for tagline (+4px) and SWIPE UP (+6px); panels `50vw` + metrics `100vw` + explicit max-height 40% reduction.
- **Note:** CSS targets `.site00-origin-page--mobile-layout` only — phone must use **Mobile** toggle (not Desktop preview on phone).

---

## 2026-08-19 — Loader headline copy moved to top

- **Request:** Move the first three text lines on the loading animation screen (red SITE 00 eyebrow, black ASSEMBLING SITE 00 title, gray PREPARING YOUR DESTINATION subtitle) from the bottom cluster to the top of the screen; keep progress status, bar, tagline, and 00 mark at the bottom.
- **Fix:** Updated `loader-composition-map.ts` (mobile 711×1536: eyebrow y 837→72, title 878→113, subtitle 940→175) and `loader-composition-map-desktop.ts` (desktop 1672×941: eyebrow y 552→48, title 574→70, subtitle 608→104). Updated mobile Y landmarks for debug guides.
- **Files:** `src/site00/components/loader/loader-composition-map.ts`, `loader-composition-map-desktop.ts`.

---

## 2026-08-19 — Loader header typography matches Origin hierarchy

- **Request:** Style loader top copy (red eyebrow, black title, gray subtitle) like Origin homepage header — larger type with clear size/weight hierarchy instead of tiny artboard-locked px.
- **Fix:** Applied Origin typography roles (`site00-label-red`, `site00-heading-xl`, `site00-body`) in `LoaderCopyRegions.tsx`. CSS uses design tokens with `calc(token / var(--loader-scale))` so text renders at viewport scale despite artboard transform. Expanded composition region boxes for larger headline/subtitle; overflow visible on top three regions.
- **Hierarchy:** label 600 red → display-xl 800 black → subheading 700 gray muted.

---

## 2026-08-19 — Isolated loader preview route

- **Request:** Link to loading animation page that stays open for inspection (production loader exits too fast).
- **Fix:** Added `/loader-preview` — frozen immersive loader, no cold-start exit. Query params: `progress` (0–100, default 62), `complete=1`, `loaderDebug=1`.

---

## 2026-08-19 — Loader copy below animation (reference hierarchy)

- **Request:** Match reference layout — wireframe fills upper screen so header copy belongs below the animation, not at top. Hierarchy: red SITE 00 label → large black title → gray subtitle above progress cluster.
- **Fix:** Repositioned mobile copy regions to y≈820/856/968 (below platform); desktop to y≈548/578/636. Typography: label-red, display-lg title, body subtitle (lighter gray). Kept scale-compensated tokens + `/loader-preview` for inspection.

---

## 2026-08-19 — Loader progress tied to real asset and page preload

- **Context:** Founder wanted the loading bar to advance according to actual page and asset build work below the animation — tracing real completion timing, not arbitrary timers.
- **Topics covered:** Loader headline/copy positioning iterations; sync copy/progress to animation `playing`; overlay-only 60px nudge; asset-driven progress bar.
- **Decisions / outcomes:** Replaced timed `runLoaderStageTimeline` intervals with task-driven stages. Progress only visible after animation starts (0% at play); each stage completes when its backing promise settles. Min cinematic hold still gates final reveal.
- **Progress mapping (world):** bootstrap = marble bg preloaded; preparing = animation MP4 preloaded; connect = playback started (after animation wait); assemble = destination route chunk + environment background preloaded; ready = min hold elapsed.
- **Progress mapping (ASSTS):** bootstrap/preparing = loader media; connect = library API; resolve = slot API; assemble = LibraryPage chunk.
- **Changes:** `loaderProgressTimeline.ts` (`advanceLoaderStagesFromTasks`), `site00LoaderRoutePreload.ts` (route chunk + destination env bg), `Site00WorldColdStartGate.tsx`, `AsstsColdStartGate.tsx`. PR **#50** merged to `main`.
- **Preview:** `/loader-preview?progress=62` for frozen inspection; live loader on cold-start routes.

---

## 2026-08-19 — Loader eyebrow + title 30px overlay nudge

- **Request:** Move red SITE 00 eyebrow and ASSEMBLING SITE 00 title down 30px together; do not shift animation, background, subtitle, or progress cluster.
- **Fix:** Overlay-only `translateY(calc(90px / var(--loader-scale)))` on `.site00-loader-copy-region--eyebrow` and `--title` only (60px base + 30px extra). Subtitle/progress/tagline remain at 60px nudge; media stack untouched.
- **Branch:** `cursor/loader-header-nudge-30-796f`.

---

## 2026-08-19 — Dynamic loader headline + stage subtitles per route

- **Request:** Black header reflects destination page (e.g. PREPARING THE ASSET VAULT); gray subtitle cycles mock behind-the-scenes work tied to preload stages. Static: red SITE 00 eyebrow, ASSEMBLING… progress label, progress bar, tagline, footer.
- **Fix:** `site00LoaderRouteCopy.ts` per-route titles + stage subtitles; `stageSubtitle` from progress hook drives gray text; preview `?route=/assts`. PR **#53**.

---

## 2026-08-19 — Loader assembling + progress bar 30px overlay nudge

- **Request:** Move ASSEMBLING status text and loading bar down 30px together; do not shift animation, header copy, tagline, or footer.
- **Fix:** Overlay-only `translateY(calc(90px / var(--loader-scale)))` on `--status`, `--progress-track`, and `--progress-pct` regions. PR **#54**.

---

## 2026-08-19 — Loader text overlay +4px

- **Request:** Increase all loader text overlay sizes by 4px.
- **Fix:** `--loader-copy-size-bump: 4px` on `.site00-immersive-loader`; scale-compensated bump on eyebrow, title, subtitle, status, progress %, tagline, mark, and signature label. PR **#55**.

---

## 2026-08-19 — Loader footer mark PNG + assembling/progress nudges

- **Request:** Replace bottom double-00 with Supabase PNG (`LOADING/2B361A6E…`); status **assembling…**; status up 10px, progress bar up 4px (overlay only).
- **Fix:** `resolveSite00LoaderFooterMarkUrl()` + `<img>` in signature; boot preload; split overlay transforms (status 80px, bar 86px). PR **#56**.

---

## 2026-08-19 — Loader headline stack typography tune

- **Request:** Black title (e.g. ASSEMBLING ORIGIN) lighter weight + +2px; red eyebrow above +4px; gray subtitle below +4px.
- **Fix:** Title uses `--site00-weight-heading` (700) and +2px extra; eyebrow/subtitle +4px extra atop global bump. PR **#57**.

---

## 2026-08-19 — Loader footer signature up 6px

- **Request:** Move 00 PNG asset and red SITE 00 label below it up 6px in tandem; overlay only.
- **Fix:** Signature region `translateY(calc(54px / var(--loader-scale)))` (60px base − 6px). PR **#58**.

---

## 2026-08-19 — Loader copy typography + signature nudge fix

- **Issue:** Founder reported signature moved down not up; headline typography changes (weight/size) not visible.
- **Root cause:** Global utilities `.site00-heading-lg` / `.site00-label-red` / `.site00-body` overrode loader copy CSS. Positive region `translateY` nudges move overlay down — signature needed negative inner offset to move up.
- **Fix:** Removed conflicting utilities from `LoaderCopyRegions`; scoped headline typography under `.site00-immersive-loader`. Signature uses inner `translateY(calc(-6px / scale))` on `.site00-loader-copy__signature`. PR **#59**.

---

## 2026-08-19 — Loader polish batch (typography, dots, footer, clip)

- **Request:** Title/subtitle −2px; title single row; ASSEMBLING uppercase with cycling `...` animation; progress bar up 4px; footer **SITE** only; fix 00 asset top clip.
- **Fix:** `LoaderAssemblingStatus.tsx`; title nowrap; progress nudge 82px; `footerLabel: SITE`; signature `overflow: visible`, mark img max-height removed. PR **#60**.

---

## 2026-08-19 — Loader top three copy rows down 4px

- **Request:** Move red SITE 00, black title, gray subtitle down 4px in tandem (overlay only).
- **Fix:** Eyebrow/title nudge 90→94px; subtitle 60→64px. PR **#61**.

---

## 2026-08-19 — Loader typography, dots, bar + signature nudges (batch)

- **Request:** Black title + gray subtitle each −4px; title font-weight **600**; fix ASSEMBLING dots to cycle `.` → `..` → `...` → clear; progress bar up 4px; footer 00 PNG + SITE label up 8px in tandem (overlay only).
- **Fix:** Title `font-size` bump −4px + `font-weight: 600`; subtitle −4px; `LoaderAssemblingStatus` `DOT_CYCLE` with separate label/dots spans (`letter-spacing: 0` on dots); progress track/pct nudge 82→78px; signature inner translate −6px→−14px. PR **#62** merged to `main`.

---

## 2026-08-19 — Loader tagline copy update

- **Request:** Change tagline from **EVERYTHING STARTS AT 00.** to **EVERYTHING WE BUILD LIVES HERE.** (uppercase).
- **Fix:** `SITE00_WORLD_IMMERSIVE_LOADER_CONFIG.tagline` + compact `Site00Loader` secondary copy. PR **#63** merged to `main`.

---

## 2026-08-19 — Loader footer signature up 12px

- **Request:** Move 00 PNG asset and red SITE label below it upward in tandem 12px (overlay only).
- **Fix:** Signature inner `translateY` −14px → **−26px** on `.site00-loader-copy__signature`. PR **#64** merged to `main`.

---

## 2026-08-19 — Loader copy layout spread (header top, bottom cluster up)

- **Request:** Move ASSEMBLING status, progress bar, and tagline up 20px in tandem; move top three copy rows (eyebrow, title, subtitle) back to top of screen — bottom text felt squished/condensed.
- **Fix:** Restored top-three composition anchors (mobile y 72/113/228, desktop y 48/70/104); top rows overlay nudge → `0`. Status/progress/tagline nudges 80→60, 78→58, tagline 60→40. PR **#65** merged to `main`.

---

## 2026-08-19 — Loader title size + subtitle nudge

- **Request:** Decrease black title (e.g. ASSEMBLING ORIGIN) 4px; move gray subtitle (e.g. CONNECTING TO ORIGIN) up 4px only.
- **Fix:** Title font-size offset −4px → **−8px**; subtitle region overlay `translateY(-4px)`. PR **#66** merged to `main`.

---

## 2026-08-19 — Loader tagline red plus signs restored

- **Request:** Add red **+** signs back on **EVERYTHING WE BUILD LIVES HERE.** tagline.
- **Fix:** Plus marks were in markup but clipped — widened mobile tagline region (380→520px), `allowOverflow` on tagline region, `overflow: visible` on tagline copy region. PR **#67** merged to `main`.

---

## 2026-08-19 — Loader title weight 400 + subtitle position fix

- **Request:** ASSEMBLING ORIGIN font-weight **400** and −2px size; gray CONNECTING TO ORIGIN subtitle prior +4px nudge not visible — find overwrite and fix.
- **Root cause:** Subtitle lives in its own composition region; `--site00-stack-md` margin-top on `.site00-loader-copy__subtitle` pushed text down inside the box, masking region `translateY(-4px)`.
- **Fix:** Title weight 600→**400**, size offset −8px→**−10px**; subtitle `margin: 0`; composition anchor up 4px (mobile y 228→224, desktop 104→100). PR **#68** merged to `main`.

---

## 2026-08-19 — Loader footer 00 asset +10% size

- **Request:** Increase footer 00 PNG asset size only by 10%.
- **Fix:** `.site00-loader-copy__mark-img` max-width cap 80px → **88px**. PR **#69** merged to `main`.

---

## 2026-08-19 — Loader ASSEMBLING dots animation fix (CSS)

- **Issue:** ASSEMBLING ellipsis still blinked only one dot instead of `.` → `..` → `...` → clear.
- **Root cause:** JS `setInterval` + string cycle reset on frequent loader re-renders (progress ticks); consecutive `.` chars could also collapse under typography.
- **Fix:** Three separate dot `<span>` elements with CSS keyframe phases (420ms × 4); `letter-spacing: 0`, `font-feature-settings: 'liga' 0`, fixed `1ch` per dot. PR **#70** merged to `main`.

---

## 2026-08-19 — Loader fixes re-enforced (subtitle, mark, dots)

- **Issue:** Founder reported last three changes (subtitle up 4px, 00 asset +10%, ASSEMBLING dots) did not take effect — only title (ASSEMBLING ORIGIN weight/size) visible.
- **Root causes:** (1) Subtitle — generic `.site00-loader-copy__subtitle` stack margin + composition-only 4px nudge; (2) Mark — `max-width: 88px` cap never applied because PNG renders below 80px; (3) Dots — opacity keyframes on separate spans still read as one blinking dot.
- **Fix:** Subtitle region `translateY(-4px)`, remove generic subtitle margin; mark `transform: scale(1.1)` under `.site00-immersive-loader`; dots use width-clip animation on literal `...` track (1ch→2ch→3ch→0). PR **#71** merged to `main`.

---

## 2026-08-19 — Loader bottom cluster up 20px (second nudge)

- **Request:** Move ASSEMBLING status, progress bar, and tagline below it upward in tandem 20px (overlay only).
- **Fix:** Status nudge 60→**40px**, progress track/pct 58→**38px**, tagline 40→**20px**. PR **#72** merged to `main`.

---

## 2026-08-19 — Loader footer signature up 14px

- **Request:** Move 00 PNG asset and red SITE label below it upward in tandem 14px (overlay only).
- **Fix:** Signature inner `translateY` −26px → **−40px** on `.site00-loader-copy__signature`. PR **#73** merged to `main`.

---

## 2026-08-19 — Loader title −2px + subtitle up 4px (repeat)

- **Request:** Reduce ASSEMBLING ORIGIN text 2px; move CONNECTING TO ORIGIN subtitle up 4px only.
- **Fix:** Title size offset −10px → **−12px**; subtitle region translate −4px → **−8px**. PR **#74** merged to `main`.

---

## 2026-08-19 — Loader title −2px + subtitle up 2px

- **Request:** Reduce ASSEMBLING ORIGIN 2px; move CONNECTING TO ORIGIN up 2px only.
- **Fix:** Title size offset −12px → **−14px**; subtitle region translate −8px → **−10px**. PR **#75** merged to `main`.

---

## 2026-08-19 — Loader title −4px + subtitle up 4px

- **Request:** Reduce ASSEMBLING ORIGIN 4px; move CONNECTING TO ORIGIN up 4px only (not down).
- **Fix:** Subtitle region translate −10px → **−14px** (PR **#76**). Title offset −14px → **−18px** completed in PR **#77** (partial merge in #76).

---

## 2026-08-19 — Loader title −2px + subtitle up 4px

- **Request:** Reduce ASSEMBLING ORIGIN 2px; move CONNECTING TO ORIGIN up 4px.
- **Fix:** Title size offset −18px → **−20px**; subtitle region translate −14px → **−18px**. PR **#78** merged to `main`.

---

## 2026-08-19 — Loader dynamic gray subtitle (active stage)

- **Issue:** Gray subtitle not updating dynamically — stuck on one line (e.g. CONNECTING TO ORIGIN) while header stayed static; should be the only constantly changing copy line reflecting current preload work.
- **Root cause:** Subtitle tied to *completed* stage copy; stayed on prior milestone until next stage finished.
- **Fix:** `resolveActiveStageSubtitle()` derives subtitle from progress (first unreached milestone). Wired in `Site00ImmersiveLoader` + preview; `completeStage` advances to next stage copy. PR **#79** merged to `main`.

