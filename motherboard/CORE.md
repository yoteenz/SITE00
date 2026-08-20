# Core Context — SITE 00 (site00.com)

Canonical reference for stack, design, and main flows. Keep this updated when the project's **persistent** design or architecture changes.

---

## Product

- **Name:** SITE 00 — standalone commercial product.
- **Production domain:** `https://site00.com` (canonical apex; redirect `www` → apex).
- **Repo:** `github.com/yoteenz/SITE00` (do **not** push to Frontal Slayer / fsbw remote).
- **Extraction status:** Code extracted from fsbw; fsbw copy remains until validation gates pass.

---

## Stack & repo

- **Frontend:** React 19, TypeScript, Vite 5, React Router 6. Styles in `src/site00/styles/`. No Tailwind in standalone SITE 00.
- **Backend / Auth / DB:** Supabase (shared Frontal Slayer project `hyycomvcaqxxvyrfupes` during migration; target = dedicated SITE 00 project). Migrations: `supabase/migrations/*site00*`.
- **API:** Vercel-style serverless handlers under `api/` (admin site00 production, ASSTS, etc.). **Do not run on cPanel static hosting alone** — host separately or use Supabase Edge Functions; see `docs/DEPLOYMENT.md`.
- **Env (browser):** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE`, `VITE_ADMIN_EMAILS`. `VITE_SITE00_ROOT=1` set at build time in `vite.config.ts`.
- **Env (server only):** `SUPABASE_SERVICE_ROLE_KEY`, `FAL_KEY`, `ADMIN_EMAILS`, ASSTS bucket secrets — never `VITE_*`.
- **Local dev:** `npm run dev` → port **5174**. ASSTS local API plugin in dev via `scripts/vite-site00-assts-local-api.mjs`.

---

## Key routes (`src/site00/config/routes.ts`)

| Route | Purpose |
|-------|---------|
| `/` | ORIGIN home (`VITE_SITE00_ROOT=1`) |
| `/idnty/state` | Identity brand state selector (4 primary states) |
| `/idnty/:slug` | IDNTY assessment flows |
| `/bldr/state` | Builder class selector |
| `/evolve/state` | Evolve path selector |
| `/assts` | Asset factory / vault |
| `/control` | Client control panel |

Desktop preview paths use `/desktop` suffix (artboard preview mode).

---

## Identity (IDNTY) — four primary states

Top-level brand states (`src/site00/config/identity.ts`):

| Code | State |
|------|-------|
| 00 | STARTING AT ZERO |
| 01 | SOME PIECES EXIST |
| 02 | READY FOR EVOLUTION |
| 03 | BUILD READY |

**NEEDS COHESION is not a top-level state.** Cohesion is an internal diagnostic inside **Some Pieces Exist** (`IDNTY_PIECES_DIAGNOSTIC_OPTIONS` in `idnty-assessment.ts`): Scattered Pieces, Mostly Cohesive, Missing Key Pieces.

Legacy `/idnty/needs-cohesion` URLs redirect to `/idnty/some-pieces-exist`; localStorage progress migrates in `useIdntyAssessment.ts`.

Investment guide: 4 columns aligned to 4 states (`IDNTY_INVESTMENT_TIERS` with `brandStateId`).

---

## Cloud Agent preview (development)

Separate from Frontal Slayer port 3001:

| tmux session | Purpose |
|--------------|---------|
| `site00-vite` | Vite dev server on **5174** (`SITE00_CLOUD_MOBILE_PREVIEW=1`) |
| `site00-preview-tunnel` | Cloudflare tunnel → localhost:5174 |

Secrets: `SITE00_CLOUDFLARE_TUNNEL_TOKEN`, `SITE00_CLOUDFLARE_TUNNEL_HOSTNAME`. Preview URL file: `/tmp/site00-cloud-preview-url.txt`. Hostname comes from env, not hardcoded in repo.

Clone path on cloud VM: `/home/ubuntu/SITE00` (may mirror `/workspace` checkout).

---

## Production deployment (GoDaddy cPanel)

- **Architecture A (typical):** Static `dist/` + `.htaccess` SPA rewrites to `public_html`. See `docs/DEPLOYMENT.md`.
- **Build:** `npm ci && npm run build` → upload **contents of `dist/`** only.
- **Founder often on mobile:** Build in cloud agent → ZIP `dist/` → upload/extract via mobile cPanel File Manager; do not assume local machine access.
- **API on cPanel static:** Not supported without separate Node/API host (`VITE_API_BASE`).

---

## 00 / CONTROL — internal operator environment

Privileged admin surface at `/admin/site00/*` (guarded by `AdminGuard` / `canAccessAdminPages()`). Distinct from client **CTRL ROOM** (`/control`) and client **Studio** (`/studio/:slug`).

| Layer | Role |
|-------|------|
| **SITE 00** | Public / customer-facing system |
| **PROJECTS** | Client project directory |
| **STUDIO** | Client-facing project production environment |
| **CTRL ROOM** | Customer account-level command center |
| **00 / CONTROL** | Internal operator environment — monitor, approve, intervene, launch |

- **COMMAND** dashboard: `/admin/site00` — desktop + mobile layouts from approved references; data via `getControlCommandPayload` (`api/_lib/site00Production/controlCommand.ts`, action `command`).
- **Shell:** `Site00AdminShell` + `site00-control.css` + `CONTROL_OPERATOR_NAV` (`control-nav.ts`).
- **Mission Control:** `/admin/site00/projects/:projectId` — **VIEW AS CLIENT** opens real Studio (`site00StudioPath(slug)`) in new tab; same underlying project state.
- **Design:** Dense, instrumented, red/black/white — not generic SaaS admin. Real data only; no hard-coded reference mock names.

---

## Email system (transactional + lifecycle)

- **Shared module:** `shared/site00-email/` — art-direction system (`art-direction/`: primitives, families, contracts, reference-render), 12 visual archetypes, 80-template registry, real QR for access templates, debug fixtures (preview only).
- **Typography:** Martian Mono (matches product `site00-fonts.css`) — not Futura/serif in email HTML.
- **Debug gallery:** `/admin/site00/debug/email-pack` (AdminGuard) — gallery with visual-family + fidelity filters, per-template REFERENCE / IMPLEMENTATION / COMPARE modes, mobile/desktop + light/dark inbox framing, composition contracts, text fallback, localStorage approval state.
- **Production sends:** `api/_lib/email/sendEmail.ts` renders from registry; provider not configured until `EMAIL_PROVIDER` env set. Idempotency via in-memory send log stub. Legacy `welcome` → `access-credential-issued`.
- **Auth emails:** Supabase Auth owns verification/reset — SITE 00 templates exist for gallery parity; document provider limitations.
- **Rule:** Mock preview data never used in production sends. Debug route is read-only (no auto-send). Access templates omit production-stage bodyLines in text fallback.

---

Canonical config: `src/site00/config/desktop-environment-presentation.ts`.

| Context | Behavior |
|---------|----------|
| **Desktop toggle** (phone or laptop) | Native full viewport (`Site00DesktopNativeViewportShell`) — **same shell, 100% in sync** |
| Legacy `/origin/desktop`, `/foo/desktop` | Scaled 1440×900 artboard (`Site00DesktopArtboardShell`) |
| Environment background | Viewport cover layer; Enter uses external cover on desktop artboard |
| Bottom chrome | Origin: flex-pinned status strip · Enter: portaled status strip |

**Focal tuning:** Change `background-position` / `desktopPosition` only — never move UI artboard or use bottom-anchor to crop bg. ENTER focal: **higher Y% shifts image up** on the Enter asset (see `SITE00_ENTER_DESKTOP_FOCAL`). Breakpoints are Enter-only in `site00.css`.

---

## Motherboard

- **Folder:** `motherboard/` at repo root (FSBW-style parity established 2026-08-18).
- **Auto-load:** `.cursor/rules/motherboard.mdc` — agents read README, CORE, CODEBASE, MEMORY at chat start.
- **Auto-add:** Append `MEMORY.md` after completed tasks unless user says "stop adding to motherboard".

## Shipping (git / PR)

- **Default:** Feature branch → open PR → **merge to `main` immediately** in the same agent run (see `.cursor/rules/shipping.mdc`).
- **PR purpose:** History and post-merge review for the founder (mobile GitHub app); not a manual merge gate.
- **Opt-out phrases:** "draft PR", "don't merge yet", "wait for my review".
- **`main` ≠ live site:** Merging to `main` updates GitHub (and Railway if connected); **site00.com** still needs GoDaddy deploy.

---

## EVOLVE — Marketing & Content

Fourth complementary EVOLVE capability (alongside REFINE, INSTALL, TRANSFORM): ongoing brand/content production after the property exists.

- **Routes:** `/evolve/marketing`, `/evolve/marketing/services`, intake/brief/engagement under `/evolve/marketing/*`
- **Domain:** `shared/site00-marketing/`, DB `site00_marketing_engagements` (+ events, external_production_links)
- **Studio World:** External production system — **not in this repo**. Server-side adapter only: `api/_lib/studioWorld/` (`STUDIO_WORLD_ADAPTER=mock` default until contract supplied)
- **Admin:** `/admin/site00/marketing-engagements`, debug index `/admin/site00/debug/evolve-marketing`
- **Docs:** `docs/SITE_00_EVOLVE_MARKETING.md`

---

## Docs

| Path | Purpose |
|------|---------|
| `docs/DEPLOYMENT.md` | GoDaddy, DNS, Supabase auth URLs, API hosting options |
| `docs/MOTHERBOARD_COMMANDS.md` | Quick agent command reference |
| `docs/SITE_00_EVOLVE_MARKETING.md` | EVOLVE Marketing service architecture, lifecycle, adapter |
| `README.md` | Local dev, env vars, routing |
