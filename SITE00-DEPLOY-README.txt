SITE 00 — GoDaddy cPanel deploy bundle (2026-08-23 v12)
========================================================

WHAT THIS IS
------------
Production static SPA for https://site00.com (Architecture C: static GoDaddy + API on Railway).

Includes (merged main as of 2026-08-23):
- Six-direction retry button + distinctiveness observations UI
- Six-direction route button on replay review
- Six-direction blind creative consistency review (six-hero grid)
- Legacy invalid comparison banner + NOT EVALUATED scorer labels

WHAT TO UPLOAD (mobile cPanel — ~5 min)
---------------------------------------
1. Download site00-production-dist-2026-08-23-v12.zip from this GitHub Release
2. GoDaddy → File Manager → public_html → delete old files → upload → extract
3. Hard refresh in private tab

VERIFY
------
- /projects/ndxbook/personality-replay/consistency shows RETRY button if prior run FAILED
- Review page has SIX-DIRECTION CONSISTENCY REVIEW button below comparison

API (Railway — required for gate fix)
-------------------------------------
Redeploy api.site00.com from main — distinctiveness gate no longer blocks on clone signals.

ROLLBACK
--------
https://github.com/yoteenz/SITE00/releases
