# JURNL MONETIZATION FOUNDATION

Sprint `P0.JURNL.MONETIZATION-FOUNDATION1` · stage **FOUNDATION** (structure only) · 2026-10-05

Nothing here launches subscriptions, sets prices, shows upgrade prompts, implements checkout, enables trials, referrals
or ads, or changes F01. It makes JURNL **capable** of FREE / PLUS / PRO / BUSINESS / ADD-ON entitlements later.

## Where it lives

| Piece | Path |
|-------|------|
| Project-agnostic monetization contract | `shared/site00-monetization/contract.ts` |
| Entitlement resolver (plan → entitlements → capabilities), client gate, inspection rows | `shared/site00-monetization/entitlements.ts` |
| Server authorization boundary + usage check | `shared/site00-monetization/serverAuthorization.ts` |
| Billing provider interface + honest unconfigured provider | `shared/site00-monetization/billingProvider.ts` |
| Commerce / affiliate / referral disclosure + verdict independence | `shared/site00-monetization/commerce.ts` |
| Analytics events (no financial data) + revenue attribution | `shared/site00-monetization/analytics.ts` |
| Family contract field (optional) | `shared/site00-product-families/familyProductionContract.ts` → `monetization?: FamilyMonetization` |
| JURNL plan registry | `src/projects/jurnl/data/monetization/plans.ts` |
| JURNL capability registry | `src/projects/jurnl/data/monetization/capabilities.ts` |
| JURNL add-ons · central pricing (TBD) · copy | `…/monetization/addOns.ts` · `pricing.ts` · `copy.ts` |
| JURNL product tree (16 families) | `…/monetization/productTree.ts` |
| Feature entitlements (DESIGN metadata) | `…/monetization/features.ts` |
| Draft 16-family entitlement map | `…/monetization/entitlementMap.ts` · [DRAFT_16_FAMILY_ENTITLEMENT_MAP.md](DRAFT_16_FAMILY_ENTITLEMENT_MAP.md) |
| Assembled JURNL contract | `…/monetization/contract.ts` |
| F01 family metadata (never monetized) | `…/monetization/familyMonetization.ts` → `JURNL_F01_CONTRACT.monetization` |
| Runtime entitlements (provider + hooks) | `src/projects/jurnl/runtime/monetization/JurnlEntitlements.tsx` |
| 8 component primitives | `src/projects/jurnl/runtime/monetization/JurnlMonetizationPrimitives.tsx` |
| DESIGN-readable registry | `src/projects/monetization.ts` (`projectMonetization`, `projectMonetizationInspection`) |
| Draft database schema (NOT applied) | [DRAFT_SCHEMA.sql](DRAFT_SCHEMA.sql) |
| Tests | `tests/jurnlMonetizationFoundation.test.tsx` |

## Model

```
PLAN (JURNL_FREE · JURNL_PLUS · JURNL_PRO · JURNL_BUSINESS)   + ADD-ONS (class JURNL_ADD_ON)
  → resolveEntitlements(contract, { source, subscription, addOns, trial, failure })
  → capabilities  (semantic: ADVANCED_FORECASTING, BUSINESS_PNL, AI_PLANNING_GUIDANCE …)
  → UI behaviour  (hasCapability / clientGate / JurnlEntitlementGate)       — presentation only
  → authorization (authorizeCapability on the trusted backend)              — paid data + compute
```

- **Plans are DRAFT**, billing `NOT_CONFIGURED`, trials disabled with **no length assumed**, all usage numbers `null` (TBD).
- **Inheritance is explicit**: PRO includes PLUS includes FREE. **BUSINESS is its own line** (includes FREE core,
  never PRO). `JURNL_ADD_ON` is an entitlement class, not a base plan.
- **Subscriptions attach to a billing account** (`INDIVIDUAL / HOUSEHOLD / FAMILY / BUSINESS` scope), not to a user
  record — household / family sharing can come later without re-keying ownership.
- **Safety floors** (never removed by plan, downgrade or failure): `CORE_ACCOUNT_SECURITY`,
  `CORE_PERSONAL_DATA_CONTROL` (export / delete your own data), `AI_EXPLAIN_BASIC` (Ask JURNL never degrades basic
  safety or explanation to force upgrades — plans control depth and compute).
- **Feature code never names plans.** Upgrade copy derives the plan name from the registry
  (`lowestPlanGranting(capability)`). Tests fail on plan-id literals or plan comparisons in runtime code.

## Failure states (fail closed, never crash)

`UNKNOWN_PLAN · OFFLINE_BILLING · ENTITLEMENT_LOAD_FAILURE · EXPIRED_ACCESS · PAYMENT_ISSUE · PROVIDER_UNAVAILABLE` →
the default plan + safety floors, no add-ons, `status: FALLBACK`. Corrupt input resolves to `ENTITLEMENT_LOAD_FAILURE`
instead of throwing. `PAST_DUE` currently falls back (grace policy undecided). The gate component **withholds** premium
content whenever state is unknown and shows "YOUR CORE JURNL FEATURES STILL WORK."

## Security

UI gating is client-side and **never authoritative** (`authoritative: false`). `authorizeCapability` (server) rejects any
entitlement not resolved with source `SERVER_VERIFIED` (401), unknown capabilities (403), disabled surfaces (403),
missing capability (402) and provider outages for paid capabilities (503). Every ADVANCED / BUSINESS / AI capability is
`SERVER_ENFORCED`. Metered limits whose numbers are TBD are denied rather than guessed.

