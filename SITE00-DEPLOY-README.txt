SITE 00 — GoDaddy cPanel deploy bundle (2026-08-24 v53)
========================================================

Includes PR #388:
- Founder mobile capture-auth bootstrap for Railway visual capture
- /control/debug/capture-auth — export Playwright storage state from phone
- Visual dev link when authenticated Projects refs are not VALID

WHAT TO UPLOAD
--------------
1. site00-production-dist-2026-08-24-v53.zip
2. cPanel public_html — delete old files, upload, extract, hard refresh

VERIFY
------
- Page source references index.DkGLYKZe.js (NOT index.BT7zuSxb.js)
- /control/debug/capture-auth shows EXPORT FOR RAILWAY (signed in as founder)

RAILWAY
-------
Redeploy api.site00.com from main (new POST /api/capture-auth-bootstrap).
Founder: export JSON on phone → paste SITE00_CAPTURE_STORAGE_STATE_JSON → redeploy.
