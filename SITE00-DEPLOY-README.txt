SITE 00 — GoDaddy cPanel deploy bundle (2026-08-23 v32)
========================================================

WHAT THIS IS
------------
Production static SPA for https://site00.com (Architecture C: static GoDaddy + API on Railway).

Includes (merged main as of 2026-08-23, PR #316 + #317):
- EXPERIMENT G — Brand Presentation Concepts (six topic-blind hero concepts)
  /projects/ndxbook/experiment-g-brand-presentation-concepts
- Experiments Hub lists 09 / EXP G between F and E
- NDXBOOK project page: direct "EXPERIMENT G" button + F page banner linking to G
- P1 Composer orchestration infrastructure (SITE00 Projects proof path)

WHAT TO UPLOAD (mobile cPanel — ~5 min)
---------------------------------------
1. Download site00-production-dist-2026-08-23-v32.zip from this GitHub Release
2. GoDaddy → File Manager → public_html
3. DELETE old files in public_html (especially assets/ and index.html)
4. Upload ZIP → Extract in place
5. Hard refresh in private tab (Safari: hold reload → Empty Cache)

VERIFY (critical — if G still missing, deploy did not land)
-------------------------------------------------------------
View page source on https://site00.com/projects/ndxbook/experiments
Search for: experiment-g-brand-presentation

  ✓ FOUND  → deploy succeeded; open Experiment G from hub or direct URL
  ✗ NOT FOUND → old bundle still live; repeat delete + extract

Also verify index.html references a NEW bundle hash (NOT index.XTPjkzI0.js).

Direct URL after deploy:
  https://site00.com/projects/ndxbook/experiment-g-brand-presentation-concepts

API (Railway — required for FORM SIX BRAND PRESENTATION CONCEPTS)
-----------------------------------------------------------------
Redeploy api.site00.com from main — experiment_g_* endpoints must be live.
If formation fails with "API NOT UPDATED", trigger Railway redeploy from main.

ROLLBACK
--------
https://github.com/yoteenz/SITE00/releases
