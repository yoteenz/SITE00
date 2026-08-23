SITE 00 — GoDaddy cPanel deploy bundle (2026-08-23 v34)
========================================================

Includes PR #319–#320:
- Experiment G retry on FAILED + journal quarantine fix (API on Railway)
- NDXBOOK Hero Proof inline preview after COMPOSE HERO FRAME (API + UI)

WHAT TO UPLOAD
--------------
1. site00-production-dist-2026-08-23-v34.zip
2. cPanel public_html — delete old files, upload, extract, hard refresh

VERIFY
------
- Experiment E → NDXBOOK Hero Proof shows hero image below COMPOSE HERO FRAME
- Experiment G shows RETRY FORMATION when failed

RAILWAY (required for hero preview + Experiment G formation)
------------------------------------------------------------
Redeploy api.site00.com from main — FAL_KEY must be set for live hero generation.
