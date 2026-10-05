# SITE 00 — Bulletproof Pipeline Gap Analysis

Sprint: P0.SITE00.GROUND-ZERO-MATURE-CAPABILITY-GENOME-RECONCILIATION1 · main `6f63aaa`.

"Bulletproof" here means each step of IDEA → EVOLUTION has a single owner, a single source of truth, an enforced gate and a recorded outcome. Each step should either fail closed or leave evidence. Below is where the pipeline is not that today, ordered by blast radius.

## 1. Gates that exist but are not enforced

| Governor | Scope | Governed caps | Governor status | Maturity |
|---|---|---|---|---|
| CAP.SECURITY.API_AUTH_MIDDLEWARE | every capability with API handlers that are not public | 48 | EXISTS_PARTIAL | 2 |
| CAP.SECURITY.RLS_POLICIES | every capability that owns tables | 89 | EXISTS_PARTIAL | 3 |
| CAP.RISK.SPEND_CONFIRMATION_GUARDS | paid-generation and provider-calling capabilities | 32 | EXISTS_PARTIAL | 3 |
| CAP.RISK.REFERENCE_BINDING_PREDISPATCH_GUARD | expression pipeline capabilities | 8 | EXISTS_DISCONNECTED | 3 |
| CAP.CANON.LOCKED_ONTOLOGY_ENFORCEMENT | navigation, product and tree capabilities | 22 | CONCEPT_ONLY | 1 |
| CAP.DECISION.COMMERCIAL_FOUNDER_DECISIONS | offer and commercial capabilities | 30 | EXISTS_CONNECTED | 3 |
| CAP.SECURITY.PROJECT_MEMBERSHIP_INVITES | project-scoped capabilities | 52 | MISSING | 1 |
| CAP.PRIVACY.CLIENT_DATA_FIREWALL | client-visible authenticated data | 50 | EXISTS_PARTIAL | 3 |

Every governor that sits over many capabilities is itself partial, missing or concept-only. Specifically:

- **Reference-binding guard (#1357–#1364).** It is tested, but only tests and index files import `precheckGenerationDispatch` and `runPrecheckedProviderDispatch`. About 57 non-test files call fal, xAI, OpenAI or Anthropic directly. OpenArt enforcement is a `.cursor/rules` instruction plus a JSON edit.
- **Spend confirmation.** `founderConfirmedSpend` is a request-body boolean, on endpoints that are often unauthenticated, and some callers default it to `true`. Opus-native is the only real pre-run cost ceiling, and it writes receipts to local files.
- **Family implementation gate.** The QA_READY check reads a self-declared status, not a QA run. The JURNL QA scripts are hard-coded to F01 and run outside CI.
- **Locked ontology / page tree.** It is documented, but no code or CI reads the canon JSON.
- **Regression guards.** They exist, but CI has been red on main since 2026-09-28, so nothing blocks a merge.

**Fix pattern.** Build one provider gateway (`productionRouting.ts` is the natural base) that every paid call goes through. It runs precheck → budget → server-held confirmation → dispatch → cost row. Then fail CI on any direct provider import outside the gateway.

## 2. Authority decided by the caller

- The client role comes from `body.role` / `roleOverride`.
- Payment state is set by the client in three places: `activate-project` → CONFIRMED, marketing `confirm-payment`/`provision`, and identity-commercial `authorize`.
- Admin access falls back to hard-coded `ADMIN_EMAILS`, and the preview-host admin bypass is still on.
- About 20 API endpoints have no auth, including `campaign-package` (`delete_asset_permanent`) and `expression-engine` (live provider jobs). CORS allows any origin, and there is no rate limiting.

**Fix pattern.** PERMISSION_ENGINE (WP02, WP03, WP05). Every route declares a policy, and a test fails any route that does not.

## 3. Sources of truth that disagree

- Projects: 7+ hard-coded registries, 5 EVOLVE org slugs in code, and 5 per-project route families.
- Activity: 6 activity logs and 11 event/activity tables. `site00_project_events`, `user_activity` and `audit_logs` are used without a migration.
- Prices: EVOLVE has a legacy $39/MO public page and a $1,250–$7,500 canonical catalog. BLDR prices are hand-copied five or more times.
- Trees/dependencies: 6 competing models, and JURNL assets live in two roots kept in sync by hand. The approved F01 reference points at missing files, while the real image lives in `JURNL/F01_ENTRY/PARENT/`.
- Three migrations create `site00_campaign_deliverables`. The third (`20260908160000`) uses a different `package_id` schema, and `IF NOT EXISTS` silently skips it, which breaks the campaign-package store's queries.

**Fix pattern.** PROJECT_REGISTRY, EVENT_LEDGER, ASSET_GRAPH and the commercial canon (one price source).

## 4. State that silently disappears

These run on in-memory Maps although tables exist or could exist: courtesy codes, existing-location cases, expression engine entries and chapters, design control plane, page-family approvals, cadence, cultural intelligence, campaign production and content brain. EVOLVE and creative intakes live in browser localStorage. Cost receipts go to `/tmp`. A Railway restart loses all of it.

## 5. Demo data inside production paths

About 10 admin and service reads auto-insert a demo project and the NORTHQUARTER client (a lead, a booking, a site and invoices). Intake conversion falls back to `client@northquarter.example`. Every signed-in client sees the same fake sites in CTRL ROOM, and the client credit UI shows invented numbers (`usedCredits = reviewCount * 5`).

## 6. The loop does not close

There is no send-to-client, and the client fetch lacks a Bearer token, so the API returns 401. Client decisions never reach the workspace. There is no LAUNCHED state, nothing creates a site record at launch, and there is no client hosting or domain. Email never sends.

## 7. No eyes on production

There is no error monitoring, no uptime check and no page analytics. Backups and staging are missing. Rollback code exists but nothing calls it. `/api/health` exposes the Supabase host and model IDs. Frontend deploys are manual ZIPs while Railway deploys the API from main, so the two drift apart. CI tests run against the live database, and migrations are applied by hand.

## 8. Single points of failure

- The founder is the only approver for every gate, and there is no delegation model. This is acceptable for client #1 and should be recorded as a decision.
- `motherboard/MEMORY.md` (1.49MB, out of date order) is the only incident and decision memory agents read. `CODEBASE.md` was last updated 2026-08-18.
- OpenArt has no API. Spend, lineage and outputs for JURNL depend on manual ledgers.

## Minimum bulletproofing before client #1

WP01 (CI + migrations) · WP02/WP03 (permission engine, close the self-authorize paths) · WP04 (registry + demo isolation) · WP06 (event ledger) · WP09 (email that sends) · WP14 (error monitoring) · WP15 (server-held spend confirmation). The rest (gateway enforcement in CI, cost ledger DB, backups, staging, canon in CI) is GROUND_ZERO_FOUNDATION and POST_FIRST_CLIENT work. See `SITE00_POST_CLIENT_CAPABILITY_ROADMAP.json`.
