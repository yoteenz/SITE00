# Foundation cPanel deployment execution (Group C)

**Public origin:** `https://site00.com` (GoDaddy `public_html`)  
**API origin (build-time):** `https://api.site00.com`

## Current production frontend (probed)

| Field | Value |
| --- | --- |
| Bundle | `index.D8Jaygrd.js` |
| `Last-Modified` | Mon, 28 Sep 2026 |
| Matches repo `main` | **NO** |

## Artifact audit

| Release | SHA256 (from GitHub) | Notes |
| --- | --- | --- |
| `site00-deploy-2026-10-10-v6` | `d75c6ef806fdbe28faaaaa992dc7031246fad8634e40183d227695050523df6e` | Sprint baseline ZIP — **stale** vs current `main` |
| `site00-deploy-2026-10-10-v11` | *(local build from `ce75811a`)* | **Recommended** after backend ready; bundle `index.BGRB6Atk.js` |

Before upload, confirm `dist/index.html` references the new `index.*.js` and **not** `index.BT7zuSxb.js`.

Build command (authorized machine):

```bash
bash scripts/package-cpanel-deploy.sh
```

## Composer access

| Item | Status |
| --- | --- |
| cPanel / SFTP | **NOT CONNECTED** |

## Founder connection path (exact)

1. Download ZIP: [site00-deploy-2026-10-10-v11](https://github.com/yoteenz/SITE00/releases/download/site00-deploy-2026-10-10-v11/site00-production-dist-2026-10-10-v11.zip) (or newer release after `main` moves).
2. GoDaddy → **File Manager** → site00.com document root (`public_html` or domain-specific root).
3. **Backup** current `index.html`, `assets/`, `.htaccess` (download folder or rename).
4. Delete old SPA files in root (not unrelated site folders).
5. Upload ZIP → **Extract** → confirm `index.html` + `assets/` at root.
6. If dotfiles missing: rename `htaccess-deploy.txt` → `.htaccess` per `SITE00-DEPLOY-README.txt`.
7. Hard refresh; view source → new bundle hash.

## Order of operations (mandatory)

1. Fix Supabase data path (Group A infrastructure).  
2. Apply migrations if missing (Group A approval).  
3. Deploy Railway API to compatible SHA (Group B approval).  
4. **Then** deploy cPanel SPA (Group C approval).

Deploying frontend alone leaves Anthony on a **September API/DB mismatch**.

## Deployment approval

**Group C — WAITING** until Groups A + B are green and founder approves upload.

## Post-deploy checks

- `/foundation/review` or disposable `/foundation/:token` loads React (not blank).
- Network tab: API calls go to `api.site00.com`.
- Mobile 390×844 / 393×852 — no horizontal overflow on P02 intake.
