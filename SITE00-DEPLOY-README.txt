SITE 00 — GoDaddy cPanel deploy bundle
======================================

WHAT TO UPLOAD
--------------
1. Download the latest site00-production-dist-YYYY-MM-DD-vN.zip from GitHub Releases
2. cPanel File Manager → open the **Document Root** for site00.com
   (Domains → site00.com → Document Root — often public_html OR public_html/site00.com)
3. Delete OLD SPA files inside that folder (index.html, assets/, release-manifest.json, .htaccess)
4. Upload ZIP into that same folder → Extract here (NOT into a new subfolder)
5. Confirm index.html and .htaccess sit directly in the document root
6. Confirm projects/.htaccess exists (nested SPA fallback for /projects/... URLs)
7. If deep links still 404 — cPanel often skips dotfiles on extract/FTP:
   a. Rename htaccess-deploy.txt → .htaccess (document root)
   b. In projects/: rename htaccess-nested.txt → .htaccess (required for /projects/... URLs)
   c. CI runs FTP .htaccess upload after deploy — if verify still fails, do (a)+(b) manually in File Manager
   d. Test: https://site00.com/projects/site00/design must NOT show plain "404 Not Found"
8. Hard refresh site00.com (Safari: hold reload → Empty Cache)

DEEP LINK SMOKE TEST
--------------------
https://site00.com/projects/site00/design must load the React app (not plain "404 Not Found").
View source must contain id="root".

VERIFY YOU HAVE THE RIGHT BUILD
-------------------------------
View Page Source on site00.com. The script tag must reference the bundle from the release notes.

WRONG (stale — capture fix NOT included):
  index.BjMnKpdX.js  (v295 — htaccess only)

RIGHT (capture pipeline fix included):
  index.DufA8Ifn.js or newer (v296+)

Also check: https://site00.com/release-manifest.json
  commitSha should start with 894665b or later (not 1c472ec)

CAPTURE NOW smoke test (SITE 00 project → PAGES tab)
----------------------------------------------------
- Root should show EXISTING (not PROPOSED) when mirror rows load
- CAPTURE NOW must NOT say "CAPTURE INDEX MISSING FOR OVERVIEW"
- If it still does, you are on an old bundle — re-upload the correct ZIP

RAILWAY
-------
API changes only: redeploy api.site00.com from main.
Frontend-only ZIP: no Railway redeploy needed.
