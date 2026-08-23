SITE 00 — GoDaddy cPanel deploy bundle (2026-08-23 v13)
========================================================

WHAT THIS IS
------------
Production static SPA for https://site00.com (Architecture C: static GoDaddy + API on Railway).

Includes (merged main as of 2026-08-23, PR #278):
- EXPERIMENT B — Canonical Creative Range Validation page
  /projects/ndxbook/canonical-creative-range
- Six established NDXBOOK directions (01–06) — NOT shadow formation roster
- Expandable creative logic + founder judgment per direction
- EXPERIMENT A page relabeled BLIND FORMATION CONSISTENCY VALIDATION (unchanged pipeline)
- Link between Experiment A and Experiment B review pages

WHAT TO UPLOAD (mobile cPanel — ~5 min)
---------------------------------------
1. Download site00-production-dist-2026-08-23-v13.zip from this GitHub Release
2. GoDaddy → File Manager → public_html → delete old files → upload → extract
3. Hard refresh in private tab

VERIFY
------
- /projects/ndxbook/canonical-creative-range shows CANONICAL CREATIVE RANGE VALIDATION
- /projects/ndxbook/personality-replay/consistency shows BLIND FORMATION CONSISTENCY VALIDATION
- Experiment B page has RUN CANONICAL RANGE VALIDATION button

API (Railway — required for hero generation)
--------------------------------------------
Redeploy api.site00.com from main — canonical range execute + preflight endpoints.

ROLLBACK
--------
https://github.com/yoteenz/SITE00/releases
