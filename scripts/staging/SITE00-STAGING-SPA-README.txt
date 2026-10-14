SITE 00 — Founder staging SPA (Digital Foundation)
Branch: cursor/idnty-founder-readiness-e2e-be3b

NOT for site00.com public_html. NOT production Supabase or api.site00.com.

RECOMMENDED HOST: Railway (same SITE00 project, environment "staging")
Add a NEW service (do not replace reliable-creation API).

After Railway gives you a public URL like:
  https://YOUR-SPA-NAME-staging.up.railway.app
Set STAGING_PUBLIC_ORIGIN to that exact URL, rebuild once if needed, then set on API service:
  SITE00_PUBLIC_APP_ORIGIN=https://YOUR-SPA-NAME-staging.up.railway.app

RAILWAY SPA SERVICE (static)
- Builder: Railpack or Nixpacks
- Build command: bash scripts/staging/build-founder-staging-spa.sh
- Start command: npx serve dist -s -l ${PORT:-8080}
- Healthcheck: / (or disable — static)
- Root directory: blank

Build-time variables ON THE SPA SERVICE ONLY:
  STAGING_API_BASE=https://reliable-creation-staging.up.railway.app
  STAGING_PUBLIC_ORIGIN=https://YOUR-SPA-NAME-staging.up.railway.app
  VITE_SUPABASE_URL=https://soocqbyjkxeubfjnuwvf.supabase.co
  VITE_SUPABASE_ANON_KEY=(site00-staging anon key from Supabase dashboard)

Founder workspace:
  https://YOUR-SPA-NAME-staging.up.railway.app/admin/site00/foundation-readiness

Sign in with a user created in site00-staging Supabase Auth.
Your email must be listed in ADMIN_EMAILS on the API service (reliable-creation).

Confirm API health before testing intake persistence:
  https://reliable-creation-staging.up.railway.app/api/health
  digitalFoundation.persistSupabaseEnv must be true
