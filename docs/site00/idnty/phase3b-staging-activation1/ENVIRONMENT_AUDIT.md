# Environment audit (staging contract)

Canonical name list: `scripts/staging/railway-staging-env.names.txt`

## SPA (carefree-luck)

| Variable | Role | Staging status |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser auth project | Present in bundle (staging ref) |
| `VITE_SUPABASE_ANON_KEY` | Public client key | Present (not logged) |
| `VITE_API_BASE` or equivalent | API origin | Must target reliable-creation staging |

## API (reliable-creation)

| Variable | Role | Staging status (health flags) |
| --- | --- | --- |
| `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1` | Supabase store | **ON** |
| `SITE00_PUBLIC_APP_ORIGIN` | Email + checkout links | **Configured** (matches carefree-luck) |
| `SUPABASE_URL` + service role | Server persistence | Staging ref in health |
| `SITE00_DF_FOUNDER_TEST_MODE=1` | Synthetic clients | **ON** |
| `SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST` | Send allowlist | **Present** (addresses not in repo) |
| `SITE00_DF_TRANSACTIONAL_EMAIL_SEND` | Real Resend dispatch | **OFF** |
| `RESEND_API_KEY` | Provider | Present |
| `STRIPE_SECRET_KEY` / `SITE00_STRIPE_SECRET_KEY` | Checkout | Present; mode **unrecognized** on deployed API (prefix not exposed in health — verify `sk_test_` on Railway) |
| `STRIPE_WEBHOOK_SECRET` | Signed webhooks | Present |

## Cloud agent VM (this run)

| Finding | Action |
| --- | --- |
| `SUPABASE_URL` points to **production** ref on agent VM | **Do not** run DF write tests from VM against production |
| No Stripe/Resend keys on agent VM | Live payment/email proof requires staging API + founder session |

## Required founder configuration (not guessed)

1. **Authorized tester email** — must match `SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST` exactly (founder sets on Railway).  
2. **Enable send** — set `SITE00_DF_TRANSACTIONAL_EMAIL_SEND=1` only after allowlist is correct.  
3. **Stripe test** — confirm secret is `sk_test_` or `rk_test_`; webhook endpoint points to staging API.