## Billing boundary

`BillingProvider`: `createCheckoutSession · createPortalSession · getSubscription · changePlan · cancelPlan ·
resumePlan · getEntitlements · getBillingHistory`. The only implementation is `createUnconfiguredBillingProvider()`:
every mutation returns `BILLING_NOT_CONFIGURED`; reads truthfully return "no subscription". Provider ids reuse
`shared/site00-commercial-audit/paymentAbstraction.ts` (`PaymentProviderId`) — no Stripe SDK, no checkout.

## Pricing

One central config (`pricing.ts`), integer cents (SITE 00 convention), every value `null` / `TBD`: plan, monthly, annual,
currency, region, intro, promotion, effective date. Tests fail on any price string in JURNL code or the shared contract.

## Trust rules (product architecture, not UI claims)

| Rule | Encoding |
|------|----------|
| User financial data sale | `PROHIBITED` (literal type — the contract cannot say otherwise) |
| User financial data for ad targeting | `PROHIBITED` |
| Display ads / ad networks / ad slots | `PROHIBITED` (tests scan for ad SDKs / slots) |
| Personalized product functionality | `PERMITTED_SUBJECT_TO_CONSENT_AND_POLICY` |
| Verdict independence | Affordability / safe-to-spend / payoff verdicts never see compensation (`assertVerdictInputIndependent` rejects commission / affiliate / sponsor / payout fields) |
| Commerce order | `AFFORDABILITY_DECISION → USER_CHOSE_TO_SHOP → MERCHANT_OPTIONS` (`merchantOptionsAllowed`) |
| Disclosure | `EDITORIAL_RECOMMENDATION` vs `AFFILIATE_LINK` vs `SPONSORED_PLACEMENT`; affiliate + sponsored must disclose; editorial cannot carry compensation |
| Pay-to-rank | Prohibited: ranking uses editorial score only; sponsored placements are returned separately, never interleaved |
| Referrals (HYSA, cards, insurance, mortgage, refinancing, tax pros, bookkeepers, planners, estate, travel, merchants, cashback) | Contract exists; status `DISABLED`; regulated categories flagged for compliance review |
| Analytics | 12 events, allow-listed props, no financial keys or values, pseudonymous account refs |

## Upgrade grammar (future surfaces)

FACT → VALUE → ACTION, uppercase, no urgency, no interruption. `JurnlUpgradePanel` / `JurnlAddOnOffer` render **nothing**
in any family whose monetization metadata does not allow upgrade surfaces — F01 declares `upgradeSurfaceAllowed: false`
and families without metadata default to "not allowed".

## Database audit

| Existing model | What it is | Used? |
|----------------|-----------|-------|
| `shared/site00-evolve-commercial/` | SITE 00's own B2B service catalog (EVOLVE plans, cents, informational entitlements) | Not reused for JURNL (different product + domain); its conventions (integer cents, provider refs, SITE 00 owns commercial identity) are followed |
| `shared/site00-commercial-audit/paymentAbstraction.ts` | Type-only payment provider abstraction | **Reused** (`PaymentProviderId`) |
| `supabase/migrations/*astral_reader_accounts*` | Astral World per-account purchase flags | Not a general entitlement model |
| Consumer subscription / entitlement tables | **None exist** | — |

**No migration was added.** JURNL's end-user backend and database are unresolved (defect log D-17) and SITE 00's
Supabase is the studio's host database (shared with FSBW); creating JURNL customer billing tables there would decide
that architecture by accident. The target schema is drafted, non-destructive and RLS-ready in
[DRAFT_SCHEMA.sql](DRAFT_SCHEMA.sql) — to become a migration in JURNL's own database once chosen.

## F01 proof (no change)

- 42 / 42 F01 captures (14 screens × 393×852 / 834×1194 / 1440×900) **pixel-identical** to the pre-sprint baseline
  (capture noise floor measured at 0) → `artifacts/jurnl-monetization-foundation/F01_PIXEL_DIFF.json`.
- Viewport delivery QA **163 / 163** (74 / 74 interactions) after the change →
  `artifacts/jurnl-monetization-foundation/F01_VIEWPORT_REGRESSION_REPORT.json`.
- Tests: no F01 screen (design-preview or production mode) renders plan / upgrade / trial / price / billing UI; F01
  screens and components import nothing from monetization.

## Unresolved architecture questions (founder)

1. **JURNL backend + database + auth provider** — where entitlements are server-enforced (D-17).
2. **Billing rail for a mobile-first app** — App Store / Google Play in-app purchase vs web billing (Stripe / other).
   Digital subscriptions sold inside iOS / Android apps generally fall under store billing rules; this decides the
   provider set (the interface supports several; `PaymentProviderId` will need `APP_STORE` / `GOOGLE_PLAY`).
3. **Past-due grace** — today `PAST_DUE` falls back to free immediately.
4. **BUSINESS composition** — FREE core only (today) or also PLUS / PRO personal capabilities?
5. **Advanced trip planning** — TRAVEL add-on only, or also in PRO?
6. **Household / family** — seat model, shared vs personal data, who pays.
7. **Usage numbers + periods** for Ask JURNL tiers and metered analyses.
8. **Free linked-account limits** (aggregation cost) in MONEY.
9. **Downgrade** — hide vs read-only for premium outputs (records must stay exportable).
10. **Regulated referrals** — compliance review + disclosure text before any financial-service referral is enabled.
11. **Regional pricing / tax** and currency.
