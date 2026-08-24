SITE 00 — GoDaddy cPanel deploy bundle (2026-08-24 v51)
========================================================

Includes PR #376:
- V2.3 founder revision notes + auto FAL re-render on Experiment 01
- Revision labels (NEEDS LIME, MAKE THIS WORD LIME, etc.) open note modal → Confirm & Re-render
- Approval labels still save immediately

WHAT TO UPLOAD
--------------
1. site00-production-dist-2026-08-24-v51.zip
2. cPanel public_html — delete old files, upload, extract, hard refresh

VERIFY
------
- Page source references index.Ddk6t6bS.js (NOT index.BT7zuSxb.js)
- Experiment 01 V2.3: tap NEEDS LIME → note modal → Confirm & Re-render

RAILWAY
-------
Redeploy api.site00.com from main if API routes changed this session.
