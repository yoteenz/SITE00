# PROOF — FINAL_ROUTE_COMPLETION1
Captured with Playwright/Chromium against the Vite dev server (full-page, DPR 2). Metrics per route in each folder's metrics.log.

| viewport | shots | notes |
|---|---|---|
| mobile 390×844 | 21/21 routes | 0 overflow, 0 local failed requests, 0 page errors |
| mobile 360×800, 430×932 | /idnty only (capture run timed out) | 0 overflow |
| tablet 820×1180 | 17/21 (remaining routes not captured: dev server saturated) | 2-column compositions on SYSTEM/BLDR/SUPPORT/ENTER |
| desktop 1440×900 | 12/21 (run stopped for time) | 3-up paths on EVOLVE/SERVICES |

Known:
- /control, /control/sites, /projects at ≥768 use the legacy operating-world desktop layout (hybrid, client app, founder-gated) — measured horizontal overflow 892 > 820 there; pre-existing, not redesigned.
- /bldr/site (+ /bldr/not-sure): 1 broken image = remote Supabase storage icon blocked by the sandbox egress proxy (not a local asset).
- Local failed asset requests: 0 on all captured routes.
