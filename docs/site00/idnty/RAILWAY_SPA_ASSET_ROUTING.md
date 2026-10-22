# Railway staging SPA — asset routing (carefree-luck)

## Root cause

`npx serve dist -s` enables **single-page application fallback**: any missing file (including `/assets/*.js` after a deploy) is rewritten to **`index.html`** with HTTP 200 and `text/html`. Safari then fails dynamic `import()` and the app can render a **blank white screen**.

Railway **Hikari** static hosting exhibits the same behavior when `-s` / SPA mode is used.

## Fix

Start command:

```bash
npm run start:spa
```

Implementation: `server/site00SpaStaticServer.ts` (Express)

| Request | Response |
| --- | --- |
| Existing `/assets/*` file | 200, correct MIME, `Cache-Control: public, max-age=31536000, immutable` |
| Missing `/assets/*.js` / `.css` | **404** `text/plain` — never HTML |
| Deep link (e.g. `/admin/site00/foundation-readiness`, `/foundation/:token`) | 200 `index.html`, `Cache-Control: no-cache, no-store, must-revalidate` |

## Railway service settings (carefree-luck)

- **Build:** `bash scripts/staging/build-founder-staging-spa.sh` (unchanged)
- **Start:** `npm run start:spa` (replace `npx serve dist -s -l $PORT`)
- **Config-as-code (optional):** set service config path to repo root `railway-spa.toml` (sets `startCommand = npm run start:spa`)
- **PORT:** injected by Railway (server reads `process.env.PORT`)

Manual path if config-as-code is not used: Railway dashboard → **carefree-luck** → **Settings** → **Deploy** → **Custom Start Command** → `npm run start:spa` → **Redeploy**.

## Regression tests

```bash
npm test -- tests/site00SpaStaticServer.test.ts
npm run build && node scripts/staging/verify-spa-static-server-live.mjs
node scripts/staging/verify-spa-static-mobile-readiness.mjs
```
