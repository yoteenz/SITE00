SITE 00 — GoDaddy cPanel deploy bundle (2026-08-23 v11)
========================================================

WHAT THIS IS
------------
Production static SPA for https://site00.com (Architecture C: static GoDaddy + API on Railway).

Includes (merged main as of 2026-08-23):
- Six-direction route button on replay review → /personality-replay/consistency
- Six-direction blind creative consistency review (six-hero grid, sequential progress)
- Legacy invalid comparison banner + NOT EVALUATED scorer labels (not stub 0/5)
- Personality replay methodology comparison on review page (blind hero + benchmark + scores)
- Blind replay execution progress panel on HOW YOU SHOW UP → REVIEW
- Create Account at /origin/create-account
- Mobile NDX BOOK Brand Lore calibration (/projects/:slug/calibrate)

WHAT TO UPLOAD (mobile cPanel — ~5 min)
---------------------------------------
1. Download site00-production-dist-2026-08-23-v11.zip from this GitHub Release
2. GoDaddy app → My Products → Web Hosting → Manage → File Manager
3. Open **public_html** (web root — NOT a subfolder)
4. **Select all existing files** → Delete (or move to a backup folder dated today)
5. Upload the ZIP to public_html
6. Select the ZIP → **Extract** → confirm files land directly in public_html
7. Open site00.com in a private/incognito tab
8. Hard refresh

VERIFY AFTER UPLOAD
-------------------
- https://site00.com/projects/ndxbook/personality-replay/review
  → after replay complete: button **SIX-DIRECTION CONSISTENCY REVIEW →** below comparison
- Button routes to /projects/ndxbook/personality-replay/consistency (six-hero grid)
- Sign in → /projects loads (requires api.site00.com healthy)

API (Railway — separate from this ZIP)
--------------------------------------
Six-direction format derivation + generation run on api.site00.com — redeploy Railway from main
after uploading this bundle.

Confirm https://api.site00.com/api/health returns {"ok":true,"service":"site00-api"}.

AUTO DEPLOY (optional)
----------------------
Enable GitHub Actions FTP: set repo variable GODADDY_DEPLOY_ENABLED=true and secrets
GODADDY_FTP_HOST, GODADDY_FTP_USERNAME, GODADDY_FTP_PASSWORD.

ROLLBACK
--------
Previous release ZIPs: https://github.com/yoteenz/SITE00/releases
