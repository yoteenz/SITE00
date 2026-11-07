# 26 · ENVIRONMENT CONFIGURATION

Set only names here. **Never commit values.** Keep separate credentials for sandbox and production.

## Server (Railway / Node API, never `VITE_*`)

| Variable | Purpose |
|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY` | JWT validation (`/auth/v1/user`) and user-scoped reads under RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Banking writes, the encrypted token table, account deletion |
| `JURNL_BANKING_ENABLED=1` | Master switch (default off) |
| `JURNL_BANKING_ACCESS=FOUNDER_ONLY` | Who may connect: an active FOUNDER_FULL grant. `ALL_USERS` only after a billing decision. |
| `PLAID_ENV=sandbox` or `production` | Selects the Plaid host |
| `PLAID_CLIENT_ID`, `PLAID_SECRET` | Plaid credentials for that environment. Alternatively `JURNL_PLAID_SECRET_VIA_PROXY=1` when an egress proxy injects the `PLAID-SECRET` header. |
| `JURNL_PLAID_AUTH=off` | `optional` / `required` enables Auth, which costs a one-time fee per Item |
| `JURNL_PLAID_DAYS_REQUESTED=90` | History requested at the first link (30–730) |
| `JURNL_BANK_TOKEN_KEY` | 32 random bytes, base64: `openssl rand -base64 32` |
| `JURNL_BANK_TOKEN_KEY_VERSION=1` | Plus `_PREVIOUS` / `_PREVIOUS_VERSION` while rotating |
| `JURNL_BANK_WEBHOOK_URL` | Public HTTPS URL of `/api/jurnl/bank-webhook` (required in production) |
| `JURNL_PLAID_REDIRECT_URI` | OAuth redirect, registered in the Plaid dashboard (needed for OAuth banks) |
| `JURNL_BANK_STORE=supabase` | `pglite` is for local and tests only |

## Client (Vite build)

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Supabase Auth in the browser |
| `VITE_API_BASE` | API origin (empty when served on the same origin) |
| `VITE_JURNL_SERVER_PERSISTENCE=1` | Turns on server persistence. Without it, `/jurnl/app` fails closed. |
| `VITE_JURNL_DATA_MODE` | `PROVIDER_SANDBOX` for a sandbox deployment; unset means PRODUCTION |

## Supabase project

1. Apply the three JURNL migrations in order, on **staging first**: persistence, then grants, then connected banking.
2. Auth: enable email confirmation and configure SMTP (real delivery).
3. Add `https://<host>/jurnl/app/**` to the redirect URLs.
4. Create the founder's FOUNDER_FULL grant with the admin endpoint (`/api/admin/jurnl-internal-grants`).

## Plaid dashboard

1. Create the sandbox keys.
2. Later, request Production. That page shows the prices, and it is where the plan is chosen.
3. Register the redirect URI.
4. Set the webhook URL. JURNL sets it per Item at Link.

## Local test runs

| Command | What it does |
|---|---|
| `npx vitest run tests/jurnl` | Unit + database / RLS + acceptance (PGlite; no network) |
| `PLAID_CLIENT_ID=… JURNL_PLAID_SECRET_VIA_PROXY=1 npx tsx scripts/jurnl/banking/plaid-sandbox-validation.ts` | Live sandbox |
| Production-mode UI E2E | Start a second dev server with `VITE_SUPABASE_URL=http://jurnl-auth.e2e.test VITE_SUPABASE_ANON_KEY=e2e-anon-key VITE_JURNL_SERVER_PERSISTENCE=1 VITE_API_BASE=http://jurnl-api.e2e.test VITE_JURNL_DATA_MODE=PROVIDER_SANDBOX npx vite --port 5175`, then run `JURNL_E2E_SKIP_WEBSERVER=1 JURNL_E2E_PROD_BASE_URL=http://127.0.0.1:5175 npx playwright test e2e/jurnl/jurnl-connected-banking.e2e.ts` |
