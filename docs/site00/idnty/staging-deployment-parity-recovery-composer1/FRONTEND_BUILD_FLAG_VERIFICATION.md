# Frontend build flag verification

## Requirement

`VITE_DF_CUSTOM_INDUSTRY_SELECT=1` at **Vite build** time (production bundles do not enable custom sheet via `import.meta.env.DEV` alone).

## Static bundle scan (insufficient alone)

Entry bundle `index.C0JXqPre.js` may **not** contain literal strings `idnty-sel-sheet` or `ENTER A CONTACT NUMBER` because DF UI lazy-loads in separate chunks.

## Runtime verification (authoritative)

**Script:** `scripts/staging/staging-live-spa-form-control-smoke.mjs`  
**URL:** `https://carefree-luck-staging.up.railway.app/foundation/review#df-r-P02`

**2026-10-19 result:**

| Check | Value |
| --- | --- |
| `#df-industry` tag | **`button`** (custom IdntySelect — not native `<select>`) |
| CONTACT NUMBER label | **visible** |

**PASS** — feature flag behavior active on live staging SPA.

## Repo hardening

`scripts/staging/build-founder-staging-spa.sh` now exports `VITE_DF_CUSTOM_INDUSTRY_SELECT` default **`1`** for reproducible staging builds.
