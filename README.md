# SITE 00 — Standalone Application

Independent commercial product extracted from the Frontal Slayer monorepo. Production domain: **https://site00.com**

## Local development

```bash
cd site-00   # sibling to frontal-slayer on founder machine; cloud agent: /home/ubuntu/site-00
cp .env.example .env.local
# Fill VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, optional VITE_API_BASE
npm install
npm run dev
```

Dev server: **http://localhost:5174**

### API server (Railway / local)

Sign-in, profile sync, and admin routes live under `api/` and run via Express:

```bash
# Terminal 1 — API (default :3000)
npm run start:api

# Terminal 2 — Vite proxying /api to the API server
VITE_DEV_PROXY_TARGET=http://127.0.0.1:3000 npm run dev
```

Production: deploy the API service to Railway (`railway.toml` → `npm run start:api`). Build the SPA with `VITE_API_BASE=https://api.site00.com`. See `docs/DEPLOYMENT.md`.


On Cursor Cloud Agents, SITE 00 has its **own tunnel** on port **5174**:

| Terminal | Purpose |
|----------|---------|
| `site00-vite` | Standalone dev server (this repo) |
| `site00-preview-tunnel` | Cloudflare → port 5174 |

Secrets (optional persistent URL): `SITE00_CLOUDFLARE_TUNNEL_TOKEN`, `SITE00_CLOUDFLARE_TUNNEL_HOSTNAME`

When `.cursor/environment.json` is active, both terminals start automatically on every Cloud Agent boot (tunnel script auto-restarts on exit). For preview that survives between agent sessions, deploy `dist/` to GoDaddy (see **GoDaddy deploy bundle** below) or run the tunnel on always-on infrastructure.

Ephemeral URL file: `/tmp/site00-cloud-preview-url.txt`

## GoDaddy deploy bundle (cPanel)

Production SPA for **site00.com** — upload and extract into `public_html` (not the ZIP itself).

| Item | Link |
|------|------|
| Latest production ZIP | [site00-production-dist-2026-08-21-v2.zip](https://github.com/yoteenz/SITE00/releases/download/site00-deploy-2026-08-21-v2/site00-production-dist-2026-08-21-v2.zip) |
| Deploy readme | [SITE00-DEPLOY-README.txt](https://github.com/yoteenz/SITE00/releases/download/site00-deploy-2026-08-21-v2/SITE00-DEPLOY-README.txt) |
| All releases | [GitHub Releases](https://github.com/yoteenz/SITE00/releases) |

After upload: hard-refresh on mobile (Safari → pull to refresh or clear site data). Cloud preview tunnel reflects workspace code immediately; **site00.com** only updates after cPanel deploy.

Setup guide in Frontal Slayer repo: `docs/cloud-agent/site00-preview-tunnel.md` (cloud agent scripts live there until moved).


`VITE_SITE00_ROOT=1` is set at build time so `/` serves ORIGIN.

## Environment variables

See `.env.example`. Never commit `.env`, `.env.local`, or production secrets.

| Variable | Scope | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Browser | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Browser | Supabase anon key |
| `VITE_API_BASE` | Browser | API origin (empty = same origin) |
| `VITE_ADMIN_EMAILS` | Browser | Comma-separated admin allowlist |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | API routes / ASSTS generation |
| `FAL_KEY` | Server only | FAL image generation |
| `ADMIN_EMAILS` | Server only | Admin API authorization |

## Build & production preview

```bash
npm run build
npm run preview
```

Upload **only** `dist/` to GoDaddy web root (plus `.htaccess` for SPA routing — included in `public/.htaccess` and copied to `dist/` on build).

## Routing

Client-side SPA. Apache/cPanel: use `public/.htaccess` rewrite rules so deep links (`/services`, `/control`, etc.) serve `index.html`.

## Backend / Supabase

SITE 00 currently shares the Frontal Slayer Supabase project (`hyycomvcaqxxvyrfupes`) during migration. Schema migrations live in `supabase/migrations/*site00*`. Target architecture: dedicated SITE 00 Supabase project — see `docs/DEPLOYMENT.md`.

Serverless API routes (`api/admin/site00-*`, `api/site00/*`) require a **Node runtime** or external hosting (not static cPanel alone). Options documented in `docs/DEPLOYMENT.md`.

## GoDaddy deployment

**Hosting product must be confirmed by owner** (cPanel static vs Node.js). See `docs/DEPLOYMENT.md` for DNS, canonical host (`site00.com` → redirect `www`), and CI options.

## Repository

```bash
git remote add origin git@github.com:YOUR_ORG/site-00.git
git push -u origin main
```

Do **not** push to the Frontal Slayer remote.

## Agent memory (motherboard)

FSBW-style persistent agent context lives in **`motherboard/`** at repo root. Agents auto-load it each chat (see `.cursor/rules/motherboard.mdc`). Quick reference: `docs/MOTHERBOARD_COMMANDS.md`.

## Security

- No service-role keys in `VITE_*` variables
- Client credential onboarding must use OAuth/tokens — never plaintext passwords in Git or localStorage
- Rotate any keys found in extracted code before production

## Extraction status

Extracted from Build-a-Wig / Frontal Slayer monorepo. Original SITE 00 code **remains in Frontal Slayer** until validation gates pass (Phase 23).
