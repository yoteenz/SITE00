# Digital Foundation — isolated founder staging (PR #1642)

**Sprint:** P0.SITE00.IDNTY.FOUNDER-STAGING-DEPLOYMENT1  
**Source:** PR #1642 · branch `cursor/idnty-founder-readiness-e2e-be3b` · SHA `e65fd536` (plus staging manifest commits)  
**Rules:** Do **not** merge #1642 to `main`. Do **not** redeploy production Railway. Do **not** upload staging SPA to GoDaddy `public_html` for `site00.com`.

---

## Audit summary (2026-10-14)

| Layer | Production today | Staging exists? |
| --- | --- | --- |
| Railway API | Single service → `api.site00.com` · commit `286dba76249c` | **NO** dedicated staging service in repo or health probes |
| SPA | GoDaddy `site00.com` | **NO** isolated staging host in repo |
| Supabase | Project `hyycomvcaqxxvyrfupes` (“FS Website”) · DF tables present · **1 artifact row** | **NO** branch · **NO** second project in org listing |
| Resend | Domain `site00.com` verified (founder) | Same account OK if app allowlist + synthetic guards enforced |
| Stripe | Production webhook on prod API | Staging needs **TEST** keys + **staging-only** webhook URL |

**Isolation verdict:** Staging **cannot** safely use production Supabase tables (mutable shared state). **Block** restart-safe persistence E2E on staging until a **founder-approved** staging Supabase project (or Supabase branch) is provisioned and migrations applied **only there**.

---

## A. Railway staging API (duplicate service)

