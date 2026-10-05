# SITE 00 — Client app mobile QA (founder runbook)

## What the client app is

The **client-facing app** is **not** a separate React Native / Expo / Capacitor binary. It is the **same Vite + React SPA** as site00.com, with a dedicated mobile shell at **`/app/*`** (bottom nav, app chrome, client-safe copy).

There is **no** `android/` or `ios/` folder and **no** `.apk` build in this repo today.

## Fastest live mobile QA path (Shadow PC / no local emulator)

Use **BrowserStack Live** (mobile **browser**), **not** App Live (App Live expects a native `.apk`).

1. Open [BrowserStack Live](https://www.browserstack.com/live).
2. Pick a phone (start with **Samsung Galaxy S24** or **iPhone 15** — 390×844 class).
3. Open your **cloud preview** base URL (tunnel), then a fixture route below.

### Fixture routes (no sign-in)

Available on **dev** (`npm run dev`) and **cloud preview** builds (`VITE_SITE00_CLIENT_APP_PREVIEW=1` + tunnel meta). **Not** on production site00.com.

| Screen | Path |
|--------|------|
| Project picker (fixtures) | `/app/preview/select` |
| NDXBOOK home (pulse) | `/app/preview/fixture-app-ndxbook` |
| Reviews queue | `/app/preview/fixture-app-ndxbook/reviews` |
| Inbox | `/app/preview/fixture-app-ndxbook/inbox` |
| Library | `/app/preview/fixture-app-ndxbook/library` |

Full 25-screen matrix: `shared/site00-client-app/designStatus.ts` (`CLIENT_APP_QA_MATRIX`).

### Authenticated routes (real project data)

Requires Supabase sign-in on the same origin:

- `/app/projects` — project list  
- `/app/projects/:slug` — app home + bottom nav  

Use a real client account; API calls go to **`https://api.site00.com`** when the host is the preview tunnel (see connectivity below).

## Build / serve locally (VM or laptop)

```bash
npm ci
npm run dev -- --port 5174 --host
```

Open `http://<LAN-IP>:5174/app/preview/select` on a phone on the same Wi‑Fi, or use BrowserStack Live against a **public** tunnel URL.

### Cloud preview tunnel (recommended)

After merge, cloud agent preview server builds with:

- `VITE_SITE00_CLIENT_APP_PREVIEW=1`
- `VITE_SITE00_EC_PREVIEW_GUEST=1` (studio compiler only; unrelated to client app)

Restart preview: `bash .cursor/scripts/restart-site00-cloud-preview-full.sh`

Print QA URLs:

```bash
npm run client-app:qa:urls
# override base:
SITE00_QA_BASE=https://<your-preview-tunnel-host> npm run client-app:qa:urls
```

### Capture 25 QA screenshots (Playwright, local dev)

Dev server must be running on `:5174`.

```bash
npm run client-app:qa:capture
```

Output: `/opt/cursor/artifacts/client-app-screen-*.png` (or `SITE00_QA_OUT`).

## Backend connectivity

| Where you open the app | API base used |
|------------------------|---------------|
| Preview tunnel (`site00.fsbw-dev.com`, cloudflare trycloudflare, `site00-cloud-preview` meta) | `https://api.site00.com` |
| `site00.com` | `https://api.site00.com` |
| Local dev (default) | `VITE_API_BASE` if set, else same origin (vite proxy / local API) |

Cloud phones **cannot** reach `localhost` on your PC. Always QA against the **tunnel URL** or a deployed origin.

Env vars (build-time for SPA): `VITE_API_BASE`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

## Auth check

1. Fixture path: open `/app/preview/fixture-app-ndxbook` — should show app shell + pulse (no login).
2. Real path: sign in on preview origin, then `/app/projects` — should list projects from `/api/site00/client-app`.

## Rebuild loop after code changes

1. Edit client app under `src/site00/pages/clientApp/`, `src/site00/components/clientApp/`, `shared/site00-client-app/`.
2. **Dev:** save → refresh mobile browser.
3. **Tunnel:** push branch → rebuild preview dist → hard refresh on device.

## Known limitations

- No native push, biometrics, or store install — capability contract is web fallbacks (`shared/site00-client-app/nativeCapabilities.ts`).
- `/app/preview/*` is disabled on production GoDaddy builds by design.
- BrowserStack **App Live** / `.apk` upload is **not** applicable until a native wrapper (e.g. Capacitor) is added.

## Optional: BrowserStack App Automate upload

Not wired — no Android artifact. If you add Capacitor later, use env vars `BROWSERSTACK_USERNAME` and `BROWSERSTACK_ACCESS_KEY` (never commit).
