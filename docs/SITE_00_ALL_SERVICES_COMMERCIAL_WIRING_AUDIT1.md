# P0.SITE00.ALL-SERVICES-COMMERCIAL-WIRING-AUDIT1

Forensic audit of customer-facing monetizable services vs fulfillment pipelines. **No Stripe. No new packages. No pricing changes.**

Machine-readable inventory: `shared/site00-commercial-audit/serviceInventory.ts`  
Orphan scan: `shared/site00-commercial-audit/orphanDetection.ts`  
Matrix: `shared/site00-commercial-audit/wiringMatrix.ts`

---

## Executive summary

| Metric | Value |
|--------|------:|
| **SERVICE_COUNT** | 25 (see inventory module; 7 marketing categories each traced) |
| **FULLY_WIRED_COUNT** | 0 |
| **PARTIALLY_WIRED_COUNT** | 16 |
| **DISPLAY_ONLY_COUNT** | 6 |
| **ORPHANED_COUNT** | 1 (canonical EVOLVE commercial page unrouted) |
| **DUPLICATED_COUNT** | 2 (EVOLVE pricing UI vs commercial catalog; launch campaign naming overlap) |
| **PAYMENT_READY_COUNT** | 0 |
| **CUSTOM_QUOTE_COUNT** | 8 |
| **FOUNDER_DECISION_REQUIRED_COUNT** | 12+ (scope limits, deliverables, deposits, maintenance SKUs) |

**Stripe recommendation:** **NOT_READY** — no service meets full PAYMENT_READY checklist; marketing has best simulated path.

---

## Commercial source of truth (Part 3)

| Domain | Canonical source | Duplicate / conflicting |
|--------|-------------------|-------------------------|
| Managed EVOLVE SKUs | `shared/site00-evolve-commercial/catalog.ts` | **Yes:** `/evolve/plans` uses `shared/site00-evolve-pricing/catalog.ts` (different $ and plan IDs) |
| Marketing service categories | `shared/site00-marketing/serviceTaxonomy.ts` | Entitlements: `shared/site00-marketing-commercial/entitlementTemplates.ts` |
| Marketing dollars | None on public site | Add-ons: `FOUNDER_PRICING_REQUIRED` |
| IDNTY tiers | `src/site00/config/identity.ts` | Not linked to checkout or enforcement |
| BLDR scale | `bldr-classification.ts` / entry portals | Display FROM $ only |
| Public hub | `SITE00_SERVICES_SEED` (seed/mock) | Not production CMS |

**PACKAGE_SOURCE_OF_TRUTH:** **FAIL** globally (two EVOLVE price trees). **PASS** within each isolated catalog file.

---

## Journey breaks (representative)

### IDNTY (Part 5)

```
OFFER (display tiers) → CTA assessment → intake API → SUBMITTED
  ✗ no purchase / activation
  ✗ no automatic identity project
  ✗ tier limits not enforced
  ? manual admin conversion → project identity module
```

Identity does **not** auto-handoff to BLDR website projects.

### BLDR (Parts 6–7)

**SITE (simple scale):** intake → `site00_bldr_intakes` → project with `build_class: SITE` → `activate-project` (demo payment) → studio/design workspace. **Package limits (pages, revisions) not enforced in code.**

**WORLD / ENTERPRISE (custom):** same intake infra; design workspace + world recipes. **Commercial promise is discovery copy, not entitlement-backed.**

### Marketing (Part 8)

Best wired path:

```
/evolve/marketing/services → intake/:serviceId → brief → authorize → confirm-payment → provision
→ studio_world_campaign_id + commercial_state + engagement workspace
→ commercial-production-action / allowances (partial UI)
```

**Breaks:** Campaign Board handoff not complete; contextual casting entitlement UI missing; real Stripe; dollar quotes on service cards.

### EVOLVE recurring (Part 11)

Catalog + admin `setEvolveCommercialPlan` + project commercial summary. **`entitlements.ts` is informational — does not block production by asset/month counts.**

---

## ServiceFulfillmentContract (Part 4)

Contracts are **typed** in `shared/site00-commercial-audit/types.ts`. Populated examples live only where catalog already defines scope (EVOLVE Growth assetCapacity guideline). All BLDR/IDNTY/Simple limits marked **FOUNDER_DEFINITION_REQUIRED** in inventory.

---

## ServiceFulfillmentStatus (Part 18)

Use **`ServiceFulfillmentStatus`** enum in audit types. Today:

- Marketing engagements use **`MarketingEngagementStatus`** + `client_phase` (not the unified enum).
- BLDR projects use **`provisioning_state`** + studio phases.
- Payment **`payment_state`** must not be treated as fulfillment complete.

---

## Payment abstraction (Parts 20–21)

`shared/site00-commercial-audit/paymentAbstraction.ts` defines `PaymentProvider`, `CheckoutSession`, `PaymentRecord`, `SubscriptionRecord`, and `CommercialActivationEvent`. **No Stripe SDK in repo.** Current activations:

- Marketing: `confirmMarketingPayment` → `COMMERCIAL_ENTITLEMENT_ACTIVATED`
- BLDR: `activateClientProject` → `payment_state: CONFIRMED`

---

## Add-ons (Part 12)

| Add-on scope | Entry | Price | Purchase | Consumer |
|--------------|-------|-------|----------|----------|
| 16 Studio World types | Production UI (internal) | FOUNDER_PRICING_REQUIRED | Mostly none | `runProductionAction` (marketing only wired) |
| EXTRA_CHARACTER / NEW_ACTOR | Engagement API test | Simulated credit | `commercial-test-addon` | Resume casting |

---

## Orphan / mock detection (Parts 32–33)

See `detectCommercialOrphans()` — includes:

- Duplicate EVOLVE pricing truth (P0)
- EvolveCommercialPage unrouted (P1)
- EVOLVE entitlements non-enforcing (P1)
- No Stripe checkout (expected P2 for this sprint)

**MOCK_COMMERCIAL_SURFACES:** **PRESENT** — `SITE00_SERVICES_SEED`, portfolio/journal seeds, control billing placeholder, evolve-pricing CTAs without fulfillment.

---

## Browser QA (Part 34)

Public paths verified on cloud preview (2026-09-29):

| Route | CTA outcome |
|-------|-------------|
| `/services` | Links to `/idnty`, `/bldr`, `/evolve` — **PASS** |
| `/evolve/marketing` + `/services` | Service catalog loads; CTAs → intake routes — **PASS** |
| `/evolve/plans` | Plan cards → sign-in query or `/contact?offer=` — **PASS (display only)** |
| `/control/billing` | Placeholder modules — **FAIL (functional)** |

Signed-in intake → payment → engagement allowance requires founder account + DB migration on prod — **not certified in this audit run**.

---

## Gap classification (Part 36)

| Priority | Example |
|----------|---------|
| **P0** | Two EVOLVE pricing catalogs; zero PAYMENT_READY services |
| **P1** | IDNTY/BLDR display prices without purchase; EVOLVE plan capacity not enforced |
| **P2** | Client status hardcoded in seeds; notifications not unified |
| **P3** | Conversion copy on hub `#forms` anchors |

---

## Related docs

- `docs/studio-world/MARKETING-COMMERCIAL-PIPELINE-INTEGRATION1.md`
- `docs/SITE_00_EVOLVE_MARKETING.md`
- `shared/site00-marketing-commercial/auditConstants.ts`
