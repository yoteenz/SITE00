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

## 2026-08-19 — Wire ENTER 00 directory menu links to live routes

Summary of this cloud agent run: user asked why all ENTER menu links on desktop were disabled when routes exist.

- **Context:** `/enter` directory panel showed grayed-out rows for SITES, SERVICES, SYSTEM, ABOUT, JOURNAL, PROJECTS, ACCOUNT, SUPPORT — only BLDR STUDIO was clickable.

- **Root cause:** `SITE00_DIRECTORY_SECTIONS` in `directory.ts` had `enabled: false` on all rows except BLDR (leftover from pre-inventory gating). Global nav and Locations directory already had these routes enabled.

- **Fix (PR #12):** Enabled all explore + your-space rows with `SITE00_ROUTES` hrefs. Account → `/control`. Projects + Account use `requiresAuth`.

- **Convention:** Keep ENTER directory `enabled` flags aligned with registered routes; use `requiresAuth` for guarded destinations instead of disabling links.

---

## 2026-08-19 — ENTER 00: decouple viewport background from UI artboard (PR #17)

- **Issue:** Enter desktop bg stretched; UI placement drifted when focal/anchor fixes applied together.
- **Root cause:** `position: fixed` env layer inside scaled artboard; bottom-anchor moved whole artboard with UI.
- **Fix:** Viewport `cover` bg on artboard **shell** (outside transform); UI artboard top-aligned; focal **32%** baseline; status strip portaled to shell chrome host. Suppress duplicate in-stage env on enter artboard.
