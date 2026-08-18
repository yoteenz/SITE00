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

### Cloud Agent mobile preview (separate from Frontal Slayer)

On Cursor Cloud Agents, SITE 00 has its **own tunnel** on port **5174**:

| Terminal | Purpose |
|----------|---------|
| `site00-vite` | Standalone dev server (this repo) |
| `site00-preview-tunnel` | Cloudflare → port 5174 |

Secrets (optional persistent URL): `SITE00_CLOUDFLARE_TUNNEL_TOKEN`, `SITE00_CLOUDFLARE_TUNNEL_HOSTNAME`

Setup guide in Frontal Slayer repo: `docs/cloud-agent/site00-preview-tunnel.md` (cloud agent scripts live there until moved).

Ephemeral URL file: `/tmp/site00-cloud-preview-url.txt`


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

## Security

- No service-role keys in `VITE_*` variables
- Client credential onboarding must use OAuth/tokens — never plaintext passwords in Git or localStorage
- Rotate any keys found in extracted code before production

## Extraction status

Extracted from Build-a-Wig / Frontal Slayer monorepo. Original SITE 00 code **remains in Frontal Slayer** until validation gates pass (Phase 23).
