# Client Project Room UX + Cost Transparency: forensic notes

Repo: /home/claude/site00. Read-only static audit, 2026-10-05. This builds on `client_app.json` and `review_loop.json` and does not repeat them.
Outputs: `client_components.json` (40 surfaces) and `cost_provider_models.json` (24 models).

## 1. Client-facing surfaces: what exists

There are **four parallel client surfaces**. None of them has a tracked visual authority.

| Surface | Route | Data reality | Verdict |
|---|---|---|---|
| Client app | `/app/projects/:slug/*` | Supabase project row + review tables. Everything else is template or fixture. The Home is a *self-directed creator* dashboard. | Shell REPAIR, Home REDESIGN, Inbox/Library REBUILD |
| Web project room | `/client/projects/:slug/*` | Same manifest. Library, Activity and Messages are placeholders. | Overview CONNECT (right IA), reviews REPAIR |
| STUDIO | `/studio/:slug/*` | **The only client surface that sends a Bearer token and reads production-OS tables** (deliverables, jobs, activity, approval_requests). Its review panel stays empty because nothing writes CLIENT_REVIEW. | CONNECT as data source, REBUILD review detail (buttons hard-disabled) |
| CTRL ROOM | `/control/*` | PLAN = membershipType. NEXT BILLING is a hardcoded "—". The EVOLVE OPERATIONS card and page run on DEMO_FIXTURES, are labelled "FOUNDER · INTERNAL ONLY" and show margin, but the only guard is the account-level route guard. `/control/billing` is an empty placeholder, and the client app's BILLING link points to it. | REDESIGN, move founder ops to /admin |
| /account | `/account`, `/account/intakes*` | Intakes are real and working. `/account` is a link hub. | KEEP intakes |

Counts: KEEP 10 · CONNECT 8 · REPAIR 8 · REDESIGN 6 · REBUILD 8. By status: WORKING 6 · PARTIAL 18 · VISUAL_ONLY 5 · DATA_ONLY 4 · PLACEHOLDER 7.

Shell parts:
- The header project name and diamond marker work.
- The bell has no handler and there is no notifications table in any migration.
- The menu has no handler.
- The bottom nav deviates from canon (PROJECTS/PROFILE instead of PROJECT/LIBRARY), and a test locks in the wrong set.
- The legacy `ProjectPulseHome` and the `/project/:section` hub components (map, build, milestones, decisions, activity) are the right shapes but are unmounted or orphaned. They are good CONNECT candidates for the pulse and the roadmap.

**Review decision UI as it stands:**
- **Approve** is a two-step flow: a consequence card, then "YES, APPROVE". There is no comment field. The app hides the approve panel when `approvalConsequences` is null.
- **Revision** needs a summary only on the client side:
  - In the app, the button stays disabled until the summary is non-empty.
  - In the web room, the button is enabled and a blank summary is silently ignored.
  - **The server accepts an empty summary.**
  - The API supports `category`, but no UI exposes it.
  - All comment and annotation ids are attached automatically.
  - `body.role` is trusted (already reported).
- **STUDIO**: both buttons are disabled and there are no fields.

**Authority check:** I confirmed there is no client-app, project-room, studio or ctrl image authority in `public/site00/**`, `docs/`, `artifacts/` or `visual-references/`. `REFERENCE_LOCKED_V1` is self-asserted against a founder board that is not tracked, and the QA screenshots are not committed.

**Cost UI risk:** `SelfDirectedOpsSignals` renders client "credits/spend" from invented numbers (`usedCredits = reviewCount*5`). It should be removed or rebuilt before any cost-transparency work.

## 2. Payments
**There is no payments foundation.**
- Stripe exists only as types, a service-catalog seed row, a readiness blocker and profile field mapping.
- `PAYMENT_PROVIDER_GATE = 'BLOCKED'` and `stripeReady:false`.
- `site00_invoices` exists, but only the demo seed writes to it and only the admin FinancePage reads it.
- `site00_projects.payment_state` is set only by simulated activation.

## 3. Provider secrets
- Generation keys come from server env only: `FAL_KEY` (about 137 reads), `ANTHROPIC_API_KEY`, `OPENAI_API_KEY` and `XAI_API_KEY`. None are `VITE_` prefixed.
- **OpenArt has no API integration.** All OpenArt spend is manual and recorded in repo JSON ledgers.
- The real encrypted secret store is `site00_provider_secrets` (AES-256-GCM, key from `EVOLVE_PROVIDER_SECRET_KEY`). It is scoped by organisation and only used for EVOLVE marketing OAuth (meta_instagram), with an audit trail in `site00_connection_events`.
- `site00_service_connections` is scoped by project and has a `secret_ref` column, but:
  - it only lists the vercel, supabase, godaddy, github, stripe, resend and shopify providers;
  - the client endpoint lets the client set any `connection_state`;
  - no secret is ever stored.
- There is no BYOK, funding-mode or "production expense owner" concept anywhere.
- Spend guards (`founderConfirmedSpend`) exist, but several shared callers default the flag to `true`.
- The Opus cost ledger writes JSON to `/tmp` by default.
- **Policy conflict:** the existing firewalls (`CLIENT_CONTROL_ROOM_FIREWALL: PROVIDER_SPEND`, `stripInternalFields: providerCostCents, margin*`) define provider spend as founder-internal. Cost transparency needs an explicit founder decision on which cost figures are client-safe.
- Secret-like string: `tests/p0vrOpusNative1.test.ts:105` contains a fake fixture shaped like an OpenAI key. I did not reproduce the value. `.env.example` lists provider key names with empty values.

