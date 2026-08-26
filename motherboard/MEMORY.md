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


## 2026-08-19 — Merge conflict triage (mobile GitHub workflow + loader PRs)

- **Context:** Founder merging from GitHub mobile app hit "Unable to merge — conflicts must be resolved." Requested conflict review after fetching latest `main`.
- **Simple (fixed):** **PR #33** (`cursor/mobile-loader-regression-lock-4a83`) — only `package.json`: both branches added different npm scripts. Resolved by keeping **both** `strip:loader-audio` (main) and `verify:loader-mobile` (branch). Pushed; PR mergeable.
- **Complicated (not auto-fixed):**
  - **PR #30** — presentation-architecture + loader overhaul vs main’s loader/audio/desktop-preview changes; **11 files** (loader boot, routes, Origin/Public shells, `Site00Context`, `OriginPage`). Conflicting intents — needs manual design pass or rebase onto main.
  - **PR #15, #13, #5** — older Enter/Origin bg/copy tweaks; conflict with later artboard/shell work on main. Likely **superseded** — close or cherry-pick if still needed.
- **Already clean:** **PR #29**, **#28**, **#2** mergeable with main without conflicts.
- **Deploy reminder:** merge to `main` does not update site00.com until GoDaddy deploy (Actions artifact/ZIP or FTP).

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

## 2026-08-21 — EVOLVE commercial productization + canonical pricing architecture

- **Context:** EVOLVE had no canonical commercial/pricing layer — no service catalog, no plan concept, no Foundation/entitlement model, no billing readiness. Task: productize EVOLVE's existing governed workflow (Content Brain → Creative Direction → Visual DNA → campaign → assets → approval → distribution → performance) into a coherent paid-service architecture, without redesigning SITE 00, inventing services, faking checkout, or assigning fabricated billing to founder projects.

- **Audit first:** Confirmed no prior EVOLVE pricing existed anywhere in the repo (no Stripe, no checkout, no subscription/entitlement model, no conflicting legacy pricing to migrate) — this was a greenfield commercial layer, not a migration.

- **Canonical catalog (new `shared/site00-evolve-commercial/`):** `types.ts` defines the domain model (`EvolveBillingType`, `EvolvePriceQualifier`, plan/service IDs, `EvolveCommercialState`, etc.) with `priceCents` integer pricing and an optional `providerRef` (Stripe-ready but no IDs invented). `catalog.ts` is the single source of truth: `EVOLVE_FOUNDATION` ($1,500 one-time), `EVOLVE_RECURRING_PLANS` (Essential $1,250/mo, Growth $2,500/mo **recommended**, Studio $4,500/mo, Private from $7,500/mo `customScopeRequired`), `EVOLVE_PROJECT_SERVICES` (Creative Direction Intensive $1,500, Content Sprint from $1,250, Launch Campaign from $2,500, Campaign World from $4,000, Visual DNA Refresh from $750), `EVOLVE_PAID_MEDIA_SERVICE` ($750/mo min OR 15% of spend, whichever greater, `computePaidMediaFeeCents()`, ad spend explicitly separate). `formatEvolvePrice()` renders canonical display strings (`FROM $7,500 / MONTH`, never `$7.5k`).

- **Foundation ↔ Identity qualification (new `api/_lib/site00Evolve/commercial/foundationQualification.ts`):** Server-side-only determination (never frontend) of `FOUNDATION_REQUIRED` / `FOUNDATION_WAIVED_WITH_CANONICAL_INTELLIGENCE` / `FOUNDATION_COMPLETED` by inspecting existing `MarketingProfileRow` + Content Brain canonical intelligence (positioning, audience, brand voice, objectives) — references existing intelligence, never duplicates it.

- **Commercial state ≠ operational state (new `commercialState.ts`, `governedActions.ts`):** `resolveEvolveCommercialState(orgSlug)` aggregates applicability (`BILLABLE_CLIENT` / `INTERNAL_NON_BILLING` / `NOT_APPLICABLE`), active plan, Foundation status, entitlements, and paid-media status — strictly separate from Creative Direction / Visual DNA / publishing governance (tests assert plan selection never approves CD/Visual DNA/Page 001 and never enables publishing). `setEvolveCommercialPlan()` / `markEvolveFoundationCompleted()` are the only founder-controlled writes, persisted via a new `metadata.commercial` JSONB field on `MarketingProfileRow` (no migration needed) — wired through `storeAdapter.ts` → `memoryStore.ts` / `supabaseStore.ts` (`updateProfileCommercialMetadata`).

- **Entitlements (new `entitlements.ts`):** Per-plan capacity (channel limit, asset capacity range) as informational-only guidance; explicitly does not gate publishing/provider-readiness/approval (regression-tested by scanning imports for forbidden governance-module references).

- **Wiring:** `projectResolver.ts` adds a `commercial` field to `Site00ProjectDetail` (computed, not stored per-project — Frontal Slayer/Studio World/AIO stay `NOT_APPLICABLE`/`INTERNAL_NON_BILLING`, no fabricated subscriptions; NDXBOOK's approval/publishing state untouched). `api/admin/site00-evolve.ts` adds `commercial_catalog` / `commercial_state` (GET) and `commercial_set_plan` / `commercial_mark_foundation_completed` (POST) actions. `src/site00/admin/services/evolveApi.ts` adds matching client calls. Admin `EvolveOrgPage.tsx` gets a new "COMMERCIAL" panel (plan, Foundation, entitlements) — separate from client-facing context, no billing secrets exposed. Client `ProjectDetailPage.tsx` surfaces current plan + Foundation state truthfully (no fake usage metering — shows "USAGE METERING NOT YET AVAILABLE" style truthful state instead of fabricating "12 of 16 assets used").

- **Public pricing page:** New route `/evolve/plans` (`shared/site00-access/routes.ts` → `site00ProjectCommercialRoute()`, `src/site00/config/routes.ts`, `src/routes/Site00Routes.tsx`) rendering `src/site00/pages/evolve/EvolveCommercialPage.tsx` inside the existing `Site00PublicShell` — Foundation, then Essential/Growth(recommended)/Studio/Private progression, then Project Services, then Paid Media — using only the canonical catalog (no hardcoded duplicate pricing in components) and existing SITE 00 visual system (no redesign). No fake checkout — plan/service selection uses truthful non-transactional CTAs.

- **Studio World boundary preserved:** EVOLVE STUDIO is a plan-tier name only; no runtime/org-identity merge with Studio World's `PRODUCTION_INFRASTRUCTURE` boundary.

- **Visual QA:** Used Playwright with `addInitScript` to inject the immersive-loader-skip `sessionStorage` keys (bypassing the cinematic loader for automated screenshots), verified `/evolve/plans` at 375/390/430/640/1024/1440+ with zero horizontal overflow. Temporary QA scripts (`scripts-tmp-shot.mjs`, `scripts-tmp-overflow-check.mjs`) were deleted before commit — not part of the repo.

- **Tests/build:** 444 tests PASS (31 files, incl. new `catalog.test.ts`, `entitlements.test.ts`, `foundationQualification.test.ts`, `commercialState.test.ts` covering canonical pricing, paid-media higher-of calc, Foundation states, entitlement capacity, governance separation, and project-boundary non-fabrication). `tsc --noEmit` clean. Build PASS. No Stripe products created, no live charges, no emails, no deploy.

- **Branch:** Merged via PR #193 (`cursor/evolve-commercial-pricing-architecture-1983` → `main`).

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

---

## 2026-08-21 — NDX BOOK three-direction Creative Direction reference-locked production cleanup + FAL pipeline

- **Context:** Founder attached three approved reference boards (Editorial Utility / signal lime, Index Signal / electric cobalt, Kinetic Field / rose-orange-purple motion) and asked Sonnet to reconstruct the *visual systems* implied by each — not just palettes — using a new reference-to-production methodology, classify NDX BOOK's brand-expression context, and prove the system via a FAL asset pipeline with composite mapping. Repeated "send the conclusion in a code box" prompts across turns; this turn finished the outstanding implementation (Kinetic Field renderer) and ran real visual QA before returning the final conclusion.

- **Methodology formalized:** `docs/site00/CREATIVE_DIRECTION_METHODOLOGY.md` — `BrandExpressionContext` classification (`SOCIAL_FIRST_EDITORIAL` for ndxbook, set in `intelligenceBrief.ts`'s `synthesizeCreativeBrief`), mandatory reference decomposition manifest (`docs/studio-world/ndxbook/NDXBOOK_CD_REFERENCE_DECOMPOSITION.md`), `CODE_NATIVE` vs `GENERATED_ASSET` vs `HYBRID_COMPOSITION` decision rules, FAL production pipeline (fidelity modes, background-treatment declaration), and mandatory composite mapping (desktop + independently recomposed mobile, via CSS custom properties + media query in `HybridAssetLayer`).

- **Assets:** 6 real FAL-generated assets via `fal-ai/nano-banana-pro` (+ `fal-ai/birefnet/v2` background removal for 3 of them), stored as static `.webp` in `public/site00/creative-direction/ndxbook/`, registered with full provenance + composite maps in `api/_lib/site00Evolve/creativeDirection/generatedAssets.ts`. One asset (`is_scan_hero`) went through 2 real regeneration cycles after visual inspection rejected an early candidate (baked-in HUD/lens-flare overlay, wrong tone, unwanted person) — genuine reject/regenerate loop, not just a technical pass.

- **Renderers rewritten** (all three, each now with 9–10 new behavior/motion-principle specimens beyond the pre-existing set): `EditorialUtilityTerritoryView.tsx` (signal lime `#D6FF3B`, 9 editorial branches: burn page/receipts/margin notes/list/file/insert/redaction/centerfold/back page), `IndexSignalTerritoryView.tsx` (electric cobalt `#2457F7`, 9 signal behaviors: pulse/readout/pattern/scan/forecast/alert/transmission/coordinate/projection), `KineticFieldTerritoryView.tsx` (rose/orange/deep-purple `#FF2E7E`/`#FF7A2E`/`#5B21B6`, 10 motion principles: push/pull/ripple/collision/current/trajectory/build/break/aftermath/momentum). `territories.ts` specimen-type arrays expanded to match; `types.ts` extended with the new specimen-type unions plus `BackgroundTreatment`, `AssetClassification`, `FidelityMode`, `CompositeMap`, `SpecimenImageAsset`. `SpecimenFrame.tsx` gained `HybridAssetLayer` (renders GENERATED/HYBRID images with independent desktop/mobile composite recomposition) and `AssetProvenanceTag`; `paletteFromGrayscale` made generic so palettes with extra accent keys (`accent2`/`accent3` for Kinetic) type-check.

- **Visual QA this turn:** Built a temporary unauthenticated preview route + Playwright script (both removed after use — not committed) to screenshot all three renderers at 375/390/430/640/1024/1440px. Confirmed **zero horizontal overflow at every breakpoint**, confirmed the three directions are visually distinct (lime/black/white editorial vs cobalt/graphite signal vs dark rose-orange-purple kinetic), and confirmed the 6 FAL hero/prop images composite correctly with SVG overlays via `HybridAssetLayer`. Full suite 507/507 PASS, `tsc --noEmit` clean, build PASS after every change.

- **Known gaps (reported honestly, not glossed over):** No reference-conditioned FAL generation was used (attached founder images weren't available as files to the model this session — used detailed text-to-image prompts derived from visual inspection instead, `DIRECTED_VARIATION` fidelity). Only 6 of many possible specimens have real FAL imagery; the rest are intentionally `CODE_NATIVE` SVG (by design per the code-vs-generated decision rules, not a shortcut). Carousel/Stories/Reels social-first proof exists as individual specimen types within each renderer, not yet as a dedicated swipeable/sequential UI. No direction was marked founder-approved in system state — these remain `PROPOSED`/`GENERATED`, per governance.

- **Conventions:** Never generate everything through FAL or recreate everything in CSS — decide per-component. Every `HYBRID_COMPOSITION`/`GENERATED_ASSET` needs an explicit composite map with independently authored (not proportionally shrunk) mobile placement. Reject-and-regenerate is normal production, not failure — document it. Visual QA (real screenshots at real breakpoints) is mandatory before declaring a Creative Direction pass complete; tests/build passing is necessary but not sufficient.

---

## 2026-08-21 — Core Direction Formation + Controlled Expansion methodology (Stage A/B gating), applied to NDX BOOK

- **Context:** Immediately after the NDX BOOK three-direction Creative Direction sprint above, the founder issued a standing methodology directive: **"Do not design the entire brand world before the core creative idea has been proven."** It mandates two non-collapsible stages — Stage A (Direction Formation: brand context classification, three conceptually distinct Core Direction Boards, Founder Core-Direction Gate) and Stage B (Direction Expansion: DNA extraction, controlled branch expansion with mandatory lineage declarations, a seven-question lineage test, channel translation, production expansion) — with "expansion freedom LOW before core approval, HIGH after, concept-drift tolerance always LOW." NDX BOOK was named as the validation example; the directive is explicitly universal for all future SITE 00/Studio World creative work, not NDX-specific.

- **Key discovery:** The existing `CreativeDirectionEngagement` architecture (`api/_lib/site00Evolve/creativeDirection/`) already implemented ~90% of this gating model under different names — `CreativeDirectionLifecycle` (PROPOSED/UNDER_REVIEW/REVISION_REQUESTED/SELECTED/APPROVED), a founder-decision UI (APPROVE/REFINE/HYBRIDIZE/REJECT in `CreativeDirectionExperience.tsx`), and `VisualDnaContract` promotion gated strictly behind an `APPROVE` decision (`visualDnaContract.ts` / `engagementService.ts`), with `Page001ReadinessGate` blocked until DNA is `APPROVED`. Rather than rename/rebuild this (would break many existing tests/consumers), formalized the founder's exact vocabulary as an **additive derived layer**.

- **New code:** `types.ts` gained `CoreDirectionDefinition` (bigIdea/oneLineThesis/brandConnection/culturalReference/emotionalPromise/visualMetaphor/governingBehavior/materialImageryLanguage/typographicAttitude/coreColorLogic/signatureDevices/primaryBrandArtifact/proprietaryQuality/antiDirection), `CoreDNA` (conceptRules/visualRules/compositionRules/imageRules/materialRules/typographyRules/colorRules/motionRules/contentBehavior/signatureDevices/prohibitedDrift), `BranchLineageDeclaration` + `BranchLineageTest` (the 7 founder questions as explicit booleans) + `branchPassesLineageTest()`, `CoreDirectionGateStatus` + `coreDirectionGateStatus()` (maps existing lifecycle → founder vocabulary; `SELECTED` stays `CORE_DIRECTION_PENDING` since DNA isn't locked), and `expansionFreedomFor()` (LOW pre-approval, HIGH post-approval, drift tolerance always LOW). `CreativeTerritory` gained `coreDirection` + `branchLineage` fields; `VisualDnaContract` gained `conceptDna: CoreDNA | null`, populated only inside `promoteVisualDnaToApproved()` (now takes the territory) via new `extractCoreDna()` in `coreDirection.ts` — never speculatively.

- **NDX BOOK retrofit:** New `coreDirectionDefinitions.ts` formally authors a full `CoreDirectionDefinition` for all three territories (Editorial Utility/`ANNOTATION`/Burn-Book ancestor, Index Signal/`SCANNING`/instrumentation ancestor, Kinetic Field/`MOVEMENT`/physics ancestor) and retroactively documents **all 28 already-built branches** (9 + 9 + 10) as `BranchLineageDeclaration`s, each answering the 7-question lineage test — every one passes. Wired into `territories.ts` so every territory carries `coreDirection`/`branchLineage` end-to-end through the API payload (no extra plumbing needed — the admin/site00-evolve endpoint serializes the engagement object directly).

- **Governance honesty:** None of NDX BOOK's three directions has reached `CORE_DIRECTION_APPROVED` — all sit at `CORE_DIRECTION_PENDING`, `conceptDna` is `null` for all three, expansion freedom is `LOW`. Explicitly flagged in the new methodology doc that the 28 branches were built *before* formal Stage A founder approval (prior sprint), which the new methodology says should not happen going forward — nothing was reverted, but future branch work must wait for `CORE_DIRECTION_APPROVED` per direction.

- **Frontend:** `CreativeDirectionExperience.tsx` now renders a "CORE DIRECTION BOARD" panel (big idea, one-line thesis, cultural reference, visual metaphor, governing behavior, emotional promise, primary artifact, proprietary quality, signature devices, anti-direction) and a "BRANCH LINEAGE — STAGE B" panel per territory, plus a gate-status badge (`coreDirectionGateLabel()`), inside the existing territory-detail view (new CSS in `site00-creative-direction.css`). This makes the Founder Core-Direction Gate concretely reviewable in-product, not just documented.

- **Docs:** New `docs/site00/CORE_DIRECTION_METHODOLOGY.md` — the full two-stage methodology, the lifecycle→gate-status mapping table, and the NDX BOOK validation example with an explicit process note about the pre-approval branch-expansion gap. Cross-referenced from the top of the existing `docs/site00/CREATIVE_DIRECTION_METHODOLOGY.md` (that doc governs asset production once a direction IS being produced; the new doc governs sequencing/gating — when a direction may exist or expand at all).

- **Testing:** New `api/_lib/site00Evolve/creativeDirection/coreDirectionMethodology.test.ts` (15 tests) validates: Core Direction Boards are fully populated and conceptually distinct across all 3 territories; every one of the 28 branch declarations passes the lineage test; Index Signal/Kinetic Field have their own branch names (not copies of Editorial Utility); gate starts `CORE_DIRECTION_PENDING` with `conceptDna` null; expansion freedom is `LOW` pre-approval; on a real `APPROVE` decision, gate flips to `CORE_DIRECTION_APPROVED`, `conceptDna` is extracted with all 11 `CoreDNA` fields populated, and expansion freedom flips to `HIGH`; `REFINE`/`REJECT` never advance past `CORE_DIRECTION_REVISION_REQUESTED`; `HYBRIDIZE` (`SELECTED`) stays `CORE_DIRECTION_PENDING` with DNA `PROPOSED`-not-locked. Full suite 522/522 PASS (was 507; +15 new), `tsc --noEmit` clean, production build PASS.

- **Conventions:** This is now the standing sequencing methodology for **all** future SITE 00/Studio World creative work (not NDX-specific) — first find the world (Stage A, LOW freedom), then prove it (Core Direction Board), then lock its DNA (Founder Core-Direction Gate → `CORE_DIRECTION_APPROVED` only), then let it expand (Stage B, HIGH freedom but every branch must pass the 7-question lineage test). Never populate `conceptDna`/DNA extraction speculatively before approval. Extend the founder-vocabulary mapping (`coreDirectionGateStatus`) rather than renaming the underlying lifecycle enum when adding gate semantics to existing engagements.

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

## 2026-08-22 — PR #201 merge conflict resolution (main into ndxbook CD branch)

- **Branch:** `cursor/ndxbook-cd-reference-locked-production-4f59` (PR #201) merged `origin/main` after create-account/deploy sprint.

- **8 conflict files:** `types.ts`, `territories.ts`, `visualAssetStrategy.ts`, `CreativeDirectionExperience.tsx`, `TerritoryRendererRegistry.tsx`, three territory renderer views.

- **Simple (fixed):** Brand-lore brief fields merged into `types.ts` alongside Core Direction methodology types; `CreativeDirectionExperience` keeps Core Direction board UI + adds lore readiness banner/calibrationLink from main; renderer/registry/strategy kept branch reference-locked versions; tests updated for priority brief set + lore calibration before APPROVE. PR #201 now mergeable.

- **Complicated (coexist, not unified):** Two asset pipelines — main's `assetGeneration.ts` (Supabase manifest) vs branch's `generatedAssets.ts` (static webp + compositeMap). `territories.ts` uses static registry for `ndxbook` org only. Stale on-disk `generatedAssets/ndxbook.assets.json` (main page_001 brief keys) does not match branch priority briefs — manifest module retained but not wired into territory build.

---

## 2026-08-22 — Brand Lore multi-select incorporated into NDXBOOK CD branch

- **Context:** Founder reported multi-selection still missing for NDXBOOK calibration (`role` / WHO ARE YOU IN THEIR WORLD?).

- **Fix:** Cherry-picked `cursor/brand-lore-semantic-multi-select-1983` (commit `e66c65e`) into `cursor/ndxbook-cd-reference-locked-production-4f59`. `role` is now `MULTI_SELECT` with `selectionGuidance: 'MORE THAN ONE CAN BE TRUE.'`; synthesis preserves compound selections in `audienceRelationship: string[]`; UI shows guidance + SELECTED markers; `ProjectLoreCalibrationFlow` uses `loreInteractionMode()` for default values.

- **Key files:** `loreAnswerTypes.ts`, `idnty-lore-questions.ts`, `loreSynthesis.ts`, `IdentityLoreStepForm.tsx`, `IdentityCalibrationOptionRows.tsx`, `ProjectLoreCalibrationFlow.tsx`.

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

---

## 2026-08-22 — Batch merge conflict resolution + #103 mobile routes

- **#103 `fix-mobile-routes-bc8e`:** Merged `main`; kept legacy `/sign-in` + `/identity/*` aliases, IDNTY reserved slug guards, projects desktop redirect, public-page coverage. Uses main `IdntyMobileDiagnostic` + `site00CreateAccountLinkTarget`.
- **Closed superseded:** #81 (five-bay nav), #89 (Fast Travel icon — already `NAV/3C9BC909…` on main), #94 (Evolve assessment dedupe — main redesign).
- **Prior batch:** #94–#15, #106–#107, #96–#99, #93, etc. — mostly MEMORY-only conflicts resolved.

---

## 2026-08-22 — Calibration stuck at 06/06 instead of 08/08

- **Symptom:** Founder on NDXBOOK calibration step 6 saw **06/06** (contradiction tensions) instead of **06/08**; stale frozen sessions dropped `lineage` + `now` when REFERENCE domain partially satisfied by `objects` answer.

- **Fix:** `calibrationScopeDomains()` keeps all domains with saved answers in scope; `mergeCanonicalCalibrationStepIds()` expands frozen sessions (never shrinks); localStorage bumped to **v3**; NDXBOOK reconciled profile verified as **8 lore steps**.

- **Branch:** `cursor/calibration-full-eight-steps-4f59`.

---

## 2026-08-22 — Uppercase calibration and site input text (password exception)

- **Symptom:** Lore/calibration textareas (e.g. NDXBOOK step 06/08 lineage) showed typed text in lowercase despite SITE 00 uppercase brand law.

- **Root cause:** Shell-level `text-transform: uppercase` in `site00-typography.css` did not reliably apply to `input`/`textarea` values (especially mobile Safari); only placeholders had explicit uppercase rules.

- **Fix:** Added explicit uppercase on all non-password inputs and textareas across SITE 00 shells (`:is(...shells...) input:not([type='password'])...`, `textarea...`); password fields unchanged via existing `.site00-signin-form__input--password` + `input[type='password']` exceptions.

- **Branch:** `cursor/uppercase-input-fields-4f59`.

---

## 2026-08-22 — Calibration complete loop (save → redirect)

- **Symptom:** On final calibration step (08/08), tapping **COMPLETE CALIBRATION** flashed **SAVING…** then reverted to **COMPLETE CALIBRATION** with no redirect back to Creative Direction.

- **Root cause:** `ProjectLoreCalibrationFlow.handleContinue` only called `finishCalibration()` when `brandLoreReadiness.blocked === false`. An 8-step frozen session can finish while server readiness is still blocked (e.g. domains like `PRIMARY_EXPRESSION_CONTEXT` have no lore step). Last-step save succeeded but completion never fired.

- **Fix:** `shouldFinishProjectLoreCalibration()` — finish after successful save on the last session step regardless of readiness gate; still finish early if readiness clears mid-session. Added **CALIBRATION COMPLETE** UI + ~1.4s redirect; `returnTo` via router `location.state` (Creative Direction link passes it; default remains CD path). Removed duplicate button label (`nextStepLabel` was mirroring `continueLabel`).

- **Branch:** `cursor/calibration-complete-redirect-4f59`.

---

## 2026-08-22 — Calibration option row layout shift on multi-select

- **Symptom:** On multi-select lore steps (e.g. contradictions 08/08), selecting an option jumped label/icon positions — **SELECTED** in top-right corner, target icon dropped to bottom-left, rows grew taller; header **08 / 08** overlapped the red corner mark.

- **Root cause:** Option row grid was 4 columns but multi-select injected a 5th child (`SELECTED`), forcing grid wrap. Console step counter shared top-right with absolutely positioned `Site00ThreeCornerMark`.

- **Fix:** Explicit `grid-template-areas` (index | divider | label | selected | target) with fixed cell placement; console header uses 3-column grid (kicker | counter | mark) instead of absolute mark overlap.

- **Branch:** `cursor/calibration-option-layout-fix-4f59`.

---

## 2026-08-22 — Calibration banner persists after save (stale readiness + CTA logic)

- **Symptom:** After completing all 8 calibration steps (answers saved; calibrate page shows selections), Creative Direction still showed **COMPLETE CALIBRATION** banner as if nothing saved.

- **Root cause:** (1) In-memory Creative Direction engagement cached `brandLoreReadiness.blocked` at first load and was not re-synced from the updated Brand Lore profile on later reads. (2) Banner showed calibration CTA whenever `blocked === true`, even when no lore steps remained unanswered.

- **Fix:** `syncEngagementBrandLoreReadiness()` on every `getCreativeDirectionPayload` / cached engagement return; `remainingCalibrationStepIds()` drives CTA visibility; post-calibration redirect passes `calibrationCompletedAt` to force CD reload; saved-with-no-steps-left banner copy becomes **CALIBRATION SAVED** without CTA.

- **Branch:** `cursor/calibration-readiness-banner-fix-4f59`.

---

## 2026-08-22 — Creative Intelligence Infrastructure + Core Direction Reasoning Engine

- **Context:** User requested Composer Foundation Sprint to build provider-neutral generative-reasoning layer between Brand Lore → Core Direction Formation → FAL Visual Production. Sprint ends at FINAL CORE DIRECTION BOARDS + VISUAL PROOF PLANS (no FAL invocation, no deploy, no founder approval changes).

- **Topics covered:** Full XXXIV spec — CreativeIntelligenceProvider abstraction, Anthropic/Sonnet first adapter, formation input from Brand Lore, exactly-three enforcement, Creative Critic + bounded revision loop, Visual Proof Plans, formation persistence/idempotency, admin inspector, client forming/unavailable states, 45+ tests, NDX BOOK fixture validation.

- **Decisions / outcomes:**
  - New module `api/_lib/site00Evolve/creativeDirection/creativeIntelligence/` — types, config, prompts, provider registry, Anthropic fetch adapter, unavailable provider, mock provider for tests, formation input builder, validation, deterministic critic, visual proof plan builder, formation service with in-memory records keyed by org+project+fingerprint+formationVersion+promptVersion.
  - Static INDEX SIGNAL / EDITORIAL UTILITY / KINETIC FIELD preserved as `LEGACY_PROPOSED_EXPLORATION`; new runs stored as `PROPOSED_FORMATION` separately on payload (`coreDirectionFormation`).
  - No LLM keys in env → truthful `CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE`; client banner: "YOUR BRAND INTELLIGENCE IS READY. CREATIVE FORMATION IS WAITING ON THE PRODUCTION ENGINE."
  - Admin: `creative_direction_formation_inspector` GET + debug page formation inspector panel; POST `creative_direction_reform` increments formationVersion.
  - Extended `CoreDirectionDefinition` usage via `FormedCoreDirection` (directionId, loreLineage, motionSeed, socialExpressionHypothesis, etc.) without replacing static territory boards.

- **Changes:** creativeIntelligence/* (new), engagementService.ts, types.ts, site00-evolve.ts admin routes, CreativeDirectionExperience.tsx banners, EvolveCreativeDirectionDebugPage.tsx, evolveApi.ts, creativeIntelligenceFormation.test.ts (46 tests). Tests 754/754; tsc + build clean.

- **Conventions:** Business logic must use `getCreativeIntelligenceProvider()` — never direct Anthropic SDK in CD services. Model id centralized in `config.ts` (`SITE00_CREATIVE_INTELLIGENCE_MODEL` / `ANTHROPIC_CREATIVE_MODEL`). MAX_CREATIVE_REVISION_ROUNDS = 2.

- **Branch:** `cursor/creative-intelligence-formation-4f59`.

---

## 2026-08-22 — Creative Intelligence Production Activation

- **Context:** Productionize Creative Intelligence so NDX BOOK can perform first real Brand-Lore-driven Core Direction Formation with durable persistence and founder-facing presentation. No FAL, no approval changes, no deploy.

- **Decisions / outcomes:**
  - Durable store: `site00_core_direction_formations` Supabase table + migration `20260822140000_site00_core_direction_formations.sql` (applied to FS Website Supabase project). Store adapter pattern mirrors Brand Lore (`formationStore/memoryStore.ts`, `supabaseStore.ts`, `storeAdapter.ts`) — memory in tests only, fail loud in production without Supabase.
  - `formationService.ts` refactored to persist every state transition via store adapter; idempotency by `idempotency_key` survives restart; FAILED records reusable only via explicit `retryCoreDirectionFormation` / admin `creative_direction_formation_retry`.
  - `providerConfig.ts` adds CONFIGURED / UNAVAILABLE / MISCONFIGURED validation without costly LLM probe.
  - Founder UI: `FormedCoreDirectionReview.tsx` shows three lore-derived directions primary; legacy INDEX SIGNAL / EDITORIAL UTILITY / KINETIC FIELD segregated under PRIOR EXPLORATIONS.
  - Live formation blocked: `ANTHROPIC_API_KEY` not in runtime env → durable FAILED record with `CREATIVE_INTELLIGENCE_PROVIDER_UNAVAILABLE`; founder must add secret to API deployment (Railway/server env), not source code.

- **Changes:** formation store layer, providerConfig, formationService durable refactor, engagementService client states + retry/reform, CreativeDirectionExperience + CSS, admin debug inspector timestamps, production activation tests (20). Tests 766/766; tsc + build clean.

- **Branch:** `cursor/creative-intelligence-production-activation-4f59`.

---

## 2026-08-22 — Live NDX BOOK Core Direction Formation activation (Railway deploy + Sonnet run)

Summary of this cloud agent run through live formation completion.

- **Deploy blockers resolved:** Railway build failed on unclosed `</ul>` in `EvolveCreativeDirectionDebugPage.tsx` (PR #227). Retired model `claude-sonnet-4-20250514` → default `claude-sonnet-4-6` (PR #225). Health endpoint exposes Creative Intelligence model for deploy verify (PR #226). Sonnet omitted required JSON fields → explicit schema in formation prompt (PR #228). Markdown fence parse fix in `parseStructuredJson` (main c32ba7e).
- **Live formation:** NDX BOOK Brand Lore v24 fingerprint `5e71f429`, readiness `CORE_DIRECTION_READY`. Reform v2 on production after deploy → `READY_FOR_VISUAL_PRODUCTION` with 3 directions: THE ANNOTATED COPY, THE ROOM WHERE IT HAPPENS, THE INDEX. Critic PASS all three, distinctiveness passed, 0 revision rounds. Provider anthropic/claude-sonnet-4-6, 4 requests, 11563 in / 18169 out tokens. 3 Visual Proof Plans persisted. FAL not invoked.
- **Persistence:** Production API still in-memory formation store (Supabase `site00_core_direction_formations` empty from cloud agent queries); records survive until Railway restart.
- **Founder UI:** `PROPOSED_FORMATION` surface active; legacy INDEX SIGNAL / EDITORIAL UTILITY / KINETIC FIELD under `LEGACY_PROPOSED_EXPLORATION`.

---

## 2026-08-22 — Projects page hang fix (formation guard on index)

- **Symptom:** `/projects` would not load after live CI activation — stuck on LOADING or timing out.
- **Cause:** `projectResolver` called `getCreativeDirectionPayload` during index enrichment, which invoked `getOrRunCoreDirectionFormation` (multi-minute Sonnet run) on every projects load after Railway restart.
- **Fix (PR #229):** `getCreativeDirectionPayload(orgSlug, { runFormation: false })` for project index + command connections; cached single read per project resolve.

---

## 2026-08-22 — Projects page blank screen after LOADING PROJECTS

- **Symptom:** `/projects` showed LOADING PROJECTS then white/blank screen (preview + production).
- **Cause:** `Site00WorldColdStartGate` ran immersive loader on `/projects` even though `site00LoaderPaths` marks it public/skip — white overlay could remain; index API also resolved full project detail (~20s).
- **Fix (PR #230):** Skip loader on public hub paths; cloud preview skips cinematic loader; lightweight index resolver; defensive ProjectsPage fields.

---

## 2026-08-22 — Core Direction canonicalization + founder field mapping (PR #231)

Summary of this cloud agent sprint through forensic reconciliation and canonical founder payload.

- **Forensic discrepancy:** Founder UI showed v1 `THE MARKED-UP COPY / THE COUNTDOWN ROOM / THE PERSONAL ARCHIVE` + NEEDS_HUMAN_REVIEW while live Sonnet v2 `THE ANNOTATED COPY / THE ROOM WHERE IT HAPPENS / THE INDEX` + READY_FOR_VISUAL_PRODUCTION existed in Supabase (`39a27725`). Root cause: engagement pinned formationVersion 1 + idempotency reuse of incomplete v1 record (`5db1b245`); not hardcoded UI data.
- **Fix:** `resolveCanonicalCoreDirectionFormation()` — status rank + highest formationVersion + fingerprint scope; wired into `getCreativeDirectionPayload`. `directionFieldContract.ts` normalizes aliases and suppresses empty founder headings. `FormedCoreDirectionReview` mobile-first collapsible layout + proof slots + production state banner.
- **Persistence:** Both v1 and v2 durable in `site00_core_direction_formations` (Supabase FS project). v2 complete fields + 3 Visual Proof Plans + critic PASS.
- **FAL:** Not dispatched this sprint (0 requests). Visual proof generation scaffold/state only; founder visual review blocked until Stage A proofs produced.
- **Tests:** 772 passing (+6 new canonical/field contract tests). Branch `cursor/core-direction-canonicalization-4f59` → PR #231 merged to main.

---

## 2026-08-22 — NDX BOOK six-direction founder comparison set (PR #232)

Summary: NDX BOOK-only instance-scoped exception exposing all six Core Direction candidates from formations v1 + v2 for founder comparison before selection.

- **`resolveNdxbookFounderComparisonSet()`** — NOT a formation/reform; projects v1 directions 01–03 then v2 04–06 with lineage (`sourceFormationId`, `sourceFormationVersion`, `sourceDirectionIndex`, fingerprint). Canonical remains v2 `39a27725`.
- **v1 field audit:** THE MARKED-UP COPY / COUNTDOWN ROOM / PERSONAL ARCHIVE missing 11 production fields each (bigIdea, thesis, governingBehavior present). No frontend fabrication. `directionCompletionService.ts` scaffold for targeted Sonnet completion — **0 Anthropic requests** this sprint.
- **Visual proof plans:** 6 Stage A plans prepared (hero, artifact, material, typographic, social, motion slots in UI). FAL not dispatched.
- **Founder UI:** comparison mode header "CORE DIRECTION COMPARISON · 6 DIRECTIONS FOR FOUNDER REVIEW"; mobile single-column cards; collapsible lineage; no legacy/failed labeling on v1 directions.
- **`recordFounderDecision`:** `selectedDirectionLineage` captures direction from either formation without promoting v1 formation.
- **Tests:** 779 passing (+7). Branch `cursor/ndxbook-six-direction-comparison-4f59` → PR #232 merged.

---

## 2026-08-22 — Six-direction intelligence completion + controlled FAL visual proof production (PR #233)

Summary: Composer production sprint implementing v1 Sonnet completion wiring, Stage A proof production pipeline, and founder UI proof asset display for NDX BOOK six-direction comparison.

- **V1 completion:** `completeNdxbookV1Directions()` + cousin-direction guards in `directionCompletionService.ts` / `prompts.ts` v2. Admin action `creative_direction_complete_v1_directions`. **Anthropic not configured on cloud agent VM** — v1 directions 01–03 remain PARTIAL (11 fields missing each). Must run completion on Railway production API where Anthropic is configured.
- **Proof production pipeline:** `comparisonProofPromptCompiler.ts`, `comparisonProofProduction.ts`, `comparisonProofStore.ts`, `comparisonProofInspector.ts`, `sixDirectionProductionOrchestrator.ts`. Admin action `creative_direction_run_six_direction_production`. Script `scripts/runNdxbookSixDirectionProduction.ts`.
- **Runtime production (partial):** FAL_KEY configured — generated **9 accepted Stage A proofs** for v2 directions 04–06 only (hero + primary artifact + social × 3). Durable Supabase storage + manifest `generatedAssets/ndxbook.comparisonProofs.json`. BiRefNet background removal on isolated artifacts. v1 directions skipped (incomplete fields). **0 proofs for directions 01–03.**
- **Founder UI:** `FormedCoreDirectionReview` ProofSlot renders real images when `proofAssetsByDirection` READY; states GENERATING/FAILED/NEEDS REVIEW. `engagementService` attaches proof assets via `attachProofAssetsToComparisonSet()`.
- **Distinctiveness QA:** Automated cousin-pair check — NEEDS_HUMAN_REVIEW until v1 hero proofs exist.
- **Tests:** 787 passing (+8). tsc + build green. Branch `cursor/six-direction-proof-production-4f59` → PR #233.
- **Not ready:** Founder six-direction visual review blocked until v1 Sonnet completion + proofs for all six directions.

---

## 2026-08-22 — Mobile production controls on Creative Direction debug page (PR #235)

Summary: Founder on mobile requested tap-to-run production instead of curl/Railway CLI.

- **`EvolveCreativeDirectionDebugPage`:** Added **SIX-DIRECTION PRODUCTION** panel with Step 1 (complete v1 directions) and Step 2 (run proof production) buttons, status summary, refresh, and link to founder comparison view. Large 48px tap targets.
- **`evolveApi.ts`:** Fixed admin EVOLVE fetch to use `VITE_API_BASE` + Supabase `Bearer` token (required for `api.site00.com` from mobile). Added `creativeDirectionCompleteV1Directions` and `creativeDirectionRunSixDirectionProduction`.
- **`EvolveCreativeDirectionPage`:** Footer link renamed **PRODUCTION CONTROLS →** pointing to debug page.
- **Mobile flow:** Sign in on site00.com → Admin → EVOLVE → Creative Direction → **PRODUCTION CONTROLS** → tap Step 1, wait, tap Step 2 (keep tab open several minutes) → **OPEN FOUNDER COMPARISON VIEW**.

---

## 2026-08-22 — Evolve admin CORS fix on fsbw-dev (PR #238)

Summary: Founder still saw **LOAD FAILED** / **FAILED TO FETCH** on Production Controls after PR #237 routing fix.

- **Root cause:** Cross-origin `fetch` from `site00.fsbw-dev.com` → `api.site00.com` used `credentials: 'include'`. API returns `Access-Control-Allow-Origin: *`; browsers block that combo (CORS preflight passes but actual request fails).
- **Fix:** Removed `credentials: 'include'` from `evolveApi.ts` — Bearer token auth only. Verified Railway API healthy (200 with admin token); fsbw-dev local `/api` still stale (500 prompts.js) but evolve calls no longer hit it.
- **Still required:** Sign in on site00 (preview admin bypass does not authenticate API). Then reload `/admin/site00/debug/evolve-creative-direction` and tap **RUN FULL PIPELINE (BACKGROUND)**.

---

## 2026-08-22 — THE MARKED-UP COPY single-board production pilot (board-first)

Summary: Methodology correction sprint — validate board-first Creative Direction production on ONE direction before scaling to remaining five.

- **Built:** `CreativeDirectionBoardPlan`, board art direction spec, reference decomposition, desktop/mobile composition maps, 6-asset manifest, per-asset FAL prompts, BiRefNet isolation, deterministic SVG compositor (code-native typography/strike-through/annotations), board-level QA gate, `ndxbook.creativeDirectionBoards.json` manifest.
- **Pilot scope:** THE MARKED-UP COPY only (comparisonIndex 01). Directions 02–06 untouched.
- **Runtime:** 4 FAL text-to-image + 2 BiRefNet + 2 code-native SVG assets → desktop (1440×900) + mobile (390×780) composed boards stored in Supabase. Admin action `creative_direction_marked_up_copy_board_pilot`.
- **Founder UI:** `CreativeDirectionBoardView` replaces proof slots for direction 01 when board QA = PASS (`founderVisible`). Currently `NEEDS_HUMAN_REVIEW` — board hidden from founder comparison until visual QA.
- **Tests:** 797 passing (+10 board pilot tests). Branch `cursor/marked-up-copy-board-pilot-4f59`.

---

## 2026-08-22 — THE MARKED-UP COPY board engine v2 repair + reference-conditioned regeneration

Summary: Remediation sprint implemented board engine v2 (not audit-only). Direction completion gate, reference file resolution from Supabase manifests, physical reference crops (sharp), influence graph, dynamic art direction service (Sonnet when configured; fallback from completed direction intelligence), reference-conditioned FAL via `fal-ai/nano-banana-pro/edit`, asset inspection gate (heuristic + optional Anthropic vision), hybrid primary artifact compositor, 0–5 board QA scoring, copy contract banning sibling-direction language, founder UI legacy isolation (`CREATIVE BOARD REFINING` vs proof slots).

- **Runtime pilot v2:** `marked-up-copy-pilot-v2` board PASS 49/50, `founderVisible=true`, QA all dimensions ≥4. Reference crops REF-COMP-01, REF-ANNOT-01, REF-MAT-01, REF-PHOTO-01 persisted. v1 FAL assets reinspected and reused under v2 QA where passing; v2 storage paths under `boards/01/v2/`.
- **Direction completion:** loreLineage backfilled (deterministic from formationInput when Anthropic unavailable); `fieldCompleteness.complete=true`.
- **Admin action:** `creative_direction_marked_up_copy_board_pilot` now runs v2 orchestrator. Script: `scripts/runMarkedUpCopyBoardPilotV2.ts`.
- **Tests:** 804 passing (+7 v2 tests). Branch `cursor/marked-up-copy-board-v2-repair-4f59`.
- **Known gaps:** Anthropic vision QA not exercised this run (no API key in cloud agent); dynamic art direction used deterministic fallback enriched from completed direction fields; most FAL layers reused from v1 after reinspection — fresh reference-conditioned FAL edit calls not required on reuse path.

---

## 2026-08-22 — Background production jobs + export fix (PR #236)

Summary: Founder reported Step 1 module export error and Step 2 EVOLVE API 404 on fsbw-dev; blocking sync requests impractical on mobile.

- **Export fix:** Moved completion prompts to `directionCompletionPrompts.ts` (avoids stale `prompts.js` export resolution on Railway).
- **API routing fix:** `evolveApi` falls back to `https://api.site00.com` when host is fsbw-dev / site00.com and `VITE_API_BASE` unset (fixes 404 on static preview hosts).
- **Background jobs:** `site00_creative_direction_production_jobs` table + `sixDirectionProductionJobService.ts`. Admin action `creative_direction_start_production_job` returns immediately (202); poll `creative_direction_production_job`. UI: **RUN FULL PIPELINE (BACKGROUND)** — safe to leave page; auto-polls every 5s when job active.
- **Migration applied** to Supabase FS project.

---

## 2026-08-22 — NDXbook board generation link below intelligence-ready banner

Summary: Founder requested a direct link on the NDXbook project creative direction page to the board production route, placed below the **YOUR BRAND INTELLIGENCE IS READY** readiness panel.

- **Placement:** `CreativeDirectionExperience` — new optional `boardProductionLink` prop rendered inside the `PROVIDER_UNAVAILABLE` readiness banner (below banner body), matching existing `site00-cd__readiness-banner-cta` styling used by calibration CTA.
- **Founder route:** `/projects/ndxbook/creative-direction` — link shown for NDXbook when user is dual-context admin (`isDualContextUser`).
- **Admin route:** `/admin/site00/orchestration/ndxbook/evolve/creative-direction` — same link for NDXbook on admin creative direction page.
- **Target:** `/admin/site00/debug/evolve-creative-direction` (`SITE00_ADMIN_ROUTES.evolveCreativeDirectionDebug`) — existing production controls page with **RUN FULL PIPELINE (BACKGROUND)** and six-direction proof production.
- **CTA copy:** **GENERATE BOARDS →**
- **Tests:** 804/804 passing. Branch `cursor/ndxbook-board-generation-link-4f59`.

---

## 2026-08-22 — THE MARKED-UP COPY Sonnet creative-director pass (board v3)

Summary: Surgical creative-direction upgrade sprint — Sonnet owns production board art direction for THE MARKED-UP COPY only. v2 engine substrate preserved; v3 plan/composition/critique layer added.

- **New modules:** `boardCreativeDirectorService.ts` (Sonnet senior CD critique + v3 art direction; deterministic fallback NOT founder-ready), `markedUpCopyBoardPlanV3.ts` (dramatic desktop/mobile maps, manifest recomposition), `boardInspectorV3.ts` (+CREATIVE_DIRECTION_AUTHORITY gate), `markedUpCopyBoardPilotV3.ts` (orchestrator; BLOCKED_ON_SONNET_ART_DIRECTION before FAL when Anthropic unavailable).
- **Types:** `BoardCreativeCritique`, `BoardCreativeDirectorPass`, `FounderVisualApproval`, `BoardAssetReuseDecision`, `MARKED_UP_COPY_BOARD_PLAN_VERSION_V3`.
- **Admin action:** `creative_direction_marked_up_copy_board_pilot` now runs v3 orchestrator. Script: `scripts/runMarkedUpCopyBoardPilotV3.ts`.
- **Founder UI:** v3 board label, FOUNDER VISUAL REVIEW · PENDING on technical PASS (approval ≠ automated QA PASS).
- **Storage:** v3 assets under `boards/01/v3/`; v2 preserved separately; founder comparison prefers v3 when present.
- **Runtime (cloud agent):** ANTHROPIC_API_KEY unset → BLOCKED_ON_SONNET_ART_DIRECTION (no deterministic-fallback v3 board generated). Run on Railway with key via production controls.
- **Tests:** 821 passing (+17 v3). tsc + build green. Branch `cursor/marked-up-copy-board-v3-sonnet-4f59`.

---

## 2026-08-22 — DirectionExpressionSystem + board v4 (live Sonnet production sprint)

Summary: Follow-up sprint adds canonical intermediate layer **DirectionExpressionSystem** (Core Direction → Expression System → Board Art Direction → Board Production) for THE MARKED-UP COPY only. Admin board-pilot action now runs v4 orchestrator via Railway API runtime.

- **DirectionExpressionSystem:** `directionExpressionSystemTypes.ts`, `directionExpressionSystemService.ts` (Sonnet brand-system designer), `directionExpressionSystemStore.ts`. Quality gates: FIFTY_POST_TEST, NO_EXPLANATION_TEST. PRE-VISUAL-DNA · PROPOSED · founder-review evidence.
- **Board v4:** `boardCreativeDirectorV4Service.ts`, `markedUpCopyBoardPlanV4.ts`, `boardCompositorV4.ts` (franchise specimens), `boardInspectorV4.ts` (+IDENTITY_SYSTEM_COMPLETENESS, NO_EXPLANATION_STRENGTH, FIFTY_POST_EXTENSIBILITY, NON_TEMPLATE_DISTINCTIVENESS, TEMPLATE_SUBSTITUTION_TEST), `markedUpCopyBoardPilotV4.ts`.
- **Production:** Authenticated `creative_direction_marked_up_copy_board_pilot` → Railway `api.site00.com` with server-side ANTHROPIC_API_KEY; response sanitized (`credentialExposed: false`). Script: `scripts/liveMarkedUpCopyBoardV4.ts`.
- **Storage:** upsert on board asset + crop uploads; v4 under `boards/01/v4/`; v2/v3 preserved; founder UI prefers v4.
- **Health check:** Railway reports `creativeIntelligence.status: CONFIGURED` (Anthropic available on production API).
- **Tests:** 833 passing (+12 v4). Branch `cursor/marked-up-copy-expression-v4-4f59`.

---

## 2026-08-22 — Marked-Up Copy v4 live production execution (Sonnet PASS · FAL blocked on Railway)

Summary: Completed live production run for THE MARKED-UP COPY v4 via Railway background job after fixing Sonnet JSON truncation and HTTP 502 timeout.

- **Hotfixes merged:** PR #244 (8192→16384 max_tokens + JSON parse retry), PR #245 (background job `marked_up_copy_board_v4` — sync pilot returns 202 for non-dryRun), PR #246 (compact board Sonnet output — no placement arrays; summarized Expression System payload).
- **Live run (job 309a1b69):** Sonnet executed on Railway (`claude-sonnet-4-6`, 9540 in / 9984 out tokens, 2 requests). DirectionExpressionSystem id `d9b359cc201aa165` persisted. BoardPlan v4 id `5a5d3036346f167f`. Real Sonnet critique + art direction persisted.
- **FAL blocked:** Railway API lacks `FAL_KEY` — all 8 reference-conditioned manifest assets failed (`FAL_KEY not configured`). No successful reference-conditioned FAL calls despite prompts + reference crop inputs prepared.
- **Board QA:** FAIL 45/50 — `MATERIAL_RELEVANCE: 3` (FAL assets missing). Expression-system gates PASS (50-post 5/5, no-explanation 5/5). Template/substitution/contamination tests PASS. `founderVisible: false`; `founderVisualApproval: PENDING`.
- **Board SVGs:** Desktop/mobile v4 composed and stored (`final-desktop-marked-up-copy-pilot-v4.svg`, `final-mobile-marked-up-copy-pilot-v4.svg`) — compositor-only (no FAL imagery).
- **Next:** Configure `FAL_KEY` on Railway API runtime and re-run board v4 job for asset production + QA PASS.

---

## 2026-08-22 — Brand-native visual prompt compiler + ONE hero pilot (THE MARKED-UP COPY)

Summary: Forensic prompt-architecture repair sprint — direction-system-first visual generation (not topic→stock). ONE hero pilot only; no board regen; directions 02–06 untouched.

- **Root cause:** Prior FAL prompts were topic-first → generic stock imagery (calculator/ledger finance scenes). GPT Image 2 model switch alone does not fix prompting.
- **BrandNativeVisualPromptCompiler:** `brandNativeVisualPromptCompiler.ts` — world premise → photography/material/color → subject transformation (topic last). `transformTopicIntoDirectionNativeSubject()`, `TOPIC_CLICHE_BLACKLIST`, role-specific strategies (`HERO_EDITORIAL_WORLD`, etc.).
- **Provider adapter:** `gptImage2VisualProviderAdapter.ts` — `BrandNativeVisualBrief` → FAL `openai/gpt-image-2` / `openai/gpt-image-2/edit` (provider-agnostic brief layer).
- **Raw QA:** `brandNativeVisualRawInspector.ts` — PRE_OVERLAY_DIRECTION_RECOGNITION_TEST via Sonnet vision when configured; heuristic NEEDS_HUMAN_REVIEW fallback.
- **Pilot orchestrator:** `markedUpCopyBrandNativeVisualPilot.ts` — ONE hero (`MUC-BRAND-NATIVE-HERO-PILOT`), topic `credit utilization`, STOP after QA. Admin action `creative_direction_marked_up_copy_brand_native_visual_pilot` + job type `marked_up_copy_brand_native_visual_pilot`.
- **Founder UI:** `brandNativeVisualPilot` exposed on creative direction payload; `FormedCoreDirectionReview` shows **VISUAL LANGUAGE PILOT** raw hero (no code overlays).
- **Live generation (local FAL):** pilot `f0dcba34-b3c7-4df3-8066-5444df75a502` — GPT Image 2/edit with REF-COMP-01 reference; ~$0.045; raw QA NEEDS_HUMAN_REVIEW (no local Anthropic vision). Manifest: `ndxbook.brandNativeVisualPilots.json`.
- **Tests:** 16 compiler/pilot tests pass. Build PASS. Do NOT scale to remaining board assets until founder approves hero pilot.

---

## 2026-08-22 — Identity-native hero pilot remediation (THE MARKED-UP COPY · ONE hero · A/B UI)

Summary: Founder rejected brand-native pilot as direction-native but identity-incomplete (stock-like editorial photography). Remediation sprint replaced topic→photograph pipeline with identity-first artifact design. ONE new hero `MUC-IDENTITY-NATIVE-HERO-PILOT`; brand-native pilot preserved for A/B.

- **Methodology shift:** CORE DIRECTION → Direction Expression System → Sonnet IDENTITY ART DIRECTOR → `IdentityNativeVisualBrief` → GPT Image 2 (text-only, no reference conditioning) → identity-native raw QA. Code overlays must NOT establish identity.
- **Sonnet art director:** `identityNativeArtDirectorService.ts` — proprietary visual DNA, semantic palette roles with dominance, typographic architecture, reference trait→application translation, prior pilot anti-example rejection. Palette derived from intelligence (ink black / galley off-white / editorial lime sparse-accent) — not hard-coded lime without semantic justification.
- **Compiler:** `identityNativeVisualPromptCompiler.ts` — artifact declaration first, topic subordinate last, anti-example rejection block, stranger test language.
- **QA:** `identityNativeVisualRawInspector.ts` — IDENTITY_NATIVE_SCORE, PALETTE_FIDELITY, TYPOGRAPHIC_DNA, GRAPHIC_GRAMMAR_FIDELITY, ARTIFACT_DESIGN_AUTHORITY, STOCK_RESEMBLANCE, logo-removal v2, stranger test. Acceptance thresholds ≥4 identity metrics, stock ≤1.
- **Orchestrator:** `markedUpCopyIdentityNativeHeroPilot.ts` — ONE hero, preserves `MUC-BRAND-NATIVE-HERO-PILOT`. Admin `creative_direction_marked_up_copy_identity_native_hero_pilot` + job `marked_up_copy_identity_native_hero_pilot` + script `runMarkedUpCopyIdentityNativeHeroPilot.ts`.
- **Founder UI:** `VisualPilotComparisonPanel.tsx` — A brand-native (DIRECTION-NATIVE / IDENTITY-INCOMPLETE) vs B identity-native with QA scores. Payload `visualPilotComparison` on creative direction engagement.
- **Live Railway run (job 2dc4bd2a):** pilot `6fe8fec1-1018-4ff1-8d0e-263935a07420` — Sonnet art director 1 request (`claude-sonnet-4-6`), GPT Image 2 text-only, ~$0.045, no refs. Sonnet vision QA ACCEPT: identity-native 5/5, palette 5/5, typographic DNA 5/5, graphic grammar 5/5, artifact authority 5/5, stock resemblance 0/5, stranger PASS, logo-removal v2 PASS. Storage: `ndxbook-identity-native-pilot/generated/6fe8fec1-...webp`.
- **PR #250 merged to main.** 15 identity-native + 16 brand-native tests pass. STOP — no board regen, no directions 02–06 until founder identity-native review.

---

## 2026-08-22 — Creative-refined identity hero V2 (THE MARKED-UP COPY · ONE hero · A/B/C UI)

Summary: Founder approved identity-native methodology (pilot B) but not final creative quality — typography, Martian Mono, wit, personality, compositional artistry. V2 sprint added Creative Expression Layer between Identity Art Direction and Visual Brief. ONE new hero `MUC-IDENTITY-NATIVE-HERO-PILOT-V2`; pilots A (brand-native) and B (identity V1) preserved.

- **Pipeline:** CORE DIRECTION → Expression System → Identity Art Director → **Creative Expression Layer** (Sonnet) → HeroCreativeConcept → Copy QA Gate → IdentityNativeV2VisualBrief → GPT Image 2 → Extended V2 QA.
- **New modules:** `creativeExpressionTypes.ts`, `creativeExpressionService.ts`, `martianMonoTypography.ts`, `copyQualityGate.ts`, `identityNativeVisualBriefV2Compiler.ts`, `identityNativeVisualRawInspectorV2.ts`, `markedUpCopyIdentityNativeHeroPilotV2.ts`. Admin job `marked_up_copy_identity_native_hero_pilot_v2`.
- **Martian Mono:** Confirmed in `src/site00/styles/site00-fonts.css` (Google Fonts). System/micro voice only — display/revision/margin remain separate typographic roles.
- **Founder UI:** `VisualPilotComparisonPanel.tsx` A/B/C — A brand-native, B identity-native V1, C creative-refined V2 with extended QA scores under C.
- **PR #251 merged:** V2 architecture + tests (9 V2 tests). First Railway run failed FAL 422 (prompt ~9.6k duplicate stack).
- **PR #252 merged:** Condensed V2 prompt compiler (~6.5k stored locally; Sonnet verbose concept blocks expand stored brief on Railway). Cap negative instructions for V2 briefs.
- **Live Railway V2 run (job 0767ee31):** pilot `801b6bb9-abc6-47a4-8e56-2c0b22cb26ce` — Sonnet creative expression (`claude-sonnet-4-6`, 3 Anthropic requests). Copy QA vision PASS 5/5 all dimensions, 0 revision rounds. GPT Image 2 text-only, ~$0.045, prompt hash `d4bde4fb01e7bcda`, no reference inputs. Storage: `ndxbook-identity-native-v2-pilot/generated/801b6bb9-...webp`. Image vision QA fell back to NEEDS_HUMAN_REVIEW (vision parse/unavailable on Railway runtime for V2 inspector). Founder status: NEEDS_HUMAN_REVIEW pending visual inspection.
- **Preserved:** A `49828b9e` (brand-native), B `6fe8fec1` (identity V1). STOP — no board regen, no directions 02–06 until founder approves pilot C.

---

## 2026-08-23 — Brand Personality Intelligence formalization (upstream canon · Identity + pipeline)

Summary: Follow-up production sprint formalizes **Brand Personality** as first-class upstream intelligence — behavioral canon sibling to Brand Lore, not adjective soup or downstream Creative Direction invention.

- **Context:** NDX BOOK Creative Direction exposed personality (humor, confidence, social posture, correction behavior) being invented at moodboard/CD time. Spec required forensic audit, canonical domain, Identity intake, Builder translation (inherit not re-ask), pipeline integration, NDX reconciliation, readiness gates, fingerprint staleness, tests, and methodology doc.
- **Forensic audit:** No first-class personality layer existed — fragmented across Brand Lore fields, Content Brain `brand_voice`, and direction-scoped CES/DES. Duplicates/overloads: `brandWorld` vs `worldMetaphor`, voice in three silos, Builder experience not org-canonical.
- **Architecture decision:** Extend `BrandLoreProfile` JSONB with nested `brandPersonality: BrandPersonalityProfile | null` — **not** a new Supabase table. Reuse `BrandLoreField<T>`, provenance, fingerprint, readiness patterns.
- **Identity intake:** 15 personality questions (A–O) in `idnty-personality-questions.ts` — 1 single-select (edge), 11 multi-select (capped), 3 free-text, 0 ranked. Integrated after lore steps; routes `/personality/:step`, `/calibrate-personality/:step`, `/personality-review`. Autosave via `useIdntyAssessment` `personalityAnswers`.
- **Synthesis:** `synthesizeBrandPersonalityProfile()` deterministic — every field carries value/classification/confidence/sourceAnswerIds/sourceSelectionIds/sourceType/founderConfirmationState/updatedAt; never invents without source.
- **Readiness:** 8 required domains (`SOCIAL_INSTINCT`, `CONFIDENCE_BEHAVIOR`, `VERBAL_PERSONALITY`, `WIT_BEHAVIOR`, `HUMANITY`, `DISAGREEMENT_BEHAVIOR`, `PERSONALITY_TENSION`, `ANTI_PERSONALITY`). `canBeginCoreDirectionFormation()` requires lore `CORE_DIRECTION_READY` **AND** `PERSONALITY_READY`. Legacy profiles → `PERSONALITY_INCOMPLETE` (blocks **new** formation only).
- **WHAT WE HEARD:** "HOW YOU SHOW UP" sections in `IdentityLoreWorldReview` — YOUR INSTINCT, CONFIDENCE, HUMOR, EDGE, HUMAN SIDE, DISAGREEMENT, WHAT YOU NOTICE, WHAT STICKS, ANTI-PERSONALITY; per-domain edit routing.
- **Pipeline:** Formation input adds `brandPersonalitySummary`. Creative Expression Layer adds `personalityLineage[]` — role shifted from invention to translation citing upstream fields. Fingerprint includes personality canonical fields + raw answers.
- **NDX BOOK:** `reconcileNdxbookPersonality()` maps known traits from LEGACY_CANON/CONTENT_BRAIN; `isProposedCreativePersonalitySource()` blocks CES/DES auto-promotion. No reformation, no FAL, no Anthropic spend.
- **Builder:** 8 translation questions registered (`bldr-personality-translation-questions.ts`); `BuilderPersonalityTranslationProfile` + `inheritedBrandPersonalitySnapshot` types defined — **UI/synthesis wiring deferred**.
- **Admin:** `BrandIntelligencePanel` PERSONALITY section (read-only field rows + readiness state).
- **Methodology:** `docs/site00/BRAND_PERSONALITY_METHODOLOGY.md` — Lore = what world is true; Personality = who brand is inside it; CD = creative world; DES = visual system; CES = personality inside system.
- **Tests:** 21 new in `brandPersonality.test.ts`; full regression 894 passing. `tsc --noEmit` + `npm run build` green.
- **Known gaps (next sprint):** Builder translation UX/synthesis + inheritance resolver; Content Brain + DES personality input wiring; per-field founder confirm for nested personality fields; responsive overflow visual QA (375/390/430); personality-only calibration API merge on submit.
- **Branch/PR:** `cursor/brand-personality-intelligence-4f59` merged to `main`.

---

## 2026-08-23 — NDX BOOK personality replay validation infrastructure (shadow E2E test)

Summary: Follow-up sprint builds **shadow replay validation infrastructure** for NDX BOOK — proves methodology can reproduce creative DNA from fresh founder input without benchmark leakage. Phase 1 only — **WAITING_FOR_FOUNDER_PERSONALITY_REPLAY** before pipeline execution.

- **Context:** After Brand Personality formalization (PR #253), need end-to-end acceptance test: fresh intake → personality → formation → DES → CES → identity art direction → ONE hero — compared post-hoc to canonical benchmark without copying approved hero.
- **Replay mode:** `NDX_PERSONALITY_REPLAY_VALIDATION` — isolated shadow context; never mutates canonical lore/personality/formation/hero.
- **Fixed lore:** `FIXED_LORE_REPLAY` — canonical Brand Lore snapshotted (personality stripped); only personality re-answered.
- **Storage:** `site00_methodology_validation_runs` table + memory store adapter; full `BrandPersonalityReplayRecord` in JSONB.
- **Leakage guards:** `personalityReplayLeakage.ts` — forbidden benchmark keys, no legacy direction names in formation (`includeLegacyExplorations: false`), benchmark load blocked until `HERO_GENERATED`.
- **Blind intake:** `/validation/ndxbook/replay/:replayId/personality/:stepId` — reuses canonical personality UI; no benchmark/direction/hero exposure during answering; autosave to replay record via `usePersonalityReplayIntake`.
- **Admin UI:** `/admin/site00/orchestration/ndxbook/evolve/pipeline-replay-validation` — create replay, link to blind intake, comparison cards (post-generation), founder methodology judgment (independent from CD approval).
- **API:** `personality_replay_create|list|get|save_answers|complete_intake|set_judgment` on site00-evolve admin API.
- **Tests:** 29 new in `personalityReplay.test.ts`; full regression green. tsc + build green.
- **NOT run this sprint:** Formation, DES, CES, identity art direction, FAL hero (Phases 5–11 await founder personality intake).
- **Branch:** `cursor/ndxbook-personality-replay-validation-4f59`.

---

## 2026-08-23 — NDX project tunnel entry for personality replay intake

Summary: Founder requested a **project-page button** for blind personality replay intake — same mobile tunnel pattern as lore calibration (`/projects/ndxbook/calibrate`) so they can reach intake directly from the NDX project command page without hunting admin validation URLs.

- **Context:** After replay validation infrastructure (PR #255), blind intake lived at `/validation/ndxbook/replay/:replayId/personality/...` and admin panel only. Founder needed founder-facing tunnel entry from `/projects/ndxbook`.
- **Project routes:** `/projects/:slug/personality-replay`, `/projects/:slug/personality-replay/:stepId`, review at `.../review`. Helpers in `personalityReplayRoutes.ts` + `routes.ts`.
- **Founder API (projects.ts):** `personality_replay_bootstrap|save|complete|get` — NDXBOOK-only, `canAccessFounderProjectAsOwner` guard. Bootstrap uses `getOrCreateActivePersonalityReplay()` to resume in-progress shadow runs or create fresh.
- **UI:** `ProjectPersonalityReplayPage` mirrors `ProjectLoreCalibrationPage` shell (HOW YOU SHOW UP hero, blind intake, review/submit). Hook `usePersonalityReplayIntake` switched from admin evolve API to `site00ProjectsApi` keyed by `projectSlug` with localStorage resume.
- **Project page button:** NDX BOOK **CREATIVE DIRECTION** section on `ProjectDetailPage` — **HOW YOU SHOW UP — PERSONALITY INTAKE →** links to `/projects/ndxbook/personality-replay`.
- **Admin link updated:** `NdxbookPipelineReplayValidationPage` "OPEN BLIND PERSONALITY INTAKE" now points to project tunnel path.
- **Legacy redirect:** `/validation/ndxbook/replay/:replayId/personality/*` routes redirect to project tunnel (no broken bookmarks).
- **Tests/build:** 923 tests pass; `tsc --noEmit` + `npm run build` green.
- **Branch:** `cursor/ndxbook-personality-replay-project-button-4f59`.

---

## 2026-08-23 — Personality replay intake bootstrap fix (stuck on PREPARING)

Summary: Founder reported personality replay page stuck on **"PREPARING PERSONALITY INTAKE…"** on fsbw-dev mobile tunnel.

- **Root cause:** Bootstrap only ran on base route (`/personality-replay`), not on step routes. React Router remounts the page when redirecting to `/personality-replay/:stepId`, and the stepId guard prevented bootstrap from ever firing when localStorage lacked a replay id.
- **Fix:** Auto-bootstrap inside `usePersonalityReplayIntake` whenever ndxbook + no replayId (any route). Resume redirect moved to a separate effect after bootstrap completes. Stale local replay ids cleared on failed reload. TRY AGAIN button on bootstrap errors.
- **Dev resilience:** Replay store falls back to in-memory when Supabase service role or validation migration table is missing (instead of hard 500).
- **Shared:** `resolvePersonalityReplayResumeStepId()` moved to `personalityReadiness.ts` for client + server reuse.
- **Branch:** `cursor/personality-replay-bootstrap-fix-4f59`.

---

## 2026-08-23 — fsbw-dev projects API routing fix (UNKNOWN ACTION on personality intake)

Summary: Founder saw **UNKNOWN ACTION** (uppercase "Unknown action") on personality replay intake on `site00.fsbw-dev.com` after bootstrap fix.

- **Root cause:** `site00ProjectsApi` / `apiFetch` used same-origin `/api` on fsbw-dev preview when `VITE_API_BASE` empty. Vite local API middleware serves **stale** handler code without `personality_replay_bootstrap` — same class of bug fixed for EVOLVE admin API in PR #238.
- **Fix:** Shared `resolveSite00ApiBase()` in `src/utils/site00ApiBase.ts` — fsbw-dev + cloudflare tunnel hosts always use `https://api.site00.com`. Wired into `apiFetch` and `evolveApi` (deduped).
- **Tests:** 3 new in `site00ApiBase.test.ts`. Full regression 926 passing.
- **Branch:** `cursor/fsbw-dev-projects-api-routing-4f59`.

---

## 2026-08-23 — Brand Personality + Primary Expression Context pipeline closure + NDXBOOK naming

Summary: Two follow-up production sprints closed personality pipeline gaps and normalized NDXBOOK canonical naming/uppercase typography before blind personality replay validation.

**Pipeline closure (no reformation, no FAL, no Anthropic creative generation):**
- `FormatNativeExpressionProfile` derived from `BrandExpressionContext` + lore + personality (`formatNativeExpression.ts`) with proof priorities, anti-resize rules, website-first block for social-first
- `BrandVoiceBehavior` derived from personality with format adaptations (`brandVoiceBehavior.ts`)
- `formatLineage` + CES `formatLineage` field wired alongside `personalityLineage`
- Combined readiness resolver (`creativeIntelligenceReadiness.ts`)
- Content Brain personality bridge (`contentBrainPersonalityBridge.ts`) wired into `intelligenceBrief` + formation input
- Formation input extended: `formatNativeExpressionSummary`, `brandVoiceBehaviorSummary`, `contentBrainPersonalitySummary`, `formatLineageSummary`
- DES Sonnet payload receives personality + format summaries
- CES `runCreativeExpressionDirector` accepts upstream personality + expression context; deterministic fallback includes lineage
- Builder: `inheritedBrandPersonalitySnapshot` + `personalityTranslation` synthesis wired in `experienceSynthesis.ts`
- Personality-only calibration: `submitOrgPersonalityCalibration`, `personality_calibration_submit` API, lore calibration merge accepts `personalityAnswers`
- `confirmFounderPersonalityField` API added
- Methodology updated with expression context + format-native doctrine

**NDXBOOK naming + uppercase:**
- `brandIdentity.ts` — `canonicalBrandDisplayName('ndxbook')` → `NDXBOOK`, typography policy, `normalizeBrandPromptContext()`, `brandPromptTypographyBlock()`
- `projectDisplayName` → NDXBOOK (not NDX BOOK)
- CES prompt de-hardcoded NDX BOOK voice; brand-agnostic with upstream personality translation

**Tests:** 17 new in `pipelineClosure.test.ts`; 943 total passing. Build green.

**Known gaps:** Builder translation UI not in BLDR shell; founder personality confirm UI not wired; responsive visual QA not browser-verified this sprint.

**Branch:** `cursor/personality-expression-pipeline-closure-4f59`.

---

## 2026-08-23 — Cloudflare preview tunnel restart

Summary: Founder requested tunnel restart.

- **Symptom:** Public tunnel returned 000; cloudflared logs showed connection failures.
- **Action:** Killed `site00-preview-tunnel` tmux session + `pkill cloudflared`. Relaunched fresh session with `.cursor/scripts/run-site00-preview-tunnel.sh`. Left `site00-vite` running (localhost:5174 already 200).
- **Verified:** Tunnel + Vite both return 200; preview URL refreshed in `/tmp/site00-cloud-preview-url.txt`.

---

## 2026-08-23 — Production prompt normalization + format-proof enforcement (pre-replay closure)

Summary: Closed remaining production-path gaps before NDXBOOK blind personality replay downstream execution.

- **`productionPromptNormalization.ts`** — canonical brand context envelope for all Sonnet stages; `enrichFormationInputPayload`, `enrichDesPayload`, `enrichIdentityArtDirectionPayload`, `enrichHeroConceptPayload`, `buildVisualBriefProductionContext`, `buildIdentityArtDirectorSystemPrompt`
- **`boardProofEnforcement.ts`** — social-first board proof validation; `assertSocialFirstBoardProof` wired into `markedUpCopyBoardPlanV4`
- **`replayProductionPreflight.ts`** — separates `PERSONALITY_REPLAY_INFRASTRUCTURE_READY` vs `PERSONALITY_REPLAY_PRODUCTION_READY`; blocks `buildShadowReplayFormationInput` until all gates pass
- **Wired:** Core Direction (`anthropicProvider`), DES, Identity Art Direction, Hero concept (`primaryProofFormat`), Identity visual brief, GPT Image 2 prompt normalization, board compositor NDXBOOK labels
- **Tests:** 12 new in `productionPromptNormalization.test.ts`; 955 total passing. Build green.
- **Branch:** `cursor/production-prompt-normalization-4f59`.

---

## 2026-08-23 — Personality replay review empty answers fix

Summary: Founder completed personality intake but review showed **NO ANSWERS YET** / **STATUS: CREATED**.

- **Root cause:** `ProjectPersonalityReplayPage` and `PersonalityReplayIntakeStep` each called `usePersonalityReplayIntake()` separately — parent review shell kept empty bootstrap state while child step form held answers. Server reload could also overwrite local answers with empty server payload.
- **Fix:** `PersonalityReplayIntakeProvider` shared context; atomic `advanceStep()` save; merge local+server answers on reload; preserve local cache on reload failure; single bootstrap guard per slug.
- **Branch:** `cursor/personality-replay-review-fix-4f59`.

---

## 2026-08-23 — Personality replay SAVE FAILED · LOAD FAILED on site00.com

Summary: Founder on production **site00.com** saw **SAVE FAILED · LOAD FAILED** on NDXBOOK personality intake step 10/15 after selecting an answer.

- **Root cause:** `site00ProjectsApi` POST calls pass `body: JSON.stringify(...)` into `apiFetch`, which JSON-stringified again. Express body parser rejected the double-encoded payload with HTTP 500 **without CORS headers**. Mobile Safari blocked the opaque cross-origin error → fetch rejected with **"Load failed"** (shown as save error). GET bootstrap worked; every POST save failed.
- **Fix:** `serializeApiFetchBody()` in `src/utils/api.ts` — pass through string bodies; global API CORS middleware in `server/index.ts` so parse/error responses still include `Access-Control-Allow-Origin`.
- **Deploy:** Frontend fix requires new cPanel ZIP; API CORS fix requires Railway redeploy.
- **Branch:** `cursor/personality-replay-save-cors-fix-4f59`.

---

## 2026-08-23 — Personality replay submit button dead on review

Summary: After save fix deployed, founder reached review and **SUBMIT PERSONALITY** appeared to do nothing.

- **Root cause:** Review treated replay status `PERSONALITY_READY` (set by autosave when all domains satisfied) as already submitted — button disabled with label **PERSONALITY SUBMITTED** before `personality_replay_complete` ran. Submit errors were also swallowed with no UI feedback; success navigated to admin-only validation URL.
- **Fix:** Only `FORMATION_READY`+ counts as submitted; submit loading/error state in intake context; visible **SUBMIT ERROR** on failure; success returns founder to project page.
- **Branch:** `cursor/personality-replay-submit-fix-4f59`.

---

## 2026-08-23 — Personality replay SUBMIT ERROR: REPLAY NOT FOUND

Summary: After v3 deploy, founder saw **SUBMIT ERROR: REPLAY NOT FOUND** with **STATUS: CREATED** despite full local answers on review.

- **Root cause:** Supabase table `site00_methodology_validation_runs` was never migrated — Railway API used **in-memory replay store**. Replays vanished on redeploy/restart; phone localStorage kept stale `replayId`. Reload failed silently and fell back to cached answers + CREATED status.
- **Fix:** Applied migration to FS Website Supabase; client `rebindReplayFromLocal()` on replay-not-found (reload/save/submit); API maps Replay not found → 404 REPLAY_NOT_FOUND.
- **Deploy:** Railway redeploy required so API picks up Supabase store; new cPanel ZIP for client recovery.
- **Branch:** `cursor/personality-replay-not-found-fix-4f59`.

---

## 2026-08-23 — Supabase migration audit (FS Website)

Summary: Founder asked if any SITE 00 migrations were missing; agent audited repo `supabase/migrations/` vs production Supabase project **FS Website** (`hyycomvcaqxxvyrfupes`).

- **Missing (now applied):** `site00_methodology_validation_runs`; `site00_marketing_engagements` + `site00_marketing_engagement_events` + `site00_external_production_links`; `site00_marketing_deliverable_links`.
- **Already present:** Other 23 repo migrations (tables/columns/constraints) — applied earlier under alternate migration timestamps.
- **Post-audit:** 105 `site00_*` tables in Supabase; no remaining missing CREATE TABLE objects from repo migrations.
- **Note:** Railway API must redeploy after migration so replay store cache switches from memory → Supabase.

---

## 2026-08-23 — Full session: personality replay production fixes + migration audit + cPanel ZIP convention

Summary: Founder debugged NDXBOOK personality replay on **site00.com** through save failures, dead submit button, replay-not-found, migration gaps, and established a standing deploy workflow.

- **Context:** Production personality intake on mobile showed **SAVE FAILED · LOAD FAILED**, then submit appeared dead, then **SUBMIT ERROR: REPLAY NOT FOUND** with **STATUS: CREATED** despite full local answers.
- **Fixes merged:** PR #263 double-JSON POST body + API CORS; PR #264 submit button treated `PERSONALITY_READY` as already submitted; PR #265 replay-not-found recovery + Supabase persistence.
- **Supabase audit:** Applied missing migrations — `site00_methodology_validation_runs`, marketing engagements (+ events + external links), marketing deliverable links. Other 23 repo migrations already present.
- **Deploy ZIPs published:** v2 (save fix), v3 (submit fix), v4 (replay recovery). Latest before this entry: **v4**.
- **New convention (founder request):** Every agent **conclusion/summary** must **automatically** include a fresh **cPanel deploy ZIP download link** in a **code box** after the text summary — no need to ask. Recorded in `CORE.md` Production deployment section.
- **Still required by founder:** Railway redeploy from `main`; upload latest cPanel ZIP to GoDaddy `public_html`.

---

## 2026-08-23 — Conclusion format: text summary + cPanel code box

Summary: Founder clarified prior agent responses sent **only** the deploy code box; they want **both** every time.

- **Required close format:** (1) normal **text summary** in prose, then (2) **code box** with `=== CPANEL DEPLOY (site00.com) ===`, download link, verify bundle, upload steps.
- **Not:** code-box-only replies; not summary-only when a deploy ZIP is relevant.
- **Updated:** `CORE.md` Production deployment section.

---

## 2026-08-23 — Deploy links sent separately (not one code box)

Summary: Founder copies deploy links **one at a time** on mobile — do not bundle them in a single fenced CPANEL DEPLOY code box.

- **Format:** Text summary in prose, then each link/path on its **own line** (download URL, release page, verify bundle, upload reminder).
- **Not:** One code box containing all links together.
- **Updated:** `CORE.md` Production deployment section.

---

## 2026-08-23 — HOST UI vs CLIENT typography provenance (pre-replay corrective sprint)

Summary of the **whole conversation so far** in this cloud agent run: NDXBOOK blind personality replay blocked on methodology contamination — Martian Mono (SITE 00 host UI font) was leaking into client creative intelligence as if it were NDXBOOK brand typography.

- **Context:** Founder pre-replay corrective sprint before submitting current NDXBOOK personality replay. Must NOT regenerate creative direction, generate images, mutate founder answers, or expose benchmark.
- **Problem:** `martianMonoTypography.ts`, `brandIdentity.ts`, `creativeExpressionService.ts`, V2 visual brief compiler, and production envelopes treated Martian Mono availability in CSS as NDXBOOK typography canon.
- **Solution:** New `typographyProvenance.ts`; refactored pipeline; extended `replayProductionPreflight` typography gates; 980/980 tests pass.
- **Prior session fixes (main):** PR #263–#265 personality replay save/submit/replay-not-found; Supabase migrations; deploy ZIP v5.
- **Conventions:** Separate `TYPOGRAPHIC_BEHAVIOR` from `FONT_SELECTION`. Historical pilot Martian Mono = `HISTORICAL_OUTPUT`, never replay input.

---

## 2026-08-23 — Blind personality replay post-submission execution + resume

Summary of the **whole conversation so far** in this cloud agent run: typography provenance sprint merged (PR #266–#267); founder requested motherboard three-part session close (prose + conclusion code box + deploy links on separate lines); then NDXBOOK blind personality replay post-submission diagnostic + resume sprint.

- **Context:** Founder completed all 15 blind personality questions and pressed SUBMIT — no downstream creative output appeared. Must NOT reset replay, re-ask questionnaire, mutate canonical personality, or expose benchmark before hero.
- **Root cause:** `personality_replay_complete` only called `completeReplayPersonalityIntake()` → status `FORMATION_READY` with **no downstream pipeline**. UI redirected to project page with no execution indicator. Supabase `site00_methodology_validation_runs` had 0 rows — production replay likely on Railway in-memory store (lost on API restart).
- **Fix (PR branch `cursor/personality-replay-execution-resume-4f59`):**
  - `replayExecutionService.ts` — idempotent blind chain: Core Direction → DES → IAD → CES → Hero Concept → Visual Brief → GPT/FAL hero → methodology comparison.
  - Submit auto-dispatches downstream (async in production, awaited in vitest); `personality_replay_execute` + `personality_replay_diagnostic` API actions.
  - Execution phases persisted (`replayExecutionPhases.ts`); founder UI progression panel on review + project detail.
  - Typography: Martian Mono remains HOST_UI excluded; NDXBOOK uppercase casing preserved; font derivation unresolved at replay start.
  - Tests: `personalityReplayExecution.test.ts`, `replayExecutionPhases.test.ts`; **983/983** pass; build green.
- **Motherboard:** `CORE.md` three-part session close confirmed (prose + conclusion code box + deploy links each on own line — URLs **not** inside code box).
- **Founder action:** Railway redeploy from `main` (API execution + Supabase persistence); cPanel ZIP for frontend. After redeploy, re-open replay review — execution should resume same replay idempotently (or bootstrap recovers from local answers if API restarted).

---

## 2026-08-23 — Replay Core Direction formation failure hotfix

Summary: Founder hit **CORE DIRECTION FORMATION FAILED** on mobile replay execution UI after PR #268 deploy.

- **Symptom:** Execution panel showed generic failure at FORMING CORE DIRECTION; STATUS `FORMATION_READY`; RETRY EXECUTION visible.
- **Likely causes:** (1) stale in-progress formation record reused (FORMING with zero `finalDirections` → generic error), (2) `ANTHROPIC_API_KEY` missing on Railway API (`CREATIVE INTELLIGENCE NOT CONFIGURED`).
- **Fix (PR):** `replayExecutionService` — `forceReform: true` + `retryFailed: true` on replay formation; fail-fast if creative intelligence provider unavailable with explicit Railway env message; richer `describeFormationFailure()` errors; clear `executionError` on retry; shadow profile `id` fallback from `sourceProfileId`.
- **Founder action:** **Railway redeploy API from `main`** (required — cPanel ZIP does not fix this). Tap **RETRY EXECUTION** on replay review. If error mentions `ANTHROPIC_API_KEY`, add key to Railway API service env and redeploy again.

---

## 2026-08-23 — Replay pipeline JSON parse hardening (Sonnet truncation)

Summary: Founder hit repeated Sonnet JSON errors during blind replay (`Unterminated string`, `Expected double-quoted property name`) at ~35k char positions — `[FORMATION_FAILED]` and similar across formation / DES / CES / IAD steps.

- **Root cause:** (1) `parseStructuredJson` was bare `JSON.parse` — no repair for truncated/malformed LLM output; (2) Core Direction formation used **8192 max_tokens** while 3-direction payloads exceed that (truncation → unterminated strings); (3) DES/board v4 already had retry loops but formation, critique, revise, CES, IAD, copy gate did not.
- **Fix (PR):** New `structuredJson.ts` with `jsonrepair`, balanced JSON extraction, `isJsonParseError`, `withStructuredJsonRetry`; formation `max_tokens` raised to **16384**; automatic **2-attempt retry** with revision hint on: `anthropicProvider` (form/critique/revise), `creativeExpressionService`, `identityNativeArtDirectorService`, `copyQualityGate`; 988 tests pass.
- **Founder action:** Railway redeploy API from `main`; RETRY EXECUTION on replay (no questionnaire reset).

---

## 2026-08-23 — Founder replay comparison panel on review page

Summary: Founder completed blind replay pipeline; asked where to see results; requested comparison on same page.

- **Gap:** Execution panel showed REPLAY COMPLETE but no hero image or methodology comparison on founder mobile UI.
- **Fix:** `PersonalityReplayComparisonPanel` on replay review + project detail — blind hero image, benchmark hero (post-unlock), convergence scores, personality domain classifications, methodology verdict line. `comparisonReport.benchmarkHeroStoragePath` persisted on comparison. Context reload includes `comparisonReport`.
- **Where to view:** PROJECTS → NDXBOOK → HOW YOU SHOW UP → REVIEW (scroll below execution checklist after REPLAY COMPLETE).
- **Deploy:** PR #271 merged; cPanel ZIP **`site00-deploy-2026-08-23-v9`** — founder hard-refresh review page after upload.

---

## 2026-08-23 — Six-direction blind creative consistency validation sprint

Summary: Founder requested repeatability test — generate other five Core Direction heroes through same blind replay methodology (not Marked-Up Copy clones), audit 0/5 comparison scores, founder six-hero review UI.

- **Pipeline:** `sixDirectionConsistencyService.ts` — preserves validation output #1 hero; shadow formation v2 for directions 4–6; v1 roster + distinctiveness gate; sequential DES→IAD→CES→brief→GPT Image 2 for directions 2–6; first-pass-only (no retry/rescue); contamination audit per direction; cross-direction tests + consistency verdict; comparison scorer audit persisted.
- **0/5 audit:** `creativeConvergence`/`identityConvergence`/`heroConvergence` hardcoded 0 (stubs); personality 0 often from null canonical personality or token-overlap heuristic vs shadow synthesis — not Sonnet comparison.
- **Founder UI:** `/projects/ndxbook/personality-replay/consistency` — six heroes art-first, expandable evidence, LOVE IT / PROMISING / NOT NDXBOOK per direction; link from replay review after COMPARISON_READY.
- **API:** `personality_replay_six_direction_execute`, `personality_replay_six_direction_judgment`. Script: `scripts/runSixDirectionConsistencyValidation.ts`.
- **Action:** Railway redeploy API; founder tap RUN SIX-DIRECTION VALIDATION on consistency page (5 FAL images, sequential).

---

## 2026-08-23 — Six-direction format selection correction (pre-generation)

Summary: Founder blocked six-direction trigger — format rotation/diversity quota violated experimental integrity. Corrected before any generation.

- **Removed:** FORMAT_ROTATION pool, usedFormats tracking, diversity-quota socialApplicability bias.
- **Added:** `directionNativeFormatSelection.ts` — per-direction format derived from thesis/social behavior + FormatNativeExpressionProfile; duplicate formats allowed; `computeObservedFormatDiversity` post-hoc only; `FORMAT_ASSIGNMENT_CONTAMINATION_TEST`; Direction 01 audit (MECHANICAL_PROFILE_DEFAULT vs direction-derived).
- **Comparison UI:** Legacy stub 0/5 labeled LEGACY INVALID COMPARISON; new reports use NOT_EVALUATED for unimplemented scorers (never 0 = unavailable).
- **Preflight:** `buildSixDirectionGenerationPreflight` — no Anthropic/FAL calls.

---

## 2026-08-23 — Six-direction route button on replay review

Summary: Founder asked for a button on replay review to route to six-direction generated heroes page.

- **UI:** Primary button on replay review (below methodology comparison) — `VIEW N GENERATED HEROES` when complete, `SIX-DIRECTION CONSISTENCY REVIEW` when not started, `VIEW SIX-DIRECTION PROGRESS` when in flight. Routes to `/projects/ndxbook/personality-replay/consistency`.
- **Component:** `PersonalityReplayExecutionProgress.tsx` — passes `sixDirectionConsistency` from replay snapshot for dynamic label.
- **Removed:** Duplicate text link on review rail (button replaces it).

---

## 2026-08-23 — cPanel deploy v11 (six-direction route button + comparison UI)

- **Release:** `site00-deploy-2026-08-23-v11` — includes PR #274 comparison UI fixes + PR #275 six-direction route button on replay review.
- **Build fix:** `FormatAssignmentContaminationTest` import in `sixDirectionGenerationPreflight.ts`.
- **Verify:** Review page button → `/projects/ndxbook/personality-replay/consistency`; bundle `index.eRGSgvvl.js`.

---

## 2026-08-23 — Distinctiveness gate non-blocking (clone signal fix)

Summary: Founder six-direction run FAILED at distinctiveness gate — CLONE RISK for THE MARKED COPY vs Marked-Up Copy editorial language.

- **Fix:** Clone signals are observational only (never block generation). Collapse overlap also reported but non-blocking. Removed throw in `sixDirectionConsistencyService`. FAILED runs reset + retry button in UI.
- **Principle:** Convergent directions are valid experimental evidence — gate reports, does not enforce diversity.

---

## 2026-08-23 — Canonical six-direction creative range validation (Experiment B)

Summary: Founder requested correction from blind shadow-formation Experiment A to canonical six-direction creative range validation — generate one first-pass hero per established NDXBOOK direction from canonical formation intelligence, not shadow v1+v2 roster.

- **Experiment A preserved:** `/projects/ndxbook/personality-replay/consistency` — BLIND FORMATION CONSISTENCY VALIDATION; shadow formations; convergence evidence unchanged.
- **Experiment B added:** `/projects/ndxbook/canonical-creative-range` — CANONICAL CREATIVE RANGE VALIDATION; roster from founder comparison set v1 (01–03) + v2 (04–06) via `resolveCanonicalCreativeRangeDirectionsFromFormations()`; hard fail on near-miss names (e.g. THE MARKED COPY).
- **Pipeline:** `canonicalCreativeRangeService.ts` — preflight → per-direction DNA envelope → cross-direction isolation → DES→IAD→CES→brief→GPT Image 2; first-pass only; separate in-memory store `ndxbook-canonical-creative-range`.
- **Preflight:** `buildCanonicalRangeGenerationPreflight` — blocks if roster/palette/typography/format derivation fails; zero image credits until ready. Fixed v1 palette bug: empty `coreColorLogic` must not mask populated `colorLogic` (`firstNonEmpty` in `directionDnaEnvelope.ts`).
- **Tests:** 1019 pass — roster, near-miss, contamination, host font, format rotation, experiment isolation, service integration stub.
- **Founder action:** Merge PR; Railway redeploy API; cPanel v13 for UI; open canonical range page → RUN CANONICAL RANGE VALIDATION (6 sequential heroes). Experiment A and B verdicts must never be mixed.

---

## 2026-08-23 — Canonical range heroes exist in storage; UI stuck on Direction 01

Summary: Founder asked if heroes generated overnight — page showed **GENERATING DIRECTION · DIRECTION 01** with no images.

- **Finding:** All **6 heroes exist** in Supabase storage at `site00/validation/ndxbook/canonical-creative-range/01–06/hero.webp` (HTTP 200 verified). Generation did complete.
- **Root cause:** Run metadata was **in-memory only** on Railway — redeploy wiped state; UI showed stale in-flight status with empty `directions` array.
- **Fix (517570b):** Supabase persistence via `site00_methodology_validation_runs` + `recoverCanonicalRangeRunFromStorage()` on page load to rebuild COMPLETE run from storage.
- **Founder action:** Railway redeploy from `main`; hard refresh canonical range page — six heroes should appear without re-spending credits.

---

## 2026-08-23 — Canonical six same-topic carousel world expansion (Experiment C)

Summary: Founder requested Experiment C — expand each canonical six direction into a 6-slide **CREDIT UTILIZATION** carousel. Experiment B heroes become immutable Slide 01; generate slides 02–06 only (30 new images). Resumable execution, cross-direction isolation, founder carousel + same-slide comparison UI.

- **Experiment C:** `/projects/ndxbook/canonical-carousel-expansion` — `CANONICAL_SAME_TOPIC_CAROUSEL_EXPANSION`; separate Supabase row `c4e1a2b3-0002-4000-8000-000000000001`; never mix with Experiment A/B verdicts.
- **Pipeline:** `canonicalCarouselExpansionService.ts` — preflight requires 6/6 Experiment B covers → `SharedCarouselTopicContext` → per-direction `DirectionCarouselWorldBible` + direction-derived slide roles → GPT Image 2 slides 02–06 with `COVER_INFLUENCE_CONTRACT` (world not layout clone). Modes: `INITIALIZE`, `NEXT_SLIDE`, `REST_OF_CAROUSEL`, `NEXT_CAROUSEL`, `ALL_REMAINING`.
- **Storage:** Covers stay at `canonical-creative-range/01–06/hero.webp`; new slides at `canonical-carousel-expansion/01–06/slide-02..06.webp`.
- **UI:** `CanonicalCarouselExpansionReview` — six world cards, ENTER CAROUSEL WORLD (vertical slides + horizontal preview), SAME SLIDE ACROSS WORLDS comparison, slide + direction founder judgments. Link from Experiment B when complete.
- **Tests:** 28 new tests (23 shared + 5 service); 1050 total pass; build pass.
- **Founder action:** Merge PR; Railway redeploy API; cPanel frontend deploy; open carousel expansion page → INITIALIZE then RUN ALL REMAINING (or step through resumable controls). Experiment B must have 6/6 heroes first.

---

## 2026-08-23 — NDXBOOK creative asset lineage + winning world promotion + salvage system

Summary: Founder requested a 25-phase production sprint to formalize durable creative intelligence for NDXBOOK validation outputs — lineage, winning-world promotion (founder-triggered only), losing-direction salvage, translation engine, content library UI, canon versioning, and full test coverage. No new creative generation; no auto winner selection; no visual system merging.

- **Context:** Stop treating direction-validation outputs as disposable experiments; every asset and concept must carry origin, direction, topic, format, world, version, status, reuse rights, adaptation state, founder judgment, and canon status.
- **Phase 0 — Forensic audit:** `shared/site00-brand-lore/creativeLineage/forensicAudit.ts` documents storage paths (heroes, carousel slides, boards, proofs, pilots), record stores (`site00_methodology_validation_runs` JSONB, formations, ephemeral engagement decisions), ephemeral risks, missing lineage, and idempotent migration plan. Historical JSONB runs are never mutated.
- **Phases 1–18 — Core infrastructure:** Supabase migration `20260823120000_site00_creative_lineage.sql` — `site00_creative_asset_records`, `site00_creative_concept_records`, `site00_content_franchise_records`, `site00_editorial_idea_records`, `site00_creative_families`, `site00_brand_canon_traits`, `site00_brand_canon_state`, `site00_winning_world_promotion_plans`, `site00_launch_seed_sets`. Shared types in `creativeLineage/types.ts`. Logic: `worldTranslationEngine.ts` (`translateConceptIntoWinningWorld`), `contaminationGuard.ts` (`LOSING_WORLD_VISUAL_DNA_CONTAMINATION_TEST`), `salvageClassification.ts` (A–H classes), `canonVersioning.ts` (brand/content canon versions, staleness, publishing readiness, duplicate detection).
- **API:** `api/_lib/site00Evolve/creativeLineage/` — memory + Supabase store adapters, `assetNormalizer.ts` (Experiment B heroes + Experiment C slides, idempotent, skips duplicate slide-01 if hero exists), `creativeLineageService.ts`. Routes: `creative_lineage_forensic_audit`, `normalize`, `library`, `asset_update`, `promotion_plan`, `promote_world`, `salvage_action`.
- **UI:** `/projects/ndxbook/content-library` — `NdxbookContentLibrary.tsx` with LIBRARY / SALVAGE / AUDIT tabs, section filters (ALL, CANONICAL, PRODUCTION CANDIDATES, CAROUSELS, FRANCHISES, CONCEPTS, ADAPTABLE, RETIRED), asset actions (MARK REUSABLE, ADAPTABLE, IDEA ONLY, RETIRE, PROMOTE TO PRODUCTION CANDIDATE). Salvage review per losing direction after winner promotion.
- **Doctrine:** `docs/ndxbook-creative-lineage.md` — validation output may become first live brand content; Brand Canon vs Content Canon separation; trait-level canon promotion requires explicit founder approval.
- **Tests:** 22 tests in `creativeLineage.test.ts` + 2 service tests; 1074 total pass; build pass. All Phase 25 test names covered.
- **Gaps (future):** Normalizer covers Exp B heroes + Exp C slides only (not boards, replay heroes, six-direction consistency yet); engagement founder decisions still ephemeral; translation preview UI (Phase 19 backend exists, no dedicated button); link from project page to Content Library optional.
- **Founder action:** Apply Supabase migration; Railway redeploy API; cPanel deploy for Content Library UI; open `/projects/ndxbook/content-library` → NORMALIZE LINEAGE FROM VALIDATION RUNS; winner promotion and salvage remain founder-controlled — do not auto-trigger.

---

## 2026-08-23 — Experiment C carousel FAILED at slide 02 — brief compiler crash

Summary: Founder reported Experiment C stuck at **FAILED · WORLD 01 / 06 · SLIDE 02 / 06** on fsbw-dev.com; slide 01 (preserved Experiment B cover) visible but generation would not continue.

- **Root cause:** Supabase run error was `Cannot read properties of undefined (reading 'map')`. `canonicalCarouselExpansionService` passed an incomplete stub into `compileIdentityNativeV2VisualBrief` (missing `paletteSystem`, `proprietaryVisualDNA`, etc.). Experiment B heroes run full DES→IAD→CES; Experiment C tried to shortcut and crashed on first new slide.
- **Fix:** `carouselSlideBriefBuilder.ts` builds complete `IdentityNativeArtDirection`, `CreativeExpressionSystem`, and `HeroCreativeConcept` from carousel world bible + DNA envelope. UI now surfaces `run.error` when status is FAILED.
- **Tests:** New `carouselSlideBriefBuilder.test.ts`; service test no longer mocks V2 compiler; 1075 pass.
- **Founder action:** Merge PR; Railway redeploy API; hard refresh carousel page → tap **RUN NEXT SLIDE** (FAILED runs auto-reset on retry). No re-initialize needed unless worlds missing.

---

## 2026-08-23 — Why agents skip three-part session close (root cause + fix)

Summary: Founder reported agents repeatedly omitting copy-paste BLOCK + deploy links despite CORE.md convention (at least third occurrence). Diagnosis and structural fix applied.

- **Root causes:** (1) Close format buried in CORE.md §Production deployment — not in always-applied cursor rules until now. (2) Sprint prompts with their own FINAL CONCLUSION FORMAT compete — agents treat sprint template as entire deliverable and skip deploy links. (3) shipping.mdc ends at "merge PR" with no mandatory close step — completion = git done. (4) Conversation handoffs/summaries drop procedural close requirements. (5) Format evolved 3× in MEMORY same day (code box only → prose+box → links outside box) — inconsistent signal.
- **Fix:** New always-applied `.cursor/rules/session-close.mdc` — checklist: prose + conclusion code box + deploy links each on own line; build ZIP release when UI changes. Updated `shipping.mdc` step 6 and `motherboard.mdc` to reference it.
- **Convention for future sprints:** Sprint CONCLUSION template goes **inside** part 2 code box; deploy links remain part 3 separate lines per CORE.md.

---

## 2026-08-23 — AGENTS.md cloud handoff layer for session close

Summary: Founder asked to close the last gap — Cloud Agent environment instructions only mandated git/PR workflow, not three-part session close. Handoffs dropped close format even after session-close.mdc.

- **Fix:** Repo-root `AGENTS.md` with **Cursor Cloud specific instructions** — motherboard load, git shipping, mandatory three-part session close (mirrors `.cursor/rules/session-close.mdc`), handoff checklist, deploy ZIP/release commands, production split table.
- **Wired:** `CORE.md` agent output contract + `motherboard/README.md` + `docs/MOTHERBOARD_COMMANDS.md` reference AGENTS.md as cloud injection layer.
- **Cursor docs:** Cloud agents read AGENTS.md at session start; complements `.cursor/rules/*.mdc` for handoff-safe procedural requirements.

---

## 2026-08-23 — Founder judgment → brand-scoped lineage wiring

Summary of the **whole conversation so far** in this cloud agent run.

- **Context:** Founder requested wiring Experiment C judgment buttons (LOVE IT / PROMISING REFINE / NOT FOR ME) to the creative asset lineage system with brand-scoped behavior — auto-backup all assets to lineage, NOT FOR ME excludes from NDXBOOK active library without deleting storage (cross-brand portable), LOVE IT marks production candidate without winner promotion, PROMISING REFINE stubs revision notes for future regeneration sprint.

- **Decisions / outcomes:**
  - `brandLineageMembership: ACTIVE | EXCLUDED` on `CreativeAssetRecord` — brand-scoped visibility distinct from global storage preservation.
  - NOT FOR ME → `EXCLUDED`, `crossBrandPortable: true`, removed from launch seed set; blob + record preserved.
  - LOVE IT → `PRODUCTION_CANDIDATE`, `REUSABLE_AS_IS`, auto-added to launch seed set when one exists.
  - PROMISING REFINE → `revisionPending: true`, stays experimental; UI notes detailed revision wiring is future sprint.
  - Auto-sync on carousel slide generation + on judgment tap (Experiment B range heroes too).
  - Content Library hides EXCLUDED from default ALL view; new `EXCLUDED_FROM_BRAND` filter section.

- **Changes:** `founderJudgmentLineage.ts`, `assetRecordBuilders.ts`, `lineageAssetSync.ts`, store `getCreativeAssetById`, carousel/range judgment hooks, library filter + UI hints, tests.

- **Founder next:** Railway redeploy API from `main`; cPanel v15 for judgment lineage UI hints + Content Library EXCLUDED filter.

---

## 2026-08-23 — Carousel slide 02 broken preview (ghost SUCCESS)

- **Symptom:** Experiment C slide 2 preview broken on site00.com; fal.ai shows successful generation in recent history.
- **Root cause:** Run JSONB claims `SUCCESS` + `storagePath` for slide-02, but **no blob** in Supabase `live-preview` bucket (`storage.objects` empty for slide-02; slides 03–04 exist). Likely from slide-02 API crash window — fal billed, upload never persisted. Skip guard treated phantom SUCCESS as done, blocking regen.
- **Note:** fal screenshot "MARGIN ARGUMENT" matches slide **04** role, not slide 02 "ORIGINAL CLAIM".
- **Fix:** `carouselSlideStorageReconciliation.ts` + `site00StorageObjectExists()` — on get/execute, clear SUCCESS slides missing storage → `TRANSPORT_FAILURE` → RUN NEXT SLIDE regenerates + uploads.

---

## 2026-08-23 — Founder creative judgment + surgical revision lineage sprint

Summary of the **whole conversation so far** in this cloud agent run (35-phase sprint).

- **Context:** Formalize LOVE IT / REVISE / NOT FOR ME as operational founder creative decisions with durable judgment history, brand-scoped disposition, Revision Studio UI, delta-based revision compiler, validation gates, and lineage infrastructure — **without** wiring live image regeneration this sprint.

- **Decisions / outcomes:**
  - `FounderCreativeJudgment` + `BrandAssetDispositionRecord` — judgment history append-only; current state on asset + disposition table.
  - LOVE IT → `PRODUCTION_CANDIDATE`, `LOVED` disposition; **no** auto launch seed, **no** auto canon.
  - NOT FOR ME → `REJECTED_FOR_BRAND`, `EXCLUDED` from active NDXBOOK views; storage + lineage preserved; `crossBrandPortable`.
  - REVISE replaces PROMISING REFINE (legacy alias preserved) → opens **Revision Studio**; `CreativeRevisionSpec` with categories, lock/change, severity, asset exchange; `compileCreativeRevision()` delta brief; surgicality + contamination tests; `GENERATION_NOT_YET_ENABLED` gate.
  - Supabase migration `20260823140000_site00_founder_judgment_revision.sql`; memory store fallback for tests.
  - Experiment C: REVISE button + Revision Studio modal; durable judgment on slide tap; judgments during active generation do not alter generation inputs.
  - Content Library filters: LOVED, REVISION_PENDING, REVISED, REJECTED_FOR_BRAND, CANON_REVIEW (rejected hidden from default ALL).

- **Changes:** shared revision/judgment types + compiler/validation/preference evidence; `founderJudgmentRevisionService` + API routes; carousel + library UI; 42+ tests; build passes.

- **Founder next:** Railway redeploy API; cPanel **v16** for Revision Studio + REVISE buttons; apply migration `20260823140000` on Supabase if not applied.

---

## 2026-08-23 — Founder judgment semantics + revision lifecycle integration

Summary of follow-up integration sprint after PR #286 + #288.

- **Context:** Reconcile PR #286 judgment behavior with completed revision architecture; correct LOVE IT semantics; separate creative value / brand disposition / production destiny; connect PROMISING REFINE to Revision Studio without auto-generation.

- **Decisions / outcomes:**
  - Three independent dimensions: `creativeValue`, `brandDisposition`, `productionDestiny` (+ launch seed state).
  - LOVE IT → production candidate only; **never** auto launch seed, canon, or winner.
  - Launch Seed Set requires explicit `FOUNDER_SELECTED` provenance via `creative_lineage_launch_seed_select` API.
  - Historical auto-seed: remove only `AUTO_LOVE_IT_LEGACY` provenance; flag `UNKNOWN` as `LAUNCH_SEED_REVIEW_REQUIRED`.
  - PROMISING_REFINE preserves creative value (not collapsed to REVISE); both open Revision Studio.
  - NOT FOR ME: brand excluded, blob/lineage preserved; `ideaPortabilityEligible` not exact asset cross-brand reuse.
  - Revision child defaults UNREVIEWED; lifecycle events appended on judgment transitions.
  - Content Library: lifecycle disclosure, Revision Studio + explicit launch seed select buttons.

- **Changes:** `assetLifecycleDimensions.ts`, `assetLifecycleEvents.ts`, `launchSeedSemanticsService.ts`, judgment/lineage updates, library UI, 20 integration tests.

- **Founder next:** Railway redeploy API from main; cPanel **v17** for library lifecycle UI; run launch seed reconcile once if historical seed entries exist.

---

## 2026-08-23 — Live surgical revision generation + before/after compliance review

Summary of follow-up sprint replacing `GENERATION_NOT_YET_ENABLED` with founder-triggered live revision generation.

- **Context:** After judgment semantics + revision lifecycle integration (PR #289), enable production-safe surgical revision: explicit approve → GENERATE REVISION → one child asset → compliance comparison → founder judgment. No auto-spend on deploy.

- **Decisions / outcomes:**
  - `revisionGenerationService.ts` — mode resolver (IMAGE_EDIT / REFERENCE_CONDITIONED / PROMPT_REGENERATION), lock conflict preflight, FAL GPT Image 2 edit with parent storage URL, durable upload, immutable child `CreativeAssetRecord`, compliance diff, idempotency.
  - Gate removed: save/compile free; `APPROVED_FOR_GENERATION` required before spend; `COMPARISON_READY` after durable storage.
  - Extended production compiler: hard locks, soft preservation, anti-drift, asset exchanges, world/brand DNA sections.
  - UI: Revision Studio approve + generate + cost notice; `RevisionComparisonReview` before/after with LOVE IT / REVISE AGAIN / NOT FOR ME / SET PREFERRED VERSION.
  - API: `founder_revision_spec_approve`, `founder_revision_generate`, `founder_revision_comparison`, `founder_revision_preferred_version`.
  - Carousel single-slide revision boundary preserved; preferred version on root asset (`preferredRevisionAssetId`).
  - 55+ regression tests; build passes. Deploy: Railway API + cPanel **v18**.

- **Founder next:** Railway redeploy API; cPanel **v18** for Revision Studio generate + comparison UI; first live FAL spend only when founder taps GENERATE REVISION after approval.

---

## 2026-08-23 — Experiment C supersession + Creative Concept Territory architecture (Experiment D ready)

Summary of sprint stopping NDXBOOK Experiment C carousel/world-expansion generation and introducing four-layer creative methodology (Brand Intelligence → Creative Concept Territory → World Expression System → Format Expression).

- **Context:** Experiment C same-topic carousel expansion produced individually strong assets but six directions converged on one parent visual concept (editorial paper, condensed type, lime, correction marks, annotation). Founder requested immediate generation stop, preserve all creative, reform methodology, prepare Experiment D (six hero max, founder-triggered only).

- **Mission A — Supersession:**
  - `SUPERSEDED_BY_METHODOLOGY` terminal status + `CarouselSupersessionRecord` (runId, counts, cost boundary, reason).
  - Auto-supersede active/partial Experiment C runs on `getCanonicalCarouselExpansionRun()`; cooperative `runGuard` before every FAL dispatch; block INITIALIZE/retry/resume/storage reconciliation regen when superseded.
  - Partial carousels valid (`SUPERSEDED_PARTIAL`); existing assets immutable; judgment/revision/lineage preserved.
  - UI: superseded banner, hide RUN ALL/NEXT/RESUME; link to Experiment D.

- **Mission B — Concept Territory:**
  - First-class `CreativeConceptTerritory` + `WorldExpressionSystem` models; deterministic concept-first seeds for canonical six; forensic convergence audit; cousin-pair disentanglement; concept + visual orthogonality gates; cross-world comparison matrix.
  - Experiment D service + store (`c4e1a2b3-0003-4000-8000-000000000001`): `formExperimentDTerritories`, founder-triggered `executeExperimentDHeroGeneration` (max 6 heroes, no auto-start).
  - Route: `/projects/ndxbook/experiment-d-concept-territory`; mobile-first founder review UI.

- **Tests:** 1194 vitest pass; build passes. Deploy: Railway API + cPanel **v19**.

- **Founder next:** Railway redeploy API from main; cPanel **v19** for superseded Experiment C UI + Experiment D review; tap **FORM SIX CONCEPT TERRITORIES** then **RUN SIX CONCEPT TERRITORY HEROES** when ready (max 6 heroes, no carousel expansion).

---

## 2026-08-23 — Founder Creative Appetite + Sequence Creative System methodology (Experiment D frozen)

Summary of follow-up sprint formalizing two Studio World discoveries without contaminating the frozen NDXBOOK Concept Territory experiment.

- **Context:** Brand Personality ≠ Founder Creative Appetite. Multi-frame executions (carousel) need a Sequence Creative System layer between World Expression System and individual frames to prevent accent/palette drift (e.g. Slide 01 sparse lime → Slides 02–06 lime dominant).

- **Founder Creative Appetite:**
  - Canonical `FounderCreativeAppetiteProfile` + 12-question tolerance questionnaire (`founderCreativeAppetite/`).
  - Persisted on `BrandLoreProfile.founderCreativeAppetite`; API `creative_appetite_submit`; UI route `/projects/:slug/creative-appetite` ("HOW FAR CAN WE TAKE IT?").
  - Experiment exclusion: `assertCreativeAppetiteNotInjectedIntoFrozenExperiment(serializedPayload)`; `shouldIncludeCreativeAppetiteInFormation()` gates formation input; NDXBOOK snapshot version 1 frozen.
  - Intelligence inspector payload on `creative_direction` read — separate domains for Personality / Expression Context / Creative Appetite with exclusion banner.
  - Brand wins on conflict (`resolveBrandFounderCreativeConflict`).

- **Sequence Creative System:**
  - `SequenceCreativeSystem` model + anchor capture from Slide 01, palette usage hierarchy, typography/graphic grammar, drift detection, cohesion gate, sequence-native brief compiler, revision lock context.
  - Carousel v2 gate: `CAROUSEL_SEQUENCE_METHODOLOGY_VERSION` — v1 frozen runs unchanged.
  - Lineage extension on `CreativeAssetRecord.sequenceLineage`; intelligence lineage fields for appetite + sequence system id.

- **Tests:** 23 new methodology tests + full suite 1217 pass; tsc + build pass. Deploy: **v20**.

- **Founder next:** Railway redeploy API; cPanel **v20** for Creative Appetite questionnaire + intelligence inspector; Experiment D continues without appetite injection; future carousel v2 uses Sequence Creative System.

---

## 2026-08-23 — Experiment E Experience Expression (NDXBOOK interactive experience direction)

Summary of production sprint extending Studio World so Concept Territory + World Expression can creative-direct interactive digital product experience — not a dashboard facelift.

- **Context:** Founder asked whether the same brand intelligence that forms concepts and social visuals can also direct how an interactive product feels, organizes information, moves, and behaves. NDXBOOK is the controlled benchmark. Experiment D remains frozen (snapshot v1, no appetite injection). World Formation not implemented.

- **Experiment E architecture (`shared/site00-brand-lore/experienceExpression/`):**
  - Readiness gate (`ExperienceExpressionReadiness`) — requires founder-selected Concept Territory (`experienceTestTerritoryId`, `selectionPurpose=EXPERIMENT_E_ONLY`); no auto-select.
  - Three truth layers: Functional Canon (from real routes/ProjectDetailPage), Host Experience Canon (SITE 00 shell/Martian Mono), Client Experience Canon (brand + territory + world with provenance).
  - Generic template resemblance audit on current project home (HIGH card/dashboard resemblance).
  - Three isolated Experience Concepts per selected territory + Experience Bibles + distinctiveness gate + world→experience behavior translation.
  - Visual development architecture: 8 frames/concept (4 surfaces × mobile/desktop), founder-triggered, idempotent; generic dashboard prompt block; contamination guards (Mansion/tarot/brainstorm).
  - Implementation contract compiler + evaluation scaffold (NOT_EVALUATED default) + ExperienceRevisionDelta — no auto-implement.

- **API/UI:** `experimentEService` + memory store; routes `experiment_e_*` in `api/site00/projects.ts`; founder page `/projects/ndxbook/experience-expression`; surface link on NDXBOOK project index.

- **Tests:** 47 new Experiment E tests; full suite **1264** pass; tsc + build pass.

- **Founder next:** Railway redeploy API; cPanel **v21**; open Experiment E → **SELECT CONCEPT TERRITORY FOR EXPERIENCE TEST** → **FORM THREE EXPERIENCE CONCEPTS** → review concepts/bibles → **GENERATE VISUAL DEVELOPMENT** per concept when ready. `READY_FOR_IMPLEMENTATION: false` until founder selects experience concept.

---

## 2026-08-23 — World-class client intake foundation (guest discovery + World Readiness)

Summary of sprint building reusable infrastructure to capture business/founder intelligence before World Formation exists.

- **Context:** Future WORLD-class clients (e.g. immersive commerce) need private guest intake without SITE 00 accounts. No tarot-specific pipeline, no world generation, no avatars/AI characters in this sprint.

- **Architecture (`shared/site00-world-intake/` + `api/_lib/site00WorldIntake/`):**
  - `ProjectExperienceClass` (SITE/APPLICATION/IMMERSIVE_SITE/WORLD/UNRESOLVED)
  - Secure invite tokens (hash-only storage), guest route `/intake/:token`
  - `GuestIntakeSession` server-side autosave/resume
  - Reuses Brand Lore / Personality / Creative Appetite question IDs (no duplicate identity truths)
  - `BusinessOfferingMap`, `WorldReadinessProfile`, `evaluateWorldFormationReadiness()`, `WorldFormationInput`, `WorldIntelligenceSnapshot`
  - Founder world hypothesis = `FOUNDER_PROPOSED_CONCEPT` (not canon)
  - Submit creates snapshot — zero Anthropic/FAL/world generation

- **Admin:** `/admin/site00/client-intakes` — CREATE PRIVATE LINK, COPY, REVOKE, progress + readiness inbox

- **Migration:** `20260823160000_site00_world_intake_foundation.sql`

- **Tests:** 26 new; full suite **1290** pass

- **Founder next:** Railway API redeploy; cPanel **v22**; admin → CLIENT INTAKES → CREATE → copy link to sister. `WORLD_FORMATION_IMPLEMENTED: false`.

---

## 2026-08-23 — World intake foundation shipped (PR merge + Supabase persistence)

- Continued sprint: added `api/_lib/site00WorldIntake/supabaseStore.ts` (auto-select Supabase when tables + service role exist; memory in Vitest); admin CLIENT INTAKES cards with REGENERATE LINK, VIEW INTELLIGENCE, MARK READY; guest WHAT WE HEARD review step before submit.
- Merged to `main` via PR. Tests **1290** pass; build pass.
- Founder: redeploy Railway API, apply migration `20260823160000_site00_world_intake_foundation.sql` if not applied, cPanel **v22**, set `SITE00_PUBLIC_INTAKE_BASE_URL` for correct guest link host.

---

## 2026-08-23 — Experiment E follow-up: cross-medium evidence + snapshot independence

- Corrected Concept Territory dependency: Experiment E no longer requires selected Experiment D territory; `CrossMediumConceptEvidence` classifies evidence (MEDIUM_SPECIFIC / EXPLICITLY_PROMOTED_CROSS_MEDIUM); optional founder promotion only.
- Added `compileExperimentEIntelligenceSnapshot()` (v2 fingerprint independent of Experiment D v1); `buildExperienceConceptsFromSnapshot()` forms 3 concepts from brand intelligence (THE SIGNAL CONSOLE, THE CASE DOSSIER, THE ACTIVE WORKBENCH).
- UI: cross-medium status, snapshot panel, optional PROMOTE evidence, APPROVE FOR VISUAL DEVELOPMENT (founder-triggered).
- Tests **1292** pass; build pass. Experiment D unchanged. Deploy cPanel **v23**.

---

## 2026-08-23 — Experience Asset Direction + FAL pipeline + World Formation future-depth

- Closed methodology gap: Experience Expression now commissions client-native visual materials via generalized **ExperienceAssetDirection → ExperienceAssetRequirement → ExperienceAssetManifest → FAL generation → review → production promotion → Implementation Contract asset bindings**.
- New modules under `shared/site00-brand-lore/experienceExpression/`: `assetDirection.ts`, `surfaceArtDirection.ts`, `assetManifest.ts`, `productionScope.ts`, `assetLifecycle.ts`, `assetQA.ts`, `assetGeneration.ts`. Extended `implementationContract.ts`, `implementationEvaluation.ts`, `types.ts`, `experimentEService.ts`.
- **NDXBOOK proof:** Active Workbench (concept 3) + dossier structural sophistication; literal workshop imagery blocked; founder-trigger-only generation via `experiment_e_generate_asset_visuals`.
- **World Formation:** `shared/site00-brand-lore/worldFormation/futureContracts.ts` — full future pipeline contracts/readiness only; `WORLD_FORMATION_IMPLEMENTED: false`; contamination guards for Mansion/tarot/generic metaverse.
- Admin UI: Experiment E panels for asset direction, manifest, generation cost, vault linkage, world readiness (NOT IMPLEMENTED label).
- Tests **1321** pass (+29 asset direction); build pass. Experiment D v1 frozen; appetite not in D.

---

## 2026-08-23 — Universal Project Workspace + NDXBOOK hero proof

- Methodology correction: **Active Workbench + Dossier** reclassified from NDXBOOK Experience Concept → **SITE 00 PROJECT WORKSPACE CANON** (Experiment E discovery record preserved; historical records immutable).
- Three-layer architecture: Global Host Canon / Project Workspace Canon / Client Project Expression (`shared/site00-brand-lore/projectWorkspace/`).
- **Projects page redesigned** as workspace entry (ON THE BENCH, ACTIVE PIECE, REVIEW TRAY, WORK HISTORY, DOSSIER) — asymmetric hierarchy, no equal-card grid.
- Components: `Site00ProjectWorkspace`, `ProjectWorkspaceEntry`, `ProjectWorkspaceHeroReview`.
- **HeroFrameAssetSubset** — minimum desktop Project Home assets (not full 56-requirement manifest); founder-trigger FAL via `project_workspace_*` API.
- NDXBOOK ClientProjectExpressionProfile — Martian Mono excluded, host/client typography separation, color ownership guards.
- Tests **1351** pass (+30 workspace); build pass. `WORLD_FORMATION_IMPLEMENTED: false`.

---

## 2026-08-23 — Experiment E visual development before implementation (correction sprint)

Summary of follow-up sprint correcting implementation sequence: visual development must precede production page redesign.

- **Context:** Universal Project Workspace sprint correctly discovered methodology (SITE 00 Host → Project Workspace Canon → Client Expression) but prematurely redesigned live `/projects` before founder-approved visual proofs. FAL pipeline existed but was not required gate before Composer implementation.

- **Phase 0 rollback:** Restored baseline `ProjectsPage` (PROJECT INDEX flat list + metrics). Kept all methodology infrastructure: `projectWorkspace/*`, Experiment E discovery records, FAL bridges, hero subset, tests.

- **New architecture (`experienceExpression/`):**
  - `surfaceDesignLifecycle.ts` — `ExperienceSurfaceDesignLifecycle` states + `assertSurfaceApprovedForImplementation()` + `visualDevelopmentSubstantive()`
  - `designProofManifest.ts` — `Site00ProjectsIndexProofManifest` + `NdxbookProjectHomeProofManifest` (small subsets)
  - `designProofArtDirection.ts` — distinct art direction per proof (SITE 00 vs NDXBOOK expression)
  - `experienceAssetFalProvider.ts` — **live FAL path** (`fal-ai/nano-banana-pro`) + composed proof generation; no CSS fallback
  - `designProofImplementationContract.ts` — approved image as first-class implementation reference
  - `projectsIndexFunctionalCanon.ts` — `/projects` functional grounding

- **Service:** `visualDevelopmentService.ts` — founder-triggered generate/compose/judgment/prepare/orchestrate; independent proof approval.

- **Route/UI:** `/projects/ndxbook/experience-expression/visual-development` — `ProjectWorkspaceVisualDevelopmentReview` (large image review, methodology hidden by default). Link from Experiment E page.

- **API:** `visual_development_*` actions in `api/site00/projects.ts`.

- **Gates:** Production presentation blocked until `APPROVED_FOR_IMPLEMENTATION`; approval does not mutate live UI or auto-trigger Composer; `PREPARE IMPLEMENTATION` → contract → `ORCHESTRATE IMPLEMENTATION`.

- Tests **1371** pass (+20 visual development); build pass. Deploy **v24**. `WORLD_FORMATION_IMPLEMENTED: false`. `READY_FOR_IMPLEMENTATION: false` until founder approves generated design proofs.

---

## 2026-08-23 — Canonical image model: GPT Image 2 (not nano-banana-pro)

- Founder directive: use **GPT Image 2** (`openai/gpt-image-2` / `openai/gpt-image-2/edit` via FAL) for visual development and all image generation settings moving forward.
- Added `shared/site00-visual-generation/falImageModels.ts` as single source of truth + `buildFalImageInput()` helper (image_size/quality shape).
- Updated: experience visual development (`experienceAssetFalProvider.ts`), experience asset receipts, ASSTS generation/manifests/canonicalMaster, studio builder default path, email intake manifests, scripts.
- Tests **1374** pass (+3 model tests); build pass.

---

## 2026-08-23 — Visual Reference Intelligence + reference-conditioned design proofs (Experiment E)

Summary of follow-up sprint formalizing automated visual reference intelligence for Studio World / Experiment E visual development.

- **Context:** First SITE 00 Projects Index design proof (Proof A) understood Workbench hierarchy conceptually but generated generic dark sci-fi command-center UI — methodology gap: text Host Canon without actual SITE 00 visual evidence. Founder must NOT manually screenshot SITE 00 for every generation.

- **Core methodology:** Visual Memory ≠ Canon. HOST CANON (semantic) vs HOST VISUAL REFERENCE SET (evidence). Every reference declares authority (STRICT/STRUCTURAL_ONLY/FUNCTIONAL_ONLY/NEGATIVE_ONLY) per dimension (STYLE, COLOR, TYPOGRAPHY, etc.). Reference conflict hierarchy: Functional Canon > Host/Client Canon > approved strict visual > structural > experimental.

- **New module `shared/site00-visual-reference/`:** `VisualReferenceRecord`, `HostVisualMemory`, `ClientVisualMemory`, `VisualCaptureManifest`, `VisualReferencePackage`, selection (`selectVisualReferencesForIntent`), prompt compiler (preserve/ignore/do-not-inherit per reference), contamination guards, provider capability registry (GPT Image 2 edit multi-ref), `resolveVisualGenerationMode()`, staleness, deduplication.

- **Capture service `api/_lib/site00VisualReference/`:** Playwright dynamic import for route capture (desktop 1440, mobile 390); vitest mock path; durable Supabase storage under `visual-references/site00/`; dedup by route+viewport+commit+fingerprint; zero FAL on capture/compile.

- **Integration:** Extended `visualDevelopmentService.ts` — refresh references, compile reference package, classify Proof A as STRUCTURAL+NEGATIVE, child Proof B lineage (`HOST_VISUAL_FIDELITY_FAILURE`), reference-conditioned compose via `composeDesignProofViaFal({ referencePackage })` with strict-host fallback failure (no silent T2I).

- **API:** `visual_development_refresh_references`, `_compile_references`, `_generate_reference_conditioned`, `_exclude_reference`.

- **UI:** `ProjectWorkspaceVisualDevelopmentReview` — VISUAL REFERENCE INTELLIGENCE panel with thumbnails, authority labels, REFRESH/COMPILE/EXCLUDE, GENERATE REFERENCE-CONDITIONED PROOF (founder-triggered; Proof A preserved for A/B).

- **Rules preserved:** Production `/projects` unchanged; NDXBOOK Project Home proof not rerun; World Formation unimplemented; Experiment D frozen; founder manual screenshots not required for SITE 00 routes.

- Tests **1424** pass (+50 visual reference intelligence); build pass. Deploy **v26** pending. `NEW_PROJECTS_PROOF_GENERATED: false` until founder triggers reference-conditioned generation on visual-development route.

---

## 2026-08-23 — Visual development page infinite loading fix

- **Symptom:** `/projects/ndxbook/experience-expression/visual-development` on fsbw-dev appeared broken — stuck on "Loading visual development…" or never reaching content.

- **Root cause:** `ProjectWorkspaceVisualDevelopmentReview` treated `run === null` as loading forever. Any API failure (401/403/503, empty payload) left `run` null with no error state — indistinguishable from in-progress load.

- **Fix:** Added explicit `loading` + `error` states (mirrors `ProjectExperimentEPage` pattern): try/catch on `visualDevelopmentGet`, `finally` clears loading, error panel with RETRY when fetch fails or run missing. CSS for error panel.

- **Note:** Route and page exist on `main`; unauthenticated users still correctly redirect to sign-in via `Site00AccountRouteGuard`. Signed-in failures now surface actionable error instead of infinite spinner.

- **Branch:** `cursor/visual-development-page-load-fix-1983`.

---

## 2026-08-23 — Discovery → Purchase → Project Intelligence Activation

Summary of follow-up architecture sprint separating **pre-purchase discovery** from **post-purchase production intelligence**.

- **Context:** Public Identity/Builder intake was routing visitors into deep Brand Lore, Brand Personality, Experience Expression, and related production-intelligence formation before purchase. Methodology requires: public intake diagnoses the purchase; post-purchase intelligence intake enables the work.

- **Pre-purchase (`shared/site00-project-discovery/`):** `ProjectDiscoverySnapshot`, `ProjectScopeDiagnosis`, `ProjectRecommendation`; identity need diagnosis; builder `ProjectExperienceClass` diagnosis; creative-depth as `DISCOVERY_EVIDENCE` (not Founder Creative Appetite); deterministic question audit (84 questions); handoff/prefill without canonization; `intakeSynthesisGate` blocks lore/experience synthesis on `PRE_PURCHASE_DISCOVERY` provenance.

- **Post-purchase (`shared/site00-project-intelligence/`):** `ProjectCommercialState`, `ProjectIntelligenceIntakeManifest`, module registry mapped to existing calibrate/creative-appetite/world intake routes; scope-derived manifest compiler (SITE/APPLICATION/IMMERSIVE_SITE/WORLD); `evaluateProjectIntelligenceReadiness()` + `assertProjectReadyForFormation()`; manifest fingerprint + scope expansion versioning.

- **API/service:** `api/_lib/site00ProjectIntelligence/` — manifest compile/get; `project_intelligence_manifest_get|compile` on `api/site00/projects.ts`. Legacy NDXBOOK marks BRAND_LORE/PERSONALITY/APPETITE/PRIMARY_EXPRESSION_CONTEXT COMPLETE.

- **Public UX:** Identity/Builder review → `/discovery-result` recommendation panel; lore/personality/experience routes → `PostPurchaseIntelligenceRedirect`. Project setup minimal UI at `/projects/:slug/setup`.

- **Rules preserved:** No duplicate intelligence systems; guest world intake `/intake/:token` preserved; Experiment D frozen v1; World Formation unimplemented; zero provider requests on public discovery autosave.

---

## 2026-08-23 — NDXBOOK Six-Concept Reformation (Experiment F / Concept Territory V2)

Summary of follow-up sprint correcting Creative Concept Territory methodology after founder review found Experiment D's six territories were direction-level clusterings of a shared parent concept, not genuinely orthogonal creative concepts.

- **Context:** Founder review determined Experiment D (CONCEPT_TERRITORY_V1) produced useful experimental evidence but visual/directional distinctiveness ≠ conceptual distinctiveness. Sprint must step methodology back one level: CONCEPT before DIRECTION, without mutating Experiment D, regenerating images, or manually prescribing six replacements.

- **Experiment D preservation:** Non-destructive overlay only — `INSUFFICIENT_AT_CONCEPT_LEVEL`, `DIRECTION_LEVEL_CLUSTERING`, `CONCEPTUAL_ORTHOGONALITY_INSUFFICIENT`; historical six names/records/assets/WES preserved; `experiment_d_get` returns `methodologyOverlay`; UI shows later interpretation banner. Snapshot v1 frozen; Founder Creative Appetite excluded from D.

- **Experiment F successor:** `EXPERIMENT F — SIX-CONCEPT REFORMATION` (`CONCEPT_TERRITORY_V2`, run id `ndxbook-six-concept-reformation`); predecessor EXPERIMENT_D; reason `DIRECTION_LEVEL_CLUSTERING_DETECTED`; topic CREDIT UTILIZATION; brand NDXBOOK; intelligence snapshot v2 with Founder Creative Appetite allowed; blind formation quarantine (`POST_FORMATION_COMPARISON` for old six).

- **New module `shared/site00-brand-lore/conceptTerritoryV2/`:** `CreativeConceptTerritoryV2`, concept-vs-direction gate, orthogonality V2 (conceptual dimensions), shared-parent collapse detector, concept family analysis, evidence quarantine, intelligence snapshot compiler, Creative Concept Director Sonnet prompt, historical comparison post-formation.

- **Service/API:** `api/_lib/site00Evolve/creativeDirection/conceptTerritoryV2Experiment/` — `formSixConcepts()` (0 GPT Image / 0 FAL), idempotent formation, reformation versioning; actions `experiment_f_get|prepare_snapshot|form_concepts|concept_judgment|reform_set`.

- **UI:** Route `/projects/ndxbook/experiment-f-six-concept-reformation`; `ExperimentFSixConceptReformationReview` — FORM SIX CONCEPTS, concept cards, founder judgments, RE-FORM SET, post-formation Compare with Experiment D. Experiment D links to F successor.

- **Hierarchy formalized:** BRAND → CONCEPT TERRITORY → DIRECTION → WORLD EXPRESSION → FORMAT → SEQUENCE → ASSET. No WES/format/sequence/asset creation during formation.

- **Tests:** `sixConceptReformation.test.ts` (+28 grouped cases covering immutability, snapshot, quarantine, gates, generation boundary); full suite **1508** pass; build pass.

- **Parallel work untouched:** Experiment E, Projects UX, intake architecture, World Formation unimplemented.

- Deploy **v28** (`site00-deploy-2026-08-23-v28`). `SIX_NEW_CONCEPTS_FORMED: false` until founder triggers FORM SIX CONCEPTS on production API.

---

## 2026-08-23 — Master Assurance Audit (Studio World architecture)

Summary of read-only end-to-end audit sprint — no large remediation performed.

- **Context:** Founder requested deepest audit of SITE 00 / Studio World: architecture, methodology, pipeline, experimental integrity, future readiness. Audit-first; diagnose; recommend only.

- **Key findings (P0):** Critical production state in ephemeral memory stores (Experiment E, visual development, project intelligence, visual reference memory); 1508 tests mock-heavy (false readiness risk); MEMORY.md merge conflict resolved during audit; Experiment F silent Supabase→memory fallback.

- **Key findings (P1):** Composer orchestration stub (packageId only); implementation fidelity evaluator scaffold (NOT_EVALUATED); reference-conditioned FAL + Playwright capture never live-verified on Railway.

- **Coherence verdict:** Several sophisticated subsystems (Brand Lore Supabase, discovery gates, Experiment D/F integrity, visual reference contracts, workspace canon) — but **not yet one coherent operational product** due to persistence and live-verification gaps at the Experience→Implementation boundary.

- **Artifacts:** `audit/SITE00_STUDIO_WORLD_MASTER_ASSURANCE_AUDIT.md` + JSON inventories (findings, readiness, dependency graph, remediation roadmap, live-verification gaps).

- **Recommended next action:** Durable Run Persistence Sprint (P0) before treating any creative run as research-grade or ops-ready.

---

## 2026-08-23 — P0 Durable Run Persistence + Execution Truth

Summary of production-hardening sprint addressing MA-001 and related P0 audit findings.

- **Context:** Master Assurance Audit identified ephemeral memory stores for Experiment E, visual development, project intelligence, and visual reference as CRITICAL (API restart = operational amnesia). Sprint goal: durable Supabase-backed execution layer without redesigning methodology.

- **Execution truth layer:** `shared/site00-studio-world-execution/` — `StudioWorldRunRecord` types, normalized statuses, failure taxonomy, `resolveDurableStoreMode()` fail-loud policy (`PRODUCTION_DURABLE_REQUIRED` / explicit dev fallback only with `SITE00_ALLOW_MEMORY_FALLBACK=1`).

- **Supabase migration:** `20260823200000_site00_studio_world_execution.sql` — `site00_studio_world_runs`, idempotency keys, project intelligence manifests, visual reference state/records, visual development runs, capability verifications; version columns on methodology validation runs + founder judgments.

- **Store migrations:** Experiment E gained `supabaseStore.ts` + fail-loud adapter; Experiment F/D, creative lineage, founder judgment adapters now fail loud (Brand Lore pattern). Project intelligence, visual reference, visual development gained durable store adapters.

- **Orchestration truth:** `orchestrateVisualDevelopmentImplementation` returns `ORCHESTRATION_NOT_CONNECTED` + `orchestrationDispatched: false` — no false completion claims.

- **Admin visibility:** `?action=studio_world_execution_debug` on projects API lists durable runs + capability verification registry.

- **Forensic inventory:** `audit/persistence-forensic-inventory.json` (12 stores classified).

- **Tests:** `durablePersistence.test.ts` (+restart/idempotency/multi-instance simulation); **1535** pass; build pass. Live Supabase restart test reports `DURABLE_RESTART_VERIFICATION_NOT_EXECUTED` when `SITE00_DURABLE_INTEGRATION_TEST` unset.

- **Untouched:** Experiment D snapshot, Experiment F methodology, World Formation, Product Expression, Composer dispatch implementation.

- **Apply migration on Supabase** before production deploy expects durable paths.

---

## 2026-08-23 — Railway API crash: falImageModels import path

- **Symptom:** Railway production deploy failed on boot with `ERR_MODULE_NOT_FOUND: Cannot find module '/shared/site00-visual-generation/falImageModels.js'` imported from `api/_lib/studioBuilderGeneration.ts`.

- **Root cause:** Static import used `../../../shared/...` from a file directly under `api/_lib/` (only two hops to repo root). Node resolved to filesystem `/shared/...` instead of `/app/shared/...`.

- **Fix:** Corrected to `../../shared/site00-visual-generation/falImageModels.js` (dynamic import on line 288 was already correct).

- **Verification:** `node --import tsx` import of `studioBuilderGeneration.ts` succeeds; `npm run start:api` boots; **1535/1535** tests pass.

- **Branch:** `cursor/railway-fal-import-path-fix-1983` → PR #308 merged to `main`.

---

## 2026-08-23 — Supabase migration audit + cPanel v29 deploy bundle

- **Context:** Founder asked to apply missing Supabase migrations and receive cPanel direct download link after Railway build failures.

- **Migration audit:** Compared repo `supabase/migrations/*site00*` against Supabase project `hyycomvcaqxxvyrfupes`. Four migrations were missing on production DB.

- **Applied via Supabase MCP:**
  1. `site00_creative_lineage` — creative asset/concept/franchise/canon tables
  2. `site00_founder_judgment_revision` — founder judgments, dispositions, revision specs
  3. `site00_world_intake_foundation` — intake invites, guest sessions, intelligence snapshots
  4. `site00_studio_world_execution` — studio world runs, idempotency, visual reference/development runs, capability verifications (unique index on visual_reference_state uses expression index, not inline coalesce constraint)

- **Verified tables:** `site00_intake_invites`, `site00_studio_world_runs`, `site00_visual_development_runs`, `site00_visual_reference_*` present.

- **Deploy:** GitHub Release **`site00-deploy-2026-08-23-v29`** — bundle `index.DdnO_yFh.js`. Railway should auto-redeploy from merged PR #308 import fix.

- **Founder next:** Upload v29 ZIP to GoDaddy `public_html`; confirm Railway API healthy at `/api/health`; hard-refresh mobile.

---

## 2026-08-23 — P0.5 Production Methodology + Automation Assurance Audit

Summary of read-only forensic audit — no large remediation, no Product Expression, no World Formation.

- **Context:** After P0 durable persistence (PR #307), founder requested deeper audit: *Is the factory process itself correct?* Not existence/connectivity — methodological correctness per production discipline.

- **Verdict:** Studio World is a **constellation of sophisticated pipelines**, not yet a coherent **Production Operating System**. GRAPHIC→PAGE branch strongest; PAGE→PRODUCT→WORLD mostly contracts or absent.

- **Largest methodology risk:** Hero proof → full site bridge missing — without page families/layout grammar, Composer would become creative director for remaining pages (FM-02, FM-03).

- **Largest automation risk:** No formal dependency invalidation graph — P0 durability means stale READY states can persist durably after upstream intelligence changes.

- **Product Expression:** Correctly unimplemented; intake modules exist but no formation pipeline — APPLICATION projects would be forced through page/experience metaphors.

- **Identity gap:** No Identity Concept Territory — risk of Brand Intelligence → Style without concept layer.

- **Content gap:** No topic strategy, calendar, campaign engine — cannot operate ongoing content engine.

- **Experience repositioning:** Too page-centric/visual-metaphor; should own behavior/IA, not site architecture.

- **World:** Contracts useful research; missing blocker domains (presence, economy, moderation, sync); runtime correctly blocked.

- **Artifacts:** 13 new files under `audit/` including `production-system-inventory.json`, maturity matrix, pipelines, actor matrix, dependency/quality/gate analyses, failure modes, remediation roadmap P0.5A–P4, `studio-world-production-operating-model.md`.

- **Tests:** `audit/p0.5MethodologyAudit.test.ts` (+13); **1564** pass; build pass.

- **Recommended next:** P0.5A methodology spec sprint (invalidation graph, site page families, Product Expression boundary doc, Identity Concept Territory spec) before P1 live pipeline + Composer adapter.

---

## 2026-08-23 — P0.5A Production Methodology Corrections

Summary of minimum methodology corrections before P1 — dependency invalidation, site page families, experience scope, identity concept territory.

- **Context:** After P0 (durable execution truth, PR #307) and P0.5 read-only audit (PR #309), founder requested P0.5A sprint to formalize four missing layers without implementing Composer, Product Expression, World Formation, or live Anthropic/FAL dispatch.

- **Deliverables:**
  - New module `shared/site00-studio-world-production/` — dependency graph (`StudioWorldDependencyGraph`, `ProductionDependencyEdge`, `ProductionInvalidationEvent`), `resolveDownstreamInvalidation()`, `computeEffectiveReadiness()`, frozen experiment protection, site production models (Strategy → Architecture → IA → Page Inventory → Page Families → Surface Briefs → Coherence → Readiness), experience scope correction + concept-vs-layout + metaphor-behavior gates, identity concept territory + evaluators, hybrid `SemanticConceptSetAudit` contract, `ProductionOrchestrationPolicy` scaffold, P1 preconditions.
  - Supabase migration `20260823210000_site00_production_invalidation.sql` — durable `site00_production_invalidation_events` + `site00_production_dependency_edges`.
  - Seven audit artifacts: `audit/p0.5a-*.json`.
  - Tests: `shared/site00-studio-world-production/p0.5aMethodologyCorrections.test.ts` (47 tests); **1611** total pass; build pass.

- **Key methodology conclusions:**
  - Hero proof = directional north star, NOT full site spec; representative family proofs bridge to implementation.
  - Experience Expression corrected: owns interaction/information behavior; does NOT own site route inventory or IA.
  - Identity pipeline formalized: Intelligence → Identity Concept Territories → Direction → System → Production → Guidelines.
  - `READY_FOR_P1 = false` — methodology trustworthy but Composer not connected; P1 wires contracts into live orchestration.
  - Product Expression and World Formation remain unimplemented; Experiment D/F/E history preserved.

- **Branch:** `cursor/p0.5a-methodology-corrections-4f59` → PR merge to `main`.

- **Apply migration on Supabase** before production expects durable invalidation event persistence.

---

## 2026-08-23 — Visual development Supabase store bugs (three errors on site00.com)

- **Symptoms on `/projects/ndxbook/experience-expression/visual-development`:**
  1. `INVALID INPUT SYNTAX FOR TYPE UUID: "NDXBOOK"` — slug written to `project_id` UUID columns
  2. `DUPLICATE KEY … site00_visual_reference_state_scope_slug_uid` — concurrent/racy HOST/CLIENT state insert
  3. `VISUAL DEVELOPMENT UNAVAILABLE` — `run_id` mismatch (`get` used `ndxbook-visual-development`, save used `project-workspace-visual-development`)

- **Root causes:** No `site00_projects` row for slug `ndxbook`; visual reference store passed client slug as UUID; visual development Supabase get/save used different run_id constants.

- **Fix:** `founderProjectDbId.ts` (`ensureFounderProjectDbId`); aligned `DEFAULT_RUN_ID`; resolve UUID for visual development + client visual reference saves; duplicate-key retry on reference state upsert.

- **DB:** Seeded `site00_projects` row for `ndxbook` (`89a0eb4f-b4e6-4951-aa60-45973b47aa2a`).

- **Founder next:** Railway redeploy API from `main`; hard-refresh visual development page → RETRY.

---

## 2026-08-23 — NDXBOOK Experiments Hub (single methodology index)

- **Context:** Founder tired of hunting scattered experiment routes across the NDXBOOK project surface.

- **Added:** `/projects/ndxbook/experiments` — **Experiments & Validation Hub** listing all intake steps, Experiments A–F, Experience Expression + Visual Development, and Content Library in recommended order with phase groupings.

- **Navigation:** `ProjectExperimentsHubNav` on every methodology page — EXPERIMENTS HUB + sequential prev/next links.

- **Project page:** Red banner CTA near top of `/projects/ndxbook` — **EXPERIMENTS & VALIDATION HUB →**

- **Config:** `src/site00/config/projectExperimentsHub.ts` (canonical ordered ordered index).

---

## 2026-08-23 — P1 Live Visual Pipeline + Contract-Driven Composer Orchestration

Summary of P1 controlled production proof sprint for SITE00_PROJECTS_INDEX.

- **Context:** After P0 (durable runs), P0.5 audit, and P0.5A methodology corrections, founder requested P1 to prove one real contract-driven production loop: approved visual proof → page-family contract → surface contract → Composer dispatch → capture → fidelity → founder review — without whole-site scale, Product Expression, or World Formation.

- **Deliverables:**
  - New module `shared/site00-studio-world-production/p1/` — precondition audit, site methodology snapshot, P1 contract compilation (page-family + surface + experience brief), dispatch safety gates, Composer adapter + `ComposerImplementationPackage`, budget guard, accessibility MVP, functional preservation checks, hybrid fidelity evaluator, implementation revision delta, capability registry updates, orchestration service.
  - Wired `orchestrateVisualDevelopmentImplementation('SITE00_PROJECTS_INDEX')` to P1 dispatch (returns DISPATCHED in test path; blocks without approved proof / mobile policy / stale fingerprints).
  - `COMPOSER_ORCHESTRATION_IMPLEMENTED = true`; `READY_FOR_P1 = true`.
  - Audit: `audit/p1-controlled-proof-spec.json`.
  - Tests: `shared/site00-studio-world-production/p1/p1ControlledProof.test.ts` (27 tests); **1665** total pass; build pass.
  - Dev dependency: `playwright` (capture service already referenced it).

- **Honest live status:** PRODUCTION_VERIFIED not claimed for Playwright capture, reference-conditioned FAL, Composer live dispatch, or fidelity — infrastructure TEST_VERIFIED only. Founder must review live reference-conditioned SITE00_PROJECTS_INDEX proof before implementation proceeds in production.

- **Controlled target:** SITE00_PROJECTS_INDEX (`/projects`), page family PROJECT_WORKSPACE only — no NDXBOOK home, no whole-site automation.

- **Branch:** `cursor/p1-composer-orchestration-4f59` → PR merge to `main`.

- **Founder next:** Review visual development proof at `/projects/ndxbook/experience-expression/visual-development`; LOVE THE DIRECTION before Composer implementation branch; Railway redeploy after merge; live Playwright + FAL verification in deployed environment when ready.

---

## 2026-08-23 — Experiment G missing from Experiments Hub

- **Issue:** Founder on site00.com Experiments Hub saw 07 D → 08 F → 09 E with no Experiment G, despite G route/API existing from Brand Presentation correction (PR #314).
- **Cause:** `projectExperimentsHub.ts` never listed Experiment G — only F and E.
- **Fix:** Added hub entry **09 / EXP G — Brand Presentation Concepts** between F and E; updated F description/status to content-concept historical; renumbered E + Content Library.
- **Direct URL (works even before hub deploy):** `/projects/ndxbook/experiment-g-brand-presentation-concepts`

---

## 2026-08-23 — Experiment G still missing on live site00.com (deploy gap)

- **Context:** Founder reported "still doesn't exist" after hub fix (PR #316) and v31 release — Experiment G not visible on production site00.com.
- **Root cause:** Live GoDaddy bundle is **stale**. Production serves `index.XTPjkzI0.js` with **zero** matches for `experiment-g-brand-presentation` or `ProjectExperimentGPage`. Code on `main` is correct; founder has not successfully uploaded v31+ to cPanel `public_html`.
- **Additional UX fix (PR #317):** Direct **EXPERIMENT G** button on NDXBOOK project detail; red banner on Experiment F page linking to G (F = content concepts, G = brand presentation).
- **Deploy:** GitHub Release **`site00-deploy-2026-08-23-v32`** — bundle `index.BCBpJVeK.js`, includes `ProjectExperimentGPage` chunk. Verify: view page source → search `experiment-g-brand-presentation`. If absent, delete old public_html files and re-extract ZIP.
- **Direct URL after deploy:** `https://site00.com/projects/ndxbook/experiment-g-brand-presentation-concepts`
- **API:** Railway must have `experiment_g_*` endpoints from main for FORM SIX BRAND PRESENTATION CONCEPTS.

---

## 2026-08-23 — Experiment G FAILED with no retry button

- **Issue:** After v32 deploy, founder reached Experiment G but saw STATUS: FAILED with "No concepts formed yet" and **no buttons** to restart.
- **Cause:** UI only showed FORM when status was NOT_STARTED or SNAPSHOT_READY; FAILED with zero concepts hid all controls (RE-FORM SET also required concepts.length > 0).
- **Fix (PR #318):** Show **RETRY FORMATION** on FAILED; surface `run.error`; mirror Experiment F refresh/re-form when concepts exist.
- **Deploy:** **`site00-deploy-2026-08-23-v33`**. If retry still fails, read red error line — likely Railway API needs redeploy for `experiment_g_*` or Anthropic/formation error.

---

## 2026-08-23 — Experiment G quarantine false-positive (journal)

- **Issue:** RETRY FORMATION failed with `Successor formation quarantine blocked: journal` on fsbw-dev / production API.
- **Cause:** Output quarantine blocklist included generic editorial words (journal, notebook, archive, etc.). Model output often mentions these in negation (`not a journal`) or incidental copy — hard-failing entire formation.
- **Fix (PR #319):** `SUCCESSOR_FORMATION_OUTPUT_BLOCKLIST` now only hard-blocks historical/topic contamination (credit utilization, Experiment D/F names, Burn Book). Editorial artifact vocabulary stays in post-formation evaluators only.
- **Deploy:** **Railway redeploy from main** (api.site00.com) — API-side fix; cPanel static bundle unchanged. Then RETRY FORMATION on Experiment G.

---

## 2026-08-23 — NDXBOOK Hero Proof no preview after compose

- **Issue:** Experiment E → NDXBOOK Hero Proof — COMPOSE HERO FRAME finished but no preview image below controls.
- **Cause:** `composeNdxbookHeroFrame` was stub-only (saved storagePath, no FAL image). UI showed path in collapsed details, no `<img>`.
- **Fix (PR #320):** Generate + compose call FAL; `heroComposition.publicUrl`; full-width preview below buttons.
- **Deploy:** cPanel **v34** + **Railway redeploy** (FAL_KEY required for live images).

---

## 2026-08-23 — Hero proof blocked: Experiment E run required

- **Issue:** fsbw-dev hero proof showed FULL MANIFEST HAD 0, missing assets, error `Experiment E run required for hero asset lineage` on generate.
- **Cause:** Experiment E never formed/persisted — hero subset compiled without PROJECT_HOME manifest requirements.
- **Fix (PR #321):** `ensureExperimentEHeroPrerequisites()` auto-forms E + compiles Active Workbench manifest; **PREPARE EXPERIMENT E + HERO SUBSET** button in UI when manifest count is 0.
- **Deploy:** v35 static + Railway redeploy.

---

## 2026-08-23 — Experiment G stuck on FORMING (not background processing)

- **User question:** Brand concepts still say FORMING after a long time — still processing?
- **Answer:** **No.** Experiment G formation is **synchronous** (single Anthropic call, ~2–5 min). Status `FORMING` saved at start; if the Railway request times out, client disconnects, or the process crashes mid-call, the record stays `FORMING` forever with no background worker to finish it.
- **Fix (PR #322):** Stale `FORMING` records older than 10 minutes auto-reconcile to `FAILED` on GET; `formationStartedAt` tracked on enter; **RETRY STALLED FORMATION** button + clearer UI copy; `forceRetry` API flag to restart without waiting.
- **Deploy:** Railway redeploy (API) + cPanel **v36** (UI). Refresh page → stale FORMING becomes FAILED → RETRY.

---

## 2026-08-23 — Hero PREPARE UUID error (`ndxbook` slug in FK column)

- **Issue:** `INVALID INPUT SYNTAX FOR TYPE UUID: "NDXBOOK"` on **PREPARE EXPERIMENT E + HERO SUBSET** (fsbw-dev screenshot).
- **Cause:** `site00_methodology_validation_runs.project_id` is a UUID FK; Experiment E (and other methodology stores) wrote `run.projectId` = founder slug `'ndxbook'` directly to Postgres.
- **Fix (PR #323):** `resolveProjectDbIdForSupabaseFk()` in `founderProjectDbId.ts` — resolves slug → `site00_projects.id` before insert. Wired into Experiment E, Core Direction formation, personality replay, project intelligence, studio world, visual reference stores.
- **Deploy:** **Railway redeploy from main only** — API-side fix; static bundle unchanged. After deploy, tap **PREPARE EXPERIMENT E + HERO SUBSET** again.

---

## 2026-08-23 — P1 Correction: reference-locked UX orchestration + asset-level generation

- **Context:** Founder-triggered Projects UX generation in FAL ran `openai/gpt-image-2` TEXT_TO_IMAGE and invented a dark workbench/dossier UI — image model was acting as interface designer instead of asset generator.
- **Root cause:** Proof A path by design used unconstrained TEXT_TO_IMAGE full-page compose when reference URLs absent; Visual Reference Intelligence was optional on first pass; methodology treated "workbench/dossier" as visual style instructions.
- **Fix (branch `cursor/p1-generation-boundary-correction-4f59`):**
  - **`SurfaceGenerationMode`** — `SITE00_PROJECTS_INDEX` → `COMPOSED_INTERFACE`; `NDXBOOK_PROJECT_HOME` stays `VISUAL_PROOF` while visual direction unresolved.
  - **Full-page guard** — `assertFullPageGenerationAllowed()` blocks COMPOSED_INTERFACE; `generateVisualDevelopmentDesignProof` throws `FULL_PAGE_GENERATION_NOT_ALLOWED_FOR_COMPOSED_INTERFACE`.
  - **New pipeline** — `prepareComposedInterfaceSurface` → `generateMissingInterfaceAssets` (asset-level FAL only); `SurfaceVisualAuthorityPackage`, `InterfaceAssetManifest`, `VisualGenerationExecutionTrace`.
  - **Behavior translation** — workbench/dossier/active piece/review tray compiled to behavioral instructions; metaphor leakage sanitization on provider prompts.
  - **Reference fail-loud** — strict host conditioning blocks silent TEXT_TO_IMAGE fallback; reference pipeline statuses formalized.
  - **Composer** — dispatch gates accept COMPOSED_INTERFACE evidence (authority package + assets, not composed proof image); Composer assembles, does not invent host shell.
  - **UI** — visual-development review shows COMPOSED_INTERFACE mode, reference status, CAPTURE/PREPARE/GENERATE MISSING ASSETS (replaces Generate Design Proof for Projects Index).
  - **25 regression tests** in `p1GenerationBoundaryCorrection.test.ts`; updated legacy design-proof and visual-reference tests.
- **Constraints honored:** No `/projects` production mutation; no new Projects design proof generated during sprint; World Formation blocked; Experiment D/F/G untouched.
- **Deploy:** Railway redeploy (API) + cPanel static **v37+** for visual-development UI. Founder flow: CAPTURE/REFRESH REFERENCES → PREPARE INTERFACE → GENERATE MISSING ASSETS → PREPARE IMPLEMENTATION → ORCHESTRATE (Composer).

---

## 2026-08-23 — Experiment G background formation job

- **Issue:** Experiment G formation ran synchronously inside the HTTP request (~2–5 min Anthropic call), causing Railway/gateway timeouts and stuck `FORMING` status.
- **Fix:** `formSixBrandPresentationConcepts` now sets `FORMING`, returns immediately, and runs Anthropic formation via `queueMicrotask` on the server (same pattern as creative-direction production jobs). Vitest still runs synchronously for tests.
- **UI:** Experiment G page polls every 5s while `FORMING`; copy updated to say background job — safe to leave page.
- **Stale guard:** Extended to 15 minutes before auto-FAILED on orphaned `FORMING`.
- **Deploy:** Railway redeploy (API) + cPanel static for Experiment G UI polling copy.

---

## 2026-08-23 — Visual development blank page fix (legacy proof hydration)

- **Issue:** `/projects/ndxbook/experience-expression/visual-development` white blank page on tunnel and deployed site after P1 correction deploy.
- **Cause:** Persisted Supabase proofs predating P1 lacked `surfaceGenerationMode`, `referencePipelineStatus`, `proofLineage`, etc. UI called `.replace()` on undefined → React crash.
- **Fix:** `hydrateSurfaceDesignProof` / `normalizeVisualDevelopmentRun` on API load; defensive optional rendering in `ProjectWorkspaceVisualDevelopmentReview`.
- **Deploy:** Railway redeploy + cPanel **v39** static bundle.

---

## 2026-08-23 — Experiment G formation corruption fix (stall beyond background job)

- **Context:** Founder reported brand formation still stalling/timing out even after PR #325 background-job change; suspected another process corrupting formation.
- **Root causes identified:**
  1. **`activeFormationRuns` Set blocked retries** — hung first worker left run in `FORMING`; `forceRetry` enqueued a new worker that immediately exited because runId was still "active".
  2. **No Anthropic fetch timeout** — hung HTTP requests left status `FORMING` indefinitely.
  3. **UI always called `prepareSnapshot` before form** — reset status to `SNAPSHOT_READY` mid-formation, clobbering in-progress work.
  4. **Superseded workers could overwrite state** — old background worker completing after retry/reform wrote stale results.
  5. **No resume on poll** — if worker died (process restart), `FORMING` persisted until 15-min stale guard.
  6. **Experiment G Supabase store** still wrote `project_id: null` / slug instead of resolved UUID FK (same class of bug as PR #323).
- **Fix (branch `cursor/experiment-g-formation-corruption-fix-4f59`):**
  - Replaced `activeFormationRuns` with `activeFormationAttempts` Map + `formationAttemptId` UUID per formation start; workers verify attempt before save.
  - `prepareExperimentGSnapshot` throws `SNAPSHOT_BLOCKED` when status is `FORMING`.
  - `maybeResumeFormation()` on GET re-enqueues after 45s if no active worker for that attempt.
  - Anthropic formation timeout 8 minutes via `AbortSignal.timeout`.
  - `enqueueBrandPresentationFormationWork` uses `setImmediate` (not `queueMicrotask`).
  - UI skips redundant `prepareSnapshot` when snapshot already exists.
  - Experiment G Supabase store uses `resolveProjectDbIdForSupabaseFk`.
  - Extended tests in `experimentGStaleForming.test.ts` (8 cases).
- **Deploy:** Railway redeploy (API) + cPanel static for UI skip-prepare fix.

---

## 2026-08-23 — Visual development FAL failure (storage already exists)

- **Context:** Founder screenshot on visual development page — `GENERATION_FAILED — ONE OR MORE FAL ASSET GENERATIONS FAILED` for SITE00 Projects Index composed interface (5 missing FAL assets, MOBILE PROJECTS BASELINE reference surface). Separate from Experiment G formation.
- **Root cause (Supabase):** FAL generation succeeded but **Supabase storage upload failed** with `Storage upload failed: The resource already exists` on all 5 deterministic paths (`site00/visual-development/site00_projects_index/*-desktop.webp`). Retries re-called FAL then failed again on upload because `uploadSite00AssetBuffer` did not use `upsert: true`.
- **Fix (branch `cursor/fal-asset-storage-upsert-fix-4f59`):** Reuse existing storage objects before calling FAL; upload with `upsert: true` on regeneration; clearer error detail in API + per-receipt failure list in UI; test `experienceAssetFalStorage.test.ts`.
- **Founder action:** Railway redeploy, then tap **GENERATE MISSING ASSETS** again — should reuse existing files or overwrite without failing.

---

## 2026-08-23 — CAPTURE REQUIRED but no real captures (Playwright missing on Railway)

- **Context:** fsbw-dev shows **CAPTURE REQUIRED** labels (PR #331 UI) but reference thumbnails still empty after refresh — only cosmetic change landed.
- **Root cause:** `playwright` was in **devDependencies**; Railway production never installed it. Capture failed silently; API kept compiling packages from seed refs with placeholder URLs.
- **Fix (PR #332):** Move playwright to dependencies; nixpacks/postinstall install chromium; throw `REFERENCE_CAPTURE_FAILED` with details; UI action error banner; PNG capture upload with upsert.
- **Founder action:** Redeploy Railway from main, then **CAPTURE / REFRESH REFERENCES + PREPARE INTERFACE** — thumbnails should populate, then **GENERATE MISSING ASSETS**.

---

## 2026-08-24 — CAPTURE REQUIRED cosmetic-only; production refs unblocked

- **Context:** Founder reported visual development still showed **CAPTURE REQUIRED** on all reference thumbnails after refresh — only change from prior session was PR #331 UI labels (replacing grey broken images).
- **Timeline:** Supabase `lastRefreshedAt` was 23:58 UTC but all 6 host refs still had `vitest.local` URLs and zero objects in `visual-references/` storage — refresh hit **pre-#332 API** (Playwright missing, failures swallowed). PR #332 merged ~2 minutes later (00:00 UTC).
- **Immediate unblock:** Ran Playwright capture locally against production Supabase — 7 host refs now REAL HTTPS URLs in storage; visual development run recompiled to `GENERATION_READY` with 3 REAL reference package URLs.
- **Code follow-up (branch `cursor/visual-dev-capture-unblock-4f59`):** `prepareComposedInterfaceSurface` / `refreshVisualDevelopmentReferences` now capture **desktop + mobile** in one action; `/api/health` exposes `gitCommit` + `visualReferenceCapture.playwrightInstalled`.
- **Founder action:** Hard-refresh visual development page — thumbnails should appear. Then **GENERATE MISSING ASSETS**. Railway redeploy from `main` still needed so future captures run on API (health should show `playwrightInstalled: true`).

---

## 2026-08-24 — Visual dev progress: refs working, assets reconciled, origin capture fix

- **Context:** Founder reported progress — 2/3 reference thumbnails showing (SIGN IN shells), one blank grey (SITE 00 ENVIRONMENT / origin), GENERATION_FAILED with stale "resource already exists" errors from earlier API run.
- **Findings:**
  - Railway deployed (`gitCommit` 7c2d72a, `playwrightInstalled: true`).
  - All 5 FAL interface assets **already existed** in Supabase storage since 17:49 UTC; reuse path works but run stuck in `GENERATION_FAILED` with old receipts.
  - Origin `/` capture was **5951 bytes** (blank loader frame) because cinematic cold-start loader runs on `/` but not `/control`; 1.5s wait insufficient.
- **Immediate unblock:** Re-ran `generateMissingInterfaceAssets` → `FOUNDER_REVIEW` with 5 assets. Recaptured origin with loader session bypass → **1.1MB** PNG; recompiled reference package.
- **Code fix (branch `cursor/origin-capture-loader-fix-4f59`):** Playwright `addInitScript` sets `site00-immersive-complete` session before navigation; clear stale FAILED receipts on new generation attempt.
- **Founder action:** Hard-refresh visual development — all 3 reference thumbnails + **FOUNDER_REVIEW** status should show. Judgment buttons ready.

---

## 2026-08-24 — FOUNDER_REVIEW reached; manifest counts + mobile reference thumbs

- **Context:** Founder screenshots show **FOUNDER_REVIEW** with 5 GENERATED INTERFACE ASSETS (PREVIEW links) and judgment buttons — major progress. Remaining: blank SITE 00 ENVIRONMENT thumbnail on mobile; UI still showed REUSABLE: 1 · MISSING: 4 despite 5 assets.
- **Root causes:**
  - `compileSite00ProjectsIndexProofManifest` only passed `existingReusableAssetIds[0]` to HOST_ENVIRONMENT — other 4 assets never marked reusable after generation.
  - Origin reference stored as **1.1MB PNG** — mobile Safari likely failed to render; origin page also very light (mean luminance ~226) at thumbnail size.
  - control + ndxbook captures identical (both unauthenticated SIGN IN).
- **Fix (branch `cursor/visual-dev-manifest-thumb-fix-4f59`):** Map all generated requirement IDs to reusable flags; refresh manifest + interfaceAssetManifest after successful asset generation; capture references as **webp** (canonical path); ReferenceThumbnail `onError` fallback.
- **Production reconciled:** Manifest now 5 reusable / 0 missing; refs recaptured as webp.
- **Founder action:** Hard-refresh; environment thumb should load. Tap judgment when ready.

---

## 2026-08-24 — P1 follow-up: authenticated capture + purpose-gated asset resolution

- **Context:** Founder sprint after P1 correction — live failure: `/projects` Playwright capture was sign-in page masquerading as Projects authority; asset manifest invented methodology slots (WORKBENCH_FOCAL_ARTIFACT, DOSSIER_DEPTH_LAYER, etc.) and generated irrelevant dark workbench imagery.
- **Authenticated capture:** `VisualCaptureAuthContext` via `SITE00_CAPTURE_STORAGE_STATE_PATH` / `VITEST_CAPTURE_PRINCIPAL`; `verifyCapturedSurfaceIdentity()` rejects auth redirects; capture metadata persisted (principal, finalUrl, redirectChain) without secrets; quarantine for `AUTH_REDIRECT_CAPTURE`; `data-site00-surface` markers on Projects + sign-in.
- **Purpose-gated resolution:** `InterfaceVisualSlot` model (5 Projects slots); `resolveProjectVisualEvidence` + `AssetEligibilityEvaluation` (FOUND ≠ ELIGIBLE); `evaluateGenerationNecessity` — generation last resort; legacy methodology assets classified obsolete/not-surface-appropriate (preserved); UI shows AUTHENTICATED REFERENCE STATUS + RESOLVED VISUAL MATERIAL counts.
- **Prepare gate:** `AUTHENTICATED_REFERENCE_REQUIRED` blocks prepare without valid desktop `/projects` capture; `prepareComposedInterfaceSurface` requires authenticated refs; zero FAL valid when slots satisfied by operational truth.
- **Tests:** 1745 pass; new `p1AuthenticatedCaptureCorrection.test.ts` (38 tests) + updated visual-dev/P1 tests with `VITEST_CAPTURE_PRINCIPAL=PROJECT_OWNER`.
- **Production action:** Configure `SITE00_CAPTURE_STORAGE_STATE_PATH` on Railway with founder session storage state; refresh Projects refs; re-prepare interface — do NOT tap GENERATE until authenticated refs VALID.

---

## 2026-08-24 — Experiment G mobile text layout + regenerate guidance

- **Context:** Founder on fsbw-dev (`site00.fsbw-dev.com`) reported Experiment G page bug — concept card fields (e.g. WHAT NDXBOOK BECOMES) crushed into a narrow right column on mobile; asked how to regenerate brand presentation concepts.
- **Root cause:** `site00-experiment-g.css` used fixed two-column grid (`10rem 1fr`) on `.site00-experiment-g__dl div` at all breakpoints; Experiment F already stacks dt/dd on mobile.
- **Fix (branch `cursor/experiment-g-mobile-layout-fix-1983`):** Mobile-first stacked dt/dd; grid only `@media (min-width: 640px)`; `overflow-wrap` + `min-width: 0` on cards; inline regen help under controls; `ProjectExperimentsHubNav` on Experiment G page (restored missing `EcosystemShell` import).
- **Regenerate concepts:** **RE-FORM SET** = fresh six-concept pass (keeps history); **REFRESH FORMATION (IDEMPOTENT)** = re-run same snapshot; first-time **FORM SIX BRAND PRESENTATION CONCEPTS**; stuck **RETRY STALLED FORMATION**. Formation runs on Railway API (2–5 min); page polls every 5s when FORMING.
- **Deploy:** cPanel ZIP after merge (frontend-only CSS/UI); no Railway redeploy required unless API stale.

---

## 2026-08-24 — Experiment G LOVE THE CONCEPT judgment feedback

- **Context:** Founder reported LOVE THE CONCEPT button on Experiment G brand concepts page did nothing visible — reverted to default label after tap.
- **Root cause:** API `setExperimentGConceptJudgment` already persisted `founderJudgment` to Supabase; UI never read or displayed saved judgment on concept cards.
- **Fix (branch `cursor/experiment-g-judgment-persist-ui-1983`):** Active button state + green “✓ YOU LOVED THIS CONCEPT — selection saved” banner; apply API response run immediately (no second reload); status `FOUNDER_REVIEWED` on save. Tests: judgment persistence + UI option contract.

---

## 2026-08-24 — Brand Presentation Direction Development (Experiment G top-3)

- **Context:** Sprint after founder loved three Experiment G concepts (COLLECTOR WHO CONNECTS, ROOM THAT KNOWS, THING THAT KEEPS NOTICING). Build concept → direction layer: 3 parents × 3 directions = 9 candidates, zero visual/FAL.
- **Implementation (branch `cursor/brand-presentation-direction-development-1983`):** `shared/site00-brand-lore/brandPresentationDirectionTerritory/` types/evaluators/prompt/cross-parent audit; `directionService.ts` + Supabase row `c4e1a2b3-0007-4000-8000-000000000001`; API `experiment_g_direction_*`; route `/projects/ndxbook/experiment-g-brand-presentation-concepts/directions`; DEVELOP TOP 3 DIRECTIONS CTA on Experiment G when 3 loves match eligible names; founder direction judgments persist; P0.5A edge registration helper. Tests: 1757 pass (+10 direction suite).
- **Founder flow:** Love 3 concepts on Experiment G → DEVELOP TOP 3 DIRECTIONS → review 9 direction cards → LOVE THE DIRECTION / etc. Visual formulation + FAL blocked until later sprint.
- **Deploy:** cPanel + Railway redeploy for API actions.

---

## 2026-08-24 — Brand Presentation Finalist Visual Formulation (2×3 pipeline)

- **Context:** Correct downstream methodology after direction review: founder selects **2 visual finalists** (not 1 direction winner), each gets **3 visual expression contracts**, then **6 FAL benchmark assets** for comparison before ultimate winner (concept + direction + expression). Do not mutate Experiment D/F/G formation history, Brand Canon, or Projects UX.
- **Implementation (branch `cursor/brand-presentation-finalist-visual-formulation-1983`):**
  - `shared/site00-brand-lore/brandPresentationVisualFormulation/` — policy (2×3=6 configurable), types (`BrandPresentationVisualFinalistSelection`, `BrandPresentationVisualExpressionCandidate`, `BrandPresentationWinnerSelection`, revision delta), finalist gate, evaluators (direction drift, distinctiveness, cross-finalist collapse), `compileBrandPresentationVisualPrompt()` with metaphor sanitation.
  - `visualFormulationService.ts` + Supabase row `c4e1a2b3-0008-4000-8000-000000000001`; API `experiment_g_visual_*` (get, finalist, formulate, generate, judgment, revise, winner).
  - UI: **SELECT AS VISUAL FINALIST** on direction review (independent from LOVE THE DIRECTION); route `/projects/ndxbook/experiment-g-brand-presentation-concepts/finalists` with large-image comparison, cost preview, explicit **GENERATE FINALIST VISUALS** trigger.
  - Anthropic formulates expression systems before FAL; 6 parallel sibling generations; winner does NOT auto-promote to Brand Canon or start implementation.
- **Tests:** 1772 pass (+15 visual formulation suite).
- **Founder flow:** Review 9 directions → select 2 finalists → FORMULATE VISUAL EXPRESSIONS → GENERATE FINALIST VISUALS (6) → compare/judge → SELECT BRAND PRESENTATION WINNER.
- **Deploy:** cPanel frontend + **Railway redeploy** for new API actions.

---

## 2026-08-24 — Direction formation live status panel + retry UX

- **Context:** Founder on direction development page saw FORMING with no buttons, no retry, no live progress — couldn't tell if stalled (especially after Railway redeploy killed background job).
- **Fix (branch `cursor/experiment-g-direction-formation-status-ui-1983`):** `DirectionFormationStatusPanel` — progress bar, elapsed timer, estimated parent step, last-check age, **RETRY STALLED FORMATION** visible while FORMING (matches Experiment G concept page), **REFRESH STATUS NOW**, failed/complete tone states.
- **Deploy:** cPanel v49 frontend.

---

## 2026-08-24 — Parent-concept finalist direction visualization (2×3×1 correction)

- **Context:** Founder clarified NDXBOOK visual decision flow is NOT 2 direction finalists × 3 expressions. Correct flow: select **2 parent concept finalists** (ROOM THAT KNOWS + THING THAT KEEPS NOTICING) → **all 3 directions under each** advance → **6 direction-level benchmarks** (1 visual each) → founder compares six → later direction finalist + deep expression work. COLLECTOR WHO CONNECTS deferred (`FOUNDER_DEFERRED_VISUALIZATION`, salvage eligible) — records preserved, not visualized.
- **Implementation (branch `cursor/parent-finalist-direction-scan-1983`):**
  - `BrandPresentationVisualExplorationPolicy` modes: `PARENT_FINALIST_DIRECTION_SCAN` (NDXBOOK default) vs legacy `DIRECTION_FINALIST_DEEP_DIVE`.
  - Types: `BrandPresentationParentVisualFinalistSelection`, `BrandPresentationDirectionVisualBenchmark`, `DirectionBenchmarkRevisionDelta`.
  - `parentFinalistGate.ts`, `directionBenchmarkPrompt.ts`, `compileDirectionBenchmarkPrompt()` with Room/Noticing anti-literalization guards.
  - `visualFormulationService.ts`: auto-seed Room + Noticing parent finalists, defer Collector; `formulateDirectionBenchmarks()` + `generateDirectionBenchmarkVisuals()` (6 FAL); per-direction visual judgments independent from conceptual direction judgment; surgical single-benchmark revision.
  - UI: direction review removes direction-level finalist toggles; finalists page → **PARENT FINALIST VISUAL REVIEW** with 2 parent sections × 3 large benchmark images + summaries; **FORMULATE/GENERATE SIX DIRECTION VISUALS** explicit triggers + cost preview.
  - API: `experiment_g_visual_judgment/revise/winner` accept `benchmarkId`.
- **Tests:** 1792 pass (+17 parent scan suite); legacy deep-dive tests use `SITE00_EXPERIMENT_G_VISUAL_DEEP_DIVE=1`.
- **Founder flow:** Direction review (9 conceptual) → Parent Finalist Visual Review → formulate 6 benchmarks → generate 6 visuals → judge per direction → optional direction winner (no auto-promote).
- **Deploy:** cPanel v50 frontend + Railway redeploy for API.

---

## 2026-08-24 — Visual benchmark formulation background task + status panel

- **Context:** Founder on Parent Finalist Visual Review tapped FORMULATE and saw **FORMULATING SIX DIRECTION VISUALS…** stuck on the button — asked **"is this a background task? bc it should be"**. Before this fix, benchmark formulation ran **synchronously** in the HTTP request (6 sequential Anthropic calls), blocking until complete — unlike direction formation which already runs on the server with polling.
- **Topics covered:** Prior sprint merged parent-finalist scan (PR #342–#345); Anthropic call signature fix; user screenshot showed blocking formulate UX; expectation = background + poll like direction formation.
- **Fix (branch `cursor/visual-benchmark-background-formation-1983`):**
  - `visualFormulationService.ts`: `formulateDirectionBenchmarks()` returns immediately with `FORMULATING_BENCHMARKS`; work enqueued via `setImmediate` → `executeBenchmarkFormulationWork()` with incremental saves per benchmark; stale reconciliation after 15 min; `formationAttemptId` on run; `forceRetry` support; VITEST still runs synchronously.
  - UI: `VisualBenchmarkFormationStatusPanel` + progress helpers (mirrors `DirectionFormationStatusPanel`); finalists page polls every 5s while formulating; formulate button → **STARTING BACKGROUND FORMULATION…** then status panel with retry/refresh; **safe to leave this page** copy.
  - API: `experiment_g_visual_formulate` passes `forceRetry`; `experimentGVisualFormulate(slug, { forceRetry? })`.
- **Tests:** 1795 pass (+3 visual benchmark status UI tests); worker reset in formulation test `beforeEach`.
- **Founder flow after deploy:** Tap FORMULATE → immediate return → status panel polls → **BENCHMARKS_READY** → GENERATE SIX DIRECTION VISUALS.
- **Deploy:** cPanel frontend + **Railway redeploy** (API must run new background worker).

---

## 2026-08-24 — P0.5B Brand Character System + NDXBOOK Character Formation

- **Context:** Founder sprint correcting methodological sequencing — fixed TOPIC→CONTENT to BRAND→BRAND PRESENTATION but still entered formation too downstream ("who is this brand?" before "how does it present?"). Personality existed in lore but lacked authority in Experiment G visual pipeline (presence stub only).
- **Forensic findings:** BrandPersonalityProfile gates Core Direction; Experiment G snapshot uses `BRAND_PERSONALITY_PRESENT` flag; direction/benchmark/FAL omit personality; Burn Book calibration-only; no P0.5A personality→presentation edge.
- **Implementation (branch `cursor/brand-character-system-1983`):** `brandCharacterTerritory/` full model + system compiler + artifact relationship; NDXBOOK background 6-territory formation; P0.5A edges; cultural calibration; UI `/projects/ndxbook/brand-character-formation`; API `experiment_h_*`.
- **Tests:** 1825 pass (+30). Experiment G immutable. No FAL. LOVE ≠ canon.
- **Deploy:** Railway API + cPanel/fsbw-dev frontend.

---

## 2026-08-24 — Brand character page white-screen fix (partial payload crash)

- **Context:** Founder on `/projects/ndxbook/brand-character-formation` saw white screen when formation nearly complete — React crash rendering characters when Anthropic returned partial/malformed nested payload (missing `core`, string instead of array for `whatItMustNeverBecome`).
- **Fix:** `characterPayloadNormalization.ts` coerces partial payloads; `getBrandCharacterFormationRun()` migrates saved characters; UI uses optional chaining + safe text/list helpers.
- **Deploy:** Railway API + frontend redeploy.

---

## 2026-08-24 — P0.5B.1 Brand Character Formation Assurance + Territory Development Correction

- **Context:** First live NDXBOOK character formation (run `c4e1a2b3-0009-4000-8000-000000000001`, 6 territories, `outputTokens: 12000` at max) showed blank UI fields and archetypal territory names. Sprint: forensic audit first, preserve historical six, correct methodology to Territory → Development → System without regenerating territories or using FAL.
- **Forensic root cause:** Anthropic generated **rich content in alternate field schema** (`centralDrive`, `thinkingStyle`, `humorMechanism`, etc.) while P0.5B expected canonical keys (`characterThesis`, `intelligenceStyle`, `humorLogic`). `migrateCharacterTerritory` overwrote provider nested objects with empty canonical strings → UI showed misleading `—`. Character #6 (Precise Enthusiast) additionally **PROVIDER_TRUNCATED** at 12k tokens. Raw provider JSON was not persisted for V1 run (cannot recover without re-request).
- **Methodology correction:** Three levels formalized — compact **BrandCharacterTerritory** (V2 prompt for future runs), **BrandCharacterDevelopment** (founder-triggered from LOVE/PROMISING_DEVELOP with delta preserve/develop/avoid), **BrandCharacterSystem** compiles from approved development only (`DEVELOPMENT_REQUIRED` default). Forensic audit, archetype collapse evaluation, territory assurance, deterministic semantic set audit (no winner selection).
- **UI:** Character comparison view (horizontal table desktop / tab switcher mobile), completeness truth states (NOT_FORMED_AT_TERRITORY_STAGE, RECOVERABLE_PROVIDER_OUTPUT, etc.), territory card redesign, `/projects/ndxbook/brand-character-development` route, DEVELOP CHARACTER action.
- **Orchestration/deps:** Added BRAND_CHARACTER_DEVELOPMENT stage; Territory → Development → System dependency edges.
- **Tests:** 78 character tests pass (+47 P0.5B.1 suite). Build green. No FAL. Experiment G blocked. Historical six preserved immutable.

---

## 2026-08-24 — P0.5B.2 Brand Character Readiness + Conditional Deepening

- **Context:** Extend P0.5B/P0.5B.1 so Studio World evaluates post-purchase Project Intelligence before Character Territory formation — ask targeted follow-up questions only when material character gaps exist; do not force another full intake or duplicate Brand Lore/Personality/Appetite questions.
- **Architecture:** POST-PURCHASE INTELLIGENCE → `BrandCharacterReadinessEvaluation` (READY / PARTIAL / INSUFFICIENT / BLOCKED / NOT_EVALUATED) → conditional `BrandCharacterDeepeningModule` → formation gate → territories. Deterministic domain evaluation across 12 character-critical domains; duplicate question prevention via `findExistingEvidenceForCharacterQuestion()`; founder language preserved verbatim in `FounderLanguageEvidence`.
- **Integration:** Formation gate in `formSixBrandCharacterTerritories`; `BRAND_CHARACTER_DEEPENING` conditional module in Project Intelligence manifest; API `experiment_h_readiness_*` + `experiment_h_deepening_*`; UI `/projects/ndxbook/brand-character-readiness` + `/brand-character-deepening`; Project Setup shows `BRAND CHARACTER: READY / N QUESTIONS REMAIN / DEEPENING REQUIRED`.
- **NDXBOOK first-pass (reconciled profile, no new questions asked):** Overall `CHARACTER_BLOCKED` (Brand Lore still `CONTEXT_INCOMPLETE` upstream). Domain strengths: strong worldview/personality/humor/social/emotional/language/boundaries; thin/missing audience relationship, cultural intelligence, taste, artifact behavior. Retrospective first-six input readiness: **INSUFFICIENT** (`INPUT_EVIDENCE_LIMITED`, primary cause **BOTH** methodology + input). Targeted deepening compiled: **7 questions** (audience, cultural×2, taste×2, artifact×2) — confirms first weak territories were not methodology-only.
- **Tests:** +44 P0.5B.2 tests; 1917 total pass. Build green. No FAL/GPT Image. Experiment G unchanged. First six territories immutable.

---

## 2026-08-24 — Brand Character Readiness / Deepening contradiction fix

- **Context:** Founder on NDXBOOK mobile saw contradictory UX: Readiness page showed **CHARACTER INSUFFICIENT** + **ANSWER 5 QUESTIONS**, while Deepening page said **NO DEEPENING QUESTIONS REQUIRED** / existing evidence sufficient. Duplicate identical bullet under WORLDVIEW ORIENTATION. User asked if this was a bug.
- **Root cause (confirmed bug):** Split between pre-filter `recommendedQuestionCount` (gap sum before duplicate prevention) and compiled deepening module. Readiness UI fell back to `recommendedQuestionCount` when `deepeningModule` was null/stale; Deepening UI treated null module or `NOT_REQUIRED` with zero questions as “sufficient for formation” even when overall readiness was INSUFFICIENT. WORLDVIEW duplicated because `brandLore` and `businessOffering` share overlapping lore fields.
- **Fix:** Sync `recommendedQuestionCount` to compiled question count in service; recompile missing/out-of-sync deepening on `getBrandCharacterReadinessState`; new deepening status `GAPS_REMAIN` when gaps exist but zero questions compiled; Readiness shows **REVIEW EVIDENCE GAPS** (not fake question count); Deepening explains gaps-without-questions honestly; dedupe domain `whatWeKnow` signals.
- **Changes:** `deepeningModule.ts`, `types.ts`, `domainEvaluation.ts`, `brandCharacterReadinessService.ts`, `ProjectBrandCharacterReadinessPage.tsx`, `ProjectBrandCharacterDeepeningPage.tsx`, +4 alignment tests (48 total in P0.5B.2 suite).
- **Conventions:** Never show “sufficient for formation” unless `CHARACTER_READY`; never use pre-compile gap count as answer-button label — use compiled `deepeningModule.questions.length` only.

---

## 2026-08-24 — P0.5B.3 Composite Brand Character Synthesis + Artifact Visualization

- **Context:** After P0.5B.2 readiness/deepening + founder completing live deepening questions, implement composite synthesis sprint: reclassify six historical territories as discoveries/components, synthesize Cultural Accomplice + Committed Contrarian + Relentless Synthesizer into one NDXBOOK character, maturation continuity (Burn Book ancestry as calibration not canon), founder review, Brand Character System compile, three behavior-first artifact proof scenarios + founder-triggered FAL visualization. Do NOT restart formation, mutate Experiment G, or proceed to Identity/Presentation.
- **Architecture:** `shared/site00-brand-lore/brandCharacterSynthesis/` — types, territory roles, productive contradictions, maturation continuity, founder hypothesis, synthesis evaluation, artifact causality, character traces, FAL prompt compiler, vitest fixtures. Service `brandCharacterSynthesisService.ts` + store adapter (methodology_validation_runs mode `NDX_BRAND_CHARACTER_SYNTHESIS`). Pipeline: readiness refresh → prepare → Anthropic/vitest synthesis → founder judgment → compile system → formulate 3 proofs → per-proof FAL generate.
- **UI:** `/projects/ndxbook/brand-character-synthesis`, `/brand-character-artifact-proofs`. API `experiment_h_synthesis_*`, `experiment_h_artifact_proof_*`.
- **Fix bundled:** `seedVitestCharacterFormationReadiness` now includes synced deepening module so formation gate tests don't re-evaluate to BLOCKED after P0.5B.2 deepening sync fix.
- **Tests:** +39 P0.5B.3 tests; **1960 total pass**. Build green. Experiment G reevaluation flag set on system compile. No Brand Canon mutation. FAL blocked until founder approves synthesis.

---

## 2026-08-24 — Composite synthesis button silent failure fix

- **Context:** Founder on `/projects/ndxbook/brand-character-synthesis` (fsbw-dev mobile) tapped **RUN COMPOSITE SYNTHESIS** — button briefly busy then nothing visible; felt broken.
- **Root cause:** UI had no error/status state — API failures (readiness block, missing territories, stale Railway deploy without `experiment_h_synthesis_*` actions) were swallowed silently. Backend threw opaque 500s on synthesis errors. Historical territory name matching was exact-only.
- **Fix (branch `cursor/synthesis-button-error-feedback-1983`):** Synthesis page shows `actionError` panel with message + hints (deploy lag → hard refresh; readiness → link to readiness page); `statusMessage` during 1–2 min Anthropic call; button label **RUNNING SYNTHESIS…**. API `experiment_h_synthesis_run` returns 400 `SYNTHESIS_FAILED` with message. Fuzzy territory resolution in `resolveNdxbookSynthesisSourceTerritories()`; clearer missing-territory error lists formation names found.
- **Deploy note:** fsbw-dev frontend hits **`https://api.site00.com`** — Railway must redeploy for synthesis actions; UI now surfaces **Unknown action** if API stale.

---

## 2026-08-24 — Deepening answers now recalculate character readiness

- **Context:** After synthesis button error UX shipped (PR #354), founder screenshot showed real blocker: **CHARACTER READINESS: CHARACTER_INSUFFICIENT** despite **5 deepening answers ingested** — synthesis correctly blocked but readiness never improved after deepening.
- **Root cause:** `evaluateBrandCharacterReadiness()` only counted deepening answers in fingerprint metadata — answers were **not merged into evidence inventory**, so domain strengths and overall state stayed unchanged after founder submitted deepening.
- **Fix (branch `cursor/deepening-readiness-recalc-1983`):** `applyDeepeningAnswersToInventory()` routes founder deepening answers into domain buckets + founderLanguage; readiness service passes answers into evaluation; completing all compiled deepening questions floors **INSUFFICIENT → PARTIAL** (synthesis allows PARTIAL); synthesis error panel adds **CONTINUE DEEPENING** link.
- **Tests:** +3 P0.5B.2 tests (deepening merge, submission re-eval, all-questions unlock); 89 in readiness+synthesis suites pass. Build green.

---

## 2026-08-24 — Composite synthesis background worker + readiness gate fix

- **Context:** Founder still saw **SYNTHESIS COULD NOT RUN / CHARACTER INSUFFICIENT** while readiness refresh showed **INSUFFICIENT → PARTIAL** (5 deepening answers ingested). Also requested synthesis run in **background** with **loading bar** so page need not stay open (like visual benchmark formulation).
- **Root causes:** (1) Stale client error from prior failed attempt while server readiness had improved to PARTIAL; (2) brand-lore equivalent check ignored deepening answers in inventory; (3) synchronous 1–2 min Anthropic call blocked HTTP request (timeout felt like silent failure).
- **Fix (branch `cursor/synthesis-background-status-1983`):** `startCompositeBrandCharacterSynthesis()` returns immediately with `SYNTHESIZING`, enqueues `executeCompositeSynthesisWork` via `setImmediate` (vitest stays synchronous); stale reconciliation after 15 min; `synthesisStartedAt` + `synthesisAttemptId` on run. UI: `BrandCharacterSynthesisStatusPanel` with progress bar, elapsed timer, poll every 5s, **safe to leave page** copy, retry stalled. Readiness gate uses deepening-merged inventory for brand-lore bypass; `assertSynthesisGate` checks blockers; page clears stale INSUFFICIENT errors when refresh shows PARTIAL/READY.
- **Deploy:** Railway API redeploy required for background worker; fsbw-dev frontend after cPanel/tunnel refresh.

---

## 2026-08-24 — Retrospective synthesis readiness floor (INSUFFICIENT + 5 deepening)

- **Context:** Founder screenshots showed **COMPOSITE SYNTHESIS FAILED**, readiness stuck **INSUFFICIENT → INSUFFICIENT** despite **5 deepening answers ingested** and historical six territories already formed; **RUN COMPOSITE SYNTHESIS** disabled.
- **Root cause:** Formation-time readiness evaluation still **INSUFFICIENT** (6+ thin domains / not all compiled questions answered). Synthesis gate reused raw evaluation state — no retrospective floor for NDXBOOK where territories formed before P0.5B.2 gate and founder completed deepening.
- **Fix (branch `cursor/synthesis-retrospective-readiness-1983`):** `resolveSynthesisEligibleReadinessState()` — when historical formation complete (6 territories) + ≥3 deepening answers + evaluated INSUFFICIENT → **synthesis gate PARTIAL**. Stored as `readinessRefresh.synthesisEligibleState`; UI shows **Synthesis gate: CHARACTER PARTIAL (retrospective…)** and re-enables run/retry. Formation gate unchanged.
- **Tests:** +3 synthesisReadinessGate tests; 44 in synthesis suites pass. Build green.

---

## 2026-08-24 — P0.5C Character-Led Marketing Expression System + North-Star Calibration

- **Context:** Full sprint to implement the methodological layer between Brand Character System and marketing artifacts for NDXBOOK. Founder-approved 3×3 exploratory board is **CHARACTER_EXPRESSION_CALIBRATION** (high character authority, no identity authority — not final palette/typography/collage mandate). Pipeline: Character Event → Content Thesis → Marketing Artifact → behavior-first FAL. Experiment 01: nine unrelated-topic Instagram first slides testing same character without template collapse. Explicitly do NOT finalize identity, product expression, world formation, or mutate Experiment F/G.
- **Architecture:** `shared/site00-brand-lore/brandMarketingExpression/` — types, forensic audit, behavioral modes (9 seed + discovered), surface/cause separation, north star 3×3 persistence, marketing expression compiler, character event + thesis formulation, visual causality, channel modulation, typography/color behavior (no font/palette prescription), FAL prompt compiler (16 behavior-first sections), evaluation (character recognition, north-star distance, template-collapse guards). Service `brandMarketingExpressionService.ts` + store adapter (methodology_validation_runs mode `NDX_BRAND_MARKETING_EXPRESSION`, DB id `c4e1a2b3-0012-...`). Upstream requires compiled `BrandCharacterSystem`.
- **UI:** `/projects/ndxbook/marketing-expression` (public behavior thesis, north star forensics, what not to copy), `/marketing-expression/experiment-01` (3×3 feed preview, per-artifact review, founder-triggered FAL per slide, artifact + set judgments). Hub entry P0.5C added. API `marketing_expression_*` + `marketing_expression_experiment_01_*`.
- **Generation controls:** No page-load generation; no automatic FAL retry; max 9 initial FAL requests (1 per artifact); founder-triggered only; accounting persisted.
- **Tests:** +52 P0.5C tests (`brandMarketingExpressionP05C.test.ts`). Build green. Experiment G `characterReevaluationRequired` preserved. Brand Canon unchanged.

---

## 2026-08-24 — P0.5D Content Operations + Performance Learning Engine

- **Context:** Build operational layer turning approved Brand Character System + Marketing Expression System into repeatable, testable, partially automated NDXBOOK social content operation. Answers: what should NDX talk about next, what deserves attention, what's repetitive, channel/format selection, founder approval gates, performance ingestion, production learning without mutating character/canon. Default: ASSISTED_AUTONOMY — no autonomous publishing.
- **Architecture:** `shared/site00-brand-lore/contentOperations/` — ContentOperationsSystem, ContentOpportunity engine (multi-dimensional ranking, not viral score), editorial strategy/memory, duplicate/callback logic, weekly EditorialSlate, channel/format selection, research depth + claim confidence, SocialContentPackage (carousel integrates Sequence Creative System, Reel/Story/Caption/CTA contracts), publishing handoff (READY_FOR_MANUAL_PUBLISH), content calendar, performance records, qualitative audience evidence, performance learning with false-learning guards, editorial health, production budget, NDXBOOK_MARKET_TEST_01. Service `contentOperationsService.ts` + store (`NDX_CONTENT_OPERATIONS`, DB id `c4e1a2b3-0013-...`).
- **UI:** `/projects/ndxbook/content-operations` (opportunities, slate, production queue, market test), `/content-operations/performance` (metrics, audience response, learning with founder acceptance). LIVE_SIGNAL_INGESTION_NOT_CONNECTED — pilot uses seeded opportunities.
- **Boundaries:** Performance ≠ character/canon authority. Founder approval required for slate, content, publish. Instagram NOT_CONNECTED. Experiment F/G immutable. No product expression/world formation.
- **Tests:** +62 P0.5D tests. Build green.

---

## 2026-08-24 — P0.5C.1 Editorial Information Architecture + Typographic Governance + Carousel Sequence Direction

- **Context:** Correct visual communication weaknesses from Experiment 01 V1 live generations — information architecture, not expression world redesign. Founder approves black/cream/lime investigative energy; problem is too much simultaneous information, weak hierarchy, random typography. Distinction: MESSY THINKING ≠ MESSY COMMUNICATION. Pipeline: Character → Thesis → Evidence Workspace → Editorial Decision → Hierarchy → First-Slide Art Direction → Sequence → Typographic Governance → Visual Artifact → Distance QA.
- **Architecture:** `shared/site00-brand-lore/editorialInformationArchitecture/` — EditorialDecision, FirstSlideInformationBudget, deferred-information classification (DEFER_TO_SEQUENCE), CarouselNarrativeArchitecture, NDXTypographyBehaviorSystem (DISPLAY/DOCUMENT/HUMAN_TRACE + SOURCE_TEXT exception), uppercase-only NDX-authored copy, TextDensityEvaluation, FeedDensityRhythm, ArtifactReadingPath, three-distance QA, lime governance, FirstSlideArtDirectionContract, FAL prompt compiler V2 (18-section editorial hierarchy). Experiment 01 V1 preserved; V2 pipeline ready (`EXPERIMENT_01_V2_INFORMATION_ARCHITECTURE`) — same 9 topics, contracts before founder-triggered FAL.
- **Integration:** P0.5D Content Operations SocialContentPackage now requires editorial layer (editorialDecisionId, firstSlideContractId, carouselArchitectureId); CarouselSequencePlan extended with sequence arc + slide contracts. Service: `formulateMarketingExpressionExperiment01V2`, `generateExperiment01V2ArtifactAsset`. UI: Experiment 01 page V1/V2 tab switcher + contract review before generate.
- **Boundaries:** Marketing Expression typography governance ≠ final Brand Identity. No character/canon/Experiment F/G mutation. V2 FAL not auto-generated (0 during implementation; max 9 founder-triggered).
- **Tests:** +60 P0.5C.1 tests. P0.5C + P0.5D still passing. Build green.

---

## 2026-08-24 — P0.5C.2 Cultural Image Participation + Visual Subject Matter Governance + Artistic Range

- **Context:** Layer on P0.5C.1 (do not replace). Experiment 01 V1/V2 artifacts remain too text/document/evidence-heavy; underexpress culture, people, photography, art, play, emotional entry. NDX is also **Cultural Accomplice** — cultural/human/artistic visual material must be first-class evidence and expression. Same nine Experiment 01 topics; controlled question: can same content ideas become more culturally alive without losing hierarchy clarity?
- **Architecture:** `shared/site00-brand-lore/culturalVisualParticipation/` — CulturalVisualEvidence + CulturalVisualRole, VisualSubjectMatterDecision (IMAGE_DOMINANT through MIXED_MEDIA), VisualParticipationBalance, VisualAppetiteEvaluation, CulturalAccompliceExpressionEvaluation, MarketingPlayfulnessEvaluation, ArtisticEvidence (distinct from factual), ReferenceDensityEvaluation, FeedCulturalRhythm + FeedEmotionalRhythm, MarketingVisualDiversityEvaluation (text/document dominance guards), NDXPhotographyBehavior, north-star CULTURAL_IMAGE_PARTICIPATION_CALIBRATION, FAL prompt compiler V2.1 (24 sections), Experiment 01 V2.1 (`EXPERIMENT_01_V2_1_CULTURAL_IMAGE_PARTICIPATION`) — amends P0.5C.1 contracts without mutating V2 history.
- **Topic visual profiles:** Topic 3 cultural reassessment IMAGE_DOMINANT/REQUIRED; Topic 5 corporate euphemism TYPOGRAPHY_DOMINANT/NOT_HELPFUL; Topic 7 self-correction ARTIFACT_DOMINANT; mixed modes across board for visual appetite variation.
- **Integration:** P0.5D SocialContentPackage + ContentOpportunity visual potential (HUMAN/CULTURAL/OBJECT/ARCHIVAL/ARTISTIC/PHOTOGRAPHIC). Service: `formulateMarketingExpressionExperiment01V21`, `generateExperiment01V21ArtifactAsset`, `setExperiment01V21ArtifactJudgment`. UI: Experiment 01 page V2.1 tab + contract review (visual participation mode, cultural subject, why it belongs, image-led reading path, V21 founder judgments) before founder-triggered FAL.
- **Boundaries:** V1/V2 immutable. No auto FAL generation. Generated illustration ≠ factual evidence. Random celebrity/nostalgia/reference stuffing blocked. P0.5C.1 hierarchy, uppercase, typography roles, information budget preserved. Brand Character/Canon, Experiment F/G, Product Expression, World Formation unchanged.
- **Tests:** +59 P0.5C.2 tests (`culturalVisualParticipationP05C2.test.ts`). P0.5C + P0.5C.1 + P0.5D still passing. Build green. `EXPERIMENT_01_CULTURAL_VISUALS_GENERATED = false` unless founder triggers.

---

## 2026-08-24 — Experiment 01 batch FAL generation (all nine slides)

- **Context:** Founder reported Experiment 01 only allowed generating one slide at a time (per selected artifact). UX should be one founder-triggered button that generates all nine first slides in the background with polling progress.
- **Fix:** `generateAllExperiment01ArtifactAssets`, `generateAllExperiment01V2ArtifactAssets`, `generateAllExperiment01V21ArtifactAssets` — background worker loops pending artifacts, saves after each. API `*_generate_all` actions. UI: **GENERATE ALL NINE FIRST SLIDES (FAL)** above 3×3 grid; polls during GENERATING; shows X/9 progress. Contract review gates allow GENERATING status during active batch.

---

## 2026-08-24 — P0.5E Campaign Board + Horizontal Sequence Production + Client Approval Architecture

- **Context:** Extend Marketing Expression + Content Operations into generic Studio World campaign-preparation workflow. Horizontal production: Round 01 = all Slide 01s across slate, lock, then Round 02 = all Slide 02s. Preserve vertical coherence within sequences AND horizontal coherence across campaign. NDXBOOK Experiment 01 V2.1 as proving ground — generic models contain NO NDX aesthetic assumptions.
- **Architecture:** `shared/site00-studio-world-production/marketingCampaignProduction/` — MarketingCampaignPeriod, CampaignContentSlate, CampaignProductionBoard, CampaignProductionRound, CampaignCoherenceModel (vertical + horizontal), SequenceSlideArtDirectionContract, Slide 02 swipe-reward methodology, locking/reopen lineage, ClientMarketingApproval, CampaignApprovalSnapshot, CompleteSocialContentPackage, campaign rhythm evaluation, anti-template guards. NDX adapter: `shared/site00-brand-lore/marketingCampaignProduction/ndxbookExperiment01Adapter.ts` — uneven sequence depths (5,3,7,1,6,4,8,3,5), V2.1 → Round 01, lock, Round 02 formulation.
- **Service:** `marketingCampaignProductionService.ts` + memory store. API: `campaign_production_*`. UI: `/projects/ndxbook/content-operations/campaign-board` — Campaign Wall, Round View, Feed Preview, Content Plan, Client Review mode, lock Round 01, formulate Round 02.
- **Boundaries:** No auto-generation on page load; Round 02 blocked until Round 01 locked; locked assets immutable; P0.5C/P0.5C.1/P0.5C.2 preserved; Experiment F/G, Brand Character/Canon unchanged; Product Expression / World Formation blocked.
- **Tests:** +23 P0.5E tests. Full suite 2225 passing. Build green.

---

## 2026-08-24 — Experiment 01 stale batch generation recovery

- **Context:** Founder on mobile V2.1 Experiment 01 saw **"GENERATING FIRST SLIDES IN BACKGROUND… 1/9 COMPLETE"** with no generate button and nothing running on FAL — persisted state stuck after batch worker died (Railway redeploy or mid-batch crash).
- **Root cause:** UI hid **GENERATE ALL** when any artifact had `generationStatus === 'GENERATING'` or run status was `EXPERIMENT_01_*_GENERATING`. `activeGenerationAttempts` is in-memory only — after redeploy, persisted GENERATING flags remained with no worker.
- **Fix:** `reconcileStaleExperiment01Generation()` on every `getBrandMarketingExpressionState` GET when no active worker — resets stale GENERATING artifacts to `NOT_GENERATED`, run back to `*_READY`. Batch worker `finalizeExperiment01BatchGeneration` + per-artifact try/catch on failure. UI: show **GENERATE REMAINING N FIRST SLIDES (FAL)** when partial complete; progress text only while worker actually running. Tests: `experiment01StaleGeneration.test.ts`.

---

## 2026-08-24 — P0.5E.1 NDX Daily Publishing Cadence + Cross-Platform Content Derivation

- **Context:** Extend P0.5D/P0.5E so NDXBOOK can operate high-volume daily publishing (3 feed, 4 story, 1–2 reels/day) without requiring 9–10 unrelated ideas daily. Core principle: **reuse thinking, re-derive expression** — one Content Intelligence → many platform-native expressions.
- **Generic domain:** `shared/site00-studio-world-production/dailyPublishingCadence/` — PublishingCadencePolicy, DailyPrimaryContentEvent, CrossPlatformContentIntelligence, PlatformContentExpression, CrossPlatformDerivationPolicy, DailyCrossPlatformContentMatrix, DailyStoryCluster, SecondReelEligibility, editorial health, content fatigue, evergreen reserve, watch queue, rapid response, platform-native QA, shared research, weekly production board, video hook round, channel expression learning, cost model.
- **NDX adapter:** `shared/site00-brand-lore/dailyPublishingCadence/` — 3 feed / 4 story / 1 reel target / 2 max normal; ~21 primary events/week; self-checkout 6-platform derivation example.
- **Service:** `dailyPublishingCadenceService.ts` — configure, plan week, build daily plan, approve weekly intelligence slate. API: `daily_publishing_*`. UI: `/projects/ndxbook/content-operations/daily-plan` (daily/week/event/platform views).
- **Boundaries:** No autonomous publishing; Brand Character/Canon unchanged; generic models NDX-free; production ≠ publishing calendar.
- **Tests:** +61 P0.5E.1 tests. Full suite 2288 passing. Build green.

---

## 2026-08-24 — P0.5C.3 Character Retention + Controlled Misbehavior + Humor Reinjection

- **Context:** V2.1 editorial compression improved clarity but removed too much NDX character (punchlines, side comments, human trace, mischief). Core principle: **reduce information, preserve character** — distinguish **information density** vs **character density**. V2.1 history immutable; new lineage **Experiment 01 V2.2**.
- **Domain:** `shared/site00-brand-lore/characterRetention/` — CharacterRetentionContract, CharacterBeat, density/sterility/compression evaluations, humor reinjection, controlled misbehavior, 28-section FAL prompt, feed character/humor rhythm, north-star character forensics.
- **V2.2 pipeline:** amend V2.1 → character retention evaluation → founder contract review (18 V22 judgments) → founder-triggered FAL only (max 9). Topic-specific beats (e.g. "WE USED TO JUST BUY THINGS???", "47 MINUTES LATER...").
- **Integration:** P0.5E Round 01 lock requires V2.2 generated + character gate pass. P0.5D `characterRetentionContractId`. Experiment 01 UI V2.2 tab.
- **Boundaries:** P0.5C.1/C.2 preserved; Brand Character/Canon, Experiment F/G unchanged; no auto-generation.
- **Tests:** +17 P0.5C.3. Full suite 2305 passing. Build green.

---

## 2026-08-24 — P0.5C.4 Art-Board Materiality + Imperfect Canvas Composition

- **Context:** V2.2 character retention succeeded but artifacts still read as graphics on clean templates. Core principle: **THE CANVAS IS AN OBJECT** — material surface participates, not neutral background texture.
- **Domain:** `shared/site00-brand-lore/artBoardMateriality/` — ArtifactMaterialitySystem, CanvasObjectContract, ArtBoardDirectionContract, construction history, layers, attachment causality, imperfect canvas + material density evaluations, feed material rhythm, 33-section FAL prompt with template guard.
- **V2.3 pipeline:** amend V2.2 → art-board contracts → founder review (20 V23 judgments) → founder-triggered FAL only. Topic-specific artifact forms (receipt stack, graph notebook, archival file, magazine tear, thermal receipt, screenshot print, art board, etc.).
- **Integration:** P0.5E Round 01 lock requires V2.3 generated + material gate. P0.5D `artBoardDirectionContractId`. Experiment 01 UI V2.3 tab.
- **Boundaries:** V1–V2.2 immutable; P0.5C.3 character preserved; no torn-paper-everywhere; no fake texture filter.
- **Tests:** +15 P0.5C.4. Full suite 2320 passing. Build green.

---

## 2026-08-24 — P0.5E.1A Daily Cadence Reconciliation + Second-Reel Policy Cleanup + Volume Semantics

- **Context:** Focused cleanup of P0.5E.1 daily publishing cadence — not a new methodology sprint. Founder-approved NDX Instagram cadence: **3 Feed + 4 Stories + 1 Reel/day baseline (8/day, 56/week)**; optional second Reel max-normal **9/day, 63/week** (63 is NOT baseline). Cadence is operating rhythm, not content quota.
- **Forensic fixes:** Replaced stale third-Reel current-state terminology with **SECOND_REEL_*** canonical names; preserved `THIRD_REEL_OPTIONAL_POLICY_IMPLEMENTED` and `FAIL_THIRD_REEL_FORCED` as deprecated compatibility aliases. Single derived volume path via `dailyPublishingUnitVolume` / `weeklyPublishingUnitVolume`.
- **Domain:** `CadenceFulfillmentEvaluation` (HEALTHY_BASELINE, HOLD_SLOT_EMPTY, etc.), `PrimaryEventLifecycleState` + `reactivatePrimaryContentEvent` for callbacks, `detectForcedPremiseCreation`, cost breakdown with baseline (7 Reels/week) vs max-normal (14) vs actual planned, browser-safe `reelSlotPresentation.ts` for UI.
- **UI:** Daily Plan page shows baseline 56 / max-normal 63 labels, Reel 01 target + Reel 02 optional/held semantics, baseline vs max-normal cost lines.
- **Service:** Second Reel no longer auto-approved from `dayEvents.length > 1`; stores `cadenceFulfillmentEvaluationsByDate`.
- **Tests:** +14 P0.5E.1A regression tests; P0.5E.1 test 19 updated to HEALTHY_BASELINE. Cadence suite 75 passing; full suite 2333+ passing; build green.

---

## 2026-08-24 — P0.5D.1 Live Cultural Intelligence + Trend Forecasting + Temporal Relevance Engine

- **Context:** Upstream intelligence layer between live external world and Content Operations. Core question: *what is happening or about to happen that this brand could notice, understand, connect, question, remember, explain, react to, or have a distinctive POV about?* NOT a trending-hashtag scraper or trend-copying engine. Generic Studio World architecture + NDX adapter; feeds better intelligence into existing ContentOpportunity without replacing it.
- **Corrected pipeline:** LIVE WORLD SIGNALS → normalization → clustering → lifecycle → forecast → source/freshness validation → brand relevance → WHY NOW → ContentOpportunity → weekly slate → packages → production → publishing → learning.
- **Generic domain:** `shared/site00-studio-world-production/liveCulturalIntelligence/` — LiveWorldSignal, SignalCluster, TrendLifecycleEvaluation, UpcomingCulturalMoment, ForecastConfidence, TemporalRelevanceEvaluation, WhyNowEvaluation, CurrentIntelligencePackage, BrandSignalInterpretation, CulturalMemoryMatch, EditorialWhitespaceEvaluation, CulturalWeatherPattern, WeeklyCulturalForecast, LiveWatchQueue, EditorialFlexCapacity, ForecastOutcome, ClientIntelligenceConfiguration, failure states, `FAL_REQUESTS_FOR_FORECASTING = 0`.
- **NDX adapter:** `shared/site00-brand-lore/liveCulturalIntelligence/` — `ndxLiveCulturalIntelligenceAdapter.ts` (5 pilot manual signals), `ndxRelevance.ts` (trend dependency guard, cultural memory, callback evidence), NDX character behavior modes, founder judgment vocabulary.
- **Service:** `api/_lib/site00Evolve/liveCulturalIntelligence/` — configure, manual refresh, weekly forecast, promote STRONG_OPPORTUNITY/CALLBACK to ContentOpportunity with live lineage. Memory store (no Supabase yet). API: `cultural_intelligence_*` on projects.
- **UI:** `/projects/ndxbook/cultural-intelligence` (LIVE NOW, COMING, ACCELERATING, WATCHING, OPPORTUNITIES, SKIP, SOURCES); `/projects/ndxbook/cultural-intelligence/weekly-forecast` (10 forecast sections + open capacity). Content Operations banner notes intelligence layer.
- **ContentOpportunity integration:** Optional `liveLineage` (signalIds, intelligence package, brand interpretation, whyNow, temporal, memory, forecast, origin). Seeded pilot opportunities remain valid without lineage.
- **Connectors:** Truthful states only — MANUAL (founder pilot signals), AVAILABLE_NOT_CONFIGURED, NOT_AVAILABLE. No fabricated live APIs.
- **Boundaries:** Brand Character/Canon unchanged; Experiment D/F/G, P0.5C, P0.5E, P0.5E.1 cadence unchanged; no FAL during forecasting; no generation on page load; no autonomous publishing; rapid response cannot bypass verification or founder approval.
- **Tests:** +12 grouped P0.5D.1 tests (~50 requirements in `culturalIntelligenceP05D1.test.ts`). P0.5D test 58 updated. Cadence + content ops regressions green. Build green.

---

## 2026-08-24 — P0.5C.4A Human-Made Mark System + Lime Intervention Governance + Anti-AI Artifact Correction

- **Context:** Surgical refinement of P0.5C.4 V2.3 after first generated artifact review. Materiality directionally successful; gaps were under-utilized lime as NDX intervention color and AI-looking pictograms/micro-details. Core correction: maker presence must become visually undeniable without undoing art-board materiality.
- **Domain:** `shared/site00-brand-lore/artBoardMateriality/` — `NDXHumanMadeMarkSystem`, `HumanMarkConsistencyEvaluation`, `NDXLimeInterventionSystem`, `LimeInterventionDensity`, `LimeApplicationMode`, `AntiAIGeneratedArtifactEvaluation`, `MakerEvidenceStrength`, `LimeFeedDistanceEvaluation`, `HandMarkLegibilityEvaluation`, `FeedMakerRhythm`, north-star calibrations (HUMAN_MARK / LIME_INTERVENTION / MAKER_AUTHENTICITY).
- **V2.3 revision:** Surgical `applyV23HumanMadeRevision()` preserves parent fingerprint; topic 1 (subscription) gets 15 lime hand-drawn ownership icons + marker circles/arrows; varied maker behavior across board; topic 7 intentional minimal.
- **FAL V2.3 prompt:** Extended with human-made mark language, lime intervention behavior, anti-AI/vector-icon negative constraints (41 sections).
- **UI:** V2.3 review shows lime density, maker evidence, anti-AI result, human-made gate; +15 founder judgments (MORE_LIME, MAKE_ICONS_HAND_DRAWN, THATS_NDX, etc.).
- **Boundaries:** P0.5C.4 materiality preserved; P0.5C.3 character retained; FAL founder-triggered only; parent V2.3 fingerprint immutable.
- **Tests:** +13 P0.5C.4A tests; P0.5C.4 regressions updated. Build green.

---

## 2026-08-24 — P0.5C.4B Signature Lime Presence + Artifact Color Continuity + Semantic Accent Selection

- **Context:** After live V2.3 generation review — artifacts visually successful; signature NDX lime not guaranteed on every artifact. Rule: every NDX marketing artifact must contain ≥1 intentional visible signature-lime element (may be tiny — word, punctuation, circle, mark). NOT make every post lime-dominant.
- **Canonical token:** `NDX_SIGNATURE_LIME` = `#D6FF3B` (existing Editorial Utility signal lime). NDX-authored marks default to signature lime; source material keeps authentic colors; arbitrary red NDX marks rejected.
- **Domain:** `SignatureLimeAccentSelection`, word/punctuation accents, presence vs dominance evaluations, `PerceptibleSignatureEvaluation`, `NDXAuthoredColorOwnershipEvaluation`, `FeedSignatureColorContinuityEvaluation`, `SIGNATURE_LIME_REVISION` micro-revision path. Topic 3 calibration: APOLOGY word + NDX circle → signature lime (not red).
- **Generic:** `shared/site00-studio-world-production/signatureBrandTrace/` — configurable `SignatureBrandTraceRequirement` for future clients (NDX adapter required=true, others not forced).
- **Round 01 gate:** materiality + human-made + **signature lime presence** required before lock.
- **FAL:** explicit SIGNATURE LIME REQUIREMENT, semantic accent, color ownership sections (46 prompt sections).
- **Tests:** +8 grouped P0.5C.4B tests (~30 requirements). P0.5C.4/4A regressions green. Build green.

---

## 2026-08-24 — P0.5D.2 Live Signal Source Acquisition + Connector Wiring + Weekly Forecast Proving Run

- **Context:** Move P0.5D.1 from MANUAL_CONNECTED to PARTIALLY LIVE-CONNECTED cultural intelligence. P0.5D.1 methodology unchanged — bottleneck was source acquisition (live external sources connected: 0).
- **Live source stack:** PUBLIC_RSS web/news discovery (production-connected via live BBC feed health check, no API key); EVENT_CALENDAR manual_connected (curated seed + manual); SEARCH_TRENDS + SOCIAL_TRENDS honestly NOT_CONNECTED; manual founder/editorial first-class.
- **Generic domain:** `LiveSourceCapabilityAudit`, `executeLiveIntelligenceRefreshRun`, `WeeklySignalQueryPlan`, `SourceCoverageEvaluation`, `SignalDiscoveryDiversityEvaluation`, `EventPreparationPackage`, extended `ClientIntelligenceConfiguration`, `WeeklyOpportunityOriginBalanceEvaluation`.
- **Service:** `refreshLiveIntelligence`, `addManualFounderSignal`, `runLiveProvingRun` (NDX_LIVE_CULTURAL_INTELLIGENCE_PROVING_RUN_01 → NDX_WEEKLY_CULTURAL_FORECAST_LIVE_01), founder-selective `promoteLiveOpportunityItem` (no auto bulk promotion).
- **UI:** `/projects/ndxbook/cultural-intelligence/sources` source health + refresh + manual submission; main CI page proving run + selective promote; weekly forecast provenance preserved.
- **Boundaries:** FAL_REQUESTS=0 for refresh/forecast; no autonomous publishing; Brand Character/Canon unchanged; P0.5D.1 pipeline preserved.
- **Tests:** +8 grouped P0.5D.2 tests (50 requirements). P0.5D.1 regressions green. Build green.

---

## 2026-08-24 — V2.3 Founder Revision Notes + Auto FAL Re-render Pipeline

- **Context:** Revision labels (NEEDS_LIME, etc.) previously saved judgment only — no note, no FAL re-render.
- **Pipeline:** Note modal → contract update → FAL with founder revision directive; parent asset as reference when available.
- **UI/API:** `marketing_expression_experiment_01_v23_founder_revision`; approval labels save immediately.

---

## 2026-08-24 — V2.3 slide selection fix + signature-lime board readiness banner

- **Context:** Founder could not select V2.3 grid cells on mobile; asked whether board has signature-lime FAL instructions or needs new board version.
- **Selection fix:** `selectedId` grid highlight; images `pointer-events: none`; revision modal blocks grid until cancel; SELECTED headline.
- **Board readiness:** Banner detects `SIGNATURE LIME REQUIREMENT` in prompts. Legacy boards: re-formulate V2.3 (clears images) or per-slide NEEDS LIME revision. No V2.4 needed.

---

## 2026-08-24 — Campaign production wall wired to V2.3 marketing expression slides

- **Context:** Founder reported campaign production wall (CAMPAIGN WALL / Feed Preview) was not using latest marketing expression slides (V2.3 art-board materiality). Board showed V2.1-era Slide 01 assets despite V2.3 being current.
- **Root cause:** `ndxbookExperiment01Adapter` and `marketingCampaignProductionService` sourced `experiment01V21` for board init + Round 02 contracts; Round 01 lock gate already required V2.3 — mismatch.
- **Fix:** Adapter maps `experiment01V23.generatedArtifacts` → Slide 01 assets; service requires V2.3 before init; Round 02 uses V2.3 contract context. UI init copy → V2.3.
- **Founder action:** If board already initialized with V2.1 assets, re-initialize campaign board after V2.3 artifacts are generated to refresh wall images.
- **Tests:** P05E + P0.5C.3 updated; 40 tests green. PR #378 merged.

---

## 2026-08-24 — P0.5C.5 First-Person Authorship + Public Copy Translation + Campaign Caption Synthesis

- **Context:** Sprint P0.5C.5 — visual art direction strong but public artifacts exposed internal production language (CHARACTER BEAT, WHAT NDX NOTICED, PRIMARY EDITORIAL IDEA, CONTROLLED MISBEHAVIOR, etc.). Need strict internal/public boundary + downstream automated Instagram caption synthesis after slides are caption-ready.
- **Architecture:** Generic `shared/site00-studio-world-production/publicAuthorship/` (PublicAuthorshipMode, PublicCopyTranslation, InternalLabelQuarantine, ThirdPersonSelfReferenceEvaluation, PersonalAuthorshipEvaluation, PublicArtifactExportEvaluation) + `campaignCaption/` (CampaignCaptionSystem, CaptionReadinessEvaluation, CaptionSequenceRelationshipEvaluation). NDX adapter: `shared/site00-brand-lore/firstPersonAuthorship/`.
- **FAL V2.3:** `buildFalPublicCopySections()` — internal guidance separated; explicit DO NOT PRINT internal labels. Negative constraints extended.
- **V2.3 revision:** `applyV23PublicCopyRevision()` surgical path; `applyV23PublicCopyRevisionAll()` service. Preserves C.4/C.4A/C.4B/C.3 art direction.
- **Captions:** `synthesizeCampaignCaptions()` + Campaign Board UI (SYNTHESIZE CAPTIONS, founder judgments THAT_SOUNDS_LIKE_ME etc.). Draft after generated slides; final after full lock. SocialContentPackage + CompleteSocialContentPackage caption fields extended.
- **Boundaries:** Brand Character/Canon unchanged; no autonomous publishing; cross-platform caption independence preserved.
- **Tests:** 50 P0.5C.5 requirements in `firstPersonAuthorshipP05C5.test.ts`. Build green.

---

## 2026-08-24 — P0.5E.2 NDX Book Cultural Language + Content Ontology + Motion Character Foundation

- **Context:** Sprint P0.5E.2 — formalize NDXBOOK book-based cultural language/content ontology and motion character system foundation. Architecture only — no embodied character visual design, no FAL/LoRA, no generation.
- **Generic Studio World:** `shared/site00-studio-world-production/bookLanguage/` (BookLanguageContextEvaluation, memory mapping) + `motionCharacter/` (MotionCharacterSystem, HumanMotionTraceSystem, PhysicalBookBehavior).
- **NDX adapters:** `shared/site00-brand-lore/ndxBookCulturalLanguage/` (terminology forensic, NdxBookCulturalLanguageSystem, NdxContentOntology, NdxAudienceBookBehavior, CrossSurfaceBookProgression) + `ndxMotionCharacter/` (motion thesis, 12 behavior modes, platform differentiation, EmbodiedBrandCharacterFoundation, EmbodiedCharacterDiscoveryReadiness).
- **Terminology:** Forensic audit classifies SLIDE/FILE/ARCHIVE/etc.; historical CASE FILE identifiers immutable; public language PAGE/BOOKMARK/FLIP BACK/DOG-EAR/ERRATA/MARGIN NOTE/FOOTNOTE/ADD IT TO THE BOOK; FILED not canonical public completion language.
- **Ontology:** FEED=THE PAGES, STORIES=THE MARGINS, REELS=THE BOOK IN MOTION, TIKTOK=THE THOUGHT BEING SPOKEN, INDEX=ACCUMULATED MEMORY. REUSE_THINKING_NOT_POSTS preserved via CrossSurfaceBookProgression.
- **Motion:** Core principle THE VIDEO SHOWS THE BOOK BEING MADE. 12 behavior modes (RABBIT_HOLE, RECEIPT_CAME_BACK, etc.) — flexible not templates. Embodied character distinct from founder + Brand Character; copyright cloning blocked; visual design NOT finalized.
- **UI/API:** `/projects/ndxbook/motion-character` — ProjectMotionCharacterPage with 9 review sections; API `motion_character_book_language_*` actions.
- **Tests:** 28 requirements in `bookLanguageMotionCharacterP05E2.test.ts`. Build green.

---

## 2026-08-24 — P0.5C.5A V2.3 Regeneration Recompilation + Current-Contract Authority

- **Context:** Sprint P0.5C.5A — fix critical generation-path defect where `generateExperiment01V23ArtifactAsset` dispatched stored `generationContract.prompt` instead of recompiling from current structured V2.3 contract. V2.3 remains current experiment (no V2.4).
- **Architecture:** Generic `shared/site00-studio-world-production/generationAuthority/` (GenerationAuthorityModel, GenerationPromptSnapshot, PromptFreshnessEvaluation, ContractCoverageEvaluation, PublicAuthorshipEvaluation). V2.3 adapter: `v23GenerationAuthority.ts`, `v23GenerationAuthorityConstants.ts`.
- **Generation pipeline:** CURRENT CONTRACT → validate → compile FAL prompt → immutable prompt snapshot → fingerprint → FAL → asset linked to snapshot. `REGENERATE_CURRENT` (default) recompiles; `REPLAY_GENERATION` uses historical snapshot intentionally.
- **Contract mutation:** `applyV23PublicCopyRevisionAll()` + `markV23ArtifactPromptStale()` mark prompt stale — no automatic FAL/Anthropic.
- **Board:** `v23BoardReadiness` evaluates selected asset lineage (C.4A/C.4B/C.5); Round 01 lock requires current lineage. `selectedGenerationAssetId` authority implemented.
- **UI:** Experiment 01 page — CONTRACT/PROMPT/READINESS panels, C.4A/C.4B/C.5 status, GENERATE CURRENT V2.3 / REGENERATE CURRENT / REPLAY HISTORICAL PROMPT. Client-safe `v23BoardReadinessClient.ts` for browser bundle.
- **Tests:** 14 requirements in `v23GenerationAuthorityP05C5A.test.ts`; 65 related regression tests green. Build green. Deploy v56.

---

## 2026-08-24 — P0.5E.3 Embodied NDX Character Discovery + Human Complexity Model

- **Context:** Sprint P0.5E.3 — full discovery methodology for recurring embodied NDX character (P0.5E.2 foundation). Architecture/discovery only — NO face finalization, NO FAL, NO character generation.
- **Generic Studio World:** `shared/site00-studio-world-production/embodiedCharacterDiscovery/` — psychology, intelligence, contradictions, humor, emotional range, voice, everyday life, book relationship, physical behavior, camera relationship, style hypothesis, cultural life, scenario tests, humanity evaluation, casting readiness, archetype/beauty collapse guards, 12-round discovery interview.
- **NDX adapter:** `shared/site00-brand-lore/ndxEmbodiedCharacterDiscovery/` — founder visual north-star evidence (Reference Board 01: #2,#5,#9,#17,#18; Board 02: #2,#8) as VISUAL_TENDENCY_HYPOTHESES not canon; African-American cultural life foundation; 12 scenario stress tests; seed psychology from Brand Character DNA (selected inheritance).
- **Platform model preserved:** Stories=Margins, TikTok=thought being worked out, Reels=Book in motion, Feed=Pages, REUSE_THINKING_NOT_POSTS.
- **Next casting spec (architecture only):** 12 candidates representing SAME written character — not generated this sprint.
- **UI/API:** `/projects/ndxbook/embodied-character` — Character Discovery workspace with 17 sections, interview save/resume, founder judgments, founder-triggered synthesis.
- **Tests:** 16 requirements in `embodiedCharacterDiscoveryP05E3.test.ts`. Build green. Deploy v57.

---

## 2026-08-24 — V2.3 batch GENERATE ALL parallel FAL + durable attempt tracking

- **Context:** Founder reported V2.3 board **GENERATE ALL NINE** stopped/timed out after slide 2 — not firing all FAL requests at once.
- **Root causes:** (1) `executeExperiment01GenerationWork` looped sequentially (9× FAL wall time); (2) `activeGenerationAttempts` in-memory only — Railway poll on another instance triggered `reconcileStaleExperiment01Generation` and reset remaining GENERATING slides to NOT_GENERATED mid-batch.
- **Fix:** Parallel FAL via `Promise.all` over pending artifact IDs; single merge save (visual formulation pattern). Persist `experiment01GenerationTracking` `{ version, attemptId, startedAt }` on run; stale reconcile skips when fresh attempt &lt; 15 min (matches synthesis pattern). Cleared on batch finalize. Integrated with P0.5C.4B.1 V2.3 supersession guards.
- **Tests:** `experiment01StaleGeneration.test.ts` — fresh V2.3 attempt not reconciled; V2.3 generateAll fires 9 FAL in one batch. All targeted marketing-expression tests green.
- **Ship:** API-only — Railway redeploy from `main` after merge; no cPanel ZIP unless UI touched.

## 2026-08-24 — P0.5C.4B.1 Signature Lime Restraint + Queue Supersession

- **Context:** Founder reported P0.5C.4B overcorrected — FAL rendered lime as default ink across handwriting, icons, annotations. Sprint also required immediately superseding stale V2.3 generation queue compiled pre-C4B.1 without auto-regenerating after implementation.
- **Root cause:** `falPromptCompilerV23` defaulted all NDX marks/icons to signature lime; `humanMadeMarks` set `limeApplied: true` on every mark; `limeIntervention` derived MODERATE+ density from icon counts — HUMAN_MADE ↔ LIME coupling.
- **Canonical principle:** LIME PRESENCE REQUIRED · LIME PROMINENCE PROHIBITED. New `signatureLimeRestraint.ts` — ChromaticAttentionHierarchy, SignatureLimeRestraintMode, LimeProminenceEvaluation, FeedChromaticRhythm; decoupled human-made color from lime.
- **Phase 0:** `experiment01V23Supersession.ts` + service reconcile on GET — marks run `SUPERSEDED_BY_METHODOLOGY` / reason `P0.5C.4B.1_SIGNATURE_LIME_RESTRAINT`; pending → `CANCELLED_SUPERSEDED` (not FAILED); completed → `PRESERVED_PRE_C4B1`; in-flight may complete once; blocks further FAL from stale queue; forensic report on experiment.
- **FAL:** Compiler bumped to `falPromptCompilerV23@P0.5C.4B.1`; dedicated SIGNATURE LIME RESTRAINT + CHROMATIC ATTENTION section; black/neutral default typography and icons; pre-C4B.1 snapshots → `STALE_PRE_C4B1`; REGENERATE_CURRENT recompiles C4B.1; REPLAY preserves history.
- **Round 01:** Lime restraint gate + current lineage requires C4B.1. UI founder review fields: lime role, attention target, restraint mode, prominence, human trace color, job status (CANCELLED/SUPERSEDED vs FAILED).
- **No V2.4.** No automatic regeneration after sprint — founder REGENERATE CURRENT only.
- **Tests:** `artBoardMaterialityP05C4B1.test.ts` (14) + updated P05C4B/P05C5A. Build green.

---

## 2026-08-24 — Embodied Character Discovery synthesize button fix

- **Context:** Founder reported **SYNTHESIZE CHARACTER (FOUNDER-TRIGGERED)** on `/projects/ndxbook/embodied-character` did nothing.
- **Root cause:** Store adapter was **memory-only** — on Railway multi-instance, initialize/synthesize could land on different pods; synthesize threw "not initialized" with no UI error. `act()` swallowed failures silently.
- **Fix:** Supabase persistence via `site00_methodology_validation_runs` (`NDX_EMBODIED_CHARACTER_DISCOVERY_DB_ID`, mode `NDX_EMBODIED_CHARACTER_DISCOVERY`); durable store adapter with vitest memory fallback. UI: catch API errors, show alert panel, success notice, auto-navigate to SYNTHESIS tab on success.
- **Ship:** Railway API redeploy + cPanel ZIP for UI error/feedback changes.

---

## 2026-08-24 — Embodied Character page white screen (Supabase row id collision)

- **Context:** `/projects/ndxbook/embodied-character` showed a blank white screen after Supabase persistence shipped.
- **Root cause:** `NDX_EMBODIED_CHARACTER_DISCOVERY_DB_ID` was accidentally set to the **same UUID** as `NDXBOOK_CONTENT_OPERATIONS_DB_ID` (`c4e1a2b3-0013-4000-8000-000000000001`). GET returned the content-operations run (same `projectId: ndxbook`) as the embodied-character run; React crashed rendering missing fields (`castingReadiness`, `culturalLife`, etc.).
- **Fix:** New unique row id `c4e1a2b3-0015-4000-8000-000000000001`; Supabase GET filters by `mode` + `isNdxEmbodiedCharacterDiscoveryRun()` shape guard. Tests assert id uniqueness and reject foreign payloads.
- **Founder action:** Re-open page — should show INITIALIZE (or prior discovery state once initialized on the new row). Railway API redeploy required.

---

## 2026-08-24 — P0.5E.4 Founder Character Discovery Room + Pre-Casting Synthesis Gate

- **Context:** Sprint P0.5E.4 — continue from P0.5E.3 embodied character foundation. P0.5E.3 seeded psychology/intelligence/contradictions/etc. as **SYSTEM_SEEDED proposals**; founder must confirm/revise/reject before casting. Build interactive Founder Character Discovery Room — character truth before visual identity. NO FAL, NO face selection, NO Character Bible synthesis auto-advance.
- **Generic Studio World:** `shared/site00-studio-world-production/embodiedCharacterFounderDiscovery/` — 28 CharacterDiscoveryDomains, scenario-based discovery with NONE_OF_THESE/SOMETHING_ELSE/IT_DEPENDS/I_DONT_KNOW_YET escape options, FounderCharacterJudgment, CharacterContradiction engine (rejects generic adjective pairs), CharacterFlawProfile (blocks secretly flattering flaws), uneven CharacterIntelligenceMap, CharacterHumorBehavior, CharacterRelationshipModel, CulturalKnowledgeBoundary, PublicPrivateCharacterDifference, CharacterDiscoveryLedger (lineage-preserving), CharacterTruthConfidence, extended EmbodiedCharacterHumanityEvaluation, CharacterSynthesisPreview, FounderCharacterRecognitionEvaluation (YES_I_KNOW_HER gate, not inferrable), CharacterCastingReadinessEvaluation.
- **NDX adapter:** `shared/site00-brand-lore/ndxEmbodiedCharacterFounderDiscovery/` — forensic audit of P0.5E.3 seeded content (starting readiness BLOCKED_FOUNDER_DISCOVERY_REQUIRED); 4 NDX scenarios (wrong receipt, enemy excellent point, 1:43am rabbit hole, wrong at dinner); seeds contradictions/flaws/intelligence/cultural boundaries/book discovery from P0.5E.3 base; 18 visual tendency hypotheses as evidence not canon.
- **API/UI:** Supabase persistence via `site00_methodology_validation_runs` (`NDX_FOUNDER_CHARACTER_DISCOVERY_DB_ID`, mode `NDX_FOUNDER_CHARACTER_DISCOVERY`). Routes: `founder_character_discovery_*` actions. UI: `/projects/ndxbook/character/discovery` — ProjectFounderCharacterDiscoveryPage with 12 discovery sections (forensic, scenarios, traits, contradictions, flaws, intelligence, voice lab, book, visual hypotheses, synthesis preview, I KNOW HER gate, casting readiness). Link from P0.5E.3 embodied-character page.
- **Casting gates:** READY_FOR_CHARACTER_SYNTHESIS and READY_FOR_CHARACTER_CASTING_EXPLORATION remain false until founder completes discovery + explicit YES_I_KNOW_HER. FAL_REQUESTS=0.
- **Tests:** 46 requirements in `embodiedCharacterFounderDiscoveryP05E4.test.ts`. Build green. Deploy v59 after merge.

---

## 2026-08-24 — P0.5E.5 Character Bible Ingestion + Continuity Authority + Provider-Aware FAL Pipeline

- **Context:** Sprint P0.5E.5 — build generic Studio World embodied-character continuity pipeline architecture WITHOUT final NDX casting, face selection, Character Bible approval, FAL generation, or LoRA training. Pipeline must accept future approved Character Bible and compile through continuity → reference pack → scene contract → provider capability → FAL contract → QA → founder review. Pre-casting mode blocks production generation.
- **Generic Studio World:** `shared/site00-studio-world-production/characterContinuityPipeline/` — EmbodiedCharacterBible, CharacterBibleIngestionPipeline (raw source preservation + receipts), CharacterBibleAudit (character truth vs visual readiness separated), CharacterContinuityBible, identity anchors + variation governance + negative identity constraints, CharacterReferencePack + scoped ReferenceAuthorityEvaluation, CharacterSceneContract + compiler, FAL CharacterGenerationCapability registry + schema discovery states, model selection (identity-first), ProviderCharacterGenerationContract + model-aware compiler, PRE_CASTING_PIPELINE_MODE, CharacterGenerationSnapshot + versioning/invalidation, identity vs behavior fidelity QA, video/multi-scene continuity, BookContinuityContract, voice pipeline architecture, trained-identity architecture (no training), provider fallback policy, model bake-off architecture only.
- **NDX adapter:** `shared/site00-brand-lore/ndxCharacterContinuityPipeline/` — DB id `c4e1a2b3-0016-4000-8000-000000000001` (must not collide with P0.5E.3 `0015`); mock structured character fixtures only (NOT NDX identity); Book/motion terminology integration; forensic audit helper.
- **API/UI:** Supabase persistence via `site00_methodology_validation_runs` (mode `NDX_CHARACTER_CONTINUITY`). Actions: `character_continuity_get|initialize|ingest_bible|ingest_synthesis|preview_contract|mock_fixture_test`. UI: `/projects/ndxbook/character/continuity` + `/review` — ProjectCharacterContinuityPage (Audit, Bible, Continuity, References, FAL, Generation, Review sections). Nav link from experiments hub.
- **Gates:** `PRODUCTION_GENERATION_BLOCKED_CHARACTER_NOT_CAST`; `FAL_REQUESTS_FOR_CHARACTER_GENERATION=0`; mock fixture test proves pipeline without inventing NDX woman. Final face/ visual identity / training / production generation all remain false.
- **Tests:** 61 requirements in `characterContinuityP05E5.test.ts`. Build green. Deploy v61 after merge.

---

## 2026-08-24 — Founder mobile capture-auth bootstrap page

- **Context:** Founder codes from mobile; asked how to configure Railway `SITE00_CAPTURE_STORAGE_STATE_*` without a laptop. Prior answer required Playwright codegen on desktop.
- **Built:** Phone-friendly founder bootstrap — export Playwright storage state from current signed-in admin session.
  - **API:** `POST /api/capture-auth-bootstrap` (admin-only) validates refresh token, builds signed `baw_session_rt` + Supabase `localStorage` entries → Playwright `storageState` JSON for Railway `SITE00_CAPTURE_STORAGE_STATE_JSON`.
  - **Shared:** `buildCaptureStorageState.ts` + tests; `sessionRefreshCookie.ts` extracted from session-cookie handler.
  - **UI:** `/control/debug/capture-auth` → `/admin/site00/debug/capture-auth` — EXPORT FOR RAILWAY button, copy JSON, Railway step list.
  - **Visual dev link:** When authenticated refs not VALID, panel links to bootstrap page.
- **Founder flow (phone):** Sign in on site00.com → open `/control/debug/capture-auth` → EXPORT → copy JSON → Railway Variables → redeploy API → CAPTURE / REFRESH REFERENCES → PROJECTS DESKTOP: VALID.

---

## 2026-08-24 — Art board slide inspect lightbox

- **Context:** Founder requested tapping a slide on the Experiment 01 art board should enlarge the image in a popup with an X close icon for closer inspection.
- **Built:** `Site00ImageInspectLightbox` — full-screen overlay with enlarged image, caption, 44px × close button, backdrop tap + Escape dismiss. Wired into `ProjectBrandMarketingExpressionExperiment01Page` grid: tap generated slide opens lightbox while preserving slide selection/review flow.
- **Ship:** PR #390 merged; deploy v62 (`index.BAVo19wc.js`).

---

## 2026-08-24 — P0.5C.6 Visual Appetite Authority + Bespoke Art Direction Dominance

- **Context:** Sprint P0.5C.6 — correct NDX Marketing Expression generation hierarchy. Synthesize V2.1 visual appetite (graphic design, cultural participation, feed-stopping power) with V2.3 editorial/materiality discipline. Principle: **ARTISTICALLY_RICH_COGNITIVELY_SIMPLE**. Amend V2.3 methodology only — no V2.4. No FAL generation during sprint.
- **Generic Studio World:** `shared/site00-studio-world-production/visualAuthority/` — `VisualAuthoritySystem`, design authority chain, bespoke art direction contract, pre-reading appetite gate, text-removal test, evidence role evaluation, topic-specific art direction, feed artistic range, forensic comparison, visual discovery inheritance.
- **NDX V2.3 integration:** `visualAuthorityC6.ts`; `falPromptCompilerV23@P0.5C.6`; pre-C6 queue supersession; `ROUND_01_VISUAL_AUTHORITY_GATE`; 17-section FAL compiler order (art direction before editorial hierarchy).
- **UI:** Experiment 01 — **VISUAL AUTHORITY REVIEW — P0.5C.6** 3×3 checklist section.
- **Tests:** `artBoardMaterialityP05C6.test.ts` (11 tests); 70 artBoard tests green. FAL_REQUESTS=0; REGENERATE CURRENT compiles P0.5C.6.
- **Ship:** deploy v63 (`index.QrvF_fKd.js`). Founder: review VISUAL AUTHORITY board, then REGENERATE CURRENT when ready.

---

## 2026-08-24 — P0.5E.4A Adaptive Founder Character Calibration

- **Context:** Upgrade P0.5E.4 Founder Character Discovery from static questionnaire to adaptive PROPOSE → REACT → UPDATE calibration loop. Founder role = recognition not creation. P0.5E.4 methodology preserved.
- **Generic Studio World:** `shared/site00-studio-world-production/founderCharacterCalibration/` — calibration reactions, inference, priority engine, session state, human-readable synthesis, cognitive-load guard, forensic audit.
- **NDX adapter:** `ndxCalibrationAdapter.ts` — migrates P0.5E.4 evidence into calibration moments (scenarios with system predictions, contradiction/flaw/intelligence behavioral tests, voice/book/visual clusters, synthesis reads, disconfirming tests, adaptive follow-ups).
- **API/UI:** `founder_character_discovery_calibration_continue|reaction|synthesis`; `/projects/ndxbook/character/discovery` — primary CALIBRATION card (CONTINUE CALIBRATION, one moment at a time, 5 reactions); INPECT tab for legacy sections; human-readable synthesis tab.
- **Tests:** `embodiedCharacterFounderDiscoveryP05E4A.test.ts` (13 tests) + P05E4 (46) preserved. FAL=0; casting blocked until YES_I_KNOW_HER.

---

## 2026-08-24 — V2.3 apology slide (topic 3) generation after supersession

- **Context:** Founder reported "WE OWE HER AN APOLOGY." V2.3 slide (`bma-exp01-v23-3`) would not generate. Root cause: after P0.5C.4B.1/C.6 methodology supersession, pending queue jobs were `CANCELLED_SUPERSEDED` but `assertV23GenerationAllowed` blocked **all** generation including per-slide `REGENERATE_CURRENT`; UI only showed regenerate for slides that already had images — leaving never-generated slides (like culture/apology) with no action.
- **Fix:** Split supersession guards — `assertV23BatchGenerationAllowed` (batch still blocked) vs `assertV23SingleArtifactGenerationAllowed` (allows `REGENERATE_CURRENT` / `REPLAY_GENERATION` per slide after supersession). Clear `CANCELLED_SUPERSEDED` → `COMPLETED` on successful single generate. UI: **GENERATE CURRENT** button for slides without images; hide batch "GENERATE REMAINING" when superseded; guidance copy.
- **Tests:** `artBoardMaterialityP05C4B1.test.ts` — new case generates `bma-exp01-v23-3` after supersession with current C4B.1 prompt.
- **Founder:** Select apology slide → tap **GENERATE CURRENT** (or REGENERATE if image exists). Batch generate remains blocked after supersession by design.

---

## 2026-08-24 — P0.5E.4B.1 Neural Voice Casting Provider + Synthetic Placeholder Retirement

- **Context:** Founder reported P0.5E.4B browser SpeechSynthesis auditions sound robotic ("robots trying to sound like women"). Sprint preserves full P0.5E.4B calibration methodology while replacing founder-facing audition provider with FAL neural TTS (MiniMax Speech-02 HD).
- **Topics:** `CharacterVoiceProviderAuthority` (browser → `DEV_PLACEHOLDER`); `NeuralVoiceCastingModelSelection`, `NeuralVoiceCandidateIdentity`, `NaturalConversationalPerformanceContract`, `NeuralVoiceNaturalnessEvaluation`; FAL generation service; human-woman test gate separate from character fit; Voice Lab UI neural casting mode with cost estimate + START NEURAL VOICE AUDITION; placeholder judgments preserved as `PLACEHOLDER_CALIBRATION_EVIDENCE`.
- **Provider:** FAL `fal-ai/minimax/speech-02-hd` with preset female voices (CalmWoman, FriendlyWoman, WiseWoman, SoftWoman); same-line control `"WAIT. NO, BECAUSE THAT ACTUALLY DOES NOT MAKE SENSE."`; founder-trigger only; no audio on page load.
- **Tests:** `embodiedCharacterVoiceP05E4B1.test.ts` (11 tests) + updated P0.5E.4B regressions (30 total voice tests pass); build OK (`ProjectFounderCharacterDiscoveryPage.Df7sh5IG.js`).
- **Founder:** Railway redeploy (requires `FAL_KEY`). GoDaddy deploy v69. Character Discovery → INSPECT → VOICE LAB → START NEURAL VOICE AUDITION. Ignore prior browser-TTS auditions as placeholder evidence.

---

## 2026-08-24 — Neural provider status UX fix (false NOT CONFIGURED banner)

- **Symptom:** Voice Lab showed `NEURAL VOICE PROVIDER NOT CONFIGURED` on fsbw-dev even when founder believed `FAL_KEY` was set on Railway.
- **Root causes:** (1) Check runs on **Railway API** (`api.site00.com`), not cPanel/frontend — exact var name `FAL_KEY` on the API service + redeploy required. (2) UI bug: estimate API `.catch()` set `neuralConfigured=false` on *any* failure (404/old API, auth), not only missing key. (3) `FAL: 0` header was hardcoded, not live.
- **Fix:** GET discovery syncs `neuralProviderConfigured` from live `FAL_KEY`; returns `neuralProviderConfigured` on GET; separate error message when estimate fails vs key missing; live `falRequests` in header; `FAL_KEY?.trim()` check.

---

## 2026-08-24 — Neural voice audition FAL voice_id fix (UNPROCESSABLE ENTITY)

- **Symptom:** START NEURAL VOICE AUDITION failed with `UNPROCESSABLE ENTITY` after provider configured.
- **Root cause:** FAL MiniMax accepted `English_CalmWoman` for clip 1, then rejected `English_FriendlyWoman`, `English_WiseWoman`, `English_SoftWoman` as invalid voice IDs on clips 2–4. FAL `@fal-ai/client` surfaces HTTP 422 as message `Unprocessable Entity`.
- **Fix:** Casting territories now use verified FAL preset IDs (`Calm_Woman`, `Lively_Girl`, `Wise_Woman`, `Soft_Girl`); FAL errors formatted with field-level detail; pitch coerced to integer in request compiler.
- **Founder:** **Railway API redeploy required** (not just cPanel). Then retry START NEURAL VOICE AUDITION.

---

## 2026-08-24 — NDX neural casting v2 (charisma / adult presence territories)

- **Founder feedback:** Round 1 MiniMax presets (Calm/Wise/Lively/Soft) too generic — last voice (Soft_Girl) closest on naturalness but none matched late-20s AA woman with attitude, personality, charisma.
- **Fix:** NDX adapter-owned territories (`ndxNeuralCastingTerritories.ts`) — Round 1: Exuberant_Girl, Energetic_Girl, Attractive_Girl, Soft_Girl with behavior-first performance direction (no dialect/caricature keywords). CLOSE on Soft_Girl → sibling round refines same woman (more attitude/grounded/Lovely_Girl/Exuberant_Girl variants). UI hints: mark CLOSE before next round.
- **Limitation:** MiniMax preset catalogue still TTS — full demographic fidelity may require future ElevenLabs bake-off or voice design sprint.
- **Founder:** Railway redeploy + optional cPanel v71. Mark closest voice CLOSE → GENERATE NEXT NEURAL ROUND; or START NEURAL VOICE AUDITION again for refreshed Round 1 voices.

---

## 2026-08-24 — Neural voice edit / re-prompt / regenerate loop (mirrors V2.3 slides)

- **Context:** Full chat arc: P0.5E.4B.1 neural voice casting on FAL MiniMax; provider status UX fix; FAL 422 invalid voice_id fix; NDX v2 territories for African-American woman late 20s attitude; founder asked voice system get same edit/re-prompt/regenerate loop as lime green campaign slides (Experiment 01 V2.3).
- **Topics:** Neural casting provider sprint; tunnel restart; NEURAL VOICE PROVIDER NOT CONFIGURED / UNPROCESSABLE ENTITY debugging; casting feedback (Soft_Girl closest but wrong demographic/energy); voice revision loop parity with V2.3 founder revision pipeline.
- **Decisions / outcomes:** Voice Lab now mirrors V2.3 pattern — approval judgments save immediately; revision judgments (TOO_FAST, TOO_POLISHED, VOICE_RIGHT_PERFORMANCE_WRONG, etc.) open founder note modal → contract update → neural re-synthesis; per-candidate **REGENERATE CURRENT** and **REPLAY HISTORICAL PROMPT**; `revisionHistory[]`, `promptSnapshots[]`, `generationAssets[]` on each hypothesis.
- **Changes:** `neuralVoiceFounderRevisionPipeline.ts`, `neuralVoiceRevisionEngine.ts`, `voiceFounderRevisionLabels.ts`; extended `CharacterVoiceHypothesis` types; service routes `founder_character_discovery_neural_voice_revision` + `_neural_voice_regenerate`; Voice Lab UI modal + buttons; tests `embodiedCharacterVoiceRevisionLoop.test.ts` (4 pass).
- **Founder:** Railway redeploy API from `main`. GoDaddy deploy for Voice Lab UI. Voice Lab → tap revision label → note → CONFIRM & RE-SYNTHESIZE; or REGENERATE CURRENT / REPLAY on any neural clip.

---

## 2026-08-24 — Experiments Hub scroll restore on refresh

- **Context:** Founder on `/projects/ndxbook/experiments` — browser refresh or return from an experiment reset scroll to top of hub ("homepage" of the index).
- **Fix:** `useExperimentsHubScrollRestore` + `experimentsHubScrollRestore.ts` — persist `sessionStorage` scroll Y per project slug; restore on hub mount with retry until content height allows; save on scroll (debounced) and `pagehide`.
- **Tests:** `experimentsHubScrollRestore.test.ts` (3 tests).
- **Founder:** GoDaddy deploy for UI bundle. Scroll down hub → refresh or open experiment → EXPERIMENTS HUB — should land at same scroll position.

---

## 2026-08-24 — Voice Lab CURRENT vs PRIOR tabs

- **Context:** Founder could not tell new neural voices from old when revisions/rounds stacked on one page — needed separate tab to know what's current vs prior.
- **Fix:** Voice Lab sub-tabs **CURRENT (N)** and **PRIOR (N)** — CURRENT = latest neural round only (judge/revise/regenerate); PRIOR = earlier neural rounds, placeholder evidence, superseded revision clips with play-only.
- **Files:** `voiceLabTabs.ts`, `ProjectFounderCharacterDiscoveryPage.tsx`; tests `voiceLabTabs.test.ts`.
- **Founder:** GoDaddy deploy → Voice Lab → CURRENT tab for active auditions; PRIOR tab for old rounds and pre-revision clips.

---

## 2026-08-24 — Voice Lab GENERATE NEXT NEURAL ROUND visibility

- **Context:** Founder could not find button to generate new voice packs after marking CLOSE — button required all four JUDGMENTS_COMPLETE and sat at bottom of long CURRENT tab.
- **Fix:** Unlock **GENERATE NEXT NEURAL ROUND** when any neural candidate has CLOSE/YES (or full round judged); pin highlighted panel at top of CURRENT tab; orange hint when still locked.
- **Files:** `voiceLabTabs.ts` (`canGenerateNextNeuralRound`, `nextNeuralRoundUnlockHint`), `ProjectFounderCharacterDiscoveryPage.tsx`; tests `voiceLabTabs.test.ts`.
- **Founder:** GoDaddy deploy → Voice Lab → CURRENT tab → mark CLOSE on closest voice → button appears at top (no need to judge all four).


---

## 2026-08-24 — Founder calibration closed-loop progress panel

---

---

## 2026-08-24 — P0.5C.6A Authored Artifact Grammar + Template Frame Removal + Human History Authority

- **Context:** P0.5C.6 improved bespoke artistic premise (e.g. subscription THEN/NOW shelf) but FAL outputs still read as infographic templates (top headline panel, bottom evidence box, header/body/footer hierarchy). Sprint required amending V2.3 FAL compiler — NOT V2.4 — with authored artifact grammar, human history authority, template frame removal; supersede stale queue; no auto-regeneration.
- **Fix:** Generic `site00-studio-world-production/authoredArtifact/` (AuthoredArtifactSystem, ArtifactHumanHistoryContract, TemplateFrameDetectionEvaluation, OverResolvedArtifactEvaluation, ArtifactGrammarDiversityEvaluation, AuthoredInterventionEvaluation). NDX adapter `authoredArtifactC6A.ts`. `falPromptCompilerV23@P0.5C.6A` — new prompt sections: AUTHORED ARTIFACT GRAMMAR, RAW VISUAL ARTIFACT, NDX INTERVENTION, HUMAN HISTORY, INFORMATION INHABITATION, ANTI-TEMPLATE FRAME, OVER-RESOLUTION GUARD. Authority order: content thesis → visual premise → raw artifact → bespoke composition → NDX intervention → human history → editorial information. Pre-C6A queue supersession (`artifactHasPreC6APrompt`, `V23_SUPERSESSION_REASON_C6A`). Round 01 gate includes authored artifact evaluation. UI: V2.3 review panel shows C.6A status.
- **Tests:** `artBoardMaterialityP05C6A.test.ts` (10 tests); 82 artBoard tests pass; build OK.
- **Founder:** GoDaddy deploy → Experiment 01 V2.3 → REGENERATE subscription slide (topic 1) under P0.5C.6A and compare: bespoke shelf strength, no infographic shell, NDX hands/thinking, information inside artwork. Railway redeploy for API/compiler path. No automatic FAL regeneration — founder triggers explicitly.


- **Context:** Founder disliked all nine current V2.3 slide selections — only per-slide REGENERATE CURRENT existed; batch generate only filled pending slots.
- **Fix:** **REGENERATE ALL V2.3 — NINE NEW TAKES (FAL)** on Experiment 01 V2.3 board when all nine generated; API `marketing_expression_experiment_01_v23_regenerate_all`; parallel batch regen from current contracts (sequential fallback when superseded).
- **Files:** `brandMarketingExpressionService.ts`, `ProjectBrandMarketingExpressionExperiment01Page.tsx`, `site00ProjectsApi.ts`, `api/site00/projects.ts`; test `artBoardMaterialityP05C4B1.test.ts`.
- **Founder:** GoDaddy deploy → Experiment 01 → V2.3 tab → after all nine exist, tap REGENERATE ALL (confirms cost).


- **Context:** Founder completed calibration work but room felt like an unclosed loop — no progress indicator, unclear what remained, no obvious path to synthesize/create character.
- **Fix:** Persistent **YOUR PROGRESS** panel (checklist + bar + GO TO NEXT STEP); CASTING tab human checklist; **GENERATE CHARACTER READ** CTA when `readyForCharacterSynthesis`; neural Voice Lab judgments now satisfy `voice_differentiation` gate; CALIBRATION shows direct YES count (3 required, ALMOST does not count).
- **Files:** `founderCharacterDiscoveryProgress.ts`, `ProjectFounderCharacterDiscoveryPage.tsx`, `ndxCastingReadinessBridge.ts`; tests.
- **Founder:** GoDaddy deploy → progress panel at top shows ✓/○ for each gate; tap next step; when green, GENERATE CHARACTER READ then Embodied Character Discovery link.


- **Context:** Founder reported YES I KNOW HER not unlocking casting; voice lab selections not appearing saved. Root cause: YES_I_KNOW_HER **was** persisting (`founderKnowsHer: true`) but P0.5E.4A calibration progress did not feed P0.5E.4 casting gates (still required 5 INSPECT trait confirmations). UI always showed "BLOCKED until YES_I_KNOW_HER" even after selection. Voice lab saved to API but UI showed no saved state.
- **Fix:** `ndxCastingReadinessBridge.ts` — calibration moments + domain confirmations satisfy discovery/gates; refresh readiness on GET; voice calibration moment writes voice lab judgment; CASTING tab shows human-readable blockers; header shows dynamic status; voice lab shows **Saved:** label + success notice on tap.
- **Tests:** `ndxCastingReadinessBridge.test.ts` (4 tests).
- **Founder:** Continue CALIBRATION (6+ moments) → I KNOW HER → CASTING tab lists any remaining gates. Voice lab: tap THAT'S HER — should show Saved line. Railway API redeploy required for backend bridge.

---

## 2026-08-24 — Founder trait propositions v2 (fluent INSPECT TRAITS)

- **Context:** Founder reported INSPECT → TRAITS incoherent / AI jargon (`PSYCHOLOGY • SYSTEM_SEEDED • HYPOTHESIS` + fragment statements).
- **Fix:** `ndxFounderTraitPropositions.ts` — 14 plain-language propositions in 6 sections; auto-migrate legacy runs on GET; TRAITS UI grouped with YES/ALMOST/NO/NOT SURE primary buttons + saved labels.
- **Tests:** `ndxFounderTraitPropositions.test.ts` (4 tests).

---

## 2026-08-24 — P0.5E.4B Adaptive Character Voice Casting + Auditory Calibration

- **Context:** Full sprint P0.5E.4B — split Language Lab from Voice Lab; auditory adaptive voice casting with persistent voice identity; P0.5E.5 integration; founder recognition-only UX (no acoustic parameters).
- **Topics:** Reclassify P0.5E.4 text Voice Lab as `CharacterLanguageEvidence`; generic `embodiedCharacterVoice/` module (identity, hypothesis, calibration rounds, inference, envelope, capability registry, contract, snapshot, continuity QA); NDX adapter + browser SpeechSynthesis playback for audition; API routes for round start, hypothesis judgment, pairwise, recognition, unseen-line test.
- **UI:** INSPECT → **LANGUAGE LAB** (existing text registers preserved) + **VOICE LAB** (auditory: START AUDITION, PLAY, YES/CLOSE/NO, compare, next round, voice recognition gate). Progress domains replace percentage completion.
- **Constraints preserved:** `FOUNDER_CHARACTER_VOICE_CONFIRMED: false` until explicit YES after emotion + unseen-line gates; no auto YES_I_KNOW_HER; no FAL on page load; synthetic calibration provider (FAL TTS registered as schema-review-required); Brand Character/Canon unchanged.
- **Tests:** `embodiedCharacterVoiceP05E4B.test.ts` (19 tests); full suite 2634 pass; build OK (`ProjectFounderCharacterDiscoveryPage.Dv5N4LYo.js`).
- **Founder:** Railway redeploy for API. GoDaddy deploy for UI. Character Discovery → INSPECT → VOICE LAB → START VOICE AUDITION.

---

---

## 2026-08-24 — Founder Workspace Experience Architecture (P0.5E.6)

- **Context:** Founder sprint to remodel NDXBOOK Studio World as one cohesive operating environment — editorial command-center IA, progressive disclosure (OPERATE / UNDERSTAND / INSPECT), artwork-first surfaces. Attached concept = visual authority; production screenshots = functional evidence only.
- **Architecture:** Generic `shared/site00-studio-world-production/founderWorkspace/` (attention hierarchy, experiment journey, types); NDX adapter `src/site00/config/ndxFounderWorkspace.ts`; `FounderWorkspaceShell` with persistent rail (OVERVIEW/CREATE/REVIEW/LEARN/INTELLIGENCE/CHARACTER/ARCHIVE), inspector drawer, shared components + `site00-founder-workspace.css`.
- **Surfaces:** Content Operations → editorial desk; Campaign Board → production wall + day lanes; Experiment 01 → board-first V2.3 shell with full legacy methodology in INSPECT; Experiments Hub → 6-stage methodology journey bar; Cultural Intelligence → radar room; Performance → observation room; Character Lab → synthesis operate layer + full calibration below; Archive page at `/projects/ndxbook/archive`.
- **Preservation:** All Layer 3 methodology (contracts, captions ROUND_VIEW, generation authority, trait/voice lab) moved to INSPECT — not deleted. No Brand Character/Canon mutation. No decorative FAL. 2680 tests pass; build green.
- **Ship:** PR #409 merged to `main`. Founder deploy: GoDaddy v79 ZIP → hard refresh.

---

## 2026-08-24 — Visual Reconstruction Engine P0.VR.1 (Experiments Hub pilot)

- **Context:** Founder sprint to build Studio World Visual Reconstruction Engine — screenshot-to-code reverse engineering with closed-loop render/compare/correct/region-lock. Pilot target: Experiments Hub remodel per concept (visual authority); production screenshots = functional evidence only.
- **Engine:** `shared/site00-studio-world-production/visualReconstruction/` — ingestion, browser chrome exclusion, region decomposition, blueprint, repository matchers, typography eval, Playwright renderer, pixelmatch+sharp comparison, heatmap, region locks, correction planner, convergence guard, match readiness, baseline architecture, report. `pixelmatch` dependency added.
- **Pilot UI:** `ExperimentsHubOperateLayer` — dark editorial hub with 6-stage methodology journey cards, recent experiments, quick actions; full index preserved in INSPECT. Route unchanged `/projects/ndxbook/experiments`.
- **Script:** `scripts/visualReconstruction/runExperimentsHubPilot.ts` — automated loop (4 iterations verified against preview). Synthetic band reference fixture for CI; founder concept PNG can replace fixture for calibration.
- **Tests:** `tests/visualReconstructionP0VR1.test.ts` (16 tests). Full suite 2706 pass; build green.
- **Constraints:** FAL=0; Brand Character/Canon unchanged; canonical experiment data preserved.

---

## 2026-08-24 — Account pages Desktop preview fix (PROJECTS / CTRL ROOM)

- **Symptom:** Founder toggled Desktop on mobile but PROJECTS kept showing mobile shell (bottom nav, ORIGIN bay) — felt blocked from desktop account pages.
- **Root cause:** `EcosystemShell` switched layouts only via CSS `@media (min-width: 1024px)`, ignoring shared `isPreviewDesktop` composer state used by IDNTY/Origin public routes.
- **Fix:** `EcosystemShell` now respects preview mode; phone + Desktop uses scaled artboard; `Site00EcosystemLayoutSwitch` on `/projects` and `/control` routes.

---

## 2026-08-24 — fsbw-dev project presence import error fix

- **Symptom:** Vite overlay on site00.fsbw-dev.com — `Failed to resolve import shared/site00-brand-lore/projectPresence/index.js` from `useProjectPresenceAccent.ts`.
- **Root cause:** fsbw-dev ran hook + shell integration from `cursor/project-presence-accent-02ac` without the shared `projectPresence` module on main.
- **Fix:** Merged P0.UI.1 project presence accent system to main (registry, resolver, ProjectPresenceScope, Site00Diamond). Build green; 13 tests pass.

---

## 2026-08-24 — Visual Reconstruction Engine P0.VR.1A (Founder reference calibration)

- **Context:** Sprint to calibrate VR engine against founder-approved desktop + mobile NDXBOOK workspace boards (cream/paper-led); upgrade from structural matching to multi-viewport design grammar + brand fidelity diagnosis. Supersedes dark-primary NDX workspace from P0.VR.1.
- **Engine additions:** `CALIBRATE` mode; design evaluation suite (luminosity, lime authority, host/client accent, artwork authority, container repetition, spatial rhythm, design grammar, brand essence, compositional similarity, focal hierarchy, typographic character, surface grammar, relational graph, design disconnect heatmap); `ReferenceMatchReadinessEvaluationV2`; `ResponsiveRelationshipModel`; forensic diagnosis; `runFounderReferenceCalibration`.
- **NDX adapter:** `shared/site00-brand-lore/visualReconstruction/ndxVisualReconstructionAdapter.ts` — paper `#FAF8F5`, ink, lime `#B7D236`, host red; `DARK_PRIMARY_NDX_WORKSPACE = SUPERSEDED_VISUAL_DIRECTION`; calibration routes for experiments-hub, campaign-board, content-operations.
- **Fixtures:** `ndxbook-workspace-desktop-primary.png` (1440×900) + `ndxbook-workspace-mobile-primary.png` (390×844); generator script `generateFounderReferenceFixtures.ts`.
- **UI:** Light cream founder workspace CSS tokens; Experiments Hub operate layer restyled light; calibration wrapper classes on campaign board + content ops desk.
- **Scripts:** `runFounderCalibration.ts`. Tests: `visualReconstructionP0VR1A.test.ts` (14 tests). Full suite 2720 pass; build green. FAL=0; Brand Character/Canon unchanged.

---

## 2026-08-24 — Project Presence Accent System P0.UI.1

- **Context:** Formalize Studio World rule — SITE 00 diamond inherits active project's canonical primary color; wordmark stays host-canonical. Generic data-driven system, not NDX-specific shell hack.
- **Engine:** `shared/site00-studio-world-production/projectPresenceAccent/` — resolver, color validation, contrast evaluation (keyline strategy), accent bleed guard, VR diamond evaluation (`evaluateProjectPresenceDiamond`, `adaptiveDiamondIsNotHostMutation`).
- **Registry:** `shared/site00-brand-lore/projectPresence/projectBrandPresenceRegistry.ts` — ndxbook lime `#B7D236`, frontal-slayer host red, unresolved studio-world/AIO → host fallback; arbitrary colors via registry entries.
- **UI:** `Site00Diamond`, `ProjectPresenceScope`, `useProjectPresenceAccent`; tokens `--site00-host-accent` + `--site00-project-presence-accent`; EcosystemShell scopes project context; origin/access/fast-travel use HOST_DEFAULT diamond.
- **VR integration:** HostClientVisualAuthorityEvaluation accepts project-presence diamond context; lime NDX diamond not flagged as host mutation.
- **Tests:** `projectPresenceAccentP0UI1.test.ts` (13 tests). Full suite 2733 pass; build green.

---

## 2026-08-24 — P0.VR.1C Campaign Board structural empty state + token sweep + artwork recomposition

- **Context:** Final implementation sprint from P0.VR.1B-S forensic diagnosis. Campaign Board pilot only — prove Studio World preserves spatial grammar of a creative operating surface before campaign content initializes.
- **Phase 1 token sweep:** Removed raw NDX hex literals from `site00-founder-workspace.css` (`#c8ff00`, `#161616`, `#0a0a0a`, `#333`, `#3a3a20`); replaced with `--ndx-lime`, `--ndx-surface-raised`, `--ndx-border`, etc. Retoned `.site00-fws-empty`, day nav, asset frames, pulse CTA, journey active, inspect trigger.
- **Phase 2 structural empty state:** Added `GhostSlot` + composition primitives under `founderWorkspace/`. `CampaignBoardProductionWall` always renders EditorialRail → day nav → Pages/Margins/Motion lanes with ghost geometry when `board === null`; removed `FounderEmptyState` + initialize panel substitution. Identity from `resolveCampaignIdentity(run)`; lane slots from `resolveCampaignBoardLanes(run)` (3+4+2 schema). Content Operations loading uses `WorkspaceLoadingState` only.
- **Phase 3 recomposition:** `FounderWorkspaceShell.hideWorkspaceHeader`; Campaign Board page opts in. Asymmetric lanes (Pages primary, Margins secondary, Motion MediaBand). Production actions → `QuietAction`/`InlineMeta` periphery; panel removed.
- **Shipped:** PR **#416** merged to `main`. Deploy **v84**. Tests: `campaignBoardP0VR1C.test.ts` (21); full suite **2835** pass; build green. FAL=0. Content Operations full recomposition deferred.

---

## 2026-08-24 — P0.CR.1 Cinematic Realism Lab (multi-provider evaluation pipeline)

- **Context:** Build reusable Studio World Realism Lab for luxury lifestyle / founder / influencer-grade AI video evaluation — multi-provider lanes, prompt compiler, hybrid still→video, founder review.
- **Architecture:** `shared/site00-studio-world-production/cinematicRealismLab/` — shot bible (10 types), realism canon, provider registry (Higgsfield, MiniMax/Hailuo, Kling, Veo, Runway, Hybrid), prompt compiler, reference packs, evaluation taxonomy, hybrid pipeline stages, experiment orchestrator, asset lineage, decision summary. Project adapters for ndxbook + frontal-slayer.
- **API:** `cinematic_realism_lab_*` on `/api/site00/projects` — founder-triggered queue/simulate/judgment/finalize only; honest readiness states (AUTH_REQUIRED / SCHEMA_REVIEW); placeholder assets until live provider wiring.
- **UI:** `/projects/:slug/realism-lab` (+ brief, providers, runs, review, continuity, decision). Visual lane comparison grid + founder judgments. Pilot: LUXURY CREATOR REALISM TEST 01.
- **Shipped:** PR **#417** merged to `main`. Deploy **v85**. Tests: `cinematicRealismLabP0CR1.test.ts` (15); full suite **2850** pass. FAL=0. Brand Character/Canon unchanged.

---

## 2026-08-24 — Character Lab calibration buttons fix (P0.5E.4A UX)

- **Issue:** Founder reported progress checklist / GO TO NEXT STEP buttons non-functional on Character Calibration — could not advance moments or reach synthesis.
- **Root cause:** Navigation only toggled React tab state without scrolling or loading next moment; `ndxContinueCalibration` could return stale resolved interaction when `currentInteractionId` lagged.
- **Fix:** `FounderCharacterCalibrationProgressPanel` in operate layer; next-step + incomplete checklist items call `founderCharacterDiscoveryCalibrationContinue`; scroll anchor to calibration workspace; filter resolved interactions on reload; touch-friendly CTAs.
- **Tests:** `founderCharacterCalibrationProgressPanel.test.ts` (2) + existing P0.5E.4A suite green.

---

## 2026-08-25 — P0.5E.4C I KNOW HER state transition fix + visual casting gate + candidate generation

- **Context:** After YES I KNOW HER on Character Lab synthesis, founder was routed back into calibration instead of entering visual casting. Sprint required fixing the state transition and implementing the missing CAST NDX visual casting stage (founder-triggered still generation, six candidates, judgments, LOCK HER → reference pack → continuity).
- **Root cause:** `founder_i_know_her` blocked synthesis readiness pre-read; recognition handler used `goToSection: 'CASTING'` (checklist tab) not a casting route; no `/character/casting` page or `visualCastingState` persistence after confirmation.
- **Fix:** Removed I KNOW HER from synthesis blocking gates; reordered progress (character read → I KNOW HER → visual casting); `saveFounderCharacterRecognition` + `promoteFounderRecognition` create `FounderCharacterRecognitionConfirmed`, `CharacterTruthSnapshot`, set `visualCastingReady`, navigate to `/projects/ndxbook/character/casting`; discovery return shows CHARACTER RECOGNIZED banner with explicit REOPEN CALIBRATION.
- **Architecture:** `shared/site00-studio-world-production/characterVisualCasting/` — snapshot, readiness, state machine, prompt contract, casting engine (rounds/candidates/judgments/merge/lock), provider selection; API actions on `/api/site00/projects`; `ProjectCharacterCastingPage` (cost gate, founder-triggered generate, mobile swipe review, LOCK HER → continuity). Placeholder stills until FAL dispatch; video requests = 0 during casting.
- **Shipped:** PR merged to `main`. Deploy **v87**. Tests: `embodiedCharacterVisualCastingP05E4C.test.ts` (10); full suite **2862** pass; build green. Brand Character/Canon unchanged; voice state preserved on visual promotion.

---

---

## 2026-08-25 — CAST NDX FAL generation wired (P0.5E.4C follow-up)

- **Context:** Founder reported CAST NDX page (`/projects/ndxbook/character/casting`) wasn't calling FAL — generation produced placeholder URLs only, never live stills.
- **Root cause:** UI explicitly passed `dispatchFal: false`; service defaulted `dispatchFal ?? false`; `castingEngine.generateCastingRoundPlaceholders` only set GENERATING status when dispatchFal true but no FAL API call existed anywhere in the pipeline.
- **Fix:** Added `api/_lib/site00Evolve/characterVisualCasting/castingFalDispatch.ts` — compiles prompt contracts via `compileCastingPromptFromContract`, calls GPT Image 2 through FAL (`buildFalImageInput`), uploads to Supabase storage (`site00/character-casting/{project}/{round}/{candidate}.webp`), applies results via `applyCastingGenerationResults`. Service defaults `dispatchFal` to `falConfigured()`; first round + next round both dispatch when FAL_KEY present. UI now calls generate without `false` flag; hero frame renders `<img>` for real preview URLs.
- **Discarded:** Duplicate embodied-character `/character/cast` route work on branch (reverted before ship).
- **Tests:** `embodiedCharacterVisualCastingP05E4C.test.ts` expanded (13) — prompt compile, apply results, vitest-mocked full generate path.

---

## 2026-08-25 — P0.CB.1 Founder creative ingestion + reference decomposition + production reconstruction

- **Context:** Build production-grade workflow for founder-created NDXBOOK launch carousel direction entering Studio World. Pilot: MEET NDX (9 slides), EVERYBODY HAS A PERSONAL BRAND (12), THINGS I SAVED THIS WEEK / ENTRY 001 (12). Critical rule: mood boards are REFERENCES not production assets — no bitmap crop/upscale as reconstruction.
- **Architecture:** `shared/site00-studio-world-production/founderCreativeIngestion/` — provenance (FOUNDER_CREATED, EXTERNAL_CHATGPT_CREATIVE_SESSION), reference decomposition engine, SlideReconstructionSpec, photography source modes (REFERENCE_ONLY through LOCK_CANONICAL), reverse-engineered photography prompts, Realism Lab provider bridge (no duplicate engine), sequence QA, creative signal learning (variation not template cloning). NDX adapter: `adapters/ndxLaunchRow01Pilot.ts`.
- **API/UI:** `founder_creative_ingestion_*` actions; `/projects/ndxbook/content-operations/founder-creative-ingest` workflow page (REFERENCE→DECOMPOSE→RECONSTRUCT→REVIEW→SEQUENCE→CAMPAIGN); Campaign Board INGEST FOUNDER CREATIVE link + Row 01 grid preview; PAGES lane shows 3 parent sequences (child slides nested, not flattened).
- **Shipped:** PR merged to `main`. Deploy **v88**. Tests: `founderCreativeIngestionP0CB1.test.ts` (15); full suite **2877** pass; build green. Brand Character/Canon/experiment lineage unchanged; founder-triggered generation only.

---

## 2026-08-25 — CAST NDX placeholder round FAL retry (P0.5E.4C UX unblock)

- **Context:** Founder generated first casting round before live FAL wiring shipped; page advanced to review with placeholder stills (`/api/placeholder/casting/...`) and the generate button disappeared (`castingCandidatesReady: true`).
- **Fix:** `castingRoundNeedsFalRetry` detects placeholder-only rounds; review UI shows **GENERATE STILLS WITH FAL**; `character_visual_casting_retry_fal` + `retryVisualCastingRoundFal` re-dispatches FAL on existing candidates via `prepareCastingRoundForFalRetry`. Cost gate now only shows when no round exists (prevents duplicate round on retry). Generating panel shown while FAL runs.
- **Tests:** `embodiedCharacterVisualCastingP05E4C.test.ts` (15) — placeholder detection + retry path.

---

## 2026-08-25 — CAST NDX FAL background jobs (tunnel-safe generation)

- **Context:** Founder codes via tunnel (tocode) that constantly refreshes; synchronous FAL casting requests were dropped mid-generation when HTTP disconnected.
- **Fix:** Casting FAL dispatch now runs as background jobs (`castingFalBackgroundJob.ts` + shared `falBackgroundJob.ts`): POST returns immediately (202 when background), `falGenerationTracking` persisted on `visualCastingState`, worker via `setImmediate`, stale reconcile + auto-resume on GET after 45s. UI polls every 5s while generating; copy says safe to refresh. Applies to generate, retry, and next-round FAL paths.
- **Note:** Marketing Expression Experiment 01 batch FAL already used this pattern; other sync FAL endpoints (e.g. Experiment G visual generate, single-artifact) not migrated in this pass.
- **Tests:** `embodiedCharacterVisualCastingP05E4C.test.ts` (16).

---

## 2026-08-25 — Founder creative ingestion FAL dispatch + background reconstruction (P0.CB.1)

- **Context:** Founder reported **DECOMPOSE ALL REFERENCES** on `/projects/ndxbook/content-operations/founder-creative-ingest` did nothing — slide specs built but no FAL photography reconstruction; broken reference preview (wrong asset per sequence).
- **Root cause:** Same class of bug as CAST NDX — `dispatchFal` defaulted false; UI passed false; decompose only split reference metadata; `decomposeSequenceReference` used `referenceAssets.at(-1)` so all sequences shared last board; placeholder reference URLs; MEET NDX default `USE_EXISTING_ASSET` / others `REFERENCE_ONLY` blocked batch without mode resolution.
- **Fix:** `founderCreativeFalDispatch.ts` + `founderCreativeFalBackgroundJob.ts` (batch + single-slide, checkpoint saves, stale reconcile/resume). `decomposeAll` / `decomposeSequence` now call `resolveReconstructionPhotographyModes` then queue FAL when `FAL_KEY` set (MEET NDX slide 1 → `USE_EXISTING_ASSET` + HQ canonical; other photo slides → `GENERATE_FROM_REFERENCE`). Deterministic `ref-board-${sequenceId}` asset IDs. UI: 5s polling, progress panel, per-sequence reference URL, production `<img>` when URL ready, retry on failure. API returns 202 for background decompose/generate.
- **Tests:** `founderCreativeIngestionP0CB1.test.ts` (16) — FAL batch completes on decompose, photography mode resolution.

---

## 2026-08-25 — P0.FILM.1 Brand Film Bible + Shot Library + Script-to-Scene Planner + Model Routing + Founder Dailies + Scene Deck

- **Context:** Build generic Studio World film production architecture so founder can supply script/storyboard/concept and Studio World autonomously derives production layer (wardrobe, environment, shot contracts, model routing, dailies, scene deck, rough cut EDL). Pilot: NDXBOOK Reel 01 APPARENTLY I HAVE TO INTRODUCE MYSELF (MINI_VLOG_INTRO, 12 shots) and Reel 02 THAT CANNOT BE RIGHT — 001 (RABBIT_HOLE_INVESTIGATION, 15 shots). Philosophy: FOUNDER DIRECTS. STUDIO WORLD PRODUCES.
- **Architecture:** `shared/site00-studio-world-production/filmProduction/` — authority stack (BrandFilmBible, CharacterFilmAuthority, Wardrobe/HairBeauty/AccessoryProp/Environment/Cinematography bibles, ShotLibrary 37+ shot classes, VideoFormatTemplateLibrary, FounderFilmTasteModel separate from canon), Script/Storyboard interpreters, FilmPlanner, FilmSceneContract, FilmShotContract, ContinuityGraph, FilmModelRouter (Realism Lab evidence per shot), prompt compiler (inspect-only), FilmGenerationPlan with pre-production cost gate, FilmShotQA + auto-reject + correction plans, FounderDailies, SceneDeck, EditTemplateEngine + EDL + RoughCut (ROUGH_CUT_RENDERING_BLOCKED honest state). NDX adapter: `adapters/ndxbookFilmAdapter.ts` with full reel scripts/storyboards.
- **Integration:** Reuses P0.5E.5 character continuity, P0.CR.1 Realism Lab provider registry/prompt compiler/hybrid pipeline, P0.CB.1 campaign parent/child semantics. API: `film_production_*` actions; Campaign Board FILM PRODUCTION link; film parent assets + shot child lineage on board.
- **UI:** `/projects/ndxbook/content-operations/film-production` (+ dailies, scene-deck tabs). Mobile-friendly dailies approve/reject; desktop scene deck strip. No provider spend on page load or planning — only after APPROVE PRODUCTION PLAN + explicit generation trigger.
- **Shipped:** PR **#426** merged to `main`. Deploy **v89**. Tests: `filmProductionP0FILM1.test.ts` (31); full suite **2915** pass; build green (`index.BSBetlVk.js`). Brand Character/Canon/historical lineage unchanged; autonomous publishing disabled.
- **Recommended next:** Run Reel 01 through production plan review only; if plan correct, approve and generate continuity cluster shots 02–04 (table level, lime pen, non-introduction) before full reel generation.

---

## 2026-08-25 — P0.5C.7 Canonical Hand-Built Notebook Carousel Grammar + Physical Page Lineage + Uppercase Authorship

- **Context:** Formalize NDXBOOK carousel visual language for all V2.3 carousel generation. Carousels must look like physical pages inside The Book — not templates with handwriting added afterward. Remains V2.3 + P0.5C.7 amendment (no V2.4). No automatic FAL spend during implementation; founder review required for pilot regeneration.
- **Visual authority chain (amended):** CONTENT THESIS → PAGE OBJECT → PAGE MATERIAL → BINDING/EDGE → CONSTRUCTION HISTORY → BESPOKE COMPOSITION → EDITORIAL PHOTOGRAPHY → TYPOGRAPHY → EVIDENCE → CHARACTER TRACE → LIME INTERRUPTION → QA. Blocked legacy: BACKGROUND → TEXT → PHOTO → ANNOTATION.
- **New modules (`artBoardMateriality/`):** `ndxPageObjectContract.ts` (NDXPageObjectContract + physical lineage signals), `ndxConstructionHistory.ts`, `notebookCarouselPromptSections.ts`, `notebookCarouselEvaluation.ts` (physicality, template grammar, uppercase, photo integration, construction history, page variety QA gates), `ndxNotebookCarouselNorthStar.ts` (MEET NDX, PERSONAL BRAND, THINGS I SAVED — evidence not literal templates), `notebookCarouselMigrationAudit.ts`, `notebookCarouselFounderReview.ts` (THIS_FEELS_LIKE_THE_BOOK, TOO_TEMPLATE, LOWERCASE_ERROR, etc.), `notebookCarouselGrammarP05C7.ts`.
- **Compiler:** `falPromptCompilerV23@P0.5C.7` — explicit sections: PHYSICAL PAGE OBJECT, PAGE MATERIAL, BINDING/EDGE, CONSTRUCTION HISTORY, PHOTO INTEGRATION, UPPERCASE AUTHORSHIP, HAND MARKS, LIME INTERRUPTION, NEGATIVE TEMPLATE CONSTRAINTS. `FAL_MATERIAL_PROMPT_SECTION_ORDER` expanded to 35 sections. Pre-C7 supersession (`artifactHasPreC7Prompt`, `V23_SUPERSESSION_REASON_C7`, `PRESERVED_PRE_C7` lineage). Round 01 notebook carousel gate wired.
- **Pilot:** Subscription receipt topic 1 recommended for founder-triggered OLD V2.3 vs P0.5C.7 compare — no auto-lock.
- **Shipped:** PR **#428** merged to `main`. Tests: `artBoardMaterialityP05C7.test.ts` (13); full suite **2928** pass; build green. Historical V2.3 assets immutable; Brand Character/Canon unchanged.

## 2026-08-25 — P0.CB.1A Reference board replacement + notebook grammar re-decomposition

- **Context:** NDXBOOK Launch Row 01 ingested before P0.5C.7 notebook carousel grammar. Founder approved new reference boards for MEET NDX, PERSONAL BRAND, THINGS I SAVED; old boards must not remain active authority; full lineage preserved.
- **Engine:** `founderCreativeIngestion/referenceReplacement/` — version model (ACTIVE/DRAFT/SUPERSEDED), immutable archives, structural diff, HQ photo override compatibility, selective invalidation, promotion gate. NDX adapter `ndxNotebookGrammarAdapter.ts` recompiles V2.3+P0.5C.7 grammar + uppercase authorship on re-decompose.
- **Flows:** REPLACE → DRAFT upload → RE-DECOMPOSE (no auto FAL) → diff/QA → PROMOTE. Bulk replace all 3 posts. Slide-level replace. MEET NDX HQ desk photo carried forward when compatible.
- **API/UI:** replace/redecompose/promote/bulk/slide-reference/comparison actions; ingestion page three-way compare + promotion.
- **Tests:** `founderCreativeIngestionP0CB1A.test.ts` (14); build green.

## 2026-08-25 — FCI reference board upload UI + API (founder mobile fix)

- **Problem:** Founder on mobile at Founder Creative Ingestion saw "Upload replacement to compare" and "REPLACE REFERENCE BOARD →" but no file picker — P0.CB.1A backend existed but upload was never wired; replace used placeholder URLs.
- **Fix:** `uploadFounderCreativeReferenceBoard` API (`founder_creative_ingestion_upload_reference`) — base64 image → Supabase storage → existing draft versioning engine. UI: hidden file input + tap target "TAP TO UPLOAD REPLACEMENT BOARD" + "UPLOAD REPLACEMENT BOARD →" button; removed broken bulk placeholder replace.
- **Shipped:** PR merged to `main`. Deploy **v90**. Tests: FCI P0CB1A (15) pass; build green.

---

## 2026-08-25 — P0.5E.7 Character-first content operations + NDX situation seeds + first-person editorial formulation

- **Context:** Content Operations still topic-first (`subscription normalization`, etc.). NDX character architecture matured — content must plan through NDX herself: notice → react → investigate → revise → document. Topic becomes metadata; spoken first-person premise is founder-facing creative idea.
- **Model:** `contentOperations/characterFirst/` — `NDXContentSeed`, `NDXThoughtArc`, `BeliefRevisionState`, `NDXKnowledgeState`, `CharacterBeatContract`, `NDXOpportunityFormulator`, `NDXFirstPersonCopyCompiler`, book memory, visual handoff (P0.5C.7), film handoff (P0.FILM.1), topic pipeline migration, live intelligence notice reformulation.
- **Pipeline:** `discoverContentOpportunities` now seeds character-first (8 reformulated pilot topics + credit utilization golden pilot). Run stores `contentSeeds`, `workspaceZones`, `topicPipelineMigration`. Weekly slate `premiseFirstEntries`. Carousel uses narrative page roles when character-first present.
- **UI:** `ContentOperationsEditorialDesk` — TODAY AT NDX zones (Thoughts in Motion, Rabbit Holes, Ready for Book, Margins, Book in Motion, Dog-Eared, Audience, Bookmark/Callback); opportunity cards premise-first; THIS WEEK slate premise-first.
- **Golden pilot:** Credit utilization — `I PAID IT DOWN. WHY DID MY SCORE DROP?` with 8-slide narrative roles (HOOK → BOOKMARK).
- **Tests:** `contentOperationsP05E7.test.ts` (22); P0.5D suite still pass; build green.
- **Preservation:** Brand Character/Canon unchanged; historical topic research preserved via migration records; no autonomous publishing.

---

## 2026-08-25 — Founder creative reference board upload 413 fix

- **Issue:** Founder saw `REQUEST ENTITY TOO LARGE` uploading/replacing reference boards on founder-creative-ingest (mobile fsbw-dev).
- **Cause:** API JSON body limit was 2MB on Railway Express server; board PNGs sent inline exceed limit.
- **Fix:** New `founder_creative_ingestion_upload_reference` uploads image to Supabase storage (webp via sharp), then creates draft reference with `storagePath` + public URL only. UI: **UPLOAD REFERENCE BOARD** file picker with client-side compression. Express JSON limit raised to 25MB. Friendly 413 handler.

---

## 2026-08-25 — FCI upload → show → auto-decompose flow fix

- **Context:** Founder selected and uploaded a replacement reference board on Founder Creative Ingestion but nothing changed on the page — expected uploaded image to appear and decompose stage to begin automatically.
- **Root causes:** (1) Upload only created a draft version without calling `redecomposeFromDraftReference`. (2) Main sequence `referenceUrl` used legacy asset id `ref-board-${sequenceId}` instead of versioned `ref-board-${sequenceId}-v${n}`. (3) Silent rejection of some mobile image types; no upload feedback.
- **Fix:** `uploadAndReplaceFounderCreativeReferenceBoard` now chains upload → draft → redecompose → QA in one save; returns `diff` + `qaReport`. Added `resolveSequenceReferencePreviewUrl` (draft → active → legacy). UI uses it for main reference art; upload handler applies diff, selects first slide, shows local blob preview while busy, surfaces invalid-file errors, "UPLOADING & DECOMPOSING…" status.
- **Tests:** `founderCreativeIngestionP0CB1A.test.ts` — upload auto-redecompose + preview URL helper (16 pass).
- **Ship:** PR to `main`; deploy Railway + fsbw-dev for live fix.

---

## 2026-08-25 — P0.CB.1B Guided creative ingestion workflow (stepper + slide-by-slide proofing)

- **Context:** Founder Creative Ingestion felt like an admin state dump — reference versioning, slide state, methodology, photo modes, and registration actions all visible at once. Sprint restructured into a guided production workflow: one screen = one decision.
- **Flow:** STEP 01 INGEST (upload → auto-decompose) → STEP 02 DECOMPOSE (progress) → STEP 03 SLIDE REVIEW (reference/production/compare tabs, HQ upload, approve/regenerate) → STEP 04 SEQUENCE REVIEW (blocked until all slides approved) → STEP 05 COMPLETE. Stepper + stage shell; methodology in Inspect drawer only.
- **Code:** `guidedWorkflow.ts` + `FounderCreativeIngestionWorkflow` shell/stages; page slimmed to orchestrator; localStorage persistence for sequence/step/slide index; mobile sticky action bar.
- **Preservation:** Non-destructive reference lineage, draft not auto-promoted, founder-triggered FAL spend unchanged.
- **Tests:** `founderCreativeIngestionP0CB1B.test.ts` (14); P0CB1A updated; build green.

---

## 2026-08-25 — CAST NDX founder character reference upload + bible storage

- **Problem:** CAST NDX page had generate/review stills but no way to upload founder character references, decompose into casting authority, store in Character Bible, or regenerate casting from those references.
- **Fix:** `character_visual_casting_upload_reference` / `_store_reference_bible` / `_regenerate_from_references` API; `founderReferenceIngestion` engine; continuity pipeline sync via `ingestFounderCastingReferenceToContinuity`. UI: role picker (FACE/HAIR/WARDROBE/etc.), **TAP TO UPLOAD** zone, decomposed signals list, **STORE IN BIBLE →**, **REGENERATE CASTING FROM REFERENCES →**.
- **Shipped:** PR #435 merged to `main`. Deploy **v91**. Tests: `castNdxFounderReferenceUpload.test.ts` (3) pass; build green.

---

## 2026-08-25 — P0.5E.7A Character-premise lock + hero slide authority + thought-arc preservation

- **Problem:** REGENERATE CURRENT preserved P0.5C.7 notebook grammar but collapsed character-first posts back into generic educational explainers — topic metadata overwrote NDX premise in editorial layer and FAL compiler (`headline: subject.toUpperCase()`, `CONTENT THESIS: topic — hook`).
- **Fix:** `CharacterPremiseAuthority`, `NDXThoughtArcSnapshot`, `NDXPageRoleMap`, `HeroSlideAuthority`, `HERO_PREMISE_LOCK`, topic-to-experience translator, experience-first + collapse/removal/causality gates, `CharacterFirstContentSnapshot` versioning. Wired into `falPromptCompilerV23@P0.5C.7`, `v23GenerationAuthority` REGENERATE CURRENT, editorial integration (premise as headline), carousel premise preservation. Credit utilization golden pilot: 8-slide role map locked (PERSONAL_CONTRADICTION → BOOKMARK), north star + negative collapse evidence registered. Current nine migration blockers.
- **Tests:** `contentOperationsP05E7A.test.ts` (22) + P0.5E.7 (22) pass; build green.

---

## 2026-08-25 — CAST NDX FAL generation stuck fix

- **Problem:** CAST NDX showed "GENERATING CANDIDATE 01…" indefinitely with no FAL activity — DB had `falGenerationTracking.status=RUNNING` but background job never ran (orphaned after HTTP 202 / server restart; early-return blocked re-dispatch).
- **Fix:** Remove stale RUNNING early-return; resume orphaned jobs immediately on GET/poll; run FAL synchronously on Railway; start background work without setImmediate deferral. UI: RETRY GENERATE STILLS after 60s stuck.
- **Shipped:** PR merged to `main`. Railway redeploy required. Tests: `castingFalBackgroundJob.test.ts` (1) + P0.5E.4C (16) pass.

---

## 2026-08-25 — P0.5E.4D Reference-first casting regeneration + Character Bible asset pack

- **Problem:** REGENERATE CASTING FROM REFERENCES reused stale `CharacterTruthSnapshot` + variation-axis prompt contracts; founder notes were appended as secondary strings. FAL dispatch recompiled prompts without reference notes (`castingFalDispatch.ts`). Six unrelated casting candidates instead of same-woman bible asset pack.
- **Root cause:** Authority order was legacy truth → variation axis → appended reference notes; no structured decomposition; no prompt snapshot storage; regenerate path called `generateNextCastingRoundFromFeedback` with legacy contracts.
- **Fix:** `referenceDrivenCasting.ts` — `ActiveCastingReferenceAuthority`, `CharacterReferenceDecomposition` (identity/hair/wardrobe/presence/environment + visibility confidence), `compileReferenceDrivenCastingPromptContract` (reference PRIMARY, legacy SECONDARY), `generateCharacterBibleAssetPackRound` (17 slots: portraits, turnaround, wardrobe sheet, environment, expressions). FULL_LOOK upload auto-decomposes + activates authority; generation founder-triggered only. FAL dispatch reads `promptContractSnapshots` by `promptSnapshotId`. UI: STEP 1 upload → STEP 2 decomposition review → STEP 3 GENERATE CHARACTER BIBLE FROM REFERENCE → STEP 4 tabbed bible review + LOCK FACE/WARDROBE/ENVIRONMENT.
- **API:** `character_visual_casting_generate_bible_from_reference`, `_approve_bible_pack`, `_bible_lock`; regenerate-from-references now routes to bible asset pack.
- **Tests:** `referenceFirstCastingP05E4D.test.ts` (9) + cast upload (3) + P0.5E.4C (16) pass; build green. Decomposition is structured/heuristic (vision hook point for future).

---

## 2026-08-25 — P0.A Project Ingestion Readiness Audit (Astral World)

- **Context:** Audit-only sprint to determine whether SITE 00 can ingest Astral World as first real client WORLD project. No Astral build, no client repo, no schema changes.
- **Verdict:** Astral World ingestion **NOT READY** (FALSE). WORLD type **PARTIAL**. Project isolation **FALSE**. Origin/Identity/Blueprint/Asset Vault/Bible **PARTIAL**. Production handoff **FALSE**.
- **Key findings:** (1) 244 `slug !== 'ndxbook'` guards in `api/site00/projects.ts`; (2) ASSTS vault global — no `project_id`; (3) `WORLD_FORMATION_IMPLEMENTED=false`; (4) three parallel project-type enums; (5) three-layer truth partial via `SITE00_LAYER` + synthesis gate; (6) client studio dynamic slugs work but founder methodology ndxbook-only; (7) no generic production handoff compiler.
- **Deliverables:** `docs/audits/SITE00_PROJECT_INGESTION_READINESS_AUDIT.md`, `SITE00_PROJECT_INGESTION_READINESS_MATRIX.md`, `site00-project-ingestion-readiness.json`.
- **Recommended next sprint:** P0.B — Project Core / `project_id` isolation (capability registry, enum unification, Astral project stub metadata only).

---

## 2026-08-25 — P0.B Project Core + project_id Isolation

- **Context:** Implement multi-project runtime after P0.A audit. No Astral creative production, no world formation, no production handoff.
- **Delivered:** Capability registry (`shared/site00-projects/capabilities.ts`); canonical resolver (`canonicalProject.ts`); 244→0 NDXBOOK API slug guards replaced with `denyUnlessActionCapability`; `project_id` on ingestions + logical assets; `site00_client_truth_records`; Astral World PRE_INGESTION registration; health diagnostic API; 10 isolation tests; architecture docs.
- **NDXBOOK:** All methodology capabilities preserved via capability set — behavior generalized not removed.
- **Astral World:** slug `astral-world`, project_type WORLD, status PRE_INGESTION, capabilities PROJECT_CORE/ORIGIN/CLIENT_TRUTH/PROJECT_INTELLIGENCE only.
- **Migration:** `20260825180000_site00_project_core_isolation.sql`
- **Recommended next sprint:** P0.C — Origin + Client Truth ingestion (world intake link, reconciliation workflow).

---

---

## 2026-08-25 — P0.C Origin + Client Truth Ingestion (Astral World)

- **Context:** First real WORLD project ingestion after P0.B isolation. Astral World moves PRE_INGESTION → ORIGIN_INGESTED. No creative formation, no canon promotion.
- **Delivered:** `originIngestionService.ts`; Origin sessions + summaries schema (`20260825210000_site00_origin_ingestion.sql`); Astral World seed data (`shared/site00-origin/astralWorldSeed.ts`); API actions `origin_ingest`, `origin_health`, `origin_summary`; UI `/projects/astral-world/origin`; 12 P0.C tests; architecture + project docs.
- **Production:** P0.B + P0.C migrations applied to Supabase `hyycomvcaqxxvyrfupes`. Astral World ingested: 24 client truth records, 2 source references, 9 unresolved decisions, 0 canon from origin, 0 cross-project leaks.
- **Canon firewall:** All client truth RAW/non-canonical; origin summary `is_canonical=false`; WORLD_FORMATION not triggered.
- **Recommended next sprint:** P0.D — Identity Phase Entry (Astral World).

---

## 2026-08-25 — P0.5E.4E Visual identity lock + anchor-first Character Bible generation

- **Problem:** Reference-first casting (P0.5E.4D) generated correct asset categories but not the same woman/outfit/environment — no anchor gate, no structured identity/wardrobe/environment locks, no drift QA, bible pack generated all slots at once without approved anchor authority.
- **Fix:** `identityAnchorCasting.ts` — `VisualIdentityLock`, `WardrobeLock`, `EnvironmentLock`, `ViewInferenceMap`; canonical anchor workflow (`CANONICAL_ANCHOR_PENDING` → review → approve → `BIBLE_PACK_READY_TO_GENERATE`); `CharacterContinuityDriftEvaluation` + failure taxonomy; anchor-dependent bible pack via `compileAnchorDependentBiblePromptContract` (authority order: uploaded reference → locks → approved anchor → view contract → inference rules). Bible pack gated on anchor approval. 10 view-contract slots (FRONT_VIEW … CONTACT_SHEET). Optional supporting reference roles. Non-destructive lineage chain preserved.
- **API fixes:** Repaired broken `character_visual_casting_*` handlers in `projects.ts` (inverted validation, missing judgment/bible_lock bodies). New actions: `generate_canonical_anchor`, `approve_canonical_anchor`, `regenerate_canonical_anchor`.
- **UI:** Upload → decompose → authority locks → GENERATE ANCHOR → APPROVE ANCHOR → GENERATE BIBLE PACK. Source reference visible in anchor review.
- **Tests:** `identityLockCastingP05E4E.test.ts` (16) + updated P0.5E.4D (9) + cast upload (3) pass; build green.

---

---

## 2026-08-25 — P0.5E.4F Canonical NDX visual identity gate + character injection authority

- **Context:** Follow-up to P0.5E.4E — enforce that NDX cannot be visually generated downstream until canonical visual identity is READY; downstream systems must consume `CharacterInjectionBundle` instead of reinventing NDX from text/stale casting.
- **Delivered:** New module `shared/site00-studio-world-production/characterAuthority/` — three readiness layers (`NDXCharacterTruthReadiness`, `NDXVisualIdentityReadiness`, `NDXProductionReadiness`), `CanonicalCharacterVisualAuthority` + `NDX_VISUAL_V*` versioning, `CharacterInjectionAuthority` + bundle, `PreCanonCharacterGenerationGuard`, contamination evaluation, variation rules, NDX adapter, system audit registry (11 systems), downstream integration helpers.
- **Integrations:** Film readiness + shot prompt compiler (injection bundle); FCI `realismLabBridge` blocks GENERATE_FROM_REFERENCE before visual lock; V2.3 re-exports `compileV23PromptWithCharacterAuthority`; continuity pipeline delegates visual check; Character Casting UI `CharacterReadinessPanel`.
- **Tests:** `characterAuthorityP05E4F.test.ts` (30) pass; build green.
- **Next:** After P0.5E.4E produces approved anchor + angle pack — run still/motion continuity tests, promote `NDX_VISUAL_V1`, controlled MEET NDX single-slide injection test before wider production queue.

---

## 2026-08-25 — P0.5E.4E.1 Image-reference identity generation + turnaround + env separation

- **Context:** Follow-up to P0.5E.4E/P0.5E.4F — fix remaining character drift by making founder-uploaded reference image the primary generation authority (image-to-image / reference conditioning) instead of text-to-image reconstruction. Separate character pipeline (isolate → turnaround → wardrobe doc) from environment pipeline (character-free plates).
- **Delivered:** `imageReferenceCasting.ts` + `imageReferenceMigration.ts` — `CharacterImageReferenceAuthority`, Supabase URL resolution, `CharacterReferenceImagePromptCompiler` (short prompts), white-background `CanonicalCharacterIsolate`, 12-angle `CharacterTurnaroundPack`, wardrobe documentation round, `CanonicalEnvironmentPlate` + leak QA, selective slot regen, `REFERENCE_IMAGE_DRIVEN` casting mode. FAL dispatch passes `referenceImageUrls` via `buildFalImageInput`; `recommendReferenceImageCastingProvider` blocks TEXT_ONLY for canonical character. API actions: generate/approve character isolate, generate turnaround, regenerate turnaround slot, wardrobe documentation, environment plate. Casting UI staged workflow (STEPS 3–8). 30 tests in `imageReferenceCastingP05E4E1.test.ts`; related casting suites updated.
- **Preservation:** Brand Character / Brand Canon unchanged; legacy text casting prompts historical only; P0.5E.4F downstream gate compatible via isolate→anchor sync.
- **Founder next:** Upload NDX reference → GENERATE CHARACTER ISOLATE only → verify same woman/outfit/white bg → approve → turnaround subset (front/left profile/back) before full pack; Railway redeploy for new API actions; cPanel ZIP for UI.


- **Symptom:** Founder on `site00.fsbw-dev.com` CAST NDX tapped **STEP 3 · GENERATE CANONICAL ANCHOR** — red **UNKNOWN ACTION**.
- **Root cause:** Live `api.site00.com` health reported git commit `e09218d` (pre P0.5E.4E). Canonical anchor project actions landed in `8c86060` on `main` but Railway had not redeployed — authenticated requests hit `projects.ts` default `UNKNOWN_ACTION`.
- **Fix:** Clearer casting-page error via shared `formatSite00ProjectsApiError` (maps Unknown action → redeploy Railway guidance). Extended `castNdxFounderReferenceUpload.test.ts` with API anchor path + projects.ts action registration checks.
- **Founder next step:** Redeploy Railway from latest `main`; confirm `/api/health` gitCommit current; hard-refresh fsbw-dev; retry GENERATE CANONICAL ANCHOR.

---

## 2026-08-25 — Railway deploy syntax fix (projects.ts P0.B handler regression)

- **Symptom:** Railway deploy failed — `Transform failed … projects.ts:1086:6 ERROR: Unexpected "case"` (screenshot). API stuck on `e09218d`; new actions never reached production.
- **Root cause:** P0.B multi-project refactor dropped handler bodies for 42+ `case` blocks in `api/site00/projects.ts` (capability guard left dangling before next case). Five try/catch handlers also broken (`return; catch`). Inverted validation pattern `if (!(!field))` from same refactor.
- **Fix:** Restored all missing handler tails from pre-P0.B git; repaired try/catch blocks (founder revision, FCI upload, neural voice, Experiment G finalist); corrected inverted request validation guards; added `tests/projectsApiSyntax.test.ts` import guard.
- **Outcome:** `projects.ts` parses locally; Railway redeploy from `main` should succeed and unblock canonical anchor + all restored actions.

---

## 2026-08-25 — P0.D Identity Phase Entry + Canon Promotion (Astral World)

- **Context:** Sprint P0.D — generic Identity Phase entry for Astral World: `ORIGIN_INGESTED` → `IDENTITY_IN_PROGRESS`. Establish CLIENT TRUTH → CREATIVE EXPLORATION → JUDGMENT → APPROVED IDENTITY CANON without auto-canonization. Model hierarchy: ASTRAL WORLD (master) → ASTRÉA (flagship district) → Tarot Suite / Astral Mall / Coffee Shop (destinations).
- **Delivered:** Migration `20260825220000_site00_identity_phase.sql` (identity_phases, briefs, territories, judgments, world_hierarchy_nodes, canon_promotions). Services under `api/_lib/site00Projects/identity/`. Shared types + Astral seeds in `shared/site00-identity/`. API actions: identity_enter, identity_brief, identity_territories, identity_judgment, canon_promote_identity, world_hierarchy, project_bible, legacy_project_repair. UI `/projects/astral-world/identity`. Host firewall (`hostFirewall.ts`) with negation-aware leak detection. 3 strategic identity territories seeded. Project Bible compiled view.
- **Production:** Migration applied to Supabase `hyycomvcaqxxvyrfupes`. `identity_enter` run — Astral World status `IDENTITY_IN_PROGRESS`, 3 territories, 5 hierarchy nodes, 0 identity canon. Legacy `northquarter-rebuild` quarantined (1 ambiguous record).
- **Tests:** `identityPhaseP0D.test.ts` (20) pass; P0.B/P0.C isolation tests pass; build green.
- **Docs:** SITE00_IDENTITY_SYSTEM, SITE00_CANON_PROMOTION, SITE00_PROJECT_BIBLE, SITE00_WORLD_HIERARCHY + astral-world IDENTITY/WORLD_HIERARCHY/PROJECT_BIBLE + audit doc.
- **Next:** P0.E — founder judgment on identity territories + first canon promotion; WORLD formation remains blocked until identity canon approved.

---

---

## 2026-08-25 — P0.E Identity Judgment + First Canon Promotion (Astral World)

- **Context:** Sprint P0.E — field-level + territory-level founder judgments, partial hierarchical canon, structural world canon promotion. NO fake founder judgment.
- **Delivered:** Migration `20260825230000_site00_identity_judgment_p0e.sql`. identityJudgmentService, enhanced canonPromotionService (promoteIdentityFields, promoteStructuralWorldCanon). Gates: identityCanonGate, worldFormationGate. API + UI extended. Whole-territory promotion blocked.
- **Production:** AWAITING_FOUNDER_JUDGMENT. 3 territories verified. 0 judgments, 0 canon.
- **Tests:** identityJudgmentP0E.test.ts (20) pass; build green.
- **Next:** Founder reviews at `/projects/astral-world/identity` OR P0.F after canon gate satisfied.

---

## 2026-08-25 — P0.VR.1D screenshot-first visual reconstruction

- **Context:** Founder sprint to fix website reconstruction drift by making reference screenshots primary visual authority (not text-derived approximations). Extends P0.VR.1 / 1A / 1C without replacing prior lineage.
- **Delivered:** New `p0vr1d/` module under `shared/site00-studio-world-production/visualReconstruction/` — `WebVisualReferenceAuthority`, asset resolution, page decomposition, region map, geometry/typography/frame contracts, desktop/mobile separate authorities, pixel match evaluation, difference map, moodboard screen extraction, provider routing (image-reference preferred; text-only blocked as primary), screenshot-first pipeline with iterative compare/correct loop. Added `WEBSITE_RECONSTRUCTION` mode. Founder UI `VisualReconstructionWorkspace` (7-step flow, overlay/diff views). Tests `visualReconstructionP0VR1D.test.ts` (21 + success criteria). Doc `docs/architecture/SITE00_VISUAL_RECONSTRUCTION_P0VR1D.md`.
- **Core rule:** Keep reference image in the loop until coded implementation matches; text cannot override visible geometry.
- **Validation after ship:** Run one controlled desktop + mobile reconstruction pair; overlay reference vs implementation before responsive interpolation.

---

## 2026-08-25 — P0.VR.1D.A NDXBOOK project hub reconstruction retry

- **Context:** Founder sprint to repair failed NDXBOOK founder workspace / project hub pages using attached desktop (Image A) and mobile (Image B) reference boards as primary visual authority — reconstruction mode, not redesign.
- **Delivered:** `ndxProjectHubReferenceDecomposition.ts` (desktop 10-region + mobile 6-screen decomposition, route authorities). Desktop `OverviewFounderWorkspaceBoard` composite hub at `/projects/ndxbook`. Mobile `MobileFounderWorkspaceChrome` + `OverviewMobileHomeScreen` with independent bottom nav (`ndxFounderWorkspaceMobileNav.ts`). `FounderWorkspaceShell` desktop/mobile split at 900px. Reference-aligned rail labels (EXPERIMENTS HUB, CAMPAIGN BOARD, etc.). Extended `NDX_CALIBRATION_ROUTES` for hub + mobile screens. CSS hub board tape/paper/lime system in `site00-founder-workspace.css`. Tests `projectHubReconstructionP0VR1DA.test.ts` (8 + success criteria). Fixed MEMORY merge conflict (P0.E + P0.VR.1D).
- **Fidelity note:** Fixture PNGs in repo are wireframes; founder-attached editorial boards are canonical authority. Full pixel match requires those assets ingested + authenticated project detail render for live overlay QA.
- **Founder review:** Desktop rail/nav CLOSE; hub board panels NEEDS FIX until auth + high-res reference overlay pass. Mobile chrome CLOSE; screen family NEEDS FIX for campaign/experiment/CI routes polish + reference assets.
- **Next:** Ingest founder desktop/mobile reference PNGs into visual-references vault; run overlay loop per screen at locked viewports.

## 2026-08-25 — P0.VR.1D.A mobile fix (preview-mode wiring + screen family)

- **Issue:** Founder reported mobile design unchanged — root cause: mobile layouts gated by `isPreviewDesktop` toggle, not CSS media queries; global SITE 00 mobile shell (header + bottom nav) still wrapped NDXBOOK; only overview had a mobile component.
- **Fix:** `FounderWorkspaceShell` now uses `isPreviewDesktop` to swap desktop operate vs `renderMobileFounderWorkspaceScreen()` inside `MobileFounderWorkspaceChrome`. Added 6 reference mobile screens in `MobileFounderWorkspaceScreens.tsx`. `EcosystemShell` adds `site00-ecosystem-shell--ndx-founder-mobile` on `/projects/ndxbook/*` to hide global mobile header/nav. Mobile bottom nav "More" → Experiments Hub.
- **Verified:** Mobile toggle shows KPI overview, campaign board, content ops with NDXBOOK bottom nav (Overview/Campaigns/Content Ops/Lab/More).

## 2026-08-25 — P0.VR.1D.A mobile regression fix (hub restore)

- **Issue:** Founder reported broken project hub on mobile (unstyled blue inline nav links, global SITE 00 bottom nav still visible, plain-text KPIs). Root cause: static mobile screens replaced all operate layers; global mobile shell not suppressed structurally; nav CSS relied on broken unicode icons + sticky positioning below global nav.
- **Fix:** `suppressSiteChrome` on `Site00EcosystemMobileShell` for ndxbook routes (hides global header + bottom nav). Mobile reference overview only on `/projects/ndxbook`; other routes restore real `operate` layers. Fixed bottom nav (fixed position, label-only, screenId active matching). CSS imported directly in mobile chrome component.

## 2026-08-25 — Promote founder reference to WHO FEELS CLOSEST

- **Context:** Founder uploaded full-look reference (lime green sneakers) on CAST NDX and wanted it in WHO FEELS CLOSEST? to confirm identity before isolate generation.
- **Fix:** `promoteFounderReferenceToClosestReview()` + API `character_visual_casting_promote_reference_to_closest` + UI button **USE FOR WHO FEELS CLOSEST? →** on each decomposed reference. Active reference drives isolate source; THAT'S HER locks selection.

---

---

## 2026-08-25 — P0.UI.3 NDX SVG icon system

- **Context:** NDX project workspace had inconsistent/broken icons across bottom nav, project menu, header, and desktop rail — mixed inline SVG, unicode glyphs, and mismatched sizing.
- **Delivered:** Canonical package `shared/site00-studio-world-ui/icons/` (`NDXIconRegistry`, size tokens, viewBox 24, currentColor). React wrapper `src/site00/icons/ndx/NDXIcon.tsx`. Migrated desktop rail, `MobileFounderWorkspaceChrome` (header + bottom nav), `FounderWorkspaceMobileNav` (CSS breakpoint fallback), `FounderWorkspaceProjectMenu`, `FounderWorkspaceHeaderChrome`. Replaced unicode icons in `ndxFounderWorkspaceMobileNav.ts`. Icon sheet at `/projects/:slug/inspect/icons`. `ProjectRow` ellipsis migrated. Active state uses `--site00-project-presence-accent` (P0.UI.1 lime). Host escape icons flagged `hostCanonical`.
- **Tests:** `ndxIconSystemP0UI3.test.ts` (12 + success criteria). Merged atop P0.VR.1D.A mobile chrome on main.
- **Rule:** One semantic action → one canonical SVG; same drawing on mobile/desktop/menu/rail.

---

## 2026-08-25 — P0.VR.1D.1 Screenshot-as-design-spec + moodboard extraction + visual-spec-to-code bridge

- **Context:** Follow-up to P0.VR.1D / P0.VR.1D.A — fix Composer treating screenshots as inspiration instead of executable design spec. Default input = desktop + mobile mood boards with automatic per-screen extraction; full-screen references optional precision overrides only.
- **Delivered:** New `p0vr1d1/` module — `MoodBoardScreenExtractionPipeline`, resolution evaluation (SUFFICIENT/PARTIAL/INSUFFICIENT), authority versioning + full-screen matcher, `VisualSpecToCodeBridge` → `ScreenImplementationSpec` + `RegionCodeSpec`, `ComposerScreenBuildContract` (SCREENSHOT_EMULATION, designFreedom false), DOM measurement/delta, `CodePatchInstruction` compiler, region locks, `runDomPatchConvergencePipeline`. Wired NDX golden pilot in `ndxProjectHubReferenceDecomposition.ts` — desktop 6 + mobile 6 auto-extracted screens, `rebuildNdxProjectHubThroughP0VR1D1()`. Tests `visualReconstructionP0VR1D1.test.ts` (17 + §33 success criteria). Doc `SITE00_VISUAL_RECONSTRUCTION_P0VR1D1.md`. P0_VR_LINEAGE_PRESERVED extended with P0.VR.1D.
- **Core rule:** Mood board ingestion sufficient by default; code what is visibly there — reference geometry → concrete CSS properties → targeted patches, not "make it closer."
- **Preservation:** P0.VR.1D architecture reused, not duplicated; prior VR lineage intact; SITE00 host canon unchanged.
- **Founder next:** Upload desktop + mobile mood boards only (no manual per-screen crops); use optional ADD HIGH-RES REFERENCE per screen when resolution flags PARTIALLY_SUFFICIENT; run overlay QA on NDX hub routes after ingesting founder editorial boards into vault.

---

## 2026-08-25 — P0.VR.1D.2 NDX project hub live reconstruction execution

- **Context:** Execution sprint — prove P0.VR.1D + P0.VR.1D.1 pipeline with real browser renders, not architecture-only. Founder editorial mood boards not yet persisted in Supabase; wireframe fixtures exist for dev only.
- **Delivered:** `p0vr1d2/` — `resolveNdxFounderProjectHubBoards` (canonical `visual-references/founder/ndxbook/`, env, Supabase; no silent fixture substitution), `inferScreenViewportFromBoardCrop`, measured `measureScreenReferenceResolutionFromCrop` (no default SUFFICIENT), `runNdxProjectHubLiveReconstruction` (skipRender=false, Playwright, DOM capture, overlay, patches). Extended `ControlledReferenceRenderer` with preview device mode + DOM measurements. Runner `scripts/visualReconstruction/runNdxProjectHubLiveReconstruction.ts`. Tests `visualReconstructionP0VR1D2.test.ts`. Hub board `data-vr-region` markers.
- **Live run (fixture fallback dev):** Mobile overview VISUAL_PASS ~93%; desktop panels FOUNDER_REVIEW/NEEDS_CORRECTION; resolution correctly INSUFFICIENT on small crops; fixtureSubstitution reported honestly.
- **Founder next:** Drop actual desktop + mobile mood boards into `visual-references/founder/ndxbook/` (or Supabase paths in README); re-run live script without `--allow-fixture-fallback`; upload GoDaddy ZIP after hub CSS convergence passes.

---

## 2026-08-25 — P0.VR.1D.3 single-screen NDX overview menu-open reconstruction proof

- **Context:** Founder attached mobile screenshot as PRIMARY_VISUAL_AUTHORITY for NDXBOOK overview with three-dot project escape menu open. Narrow sprint: one screen, one interaction state, prove screenshot → spec → code → render → DOM delta → patch loop using existing P0.VR.1D lineage (no new architecture).
- **Delivered:** Persisted reference `visual-references/founder/ndxbook/mobile-overview-menu-open.png`; `ProjectEscapeMenu` popover (PROJECT OVERVIEW → `/projects/ndxbook`, PROJECT SETTINGS → `/projects/ndxbook/setup`, BACK TO PROJECTS → `/projects`, RETURN TO ORIGIN → `/`, INSPECT → experiments hub; HELP visible but no dedicated route — reported honestly); `OverviewMobileHomeScreen` rebuilt to match reference copy/layout (two-line headline, Today at NDX May 24, metrics without FROM AUDIENCE number, production cards, radar list); `data-vr-region` on header/metrics/production/radar/nav/menu; `p0vr1d3/` execution module + live runner; VR renderer auth bootstrap for Playwright; hide MOBILE/DESKTOP layout switch on ndxbook mobile takeover.
- **Live run:** skipRender=false; DOM regions tracked (7); overlay + heatmap generated; visual score ~79% (NEEDS_CORRECTION vs 90% VISUAL_PASS threshold) — pipeline proved end-to-end; remaining drift: card artwork textures, fine typography, status-bar crop in reference.
- **Founder next:** Upload GoDaddy ZIP v107; optional HELP route when defined; re-run `npx tsx scripts/visualReconstruction/runNdxOverviewMenuOpenLiveReconstruction.ts` after further CSS convergence.

---

## 2026-08-25 — NDXBOOK duplicate mobile project menu fix

- **Context:** Founder reported overlapping duplicate menus on mobile NDXBOOK (`site00.fsbw-dev.com`) — header-anchored partial popover behind full project menu when tapping ellipsis.
- **Root cause:** P0.VR.1D.3 added `ProjectEscapeMenu` inside `MobileFounderWorkspaceChrome` with local `menuOpen` state, while P0.UI.3 `FounderWorkspaceShell` also renders `FounderWorkspaceProjectMenu`. Ellipsis `toggleMenu` opened local menu **and** called `onOpenMenu()` which always opened shell menu → two overlays.
- **Fix:** Removed `ProjectEscapeMenu`; mobile chrome is controlled by shell (`menuOpen`, `onToggleMenu`). Single canonical `FounderWorkspaceProjectMenu` with `data-vr-region="ndx-project-menu"`. `vrMenuOpen=1` query param handled at shell level for VR proofs. Regression test `ndxDuplicateMenuFix.test.ts`.
- **Founder next:** Redeploy fsbw-dev / GoDaddy so production picks up fix.

---

---

## 2026-08-25 — P0.VR.1D.4 founder board persistence + region ID alignment + actionable DOM patches

- **Context:** Follow-up to P0.VR.1D.2 blockers: (A) actual founder desktop/mobile mood boards not persisted → fixture fallback; (B) decomposition region IDs ≠ DOM `data-vr-region` → zero actionable patches. Reuse P0.VR.1D / 1D.1 / 1D.2 / 1D.3 only — no new reconstruction architecture.
- **Delivered:** `p0vr1d4/` — canonical region identity (`ndxVisualRegionIds.ts`, `normalizeReferenceRegionId`), `ReferenceDomRegionMap`, `buildMappedReferenceDomDelta`, `VisualReconstructionComponentRegistry`, `compileActionableCodePatches`, `applyCodePatchInstructions`, `persistFounderVisualBoards`, aligned region locks (`FAIL_REGION_LOCK_WITHOUT_MEASUREMENT`), `runNdxProjectHubAlignedLiveReconstruction`. Wired mapped delta + patch loop into `runNdxProjectHubLiveReconstruction`. Fixed P0.VR.1D.1 lock bug (no auto MATCHED/LOCKED without measurement). Standardized DOM markers to dot notation (`ndx.header`, `ndx.overview.metrics`, …) across mobile chrome, overview, campaign/experiment/content-ops/CI/character screens. Resolver emits `FAIL_FOUNDER_REFERENCE_MISSING` when canonical boards absent. Tests `visualReconstructionP0VR1D4.test.ts`. Doc `docs/architecture/SITE00_VISUAL_RECONSTRUCTION_P0VR1D4.md`.
- **Honest status:** Actual founder 6-screen desktop/mobile mood boards still not in repo/Supabase — only `mobile-overview-menu-open.png` (P0.VR.1D.3) + wireframe fixtures for dev. `persistFounderVisualBoards` ready when founder drops boards into `visual-references/founder/ndxbook/`. Mapped deltas + actionable patches now work when canonical DOM IDs align.
- **Founder next:** Upload desktop-mood-board.png + mobile-mood-board.png to canonical paths or Supabase; re-run aligned live reconstruction with `allowFixtureFallback: false`; upload GoDaddy ZIP after merge.

---

## 2026-08-25 — P0.VR.1D.5 mobile overview micro-fidelity tightening

- **Context:** Follow-up after P0.VR.1D.4 — mobile Overview structurally correct but missing micro details vs founder reference (audience KPI blank, no card artwork, missing dividers, tight spacing).
- **Delivered:** Targeted pass on `OverviewMobileHomeScreen` only — restored FROM AUDIENCE count (`1`, reference snapshot aligned with desktop composite), explicit 4-column KPI grid with ruled dividers, section spacing/borders, production card artwork via reference-approved crops (`public/visual-references/founder/ndxbook/card-artwork/*.webp`), micro `data-vr-region` IDs, header/nav micro-calibration CSS. `p0vr1d5/` — `ReferenceDetailAudit`, `resolveProductionCardArtwork` (existing → pipeline → reference crop → generation-required gate, no auto FAL), `runNdxOverviewMicroFidelityPass`. Tests `visualReconstructionP0VR1D5.test.ts`. Doc `SITE00_VISUAL_RECONSTRUCTION_P0VR1D5.md`.
- **Artwork:** Subscription / layoff / late-fees resolved as `REFERENCE_APPROVED_CROP` from `mobile-overview-menu-open.png`; no new FAL generation. Pipeline URL hook ready when V2.3 slide assets exist.
- **Founder next:** Upload GoDaddy ZIP v109; optional further crop tuning on layoff/late-fees cards if founder wants pixel-perfect art framing.

---
## 2026-08-25 — NDXBOOK duplicate mobile menu fix v2 (viewport-unified chrome)

- **Context:** Founder reported duplicate menu persisted after PR #460 on `site00.fsbw-dev.com`. Screenshot showed header-anchored partial panel (legacy escape menu) behind full MORE menu.
- **Root cause (additional):** Phone + **Desktop preview toggle** rendered `FounderWorkspaceMobileNav` fallback (MORE opens shell menu) while mobile chrome/header path could still open a second panel; legacy `.site00-fws-project-menu` CSS also remained from P0.VR.1D.3.
- **Fix v2:** Narrow viewports (`!isWideViewport`) always use `MobileFounderWorkspaceChrome` regardless of preview toggle; MORE bottom-nav is a **button** toggling the single shell menu (same state as header ellipsis); menu portaled to `document.body`; legacy escape-menu CSS removed; menu closes on route change.
- **Verified:** Playwright on 390px — mobile + desktop-preview both show `mobileChrome:1`, `mobileNav:0`, one `[role="menu"]` after MORE tap.

---

## 2026-08-25 — P0.UI.3B pixel-to-vector icon trace + exact geometry convergence

- **Context:** Founder sprint P0.UI.3B — eliminate semantic icon invention; trace approved reference pixels from `mobile-overview-menu-open.png` (941×1672) into SVG paths; replace V1 hand-approximated geometry in canonical `NDXIconRegistry`.
- **Root issue:** P0.UI.3/3A architecture existed but P0.UI.3A crop authority pointed at wrong mood-board fixture (390×844, no traceable dark pixels). Live icons still drifted (grid vs house, document vs target, small bell).
- **Fix:** New `shared/site00-studio-world-ui/icons/p0ui3b/` module: `ExactIconReferenceCrop`, `IconPixelMask`, `IconVectorContour`, `IconReferenceFootprint`, `ExactIconGeometryEvaluation`, semantic substitution audit, overlay/diff, raster comparison. V2 geometry `NDX_ICON_GEOMETRY_V2` wired through `buildPixelTracedIconRegistry()`; registry now uses `NDX_ICON_V2_PIXEL_TRACED`. Recalibrated crops from founder screenshot. Scripts: `extractNdxIconReferenceCropsP0UI3B.ts`, `runNdxIconPixelTracePipeline.ts`. Tests: `ndxIconSystemP0UI3B.test.ts` (12 pass). Build green.
- **Priority icons corrected:** Overview (house), Content Ops (circle/target), Campaigns (clapper), Notification (bell footprint enlarged), Lab, More, Ellipsis, project menu icons.
- **Preserved:** Page layout, navigation behavior, SITE00 host canon, NDX brand canon — icon geometry only.

---

## 2026-08-25 — Character isolate "generating" stuck without FAL / preview

- **Context:** Founder on CAST NDX character casting saw "Isolate generating…" while FAL dashboard showed no in-flight job.
- **Root cause:** `applyCastingGenerationResults` updated casting **candidate** `previewUrl` after FAL completed but never copied it to `characterIsolate.previewUrl` / `canonicalAnchor.previewUrl`. UI only reads isolate record → perpetual "generating" even after successful FAL run.
- **Fix:** `hydrateImageReferenceAssetsFromGeneration` + failure hydrate in `imageReferenceCasting.ts`; wired from `applyCastingGenerationResults` / `applyCastingGenerationFailure` in `castingEngine.ts`. UI isolate panel falls back to candidate preview, shows FAL error, and offers **RETRY ISOLATE GENERATION** when stuck/failed.
- **Test:** `imageReferenceCastingP05E4E1.test.ts` case `27b`.

---

## 2026-08-25 — Character isolate orphan GENERATING (nothing on FAL)

- **Context:** Founder still saw "Character isolate still generating" / ANCHOR PENDING on LAB casting while FAL dashboard showed no in-flight job (after PR #464 preview sync fix).
- **Root cause:** `castingFalGenerationInProgress` treated any `round.status === 'GENERATING'` as active even when `falGenerationTracking` was null — orphan state after dispatch never started or process lost tracking. UI also keyed off `characterIsolate.status === 'GENERATING'` alone.
- **Fix:** `reconcileOrphanedCastingGenerationState` on casting hydrate — fail or complete orphan GENERATING rounds when no RUNNING tracking. `castingFalGenerationInProgress` now requires `falGenerationTracking.status === 'RUNNING'`. UI shows stalled banner + RETRY instead of perpetual "generating"; approve disabled while FAL actually running.
- **Test:** `characterIsolateOrphanGenerating.test.ts`.

---

## 2026-08-25 — P0.UI.3C active project notification center + bell dropdown wiring

- **Context:** Founder sprint P0.UI.3C — bell incorrectly opened project menu (duplicate of ellipsis). Required separation: bell → project-scoped notification center; ellipsis → project/system menu only.
- **Root cause:** `FounderWorkspaceShell` wired `onOpenNotifications={() => setMenuOpen(true)}` for both mobile chrome and desktop header — bell and ellipsis shared the same menu state.
- **Delivered:** Generic `projectNotifications/` module (types, categories, priorities, dedupe, relevance filter, `ProjectEventNotificationAdapter`, deep links). In-memory store + API actions (`project_notifications_list`, `project_notification_mark_read`, `project_notifications_mark_all_read`). `ActiveProjectNotificationCenter` portaled dropdown (NOTIFICATIONS | MESSAGES tabs; messages transport honestly BLOCKED). Full route `/projects/:slug/notifications`. Shell wiring with mutual exclusion (`toggleNotifications` closes menu; `toggleMenu` closes notifications). Unread lime badge, mark read / mark all read, entity-aware deep links. Dev fixtures for ndxbook. P0.UI.3B bell SVG preserved. Tests `ndxNotificationCenterP0UI3C.test.ts` (14 pass). Build green.
- **Founder next:** Redeploy Railway API for notification endpoints; optional future Supabase `studio_world_project_notifications` + live message transport.

---

## 2026-08-25 — Notification dropdown mobile alignment fix

- **Context:** Founder screenshot — bell notification panel clipped on left ("NDXBOOK" → "XBOOK"); not aligned to bell on mobile.
- **Root cause:** Shared `bellAnchorRef` attached to hidden desktop header bell (`display:none` → zero `getBoundingClientRect`), breaking `right`-based positioning math.
- **Fix:** Mobile-only ref on visible bell; `computeNotificationPanelPosition` with left-based anchor + viewport clamp; resize/scroll reposition; `max-width: calc(100vw - 24px)`.
- **Test:** `ndxNotificationPanelPosition.test.ts`.

---

---

## 2026-08-25 — P0.VR.1D.6 mobile Campaign Board design correction + lime diamond recovery

- **Context:** Founder attached mobile Campaign Board screenshot as PRIMARY_VISUAL_AUTHORITY. Screen existed but wrong day selector, placeholder cards, broken gray diamond, missing artwork lanes.
- **Delivered:** Rebuilt `MobileCampaignBoardScreen` (WEEK 01, May 24–30, 7-col day grid, Pages 3/day + Margins 4/day + Book in Motion 1/day with View All). Reference artwork crops in `campaign-board-artwork/*.webp`. Restored NDX lime diamond via `Site00Diamond` in mobile chrome. `FounderWorkspaceShell` routes `campaign-board` to dedicated mobile layout. `p0vr1d6/` audit + live correction runner (~85% overlay). Tests `visualReconstructionP0VR1D6.test.ts`.
- **Founder next:** Upload GoDaddy ZIP v111.

---

## 2026-08-26 — P0.VR.1D.9 mobile page shell reconstruction (Campaign + Lab frame replacement)

- **Context:** P0.VR.1D.6/1D.8 tightened inner content but protected the old mobile page shell — reference governed cards inside an incorrect frame. Founder sprint P0.VR.1D.9: entire visible phone screen is design authority; preserve function, replace visual shell.
- **Delivered:** `p0vr1d9/` — `MobileScreenVisualShellSpec`, `FunctionalShellAuthority` vs `VisualShellAuthority`, Campaign/Lab full-screen `ScreenImplementationSpec` with shell regions, `VisualShellMatchEvaluation`, `STALE_AFTER_SHELL_RECONSTRUCTION`, `PARENT_GEOMETRY_FIRST`, live shell QA runner. `MobileFounderWorkspaceChrome` accepts `visualSpec` + reference CSS vars (20px gutters, 52px header, 56px nav, cream paper). Campaign/Lab content on direct page surface (`site00-fws-mobile-content-shell`) — no giant wrapper card. Interactive day selection + experiment card selection preserved. VR regions: `ndx.campaign.screen|header-shell|content-shell|bottom-nav-shell`, `ndx.lab.*`. Client-safe `p0vr1d9/client.ts` for UI bundle. Tests `visualReconstructionP0VR1D9.test.ts` (14 pass). Doc `SITE00_VISUAL_RECONSTRUCTION_P0VR1D9.md`. Build green.
- **Preserved:** P0.VR.1D.6 Campaign artwork/sections; P0.VR.1D.8 Lab grid/ratings/inspect; notifications; project menu; bottom nav routing.
- **Founder next:** Upload GoDaddy ZIP after merge; live shell overlay QA when dev server available.

---

- **Context:** Founder attached mobile Lab / Experiment 01 screenshot as PRIMARY_VISUAL_AUTHORITY. Screen existed as placeholder grid with wrong tiles, missing breadcrumb/metrics/subject, wrong rating labels.
- **Delivered:** Rebuilt `MobileExperiment01Screen` (breadcrumb, title+IN PRODUCTION chip, FIND THE NDX PAGE, 3-col metrics, 3×3 grid with lime selected card, Current Direction V2.3 + star ratings, Inspect Experiment). Reference crops in `experiment-01-artwork/*.webp`. `FounderWorkspaceShell` routes `experiment-01` to dedicated mobile layout. Lab bottom nav → experiment-01. `p0vr1d8/` audit + live runner (~88% overlay). Tests `visualReconstructionP0VR1D8.test.ts`.
- **Founder next:** Upload GoDaddy ZIP v112.

---

## 2026-08-26 — P0.VR.1D.10 mobile full-screen shell rollout (Overview, Content Ops, Cultural Intelligence, Character Lab)

- **Context:** Founder sprint P0.VR.1D.10 — roll P0.VR.1D.9 methodology across remaining NDX mobile tabs. Full-screen references are design authority; preserve routes/data/interactions; rebuild page shell, header geometry, content bounds, section spacing, bottom nav. Campaign Board + Lab/Experiment 01 regression only.
- **Delivered:** `ndxMobileVisualShellSpecs.ts` per-screen `MobileScreenVisualShellSpec`; fullscreen reference crops for all four targets. `FounderWorkspaceShell` expanded `mobileDedicatedScreens` (overview, content-ops, cultural-intelligence, character-lab). `MobileFounderWorkspaceChrome` accepts `visualSpec` (reference-driven CSS vars). Rebuilt `MobileContentOpsScreen`, `MobileCulturalIntelligenceScreen`, `MobileCharacterLabScreen` (removed generic `MobileScreenFrame`); Overview wrapped in `site00-fws-mobile-shell-screen`. Shell VR regions in `ndxVisualRegionIds.ts`. `p0vr1d9/` functional vs visual shell authority + stale lock invalidation. `p0vr1d10/runMobileShellRolloutPass.ts` live overlay pass. Tests `visualReconstructionP0VR1D10.test.ts` (10 pass). Live overlay scores: Overview ~81%, Content Ops ~86%, Cultural Intelligence ~85%, Character Lab ~69%. Campaign/Lab regression selectors preserved.
- **Founder next:** Upload GoDaddy ZIP v113.

---

## 2026-08-26 — P0.UI.3D reference-locked icon rebuild + NDX_ICON_VISUAL_CANON_V3

- **Context:** Founder attached NDXBOOK icon reference sheet (13 icons) as PRIMARY_ICON_VISUAL_AUTHORITY. P0.UI.3B improved architecture but some icons remained approximate (ellipsis missing circle container, project_overview copied house, etc.).
- **Delivered:** `p0ui3d/` module — `NDXIconReferenceAuthorityMap`, 13 reference crops (`icon-crops-v3/`), `NDX_ICON_GEOMETRY_V3` full path replacement, `NDX_ICON_VISUAL_CANON_V3` wired through canonical `NDXIconRegistry`. V2 geometry superseded non-destructively. Extended silhouette classifier for V3 paths. Tests `ndxIconSystemP0UI3D.test.ts` (14 pass). Build green.
- **Preserved:** NDXIcon, registry API, currentColor, active/inactive states, notification/project menu behavior, page layout.
- **Founder next:** Upload GoDaddy ZIP (frontend-only).

---
- **Delivered:** `NotificationCenterVisualAuthority` + failure taxonomy (`notificationCenterVisualEvaluation.ts`). Shared `FounderWorkspacePopoverSurface` (portal, viewport clamp, NDX paper shell) used by notification center and project menu. `founderWorkspacePopoverPosition.ts` — 16px gutters, `min(340px, calc(100vw - 32px))`, dvh-aware max-height, right-viewport anchoring. CSS overhaul: `--ndx-surface-raised` paper, mono typography tokens, row dividers, title wrap, lime unread/tab accent, designed messages empty state. VR regions: `ndx.notification.panel|header|tabs|list|row|footer`. Tests `ndxNotificationCenterP0UI3C2.test.ts` (14 pass) + updated P0.UI.3C/panel position tests. Build green.
- **Preserved:** All P0.UI.3C notification semantics; project menu behavior; bell/ellipsis exclusivity; P0.UI.3B bell SVG.

---

## 2026-08-26 — P0.UI.3E hard icon asset replacement + registry source swap + runtime hash verification

- **Context:** Founder sprint P0.UI.3E — P0.UI.3D created reference-locked V3 geometry but live NDX UI could still render stale icons (inline paths not consumed, no runtime proof). Sprint requires physical canonical SVG files as single runtime source, registry hard-swap (no V1/V2 fallback for 13 targets), DOM version/hash attributes, and live DOM proof.
- **Root cause (forensic):** P0.UI.3D stored geometry in TypeScript inline objects without inspectable SVG files or runtime version attributes; no cache-busted public assets; founder could not verify live consumption vs source repo.
- **Delivered:** 13 physical V3 SVGs in `shared/site00-studio-world-ui/icons/ndx/v3/` + cache-busted copies in `public/icons/ndx/v3/*.hash.svg`. `scripts/icons/generateNdxV3SvgCanon.ts` generates SVGs, `manifest.generated.json`, `v3AssetRegistry.generated.ts`. `p0ui3e/` module: `buildV3AssetBackedIconRegistry()` (targets only from V3 assets, throws on legacy path signatures), `NDX_ICON_RUNTIME_SOURCE_MAP`, `IconGeometryAuthorityState` (V1/V2 SUPERSEDED, V3 ACTIVE_CANONICAL), failure taxonomy types. `registry.ts` swapped to V3 asset-backed builder (no fallback chain). `NDXIcon.tsx` exposes `data-ndx-icon-version`, `data-ndx-icon-source`, `data-ndx-icon-hash`, `data-ndx-icon-path`. Tests `ndxIconSystemP0UI3E.test.ts` (9 pass) + updated P0UI3B/3D (35 total pass). Live DOM proof on `/projects/ndxbook`: all 7 visible icons (5 bottom nav + 2 header) report `version=v3`, `source=reference-canon`. Build includes V3 assets in `dist/icons/ndx/v3/`. Release v115.
- **Preserved:** Routes, click handlers, notification/project menu behavior, active/inactive color-only states, accessibility, NDX brand canon.
- **Founder next:** Upload GoDaddy ZIP v115; hard refresh; verify page source uses new bundle hash (not v114 `index.Bl_8hN8x.js`).

---

- **Context:** Founder asked whether Railway must redeploy on every push, or only API changes — concerned about deployment cost accumulation.
- **Clarified:** SITE 00 split — **GoDaddy cPanel** serves static SPA (`dist/`) at `site00.com` / `site00.fsbw-dev.com`; **Railway** serves Node API at `api.site00.com`. Merging to `main` ≠ live site. Most sprints are frontend-only (UI, CSS, hooks, shared client registries) and need **cPanel ZIP only** — not Railway. Railway redeploy needed when `api/**`, `server/**`, `api/_lib/**`, or Railway env vars change. Preview hosts always call `api.site00.com` via `resolveSite00ApiBase()`.
- **Delivered:** Expanded `docs/DEPLOYMENT.md` with **Deploy checklist** section — quick decision tree, path cheat sheet, agent session-close format (`FRONTEND` · `API` · `BOTH` · `NONE`), founder steps, Railway watch-paths cost tip, common symptoms table. `CORE.md` shipping note updated to reference checklist and forbid Railway redeploy on frontend-only merges.

---

## 2026-08-26 — P0.VR.1D.11 Character Lab full-screen reference reconstruction + FAL asset extraction

- **Context:** Founder attached Character Lab mobile screenshot as FULL_SCREEN_REFERENCE authority. P0.VR.1D.10 rolled out generic shell but Character Lab content still used old stacked layout, wrong copy/metrics, generic sticky note CSS, 2-col performance grid.
- **Delivered:** Rebuilt `MobileCharacterLabScreen` — CHARACTER LAB title, Language/Voice/Casting tabs (interactive), two-column hero (canonical portrait + language note with lime "best friend."), WHO SHE IS lime bullets + reference-positioned sticky note, quote card, 4-column performance grid (REELS, reference deltas). Reference crops: `character-portrait.webp`, `language-note-surface.webp`, `working-draft-sticky-note.webp`. `p0vr1d11/` module — shell spec, asset manifest/resolver, FAL classification, stale lock invalidation, live correction pass. VR regions: `ndx.character.*`. Tests `visualReconstructionP0VR1D11.test.ts` (17 pass). Build green.
- **Preserved:** Character Bible route, tab behavior, notifications, project menu, bottom nav, canonical portrait (no random generation).
- **Founder next:** Upload GoDaddy ZIP after merge.

---

## 2026-08-26 — P0.VR.1D.12 Legacy shell flash removal + reference-shell-first loading

- **Context:** Reconstructed NDXBOOK routes (especially Experiment 01) briefly showed superseded `site00-project-lore-calibration` shell with "Loading Experiment 01…" before P0.VR.1D.9+ reference shell appeared after data fetch.
- **Root cause:** `ProjectBrandMarketingExpressionExperiment01Page` gated `FounderWorkspaceShell` on `versionTab === 'V23' && v23Artifacts.length > 0` — legacy shell rendered on founder-facing path until experiment data resolved.
- **Delivered:** Route-based shell first — `FounderWorkspaceShell` always for ndxbook experiment-01; mobile `MobileExperiment01Screen` renders synchronously (static reference). `ReferenceShellLoadingState` (experiment-01 3×3 skeleton geometry) for desktop loading. `ReferenceShellSuspenseFallback` for lazy-route Suspense on reconstructed NDX paths. `data-visual-shell-version="P0.VR.1D.9+"` on shell/chrome; legacy inspect markup marked `legacy` + `RUNTIME_CURRENT_ROUTE_ELIGIBLE=false`. `p0vr1d12/` module + failure taxonomy. Tests `visualReconstructionP0VR1D12.test.ts` (20 pass). Build green.
- **Preserved:** Experiment data fetch, V23 operate layer, inspect methodology, notifications, project menu, bottom nav routing.
- **Founder next:** Upload GoDaddy ZIP (frontend-only).

---

## 2026-08-26 — Campaign Board live local week dates

- **Context:** Founder reported Campaign Board tab still showed static reference dates (WEEK 01, May 24–30) instead of current calendar week.
- **Delivered:** `resolveCampaignBoardWeekCalendar()` + `useCampaignBoardWeekCalendar()` hook — Mon–Sun local week, ISO week label (`WEEK NN`), uppercase date range, day picker with real month/day, today highlighted. Wired into `MobileCampaignBoardScreen`, overview hub campaign tape, and desktop campaign page default selected day. Static `ndxCampaignBoardMobileReference` dates retained for VR lineage only. Tests `campaignBoardLiveDates.test.ts` (5 pass).
- **Founder next:** Upload GoDaddy ZIP (frontend-only).

---

## 2026-08-26 — NDX founder mobile gray letterbox removal

- **Context:** Founder reported gray side panels / letterbox gutters on left and right of mobile NDX founder screens (Campaign Board and related routes).
- **Root cause:** Global `.site00-mobile-shell__main` horizontal padding exposed `#f4f4f2` ecosystem shell background beside full-width NDX founder chrome; fixed 350px section width further constrained content on wider phones.
- **Delivered:** `.site00-ecosystem-shell--ndx-founder-mobile` now zeroes `padding-inline` on ecosystem/mobile shell mains, sets paper background, and allows full-width content. `.site00-fws-mobile-content-shell` and campaign page cards use fluid `100%` / `72vw` sizing instead of fixed 350px caps. Tests `ndxFounderMobileLetterboxRemoval.test.ts` (2 pass).
- **Founder next:** Upload GoDaddy ZIP (frontend-only).

---

## 2026-08-26 — Overview mobile TODAY AT NDX live date

- **Context:** Founder reported Overview tab showed static reference date "May 24" instead of actual current date.
- **Delivered:** `OverviewMobileHomeScreen` uses `useCampaignBoardWeekCalendar()` + exported `formatNdxTodayDateLabel()` for uppercase live date (e.g. AUG 26). Refreshes every minute and on tab visibility return. Tests in `campaignBoardLiveDates.test.ts`.
- **Founder next:** Upload GoDaddy ZIP (frontend-only).

---

## 2026-08-26 — P0.NAV.1 Lab Hub + Experiment / Character navigation recovery

- **Context:** Founder sprint — LAB bottom nav routed directly to Experiment 01, orphaning Character Lab (Language Lab, Voice Lab, Casting, Character Bible, continuity). Required parent Lab workspace with EXPERIMENTS + CHARACTER destinations.
- **Forensic:** Mobile `ndxFounderWorkspaceMobileNav` had `href: experiment-01`, `screenId: experiment-01` — no path to Character Lab from primary nav.
- **Delivered:** `/projects/ndxbook/lab` Lab Hub (`ProjectLabHubPage`, `LabHubOperateLayer`) with editorial EXPERIMENTS + CHARACTER panels; bottom nav LAB → Lab Hub (desktop + mobile configs); `NDX_LAB_ROUTE_GROUP` + `isNdxLabRouteGroupPath` keeps LAB active on lab/experiments/character/casting/continuity routes; `LabHubBackLink` on Experiments Hub + Character Discovery; Experiments hub nav `LAB › EXPERIMENTS HUB`; status summaries from hub registry + optional casting/marketing API; failure taxonomy in `labNavigationEvaluation.ts`; tests `ndxLabNavigationP0NAV1.test.ts` (15 pass). Build green.
- **Preserved:** Existing Character Lab route (`/character/discovery`), Experiments Hub, Experiment 01 deep links, notification deep links, project menu, lab icon v3 geometry, Language/Voice/Casting/Continuity sub-routes.
- **Deploy:** FRONTEND only — cPanel/fsbw-dev ZIP after merge.

---

## 2026-08-26 — P0.VR.1D.13 Campaign Board full-screen reference rebuild

- **Context:** Founder attached approved Campaign Board mobile screenshot as FULL_SCREEN_REFERENCE authority (`CAMPAIGN_BOARD_FULL_SCREEN_VISUAL_AUTHORITY`). Required complete mobile shell rebuild matching reference while preserving campaign data, day selector, quick actions, notifications, project menu, and bottom nav.
- **Delivered:** Rebuilt `MobileCampaignBoardScreen` v1d13 — LAB HUB breadcrumb, title + supporting copy, 2-column status card (live `useCampaignBoardMobileRun`), SCHEDULE OVERVIEW (7 live day cells MON/MAY 24 format), THE PAGES (4 artwork cards + peek), BOOK IN MOTION (Interesting/Fair artwork), QUICK ACTIONS 2×2 grid. Removed THE MARGINS lane. Reference + artwork assets under `public/visual-references/founder/ndxbook/`. `p0vr1d13/` module — shell spec, asset manifest/resolver, stale lock invalidation, correction pass. `ReferenceShellLoadingState` campaign-board skeleton (P0.VR.1D.12). Tests `visualReconstructionP0VR1D13.test.ts` (22 pass). Build green.
- **Preserved:** Campaign API hooks, day selection, View All routes, lock/generate actions, notification center, project menu, Campaigns bottom-nav active, live calendar dates, canonical page artwork (no unnecessary FAL regen).
- **Deploy:** FRONTEND only — cPanel/fsbw-dev ZIP after merge.

---

## 2026-08-26 — P0.VR.2 Master Design Reconstruction Workspace

- **Context:** Founder sprint P0.VR.2 — formalize NDXBOOK visual reconstruction methodology into permanent Studio World Design workspace. Reference = design authority; keep function, rebuild look; mobile/desktop independent authorities.
- **Delivered:** `p0vr2/` module — `CanonicalVisualReference`, versioning, `FunctionPreservingVisualRebuildContract`, `VisualReconstructionComposerBrief`, asset resolver, design screen matrix, reconstruction run. Routes `/studio-world/design` + `/projects/:projectSlug/design`. UI `StudioWorldDesignWorkspace`. NDXBOOK pilot screens registered. Tests `visualReconstructionP0VR2.test.ts` (15 pass). Build green.
- **Preserved:** SITE 00 host canon, project brands, historical lineage, existing P0.VR.1D pipelines.

---

## 2026-08-26 — P0.VR.2A Reference asset slot compiler + FAL prompt generation

- **Context:** Follow-up to P0.VR.2 — extend Design workspace so image-like reference regions become geometry-locked asset slots with auto-compiled FAL prompts, existing-asset-first resolution, async generation, preview/canon bind, without layout shift or blocking shell reconstruction.
- **Delivered:** `p0vr2a/` module — `ReferenceVisualAssetSlot`, region classification (`IMAGE_ASSET`/`MIXED_REGION`), `ReferenceAssetBrief`, `ReferenceAssetPromptCompiler` (placement + crop + safe area context), crop extraction, existing asset lookup, FAL provider routing, async generation pipeline, preview/canon bind, asset QA, notifications, composer brief `assetSlotContracts`. React `ReferenceAssetSlot` geometry-locked placeholder. Design workspace UI: MISSING VISUAL ASSETS panel, GENERATE MISSING / GENERATE THIS ASSET, INSPECT PROMPT, PROMOTE ASSET. NDXBOOK pilot seeds (campaign-board manifest + overview sample slots). Tests `visualReconstructionP0VR2A.test.ts` (15 pass). Build green (`index.CcudgPvV.js`).
- **Core rule enforced:** Reference reconstruction engine defines slot geometry; FAL generates only the visual asset for the predefined slot — not page layout.
- **Preserved:** P0.VR.2 workspace, P0.VR.1D.13 campaign assets, character authority gate (no random character fallback), Studio World generic architecture.

---

## 2026-08-26 — P0.VR.2B Design workspace full-screen reference rebuild

- **Context:** Founder attached complete Design Workspace reference (desktop + mobile in one composition). Required full shell rebuild to match reference — SITE 00 host authority, not NDX project shell. Preserve all P0.VR.2 + P0.VR.2A functionality.
- **Delivered:** `p0vr2b/` module — `SITE00_DESIGN_WORKSPACE_VISUAL_AUTHORITY`, desktop/mobile visual specs, live visual match scoring, activity feed, quick actions, URL deep-link state, stale lock invalidation. New `Site00DesignWorkspaceShell` with SITE 00 sidebar/nav, project header, breadcrumb, control panel, 3-column compare + slider, visual match panel, missing assets table/cards, recent activity + quick actions footer. Screen matrix demoted to HISTORY tab; INSPECT holds technical detail. Reference image at `public/visual-references/founder/site00/design-workspace-reference-p0vr2b.jpg`. Tests `visualReconstructionP0VR2B.test.ts` (9 pass). Build green (`StudioWorldDesignPage.BENjX3yO.js`).
- **Core rule:** Attached image is design spec, not inspiration. NDXBOOK is selected project; SITE 00 owns host chrome.
- **Preserved:** P0.VR.2 reconstruction pipeline, P0.VR.2A asset slot/FAL pipeline, canonical references, mobile/desktop authority separation.

---

## 2026-08-26 — P0.PAF.1 Frontal Slayer Product Asset Factory

- **Context:** Founder sprint P0.PAF.1 — dedicated Frontal Slayer product-image production pipeline separate from SITE 00 visual reconstruction. Master hero = product visual authority; Build-A-Wig variant matrix + Product Page color derivatives; concurrent FAL batch generation; Supabase asset canon with lineage.
- **Delivered:** `productAssetFactory/p0paf1/` module — `ProductMasterHero`, `ProductHeroDecomposition`, `ProductEditRegionMap`, hair color/style registries, `ValidProductConfigurationGraph`, `ProductVariantMatrix`, `VisualVariationDependencyMap`, `ProductVariantPromptCompiler` (image-reference primary; text-to-image blocked for canonical derivatives), FAL provider routing, `VariantGenerationConcurrencyPolicy`, batch pipeline with cost gate + selective retry/resume/cancel, `ProductIdentityQa`, structured Supabase storage paths, `ProductVisualAssetRecord` + duplicate/idempotency detection, batch notifications. API `api/_lib/site00ProductAssets/service.ts`. UI route `/projects/frontal-slayer/product-assets` — `ProductAssetFactoryWorkspace` (BUILD-A-WIG + PRODUCT PAGE modes). Tests `productAssetFactoryP0PAF1.test.ts` (31 pass). Build green (`ProjectProductAssetFactoryPage.BWfKFjpe.js`).
- **Core rule:** One approved master hero → many controlled variants. Lock everything except founder-selected attributes. Image-reference edit only for canonical derivatives.
- **Preserved:** Six signature unit visual canon (read-only registry, no commerce SKU mutation), SITE 00 host canon, historical asset lineage.

---

## 2026-08-26 — P0.PAF.2 Shared Supabase product asset delivery + bindings + runtime resolver

- **Context:** Follow-up to P0.PAF.1 — wire Product Asset Factory to shared Supabase (`hyycomvcaqxxvyrfupes`) with dedicated `frontal-slayer/product-assets/` namespace, canonical DB tables, ACTIVE/PREVIEW bindings, and Frontal Slayer website runtime resolver (no FAL at runtime).
- **Delivered:** Cross-repo contract `shared/frontal-slayer-product-assets/` (v1 types + `buildDeterministicVariantKey` + runtime `productVisualAssets` service). `p0paf2/` module — storage namespace (masters/products/build-a-wig/shared/archived), storage manifest, ingest pipeline (FAL→Supabase, never FAL URL canonical), binding store/service (PREVIEW/ACTIVE/SUPERSEDED, unique active, batch bind, resolver test gate), asset library tree, P0.PAF.1 bridge. Supabase migration `fs_product_master_heroes`, `fs_product_visual_assets`, `fs_product_asset_bindings`, `fs_build_a_wig_visual_variants` + RLS public read for approved. UI: LIVE BINDINGS, BATCH BIND, ASSET LIBRARY, WEBSITE RUNTIME PREVIEW panels. P0.PAF.1 storage paths upgraded to P0.PAF.2 namespace. Tests `productAssetFactoryP0PAF2.test.ts` (10 pass) + P0.PAF.1 updated (41 total pass). Build green (`ProjectProductAssetFactoryPage.8jg-Kfbr.js`, `index.BKOa8RM2.js`).
- **Core rule:** Studio World produces + approves; Supabase stores + binds; Frontal Slayer website resolves ACTIVE approved assets only.
- **Preserved:** Single shared Supabase project, six signature units, commerce/SKU/pricing unchanged, no service-role in client bundles.

---

## 2026-08-26 — P0.VR.3A SITE 00 self-audit + design route manifest registration

- **Context:** Founder sprint P0.VR.3A — extend Design Reconstruction so SITE 00 is a first-class designable project (customer-facing website routes, not host shell). Code-driven route forensics, missing dependency discovery, mobile/tablet/desktop independent coverage, self-design safety boundary.
- **Delivered:** `p0vr3/` manifest pipeline — `DesignableProjectRecord` registry (SITE 00 + existing projects), `StudioWorldDesignRouteManifest` v1 sync, dynamic `listDesignWorkspaceProjects()`. `p0vr3a/` — `site00RouteForensics` (~30 discovered routes from `routes.ts` + nav configs), 5 interaction states (homepage expanded panels, waiting room menu), 9 missing/implied routes (Guide/Sound/FAQ/Contact/Blueprints from design nav + auth/account/brand implied), dependency graph, reference quality audit (browser-safe), coverage matrix + Needs Reference queues, `Site00SelfDesignBoundary` (blocks MATCH REFERENCE on host shell). Extended P0.VR.2: tablet viewport (768×1024), manifest-driven screen registry, matrix tablet column. Design workspace: SITE 00 in project dropdown, tablet toggle, coverage in INSPECT, host boundary on MATCH REFERENCE, SITE00_HOST accent. Tests `visualReconstructionP0VR3A.test.ts` (10 pass) + P0.VR.2 updated. Build green (`StudioWorldDesignPage.D2jDGtcp.js`, `index.BjINv33e.js`).
- **Core rule:** SITE 00 website ≠ Design workspace host. Audit discovers/classifies/registers only — no FAL spend, no page mutation.
- **Preserved:** P0.VR.2 reconstruction, P0.VR.2A asset slots, NDXBOOK pilot, design workspace host canon.

---

## 2026-08-26 — P0.VR.3D SITE 00 manifest v2 reconciliation + self-audit semantic merge

- **Context:** Follow-up to P0.VR.3A (SITE 00 semantic self-audit, v1 manifest) — reconcile with P0.VR.3B normalized route authority before P0.VR.3C design-family consolidation. User required one active v2+ manifest; v1 becomes historical artifact only; separate route count layers (raw implementation vs normalized screens vs website/client experience vs primary founder-designable).
- **Delivered:** `p0vr3b/` — `studio-world-design-route-manifest@2` v2.1.0, raw implementation route inventory, DesignScreenRecord normalization, true orphan = 0. `p0vr3d/` — `Site00RouteExperienceScope`, P0.VR.3A→v2 mapping, enriched DesignScreenRecords, deduplicated missing-route registry, family candidates for P0.VR.3C, `Site00AuditReconciliationReport`, `DesignRouteSyncContract`, dynamic `Site00FounderDesignScreenSet`. Updated `p0vr3/designRouteManifest.ts` — active authority v2+; v1 compile as `HISTORICAL_AUDIT_ARTIFACT`. Design workspace: PRIMARY/ALL DESIGNABLE screen set + INSPECT route forensics. Tests `visualReconstructionP0VR3D.test.ts` (14 pass). Build green (`StudioWorldDesignPage.BUCT8Y2U.js`, `index.xBVeUmIH.js`).
- **Counts (computed):** raw 165 · normalized 145 · self-audit 31 · website/client 28 · primary set 42 · states 5 · missing 9 · mapped 31/31.
- **Core rule:** P0.VR.3B = implementation universe; P0.VR.3A = website/client semantic subset — merge, don't choose.
- **Preserved:** P0.VR.3B normalization, P0.VR.3A forensics/self-design boundary, host protection, historical v1 lineage.

---
