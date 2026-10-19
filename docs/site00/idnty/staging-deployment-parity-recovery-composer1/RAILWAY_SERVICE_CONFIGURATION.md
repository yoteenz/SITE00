# Railway service configuration (founder redeploy)

Use when parity drifts again. **Staging only.**

## Backend — reliable-creation

1. Railway → project **empowering-clarity** → environment **staging** → service **reliable-creation**.
2. **Settings → Source:** connect `yoteenz/SITE00`, branch **`cursor/idnty-founder-readiness-e2e-be3b`**.
3. Deploy / redeploy; wait for healthy.
4. Verify: `GET https://reliable-creation-staging.up.railway.app/api/health` → `gitCommit` starts with **`255576b5`** (or newer compatible integration SHA).
5. Confirm `digitalFoundation.persistenceStore` = **`supabase`**.

**Start command:** keep existing (`npm run start:api` per `railway.toml`) — do not change without a verified incident.

## Frontend — carefree-luck

1. Service **carefree-luck** → source branch **`cursor/idnty-founder-readiness-e2e-be3b`** @ required SHA.
2. **Variables (build time):**
   - `VITE_API_BASE` = `https://reliable-creation-staging.up.railway.app`
   - `VITE_SUPABASE_URL` = staging Supabase URL (`soocqbyjkxeubfjnuwvf`)
   - `VITE_SUPABASE_ANON_KEY` = staging anon key
   - `VITE_SITE00_PUBLIC_ORIGIN` = `https://carefree-luck-staging.up.railway.app`
   - **`VITE_DF_CUSTOM_INDUSTRY_SELECT=1`** (required)
3. Config-as-code (optional): `railway-spa.toml` → `npm run start:spa`.
4. Verify runtime: `node scripts/staging/staging-live-spa-form-control-smoke.mjs` → `industryControlTag` = **`button`**.

Or local build upload:

```bash
STAGING_API_BASE=https://reliable-creation-staging.up.railway.app \
STAGING_PUBLIC_ORIGIN=https://carefree-luck-staging.up.railway.app \
VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... \
bash scripts/staging/build-founder-staging-spa.sh
```

Then deploy `dist/` per Railway static/Nixpacks flow.
