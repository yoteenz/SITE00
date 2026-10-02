# OPUS HANDOFF — FINAL_ROUTE_COMPLETION1

Common to all families
- Primitives: `PublicHubPage` (hero: crumb / h1 / red rule / red declaration / body), `HubTile`, `HubPanel`, `HubSteps`, `HubCta`, `HubTabs`, `HubSearch`, `HubEmpty`, `HubLegacySkin` — CSS `site00-public-redesign-hubs.css` (units `--u/--uv`).
- Locked: routes, data, auth/guards, form behaviour, uppercase contract, no internal terms.
- Allowed: spacing, type scale, glass/shadow material, plate wash/contrast, tile proportions, tablet breakpoints, legacy-skin refinements.
- Prohibited: new states, new copy, shell/nav changes, raster conversion of live-code machines, image generation.
- Responsive authority: mobile 390×844 (360×800, 430×932), tablet 820×1180 two-up, desktop 1440×900 (`.s00pr-hub--wide` ≤ 980u, shell max 1240px).
- Known limitations: legacy skin is generic (attribute selectors) — assessment option cards are tall and red-titled; one legacy image in BLDR intake step 1 does not load locally; hub text sizes are legible-first (7–9u) vs authority micro-type.

| Family | Routes | Reference | Locked hierarchy | Asset slots |
|---|---|---|---|---|
| IDNTY | /idnty, /origin/sign-in, /origin/create-account | /idnty/state | hero → two tiles (SIGN IN, CREATE IDNTY) / form panel | ENV.IDNTY.ATRIUM |
| BLDR | /bldr, /bldr/start, /bldr/:class/* | /bldr/state | hero → 4 stages → READY panel; SITE/WORLD tiles; assessment panel | ENV.BLDR.COMMAND_CENTER; CARD.BLDR.START.* proposed |
| EVOLVE | /evolve, /evolve/:path/*, /evolve/marketing/* | /evolve/state | hero → REFINE/INSTALL/TRANSFORM → PRESERVE>INTERVENE>EVOLVE panel | ENV.EVOLVE.INTERVENTION_CENTER |
| PUBLIC UTILITY | /enter, /sites, /services, /system, /about, /journal, /support | /origin, /origin/locations | hero → tiles/panels/lists | ENV.ORIGIN.COLLAPSED (enter), ENV.IDNTY.ATRIUM |
| CLIENT hybrid | /control, /control/sites, /projects | /idnty/state | shell + hero only; modules untouched | ENV.IDNTY.ATRIUM |
