SITE 00 — GoDaddy cPanel deploy bundle (2026-08-23 v33)
========================================================

WHAT THIS IS
------------
Production static SPA for https://site00.com (Architecture C: static GoDaddy + API on Railway).

Includes (merged main as of 2026-08-23, PR #317 + #318):
- EXPERIMENT G — Brand Presentation Concepts with RETRY when formation fails
- Experiments Hub + NDXBOOK project/F entry points for G
- P1 Composer orchestration infrastructure

WHAT TO UPLOAD (mobile cPanel — ~5 min)
---------------------------------------
1. Download site00-production-dist-2026-08-23-v33.zip from this GitHub Release
2. GoDaddy → File Manager → public_html → delete old files → upload → extract
3. Hard refresh in private tab

VERIFY
------
- /projects/ndxbook/experiment-g-brand-presentation-concepts shows RETRY FORMATION when status FAILED
- View page source — search experiment-g-brand-presentation (must be present)

API (Railway)
-------------
Redeploy api.site00.com from main if formation errors mention unknown action.

ROLLBACK
--------
https://github.com/yoteenz/SITE00/releases
