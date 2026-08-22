SITE 00 — GoDaddy cPanel deploy bundle (2026-08-22 v3)
========================================================

WHAT THIS IS
------------
Production static SPA for https://site00.com (Architecture C: static GoDaddy + API on Railway).

Includes (merged main as of 2026-08-22):
- Create Account at /origin/create-account (sign-in CREATE ACCOUNT link fixed)
- Mobile NDX BOOK Brand Lore calibration (/projects/:slug/calibrate)
- Railway auth WebSocket fix (Projects API when signed in)
- CTRL ROOM sign out, background URL fixes, api.site00.com API base

WHAT TO UPLOAD
--------------
1. Download site00-production-dist-2026-08-22.zip
2. In GoDaddy cPanel → File Manager → open your site web root (usually public_html)
3. Upload the ZIP
4. Extract IN PLACE so index.html and .htaccess sit directly in the web root
5. Do NOT upload the ZIP folder as a subfolder unless you intend site00.com/subfolder/

VERIFY
------
- https://site00.com loads ORIGIN
- https://site00.com/origin/create-account shows CREATE ACCOUNT form (not homepage)
- https://site00.com/origin/sign-in → CREATE ACCOUNT → same form
- Sign in → /projects loads founder index (requires api.site00.com healthy)
- Hard refresh on mobile after deploy (Safari: pull-to-refresh or clear site data)

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