## 4. Families, phases, pulse
- **Product families** exist only in code: `FamilyProductionContract`, `evaluateFamilyGate` and the 16-point completeness contract in `shared/site00-product-families`, with JURNL F01 and F02 instances.
  - Each family carries `generationBudget`, `approvalStatus` and `founderApproval`.
  - There is no client-approval slot and no DB persistence.
- `site00_design_families` is a table scoped by project and versioned, but no code uses it. `site00_creative_families` holds EVOLVE marketing lineage instead.
- **Phases:**
  - The client phases come from static service templates.
  - `site00_identity_phases` and the org-level launch manifest (`site00_evolve_roadmap_items` and the manifest requirements) are the real roadmap-like models.
- **Pulse inputs exist:** `site00_next_actions`, `site00_project_activity`, `site00_studio_pipeline_state` and the `ClientProjectPulse` type.
- **Split-brain:** client room and app code reads and writes `site00_project_events`, which has **no migration**. Production writes go to `site00_project_activity` instead.

## 5. Real cost data (seed for estimates)
- **OpenArt GPT Image 2.5 Sunburst:**
  - 4K, 9:16, image2image: **317 credits** per job, verified on both F01 and F02. The first job's balance delta was 318.
  - 2K baseline: **170 credits**.
  - 2K repair: quoted at 132, measured at **135**.
- **Credit price** is $0.003 (5,000 credits for $15). That makes about $0.95 per 4K generation and $0.51 per 2K generation.
- **F02 SETUP:**
  - Total: 23 family jobs plus 15 repair jobs, 9,471 credits, about $28.41.
  - Class quotes:
    - SCREEN_PARENT: 317
    - ENVIRONMENT_PLATE: 1,268
    - SCREEN_CHILD: 2,536
    - STATE: 951
    - RECOVERY: 634
    - SCREEN_GRANDCHILD: 634
    - INTERACTION: 951
  - 155 credits are left unallocated rather than invented.
- **F01:**
  - About 7,054 credits, LEGACY_PARTIAL (reconstructed).
  - A later regen and child-plate pass cost 1,268 + 2,853 credits.
- **JURNL project baseline:**
  - Base estimate: 42,331 credits.
  - Realistic range: 52,000–53,100 credits.
  - Safe ceiling: 60,000 credits, about $180.
- **Gap:** 2,975 credits between the end of the F01 ledger (47,509) and the start of F02 (44,534) are not attributed in any repo ledger.
- **Ledger row shape:** `GENERATION_LEDGER.json` rows (project_id, family_id, provider, model, generation_class, credits_spent, approval_status, attempt_number, lineage, and so on) are already almost exactly the requested cost-ledger row. Payer and the estimated/actual split are missing.
- **Other figures:**
  - Opus token rates (15/75/18.75/1.5 USD per million tokens) with per-mode ceilings of $0.75, $6 and $25.
  - Page-asset regenerate estimate: $0.42.
  - Video background removal: `cost_usd` estimate.

## 6. AIO (all-in-one-enterprises)
- **What it is:** a MANAGED_BRAND under EVOLVE, SITE project type, a trucking and logistics business that is woman-owned.
- **Services:** permitting, brokerage, dispatching, compliance, bookkeeping and insurance/factoring. Permitting and Dispatching are the HERO offers. Social marketing is deferred by the owner.
- **Identity:** it starts from an existing operating brand. The skin is `NEW_SKIN_TO_DESIGN` and the visual authority is NOT_STARTED. The palette hint (#1f4fd6) and pricing are unknown or low confidence.
- **Launch manifest** (seed fixtures):
  - Complete: website, mobile, auth, smart intake, legal.
  - In progress: load board, permitting, brokerage, client portal.
  - Not started: payments, production validation.
  - Deferred: social, native app, load-board intelligence.
- **Repo:** unresolved.
- **Missing:** there are no AIO families, spend, invoices or client user binding in the repo.

## 7. Extend vs new (summary)
- **Approval events:** extend `site00_client_review_receipts` with family_id, authority_id, version_label, previous_status, new_status, revision_reason and comment, and require the reason server-side. No third review store.
- **Provider connection:** extend the encrypted `site00_provider_secrets`/`external_connections`/`connection_events` stack. Scope it by project, add generation providers to `site00_service_catalog`, and add authorized_at/revoked_at plus a safe balance snapshot. OpenArt balance would have to be attested manually.
- **Family roadmap:** persist families by extending `site00_design_families` (repoint FK to `site00_projects`) or creating a new `site00_project_families`, seeded from FamilyProductionContract.
- **Project funding:** a NEW `site00_project_funding` table (1:1 with project) based on `ProjectBudgetBaseline` fields, plus funding_mode, labor package/price and expense owner.
- **Cost ledger:** a NEW `site00_generation_cost_ledger`, backfilled from the JURNL ledgers including unallocated rows.
- **Pulse:** derive it, with no table. First fix the events/activity split and add a notifications table.
- **Payments:** defer until the Stripe founder decision. Invoices can carry labor and pass-through lines in the meantime.
