# SITE 00 — EVOLVE / Marketing & Content

**Repository:** SITE 00 only  
**Studio World integration status:** `BLOCKED_PENDING_CONTRACT` (mock adapter active)  
**Last updated:** 2026-08-20

---

## Service architecture

Marketing & Content is a **complementary EVOLVE capability** — not a fourth property-evolution path. It sits alongside:

| Capability | Purpose |
|------------|---------|
| REFINE | Improve what exists |
| INSTALL | Add capability |
| TRANSFORM | Reimagine the property |
| **MARKETING & CONTENT** | Keep the brand moving after the property exists |

**Service categories** (configurable, no invented pricing):

- Social Content
- Campaign
- Product Campaign
- Brand Film
- UGC-Style Content
- Launch Campaign
- Content System

Config: `shared/site00-marketing/serviceTaxonomy.ts`

---

## Client journey

```
DISCOVER (/evolve/marketing)
  → SELECT SERVICE (/evolve/marketing/services)
  → INTAKE (/evolve/marketing/intake/:serviceId)
  → BRIEF SUMMARY (/evolve/marketing/brief/:engagementId)
  → AUTHORIZE / PAY (server-side payment_state)
  → PROVISION (Studio World adapter)
  → STUDIO WORKSPACE (/evolve/marketing/engagement/:engagementId)
  → REVIEW / APPROVE / REVISION
  → DELIVERABLES → VAULT handoff (future)
  → REPEAT CAMPAIGN
```

---

## Engagement lifecycle states

`DRAFT` → `INTAKE_COMPLETE` → `SCOPE_REVIEW` → `QUOTE_READY` → `AWAITING_AUTHORIZATION` → `AUTHORIZED` → `PAYMENT_PENDING` → `PAID` → `PROVISIONING` → `ACTIVE` → `CLIENT_ACTION_REQUIRED` → `REVIEW_READY` → `REVISION_IN_PROGRESS` → `DELIVERABLE_READY` → `COMPLETE`

Provisioning failure: `PROVISIONING_RETRY_REQUIRED` (payment not re-charged)

Types: `shared/site00-marketing/types.ts`

---

## Database

Migration: `supabase/migrations/20260820140000_site00_marketing_engagements.sql`

| Table | Purpose |
|-------|---------|
| `site00_marketing_engagements` | Primary engagement record |
| `site00_marketing_engagement_events` | Audit trail |
| `site00_external_production_links` | SITE 00 ↔ Studio World mapping |

---

## Payment gate

- Reuses SITE 00 `payment_state` pattern (`PENDING` → `CONFIRMED`)
- **No Stripe in repo yet** — `confirmMarketingPayment()` is server-side authoritative action (demo/admin until Stripe webhook wired)
- Provisioning blocked until `payment_state === 'CONFIRMED'`
- Client brief page does NOT provision on UI alone — calls server chain: authorize → confirm-payment → provision

---

## Studio World adapter

**Contract file:** NOT FOUND in this repository.

| Component | Path |
|-----------|------|
| Interface | `api/_lib/studioWorld/adapter.ts` |
| Conceptual types | `api/_lib/studioWorld/types.ts` |
| Mock adapter | `api/_lib/studioWorld/mockAdapter.ts` |
| Factory | `api/_lib/studioWorld/client.ts` |

**Environment:**

- `STUDIO_WORLD_ADAPTER=mock` (default) — development mock
- `STUDIO_WORLD_ADAPTER=live` — falls back to mock until real contract supplied

**Status classification:** `MOCKED` / `BLOCKED_PENDING_CONTRACT`

Credentials never exposed to browser. All calls server-side via `api/site00/marketing-engagements.ts` and `api/admin/site00-marketing.ts`.

---

## Idempotency

- Stable `externalEngagementId` = engagement UUID
- `provisionMarketingEngagement()` checks existing `studio_world_campaign_id` before creating
- Mock adapter returns `ALREADY_EXISTS` on duplicate provision requests
- Payment webhook retries safe — no duplicate charge path in SITE 00 layer

---

## Client-safe production status

Phases (`shared/site00-marketing/clientPhases.ts`):

01 DIRECTION → 02 PREPRODUCTION → 03 PRODUCTION → 04 INTERNAL REVIEW → 05 YOUR REVIEW → 06 FINALIZATION → 07 DELIVERED

Internal generation steps, model names, prompts, and QC are **not** exposed.

---

## Admin

| Route | Purpose |
|-------|---------|
| `/admin/site00/marketing-engagements` | Engagement list |
| `/admin/site00/marketing-engagements/:id` | Detail + provision/sync |
| `/admin/site00/debug/evolve-marketing` | Debug route index |

---

## Email events (wired definitions, not yet sending)

Added to `shared/site00-email/registry/events.ts`:

- `MARKETING_INTAKE_RECEIVED`
- `MARKETING_PAYMENT_CONFIRMED`
- `MARKETING_PRODUCTION_STARTED`
- `MARKETING_CLIENT_ACTION_REQUIRED`
- `MARKETING_REVIEW_READY`
- `MARKETING_DELIVERABLE_READY`
- `MARKETING_CAMPAIGN_COMPLETE`

Reuses existing approved email archetypes where mapped.

---

## Debug / mock mode

Mock scenarios via `MockStudioWorldAdapter.setMockScenario()`:

- `production`, `action-required`, `review-ready`, `deliverable-ready`, `complete`, `error`

---

## Required from Studio World repository

1. `STUDIO_WORLD_EXTERNAL_INTEGRATION_CONTRACT.md` or OpenAPI/JSON Schema
2. Authentication method (service credentials)
3. Provisioning endpoint + payload schema
4. Client-safe status/review/deliverable contract
5. Webhook or polling spec for sync

---

## Known limitations (this sprint)

- No live Studio World connection
- No Stripe checkout — payment confirm is server action
- Vault handoff metadata only — full ASSTS ingestion deferred
- Identity reuse detection basic (identity_id link)
- No subscription/recurring billing