1. In Railway project **SITE00**, **Add service** (do not replace `site00-api` production).
2. Connect repo `yoteenz/SITE00`, set **branch** to `cursor/idnty-founder-readiness-e2e-be3b` (pin deploy to PR #1642 SHA).
3. Use same `railway.toml` → `npm run start:api`, healthcheck `/api/health`.
4. Generate **Railway default URL** (e.g. `https://site00-df-staging.up.railway.app`) — **do not** attach `api.site00.com`.
5. After deploy, verify:
   - `GET /api/health` → `gitCommit` matches PR branch SHA.
   - `digitalFoundation.founderReadiness` object **present** (only after #1642 code deploys).

### Staging API environment variables (names only)

Copy from production **only where safe**; use **TEST** Stripe keys; use **staging Supabase** URL/keys when staging DB exists.

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Staging project URL (not production when testing writes) |
| `SUPABASE_ANON_KEY` | Staging anon |
| `SUPABASE_SERVICE_ROLE_KEY` | Staging service role |
| `SESSION_COOKIE_SECRET` | Staging-specific value |
| `SESSION_COOKIE_SECURE` | `true` |
| `ADMIN_EMAILS` | Founder admin email(s) |
| `SITE00_DIGITAL_FOUNDATION_PERSIST_SUPABASE` | `1` when staging DB ready |
| `SITE00_DF_FOUNDER_TEST_MODE` | `1` |
| `SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST` | Founder inbox(es) only, comma-separated |
| `SITE00_DF_TRANSACTIONAL_EMAIL_SEND` | `0` until preview approved; then `1` |
| `RESEND_API_KEY` | Same Resend account OK; sends still allowlist-gated |
| `SITE00_DF_TRANSACTIONAL_FROM` | `SITE 00 <hello@site00.com>` (verified domain) |
| `SITE00_DF_TRANSACTIONAL_REPLY_TO` | `hello@site00.com` |
| `RESEND_WEBHOOK_SECRET` | Staging webhook signing secret (Resend dashboard) |
| `SITE00_PUBLIC_APP_ORIGIN` | **Staging SPA origin** (invitation links) |
| `STRIPE_SECRET_KEY` or `SITE00_STRIPE_SECRET_KEY` | **TEST** secret only |
| `STRIPE_WEBHOOK_SECRET` or `SITE00_STRIPE_WEBHOOK_SECRET` | **TEST** webhook secret for staging URL |
| `SITE00_DIGITAL_FOUNDATION_STRIPE_SIM` | Optional `1` for sim checkout without Stripe |

**Never** commit values. Never print secrets in logs.

### Resend webhook (staging only)

- URL: `https://<staging-api-host>/api/site00/digital-foundation-resend-webhook`
- Do **not** point production Resend webhook at staging.
- Register separate staging endpoint in Resend after staging API is live.

---

## B. Staging frontend (isolated)

Options (founder choice — no DNS change required for option 1):

1. **Railway static / second cPanel subdomain** (founder creates e.g. `staging.site00.com` — DNS approval separate from this doc).
2. **Founder Cloud preview** on PR branch (temporary; not a durable staging URL).

Build SPA bound to staging API:

```bash
STAGING_API_BASE=https://YOUR-STAGING-API.up.railway.app \
STAGING_PUBLIC_ORIGIN=https://YOUR-STAGING-SPA-ORIGIN \
bash scripts/staging/build-founder-staging-spa.sh
```

Railway serves `dist/` directly (no ZIP required). Optional local artifact: `STAGING_SPA_PACKAGE_ZIP=1` when `zip(1)` is installed.

Upload ZIP output to **staging host only** — not GoDaddy production `public_html` for apex `site00.com`.

**Founder test route:** `{STAGING_PUBLIC_ORIGIN}/admin/site00/foundation-readiness`

---

## C. Supabase staging

### Migrations (apply on staging DB only)

1. `20261008160000_site00_digital_foundation_artifact_v1.sql`
2. `20261008170000_site00_digital_foundation_persistence_v2.sql`
3. `20261010103000_site00_df_project_messaging.sql`

Verify tables: `site00_df_artifacts`, `site00_df_leads`, `site00_df_quotes`, `site00_df_operations_bundle`, etc.

**Production project `hyycomvcaqxxvyrfupes` already contains DF rows** — staging writes there would mix test and real data. **Use a new Supabase project** (founder-approved) or enable Supabase branching when available.

---

## D. Stripe TEST (staging API)

1. Stripe Dashboard → Test mode.
2. Webhook: `POST https://<staging-api>/api/site00/digital-foundation-stripe-webhook`
3. Events: `checkout.session.completed`, `checkout.session.expired`, `charge.refunded` (as configured in handler).
4. No live keys on staging service.

---

## E. First invitation (prepare only)

1. Sign in to staging SPA as founder admin.
2. Open `/admin/site00/foundation-readiness`.
3. Create synthetic client with email **on allowlist**.
4. **Prepare test invitation** → confirm subject, FNDATN-01 template, link uses `SITE00_PUBLIC_APP_ORIGIN`.
5. Check **Founder approves Resend send** → **Send test invitation** (only after explicit approval).

Local dry-run (no send):

```bash
SITE00_DF_FOUNDER_TEST_MODE=1 \
SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST=your@email.com \
SITE00_PUBLIC_APP_ORIGIN=https://your-staging-origin.example \
node scripts/staging/founder-invitation-preview.mjs
```

---

## F. Safety gates (code-enforced)

- Synthetic prefix `SYNTH ·` on lead business name.
- `SITE00_DF_FOUNDER_TEST_RECIPIENT_ALLOWLIST` required for provider send.
- `founder_approved_send: true` required on `dispatch-test-email`.
- `SITE00_DF_TRANSACTIONAL_EMAIL_SEND` off → DRY_RUN / blocked send.
- Production lifecycle map remains disabled; FNDATN test map only in founder test mode + synthetic.

---

## G. Agent limitations (this sprint)

- **Railway CLI not available** in cloud agent VM — staging service **not created** by agent.
- **No Supabase staging project** provisioned (would be paid / founder approval).
- **No staging URLs live** without founder Railway + hosting steps above.

**Evidence collected:** production `/api/health` at `286dba76249c`; PR branch tests green locally; invitation preview script on branch.
