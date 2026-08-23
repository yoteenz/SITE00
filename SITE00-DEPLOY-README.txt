SITE 00 — GoDaddy cPanel deploy bundle (2026-08-23 v9)
========================================================

WHAT THIS IS
------------
Production static SPA for https://site00.com (Architecture C: static GoDaddy + API on Railway).

Includes (merged main as of 2026-08-23):
- Personality replay methodology comparison on review page (blind hero + benchmark + scores)
- Blind replay execution progress panel on HOW YOU SHOW UP → REVIEW
- JSON parse hardening for replay pipeline (API on Railway — redeploy if not already)
- Create Account at /origin/create-account (sign-in CREATE ACCOUNT link fixed)
- Mobile NDX BOOK Brand Lore calibration (/projects/:slug/calibrate)
- Railway auth WebSocket fix (Projects API when signed in)
- index.html no-cache headers (new deploys take effect immediately)

WHY CREATE ACCOUNT STILL GOES TO ORIGIN HOMEPAGE
-------------------------------------------------
**Merging to GitHub does NOT update site00.com.** As of the last check, live files were
still from **2026-08-21 20:49 UTC** with bundle `index.BT7zuSxb.js`.

That old bundle:
- Has NO /origin/create-account route
- CREATE ACCOUNT link goes to /sign-in?returnTo=... (also missing route)
- Unmatched paths fall through to / (Origin homepage)

Quick check (View Page Source on site00.com):
  STILL OLD (broken):  /assets/index.BT7zuSxb.js
  DEPLOYED (fixed):    /assets/index.CNB6EHR2.js or newer hash

WHAT TO UPLOAD (mobile cPanel — ~5 min)
---------------------------------------
1. Download site00-production-dist-2026-08-22.zip from this GitHub Release
2. GoDaddy app → My Products → Web Hosting → Manage → File Manager
3. Open **public_html** (web root — NOT a subfolder)
4. **Select all existing files** → Delete (or move to a backup folder dated today)
   - Skipping this step leaves old index.html pointing at the old bundle
5. Upload the ZIP to public_html
6. Select the ZIP → **Extract** → confirm files land directly in public_html
   - You should see index.html, .htaccess, assets/, site00/ at the top level
7. Open site00.com in a private/incognito tab
8. View Source — confirm script src is NOT index.BT7zuSxb.js
9. Test https://site00.com/origin/create-account → CREATE ACCOUNT form

VERIFY AFTER UPLOAD
-------------------
- https://site00.com/origin/create-account shows CREATE ACCOUNT form (not homepage)
- https://site00.com/origin/sign-in → CREATE ACCOUNT → same form
- View source: meta app-build-id is NOT __APP_BUILD_ID__
- Sign in → /projects loads (requires api.site00.com healthy)

TROUBLESHOOTING
---------------
- Still see BT7zuSxb? Extract went to a subfolder — move contents up to public_html
- Still old on phone? Safari → Settings → Safari → Clear History and Website Data
- Create account works in Cursor preview but not site00.com? Preview ≠ production — upload this ZIP

API
---
This bundle expects VITE_API_BASE=https://api.site00.com (baked in at build time).
Confirm https://api.site00.com/api/health returns {"ok":true,"service":"site00-api"}.

AUTO DEPLOY (optional)
----------------------
Enable GitHub Actions FTP: set repo variable GODADDY_DEPLOY_ENABLED=true and secrets
GODADDY_FTP_HOST, GODADDY_FTP_USERNAME, GODADDY_FTP_PASSWORD. Pushes to main then deploy automatically.

ROLLBACK
--------
Previous release ZIPs: https://github.com/yoteenz/SITE00/releases
