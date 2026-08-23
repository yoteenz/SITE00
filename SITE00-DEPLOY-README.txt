SITE 00 — GoDaddy cPanel deploy bundle (2026-08-23 v14)
========================================================

WHAT THIS IS
------------
Production static SPA for https://site00.com (Architecture C: static GoDaddy + API on Railway).

Includes (merged main as of 2026-08-23, PR #280 + #281):
- EXPERIMENT C — Canonical Carousel Expansion page
  /projects/ndxbook/canonical-carousel-expansion
- NDXBOOK Content Library
  /projects/ndxbook/content-library
- Experiment C FAILED error message now visible in UI
- Carousel slide 02+ generation brief fix (API-side — Railway redeploy required)

WHAT TO UPLOAD (mobile cPanel — ~5 min)
---------------------------------------
1. Download site00-production-dist-2026-08-23-v14.zip from this GitHub Release
2. GoDaddy → File Manager → public_html → delete old files → upload → extract
3. Hard refresh in private tab

VERIFY
------
- /projects/ndxbook/canonical-carousel-expansion shows six worlds + RUN NEXT SLIDE
- /projects/ndxbook/content-library shows CONTENT LIBRARY tabs
- View page source — index.html must NOT reference index.BT7zuSxb.js

API (Railway — required for carousel generation + lineage)
----------------------------------------------------------
Redeploy api.site00.com from main — carousel expansion + creative lineage endpoints.

ROLLBACK
--------
https://github.com/yoteenz/SITE00/releases
