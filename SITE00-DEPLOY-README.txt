SITE 00 — GoDaddy cPanel deploy bundle (2026-08-22 v4)
========================================================

WHAT THIS IS
------------
Production static SPA for https://site00.com (Architecture C: static GoDaddy + API on Railway).

Includes (merged main as of 2026-08-22):
- Create Account at /origin/create-account (sign-in CREATE ACCOUNT link fixed)
- Mobile NDX BOOK Brand Lore calibration (/projects/:slug/calibrate)
- Railway auth WebSocket fix (Projects API when signed in)
- CTRL ROOM sign out, background URL fixes, api.site00.com API base

WHY CREATE ACCOUNT STILL GOES TO HOMEPAGE
-----------------------------------------
Merging to GitHub main does NOT update site00.com. The live site is still on the
pre-Aug-22 bundle until you upload this ZIP to GoDaddy cPanel.

Quick check (mobile Safari → View Page Source, or desktop):
  STILL OLD (broken):  /assets/index.BT7zuSxb.js
  DEPLOYED (fixed):    /assets/index.CNB6EHR2.js  (or newer hash)

If you still see index.BT7zuSxb.js, create-account has no route and falls through
to the homepage. Upload and extract this ZIP, then hard refresh.

WHAT TO UPLOAD
--------------
1. Download site00-production-dist-2026-08-22.zip from GitHub Releases
2. GoDaddy cPanel → File Manager → web root (usually public_html)
3. Upload the ZIP
4. Extract IN PLACE so index.html and .htaccess sit directly in the web root
5. Do NOT extract into a subfolder unless you intend site00.com/subfolder/
6. Confirm index.html references a NEW assets/index.*.js (not BT7zuSxb)

VERIFY AFTER UPLOAD
-------------------
- https://site00.com/origin/create-account shows CREATE ACCOUNT form (not homepage)
- https://site00.com/origin/sign-in → CREATE ACCOUNT → same form
- View source: meta app-build-id is NOT __APP_BUILD_ID__ (shows git/build stamp)
- Sign in → /projects loads founder index (requires api.site00.com healthy)
- Hard refresh on mobile (Safari: pull-to-refresh or Settings → Safari → Clear History)

API
---
This bundle expects VITE_API_BASE=https://api.site00.com (baked in at build time).
Confirm https://api.site00.com/api/health returns {"ok":true,"service":"site00-api"}.

CLOUD PREVIEW vs PRODUCTION
---------------------------
Cloud Agent tunnel reflects workspace code immediately. site00.com only updates after this cPanel upload.

ROLLBACK
--------
Previous release ZIPs: https://github.com/yoteenz/SITE00/releases
