# Provider inventory (repository truth)

Generated from `shared/jurnl-email-engine` by `scripts/jurnl/email-engine-export.ts`. Edit the source, then re-export.

| Area | Verdict | Finding | Paths |
|---|---|---|---|
| JURNL email delivery | ABSENT | No JURNL email is sent today. The shipped app mounts JURNL in design-preview mode, whose auth adapter is device-local and simulates verification and reset links. | `src/site00/projectRuntime/ProjectRuntimeRoute.tsx`, `src/projects/jurnl/runtime/state/adapters.ts` |
| Supabase Auth (JURNL production adapter) | EXISTS_NOT_MOUNTED | signUp, auth.resend({ type: "signup" }) and resetPasswordForEmail would make Supabase send its own "Confirm signup" and "Reset password" emails. The adapter exists but is never mounted. No emailRedirectTo / redirectTo is passed; PASSWORD_RECOVERY is not handled; changeEmail is stubbed. | `src/projects/jurnl/runtime/state/supabaseAuthAdapter.ts`, `src/projects/jurnl/runtime/state/store.tsx` |
| Supabase email templates / SMTP | NOT_IN_REPO | Auth email templates, sender and SMTP are configured in the Supabase dashboard; there is no supabase/config.toml or template file in this repository, so their current content cannot be verified from source. | `supabase/migrations (no auth email config)` |
| SITE 00 email registry (studio product, not JURNL) | EXISTS_RENDER_ONLY | shared/site00-email renders the SITE 00 template pack (families, archetypes, compositions, fixtures). api/_lib/email/sendEmail.ts renders and logs; when EMAIL_PROVIDER is unset it records "not-configured", and when set it only marks the send queued — no provider call exists. Idempotency is in memory. | `shared/site00-email/`, `api/_lib/email/sendEmail.ts`, `shared/site00-email/sendLog.ts` |
| Resend / SendGrid | STUB_ONLY | Catalogue entries for the SITE 00 Evolve marketing OS with StubEmailAdapter (no send implementation); credentials RESEND_API_KEY / SENDGRID_API_KEY not wired to any send path. | `api/_lib/site00Evolve/providers/registry.ts`, `api/_lib/site00Evolve/providers/adapters/index.ts` |
| Postmark / Mailgun / SES / SMTP / nodemailer / marketing platform | ABSENT | Not present in dependencies or code. | `package.json` |
| Email preview tooling | EXISTS | SITE 00 admin has an email pack gallery and template detail pages rendering shared/site00-email (site00/debug/email-pack). JURNL has none. | `src/site00/admin/pages/debug/EmailPackGalleryPage.tsx`, `src/site00/admin/pages/debug/EmailTemplateDetailPage.tsx`, `src/routes/Site00AdminRoutes.tsx` |
| JURNL server persistence (trigger input) | EXISTS_NOT_MOUNTED | GET/PUT /api/jurnl/repository stores each user’s snapshot (consent, settings, money data) in jurnl_user_snapshots, keyed by Supabase auth user id — the natural input for server-side triggers. Reachable in production mode only. | `api/jurnl/repository.ts`, `supabase/migrations/20261006103000_jurnl_production_persistence.sql`, `server/routes.ts` |

## Decision
- No provider is introduced or replaced in this sprint.
- Auth emails (A02, A08) stay with Supabase Auth; the JURNL authority will be applied through Supabase custom templates or a Send Email Hook once approved.
- Lifecycle mail (A01, A03–A07) needs a delivery provider chosen by the founder later; it plugs in behind the EmailProvider contract (provider-contract.md).
- JURNL email stays separate from the SITE 00 email registry: same idempotency and send-log ideas, different product, different families.
