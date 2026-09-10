# SITE 00 Production Deployment — P0.DEPLOY.1

Unified continuous deployment pipeline replacing manual cPanel ZIP upload as the primary release path.

## CURRENT_DEPLOYMENT_TOPOLOGY

### Frontend

| Field | Value |
|-------|-------|
| Stack | React 19 + Vite 5 |
| Build output | `dist/` |
| Production host | GoDaddy cPanel (`public_html`) |
| Production domain | `https://site00.com` |
| Deployment mechanism | GitHub Actions → FTP or SSH/rsync (primary); ZIP manual (emergency fallback) |
| Version source | `shared/site00-release-engine/constants.ts` + `/release-manifest.json` |

### Backend

| Field | Value |
|-------|-------|
| Stack | Express + tsx (`server/index.ts`) |
| Host | Railway (NIXPACKS via `nixpacks.toml`) |
| Start command | `npm run start:api` |
| Health path | `/api/health` |
| Production domain | `https://api.site00.com` |
| Deployment mechanism | Railway auto-deploy from `main` (wait + verify, no duplicate deploy) |
| Worker boot | `startCaptureWorker()` on API boot |
| Version source | `P0_DEPLOY_1_BUILD` in release receipt |

### Release trigger

Merge / push to `main` → `.github/workflows/site00-production-deploy.yml`

## Deployment ownership

| Layer | Owner | Notes |
|-------|-------|-------|
| API + capture worker + Playwright | Railway | Do not move server runtime to cPanel |
| Compiled SPA | cPanel | Static files only |

## Selected cPanel strategy

**Option B — GitHub Actions deploying build artifacts**

1. **Preferred:** SSH/rsync when `GODADDY_SSH_*` secrets + `GODADDY_SSH_DEPLOY_ENABLED=true`
2. **Default:** FTP via `SamKirkland/FTP-Deploy-Action` when `GODADDY_DEPLOY_ENABLED=true`
3. **Future optional:** cPanel Git + `.cpanel.yml` (documented, not primary)
4. **Emergency:** `npm run build:emergency-zip` → manual upload

**Why not cPanel Git as primary:** GitHub Actions already builds with secrets (`VITE_*`); shipping prebuilt `dist/` avoids running Node builds on shared hosting and keeps stale-asset cleanup under CI control.

## ReleasePipeline stages

1. VALIDATE — branch, lockfile, config, secrets presence
2. TEST — `npm test`
3. BUILD — Vite production + `release-manifest.json`
4. DEPLOY_BACKEND — Railway auto-deploy from merge (no duplicate push)
5. VERIFY_BACKEND — poll `/api/health` until `releaseId` matches
6. DEPLOY_FRONTEND — FTP or rsync to cPanel (gated by promotion mode)
7. VERIFY_FRONTEND — fetch manifest + smoke `index.html`
8. VERIFY_COMPATIBILITY — frontend/API/worker version gate
9. COMPLETE — emit `ProductionReleaseReceipt`

## Release ID

Format: `site00-v{version}-{shortsha}` (example: `site00-v271-abc1234`)

Shared across frontend manifest, API health, worker health, and CI receipt.

## Version manifest

Live at: `https://site00.com/release-manifest.json`

Fields: `releaseId`, `version`, `commitSha`, `frontendBuild`, `apiBuild`, `workerBuild`, `builtAt`, `bundleEntry`

Backend health (`/api/health`) includes `release` object with matching fields + `contractVersion`, `serviceReady`.

## Promotion modes

| Mode | Repo variable | Founder action |
|------|---------------|----------------|
| MANUAL_PROMOTION (default) | `SITE00_AUTO_PROMOTE` unset or `false` | Merge → verify backend in Actions → re-run with `deploy_frontend=true` |
| AUTO_PROMOTION | `SITE00_AUTO_PROMOTE=true` | Merge → wait for PRODUCTION READY |

## Credentials (names only — never commit values)

GitHub **production** environment secrets:

- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE`
- `GODADDY_FTP_HOST`, `GODADDY_FTP_USERNAME`, `GODADDY_FTP_PASSWORD`
- `GODADDY_SSH_HOST`, `GODADDY_SSH_USER`, `GODADDY_SSH_PRIVATE_KEY`, `GODADDY_SSH_PORT` (optional)

GitHub **variables**:

- `GODADDY_DEPLOY_ENABLED` — enable FTP deploy
- `GODADDY_SSH_DEPLOY_ENABLED` — prefer SSH/rsync
- `GODADDY_FTP_SERVER_DIR` — remote FTP root (default `./`)
- `GODADDY_SSH_REMOTE_DIR` — remote SSH path (default `public_html`)
- `SITE00_AUTO_PROMOTE` — auto frontend promotion after backend verify

Railway: auto-deploy from `main` (no GitHub secret required for deploy; verify only).

## Stale Vite asset protection

- FTP: `dangerous-clean-slate: true` with host preserve excludes (`.well-known`, `cgi-bin`, etc.)
- SSH: `rsync --delete` with same excludes
- `index.html` + `release-manifest.json`: `Cache-Control: no-cache` via `.htaccess`

## Frontend ownership manifest

See `shared/site00-release-engine/frontendDeploymentManifest.ts` — defines owned paths and host preserve excludes. Does not delete `.well-known`, mail config, or uploads outside owned globs.

## Rollback

- Policy: no auto-rollback on smoke warnings; manual rollback to `lastKnownGoodReleaseId`
- Re-run workflow with known-good artifact or restore previous release directory
- Rollback receipt: `fromRelease`, `toRelease`, `reason`, statuses, `completedAt`

## Migration from ZIP flow

| Old | New |
|-----|-----|
| Download GitHub Release ZIP | Merge to `main` |
| cPanel File Manager upload | GitHub Actions FTP/rsync |
| Manual extract / overwrite | Atomic sync with stale cleanup |
| Manual bundle verify | Live manifest + health compatibility gate |

## Emergency fallback

```bash
npm run build:emergency-zip
```

Upload only when pipeline credentials are unavailable.

## UI

Design → MORE → **DEPLOYMENTS** — compact production status (frontend/API/worker/release ID).

## Concurrency

Workflow concurrency group: `site00-production` — one production release at a time.
