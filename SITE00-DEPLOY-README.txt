SITE 00 — GoDaddy cPanel deploy bundle (2026-08-21 v2)
========================================================

WHAT THIS IS
------------
Production static SPA for https://site00.com (Architecture C: static GoDaddy + API on Railway).

Includes: CTRL ROOM sign out, Aug 21 background URL fixes, Projects wired to api.site00.com.

WHAT TO UPLOAD
--------------
1. Download site00-production-dist-2026-08-21-v2.zip
2. In GoDaddy cPanel → File Manager → open your site web root (usually public_html)
3. Upload the ZIP
4. Extract IN PLACE so index.html and .htaccess sit directly in the web root
5. Do NOT upload the ZIP folder as a subfolder unless you intend site00.com/subfolder/

VERIFY
------
- https://site00.com loads ORIGIN
- Deep links work (/services, /projects, etc.) — .htaccess must be present
- Hard refresh on mobile after deploy (Safari: pull-to-refresh or clear site data)
- Sign in → /projects should load (requires Railway API at api.site00.com)

API
---
This bundle expects VITE_API_BASE=https://api.site00.com (baked in at build time).
API runs separately on Railway — confirm https://api.site00.com/api/health returns JSON.

CLOUD PREVIEW vs PRODUCTION
---------------------------
Cloud Agent tunnel reflects workspace code immediately. site00.com only updates after this cPanel upload.

ROLLBACK
--------
Previous release ZIPs: https://github.com/yoteenz/SITE00/releases
