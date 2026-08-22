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

---

## 2026-08-19 — Loader gray subtitle live creep (smooth stage updates)

- **Issue:** Gray subtitle still felt static — tied to `displayProgress` (0 until copy-active) and discrete milestone jumps only; should be the one line visibly updating as preload work advances under the static black header.
- **Fix:** `useSite00LoaderSmoothProgress` + `site00LoaderProgressCreep.ts` creep progress between stage floors; subtitle + bar driven by `liveProgress` (smooth creep, not copy-gated); subtitle crossfade on change. Wired in world + ASSTS cold-start gates. PR pending.

---

## 2026-08-19 — Loader subtitle word-count rule (max 3 words)

- **Request:** Gray loader subtitle sentences max **3 words**; **4 words** only when every word is ≤3 letters.
- **Fix:** Shortened all route + ASSTS stage subtitles (e.g. Origin: BOOTING MARBLE → LOADING MODULES → LINKING ORIGIN → BUILDING HOMEPAGE → FINALIZING). Added `site00LoaderSubtitleCopy.ts` with `assertLoaderSubtitle()` enforced at config build time. PR pending (same branch as live creep).

---

## 2026-08-19 — Loader subtitle dense dynamic copy (no assembling)

- **Request:** Gray subtitles must not reuse "assembling" (reserved for status above progress bar); verbiage should be denser and more dynamic, not repetitive BOOTING/LOADING/LINKING patterns.
- **Fix:** Rewrote all route + ASSTS stage subtitles with varied verbs (WAKING, PULLING, HANDSHAKE, STITCHING, SEALING, etc.). `assertLoaderSubtitle()` now rejects any `assembl*` term. Per-route unique ready-line copy (e.g. Origin: SEALING ORIGIN). PR #80 updated.

---

## 2026-08-19 — Loader animation shift: fix not lost; preview parity

- **Question:** Animation stable on debug inspection but shifts on `/loader-preview` — was focal fix lost in a PR?
- **Answer:** **No.** Split focal fix still on `main` (`89b3ce7` bg vs animation anchors; `3c5a730` mobile bg `center 45%`). Animation stays `center center`; static bg pre-shifts down on mobile.
- **Root cause of mismatch:** Debug/inspection URLs typically use `?loaderDebug=1&forceCopy=1` (copy visible from start — only MP4 fades in). Plain `/loader-preview` hid copy until animation start (`701f2ca`), so copy + video appearing together read as “animation shift”. Preview also skipped boot path and never seeded focal document vars.
- **Fix:** `/loader-preview` defaults `forceCopyActive` (opt out `?forceCopy=0`); seeds focal vars + clears stale boot shell; boot shell teardown deferred until animation playing; media debug label shows BG/ANIM focal. PR #80.

---

## 2026-08-19 — Loader progress bar sprinting to 100% early

- **Issue:** Progress bar hit ~100% while environment animation still playing — marked done but still loading.
- **Root cause:** `creepLoaderProgress` used a bogus `* 60` multiplier (~480%/sec); after preload tasks finished (floor 82), creep ceiling was 99.99 so bar sprinted to 100 during the 4.2s cinematic hold before `forceComplete`.
- **Fix:** Linear creep (~5.7 pts/s); cap pre-complete ceiling at **98** until gate calls `forceComplete`. Bar reaches high-90s over ~2.8s then holds until exit. PR #80.

---

## 2026-08-19 — Loader animation jump regression (revert + inline focal fix)

- **Issue:** After PR #80 preview parity changes, animation **jumped** on cold start/preview instead of matching debug inspection (`?loaderMediaDebug=1&forceCopy=1` — inline bg `center 45%` / anim `center center`).
- **Revert:** PR #80 focal parity commit reverted — no default `forceCopy`, no `syncSite00LoaderFocalDocumentVars`, no deferred boot teardown until MP4 playing (that made jump worse).
- **Root cause (post-revert):** (1) Smooth progress creep re-rendered media stack ~60fps; (2) CSS `object-position: var(...)` competed with inline focal on img/video; (3) boot shell used `background-image` + `background-position` while React used `object-fit: cover` + inline `object-position` — handoff mismatch on `/`.
- **Fix:** `ImmersiveLoaderMedia` memo isolates media from progress re-renders; inline `objectPosition` only (CSS vars removed from img/video); **layer 1 unmounted on MP4 play** (`onPlaying`) — never restored during exit; boot shell + boot.js use `<img object-fit: cover>` matching React; `/loader-preview` clears boot shell on mount; boot gate includes `/` for early origin paint. PR #80 updated.

---

## 2026-08-19 — Loader bg focal revert 45%→40% + EXIT 00 gray mobile

- **Loader jump:** Animation still played lower than static bg at handoff — `center 45%` tune (3c5a730) over-corrected from validated `center 40%` (89b3ce7). Reverted mobile bg focal to **40%** in config + boot.js; inline `objectFit: cover` on img/video for iOS parity.
- **EXIT 00:** Locations directory header — mobile-only gray (`var(--site-text-muted)`) instead of red for `.site00-directory-exit` in `site00-fast-travel.css`.

---

## 2026-08-19 — Loader exit sequence: no layer 1 flash / white gap

- **Issue:** Layer 1 “hidden” still flashed back — white screen, static still again, then page. Wrong sequence.
- **Root cause:** (1) `teardownSite00AsstsBootShell` on bg load released `#root` early (`site00-assts-boot` class removed); (2) exit CSS faded entire loader (opacity 0) exposing empty `#root`; (3) destination page mounted only after loader unmounted (fresh paint + static env).
- **Fix:** `stripSite00BootShellBackground()` on bg load + MP4 play (never full boot teardown until exit); `#root` stays hidden until exit prep; `releaseSite00ImmersiveBootRoot()` + mount page under loader + `waitForLoaderExitPaint()` before exit phase; copy fades only — MP4 stays until portal removed; same pattern in world + ASSTS gates. PR #80.

---

## 2026-08-19 — Loader focal: shift animation layer, not static bg

- **Issue:** White gap at top of viewport before MP4 — layer 1 static still shifted (`center 40%`) instead of filling edge-to-edge.
- **Fix:** Swap focal strategy — **background mobile locked `center center`** (no top gap); **animation mobile `center 40%`** (MP4 tuned to meet still). Boot.js bg focal always center center. Debug: `ANIM center 40% · BG center center`.

---

## 2026-08-19 — Loader gray subtitle 2s cycle

- **Request:** Dynamic gray subtitle below black header (e.g. ASSEMBLING ORIGIN) should change every **2 seconds**.
- **Fix:** `useSite00LoaderCyclingSubtitle` rotates through route stage subtitles every 2000ms while copy is active; locks to ready-line on complete. Progress still drives bar; subtitle no longer tied to milestone creep only. PR #80.

---

## 2026-08-19 — Origin loader subtitle copy (plain language)

- **Request:** Replace HANDSHAKE ORIGIN — cycle text should read like real sentences, not AI/dev jargon.
- **Fix:** Origin gray subtitle cycle: WAKING MARBLE HALL → LOADING ORIGIN HOME → OPENING ORIGIN HALL → BUILDING HOMEPAGE → ORIGIN IS READY. PR #80.

---

## 2026-08-19 — All routes: plain loader subtitle cycles (page-specific)

- **Request:** 2s gray subtitle cycle + plain language applies to **all pages**, not just Origin — copy must reflect the page actually loading.
- **Fix:** Rewrote every entry in `site00LoaderRouteCopy.ts` (Locations, Enter, IDNTY state/assessment/shell, BLDR, Evolve, Origin, default) + ASSTS vault stages in `site00LoaderConfig.ts`. Pattern per route: WAKING → LOADING [page] → OPENING → BUILDING → [PAGE] IS READY. `resolveSite00ImmersiveLoaderConfig(pathname)` already merges route copy for all world routes; cycling hook reads `config.stages`. PR #80.

---

## 2026-08-19 — Loader subtitle: stage-driven, no loop

- **Issue:** Gray subtitle cycled on a blind 2s timer and **looped back** to the first line (e.g. after OPENING…) while the loader was still running — copy did not match actual preload work.
- **Fix:** Removed `useSite00LoaderCyclingSubtitle`. Subtitle now comes from `resolveActiveStageSubtitle(config.stages, liveProgress)` — tied to milestone progress + smooth creep between stages. Each line stays until progress crosses the next stage threshold; final ready line holds until exit. No modulo wrap. PR #80.

---

## 2026-08-19 — Loader desktop text overlay mirrors mobile

- **Request:** Update loading screen text overlay for **desktop only** to mirror mobile settings and position (desktop animation/media unchanged).
- **Root cause:** ASSTS used a separate 1672×941 desktop composition + bumped typography at ≥768px; world routes used mobile map but portrait artboard letterboxed on landscape (`min(scaleW, scaleH)`), shifting copy vs mobile.
- **Fix:**
  - `useLoaderPresentation` → always `'mobile'` for live text overlay (all loaders).
  - `LoaderCompositionProvider` accepts `mediaPresentation`; when desktop media, artboard scales with **scaleW** (full viewport width, same edge-to-edge feel as phone).
  - `loader-composition-map-desktop.ts` copy regions + typography updated to mirror mobile normalized anchors (debug/ref-map parity).
  - CSS: `.site00-immersive-loader--media-desktop` full-width stage viewport; legacy `--desktop` ui rules scoped to ref-map tooling only.
- **Branch:** `cursor/loader-desktop-copy-parity-796f`.
- **Inspect:** `/loader-preview?forceCopy=1` on wide viewport — copy positions should match mobile.

---

## 2026-08-19 — Loader animation: play once, hold opening frame, focal alignment

- **Request:** Fix loading **animation** (not text overlay) — play once through build, hold on opening frame, align video focal with static layer; no visual loop/restart.
- **Root causes:** MP4 `loop={true}` reset timeline; static stripped on first play while video at frame 0; mobile anim focal `center 40%` vs static `center center`; gate used wall-clock hold unrelated to video timeline.
- **Fix:**
  - `Site00LoaderAnimation`: `loop={false}`; `timeupdate` pauses at 50% duration (`site00LoaderAnimationPlayback.ts`); `onOpeningHold` callback.
  - `ImmersiveLoaderMedia`: static layer strips on opening hold (not first play); video uses **background focal** (both `center center`).
  - `Site00WorldColdStartGate` + `AsstsColdStartGate`: `waitForLoaderAnimationOpeningHold` + `waitForOpeningFrameHold` (1.8s min dwell) replace `waitForMinCinematicHold`.
  - `SITE00_LOADER_MEDIA_FOCAL.animation.mobile` → `center center`.
- **Branch:** `cursor/loader-animation-play-once-796f`.
- **Inspect:** `/loader-preview?forceCopy=1&loaderMediaDebug=1` — build plays once, holds ~5s mark, no loop jump.

---

## 2026-08-19 — Laptop Mobile tab: centered phone device frame

- **Issue:** Mobile toggle on desktop/laptop stretched mobile layout full browser width (390×844 artboard scaled with `scaleW = shell width`) — looked like blown-up mobile, not a phone; hard to inspect/zoom.
- **Fix:** `Site00MobileArtboardShell` now renders a **centered phone device frame** (bezel, rounded screen, home indicator) with the 390×844 artboard inside the screen only. Scale uses `measureSite00MobileDevicePreviewScaleBox` — fits within viewport padding, max 1.15×, never full laptop width. Outer shell `overflow: auto` + pinch-zoom preserved. Actual phones unchanged (native full-width).
- **Branch:** `cursor/mobile-device-frame-preview-796f`.

---

## 2026-08-19 — Fast Travel SIGN IN TO ENTER + site-wide uppercase audit

Summary of **this chat**: user requested Fast Travel **SIGN IN TO ENTER** on one row and a **full site audit** converting all text to uppercase.

- **Context:** Mobile Fast Travel panel showed "SIGN IN" / "TO ENTER" on two lines; several card descriptions (e.g. "Access your account.") were sentence-case. User wanted entire SITE 00 product uppercase.

- **Fast Travel fixes:**
  - `AuthLockedDestination.tsx` + `DirectoryCard.tsx` — single-line **SIGN IN TO ENTER** (no `<br />`); `white-space: nowrap` on auth labels in `site00-fast-travel.css`.
  - `site00-copy.ts` — shared `SITE00_COPY_SIGN_IN_TO_ENTER`, `site00AuthLockedAriaLabel()`, `site00UppercaseCopy()`.
  - `fast-travel.ts` — `d()` helper uppercases label/description at runtime; `resolveFastTravel()` uppercases location title/descriptor + section titles.

- **Site-wide uppercase enforcement:**
  - Extended brand uppercase law in `site00-typography.css` to portaled/off-shell surfaces: `.site00-fast-travel`, `.site00-origin-layout-switch`, `.site00-mobile-artboard`, `.site00-page`, `.site00-ecosystem-shell`, `.site00-signin-page`, `.composition-studio`.
  - Password inputs remain lowercase (`text-transform: none`).
  - Batch-uppercased `aria-label` values across public `src/site00/**` (~40 files) + admin shell (~24 files).
  - Source copy fixes: CTRL overview CTAs, projects/sites search placeholders + empty states, GlobalNav disabled tooltip, account guard recovery message, composition studio "RETURN TO EDITOR".

- **Branch:** `cursor/site-wide-uppercase-copy-796f`.
- **Inspect:** Open Fast Travel from mobile header on sign-in/origin — auth-gated cards show one-line red **SIGN IN TO ENTER**; all panel copy uppercase.

---

## 2026-08-19 — Fast Travel current location descriptor red

- **Request:** Change current location text on Fast Travel from gray to red.
- **Fix:** `.site00-fast-travel__current-descriptor` (e.g. **NAVIGATE THE ECOSYSTEM.**) now uses `var(--site-red)` instead of `var(--site-text-muted)`.
- **Branch:** `cursor/fast-travel-current-location-red-796f`.

---

## 2026-08-19 — Laptop Mobile preview: 1:1 phone screen, no clip

- **Issue:** Mobile toggle on laptop showed phone device frame but Origin content was clipped — hero tagline truncated on right, bottom status/guidance overlapped home-indicator chin. Preview did not match real 390×844 phone.
- **Root causes:** (1) Artboard content was `transform: scale()` inside a smaller clip box — layout box (390×844) overflowed scaled scaler and `overflow:hidden` cropped edges. (2) `position: fixed` footer still anchored to browser viewport in mobile artboard. (3) Typography tokens using `vw` resolved against laptop browser width inside frame — headline/tagline oversized vs real phone.
- **Fix:**
  - Scale the **entire phone device frame** to fit viewport; screen content stays **1:1 at 390×844** (no artboard transform).
  - `Site00AppShell` pins footer `absolute` when `useSite00MobileArtboardPreview()`.
  - Mobile-artboard CSS: re-anchor fixed Origin UI (hero, swipe, footer) to artboard; lock typography tokens to 390px-phone clamp floors.
  - Origin mobile hero max-width widened slightly (`min(60vw/60%, 252px)`) for tagline fit.
- **Branch:** `cursor/mobile-device-preview-fit-796f`.

---

## 2026-08-19 — Mobile five-bay nav + geometric SVG icons

