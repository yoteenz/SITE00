# Staging Digital Foundation — configuration & persistence readiness audit

**Sprint:** `P0.SITE00.IDNTY.STAGING-FOUNDATION-CONFIG-AND-PERSISTENCE-READINESS1`  
**Scope:** Staging only · production unchanged · no E2E executed in audit sprint

## Staging identities (expected)

| Layer | URL / ref |
| --- | --- |
| Frontend (Railway `carefree-luck`) | https://carefree-luck-staging.up.railway.app |
| API (Railway `reliable-creation`) | https://reliable-creation-staging.up.railway.app |
| Supabase project | `soocqbyjkxeubfjnuwvf` (site00-staging) |
| Source branch | `cursor/idnty-founder-readiness-e2e-be3b` |

Production Supabase `hyycomvcaqxxvyrfupes` must **not** receive staging E2E writes.

## Live verification snapshot (HTTP, no secrets)

Verified via `GET https://reliable-creation-staging.up.railway.app/api/health`:

- `ok: true`, `service: site00-api`
- `gitCommit`: `a3ac68d526cc` (auth redirect fix included)
- `auth.supabaseHost`: `soocqbyjkxeubfjnuwvf.supabase.co`
- `digitalFoundation.persistSupabaseEnv`: **false** (in-memory DF store)
- `digitalFoundation.founderReadiness.transactionalSendFlag`: **false**
- Stripe / Resend: presence flags true on staging API; **TEST Stripe mode not exposed in health until this PR** (code adds prefix-only `stripeKeyMode`)
- Staging SPA bundle `index.CqHB0fcH.js`: staging Supabase ref appears; one stray production ref string also present — treat browser auth as **UNVERIFIED** until founder confirms sign-in against staging project only

## Configuration matrix

| Variable / group | Service | Purpose | Staging status | Corrective action |
| --- | --- | --- | --- | --- |
| `SITE00_DF_FOUNDER_TEST_MODE=1` | API | Synthetic clients + test gates | Present (health) | — |
| `SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST` | API | Server-side email recipient cap | Present | Keep founder-only addresses |
| `SITE00_DF_TRANSACTIONAL_EMAIL_SEND` | API | Master send switch | **Off** (required for prep) | Set `=1` only when founder approves send step |
| `RESEND_API_KEY` | API | Provider credential | Present | Do not send until flag + approval |
| `RESEND_WEBHOOK_SECRET` **or** `SITE00_RESEND_WEBHOOK_SECRET` | API | Webhook HMAC | Either satisfies | Point Resend webhook to **staging** API URL |
| `SITE00_DF_TRANSACTIONAL_FROM` / `REPLY_TO` | API | FNDATN headers | Present | DNS/DKIM founder action |
| `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1` | API | Durable DF (exact name) | **Missing** | Set on API after schema + RLS sign-off |
| `STRIPE_SECRET_KEY` **or** `SITE00_STRIPE_SECRET_KEY` | API | Checkout | Present | Confirm **sk_test_** prefix; never live on staging |
| `STRIPE_WEBHOOK_SECRET` **or** `SITE00_STRIPE_WEBHOOK_SECRET` | API | Payment webhooks | Present | Staging endpoint in Stripe dashboard |
| `SITE00_PUBLIC_APP_ORIGIN` (+ alias `VITE_SITE00_PUBLIC_ORIGIN` server read) | API | Links in email + checkout returns | **Unverified / likely missing** | Set `https://carefree-luck-staging.up.railway.app` on API |
| `SUPABASE_URL` + service role | API | DB + auth | Points to staging ref | Never production URL |
| `VITE_SUPABASE_URL` / anon key | SPA build | Browser auth | Staging ref in bundle | Rebuild SPA if wrong ref |

Aliases are **alternatives**, not duplicate requirements.

## Persistence

- Code: only `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE === '1'` enables Supabase store (`supabaseStore.ts`). No other alias.
- When off: `memoryStore` only — **API restart drops** synthetic clients and intake progress.
- **Activation blocked until:** staging ref verified ✓, core DF migrations applied ✓, messaging RLS gap addressed (see schema), founder approves Railway env change.

### Recommended Railway change (API service only — founder approval required)

```text
SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE=1
SITE00_PUBLIC_APP_ORIGIN=https://carefree-luck-staging.up.railway.app
```

Do **not** enable transactional send for prep.

## Supabase schema (staging project)

Applied migrations (remote):

1. `20261008160000_site00_digital_foundation_artifact_v1`
2. `20261008170000_site00_digital_foundation_persistence_v2`

Repo also contains `20261010103000_site00_df_project_messaging.sql` — **not listed in remote migration history**; table `site00_df_project_messages` exists with **RLS disabled** (unsafe if exposed to anon).

Prepared on branch (not applied remotely):

- `20261015120000_site00_df_project_messages_rls.sql` — enables RLS only.

Founder approval required before `supabase db push` / MCP apply to staging.

## Founder authentication

- SPA uses staging Supabase ref in deployed bundle.
- Auth redirect fix (`a3ac68d5`): confirmation/recovery targets `/origin/sign-in?returnTo=…` on browser origin; blocks `localhost:3000`.
- **Login E2E:** UNVERIFIED without founder password session.

## Resend safety

- Send flag off on staging API.
- Allowlist enforced in code (`isRecipientAllowedForFounderTestSend`).
- No test emails sent in this sprint.

## Stripe

- Staging API reports secret + webhook secret present.
- TEST mode must be confirmed via key prefix (`sk_test_`) after deploy of diagnostics PR — not independently verified on live staging before this sprint.

## Synthetic E2E (prepared, not executed)

Sequence documented in sprint §12 — run only after founder authorizes, persistence + public origin configured, and allowlisted send approval for step 6+.

## Production

**UNCHANGED** — no DNS, no production Supabase, no merge to `main` in this sprint delivery.
