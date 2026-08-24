SITE 00 — GoDaddy cPanel deploy bundle (2026-08-24 v44)
========================================================

Includes PR #336:
- P1 follow-up: authenticated visual capture + purpose-gated asset resolution
- Visual dev UI: AUTHENTICATED REFERENCE STATUS + RESOLVED VISUAL MATERIAL counts
- Projects page + sign-in surface markers for capture verification

WHAT TO UPLOAD
--------------
1. site00-production-dist-2026-08-24-v44.zip
2. cPanel public_html — delete old files, upload, extract, hard refresh

VERIFY
------
- Page source references index.9D1HQQYk.js (NOT index.BT7zuSxb.js)
- Visual development shows AUTHENTICATED REFERENCE STATUS panel

RAILWAY (required for authenticated /projects capture)
------------------------------------------------------
Redeploy api.site00.com from main.
Set SITE00_CAPTURE_STORAGE_STATE_PATH to Playwright storage state from founder session.