- **Request:** Replace generic mobile bottom-nav icons with five approved intricate geometric icons; nav order ORIGIN · IDNTY · LOCATIONS · PROJECTS · CTRL ROOM. Use supplied SVG geometry directly (64×64, currentColor + #EB1C24 accents).
- **Implementation:**
  - `MobileSiteNavigation` + `mobile-site-nav.ts` — five equal bays, route-derived active state (red icon + label, no pill/glow).
  - `src/site00/icons/mobile-nav/` — inline React SVG components at 26–28px (LOCATIONS center 28px).
  - **00 ORIGIN** — verbatim supplied SVG paths in `Site00OriginNavIcon.tsx`.
  - IDNTY / LOCATIONS / PROJECTS / CTRL ROOM — reference-matched drafting marks (same 64×64 language); swap when full SVG source pasted for icons 02–05.
  - Wired through `Site00MobileShell`, `Site00EcosystemMobileShell`; removed legacy 3-bay `SITE00_MOBILE_NAV`.
  - CSS: 5-column grid, icon slot, artboard-pinned nav in laptop Mobile preview.
- **Branch:** `cursor/mobile-nav-geometric-icons-796f`.

---


## 2026-08-19 — Fast Travel header icon swap

- **Request:** Replace Fast Travel trigger icon with new Supabase asset `3C9BC909-76E8-4FBB-8931-0AF91444DD40.png`.
- **Fix:** Updated `SITE00_FAST_TRAVEL_ICON_PATH` in `locations-directory.ts`; `FastTravelTrigger` resolves via existing `resolveSite00PublicAsset` (22×22, object-fit contain).
- **Branch:** `cursor/fast-travel-icon-update-796f`.

---
## 2026-08-19 — Fast Travel trigger outline removal (mobile)

- **Request:** Remove blue outline around mobile Fast Travel icon button.
- **Fix:** `outline: none`, `box-shadow: none`, `-webkit-tap-highlight-color: transparent` on `.site00-fast-travel-trigger` (+ focus/active states) in `site00-fast-travel.css`.
- **Branch:** `cursor/fast-travel-remove-outline-796f`.

---

## 2026-08-19 — Sign-in page icon update (Supabase NAV PNG)

- **Request:** Replace sign-in page icon with Supabase asset `NAV/7D83E4A6-BB5B-4092-A002-EB9DAA1E79A2.png`.
- **Fix:** Added `SITE00_SIGNIN_ICON_PATH` in `site00-auth-assets.ts`; `Site00OrbitalMark` now renders `<img>` via `resolveSite00PublicAsset` (desktop brand panel + mobile intro). CSS `object-fit: contain` on `.site00-orbital-mark__img`.
- **Branch:** `cursor/signin-icon-update-2c3b`.

---

## 2026-08-19 — Sign-in icon not visible on fsbw-dev preview (cache + sizing)

- **Issue:** Founder on `site00.fsbw-dev.com/origin/sign-in` still saw old red wireframe SVG; PNG not requested in network tab.
- **Cause:** Preview tunnel can serve stale Vite module cache from prior connector session; portrait PNG (1024×1536) also cramped in square 220×220 box.
- **Fix:** Restart cloud preview Vite with `--force`; preload sign-in icon in `Site00AuthShell`; portrait `aspect-ratio: 2/3` sizing + `fetchPriority="high"` on mark img. Branch `cursor/signin-icon-display-fix-2c3b`.
- **User action:** Hard refresh sign-in page (mobile Safari: pull-to-refresh or clear site data) after preview reconnects.

---

## 2026-08-19 — Founder Access Credential system (physical-to-digital)

- **Request:** Full sprint — serialized Founder Access Cards with QR → `/access/:credentialId` → ACCESS RECOGNIZED → ENTER SITE 00; admin CRUD; scan tracking; account association; RLS.
- **Database:** `site00_access_credentials`, `site00_access_credential_events`, sequence + `site00_allocate_access_credential_code()` RPC. Migration `20260820000000_site00_access_credentials.sql` applied to Supabase.
- **API:** Public `/api/site00-access` (resolve, scan, enter, associate); admin `/api/admin/site00-access-credentials` (list, detail, create, activate/revoke/deactivate).
- **Public UI:** `/access/00-0001` with mobile/desktop layouts, 1.4s recognition sequence, invalid/revoked/inactive states. Skips cinematic loader.
- **Session:** `sessionStorage` active credential + visit session id; auto-associate on sign-in via `onSignInSuccess`.
- **Admin:** `/admin/site00/access-credentials` list + detail with QR (`qrcode` npm). Nav item ACCESS.
- **Branch:** `cursor/founder-access-credentials-2c3b`.

---

## 2026-08-20 — Sign-in icon cache bust + magic link red on iOS

- **Issue:** Sign-in page still showed old wireframe SVG on fsbw-dev preview; magic link button text/icon blue on iOS Safari.
- **Fix:** `SITE00_SIGNIN_ICON_VERSION=2` cache bust on resolved NAV PNG; magic link `-webkit-appearance: none` + explicit red on button, icon, label spans. Branch `cursor/signin-icon-magic-link-fix-2c3b`.

---

## 2026-08-20 — Founder Card access landing moodboard (reticle PNG + desktop/mobile compositions)

Summary of the **whole conversation so far** in this cloud agent run.

- **Context:** Implement Founder Card digital access landing at `/access/:credentialId` per approved moodboard; use canonical geometric access icon PNG (`NAV/0DB32E47-6CE4-484F-841B-DBE2397218BE.png`) directly — no CSS/SVG redraw. Isolated route; do not restyle Origin, Sign In, Locations, etc.

- **Topics covered (cumulative):** Sign-in icon cache bust + iOS magic link red; Founder Access Credential backend (Supabase tables, API, admin CRUD, scan tracking); this sprint = moodboard-faithful access landing UI.

- **Decisions / outcomes:**
  - Separate **desktop** and **mobile** compositions (`CredentialAccessDesktop`, `CredentialAccessMobile`) sharing credential state/routing via `CredentialAccessShell`.
  - Approved reticle loaded via `AccessReticle` + `resolveSite00PublicAsset(SITE00_ACCESS_RETICLE_PATH)` with version cache bust.
  - ~1.7s recognition sequence (detecting → scanning → recognized → authorized → ready); `prefers-reduced-motion` jumps to static authorized.
  - Desktop: header grid (SITE 00 ♦ | [ ACCESS PROTOCOL ] | code + target), large reticle, clock, ACCESS RECOGNIZED, credential/status, CTA, footer strip (detection / ORIGIN AWAITS / IDENTITY • LOCATIONS • PROJECTS / CTRL ROOM).
  - Mobile: custom header (logo + target + Fast Travel), protocol stack, reticle, copy, CTA, detection message, canonical **five-item** `MobileSiteNavigation` (LOCATIONS center).
  - Credential URL remains **recognition + routing only** — does not bypass CTRL Room auth.

- **Changes:**
  - `src/site00/config/access-credentials.ts` — `SITE00_ACCESS_RETICLE_PATH`, version.
  - New access components: `AccessReticle`, `AccessRegistrationChrome`, `CredentialAccessDesktop/Mobile/Shell`, headers, footer, protocol/clock/status/CTA/target marks.
  - Rewrote `site00-access.css` scoped to `.site00-access-page`; updated recognition sequence + experience wiring.
  - Branch: `cursor/founder-access-landing-2c3b`.

- **Conventions:** Access page icon = PNG asset only; sign-in icon (`7D83E4A6`) is separate. Preview may need Vite `--force` + hard refresh on mobile Safari.

---

## 2026-08-20 — Access landing debug route (`/access/debug`)

- **Request:** Debug route to audit Founder Card access page design and function without live API/credential.
- **Route:** `/access/debug` — mock data, no scan/enter API calls. Toolbar switches state, layout, static animation.
- **Query params:** `state=recognized|not_found|closed|inactive|loading`, `code=00-0001`, `static=1`, `site00MobileLayout=1` (force mobile on desktop).
- **Canonical URL shown:** `https://site00.com/access/00-0001`. **LIVE ROUTE →** links to production `/access/:code`.
- **Branch:** `cursor/access-debug-route-2c3b`.

---

## 2026-08-20 — Fast Travel list arrows (Quick Jump + Return)

- **Request:** Add red arrows from locations directory to right side of Fast Travel QUICK JUMP and RETURN panels.
- **Fix:** Reuse `Site00DirectoryArrowIcon` on `site00-fast-travel__dest--list` items; row layout with arrow on right; active translateX nudge matches directory cards.
- **Branch:** `cursor/fast-travel-arrows-2c3b`.

---

## 2026-08-20 — Fast Travel close button + current location colors

- **Request:** Remove blue square on X close; shrink close 5%; swap CURRENT LOCATION (gray→red) and descriptor NAVIGATE THE ECOSYSTEM (red→gray).
- **Fix:** `site00-fast-travel.css` — close button `-webkit-appearance`, outline/tap-highlight reset; 44px→42px, font 1.625rem→1.544rem; label/descriptor color swap.
- **Branch:** `cursor/fast-travel-close-colors-2c3b`.

---

## 2026-08-20 — Sign-in CREATE ACCOUNT line wrap

- **Request:** Wrap "CREATE ACCOUNT" to next line below "NEW TO SITE 00?" on mobile sign-in footer.
- **Fix:** `site00-signin-form__footer-link` `display: block` + small top margin in `site00-auth.css`.
- **Branch:** `cursor/signin-create-account-wrap-2c3b`.

---

## 2026-08-20 — Cloud preview cache bust (mobile Safari stale modules)

- **Issue:** Founder not seeing Fast Travel arrows, close-button fix, or color swaps on tunnel — server had latest code; phone cached old JS modules (also showed gray CURRENT LOCATION + blue X = pre-PR-115 bundle).
- **Fix:** Vite cloud preview injects unique session id into `index.html` (`main.tsx?v=…`, app-build-id meta) on each dev-server boot. Explicit red stroke on Fast Travel arrow SVG paths.
- **Branch:** `cursor/preview-cache-bust-arrows-2c3b`.

---

## 2026-08-20 — Fast Travel arrow size −10%

- **Request:** Decrease red arrows on Fast Travel list panels by 10%.
- **Fix:** `SITE00_FAST_TRAVEL_ARROW_SIZE = 16.2` (90% of directory 18px); locations directory unchanged.
- **Branch:** `cursor/fast-travel-arrow-size-2c3b`.

---

## 2026-08-20 — Mobile ecosystem hub panel icons (IDNTY / BLDR / EVOLVE)

Summary of the **whole conversation so far** in this cloud agent run (cumulative).

- **Context:** Founder Card access landing moodboard, debug route, Fast Travel arrows/close/colors, sign-in footer wrap, cloud preview cache bust, Fast Travel arrow size; then mobile IDNTY page icons should match Origin desktop expanded-panel geometric PNGs (not generic user/key SVG or CSS crosshair).

- **Request:** Icons on mobile IDNTY / BLDR / EVOLVE hub pages use the same approved `OriginPanelIcon` PNGs as Origin desktop expanded panels (`origin-panel-icons.ts`).

- **Decisions / outcomes:**
  - Reuse `OriginPanelIcon` with new `sm` size (48px) for mobile hub heroes and hub cards.
  - Shared `EcosystemHubHero` in `Site00PagePrimitives` — `PageIntro` + top-right panel icon (replaces IDNTY gateway CSS crosshair).
  - IDNTY signed-out gateway: hero + CREATE IDNTY card use IDNTY panel icon; SIGN IN keeps `Site00UserIcon`.
  - BLDR and EVOLVE hub pages get matching hero panel icons.

- **Changes:**
  - `OriginPanelIcon.tsx` — `sm` size + `--sm` CSS class.
  - `Site00PagePrimitives.tsx` — `EcosystemHubHero`.
  - `IdntyHubPage.tsx`, `BldrHubPage.tsx`, `EvolveHubPage.tsx` — wire panel icons.
  - `site00.css`, `site00-ecosystem.css` — hero/card icon layout; removed `.site00-idnty-gateway__crosshair`.

- **Branch:** `cursor/mobile-ecosystem-panel-icons-2c3b`.

---

## 2026-08-20 — Mobile horizontal scroll removed (vertical only)

- **Request:** Remove horizontal page scroll on mobile — vertical scroll only.
- **Fix:** Mobile overflow guards on `html`/`body`/`#root` when SITE 00 mobile shells are active; `overflow-x: hidden` + `max-width: 100%` on mobile shell chain; origin mobile layout + scaled env layer clipping; public page footer stacks on narrow widths; hub cards get `min-width: 0` on copy flex child.
- **Branch:** `cursor/mobile-no-horizontal-scroll-2c3b`.

---

## 2026-08-20 — Fast Travel Sign In panel icon

- **Request:** Put the geometric sign-in page icon on the Fast Travel UP NEXT Sign In card, above the text.
- **Fix:** `FastTravelSection` renders `Site00OrbitalMark` (approved NAV PNG `7D83E4A6`) on primary `sign-in` destinations; card uses `space-between` layout with 40px mark at top.
- **Branch:** `cursor/fast-travel-signin-icon-2c3b`.

---

## 2026-08-20 — Fast Travel Create Identity panel icon

- **Request:** Put the Origin desktop expanded IDNTY panel geometric icon on the Fast Travel UP NEXT Create Identity card, above the text.
- **Fix:** `FastTravelSection` renders `OriginPanelIcon panel="idnty"` on primary `create` destinations; shared `--has-mark` layout with Sign In card.
- **Branch:** `cursor/fast-travel-idnty-icon-2c3b`.

---

## 2026-08-20 — IDNTY gateway Sign In panel icon

- **Request:** Replace generic user icon on IDNTY mobile Sign In hub card with the geometric sign-in page icon.
- **Fix:** `IdntyHubPage` SIGN IN `HubActionCard` uses `Site00OrbitalMark` (approved NAV PNG); hub-card CSS sizes mark at 40px width.
- **Branch:** `cursor/idnty-signin-panel-icon-2c3b`.

---

## 2026-08-20 — Cloudflare preview tunnel restart

- **Request:** Restart the preview tunnel.
- **Action:** Killed `site00-preview-tunnel` tmux session; relaunched `/tmp/cloudflared tunnel --no-autoupdate run --token "$SITE00_CLOUDFLARE_TUNNEL_TOKEN"`. Vite on 5174 left running. Four tunnel connections registered; preview URL refreshed in `/tmp/site00-cloud-preview-url.txt`.

---

## 2026-08-20 — Fast Travel Current Location IDNTY icon

- **Request:** Add the identity panel geometric icon to the Fast Travel Current Location panel.
- **Fix:** `FastTravelLocation.panel` optional field; IDNTY route profile sets `panel: 'idnty'`; `CurrentLocationCard` renders `OriginPanelIcon` above location text.
- **Branch:** `cursor/fast-travel-current-location-icon-2c3b`.

---

## 2026-08-20 — IDNTY gateway hub card icons (approved NAV PNGs)

- **Request:** Replace Sign In and Create IDNTY panel icons on `/idnty` gateway with specific Supabase NAV PNGs; do not change header hero icon.
- **Assets:** Sign In `NAV/94368368-C1CF-43A2-8F18-5242CB944AFC.png`; Create IDNTY `NAV/EAC75AD6-1486-4476-888A-8C9F6734D308.png`.
- **Fix:** `idnty-gateway-assets.ts` + `IdntyGatewayHubIcon`; hub cards only — `EcosystemHubHero` Origin panel header unchanged.
- **Branch:** `cursor/idnty-gateway-panel-icons-2c3b`.

---

## 2026-08-20 — Ecosystem hub header icon on title row

- **Request:** Header panel icons should sit on the same row as the header text, not vertically centered in the hero block.
- **Fix:** `EcosystemHubHero` title row flex layout — bracket heading + `OriginPanelIcon` inline; subtitle below; removed absolute top-right positioning.
- **Branch:** `cursor/ecosystem-hero-icon-row-2c3b`.

---

## 2026-08-20 — IDNTY investment section icons removed

- **Request:** Remove icons from IDNTY / INVESTMENT grid only; keep brand state card icons above.
- **Fix:** Stop passing `brandStateId` to `InvestmentColumn` on `IdntyStatePage`.
- **Branch:** `cursor/idnty-investment-no-icons-2c3b`.

---

## 2026-08-20 — Mobile IDNTY pages bottom navigation

- **Request:** Mobile identity pages missing bottom navigation panel.
- **Fix:** `IdntyStatePage` uses `Site00MobileShell` on mobile (like assessment); shell-scoped `.site00-mobile-nav` styles apply at all viewport widths; artboard nav gets full grid styling.
- **Branch:** `cursor/idnty-mobile-bottom-nav-2c3b`.

---

## 2026-08-20 — Projects page EVOLVE button relocation

- **Request:** Remove `+ EVOLVE` and `+ NEW BUILD` from Projects header; add `+ EVOLVE` below bottom `+ NEW PROJECT` CTA.
- **Fix:** `ProjectsPage.tsx` — dropped `headerActions`; stacked `+ EVOLVE` in `.site00-eco-mobile-cta` under `+ NEW PROJECT`. CSS: mobile CTA column flex + gap.
- **Branch:** `cursor/projects-evolve-button-relocate-2c3b`.

---

## 2026-08-20 — Projects panel text colors

- **Request:** Right-aligned meta in PROJECT ACTIVITY / MY ROLES (e.g. `2H AGO`, `4 projects`) → red; panel section titles → gray.
- **Fix:** Scoped `.site00-page--projects` rules in `site00-ecosystem.css` for continuation panel titles and feed/roles right-side text.
- **Branch:** `cursor/projects-panel-text-colors-2c3b`.

---

## 2026-08-20 — Post sign-in Vite auditLog import error

- **Issue:** After sign-in, Vite overlay: failed to resolve `./_lib/auditLog.js` from `api/profile.ts` — dev server was treating `/api/profile` as a frontend module.
- **Fix:** Added `api/_lib/auditLog.ts` + `api/_lib/email/sendEmail.ts` stubs; replaced ASSTS-only Vite plugin with `scripts/vite-site00-local-api.mjs` serving profile/session/activity and other core API routes locally in dev.
- **Branch:** `cursor/fix-profile-auditlog-import-2c3b`.

---

## 2026-08-20 — Fast Travel CTRL ROOM subtitle copy

- **Request:** IDNTY UP NEXT CTRL ROOM card — remove "your"; subtitle should read "OPERATING ENVIRONMENT."
- **Fix:** `fast-travel.ts` signed-in IDNTY `ctrl-room` destination description.
- **Branch:** `cursor/fast-travel-ctrl-room-copy-2c3b`.

---

## 2026-08-20 — Fast Travel current location icon removed

- **Request:** Remove IDNTY geometric icon from Fast Travel CURRENT LOCATION panel.
- **Fix:** `CurrentLocationCard` no longer renders `OriginPanelIcon`; dropped `panel` from `FastTravelLocation` / IDNTY route profile; removed unused CSS.
- **Branch:** `cursor/fast-travel-no-current-location-icon-2c3b`.

---

## 2026-08-20 — Fast Travel UP NEXT artwork integration (9 PACK assets)

- **Request:** Integrate 9 approved Supabase PACK illustrations into UP NEXT cards by destination id; preserve sign-in + create existing marks.
- **Fix:** `fast-travel-assets.ts` canonical registry; `FastTravelDestinationArt` component; wired in `FastTravelSection` + auth-locked primary cards; `object-fit: contain` scoped CSS.
- **Branch:** `cursor/fast-travel-up-next-artwork-2c3b`.

---

## 2026-08-20 — Fast Travel UP NEXT card index + registration mark

- **Request:** Add faded positional index (0/1) top-left and red upper-right registration SVG to UP NEXT card shell; not baked into PACK PNGs.
- **Fix:** `FastTravelUpNextCardChrome` + `FastTravelUpNextRegistrationMark`; index from map position in `FastTravelSection`; layered CSS on `--up-next` primary cards (sign-in/create included).
- **Branch:** `cursor/fast-travel-up-next-card-chrome-2c3b`.

---

## 2026-08-20 — Fast Travel UP NEXT z-index fix

- **Issue:** PACK artwork painted over faded index + red registration mark (art z-index 2 > index z-index 1).
- **Fix:** Artwork/mark z-index 1; index 3; registration 4; copy 5.
- **Branch:** `cursor/fast-travel-up-next-zindex-fix-2c3b`.

---

## 2026-08-20 — Fast Travel artwork audit (sign-in / create)

- **Issue:** IDNTY signed-out UP NEXT showed tiny corner marks instead of full card artwork; sign-in/create bypassed `FastTravelDestinationArt`.
- **Fix:** Added `sign-in` + `create` to `FAST_TRAVEL_DESTINATION_ART` (existing NAV/origin assets); unified all 11 UP NEXT destinations through one art component + `--has-art` layout.
- **Branch:** `cursor/fast-travel-artwork-audit-2c3b`.

---

## 2026-08-20 — Fast Travel registration mark 3-bracket fix

- **Issue:** UP NEXT registration SVG hid bottom-right bracket (`opacity="0"`); spec requires exactly 3 visible brackets (TL, TR, BR) — no bottom-left.
- **Fix:** `FastTravelUpNextRegistrationMark` — 3 paths only; removed hidden fourth path; `overflow: visible` on mark container.
- **Branch:** `cursor/fast-travel-registration-mark-3bracket-2c3b`.

---

## 2026-08-20 — Fast Travel BLDR build selection copy

- **Request:** BLDR UP NEXT card — "BUILD CLASS SELECTION" → "BUILD SELECTION"; subtitle → "CHOOSE BUILD."
- **Fix:** `fast-travel.ts` `bldr-state` destination label/description.
- **Branch:** `cursor/fast-travel-build-selection-copy-2c3b`.

---

## 2026-08-20 — Fast Travel sign-in/create gateway icons + copy

- **Request:** CREATE IDENTITY subtitle → "START YOUR IDENTITY."; sign-in/create UP NEXT still showing old orbital/origin panel icons.
- **Fix:** `fast-travel-assets.ts` maps `sign-in`/`create` to approved IDNTY gateway NAV PNGs (same as hub cards); bumped gateway + PACK art cache versions.
- **Branch:** `cursor/fast-travel-idnty-icons-copy-2c3b`.

---

## 2026-08-20 — Fast Travel sign-in/create PACK folder icons

- **Request:** Sign-in + create UP NEXT icons from `PACK/94368368…` and `PACK/EAC75AD6…` (not NAV folder).
- **Fix:** `fast-travel-assets.ts` direct PACK paths; art version `4` for cache bust.
- **Branch:** `cursor/fast-travel-signin-create-pack-icons-2c3b`.

---

## 2026-08-20 — Fast Travel sign-in/create icon nudge

- **Request:** Move sign-in + create identity UP NEXT artwork down 4px only.
- **Fix:** `FastTravelDestinationArt` `--idnty-entry` modifier + `translateY(4px)`.
- **Branch:** `cursor/fast-travel-idnty-icon-offset-2c3b`.

---

## 2026-08-20 — Loader gray subtitle stuck on “IS READY”

- **Issue:** Gray subtitle showed “BUILDER IS READY” etc. while bar still loading (e.g. 87%) — `resolveActiveStageSubtitle` treated final milestone as active whenever p < 100.
- **Fix:** Ready copy only at 100%; penultimate stage subtitle until then. `completeStage` no longer advances to ready copy after assemble.
- **Branch:** `cursor/loader-subtitle-stage-fix-2c3b`.

---

## 2026-08-20 — BLDR mobile BUILD SYSTEM visual rebuild

Summary of the **whole conversation so far** in this cloud agent run (SITE 00 mobile preview sprint).

- **Context:** Founder attached approved mobile BLDR mockup — `/bldr` hub read as plain informational cards; sprint to recreate “BUILD SYSTEM” experience mobile-only without changing desktop.

- **Topics covered (cumulative):** Projects/IDNTY/Fast Travel/loader fixes from prior turns; this turn = full BLDR mobile hub rebuild per 30-point spec (hero art, sequence nav, unified build system, spine, stage SVGs, terminal CTA, micro-motion, no horizontal scroll).

- **Decisions / outcomes:**
  - Mobile vs desktop split in `BldrHubPage` via `useSite00DesktopArtboardPreview()` — desktop keeps existing `EcosystemHubHero` + `.site00-bldr-split`; mobile renders new `BldrMobileExperience`.
  - Stage copy centralized in `config/bldr-hub-stages.ts` (INPUT/ALIGN/PRODUCTION/RELEASE + DEFINE→GROW sequence).
  - Hero uses approved BLDR panel icon + custom SVG linework; stage art = lightweight inline SVGs telling progressive construction story.
  - CTA preserves `Link` to `SITE00_ROUTES.bldrStart`; three-corner mark from `FastTravelUpNextRegistrationMark`.
  - Styles scoped in `site00-bldr-hub-mobile.css`; `prefers-reduced-motion` respected.

- **Changes:**
  - `src/site00/components/bldr/mobile/*` (BldrMobileExperience, Hero, SequenceIndicator, BuildSystem, Stage, StageArtwork, ActivationCTA, HeroArtwork, ActivationNodeArtwork)
  - `src/site00/config/bldr-hub-stages.ts`
  - `src/site00/styles/site00-bldr-hub-mobile.css`
  - `src/site00/pages/bldr/BldrHubPage.tsx`
  - `src/routes/Site00Routes.tsx` (CSS import)

- **Conventions:** BLDR hub mobile rebuild is component-driven under `components/bldr/mobile/`; do not restyle desktop `.site00-bldr-split` for this experience.

---

## 2026-08-20 — IDNTY mobile IDENTITY DIAGNOSTIC visual upgrade

Summary of the **whole conversation so far** in this cloud agent run (SITE 00 mobile sprints).

- **Context:** Founder attached approved mobile IDNTY / Identity Diagnostic mockup; `/idnty/state` mobile page was sparse with excessive whitespace. Sprint to match reference while preserving four states, artwork, routing, and desktop layout.

- **Topics covered (cumulative):** Prior BLDR mobile BUILD SYSTEM rebuild (PR #144); this turn = full IDNTY mobile diagnostic upgrade per 24-point spec.

- **Decisions / outcomes:**
  - Mobile vs desktop split in `IdntyStatePage` — desktop keeps existing `IdntyDesktopStatePageBody`; mobile renders `IdntyMobileDiagnostic`.
  - Mobile selection: tap card updates context + UI (progression, investment emphasis, handoff); explicit SELECT STATE / investment / handoff CTAs navigate (assessment routes; build-ready → `/bldr/start`).
  - Pricing/services from existing `IDNTY_INVESTMENT_TIERS`; diagnostic copy/CTAs in `config/idnty-diagnostic.ts`.
  - Shared `Site00ThreeCornerMark` (TL+TR+BR only); existing `IdntyBrandStateIcon` PNGs preserved.
  - Styles in `site00-idnty-diagnostic-mobile.css`; responsive 4-col → 2×2 investment grid on narrow widths.

- **Changes:**
  - `src/site00/components/idnty/mobile/*` (Hero, Progression, StateGrid, DiagnosticStateCard, Investment, Handoff, MobileDiagnostic)
  - `src/site00/components/mark/Site00ThreeCornerMark.tsx`
  - `src/site00/config/idnty-diagnostic.ts`
  - `src/site00/styles/site00-idnty-diagnostic-mobile.css`
  - `src/site00/pages/IdntyStatePage.tsx`
  - `src/routes/Site00Routes.tsx` (CSS import)

- **Conventions:** IDNTY mobile diagnostic lives under `components/idnty/mobile/`; do not alter desktop `.site00-state-page-layout` presentation.

---

## 2026-08-20 — EVOLVE mobile Property Evolution redesign

Summary of the **whole conversation so far** in this cloud agent run (SITE 00 mobile sprints).

- **Context:** Founder attached approved mobile EVOLVE / Property Evolution mockup for `/evolve/state`; page felt like plain stacked boxes. Sprint to match reference while preserving Refine/Install/Transform logic, assessment routing, and desktop layout.

- **Topics covered (cumulative):** BLDR mobile BUILD SYSTEM (PR #144); IDNTY Identity Diagnostic (PR #145); this turn = EVOLVE mobile property evolution system.

- **Decisions / outcomes:**
  - Mobile vs desktop split in `EvolveStatePage` — desktop keeps existing state page body; mobile renders `EvolveMobileExperience`.
  - Mobile: tap path card selects + updates intensity rail, selected-path module, closing CTA context; explicit SELECT / BEGIN ASSESSMENT navigates via `evolveAssessmentPath(pathId, 'property')`.
  - Reuses existing `/assets/evolve/*.svg` path icons + evolve-master hero focal; timeline uses inline SVG step art.
  - `resolveMobileSiteNavId` now treats `/evolve*` as LOCATIONS active bay per product IA.
  - Styles in `site00-evolve-mobile.css`; three-corner mark via shared `Site00ThreeCornerMark`.

- **Changes:**
  - `src/site00/components/evolve/mobile/*`
  - `src/site00/config/evolve-diagnostic.ts`
  - `src/site00/styles/site00-evolve-mobile.css`
  - `src/site00/pages/EvolveStatePage.tsx`
  - `src/site00/config/mobile-site-nav.ts`
  - `src/routes/Site00Routes.tsx` (CSS import)

- **Conventions:** EVOLVE mobile experience under `components/evolve/mobile/`; desktop Evolve state page unchanged.

---

## 2026-08-20 — Identity State System V2 (assessment intake)

Summary of the **whole conversation so far** in this cloud agent run (SITE 00 mobile sprints).

- **Context:** Founder attached approved mobile mockup for **01 SOME PIECES EXIST** as canonical visual reference. Sprint upgrades all four identity **assessment landing/intake** flows (00–03) after state selection from `/idnty/state` — without redesigning the recently upgraded IDNTY landing page.

- **Topics covered (cumulative):** BLDR mobile BUILD SYSTEM (PR #144); IDNTY Identity Diagnostic landing (PR #145); EVOLVE Property Evolution (PR #146); this turn = Identity State System V2 for `/idnty/:stateSlug` assessment landings.

- **Decisions / outcomes:**
  - Shared mobile diagnostic shell (`mobileLayout="diagnostic-v2"`) — white system environment, no corridor photo background; IDNTY bottom nav stays active.
  - Reusable V2 components under `components/idnty/state-v2/`: progress rail (accurate position 01/04–04/04), hero + artwork, dynamic overview panels, inventory/diagnostic/verification scanner, connected process system.
  - Four distinct landing experiences: 00 Origin (question list + foundation %), 01 Inventory (FOUND/MISSING scanner + live completeness), 02 Evolution diagnostic (pathway selection), 03 Build verification (asset check + BLDR handoff when ≥60% marked found).
  - Diagnostic values derive from user selections — no hard-coded 40%/2 FOUND/8 GAPS. SITE 00 red/black/gray only (no bright blue rows).
  - Desktop assessment landings unchanged; mobile uses `IdentityStateLandingV2` via `IdntyAssessmentLandingPage`.
  - Persistence reuses `useIdntyAssessment` localStorage (`site00_idnty_assessment_v1`).

- **Changes:**
  - `src/site00/components/idnty/state-v2/*`
  - `src/site00/config/identity-state-v2.ts`
  - `src/site00/styles/site00-idnty-state-v2.css`
  - `src/site00/components/idnty-assessment/IdntyAssessmentShell.tsx` (V2 mobile layout)
  - `src/site00/pages/idnty/assessment/IdntyAssessmentLandingPage.tsx`
  - `src/site00/config/idnty-assessment.ts` (hero copy + unified process strip)
  - `src/routes/Site00Routes.tsx` (CSS import)

- **Conventions:** Assessment V2 mobile under `components/idnty/state-v2/`; IDNTY landing (`IdntyMobileDiagnostic`) untouched. Three-corner mark via shared `Site00ThreeCornerMark` (TL/TR/BR only).

---

## 2026-08-20 — BLDR immersive selection route enhancement (mobile /bldr/state)

Summary of the **whole conversation so far** in this cloud agent run (SITE 00 mobile sprints).

- **Context:** Founder attached immersive BLDR classification reference (hero, 01→03 rail, environmental portals, route spine, NOT SURE diagnostic). Sprint enhances existing mobile `/bldr/state` route — not a rebuild; preserve canonical SITE/WORLD env artwork, routing, and intake logic.

- **Topics covered (cumulative):** Identity State V2 (PR #147); BLDR Classification + intake V2 (PR #148); this turn = immersive portal presentation for mobile build-class selection on `/bldr/state`.

- **Decisions / outcomes:**
  - `/bldr/state` mobile now uses `BldrImmersiveSelection` via thin `BldrClassificationMobile` wrapper; desktop `/bldr/state` unchanged.
  - Reusable components: `BldrImmersiveSelection`, `BldrPortal`, `BldrRouteSpine`, `BldrDiscoveryPanel`; `BuildScaleRail` gains progression dots (● ○ ○ → ● ● ●).
  - Canonical env images from `bldr-entry.ts`: SITE `5E6EAEFD-2085-4FA5-91FA-71BA0610E99D.png`, WORLD `5E89B3D4-2C5A-4E41-9F49-2B065F44C819.png`; Enterprise env slot null until approved asset (`SITE00_BLDR_ENTRY_ENTERPRISE_IMAGE`).
  - `/bldr/start` legacy entry (SITE/WORLD direction cards → `bldrState`) left unchanged — immersive system applies to classification route only.
  - Selection handlers unchanged: SITE/WORLD/ENTERPRISE → assessment slug via `buildClassToAssessmentSlug`; NOT SURE → discovery flow.
  - Three-corner glyph via shared `Site00ThreeCornerMark` (TL/TR/BR only).

- **Changes:**
  - `src/site00/components/bldr/classification/BldrImmersiveSelection.tsx`, `BldrPortal.tsx`, `BldrRouteSpine.tsx`, `BldrDiscoveryPanel.tsx`
  - `src/site00/config/bldr-classification.ts` (immersive portal copy, rail activeDots, headline split)
  - `src/site00/config/bldr-entry.ts` (enterprise image slot)
  - `src/site00/styles/site00-bldr-classification-mobile.css` (immersive hero, rail dots, portals, spine, discovery panel)

- **Conventions:** Immersive BLDR classification lives under `components/bldr/classification/`; reference image drives composition; repository assets + routes win over mockup hallucinations. Enterprise portal renders asset-slot fallback until env PNG is approved.

---

## 2026-08-20 — EVOLVE mobile hub experience V2 (reference-locked)

Summary of the **whole conversation so far** in this cloud agent run (SITE 00 mobile sprints).

- **Context:** Founder attached approved mobile Evolve reference (hero, diagnostic strip, path cards, process sequence, systems matrix, case studies, FAQ, final CTA). Sprint upgrades mobile `/evolve` hub to match enhanced IDNTY/BLDR operating environment — without redesigning desktop or breaking routing.

- **Topics covered (cumulative):** BLDR immersive selection route (PR #149); this turn = EVOLVE hub mobile V2.

- **Decisions / outcomes:**
  - `/evolve` mobile now uses `EvolveHubMobileExperience`; desktop hub unchanged behind `useSite00DesktopArtboardPreview()`.
  - `/evolve/state` mobile (`EvolveMobileExperience` from PR #146) preserved — path selection + assessment flow untouched.
  - Hub path cards: ENTER PATH → `selectEvolvePath` + `resolveEvolveAssessmentDestination` (same as state page).
  - START EVOLVE → `/evolve/state` (existing).
  - Systems matrix: 5 modules with concise lists + EXPLORE progressive disclosure revealing capability-registry descriptions.
  - Section index: compact scrollable nav with intersection-based active state; all anchor IDs preserved.
  - Reuses existing Evolve artwork: `EvolveHeroArtwork`, `evolve-master.svg`, refine/install/transform SVG icons.

- **Changes:**
  - `src/site00/components/evolve/hub-mobile/*` (11 components)
  - `src/site00/config/evolve-hub-mobile.ts`
  - `src/site00/styles/site00-evolve-hub-mobile.css`
  - `src/site00/pages/evolve/EvolveHubPage.tsx` (desktop/mobile split)
  - `src/routes/Site00Routes.tsx` (CSS import)

- **Conventions:** Evolve hub mobile under `components/evolve/hub-mobile/`; path cards use horizontal scroll-snap on phone widths; LOCATIONS bottom-nav active state unchanged for `/evolve*`.

---

## 2026-08-20 — EVOLVE mobile path selection visual system V2

Summary of the **whole conversation so far** in this cloud agent run (SITE 00 mobile sprints).

- **Context:** Founder attached approved Evolve Path Selection reference (configuration environment). Sprint upgrades entire mobile Evolve route family: `/evolve/state` selection + assessment entry — without regressing hub V2 (PR #150), IDNTY, BLDR, or desktop.

- **Topics covered (cumulative):** BLDR immersive selection (PR #149); EVOLVE hub V2 (PR #150); this turn = EVOLVE path selection / configuration environment on `/evolve/state` + mobile assessment shell.

- **Decisions / outcomes:**
  - `/evolve/state` mobile rebuilt as configuration console: PATH SELECTION hero, shared diagnostic rail, intensity rail with active nodes, compact 3-column path cards with SELECTED protocol state, PATH LOCKED output panel (dynamic metadata per path), horizontal operating process, path-specific scope capsules, contextual handoff CTA.
  - Shared `EvolveDiagnosticStrip` in `components/evolve/shared/`; diagnostic stages centralized in `evolve-diagnostic.ts`.
  - Path config: `EVOLVE_PATH_SELECTION_CARDS`, `EVOLVE_PATH_LOCKED_META`, `EVOLVE_PATH_SCOPE`, `EVOLVE_OPERATING_PROCESS_COPY`.
  - Mobile assessment (`EvolveAssessmentShell`) uses white Evolve environment (not IDNTY photo bg); path breadcrumbs `EVOLVE / REFINE|INSTALL|TRANSFORM`; declarations updated per reference.
  - Routing preserved: path select → PATH LOCKED → `BEGIN PROPERTY ASSESSMENT →` → `/evolve/{path}/property`.

- **Changes:**
  - `src/site00/components/evolve/mobile/*` (hero, cards, locked panel, process, scope, closing)
  - `src/site00/components/evolve/shared/EvolveDiagnosticStrip.tsx`
  - `src/site00/config/evolve-diagnostic.ts`, `evolve-assessment.ts` (presentation copy)
  - `src/site00/components/evolve-assessment/EvolveAssessmentShell.tsx`
  - `src/site00/styles/site00-evolve-mobile.css`, `site00-evolve-assessment-mobile.css`

- **Conventions:** Evolve selection = configuration environment; hub = control center. One shared visual system renders three intervention protocols via config-driven components.

---

## 2026-08-20 — Signed-in IDNTY Control Center enhancement

Summary of this cloud agent run (SITE 00 mobile sprint).

- **Context:** Founder attached approved signed-in IDNTY / Control Center reference. Sprint upgrades `/idnty` signed-in profile from generic HubActionCard stack to identity control center — without changing auth, routes, or account logic.

- **Decisions / outcomes:**
  - Signed-in `/idnty` uses `IdntyControlCenterExperience`: hero (IDNTY / CONTROL CENTER), credential module, system status rail, three grouped control modules (ACCESS CONTROL, IDENTITY & PREFERENCES, ACCOUNT PROTOCOLS).
  - Compact numbered `AccountControlRow` links preserve existing hrefs from `SITE00_IDNTY_HUB_MODULES` seed.
  - `EcosystemShell` gains `hidePageHeader` for custom signed-in hero; signed-out gateway unchanged.
  - Metadata from `useIdntyControlCenterMeta`: real display name, initials, masked account ref (from Supabase id), member since (createdAt). No fake VERIFIED/MFA/API counts. Security descriptor omits MFA (not available). Sessions row shows "1 ACTIVE SESSION" (matches sign-in security copy).

- **Changes:**
  - `src/site00/components/idnty/control-center/*`
  - `src/site00/config/idnty-control-center.ts`
  - `src/site00/hooks/useIdntyControlCenterMeta.ts`
  - `src/site00/styles/site00-idnty-control-center.css`
  - `src/site00/pages/idnty/IdntyHubPage.tsx`, `EcosystemShell.tsx`

- **Conventions:** Signed-in IDNTY = operational control center; config-driven row groups; technical icon frames reuse existing `Site00HubIcons`.

---

## 2026-08-20 — CTRL ROOM mobile command center enhancement

Summary of this cloud agent run (SITE 00 mobile sprint).

- **Context:** Founder attached approved CTRL ROOM / Command Center reference. Sprint upgrades mobile `/control` overview to operational command center aligned with IDNTY/BLDR/EVOLVE visual system.

- **Root cause fix:** `JSON PARSE ERROR: UNRECOGNIZED TOKEN '<'` — client called missing `/api/site00/client-production` route; HTML error page was parsed as JSON. Fixed by adding authenticated API route + hardened `clientProductionApi` JSON parsing (content-type check, safe errors).

- **Decisions / outcomes:**
  - Mobile `/control` uses `CtrlRoomMobileExperience`: hero, operator credential, operating status telemetry, command overview 2×2, property network, action queue + activity stream, closing module.
  - Desktop layout preserved behind `@media (min-width: 1024px)` wrapper; shared `useCtrlRoomData` hook (single API fetch).
  - Real data: properties/projects/domains counts from `getClientCtrlRoomPayload`; activity from local storage; signals from production API; no fake billing dates or screenshot values.
  - Reused: `EcosystemShell hidePageHeader`, `Site00ThreeCornerMark`, account meta helpers in `site00AccountMeta.ts`, hex CTRL ROOM artwork from nav icon geometry.

- **Changes:**
  - `api/site00/client-production.ts`, `getClientCtrlRoomPayload` in service.ts
  - `src/site00/components/ctrl-room/mobile/*`, `useCtrlRoomData.ts`, `clientProductionApi.ts`
  - `src/site00/styles/site00-ctrl-room-mobile.css`, `ControlOverviewPage.tsx`, `CtrlRoomSignalsPanel.tsx`

- **Conventions:** CTRL ROOM = cross-system operating view; mobile/desktop split via CSS; API errors show STATUS TEMPORARILY UNAVAILABLE, never raw parse errors.

---

## 2026-08-20 — Mobile viewport centering audit (all mobile pages)

Summary of this cloud agent run (SITE 00 mobile layout fix).

- **Context:** Founder reported mobile pages content shifted left with right-side panels clipped (screenshots: `/idnty/state` identity diagnostic 2-col state grid + investment 2×2 grid). Request: audit all mobile pages and fix centering/overflow.

- **Root cause:** `.site00-mobile-shell` lacked the universal `box-sizing: border-box` contract that `.site00-shell` has — grid children with padding/borders exceeded 100% width and were clipped by `overflow-x: hidden`. Mobile shell `__main` also had zero horizontal padding (locations.css legacy), while some pages doubled padding inconsistently; IDNTY investment section defaulted to 4-column grid until 430px breakpoint.

- **Decisions / outcomes:**
  - New global contract: `site00-mobile-shell.css` loaded last — `box-sizing: border-box` on entire mobile shell subtree, symmetric `padding-inline: clamp(16px, 5vw, 20px)` on `__main`, `min-width: 0` on grid children.
  - IDNTY diagnostic investment rail/cards default to 2 columns on mobile (not 4-col scroll).
  - Removed duplicate horizontal padding from ecosystem, ctrl-room, public-mobile, idnty-assessment, bldr-intake inner wrappers (shell gutter is canonical).
  - Fixed BLDR hub asymmetric stage padding (`40px` left-only → symmetric `16px`).
  - Visual QA at 390×844: `/idnty/state`, `/evolve/state`, `/bldr/state`, `/control` — symmetric margins, no right clipping, no horizontal scroll.

- **Changes:**
  - `src/site00/styles/site00-mobile-shell.css` (new)
  - `src/routes/Site00Routes.tsx` (import)
  - `site00-idnty-diagnostic-mobile.css`, `site00.css`, `site00-ecosystem.css`, `site00-ctrl-room.css`, `site00-pages.css`, `site00-idnty-assessment.css`, `site00-idnty-state-v2.css`, `site00-bldr-intake-mobile.css`, `site00-bldr-hub-mobile.css`, `site00-locations.css`

- **Conventions:** Mobile shell horizontal gutter is owned by `.site00-mobile-shell__main`; page inner wrappers should not add duplicate horizontal padding. All mobile grids need `minmax(0, 1fr)` + `min-width: 0` on children.

---

## 2026-08-20 — BLDR Enterprise panel background artwork

Summary of this cloud agent run (SITE 00 asset update).

- **Context:** Founder provided approved Supabase PACK artwork URL for the Enterprise panel on BLDR Build Classification mobile page (`/bldr/state`). Panel previously showed placeholder gradient with "ENTERPRISE ENVIRONMENT" watermark (`SITE00_BLDR_ENTRY_ENTERPRISE_IMAGE` was `null`).

- **Decision / outcome:** Set `SITE00_BLDR_ENTRY_ENTERPRISE_IMAGE` to `PACK/D288C717-C092-4D37-95C7-D745A7E7B68A.png` in `bldr-entry.ts`. Resolved at runtime via `resolveSite00PublicAsset` → `BldrPortal` renders `<img>` background like Site and World portals.

- **Changes:** `src/site00/config/bldr-entry.ts`

- **Conventions:** BLDR entry/classification portal images live in `bldr-entry.ts`; PACK assets use `PACK/{uuid}.png` path prefix.

---

## 2026-08-20 — Identity Calibration mobile onboarding system

Summary of this cloud agent run (SITE 00 Identity selection sprint).

- **Context:** Founder attached approved visual reference for Identity "Starting at Zero" calibration experience. Sprint: replace conventional form UI across entire Identity onboarding with SITE 00 calibration instrument — progress rail, numbered target rows, capture status, architectural CONTINUE control — while preserving all routing, state, and business logic.

- **Decisions / outcomes:**
  - New `calibration` mobile layout on `IdntyAssessmentShell`: keeps architectural photo environment, translucent console, no process strip/footer on steps.
  - Shared components in `components/idnty/calibration/`: console, progress rail, option rows with crosshair targets, capture status, navigation, step/review/complete mobile experiences.
  - Config helpers in `idnty-calibration.ts` for step category labels and dynamic capture metadata.
  - Mobile step/review/complete pages wired to calibration; desktop unchanged.
  - Removed "YOUR IDENTITY. OUR PROCESS." from mobile landing V2 and page footer from calibration steps.
  - Removed blue iOS-default styling from legacy option rows (explicit black/red/gray palette).

- **Changes:**
  - New: `idnty-calibration.ts`, `site00-idnty-calibration-mobile.css`, 10 calibration components
  - Updated: `IdntyAssessmentShell`, `IdntyAssessmentStepPage`, `IdntyAssessmentReviewPage`, `IdntyAssessmentCompletePage`, `IdentityStateLandingV2`, `IdntyAssessmentLandingPage`, `Site00Routes.tsx`, `site00-idnty-assessment.css`

- **Conventions:** Identity mobile questionnaire steps use `mobileLayout="calibration"`; landing intake remains V2 white shell; process strip component kept for desktop only.

---

## 2026-08-20 — Post-payment Studio Production OS (client operating environment)

Summary of this cloud agent run (SITE 00 Composer implementation sprint).

- **Context:** Founder attached approved STUDIO ACTIVE PROJECT mobile reference. Sprint: build authenticated post-payment Studio operating environment — production spine, current state, client input, project signal, YOU/STUDIO operations, milestones, activity, next review — as real data-driven UI (not static mockup). Preserve CTRL ROOM, PROJECTS, IDNTY, Asset Vault, global nav.

- **Decisions / outcomes:**
  - Client Studio API: `/api/site00/client-production` registered in `server/routes.ts` + Vite local API plugin. Actions: `studio`, `projects`, `provisioning`, `ctrl-room`, POST `activate-project` (idempotent), POST `connect-service` (authorized).
  - Backend: `clientStudio.ts` — `getClientStudioPayload`, `getClientProjectsPayload`, `activateClientProject`, project access via `client_email` / `client_user_id`. Production spine configurable by `build_class` (SITE, IDENTITY, EVOLVE). Progress/signals from deliverables + readiness graph; no fake percentages.
  - Routes: `/studio/:projectSlug` + sub-routes (`input`, `operations`, `blueprint`, `assets`, `reviews`, `reviews/:reviewId`, `milestones`, `activity`).
  - UI: `components/studio/*` (ProductionSpine, header, panels, loading/error/empty states), `site00-studio.css` mobile-first + desktop grid.
  - PROJECTS page wired to real API projects list → links to Studio. CTRL ROOM signals remap to client Studio/provisioning routes. Provisioning page adds ENTER STUDIO link.
  - Review detail foundation: A/B/C direction buttons, approve/revision placeholders (disabled until deliverables ready).

- **Changes:**
  - API: `api/_lib/site00Production/clientStudio.ts`, `api/site00/client-production.ts`, `service.ts` (client signal routes)
  - Frontend: `pages/studio/*`, `components/studio/*`, `hooks/useStudioData.ts`, `hooks/useClientProjects.ts`, `clientProductionApi.ts`, `routes.ts`, `Site00Routes.tsx`, `ProjectsPage.tsx`, `ProjectProvisioningPage.tsx`
  - Styles: `site00-studio.css`

- **Deferred:** Full client approval POST handlers; Asset Vault deep integration beyond link; Stripe webhook (use `activate-project` when payment lands); dedicated milestone table (derived from activity events for now); ASSTS ↔ production deliverable linkage.

- **Conventions:** Studio entered via active project (not 6th global nav item). Studio = project-level production command; CTRL ROOM = account-level. Empty states use honest copy, never hard-coded Frontal Slayer or fake timestamps.

---

## 2026-08-20 — 00 / CONTROL admin operating environment (full sprint)

Summary of this cloud agent run (SITE 00 Composer implementation sprint — internal operator OS).

- **Context:** Founder attached approved desktop + mobile 00 / CONTROL design references. Sprint: build complete internal administrator operating environment — COMMAND dashboard, operator shell, Priority Queue, Production Matrix, Mission Control, section pages — propagating SITE 00 operator design system across all admin destinations. Real data only; preserve admin auth; reuse existing production schema (no duplicate models).

- **Topics covered:** Product model (SITE 00 / PROJECTS / STUDIO / CTRL ROOM / 00 / CONTROL); visual rules (dense, instrumented, red/black/white); audit of existing admin routes and data; authorization; global operator shell; desktop COMMAND + mobile COMMAND; Priority Queue; Production Matrix; Projects/Production/Reviews/Clients/Systems/Business/Reports/Settings pages; Project Mission Control; View as Client; Command Palette hint; activity ledger; system health (honest UNKNOWN where not measurable).

- **Decisions / outcomes:**
  - Backend: `controlCommand.ts` — `getControlCommandPayload(operatorEmail)` aggregates metrics, priority queue (blockers, approvals, reviews, milestones), production matrix (7 stages), activity, upcoming reviews, launch queue, system health from existing `site00_projects`, deliverables, blockers, approvals, activity tables.
  - API: `site00-production.ts` action `command` → payload for authenticated admin.
  - Frontend shell: `Site00AdminShell` rewritten as 00/CONTROL operator shell (sidebar desktop, mobile menu, operator profile); `CONTROL_OPERATOR_NAV` maps to existing admin routes; `site00-control.css` design system.
  - COMMAND page: `DashboardPage` — `ControlCommandDesktop` + `ControlCommandMobile` + shared components (metric rail, priority queue, production matrix, activity, system health, reviews/launch panels).
  - Section pages updated with `ControlPageHeader`: Projects, Production (Studio), Reviews (Approvals), Clients (Identities), Systems (Sites), Business (Finance), Reports, Settings, Activity, Team, Leads, Discovery, Placeholder (Automation).
  - Mission Control: `ProjectWorkspacePage` — operator header, VIEW AS CLIENT (Studio new tab), next actions, studio summary; removed hardcoded production spine.
  - Authorization: unchanged `AdminGuard`; no client access to `/admin/site00/*`.

- **Changes:**
  - API: `api/_lib/site00Production/controlCommand.ts`, `api/admin/site00-production.ts`
  - Admin UI: `components/control/*`, `hooks/useControlCommand.ts`, `types/control.ts`, `config/control-nav.ts`, `styles/site00-control.css`
  - Pages: `DashboardPage`, `ProjectsPage`, `StudioPage`, `ApprovalsPage`, `ProjectWorkspacePage`, operations pages (Identities, Finance, Reports, Settings, Sites, Activity, Team, Leads, Discovery), `PlaceholderSectionPage`
  - Shell: `Site00AdminShell`, `Site00AdminHeader`; routes import control CSS
  - Docs: `motherboard/CORE.md` (00/CONTROL product layer)

- **Deferred:** Internal review POST actions (approve for client, request revision); realtime subscriptions; stage advance/pause/resume controls; alerts dropdown panel; Command Palette intent shortcuts beyond existing `AdminSearchModal`; Asset Vault admin deep integration (nav links to `/assts`); mobile SITE 00 bottom nav inside admin (admin uses mobile operator menu); dedicated automation job table UI (placeholder page); production spine in Mission Control from pipeline API (StudioPipelineBar needs pipeline data).

- **Conventions:** 00 / CONTROL = `/admin/site00/*`. Reference mock names (NIA, Frontal Slayer, etc.) never in production UI. System health reports UNKNOWN when not measurable. Mobile admin prioritizes intervention (priority queue, production spine) over desktop matrix tables.

---

## 2026-08-20 — SITE 00 Email System + debug template gallery

Summary of this cloud agent run (Email System + Debug Template Gallery sprint).

- **Context:** Founder attached approved SITE 00 Email System design reference sheet. Sprint: build complete transactional + lifecycle email design family (variety + family resemblance), 80-template inventory mapped to 12 visual archetypes, private debug gallery for individual template review before production sends. No auto-send from debug route; mock data debug-only.

- **Topics covered:** Email families (Access, Identity, Project, Studio, Review, Milestone, Launch, Signal); table-safe HTML with inline styles; archetype system; central template registry; event registry; debug gallery with filters/index; mobile/desktop + light/dark preview; text fallback; sendEmail integration with idempotency stub; auth email limitations (Supabase).

- **Decisions / outcomes:**
  - Shared module `shared/site00-email/`: tokens (#EB1C24), primitives (shell, header, credential card, data grid, CTA, footer), 12 archetypes (access-credential, project-record, studio-portal, action-required, review-dossier, milestone-artifact, etc.), `renderEmailTemplate()` used by both preview and send path.
  - Registry: 80 templates (01–80) with metadata (family, event, subject, preheader, CTA, classification, debugStatus, enabled flags).
  - Debug routes: `/admin/site00/debug/email-pack` (gallery + master index) and `/admin/site00/debug/email-pack/:templateId` (metadata, copy, text fallback, viewport/inbox controls). Approval state in localStorage.
  - sendEmail.ts: renders real HTML from registry; skips send when no EMAIL_PROVIDER; idempotency via sendLog stub; legacy `welcome` maps to access-credential-issued.
  - Event registry documents wired vs unwired triggers; most lifecycle events marked unwired until Stripe/webhooks/state transitions exist.

- **Changes:**
  - `shared/site00-email/*`, `api/_lib/email/sendEmail.ts`
  - Admin UI: `EmailPackGalleryPage`, `EmailTemplateDetailPage`, `site00-email-debug.css`, routes, Settings link
  - Config: tsconfig + vite alias `@site00-email`, motherboard CORE

- **Deferred:** EMAIL_PROVIDER integration (Resend/SendGrid/Postmark); Supabase Auth custom templates; wiring PAYMENT_CONFIRMED, REVIEW_READY, etc. to state events; DB-backed send log; test-send button; raster hero artwork from reference sheet (using SVG data-uri placeholders for now).

- **Conventions:** Preview fixtures in `fixtures/previewData.ts` only. Debug gallery never sends. Transactional vs marketing classifications separate. Auth provider emails may differ from gallery templates.

---

## 2026-08-20 — Email pack visual fidelity correction sprint (reference-locked rebuild)

Summary of the **whole conversation so far** in this cloud agent run (repo: `yoteenz/SITE00`).

- **Context:** Founder rejected generic transactional email implementation; attached approved Email Pack Design Reference Sheet. Required reference-faithful compositions, approved copy, real QR on welcome/access, controlled variety across 12 reference archetypes, enhanced debug design review system. Prior sprint (PR #159) added 80-template registry + debug gallery; PR #160 fixed routing to `/admin/site00/debug/email-pack`.

- **Topics covered (cumulative):** 00/CONTROL admin (PR #158); email system + debug pack (PR #159); email pack routing fix (PR #160); **this sprint:** rebuild rendering layer to match reference sheet—not one generic black shell.

- **Decisions / outcomes:**
  - Replaced generic `primitives.ts` archetype renderer with **reference-locked compositions** in `shared/site00-email/design/compositions.ts` (12 compositions).
  - **Real QR codes** via `qrcode` for `access-credential-issued` and `sign-in-link`; async `renderEmailTemplate()`.
  - **Studio Access Granted** rebuilt: portal doorframe, ceremonial transition copy, STUDIO ACTIVE status card.
  - Debug gallery enhanced: family summary counts, REFERENCE TARGET panel, IMPLEMENTATION vs REFERENCE BRIEF toggle, review state controls.
  - Production send path: `sendEmailAsync` → `renderEmailTemplate()` from registry; provider stub until `EMAIL_PROVIDER`.

- **Changes:** `shared/site00-email/design/*`, `qr.ts`, `archetypes.ts`, `render.ts`, debug admin pages, `sendEmail.ts`.

- **Deferred:** Hosted raster hero artwork; full copy audit for all 80 templates; EMAIL_PROVIDER live send; test-send button.

- **Conventions:** Reference sheet = visual source of truth. Debug at `/admin/site00/debug/email-pack`. Short URLs redirect to admin route.

---

## 2026-08-20 — EVOLVE / Marketing & Content (full sprint)

Summary of the **whole conversation so far** in this cloud agent run (repo: `yoteenz/SITE00`).

- **Context:** Founder sprint spec to expand EVOLVE with **Marketing & Content** as a first-class capability — full client journey (discover → intake → scope → authorize/pay → provision → studio workspace → review → deliverables → repeat). Studio World is **external** (not in this repo); integrate only via documented contract or mock adapter. Prior work in same session: tunnel restart for preview.

- **Topics covered:** Contract discovery (none found); EVOLVE selection enhancement; marketing landing/services/intake/brief/engagement pages; service taxonomy (7 categories); progressive intake; identity reuse + brand-setup-required path; scope architecture without invented pricing; payment gate reuse; server-side StudioWorldClient + mock adapter; idempotent provisioning; client-safe production phases; admin list/detail; debug route index; email event definitions (unwired); documentation.

- **Decisions / outcomes:**
  - **Integration status:** `MOCKED` / `BLOCKED_PENDING_CONTRACT` — no `STUDIO_WORLD_EXTERNAL_INTEGRATION_CONTRACT.md` in repo; mock adapter default (`STUDIO_WORLD_ADAPTER=mock`).
  - **DB:** migration `20260820140000_site00_marketing_engagements.sql` — engagements, events, external_production_links.
  - **Adapter:** `api/_lib/studioWorld/{adapter,mockAdapter,client,types}.ts` — centralized server-side; credentials never in browser.
  - **Payment:** Reuses `payment_state` pattern; provisioning gated on `CONFIRMED`; no Stripe checkout UI yet — server confirm chain on brief page.
  - **EVOLVE UI:** `MarketingCapabilityCard` on desktop (`EvolveStatePage`) and mobile (`EvolveMobileExperience`); preserves existing REFINE/INSTALL/TRANSFORM.
  - **Email:** 7 marketing lifecycle events added to registry (`wired: false`).

- **Changes:**
  - New: `shared/site00-marketing/`, `api/_lib/marketingEngagements/`, `api/site00/marketing-engagements.ts`, `api/admin/site00-marketing.ts`, `src/site00/pages/evolve/marketing/*`, admin marketing pages, `EvolveMarketingDebugPage`, `site00-marketing.css`, `docs/SITE_00_EVOLVE_MARKETING.md`
  - Modified: routes (client + admin), evolve config, email events, local/server API routes

- **Deferred:** Live Studio World connection; Stripe checkout; full Vault handoff ingestion; subscription billing; automated marketing tests; apply migration to remote Supabase.

- **Conventions:** Do not import Studio World code or duplicate production logic. Phase-based client progress (not fake percentages). Mock adapter must not run silently in production — env explicit.

---

## 2026-08-20 — Email pack visual fidelity + art-direction system

Summary of the **whole conversation so far** in this cloud agent run (repo: `yoteenz/SITE00`).

- **Context:** Founder correction sprint — current email pack infrastructure exists but visual fidelity was NOT approved. Approved design reference sheet is canonical; current implementation screenshots were negative references. Do not rebuild email system from scratch; preserve triggers/debug/delivery infrastructure.

- **Topics covered:** Art-direction system architecture; SIGN-IN LINK calibration template; composition contracts; family grammar; debug gallery COMPARE mode; typography alignment with Martian Mono; QR rebalancing; template-specific text fallback; family-varied status-notice compositions.

- **Decisions / outcomes:**
  - New `shared/site00-email/art-direction/` — `primitives.ts`, `families.ts`, `contracts.ts`, `reference-render.ts` (reference targets for COMPARE mode).
  - **SIGN-IN LINK / access-credential** rebuilt: asymmetric credential artifact (slab + compact strip), 72px QR, no serif "Welcome to", Martian Mono, dark field, access glyph — not generic white membership card.
  - Email tokens updated: Martian Mono font stack, `qrDisplaySize: 72`.
  - Debug gallery: visual-family filters (ACCESS/ONBOARDING/PRODUCTION/etc.), fidelity status, async thumbnails with real QR, COMPARE mode (reference + implementation side-by-side).
  - Text fallback: access templates exclude production-stage `bodyLines`/`inputItems`; template-aware `renderEmailText`.
  - Status-notice compositions vary by family (billing ledger, access verify/reset dark glyph, identity progress rail).

- **Changes:**
  - New: `shared/site00-email/art-direction/*`
  - Modified: `design/compositions.ts`, `design/tokens.ts`, `render.ts`, `fixtures/previewData.ts`, `qr.ts`, `registry/templates.ts`, `EmailPackGalleryPage.tsx`, `EmailTemplateDetailPage.tsx`, `site00-email-debug.css`, `motherboard/CORE.md`

- **Visual QA:** SIGN-IN LINK PASS at 375px and 640px (static HTML inspection); QR 72×72 confirmed scannable structure; no serif; no production-phase copy in text fallback.

- **Deferred:** Raster reference sheet assets in repo (COMPARE uses rendered reference-target HTML); full screenshot regression test suite; wiring `MAGIC_LINK_REQUESTED` to Supabase custom auth template.

- **Conventions:** Primitives ≠ universal EmailShell layout. Each family has composition grammar. Reference sheet controls visual hierarchy — textual REF metadata is supplementary only.

---

## 2026-08-20 — Studio World live bridge sprint (FINAL BRIDGE)

Summary of the **whole conversation so far** in this cloud agent run (repo: `yoteenz/SITE00`).

- **Context:** Founder FINAL BRIDGE sprint — replace mock Studio World adapter with live implementation using external integration contract; validate full flow payment → provision → status → review → approval → deliverables → Vault → completion. Keep mock for dev/testing only.

- **Topics covered:** Contract formalization (`docs/STUDIO_WORLD_EXTERNAL_INTEGRATION_CONTRACT.md`); live HTTP adapter; webhook handler; vault deliverable links; adapter mode resolution (mock dev / live production); tests.

- **Decisions / outcomes:**
  - **Integration status:** `LIVE` when `STUDIO_WORLD_API_BASE` + `STUDIO_WORLD_API_KEY` configured; `MOCKED` when `STUDIO_WORLD_ADAPTER=mock`; production throws if live misconfigured.
  - **Live adapter:** `LiveStudioWorldAdapter` — REST client with idempotency, retries, error translation.
  - **Webhook:** `POST /api/site00/studio-world-webhook` with HMAC signature verification.
  - **Vault handoff:** `site00_marketing_deliverable_links` table stores approved deliverable references (no duplicate media ingestion).
  - **Tests:** 6 new adapter tests (17 total passing).

- **Changes:**
  - New: `docs/STUDIO_WORLD_EXTERNAL_INTEGRATION_CONTRACT.md`, `api/_lib/studioWorld/{contract,httpClient,liveAdapter,liveAdapter.test}.ts`, `api/_lib/marketingEngagements/{vaultHandoff,webhookHandler}.ts`, `api/site00/studio-world-webhook.ts`, migration `20260820160000_site00_marketing_deliverable_links.sql`
  - Modified: `client.ts`, `types.ts`, `service.ts`, routes, engagement UI, docs, `.env.example`

- **Deferred:** Apply migrations to remote Supabase; deploy Studio World service with matching contract v1 endpoints; Stripe checkout UI.

- **Conventions:** Never silently fall back to mock in production. Mock explicit via env. All Studio World credentials server-side only.

---

## 2026-08-20 — Email pack mobile preview alignment fix

Summary of this cloud agent run (repo: `yoteenz/SITE00`).

- **Context:** Founder sprint to fix Email Pack debug preview on mobile — email canvas shifted right, left edge clipped, horizontal overflow. Preview/QA correction only; preserve art-direction work.

- **Root cause:** Flex/grid `min-width: auto` allowed iframe container to expand to email's intrinsic 640px width; centered overflow clipped left edge on narrow viewports. No proportional scaling in preview shell.

- **Fix:** New `EmailPreviewCanvas` component with ResizeObserver + `computeEmailPreviewScale()` — renders iframe at canonical width (375/640), scales down with `transform-origin: top center`, compensates wrapper height. CSS: `min-width: 0` on preview chain, compare stacks below 768px, `overflow-x: clip` on stage only.

- **Changes:** `EmailPreviewCanvas.tsx`, `emailPreviewScale.ts`, `EmailTemplateDetailPage.tsx`, `site00-email-debug.css`, unit tests.

- **Production email HTML:** NOT changed.

- **Visual QA:** Auth blocked live browser test; static analysis + scale unit tests pass.

---

## 2026-08-20 — Sprint 01: Production orchestration foundation

Summary of this cloud agent run (repo: `yoteenz/SITE00`).

- **Context:** Founder Sprint 01 — transform SITE 00 into multi-project Brand + Production Operating System foundation: intelligent launch manifests, project registry, external system abstraction, evidence/reconciliation, Canon/Reference/Template/Instance, command queue data layer, debug fixtures. SITE 00 repo only; no external repo modifications; no deploy.

- **Topics covered:** Four-layer production model; organization/brand registry (SITE 00, Frontal Slayer, AIO, Studio World as infrastructure); launch manifest with separate classification vs execution status; readiness against approved target only; deferral engine → EVOLVE; launch overrides; dependency graph; manifest builder; reconciliation (evidence ≠ completion); project ingestion architecture; debug route.

- **Decisions / outcomes:**
  - Migration `20260820180000_site00_production_orchestration.sql` — organizations, workstreams, launch manifests, requirements, dependencies, deferrals, overrides, external systems/connections, signals, evidence, reconciliation, canon/reference/template/instance, content brain, evolve roadmap, ingestions, orchestration events. Extended `site00_projects` with `organization_id`.
  - Service layer `api/_lib/site00Orchestration/` — readinessCalculator, deferralEngine, manifestBuilder, commandQueue, dependencyGraph, reconciliationService, seedFixtures (DEMO / UNRECONCILED), memoryStore for dev/tests.
  - API `GET/POST /api/admin/site00-orchestration` (admin-only).
  - Debug UI `/admin/site00/debug/orchestration` — inspect registry, manifests, readiness, command queue, evolve, external connections.
  - Docs: `docs/site00/PRODUCTION_METHODOLOGY.md`, `PROJECT_ORCHESTRATION.md`, `INTELLIGENT_LAUNCH_MANIFEST.md`, `EXISTING_PROJECT_INGESTION.md`, `EXTERNAL_SYSTEM_REGISTRY.md`, `CANON_REFERENCE_TEMPLATE_INSTANCE.md`.
  - Tests: 23 orchestration tests (20 sprint scenarios + extras); 44 total passing. Build PASS.

- **Fixtures:** SITE 00 (Full Platform Launch), Frontal Slayer (Flagship Brand Launch), AIO (Core Service Operations), Studio World (infrastructure, not client-facing). All labeled DEMO / UNRECONCILED.

- **Deferred (Sprint 02):** Live GitHub/Studio World connections; deep repo reconciliation; replace fixtures with evidence-backed state; wire approved admin dashboard to orchestration services; apply migration to remote Supabase.

- **Conventions:** Admin approval required for manifest activation, deferrals, overrides, reconciliation acceptance. Evidence never auto-completes requirements. Studio World ≠ client brand. Same physical repo can host multiple logical systems.

---

## 2026-08-20 — Sprint 02: Existing project reconciliation + real launch baselines

Summary of this cloud agent run (repo: `yoteenz/SITE00`).

- **Context:** Founder Sprint 02 — connect orchestration to real projects (SITE 00, Frontal Slayer, AIO, Studio World infrastructure); verify/apply Supabase migration; persist canonical state; GitHub evidence ingestion; deep reconciliation; provisional launch baselines. Continue from Sprint 01 PR #166. No external repo modifications, no email pack changes, no admin dashboard redesign, no deploy.

- **Supabase identity:** No dedicated SITE 00-only Supabase project exists. Verified operational target: `hyycomvcaqxxvyrfupes` ("FS Website") — same project as existing SITE 00 tables and `VITE_SUPABASE_URL`. AIO separate project: `nnnljnhtmseagotvgxxt`. Did NOT apply to unknown projects.

- **Migrations:** Applied `20260820180000_site00_production_orchestration.sql` (3 parts via MCP) + new `20260820190000_site00_reconciliation_sprint02.sql` (project_health, evidence lineage, is_provisional, master_roadmap_count, drift_events, supabase_aio system).

- **Persistence:** `supabaseStore.ts` + `storeAdapter.ts` — Supabase canonical in production; memory store only for tests (`ORCHESTRATION_USE_MEMORY=1`). `registryBootstrap.ts` seeds 4 real orgs, connections, evidence, reconciliations, provisional manifests.

- **GitHub:** Read-only client for `yoteenz/SITE00` (CONNECTED) and `yoteenz/fsbw` (CONNECTED, shared by Frontal Slayer + Studio World). AIO repo UNAVAILABLE (not in accessible repos).

- **Reconciliation:** `repositoryInventory.ts`, `reconciliationRunner.ts`, `projectHealth.ts`. Evidence retains lineage; code existence ≠ completion. Admin ACCEPT/REJECT/MODIFY via debug UI + API. AIO social_marketing DEFERRED_BY_OWNER → EVOLVE, excluded from readiness.

- **Debug UI:** Extended `/admin/site00/debug/orchestration` — project health, provisional baselines, reconciliation review, evidence sample.

- **Docs:** `EXTERNAL_PROJECT_RECONCILIATION.md`, `REPOSITORY_EVIDENCE.md`, `STUDIO_WORLD_SIGNAL_INGESTION.md`, `LAUNCH_BASELINE_ESTABLISHMENT.md`, `PROJECT_HEALTH.md`, `DRIFT_DETECTION.md`; updated `EXISTING_PROJECT_INGESTION.md`.

- **Tests:** 46 passing. Build PASS.

- **Deferred (Sprint 03):** Wire approved admin dashboard to real orchestration; dedicated SITE 00 Supabase project (optional); AIO GitHub access; full Studio World live signal normalization; automatic drift polling.

- **Conventions:** Provisional manifests labeled until admin approval. Unknown stays unknown. Studio World = infrastructure, not client brand. External repos read-only from SITE 00.

---

## 2026-08-20 — Sprint 03: Admin Control Center × Live Orchestration

Summary of this cloud agent run (repo: `yoteenz/SITE00`).

- **Context:** Founder Sprint 03 — wire existing approved SITE 00 Admin Dashboard (COMMAND at `/admin/site00`) to live production orchestration from Sprints 01–02. No dashboard redesign, no email pack changes, no deploy.

- **Backend:** `dashboardAggregator.ts` — server-side portfolio, NEEDS YOU, FOCUS NOW, command queue, connections, drift, reconciliation inbox, project detail. `orchestrationEnrichment.ts` merges orchestration into `getControlCommandPayload()`. API actions: `?action=dashboard`, `?action=project&orgSlug=`.

- **Frontend:** Extended `ControlCommandDesktop/Mobile` with orchestration panels when `data.orchestration` present. New pages: `ReconciliationInboxPage` (`/admin/site00/reconciliation`), `OrchestrationProjectPage` (`/admin/site00/orchestration/:orgSlug`). Components: PortfolioPanel, NeedsYouPanel, FocusNowPanel, OrchestrationCommandQueue, LaunchManifestPanel, ProjectSwitcher, ExternalConnectionHealthPanel. `site00OrchestrationApi.ts` service.

- **Rules preserved:** No parallel dashboard state; readiness from orchestration queries; deferred items excluded; AIO repo UNAVAILABLE shown honestly; Studio World as infrastructure; reconciliation CONFIRM/REJECT via server API with audit events.

- **Tests:** 57 passing. Build PASS.

- **Deferred:** Full admin dashboard visual polish pass; automatic drift polling; Studio World live signal normalization UI.

- **Conventions:** Debug route remains engineering-only; operator UI lives on approved COMMAND dashboard and orchestration routes.

---

## 2026-08-20 — Nine-family email system sprint (canonical reference boards 01–09)

Summary of this cloud agent run (repo: `yoteenz/SITE00`).

- **Context:** Founder sprint to replace generic SITE 00 email styling with the approved nine-family email system from canonical reference boards. Each family must have distinct visual mood/metaphor. No production email sends, no deploy, no Frontal Slayer/Studio World/AIO changes. Preserve `EmailPreviewCanvas` and existing debug preview work.

- **Nine families implemented:**
  1. `ACCESS_SECURITY` — Digital credential (dark)
  2. `WELCOME_ONBOARDING` — Location key (light/architectural)
  3. `PROJECT_PRODUCTION` — Living blueprint (light/technical)
  4. `ACTION_REVIEW` — Review card (light/editorial)
  5. `MILESTONE_CELEBRATION` — Milestone unlocked (dark/celebratory)
  6. `DELIVERY_COMPLETE` — Delivery package (light/official)
  7. `BILLING_PAYMENT` — Build receipt (light/ledger)
  8. `ALERT_BLOCKER` — Build hold tag (light/industrial)
  9. `REENGAGEMENT_HUMAN` — Occupancy notice / location remembers (light/warm)

- **Architecture:**
  - `shared/site00-email/families/registry.ts` — canonical family specs (metaphor, artifact, palette field, CTA patterns)
  - `shared/site00-email/registry/family-map.ts` — explicit mapping of all 80 templates → primary family
  - `shared/site00-email/design/families/render.ts` — nine distinct family hero compositions
  - `shared/site00-email/design/assets.ts` — email-safe SVG data-URI assets
  - `shared/site00-email/registry/trigger-map.ts` — event → template → family → CTA map
  - `shared/site00-email/archetypes.ts` — rewired to route via `getPrimaryFamily()` → `renderFamilyEmail()`
  - Extended `EmailTemplateVars`, preview fixtures, family-aware plain-text + QR (ACCESS only)

- **Debug gallery:** `/admin/site00/debug/email-pack` — 9-family filter, family index panel, COMPARE mode with reference targets per family. Detail: `/admin/site00/debug/email-pack/:templateId`. `EmailPreviewCanvas` unchanged.

- **Key routing decisions:** `sign-in-link`/`verify-email`/`password-reset` → ACCESS; `access-credential-issued` → WELCOME; `payment-failed`/`production-paused` → ALERT; marketing templates → RE-ENGAGEMENT.

- **Tests:** 20 email tests passing (16 family-map + 4 preview scale). Build PASS.

- **Known gaps:** Reference COMPARE uses rendered HTML reference targets, not attached PNG boards; per-template copy/subject pass incomplete beyond hero samples; `marketing-intake-received` in events.ts but not in template registry (flagged); legacy `design/compositions.ts` bypassed but not removed; full visual QA at 375/390/430/640 for all 80 templates deferred to founder review via debug gallery.

- **Conventions:** Reference boards outrank legacy implementation. Do not collapse families into one template. Do not wire production sends from debug. Family 02 ↔ 09 bookend (location created / location still yours) is canonical.

---

## 2026-08-20 — EVOLVE Marketing OS sprint (post-launch growth orchestration)

Summary of this cloud agent run (repo: `yoteenz/SITE00`).

- **Context:** Founder sprint to build EVOLVE as SITE 00's intelligent post-launch marketing and growth operating system — marketing profiles, channel intelligence, assessment, org-specific marketing manifests, campaigns, content calendar foundation, Studio World production bridge, approvals, performance/insights, next-best-action, COMMAND integration. No deploy, no external repo changes, no email pack redesign.

- **Database:** Migration `20260820200000_site00_evolve_marketing_os.sql` — 21 new tables (profiles, objectives, channels, assessments, manifests, campaigns, calendar, email/social items, studio production requests, approvals, plans, metrics, snapshots, insights). Reuses `site00_content_brain_entries`, `site00_evolve_roadmap_items`, `site00_external_connections`.

- **Service layer:** `api/_lib/site00Evolve/` — types, seedFixtures (SITE 00 / FS / AIO / Studio World baselines), memoryStore, assessment, manifest (org-specific: FS launch vs AIO service vs SITE 00 platform), nextBestAction, productionBridge (governance BLOCKED_BY_GOVERNANCE for product photography), contentBrain integration, commandIntegration merged into dashboardAggregator.

- **AIO social:** INSTAGRAM/TIKTOK/FACEBOOK remain `DEFERRED_BY_OWNER` — not blockers. Manifest excludes social items for AIO.

- **Admin API:** `/api/admin/site00-evolve` — overview, assessment, manifest, campaigns, production requests, approvals.

- **Admin UI:** `/admin/site00/evolve` (index), `/admin/site00/orchestration/:orgSlug/evolve` (org EVOLVE), `/admin/site00/debug/evolve` (inspector). COMMAND bar link to EVOLVE.

- **Tests:** 72 passing (21 evolve + orchestration + email regression).

- **Deferred:** Supabase store adapter (memory store used); live analytics/email provider adapters; full calendar/email/social CRUD UI; migration apply to remote Supabase.

---

## 2026-08-20 — EVOLVE Sprint 02 operator UI (marketing workspace pages)

Summary of this cloud agent run (repo: `yoteenz/SITE00`).

- **Context:** Implement EVOLVE Sprint 02 operator UI pages — operational workspace (not debug tabs or spreadsheet CRUD) for campaigns, calendar, email/social ops, production brief, plans, and cross-portfolio approvals inbox.

- **Admin routes added:** `/admin/site00/orchestration/:orgSlug/evolve/campaigns`, `.../campaigns/:campaignId`, `.../calendar`, `.../calendar/:itemId`, `.../emails`, `.../social`, `.../production/new`, `.../plans`, `/admin/site00/evolve/approvals`.

- **Frontend:** Nine pages under `src/site00/admin/pages/evolve/`; shared `EvolveOrgShell`, `EvolveOrgNav`, `evolveFormatters`; `site00-evolve-ops-*` CSS in `site00-control.css`. Upgraded `EvolveOrgPage` (operational overview) and `EvolveOverviewPage` (portfolio metrics). Extended `evolveApi.ts` + `types/evolve.ts`.

- **Backend/API:** Extended `site00-evolve` actions: `campaign`, `calendar`, `calendar_item`, `emails`, `social`, `plans`, `approvals_inbox`; enriched `campaigns` list rows. Seed fixtures for campaigns, calendar, email/social items, plans in memory store.

- **Operator rules preserved:** Email provider shown as `NOT_CONNECTED`; AIO social `DEFERRED_BY_OWNER` visible and not treated as blockers. Campaign list columns: CAMPAIGN, OBJECTIVE, STATUS, CHANNELS, TARGET DATE, NEXT MILESTONE, PRODUCTION STATE, APPROVAL STATE, BLOCKERS.

- **Tests/build:** 94 tests passing. Build PASS.

- **Deferred:** Supabase persistence adapter; live email provider connection; production send wiring.

---

## 2026-08-20 — EVOLVE Sprint 02 continuation (Supabase persistence + operator workspace completion)

Summary of this cloud agent run (repo: `yoteenz/SITE00`).

- **Context:** Complete EVOLVE Sprint 02 after partial delivery — finish remote schema, Supabase production store (fail loud, no silent memory fallback), bootstrap real org UUIDs, campaign lifecycle enforcement, audit events, method capture, and Sprint 02 test coverage. UI operator pages were merged earlier on `main` (commit `a9b6d05`).

- **Supabase:** Project `hyycomvcaqxxvyrfupes`. Completion migration `20260820210000_site00_evolve_marketing_os_completion.sql` applied — all 21 EVOLVE tables + RLS verified. Bootstrap seeds profiles/channels/objectives/campaigns/calendar/email/social/plans using real org IDs (not fixture `org-00000000-*` or invalid seed UUIDs).

- **Persistence layer:** `supabaseStore.ts`, `storeAdapter.ts`, `orgRegistry.ts` (production UUID map), `bootstrap.ts`, `campaignLifecycle.ts`. Production uses Supabase when configured; `EvolveStoreUnavailableError` (503) if schema/credentials missing — memory only for `VITEST` / `EVOLVE_USE_MEMORY=1`.

- **Service refactor:** `evolveService.ts` async + store adapter; assessment/manifest/productionBridge/commandIntegration updated. Campaign events on create/status change. Manifest→campaign lineage via `createCampaignFromManifestItem`.

- **Operator UI (from prior merge):** Campaigns, calendar, email/social ops, production brief, plans, approvals inbox; portfolio + org operational overviews.

- **Docs:** `docs/site00/STUDIO_WORLD_METHOD_CAPTURE.md` — reusable production-method observations (not productized in fsbw).

- **Tests/build:** 111 tests passing (21 evolve + 17 sprint02 + orchestration + email regression). Build PASS.

- **Deferred:** External email/analytics/social provider connections; live Studio World dispatch; deploy.

---

## 2026-08-20 — Email Pack mobile preview centering fix

- **Context:** On the Email Pack review/debug interface, the IMPLEMENTATION preview on mobile was shifted/clipped to the right — full email width not visible. Founder needed fit-to-view width scaling with horizontal centering, without redesigning email templates.

- **Root cause:** `transform: scale()` on `.site00-email-debug-preview-scaler` with `transform-origin: top center` — CSS transform does not shrink layout box; scaler remained `canonicalWidth` while slot was `scaledWidth`; asymmetric visual overflow was clipped by `overflow-x: clip` on stage, biasing preview right.

- **Fix:** Changed `transform-origin` to `top left`; added `overflow: hidden` on `.site00-email-debug-preview-slot`; improved initial scale measurement using `window.innerWidth` in `EmailPreviewCanvas`. Files: `EmailPreviewCanvas.tsx`, `site00-email-debug.css`. Scale math unchanged in `emailPreviewScale.ts`.

- **Verified:** MOBILE 375 + DESKTOP 640, LIGHT + DARK, IMPLEMENTATION mode, Access/Security + Welcome/Onboarding templates; all 9 families share same `EmailPreviewCanvas`. Build + unit tests PASS. No email design changes. No deploy.


## 2026-08-20 — Temporary preview admin bypass (email pack review)

- **Context:** Founder could not load email pack debug on `site00.fsbw-dev.com` due to auth redirect + session-restore 503 on preview dev server.
- **Change:** `AdminGuard` temporarily bypasses auth for `/admin/site00/*` on preview hosts only (`fsbw-dev`, localhost, cloudflare tunnel). Production `site00.com` remains gated.
- **Flag:** `TEMPORARY_SITE00_ADMIN_BYPASS_ON_PREVIEW` in `AdminGuard.tsx` — set `false` or remove after email pack review complete.

---

## 2026-08-20 — EVOLVE Marketing OS Sprint 03: External Intelligence + Provider Connection Architecture

Summary of the **whole conversation** for Sprint 03 (SITE 00 EVOLVE).

- **Objective:** Provider-independent external connection layer, analytics ingestion architecture, distribution/publication foundation, publishing fences, NDXbook as future controlled pilot — **no live publishing**, no fake credentials/analytics.

- **Supabase:** Migration `20260820220000_site00_evolve_external_intelligence.sql` applied to `hyycomvcaqxxvyrfupes`. Extended `site00_external_connections`; new tables: `site00_evolve_pilot_config`, `site00_connection_events`, `site00_connection_sync_runs`, `site00_marketing_metric_observations`, `site00_distribution_jobs`, `site00_external_publications`. RLS enabled on all new tables.

- **NDXbook:** Registered org `slug: ndxbook`, UUID `7681ab75-bddc-43e5-b594-79fcf8168205`, `DISTRIBUTION_PUBLISHING_PILOT`, publishing/automation/provider all DISABLED/NOT_CONNECTED. Pilot config seeded in Supabase.

- **Backend:** `api/_lib/site00Evolve/providers/` — adapter contract, registry, connection/sync/intelligence/pilot services, global + org publishing fences, COMMAND connection items. Admin API extended (`connections`, `pilot_readiness`, `sync_connection`, etc.). Production Supabase-backed; memory for tests only.

- **Admin UI:** `/admin/site00/evolve/connections` (portfolio), `/admin/site00/orchestration/:orgSlug/evolve/connections` (org + wizard), `/admin/site00/orchestration/ndxbook/evolve/pilot` (generic pilot readiness component).

- **Preserved:** AIO social DEFERRED_BY_OWNER; Studio World PRODUCTION_INFRASTRUCTURE boundary; no Email Family System changes; no external repo changes; no deploy.

- **Tests/build:** 146/146 PASS (35 new Sprint 03 + full regression). Build PASS.

- **Branch:** `cursor/evolve-sprint03-external-intelligence-84ff` → PR merge to `main`.

- **Ready for controlled publishing sprint:** Architecture yes; publishing/automation remain disabled until owner authorization.

---

## 2026-08-20 — Email Family System visual architecture correction sprint

- **Problem:** Lifecycle templates (Access Credential, Identity Path/Input/Calibration/Review/Foundation) all rendered identical Welcome/Location Key composition because `family-map` collapsed them to `WELCOME_ONBOARDING` and `composeWelcomeOnboarding` hardcoded "YOUR LOCATION EXISTS NOW." copy.

- **Root cause:** Nine-family renderer treated approved design language as one reusable template; triggers selected copy only, not composition; LIGHT/DARK in debug was inbox chrome only.

- **Fix:** Added `art-direction/template-manifest.ts` (per-template composition, visual mode, signature artifact); `design/compositions/lifecycle.ts` with 7 distinct event compositions; `archetypes.ts` routes manifest compositions before family fallback; `access-credential-issued` → ACCESS_SECURITY dark credential; new `welcome-location-assigned` (#81) retains Location Key welcome; gallery cards compact with mode/artifact metadata; COMPARE mode adds lifecycle differentiation grid on detail page.

- **Tests/build:** 156 tests PASS. Build PASS. No deploy. No emails sent.

---

## 2026-08-20 — EVOLVE Sprint 04: NDXbook pilot readiness + live connection configuration

- **Objective:** Prepare NDXbook for controlled publishing pilot without publishing, enabling fences, or inventing credentials.

- **Migration:** `20260820230000_site00_evolve_sprint04_ndxbook_pilot.sql` applied — `site00_provider_secrets`, `site00_oauth_states`, connection verification/account confirmation columns, pilot config extensions.

- **Credential security:** `ProviderSecretStore` — AES-256-GCM encrypted server-side refs; `EVOLVE_PROVIDER_SECRET_KEY` required in production; REQUIRES_SECURE_CONFIGURATION when absent.

- **OAuth:** `oauthService.ts` — CSRF state tokens org+provider bound, single-use, 15min TTL; Meta/Instagram flow when META_APP_ID/SECRET/REDIRECT_URI configured; otherwise REQUIRES_OWNER_CONFIGURATION.

- **NDXbook marketing:** Assessment/profile/channels/objectives/manifest API via `ndxbookService.ts`; provenance KNOWN/OWNER_CONFIRMED/UNKNOWN; no invented strategy.

- **Pilot control center:** Expanded 19-item checklist via `pilotReadinessSprint04.ts`; route `/admin/site00/orchestration/ndxbook/evolve/pilot`.

- **Dry run:** `dryRunService.ts` — full internal pipeline, zero provider writes; fence tests (global, org, approval, account confirmation, cross-org).

- **Fences unchanged:** EVOLVE_EXTERNAL_PUBLISHING_ENABLED=false; NDXbook publishing_status=DISABLED; automation MANUAL.

- **Tests:** 161/161 PASS (15 new Sprint 04). Build PASS. Email Family unchanged. AIO deferral preserved.

- **Status:** PARTIAL — architecture complete; live provider authorization blocked pending owner env configuration (META_* + EVOLVE_PROVIDER_SECRET_KEY).

---

## 2026-08-20 — EVOLVE Sprint 05A: NDXbook pilot activation + owner configuration

- **Objective:** Complete all prerequisites for `READY_FOR_FENCE_ENABLEMENT` without publishing, enabling fences, automation, or deploy.

- **Owner configuration checklist:** `ownerConfigService.ts` — META_APP_ID, META_APP_SECRET, META_OAUTH_REDIRECT_URI, EVOLVE_PROVIDER_SECRET_KEY show CONFIGURED/MISSING/INVALID with safe metadata only.

- **Exact OAuth callback URL:** `https://api.site00.com/api/admin/site00-evolve/oauth/callback` (canonical via `oauthConstants.ts`); `META_OAUTH_REDIRECT_URI` must match exactly.

- **Live OAuth callback:** `oauthCallbackHandler.ts` + route `api/admin/site00-evolve-oauth-callback.ts` — state validation, org+provider binding, single-use, token exchange server-side, encrypted storage, safe redirect to pilot route (no tokens in URL).

- **NDXbook assessment UI:** Production form on `/admin/site00/orchestration/ndxbook/evolve/pilot` — owner answers persisted as OWNER_CONFIRMED; bootstraps profile, objectives, channels, Content Brain (CANONICAL vs REFERENCE), manifest.

- **Account flow:** Discovery (`accountDiscoveryService.ts`), explicit multi-account selection, CONFIRM THIS ACCOUNT, capability verification (READ_PROFILE, READ_CONTENT, READ_ANALYTICS, PUBLISH_CONTENT, etc.).

- **Analytics baseline:** `analyticsBaselineService.ts` — initial sync when READ_ANALYTICS granted; truthful UNAVAILABLE otherwise.

- **First-post candidate UI:** SAVE DRAFT / SEND FOR APPROVAL / RUN DRY RUN — no PUBLISH action; fences remain DISABLED.

- **Dry run semantics:** DRY_RUN_COMPLETE when account confirmed + approved; zero provider writes; fence state in preview only.

- **Fence readiness:** `pilotActivationService.evaluateFenceEnablementReadiness()` → READY_FOR_FENCE_ENABLEMENT when all checks pass in test harness.

- **COMMAND:** `commandConnections.ts` updated — NEEDS YOU (credentials, assessment, account confirm, first post), UPCOMING (controlled publication), DEFERRED (automation, cross-posting, paid promotion).

- **Tests:** 199/199 PASS (28 new Sprint 05A). Build PASS. No deploy. No publication.

- **Production truth:** Live Meta OAuth + account confirmation still require owner env vars on API host; code path complete in memory/test mode.

---

## 2026-08-20 — ACCESS / SECURITY reference-fidelity pass (Family 01)

- **Problem:** ACCESS templates had correct dark credential routing but simplified layout vs approved Family 01 board (duplicate glyph, white ID card, tiny security labels, generic footer).

- **Fix:** New `art-direction/access-security.ts` reference composer — hero credential-left/statement-right, dark technical credential panel, four icon-led security modules, terminal frame/crosshairs/waveform, three-zone footer. Wired into lifecycle ACCESS_CREDENTIAL + family composeAccessSecurity. EmailPreviewCanvas measures iframe content height to remove false empty preview space.

- **Tests/build:** 205 tests PASS (6 new access-security fidelity). Build PASS. No deploy. No emails sent.

---

## 2026-08-20 — Family 01 ACCESS / SECURITY mobile responsive fidelity

- **Problem:** At 375px, generic `.stack` reflow from global emailDoc broke Family 01 composition — hero/credential/footer stacked into long newsletter column, oversized pass/headline, separated QR from metadata.

- **Fix:** Composition-preserving mobile CSS scoped to `.access-terminal` — 32/68 hero columns retained, sm/md responsive glyph swap, proportional headline scale (22px), credential metadata+QR two-column preserved, security strip 2×2 mobile table, compact three-zone footer columns. Removed generic `stack` classes from Family 01 markup.

- **Tests/build:** 211 tests PASS (6 new mobile fidelity). Build PASS. Desktop 640 unchanged structurally. No deploy.

---

## 2026-08-20 — Family 01 ACCESS / SECURITY final responsive proportion + density pass

- **Scope:** Final founder-QA refinement at 375px only — no redesign, no structural changes, 640px desktop locked.

- **Mobile hero:** Column split 32/68 → 28/72 so statement column gains usable width; headline stays 22px bold with slightly improved line-height (25px). Two-column hero preserved.

- **Mobile credential panel:** Reduced vertical density — cred header padding, waveform band height (24px cells via `.access-waveform-cell`), panel padding 8/10/10, metadata gaps 6px, QR zone padding tightened. Structure unchanged (metadata left, QR right, divider retained).

- **QR hierarchy:** Mobile QR 72px → 64px; MEMBER ID remains primary datum.

- **Security grid:** 2×2 layout unchanged; cell vertical padding 10px → 8px (~20% reduction) plus tighter icon/title margins.

- **Footer:** No structural changes; rises naturally from density improvements. Three-zone architecture intact.

- **Tests/build:** 214 tests PASS (3 new density assertions). Build PASS. No deploy. No other email families modified.

---

## 2026-08-20 — Family 01 ACCESS / SECURITY Sonnet 5 visual fidelity pass (640px desktop)

- **Scope:** Close remaining visual gap vs approved reference board at canonical 640px only. Mobile 375px preserved/untouched in intent — one compatibility adjustment made where a desktop change would otherwise leak into mobile.

- **Method:** Rendered current implementation to static HTML (`renderEmailTemplate`), screenshotted with headless Chromium (Playwright, installed ad hoc) at 640px, visually compared against the attached reference board, then iterated: first pass (larger access pass + sentence-case subheadline), re-rendered, re-screenshotted, confirmed improvement before stopping.

- **Hero access pass:** Enlarged from 76px→108px desktop (mobile untouched at 64px) so the "00 / ACCESS" object reads as the dominant signature artifact matching reference scale, not a small icon. Larger "ACCESS" label (6→8px desktop).

- **Hero subheadline:** Reference uses legible sentence-case body copy, not tracked micro-caps. Changed desktop subheadline style to 10px/17px sentence case (`color:#999`, no forced uppercase); template copy/content unchanged (only presentation). Added explicit mobile-media override to restore prior uppercase/tracked mobile look so mobile visual behavior is unaffected by the desktop typography change.

- **Credential panel:** Tightened header padding, reduced waveform amplitude/height for a subtler signal band, added a center crosshair divider column (`access-cred-mid`, hidden on mobile) between metadata and QR matching reference's coordinate-mark treatment, QR resized 96→88px.

- **Security strip:** Removed left border on first module per row (cleaner rail), centered icon/title vertically, tightened padding.

- **Footer/CTA/outer frame:** Standardized horizontal padding via `ACCESS_PAD_X` (32px) shared across hero/credential/CTA/security/footer for consistent terminal-document rhythm; footer column widths retuned (36/28/36), coordinate marks moved under the boxed 00; CTA padding tightened; outer frame border/inset lightly refined (2a2a2a→333, inset 16/10/20→20/12/24) for a more engineered terminal feel.

- **Validation:** 227 tests PASS (2 new fidelity assertions replacing/extending prior glyph test). Build PASS. Verified via computed-style script at 400px viewport that mobile glyph swap, 28/72 hero split, and zero horizontal overflow all still hold. `welcome-location-assigned` confirmed to contain no `access-terminal`/`access-hero-left` markup (family isolation intact).

- **Files:** `shared/site00-email/art-direction/access-security.ts`, `shared/site00-email/art-direction/access-security.test.ts`. No other families, no deploy, no emails sent.

---

## 2026-08-20 — EVOLVE NDXbook legacy intelligence import + founder canonization

- **Context:** Import recovered Studio World NDXbook intelligence from fsbw handoff into existing SITE 00 EVOLVE org (`ndxbook` / `7681ab75-bddc-43e5-b594-79fcf8168205`). Intelligence migration only — not publishing, not provider reconnection, not new org bootstrap.

- **Topics covered:** Portable handoff package (`docs/studio-world/ndxbook/NDXBOOK_SITE00_HANDOFF.{json,md}`); import state machine DISCOVERED→IMPORTED; founder-locked decisions (audience, objectives, monetization deferral, visual DNA reference-only, Page 001 topic, Instagram reconciliation IDs, legacy demo pages 019–042 archived); Content Brain provenance; Page 001 candidate; manifest lineage; COMMAND post-import focus.

- **Decisions / outcomes:** Demo metrics (12,400/100,000 readers, age 25–45) rejected; founder pipeline objective canonical; monetization DEFERRED; indigo/slate colors REFERENCE ONLY; lace-mastery MISATTRIBUTED; Instagram pageId/igBusinessId reconciliation-only; automation MANUAL; publishing DISABLED; Page 001 credit/debt topic MONEY volume NOT publication-approved; zero canonical published pages.

- **Changes:** `ndxbookLegacyImportService.ts` (import/reconcile/idempotent Content Brain); `page001CandidateService.ts`; admin actions `import_ndxbook_legacy`, `ndxbook_import_report`, `ndxbook_import_state`; NDXBOOK manifest template + lineage; `commandConnections.ts` FOCUS_NOW visual identity + post-import UPCOMING/DEFERRED; `evolveNdxbookImport.test.ts` (29 tests). No fsbw runtime coupling; no credentials imported.

- **Tests/build:** 255 tests PASS. Build PASS. PR merged to main. No deploy. No content published.

---

## 2026-08-20 — Admin dashboard preview tunnel link + CTRL ROOM admin route

- **Request:** Surface SITE 00 cloud preview tunnel URL on admin dashboard (`/admin/site00`); add permanent route from client CTRL ROOM (`/control`) to admin dash for founder/admin operators.

- **Changes:** `previewTunnel.ts` resolves URL from `SITE00_CLOUDFLARE_TUNNEL_HOSTNAME` or `/tmp/site00-cloud-preview-url.txt`; included in `ControlCommandPayload` + `PreviewTunnelPanel` on admin dashboard. Client CTRL ROOM: admin-only `00 / CONTROL →` link in desktop sidebar + mobile `CtrlRoomAdminAccess` module (gated by `canAccessAdminPages()`). Route constant `SITE00_ROUTES.adminDashboard` = `/admin/site00`.

- **Tests/build:** 258 tests PASS (3 preview tunnel resolver tests). Build PASS.

---

## 2026-08-20 — EVOLVE NDXbook Creative Direction (first real client specimen)

- **Context:** Post legacy intelligence import sprint. NDXbook needs founder-approved visual DNA via shared EVOLVE Creative Direction architecture — not NDXbook-only hack. No publishing, no Page 001 production, no provider bypass.

- **Architecture:** `api/_lib/site00Evolve/creativeDirection/` — types, intelligence brief synthesis from Content Brain, three distinct territories (INDEX SIGNAL, EDITORIAL UTILITY, KINETIC FIELD), engagement service with founder decision lifecycle (PROPOSED→APPROVED), Visual DNA contract, Page 001 readiness gate. Legacy indigo/slate has no privileged territory.

- **UI:** `/admin/site00/orchestration/ndxbook/evolve/creative-direction` — intelligence briefing, creative brief, territory tabs, comparison matrix, SVG specimens, founder decision controls. Debug: `/admin/site00/debug/evolve-creative-direction`. CSS: `site00-creative-direction.css`.

- **COMMAND:** Focus Now → Review Creative Direction territories (until visual DNA approved); then Build Page 001.

- **Tests/build:** 283 tests PASS (25 new Creative Direction tests). Build PASS. PR merged to main. No deploy.

---

## 2026-08-20 — EVOLVE Marketing 7-discipline creative intake visual fidelity sprint

- **Context:** Founder supplied seven visual reference images for EVOLVE → Marketing & Content intake experiences (Social Content, Campaign, Product Campaign, Brand Film, UGC-Style, Launch Campaign, Content System). Prior sprint fixed architectural sameness but failed founder visual review — generic forms, serif leakage, missing SITE 00 shell, undifferentiated disciplines. User explicitly required **all text uppercase**.

- **Decisions:** Preserve `CreativeIntakeEngine` + `experienceRegistry` + `MarketingIntakeRecord` / draft keys / API contracts. Split seven disciplines into unique families, artifacts, stage vocabularies, and workstation layouts. Use canonical `Site00PublicShell` (top nav + mobile bottom nav with LOCATIONS active on `/evolve/*`). Remove Georgia/serif editorial styling. Artifacts driven by captured state with PENDING/— empty marks — no fake metrics or provider state.

- **Changes:** `experienceRegistry.ts` — seven unique experiences (ATTENTION, UGC_AUTHENTICITY, FILM_SET, CAMPAIGN_CONTROL, PRODUCT_STAGING, LAUNCH_SEQUENCE, CONTENT_ENGINE) with distinct artifacts (ATTENTION_MAP, UGC_STYLE_GUIDE, FILM_TREATMENT, CAMPAIGN_CONTROL, PRODUCT_STAGE, LAUNCH_BLUEPRINT, CONTENT_SYSTEM_MAP). `CreativeIntakeShell` — stage rail, horizontal progress dots, insights panel, technical marks. `SignatureArtifacts.tsx` — live-updating discipline artifacts. `site00-creative-intake.css` — global uppercase, 4-column workstation grid, serif regression guard. `MarketingIntakePage` → `Site00PublicShell`. Debug page covers all 7 disciplines. Tests expanded to 20 intake fidelity cases (291 total). Deferred: upstream Marketing entry + service-selection redesign.

- **Tests/build:** 291 tests PASS. Build PASS. PR merged to main. No deploy.

---

## 2026-08-20 — SITE 00 Projects real data injection + project command surface

- **Context:** Founder-facing PROJECTS still showed mock/demo data via `ECOSYSTEM_PROJECTS_SEED` / `useEcosystemData` fallbacks while real Frontal Slayer, Studio World, and ndxbook intelligence existed in EVOLVE. Sprint replaces mock founder view with truthful project index + command surface.

- **Architecture:** `api/_lib/site00Projects/projectResolver.ts` aggregates canonical org references (no duplicated snapshots). `FOUNDER_PROJECTS` registry maps `frontal-slayer`, `studio-world`, `ndxbook` → EVOLVE org UUIDs via `orgRegistry`. API: `GET /api/site00/projects?action=index|detail`. Frontend: `ProjectsPage` + new `ProjectDetailPage` at `/projects/:slug`. Demo seed data remains in `site00-ecosystem-seed.ts` for other ecosystem pages only — Projects page no longer imports it.

- **NDXBOOK:** UUID `7681ab75-bddc-43e5-b594-79fcf8168205`, Creative Direction route exposed, founder decision PENDING, Visual DNA INCOMPLETE, Page 001 gated, publishing DISABLED.

- **Tests/build:** 310 tests PASS (19 new project index tests). Build PASS. PR merged to main. No deploy.

---

## 2026-08-20 — Founder dual-context access + canonical client experience sprint

- **Context:** Founder/admin must operate in two legitimate contexts: **CLIENT / PROJECT OWNER** (canonical product) and **SITE 00 ADMIN** (operator layer). Admin status must NOT bypass client experience or auto-approve governance gates. Extends Real Project Index sprint — does not rebuild Projects.

- **Access model:** `shared/site00-access/` + `api/_lib/site00Access/accessModel.ts` — semantic separation of platform role (ADMIN/STANDARD), project membership, and active experience context (CLIENT/ADMIN). Context is UX state in `sessionStorage` only (`ExperienceContextProvider`); server authorization remains email/role authoritative. Founder project index gated to admin emails via projects API.

- **Client routes:** Resolver + command items now emit canonical client paths: `/projects/:slug/evolve`, `/projects/:slug/creative-direction`, `/projects/:slug/connections`. Admin routes preserved as `adminRoute` / privileged utilities only. Shared `CreativeDirectionExperience` component powers both client page and admin page — decisions via canonical `recordFounderDecision` service (client API: `/api/site00/projects?action=creative_direction|creative_direction_decision`).

- **Context navigation:** `ExperienceContextBar` in `EcosystemShell` (VIEWING AS · PROJECT OWNER + ADMIN CONTROL CENTER →) and `Site00AdminShell` (OPEN CLIENT EXPERIENCE →). Client QA mode hides admin utilities without weakening server auth. `ProjectPrivilegedUtilities` secondary menu on project detail for founder admin.

- **NDXBOOK state unchanged:** Creative Direction PENDING, Visual DNA INCOMPLETE, Page 001 gated, publishing DISABLED. No deploy.

- **Tests/build:** 340 tests PASS (30 new dual-context tests). Build PASS. PR merged to main.

---

## 2026-08-20 — Real Project Index runtime repair (INVALID JSON on /projects)

- **Root cause:** `GET /api/site00/projects?action=index` was implemented in `api/site00/projects.ts` but **not registered** in `scripts/vite-site00-local-api.mjs` or `server/routes.ts`. fsbw-dev Vite preview returned SPA HTML for the API path → frontend `Invalid JSON response`.

- **Fix:** Registered route in both local API plugin and server routes. Hardened `site00ProjectsApi` with content-type/body classification (`evaluateProjectsApiResponse`), truthful error messages, no empty-list masquerade. API responses now `{ ok, summary, projects }` with explicit JSON content-type. Resolver per-project error boundaries + partial enrichment fallback. ProjectsPage: SOURCE label LOADING/LIVE/PARTIAL/ERROR; metrics suppressed on error (— not 0).

- **Runtime verified:** Dev server curl returns `application/json` 401 (not HTML). Resolver returns 3 founder projects in memory mode.

- **Tests/build:** 353 tests PASS (13 new runtime/contract tests). Build PASS. PR merged to main. No deploy.

---

## 2026-08-20 — NDXBOOK Creative Direction structural differentiation + territory rebuild

- **Context:** Founder QA FAILED creative differentiation — three territories were palette/copy swaps on one shared specimen system. Sprint rebuilds INDEX SIGNAL, EDITORIAL UTILITY, and KINETIC FIELD as structurally distinct creative systems while preserving PR #184 governance architecture.

- **Root cause:** Single `TerritorySpecimenCanvas` generic SVG renderer + identical `SPECIMEN_TYPES` across territories + uniform 2-column grid in `CreativeDirectionExperience`.

- **Rendering architecture:** `TerritoryRendererRegistry` → `IndexSignalTerritoryView` (catalog wall), `EditorialUtilityTerritoryView` (magazine spread), `KineticFieldTerritoryView` (motion board). Territory-native specimen sets (12 each) in `territories.ts` with `rendererKey` per territory.

- **Experience upgrades:** Compare mode with common anchors (wordmark, Page 001, typography, volume system) + territory-native specimens. STRUCTURAL DIFFERENTIATION toggle (hide labels, grayscale). HYBRIDIZE contract UI (primary/secondary territory, elements keep/remove). Debug page shows side-by-side renderer preview.

- **Governance unchanged:** Visual DNA INCOMPLETE until APPROVE, Page 001 gated, publishing DISABLED, recommendation ≠ approval, NDXBOOK UUID preserved.

- **Tests/build:** 382 tests PASS (26 structural differentiation + 3 renderer registry). Build PASS. PR merged to main. No deploy.

---

---

## 2026-08-21 — NDXBOOK Creative Direction: art-directed visual worlds + FAL asset production pass

- **Context:** Founder approved the three structurally-distinct territories (INDEX SIGNAL, EDITORIAL UTILITY, KINETIC FIELD) from the prior sprint but they were still wireframe-quality — SVG-only specimens with placeholder boxes, no real imagery, not yet "founder-reviewable creative worlds." Task: elevate each territory to real, NDXBOOK-specific, art-directed presentations using the existing FAL pipeline, while preserving locked structural differentiation and founder decision gates (never auto-approve).

- **Strategy layer (new file `api/_lib/site00Evolve/creativeDirection/visualAssetStrategy.ts`):** Per-territory `TerritoryVisualStrategy` (photographic/graphic/illustration language, texture/material, subject treatment, per-volume treatment across all 5 NDXBOOK volumes, prohibited clichés) for each territory, plus a curated `NDXBOOK_CREATIVE_ASSET_BRIEFS` set (12 briefs: Page 001 for credit score/debt payoff in each territory + additional-volume proofs across BODY/MIND/TECH/CONSUMER) and `buildGenerationPrompt()`.

- **Governed FAL pipeline (new file `assetGeneration.ts`):** Reuses existing `fal-ai/nano-banana-pro` client + Supabase storage helpers (no new provider, no hardcoded secrets — `FAL_KEY`/`SUPABASE_SERVICE_ROLE_KEY` stay server-side). Every asset persists with `approvalState: 'GENERATED'` (never auto-`APPROVED`) plus full provenance. **Security fix:** manifest never writes the Supabase domain to disk (it's a configured secret and trips the commit secret-scanner) — only `storagePath` is persisted; `loadGeneratedAssetManifest()` reconstructs the public url at load time from `storagePath` + `SITE00_ASSETS_BUCKET`. New admin action `creative_direction_generate_visual_assets` in `api/admin/site00-evolve.ts` triggers the batch pass and calls `resetCreativeDirectionMemory()`.

- **Rendering:** `TerritorySpecimen.imageAsset?: TerritorySpecimenImageAsset | null` (types.ts). `territories.ts` loads the manifest and attaches images to matching specimens by `territoryKey:specimenType`. All three renderers (`IndexSignalTerritoryView`, `EditorialUtilityTerritoryView`, `KineticFieldTerritoryView`) render real imagery via SVG `<image>` + `clipPath` + readability overlays when an asset is present, falling back to the existing SVG-only specimen otherwise — structural differentiation untouched. `SpecimenFrame` surfaces provenance (approval state, model, volume) under image-backed specimens. Per-territory CSS filters (grayscale for INDEX SIGNAL, saturate/contrast for KINETIC FIELD) keep imported photography cohesive with each territory's language.

- **Render → inspect → refine (one loop per territory, done via `ReactDOMServer` + Playwright screenshots, not the live browser):** INDEX SIGNAL (archival still-life: folded statement + red thread, index cards + brass fasteners, anatomical chart + tape measure, annotated notebook) and EDITORIAL UTILITY (commissioned-magazine still life: wallet/cash/card, notebook + calculator, phone on desk, receipt + tags) passed review as-is. KINETIC FIELD's first pass read too close to the explicitly prohibited "generic AI-startup abstract mesh / cyberpunk neon" (converging fiber-optic light rays, digital-rain numerals) — **refined**: rewrote the strategy + 3 of 4 briefs to a sculptural kinetic-numeral + backlit index-tab visual system (ties to NDXBOOK's indexable-knowledge concept instead of generic tech-mesh), regenerated via FAL (deleted old Supabase objects first since `uploadSite00AssetBuffer` uses `upsert:false`), re-verified. Added new prohibited-cliché entries to lock this in for future generations.

- **Tests/build:** 398 tests PASS (27 files, incl. new `visualAssetStrategy.test.ts` + `assetGeneration.test.ts`). `tsc --noEmit` clean. Build PASS. All 12 curated assets generated and persisted to Supabase (`live-preview` bucket, `site00/creative-direction/ndxbook/...`) + manifest (`generatedAssets/ndxbook.assets.json`, committed, url-free).

- **Also this session:** Restarted the `site00-preview-tunnel` cloudflared tunnel (it had dropped after a prior Vite restart) and confirmed the public preview tunnel + local `:5174` both return 200 before continuing the FAL work.

- **Not merged:** PR #192 (`cursor/ndxbook-cd-fal-visual-assets-1983` → `main`) pushed and marked ready for review, but **not auto-merged** — cloud-agent system instructions for this run explicitly prohibit merging PRs without explicit user instruction (overrides the shipping.mdc default-merge convention). Founder should merge from GitHub when ready.

---

## 2026-08-21 — Identity + Builder intake persistence, guest access & retrieval (infrastructure sprint)

- **Context:** Founder-specified infrastructure sprint (not a visual redesign). Identity and Builder intakes only ever persisted to `localStorage` — no server draft, no resume-by-email, no client/admin retrieval, no submission receipt, no lineage to downstream engagement/project. Explicitly out of scope: email art direction (placeholders only), deploy, real email sends, and any change to Frontal Slayer/Studio World/AIO/NDXBOOK/EVOLVE/Email Family 01.

- **Forensic audit finding:** `site00_idnty_submissions` and `site00_bldr_intakes` already existed in Supabase (created in `20260818180000_site00_admin_operations.sql`, used only by demo-seeded admin pages) — **extended these instead of creating a new parallel `site00_intakes` table**, per the "prefer extending" directive.

- **Canonical model:** Additive migrations (`20260821020947_site00_intake_persistence.sql`, `20260821021310_..._lineage_columns_v2.sql`, `20260821021755_..._identity_submitted_at.sql`) add `status`, `public_reference`, `user_id` (FK → `auth.users`), `organization_id`/`engagement_id`/`project_id` (plain uuid — no FK on `engagement_id`; the live schema has no single canonical engagements table yet, noted as a known gap), `guest_email`/`verified_email_at`, `draft_payload`/`submitted_payload` jsonb, `version`, `schema_version`, and timestamps to both tables. New `site00_intake_access_tokens` (hashed guest tokens only — raw token never persisted) and `site00_intake_events` (audit trail) tables, both polymorphic across `intake_type` (`IDENTITY`/`BUILDER`), both RLS-enabled.

- **Lifecycle:** `shared/site00-intakes/types.ts` defines `DRAFT → AWAITING_EMAIL_VERIFICATION → ACTIVE → SUBMITTED → IN_REVIEW → CONVERTED → ARCHIVED` with a server-side transition table (`canTransitionIntakeStatus`) — illegal transitions rejected server-side regardless of frontend state.

- **Server architecture (`api/_lib/site00Intakes/`):** `storeAdapter`/`memoryStore`/`supabaseStore` (same dual-backend pattern as EVOLVE's `storeAdapter.ts` — memory for tests, Supabase for dev/prod, service-role client). `tokens.ts` issues cryptographically random guest tokens, stores only the SHA-256 hash, supports expiry + rotation (old token revoked on new issuance) + replay protection. `authorization.ts` is server-authoritative: `AUTHENTICATED` (own `user_id`), `GUEST` (token scoped to exact intake id), `ANONYMOUS_DIRECT` (same-session access to a still-unowned draft via its unguessable UUID, before an email/token exists — deliberately narrower than "no auth required", documented trade-off). `intakeService.ts` orchestrates start/autosave/idempotent-submit (immutable `submitted_payload` snapshot, `submittedAt`, audit event, `INTAKE_SUBMITTED` email)/send-access/guest→account claim (verified-email-only, safe re-claim no-op, preserves original intake id)/admin actions (`MARK_IN_REVIEW`, `ARCHIVE` — conservative, never rewrites submitted data).

- **API:** `/api/site00/intakes` (action-dispatch: `start`/`get`/`update`/`submit`/`send-access`/`claim`/`list`, following the existing `marketing-engagements.ts` query-param-action convention, not new dynamic path segments), `/api/site00/intake-access` (public guest token resolution), `/api/admin/site00-intakes` (list/detail/lifecycle actions, gated by `resolveAdminAuth`). Registered in both `server/routes.ts` and `scripts/vite-site00-local-api.mjs` (the latter is easy to forget — local dev 404s otherwise, as with the earlier Real Project Index incident).

- **Email:** `INTAKE_ACCESS_REQUESTED`/`INTAKE_SUBMITTED`/`INTAKE_CLAIMED` registered in the Email Family registry with `wired: false` and `CREATIVE_DIRECTION_PENDING` notes only — new `intake` family / `intake-lifecycle` archetype so they aren't forced into an approved visual family. No real sends; `sendEmailAsync` logs a truthful "provider not configured" state, verified against real Supabase during QA. Also fixed a pre-existing wrong-relative-path bug in `api/_lib/email/sendEmail.ts` imports (not caught by `tsc` since `api/` isn't in the root tsconfig project — only surfaced at dev-server runtime).

- **Frontend:** `useIntakeSync` generic hook (debounced server autosave, submit, guest access request) wired into `useIdntyAssessment`/`useBldrAssessment` — localStorage is resilience-only now, server draft is system of record, save state is truthful (never shows SAVED for a local-only write, FAILS LOUD on server error). New minimal `IntakeSaveStatus`/`IntakeGuestAccessCapture` components. **Important:** the "desktop artboard preview" branch (`useSite00DesktopArtboardPreview()`) is NOT what real users see by default — the actual default UI for Identity is `IdentityCalibrationMobileStep`/`Complete` and for Builder is `BldrIntakeShell`'s step panel, regardless of viewport width, unless navigating the special internal preview route. Both branches needed the new components wired in separately; the desktop-only wiring was caught during runtime QA (see bug below).

- **New surfaces:** Client `/account/intakes` + detail (status/dates/project lineage/CONTINUE·VIEW·VIEW SUBMISSION, no admin fields) under the existing account guard, not folded into `/projects` (public portfolio surface). Guest `/intake/access/:token` (resume/view/claim prompt). Admin `/admin/site00/intakes` + detail (filters, search, sort, audit timeline, conservative actions) — new nav item alongside the pre-existing `BLDR INTAKE` builder-specific admin page (kept, not replaced).

- **Bug found + fixed during runtime QA:** `useIntakeSync` returned a brand-new object every render; `useIdntyAssessment`/`useBldrAssessment` callbacks depended on that whole object, so their identities changed every render too, which retriggered a `useEffect([..., startState])` in the step pages on every render → **"Maximum update depth exceeded" infinite loop** on every Identity/Builder step page. Fixed by memoizing `useIntakeSync`'s return value on its actual state deps. Root cause confirmed by direct code trace; a computer-use QA pass verified the fix (clean console before/after) — note computer-use hallucinated the exact file/line names in its first report, so always verify against `Grep`/`Read` before trusting an agent-reported stack trace verbatim.

- **Runtime QA (live dev Supabase, not mocks):** guest Identity + Builder full lifecycle (start → autosave → email capture → refresh/resume via both `ANONYMOUS_DIRECT` and token → submit → idempotent re-submit, same `version`/`submittedAt`), token rotation (old token 403s after a new one issues) + forged-token 404 + guest→admin 401 + unauthenticated→client-list 401, authenticated client start/autosave/list/detail/cross-user-denial/submit against a disposable real `auth.users` test account (created + deleted via `supabase.auth.admin`), guest→account claim (email-associated guest intake claimed by the matching authenticated user, `ownerKind` flips to `AUTHENTICATED`, `claimedAt` set, re-claim is a safe no-op), and admin data-layer list/detail/audit-timeline retrieval. Browser QA (computer-use) confirmed the render-loop fix, the mobile save-status/email-capture UI, admin Intake Inbox layout/filters, and no horizontal overflow at 375/390px.

- **Tests/build:** 453 tests PASS (43 new intake tests across shared types, tokens, authorization, intake service, and all three API handlers). `tsc --noEmit` PASS. `npm run build` PASS. PR #194 opened (not merged — left for founder review per this task's explicit no-auto-merge framing; branch `cursor/identity-builder-intake-persistence-1983`). No deploy, no real emails sent, no changes to Frontal Slayer/Studio World/AIO/NDXBOOK/EVOLVE/Email Family 01.

---

## 2026-08-21 — Intake Access email family: FAL-native visual production pilot (Builder + Identity)

- **Context:** Founder-approved concept board (Builder Intake Access + Identity Intake Access, desktop+mobile) as sole visual authority. Explicit new production doctrine: reference artwork ≠ code — every visual element classified `CODE_NATIVE` / `GENERATED_ASSET` / `EXISTING_ASSET` / `HYBRID_COMPOSITION` before any generation; produced artwork (architecture drawings, photography, paper, fingerprints, seals, collage) must never be approximated with CSS/SVG/gradients/emoji/placeholders. Pilot of a reusable methodology intended for later Studio World adoption — Studio World runtime explicitly untouched.

- **FAL audit + gate:** `FAL_KEY` present and working (`fal-ai/nano-banana-pro`, text-to-image — no reference-image input file was accessible so reference-conditioning was approximated via detailed EXACT/RECONSTRUCTION prompts instead of true image-to-image). Gate passed → proceeded with real generation (not blocked).

- **Production manifest:** `shared/site00-email/production/intake-access-manifest.ts` — full decomposition of every asset (id, family, visual role, reference region, classification, fidelity mode `EXACT_RECONSTRUCTION`, generation method, aspect ratio, background/alpha requirements, desktop/mobile usage, prompt, negative constraints, output filenames, generation result, inspection result, approval status) for B01 (Builder blueprint) and I01–I05 (Identity portrait/archival note/fingerprint/seal/evidence collage).

- **Asset generation loop:** Builder B01 (architectural blueprint) approved after prompt refinement. Identity I01 (portrait) rejected once for including a manila-folder/desk background — refined and re-approved. I03 (fingerprint) rejected twice (readable "IDENTITY" text; visible gray surface) — refined and re-approved. I02 (archival note) rejected once (photographed on a wooden tabletop) — refined and re-approved. I04 (seal) generated as a `HYBRID_COMPOSITION` (base wax seal from FAL + code-composited SITE 00 mark). I05 (evidence collage) deliberately built as a `DETERMINISTIC_COMPOSITE` via `sharp` from the four approved assets rather than a single FAL regeneration — avoids logo/text hallucination and portrait drift risk. Compositing script: `scripts/site00-email-intake-assets/composite-i05.mjs` (custom `print()` helper adds synthetic drop shadows rather than attempting alpha-cutout masking, which produced hard box edges in early attempts); positions iterated multiple times for both desktop and mobile balance. Assets uploaded to Supabase Storage (`live-preview/site00/email/intake-access/{master,derived}/…`) via `scripts/site00-email-intake-assets/upload.mjs`, which also writes the public URLs directly into a generated TS module (`shared/site00-email/production/intake-access-asset-urls.generated.ts`) so literal URLs never pass through a chat transcript. **Gotcha:** the repo's secret scanner blocks committing the literal resolved Supabase project URL (matches the configured `SUPABASE_URL`/`VITE_SUPABASE_URL` secret value) even though it's a public-bucket asset URL — fixed by adding `// pragma: allowlist secret` per the tool's own guidance, not by architecture change, since re-deriving the base URL at runtime would have reintroduced the original `import.meta.env` vs `process.env` dual-context problem this generated-file approach was created to avoid.

- **Implementation:** New `composeIntakeAccess` in `shared/site00-email/design/compositions/lifecycle.ts`, registered as a dedicated `INTAKE_ACCESS` art-direction composition (`shared/site00-email/art-direction/template-manifest.ts`) — kept fully separate from Family 01 Access/Security. Builder: black/white/red palette, vertical rail, Build Brief Record card (dynamic reference/status/last-saved/completion), B01 blueprint behind the record with a deep `-46px` overlap (its own artwork has empty space at the bottom). Identity: warm-paper/red palette, Identity File record card, I05 collage with a shallower `-14px` overlap (edge-to-edge collage would otherwise obscure the file reference). Completion is a numeric progress bar **only** when a truthful percent is supplied (`intakeCompletionPercent`, derived server-side from `currentStep`/`totalSteps` in `intakeService.ts` — `undefined` if not truthfully derivable, never fabricated); otherwise renders the status label as a non-numeric pill. Mobile has its own art-directed hero/evidence-strip crop, not a shrunk desktop image. `intake-guest-access` flipped to `enabled: true` / `debugStatus: 'approved'`. `intakeAccessEmailVars()` in `intakeService.ts` wires the canonical secure guest-resume URL (no second token system) plus the display-formatted status/timestamp/completion into `sendGuestAccess`'s email dispatch.

- **Tests/build:** 33 new tests (`shared/site00-email/design/compositions/intakeAccess.test.ts`) covering registration/event-mapping/composition-routing, Builder-vs-Identity content and asset separation, dynamic-data truthfulness (no hardcoded concept-board sample values, non-fabricated completion fallback), canonical secure-CTA usage, no leaked secrets/base64/non-HTTPS asset URLs, a11y (alt text, explicit dimensions) + image-blocked semantic fallback, table-safe/JS-free/responsive markup, production-manifest approval invariants, and Family 01 + full-registry regression. Full suite: 486/486 tests PASS. `tsc --noEmit` PASS. `npm run build` PASS. Rendered real email HTML and screenshotted at 375/390/430/640px for both templates; compared against the founder reference through 2 refinement iterations (I05 collage positioning tuning; mobile header/wordmark-wrapping fix). All 4 hosted derivative asset URLs verified reachable (200).

- **Methodology capture:** New `docs/site00/REFERENCE_TO_PRODUCTION_ASSET_PIPELINE.md` — 18-stage reference→production pipeline, 3 fidelity modes, 4 asset classifications, central rule ("approved produced artwork must not be downgraded into a code approximation"). Status: `PILOT_VALIDATED`. Explicitly not yet adopted into Studio World runtime — flagged as a `PRODUCTIZATION_CANDIDATE` for a future sprint.

- **Shipping:** Branch `cursor/intake-access-fal-visual-pilot-1983`, PR #195 opened against `main` and merged in the same session per the default shipping workflow (no merge conflicts — clean fast-forward ahead of `main`). No deploy, no real emails sent, no changes to Frontal Slayer/Studio World runtime/AIO/NDXBOOK/Family 01.

---

## 2026-08-21 — AIO Projects index integration + Intake Access rendering-medium/compositing fidelity pass

This chat covered two sequential founder sprints: (1) adding ALL IN ONE ENTERPRISES to the canonical founder Projects index, and (2) a stricter forensic fidelity/audit pass on the Intake Access email family's already-implemented FAL production pilot (above), re-auditing it against the founder-approved reference under a much more explicit rendering-medium/asset-treatment doctrine.

- **AIO Projects index integration (completed first, separate PR):** Added `all-in-one-enterprises` to the canonical founder project registry/resolver reusing the existing org UUID `3781f0b7-cbc5-470d-8af7-69b97cfa5729` (no new org, no duplicate EVOLVE profile). Preserved `SOCIAL MARKETING: DEFERRED_BY_OWNER` (never `BLOCKED`), surfaced a truthful `REPOSITORY CONNECTION UNAVAILABLE` state rather than hiding the project, and removed the founder-project slug whitelist on `ProjectEvolvePage` so privileged utilities generalize to all four founder projects. Founder index now returns 4 projects (Frontal Slayer, Studio World, ndxbook, AIO) derived dynamically, not hardcoded. 21 new tests + regression fixes; branch `cursor/aio-project-index-integration-1983`, merged to `main` (commit `fe2682a`).

- **Intake Access fidelity pass — forensic audit found the prior pilot's "APPROVED" isolation notes were not actually verified.** Direct pixel/metadata inspection (not visual approximation) found: (1) the archival note (`I02`) and fingerprint (`I03`) were flat-lay *photographs on white*, not true alpha-transparent isolation masters — each carried its own vignette that produced a visible rectangular halo once composited onto the collage's white canvas; (2) the evidence seal (`I04`) was believed to have a transparent background, but `sharp` metadata (`channels:3, hasAlpha:false`) proved the model had painted a literal opaque *checkerboard pattern* as background pixels — a known text-to-image failure mode of drawing the symbol of transparency instead of a real alpha channel; (3) once corrected, the mobile evidence strip's prior coordinates read as disconnected fragments, because the old vignettes had been (accidentally) visually bridging the gap between assets.

- **Fixes:** New `scripts/site00-email-intake-assets/remove-background.mjs` runs `fal-ai/birefnet/v2` (background-removal model, not the original text-to-image model) on all three defective assets, producing real isolation masters verified via white/black/50%-gray isolation QA (composited over each, inspected for halo/residue). `composite-i05.mjs` updated to source from the isolation masters (`fit:'inside'` to preserve the full silhouette instead of `fit:'cover'` which cropped transparent edges) and mobile coordinates retightened so the fingerprint/note/seal/portrait read as one connected evidence strip. Also added `SVG_NATIVE` header crosshair ticks (`intakeHeaderTick()`) flanking the wordmark in both Builder and Identity headers — present in the reference, missing from the prior implementation; a genuine Rule 3 (exact vector geometry) gap-fill, not a defect fix.

- **Manifest upgrade:** `shared/site00-email/production/intake-access-manifest.ts` now carries a full rendering-medium fidelity schema on every entry: `renderingMedium`/`renderingMediumReason` (one of `HTML_TEXT`/`CSS_NATIVE`/`SVG_NATIVE`/`CODE_GENERATED_GRAPHIC`/`FAL_GENERATED_ASSET`/`FAL_GENERATED_AND_ISOLATED_ASSET`/`EXISTING_CANONICAL_ASSET`/`DETERMINISTIC_COMPOSITE`/`HYBRID_COMPOSITION`), physical/geometry/dynamic-data requirement booleans, `compositingRole`, `backgroundMode`, `edgePolicy`, `shadowPolicy`, five-stage production lineage (`generationMaster`→`isolationMaster`→`compositionMaster`→`desktopDerivative`/`mobileDerivative`→`emailDerivative`), measured `compositeMapDesktop`/`compositeMapMobile` (normalized x/y/width/height/rotation/zIndex/overlap coordinates against the actual 1000x1100 desktop and 1100x620 mobile Identity canvases, and the Builder blueprint placement), full `processingHistory` (every rejection-loop iteration with reason/corrective-change/final-state — including the background-removal fixes above), `generationModel`/`processingModel`/`iterationCount`, and `deliveryStrategy`. Added a companion `INTAKE_ACCESS_RENDERING_MEDIUM_MATRIX` array covering ~19 fine-grained HTML/CSS/SVG elements (headline, CTA, progress rail, assurance icons/copy, dividers, coordinate marks, etc.) that the two `CODE_NATIVE` catch-all manifest entries only summarize at a coarse grain.

- **Methodology doc generalized (v2):** `docs/site00/REFERENCE_TO_PRODUCTION_ASSET_PIPELINE.md` gained formal doctrine sections — Rendering Medium Decision (with the Visual Physics override and Fidelity-over-technical-cleverness rules), Asset Treatment Doctrine (compositing role, background mode table, edge policy, shadow ownership, why background removal is a distinct verified operation, isolation QA), Production Lineage, Composite Mapping (relational anchors/z-order/overlap, breakpoint-specific maps, static-vs-dynamic separation), Reference-Conditioned Generation + FAL model selection, Rejection Loops, the Runtime Visual Approval Gate (the actual lesson of this sprint: tests/URL-resolution/manifest "APPROVED" notes are not evidence of correctness — open the render and check the actual alpha channel), and Brand/Text Ownership. Documented this sprint's three forensic findings as a worked lesson. Added a documentation-only Universal Production Scope section and a Motion/Video Future Extension vocabulary (start/end frame, object identity, alpha assets, camera lock, motion/transition ownership, frame-by-frame composite map) — explicitly not implemented, Studio World runtime untouched.

- **Verification:** Rendered both templates via `render-html.mjs` + Playwright screenshots (`screenshot.mjs`) at 375/390/430/640px; visually confirmed clean edges (no halo/checkerboard residue) and a connected evidence cluster on both breakpoints, no CTA wrap/overflow. ~30 new tests in `intakeAccess.test.ts` (manifest metadata validity, isolation-master URL resolution, independent desktop/mobile composite maps, no dynamic data through a rasterizing medium, seal mark stays `HYBRID_COMPOSITION`, header tick SVG presence). Full suite after merging AIO's `main` commits in: 526/526 tests PASS, `tsc --noEmit` PASS, `npm run build` PASS (two pre-existing Supabase-timeout test flakes under full-suite resource contention confirmed unrelated — pass individually).

- **Shipping:** Branch `cursor/intake-access-fal-visual-pilot-1983` (same branch as the original pilot — its first PR #195 had already merged) got new commits, merged forward with `origin/main` (clean, no conflicts), and PR #200 opened + marked ready for review. Not merged to `main` by the agent — this cloud sandbox's `ManagePullRequest` tool has no merge action and its `gh` CLI access is read-only, so merging is left for the founder via the GitHub app, consistent with the tool-level "never merge without explicit instruction" constraint. No deploy, no real emails sent, no changes to Frontal Slayer/Studio World runtime/AIO/NDXBOOK/Family 01.

---

## 2026-08-21 — Sign-in password input width alignment

- **Context:** Founder reported the password input on the sign-in page was still wider than the email input and extended beyond it; both fields should be the exact same width.

- **Root cause:** `.site00-auth-shell` lacked the `box-sizing: border-box` reset that `.site00-shell` applies elsewhere. The password field uses `width: 100%` plus `padding-right: 64px` for the SHOW toggle — under content-box sizing, that padding adds to the outer width and makes the field wider than the email input above it.

- **Fix:** In `src/site00/styles/site00-auth.css`, added `box-sizing: border-box` to the auth shell and explicit `width: 100%` / `max-width: 100%` on `.site00-signin-form__password-wrap` and `.site00-signin-form__input--password` (with `display: block`). Minimal CSS-only change; no markup changes.

- **Changes:** `src/site00/styles/site00-auth.css` only. `npm run build` PASS.

- **Conventions:** When adding padded full-width inputs inside SITE 00 auth/forms, ensure the parent shell or the inputs themselves use `box-sizing: border-box` so padding does not inflate width past sibling fields.

---

## 2026-08-21 — Sign-in magic link button feedback + OTP redirect

- **Context:** Founder reported the "Sign in with magic link" button appeared to do nothing.

- **Root cause (UX):** The handler was functional — Supabase OTP calls succeeded/failed correctly — but error/success messages rendered **above** the SIGN IN button, ~118px **above** the magic link button at the bottom of the form. On mobile especially, users clicked magic link and never saw feedback. Secondary issues: duplicate `id="site00-signin-email"` / `site00-signin-password` on desktop+mobile forms mounted simultaneously; message line-height too tight (~10px tall); async handlers lacked `try/finally` so a thrown error could leave the button stuck disabled.

- **Fix:** Moved feedback block to immediately **below** the magic link button; added `scrollIntoView` on feedback; unique per-layout input/form ids (`-desktop` / `-mobile`); improved message line-height; `try/finally` on all async auth handlers. Magic link OTP now redirects through `/origin/sign-in?returnTo=…` (so Supabase session hash lands on the auth surface) and lowercases email before the Supabase call.

- **Changes:** `Site00SignInForm.tsx`, `site00SignInActions.ts`, `site00-auth.css`. Build PASS.

---

## 2026-08-21 — AIO project index integration (founder Projects)

- **Context:** Follow-up sprint after Real Project Index + Command Surface, Founder Dual-Context Access, and Runtime Repair. Founder Projects index had three canonical projects (Frontal Slayer, Studio World, ndxbook) but omitted **ALL IN ONE ENTERPRISES** despite AIO already existing in EVOLVE + orchestration registries.

- **Forensic audit:** Canonical slug `all-in-one-enterprises`; production UUID `3781f0b7-cbc5-470d-8af7-69b97cfa5729`; classification `MANAGED_BRAND`; orchestration `EXISTING_ACTIVE_PROJECT` with `MISSING_EVIDENCE` reconciliation; repository `UNVERIFIED` / `NOT_ACCESSIBLE`; EVOLVE profile `POST_LAUNCH` (trucking/logistics); social channels `DEFERRED_BY_OWNER`; no duplicate org needed.

- **Implementation:** Added AIO to `FOUNDER_PROJECTS` in `api/_lib/site00Projects/projectRegistry.ts` and extended `Site00FounderProjectSlug` union. `projectResolver.ts` reuses canonical org UUID, merges EVOLVE deferred command items (Social Marketing stays DEFERRED not BLOCKED), derives POST LAUNCH phase + operations production state, surfaces OPERATIONS admin route, and reports truthful repository connection (`UNAVAILABLE — NEEDS CONFIGURATION`) from orchestration store. `ProjectDetailPage` shows repository row + deferred command items; `ProjectEvolvePage` shows privileged utilities for all founder projects (removed hardcoded slug whitelist).

- **Tests:** New `aioProjectIndex.test.ts` (21 cases) + updated founder-index count regressions (3→4) in `site00Projects.test.ts`, `projectsIndexContract.test.ts`, `site00DualContext.test.ts`. Full suite 507/507 PASS. Build PASS.

- **Conventions:** Do not create duplicate AIO org/UUID/EVOLVE profile. Social marketing deferral is owner decision — never a launch blocker. Missing GitHub repo evidence must not remove AIO from founder index; show partial/truthful enrichment instead.

---

## 2026-08-21 — AIO project restoration verification + Projects subtitle copy

- **Context:** Founder sprint to restore **All In One Enterprises Inc (AIO)** to the SITE 00 Projects page via canonical project architecture (not frontend mock). Forensic audit required before changes; no EVOLVE enrollment, intake fabrication, or unrelated project regressions.

- **Topics covered:** Full project resolution pipeline audit (`shared/site00-projects/*`, `api/_lib/site00Projects/*`, EVOLVE org registry, orchestration registry, access model, `/projects` API). Searched all AIO slug/name variants. Verified other projects (Frontal Slayer, NDXBOOK, Studio World) unchanged.

- **Root cause (confirmed):** AIO existed in EVOLVE + orchestration registries (`all-in-one-enterprises`, UUID `3781f0b7-cbc5-470d-8af7-69b97cfa5729`, `MANAGED_BRAND`) but was **omitted from `FOUNDER_PROJECTS`** in `api/_lib/site00Projects/projectRegistry.ts` when the Real Project Index shipped with only three slugs. Projects page uses `useSite00ProjectsIndex` → `/api/site00/projects?action=index` → `listSite00FounderProjects()` — so AIO never appeared despite being a real canonical org.

- **Repair (already on `main` commit `fe2682a`):** Added AIO to founder registry + `Site00FounderProjectSlug` union; extended `projectResolver.ts` (UUID guard, POST LAUNCH phase, deferred social command items, OPERATIONS surface, truthful repository UNAVAILABLE); `ProjectDetailPage` repository row; `ProjectEvolvePage` removed slug whitelist. 21-case `aioProjectIndex.test.ts`; founder index count 3→4 regressions.

- **This chat verification:** Re-ran full suite **507/507 PASS**, build **PASS**. Updated `ProjectsPage.tsx` header subtitle to list all four founder projects (copy only — cards already from canonical query).

- **Conventions:** AIO visibility must not depend on intake or EVOLVE commercial enrollment. Missing repo evidence → partial enrichment, not index exclusion. Do not merge PRs without explicit founder instruction when sprint says so; `main` already has core fix — live site00.com still needs GoDaddy deploy separately.

---

---

## 2026-08-21 — Identity + Builder Brand Lore Intelligence Expansion

- **Context:** Large sprint to expand Identity and Builder intake upstream of Creative Direction — collect structured brand-world intelligence (worldview, emotional promise, cultural tension, references, anti-direction, digital experience behavior) without turning intake into a corporate branding worksheet. Explicit: no deploy, no emails, **do not merge without founder instruction**.

- **Forensic audit:** Identity previously captured operational scoping only (project type, goals, audience, timeline, budget) — 0/19 lore domains. Builder partially prefilled Identity via localStorage (audience, timeline, budget) but did not inherit lore server-side. Creative Direction consumed Content Brain + hardcoded NDXbook brief with no readiness gate. No canonical BrandLoreProfile existed.

- **Architecture implemented:**
  - `shared/site00-brand-lore/` — types, 19 lore question registry, 11 Builder experience questions, adaptivity, readiness (`CONTEXT_INCOMPLETE` / `CONTEXT_PARTIAL` / `CORE_DIRECTION_READY`), context classification (NDXBOOK → `SOCIAL_FIRST_EDITORIAL`, no website-default), lore synthesis (deterministic, shared for frontend + API).
  - `api/_lib/site00BrandLore/` — loreService, memoryStore, experienceSynthesis, brandLoreBridge; wired into `intakeService.ts` autosave/submit for Identity lore + Builder experience.
  - Identity UX: core calibration → review → `/world/:stepId` lore phase → `world-review` ("WHAT WE HEARD") → calibration injection if readiness incomplete → submit.
  - Builder UX: experience translation at `/bldr/:slug/experience/:stepId`; inherits Identity lore snapshot; contextualized movement prompt when world metaphor known.
  - Creative Direction: `intelligenceBrief.ts` blends Brand Lore when present; `engagementService.ts` exposes `brandLoreReadiness` gate (blocks FAL queue when incomplete); NDXBOOK bypass preserved.
  - Admin: `BrandIntelligencePanel` on intake detail with structured sections + provenance; API returns `brandLore` on detail fetch.

- **Tests:** 30 new brand-lore cases + intake lore autosave integration. Full suite **538/538 PASS**. Build PASS.

- **Branch:** `cursor/identity-builder-brand-lore-1983`. PR opened, **not merged** (founder instruction).

- **Conventions:** Raw founder answers stay in intake `loreAnswers`; synthesized profile is separate with per-field provenance (`RAW_FOUNDER_INPUT`, `FOUNDER_CONFIRMED`). Never auto-confirm AI synthesis. NDXBOOK canon unchanged. Builder must not re-ask Identity lore fields listed in `BUILDER_INHERITED_LORE_FIELDS`.

---

## 2026-08-21 — Cloud Agent auto-start preview + GoDaddy deploy bundle

- **Context:** Founder asked how to extend preview tunnel uptime; requested `.cursor/environment.json` for auto-start (close to always-on) and a direct cPanel deploy download link.

- **Tunnel reality:** Cloudflare `cloudflared` has no inactivity shutdown — preview stops when the **Cloud Agent VM** ends or is recycled. True always-on = GoDaddy production deploy or dedicated tunnel host; within Cursor Cloud, best effort = environment `terminals` + team **Long running agents** + follow-up messages.

- **Added:** `.cursor/environment.json` — `install` runs `npm ci` + downloads `cloudflared` to `.cursor/bin/` (persists in environment Builds); `start` writes `/tmp/site00-cloud-preview-url.txt` from `SITE00_CLOUDFLARE_TUNNEL_HOSTNAME`; `terminals` auto-start `site00-vite` and `site00-preview-tunnel` (tunnel script loops with 5s restart on exit). Scripts in `.cursor/scripts/`. Updated `README.md`, `CORE.md`, `.gitignore` (`.cursor/bin/`).

- **GoDaddy deploy:** Built production `dist/` from `main` (`VITE_API_BASE=https://api.site00.com`). Release **`site00-deploy-2026-08-21`** — direct ZIP: `site00-production-dist-2026-08-21.zip` + `SITE00-DEPLOY-README.txt`. Upload/extract to cPanel `public_html`; hard-refresh mobile after deploy.

- **Branch:** `cursor/cloud-env-always-on-4f59` → merged to `main`.

---

## 2026-08-21 — CTRL ROOM sign out + production Projects/API diagnosis

- **Context:** Founder deploy gap follow-ups — backgrounds fixed by Aug 21 ZIP; Projects still failing on site00.com; requested SIGN OUT on CTRL ROOM.

- **Projects on deploy (diagnosis):** `/projects` loads from `GET /api/site00/projects?action=index` (auth required). Tunnel works because Vite serves local Node API. Production build uses `VITE_API_BASE=https://api.site00.com`, but `api.site00.com` currently resolves to GoDaddy static IP (404 on `/api/health`) — Railway + CNAME still required per `docs/DEPLOYMENT.md`.

- **Sign out fix:** Legacy `CtrlRoomSidebar` had LOG OUT but was unused after Operating World shell. Added `CtrlRoomSignOutButton` (`signOutAppAndSupabaseSession` + `trackActivity('sign_out')` + redirect Origin): desktop in `OperatingWorldTopNav`; mobile bar on all `/control/*` routes via `EcosystemShell`.

- **Branch:** `cursor/ctrl-room-sign-out-4f59`.

---

## 2026-08-21 — Railway API deploy crash fix (Projects blocker)

- **Context:** Founder on mobile setting up Railway **production** service; generated `*.up.railway.app` domain showed **“Not Found — The train has not arrived at the station”** and deployments kept failing — same root cause as broken `api.site00.com` / Projects page on site00.com.

- **Root cause (confirmed locally):** API process crashed on startup before healthcheck passed:
  1. `api/site00-access.ts` imported `../_lib/...` (resolves to repo root) instead of `./_lib/...` — `ERR_MODULE_NOT_FOUND`.
  2. `npm run start:api` uses `tsx`, which was in **devDependencies** — Railway production install (`--omit=dev`) → `tsx: not found`.
  3. `server/index.ts` imported `loadEnv` from **vite** (also dev-only) — second crash after tsx fix.

- **Fix:** Corrected `site00-access` imports; moved `tsx` to `dependencies`; added `server/loadEnvFiles.ts` (reads `.env*` without vite). Tests **507/507 PASS**; local prod-mode health `{ ok: true, service: "site00-api" }`.

- **Founder next steps (mobile):** Railway **Variables** — `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_COOKIE_SECRET`, `SESSION_COOKIE_SECURE=true`, `ADMIN_EMAILS`; redeploy from `main`; confirm `https://<railway-url>/api/health`; then custom domain `api.site00.com` + GoDaddy CNAME `api` → Railway hostname (remove any `api` A record to GoDaddy IP).

- **Branch:** `cursor/railway-api-deploy-fix-4f59`.

---

## 2026-08-21 — cPanel deploy bundle v2 (Railway API live)

- **Context:** Founder confirmed Railway health check passing (`{"ok":true,"service":"site00-api"}` on `site00-production.up.railway.app`); requested latest production ZIP for GoDaddy cPanel.

- **Built from `main`:** `VITE_API_BASE=https://api.site00.com`, CTRL ROOM sign out, background URL fixes. Release **`site00-deploy-2026-08-21-v2`** — ZIP ~2MB (static assets; env backgrounds load from Supabase at runtime).

- **Direct download:** `https://github.com/yoteenz/SITE00/releases/download/site00-deploy-2026-08-21-v2/site00-production-dist-2026-08-21-v2.zip`

- **Still required for Projects:** GoDaddy DNS CNAME `api` → Railway hostname (remove `api` A record to GoDaddy IP if present).

---

## 2026-08-21 — Cloudflare preview tunnel restart (fresh VM)

- **Request:** Restart the preview tunnel.
- **Context:** Fresh cloud agent VM — no tmux server was running at all (neither `site00-vite` nor `site00-preview-tunnel` existed yet), so this was a from-scratch bring-up, not just a kill/relaunch.
- **Action:** Created `site00-vite` tmux session, ran `npm run dev` (Vite already defaults to `--port 5174 --host`) with `SITE00_CLOUD_MOBILE_PREVIEW=1`. `/tmp/cloudflared` binary was missing — downloaded `cloudflared-linux-amd64` from GitHub releases (v2026.8.2), `chmod +x`. Created `site00-preview-tunnel` tmux session running `/tmp/cloudflared tunnel --no-autoupdate run --token "$SITE00_CLOUDFLARE_TUNNEL_TOKEN"`. 4 QUIC connections registered, precheck healthy, ingress config resolved hostname → `http://localhost:5174`. Refreshed `/tmp/site00-cloud-preview-url.txt`; confirmed `curl` to the tunnel hostname returns `200`.
- **Convention reinforced:** On a brand-new VM, don't assume `site00-vite`/`site00-preview-tunnel` tmux sessions or `/tmp/cloudflared` exist — check `tmux ls` and `ls /tmp/cloudflared` first and bootstrap both if absent, same steps as a warm restart.

---

## 2026-08-21 — Cloudflare preview tunnel restart (warm, second request same session)

- **Request:** Restart the tunnel again (follow-up in the same chat, ~20 min after the first restart).
- **Action:** `site00-vite` was already healthy (`curl localhost:5174` → 200) — left untouched. Sent `C-c` + `kill-session` to `site00-preview-tunnel`, `pkill -f "cloudflared tunnel"` to be sure the old process was gone, then created a **fresh** tmux session and relaunched `/tmp/cloudflared tunnel --no-autoupdate run --token "$SITE00_CLOUDFLARE_TUNNEL_TOKEN"`. 4 new QUIC connections registered, precheck healthy, `curl https://$SITE00_CLOUDFLARE_TUNNEL_HOSTNAME/` → 200.
- **Gotcha:** `kill-session` immediately followed by `new-session` + `send-keys` for the *same session name* in one chained command sometimes raced and left no session at all (`tmux ls` showed it missing right after). Fix: create the new session and confirm with `tmux ls` **before** sending the `cloudflared` command into it, rather than chaining kill+create+send-keys in a single shot.

---

## 2026-08-21 — Mobile Brand Lore calibration + Create Account closure sprint

- **Context:** Founder sprint to fix two blocking SITE 00 client-experience gaps on the brand-lore stack: (1) `/projects/:projectSlug/calibrate` not usable on mobile, (2) no production-ready CREATE ACCOUNT onboarding surface. Preserve Brand Lore readiness, intake persistence, dual-context, project authorization; do **not** merge/deploy/send emails/modify NDX BOOK Creative Direction without explicit founder instruction.

- **Forensic audit root causes:**
  - **Mobile calibration:** Route was registered correctly (`Site00AccountRouteGuard` + `EcosystemShell`); failure was UX/architecture — `ProjectLoreCalibrationPage` rendered all missing lore steps at once (desktop-dense layout), not Identity-style one-question-at-a-time flow; no per-step flush save; showed raw slug not friendly name (e.g. NDX BOOK).
  - **Create account:** No canonical registration route; sign-in **CREATE ACCOUNT** link looped to `/sign-in?returnTo=...` (dead link).

- **Mobile calibration fix:** New `ProjectLoreCalibrationFlow` reuses canonical `IdentityLoreStepForm`, `IdentityCalibrationConsole`, `IdentityCalibrationNavigation`; flush-save on each step via `site00ProjectsApi.submitLoreCalibration()` before advancing; `projectDisplayName()` maps `ndxbook` → **NDX BOOK**; API `creative_direction` action returns `brandLoreCalibrationAnswers` from org lore profile for resume.

- **Create account fix:** Canonical route **`/origin/create-account`** (`SITE00_ROUTES.createAccount`); aliases `/register`, `/create-account` redirect; `/sign-in` → sign-in. `Site00CreateAccountForm` + `site00SignUpWithPassword()` (Supabase signUp, password mismatch/invalid email mapping, active session vs verification-required, `claimGuestIntakes()` on active session). Shared `Site00AuthShell` variant `create-account`. Sign-in CREATE ACCOUNT link fixed via `site00CreateAccountHrefWithReturnTo()`.

- **Tests:** 12 new cases (routes, project display name, calibration step mapping, sign-up actions). Full suite **566/566 PASS**. `tsc --noEmit` PASS. `npm run build` PASS.

- **Browser QA:** Create account verified at 375/390/430/640/1024/1440 — no horizontal overflow; labels/CTAs present; returnTo preserved in sign-in link. Sign-in CREATE ACCOUNT link points to `/origin/create-account`. Calibration route correctly auth-guards to sign-in with returnTo; full mobile calibration UI QA requires founder authenticated session (not attempted — no credentials in agent env).

- **Branch:** `cursor/mobile-lore-calibration-account-4f59` (from `cursor/brand-lore-productionization-4f59`). PR opened, **not merged** (founder instruction).

---

## 2026-08-22 — Create account route homepage redirect fix

- **Symptom:** Sign-in **CREATE ACCOUNT** sent users to SITE 00 homepage instead of registration form on production.

- **Root cause:** Production GoDaddy bundle predated `/origin/create-account` route; App.tsx catch-all `*` → `/` when route missing. Sign-in link also passed resolved `/control` returnTo instead of preserving raw query.

- **Fix:** Moved auth routes (`/origin/sign-in`, `/origin/create-account`, aliases) **before** `/origin` in `Site00Routes`; added `site00CreateAccountLinkTarget()` for React Router `Link` targets; sign-in footer uses object `to` with preserved `returnTo`. Requires redeploy of frontend from `main`.

---

## 2026-08-22 — Create account still routes to homepage (live deploy gap)

- **Symptom:** Founder reports CREATE ACCOUNT still lands on homepage after code fixes merged (#210, #212).

- **Diagnosis:** Live `site00.com` still serves pre-Aug-22 bundle `assets/index.BT7zuSxb.js` — zero `create-account` strings in JS; `SITE00_ROUTES` in that bundle has `signIn` but no `createAccount`. Unmatched `/origin/create-account` hits App.tsx catch-all → `/`. Code on `main` is correct; v3 release ZIP contains `index.CNB6EHR2.js` with route baked in.

- **Action:** Not a code regression — **GoDaddy cPanel upload required**. Updated `SITE00-DEPLOY-README.txt` v4 with bundle hash check (BT7zuSxb = broken, CNB6EHR2+ = fixed); production `vite build` now stamps `app-build-id` meta (was `__APP_BUILD_ID__` placeholder on live). README deploy section notes view-source check.

- **Founder deploy (mobile):** Download [site00-production-dist-2026-08-22.zip](https://github.com/yoteenz/SITE00/releases/download/site00-deploy-2026-08-22/site00-production-dist-2026-08-22.zip) → cPanel File Manager → public_html → upload → extract in place → hard refresh. Verify `/origin/create-account` shows form and page source no longer references `index.BT7zuSxb.js`.

---

## 2026-08-22 — Create account still redirects (confirmed undeployed Aug 22 bundle)

- **Symptom:** Founder reports CREATE ACCOUNT still lands on Origin homepage after code fixes.

- **Live verification:** `site00.com` still serves `index.BT7zuSxb.js` (Last-Modified **2026-08-21 20:49 UTC**). Browser QA: sign-in → CREATE ACCOUNT → `/` homepage; direct `/origin/create-account` → `/` homepage.

- **Old bundle bug (forensic):** CREATE ACCOUNT link target is `` `/sign-in?returnTo=...` `` (not `/origin/create-account`); old bundle has no `/sign-in` alias route → App catch-all `*` → `/` (Origin). New bundle on main has `createAccount:"/origin/create-account"` and auth routes before `/origin`.

- **Not a code regression** — Aug 22 release ZIP was never uploaded to GoDaddy. Added: `.htaccess` no-cache for index.html, boot-gate skip for `/origin/create-account`, `scripts/package-cpanel-deploy.sh`, deploy readme v5 with delete-old-files-first mobile steps.

---

## 2026-08-22 — Project lore calibration resume on refresh

- **Symptom:** Founder on cloud preview tunnel — refreshing `/projects/ndxbook/calibrate` restarted at step 1 despite saved progress.

- **Root cause:** `ProjectLoreCalibrationFlow` always reset `stepIndex` to 0 on load even though API returns `brandLoreCalibrationAnswers` from server `rawLoreAnswers`. In-progress selections before CONTINUE were also lost (no local draft).

- **Fix:** `resolveProjectLoreCalibrationStepIndex()` in `adaptivity.ts` resumes at first step without a server answer; `projectLoreCalibrationResume.ts` persists step + draft to `localStorage` on every change and merges on reload; clears on completion. Flow waits for resume hydration before rendering steps.

- **Branch:** `cursor/calibration-resume-on-refresh-4f59`.

---

## 2026-08-22 — Calibration step counter reset (frozen session steps)

- **Symptom:** Near end of calibration, progress jumped (e.g. 06/08 → 01/01) as if a different questionnaire; tunnel refresh landed on step 1 with total count 1.

- **Root cause:** `steps` was recomputed from **current** `missingDomains` on every load. Each saved answer satisfied domains, shrinking the step list on refresh. Counter used `steps.length` so total dropped mid-session.

- **Fix:** Freeze full `stepIds` at session start in `localStorage` (`v2` key); always render that list for progress (06/08 stays stable). Resume index uses server answers against frozen list. `missingDomainsToLoreSteps` now returns canonical `IDNTY_LORE_QUESTIONS` order.

- **Branch:** `cursor/calibration-frozen-steps-4f59`.
