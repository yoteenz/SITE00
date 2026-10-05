# SITE 00 — Digital Business Operating Model

Sprint: P0.SITE00.GROUND-ZERO-MATURE-CAPABILITY-GENOME-RECONCILIATION1 · main `6f63aaa`. This is a proposal. It describes how SITE 00 should operate at maturity, stage by stage, tied to what exists in code today. It does **not** redesign SITE 00: the layers, products, navigation and ontology are the locked ones.

## The model in one line

A client's **idea** enters through the PUBLIC LOCATION and becomes one **project** in one registry. That project is produced in the FOUNDER PRODUCTION WORKSPACE through guarded, cost-ledgered pipelines, and reviewed by an invited client in the CLIENT PROJECT ROOM. Approval makes it a **launched SITE**. From there it is measured, maintained and evolved, and each step writes an event that every surface reads.

## The five root engines that make this one machine

1. **PROJECT_REGISTRY:** every surface resolves the same project; a site is linked to its project.
2. **PERMISSION_ENGINE:** who you are and what you can do on which project, decided only on the server.
3. **EVENT_LEDGER:** every action is an event. Activity, notifications, reports and audit are views of it.
4. **COST_LEDGER + provider gateway:** every paid call is prechecked (reference binding, budget, server-held confirmation) and costed.
5. **CANON_REGISTRY:** ontology, page tree, decisions and capabilities as data, with CI enforcing them.

ASSET_GRAPH, NOTIFICATION_BUS and ROUTE_META_REGISTRY are built on top of these five.

## Roles

- **Founder.** Works in the PRODUCTION WORKSPACE (HUB / INBOX / DESIGN / EXPERIENCE / EXPRESSION / LIBRARY / ACTIVITY). Owns the account in the FOUNDER CONTROL ROOM. Keeps infrastructure in the CONTROL PLANE, never in the control room.
- **Client.** Works in the CLIENT PROJECT ROOM (HOME / PROJECT / REVIEWS / INBOX / LIBRARY). Owns their account in the CLIENT CONTROL ROOM. Sees MY SITES as launched locations, which are separate from projects.
- **Agents.** Operate under the canon registry and the provider gateway, and never call a provider directly.

## Stage by stage

### IDEA

- **Layer:** PUBLIC_LOCATION → PRODUCTS_*
- **Mature operating model:** ORIGIN entry, the IDNTY/BLDR/EVOLVE assessments, intake with guest tokens, and lead capture.
- **Today:** MOSTLY THERE — entry, assessments and IDNTY/BLDR intake persistence work. EVOLVE and creative intakes are localStorage-only, there is no contact form, and lead/booking tables are only written by the demo seed.
- **Mean maturity:** 2.75 / 5. Strongest existing: `CAP.BIZ.IDNTY_BLDR_INTAKE_PERSISTENCE` (4), `CAP.BIZ.WORLD_INTAKE_INVITE` (4), `CAP.JOURNEY.PATHWAY_ASSESSMENTS` (4), `CAP.JOURNEY.PUBLIC_ORIGIN_ENTRY` (3)
- **To reach the mature model:** Persist EVOLVE/creative intakes (today localStorage), add a contact form, and write real leads instead of seed-only rows.
- **Root engines:** PROJECT_REGISTRY, EVENT_LEDGER

### BUSINESS UNDERSTANDING

- **Layer:** FOUNDER_PRODUCTION_WORKSPACE
- **Mature operating model:** One business profile per client, assembled from intake, world intake, origin ingestion and brand context.
- **Today:** FRAGMENTED — there are six intake mechanisms and six or more profile stores, but no unified business profile, and no competitor research.
- **Mean maturity:** 2.33 / 5. Strongest existing: `CAP.BIZ.DISCOVERY_RECOMMENDATION` (3), `CAP.BIZ.ORIGIN_INGESTION_CLIENT_TRUTH` (3), `CAP.BIZ.PROJECT_INTELLIGENCE_MANIFEST` (3), `CAP.MKT_INTEL.AUDIENCE_PERSONA_CAPTURE` (3)
- **To reach the mature model:** Merge 6 intake mechanisms and 6+ profile stores into CAP.BIZ.UNIFIED_BUSINESS_PROFILE. Competitor research comes later.
- **Root engines:** PROJECT_REGISTRY

### IDENTITY

- **Layer:** PRODUCTS_IDNTY + FOUNDER_PRODUCTION_WORKSPACE
- **Mature operating model:** IDNTY 00–03 state, identity phase/judgment, canon promotion and versioning, brand lore.
- **Today:** PARTIAL — IDNTY 00–03 exists as config, and identity phase/canon promotion code exists. Founder-only; not wired to client review.
- **Mean maturity:** 3.14 / 5. Strongest existing: `CAP.PRODUCT.IDNTY_STATE_MODEL` (4), `CAP.BIZ.BRAND_CREATIVE_CONTEXT_PROFILE` (3), `CAP.BIZ.BRAND_LORE_PERSONALITY_CAPTURE` (3), `CAP.BIZ.IDENTITY_BRIEF_STRATEGY` (3)
- **To reach the mature model:** Wire identity outputs into client review (the same review loop as families).
- **Root engines:** CANON_REGISTRY, EVENT_LEDGER

### OFFER

- **Layer:** PUBLIC_LOCATION + FOUNDER_CONTROL_ROOM
- **Mature operating model:** Canonical service catalog → quote → agreement → payment/invoice → entitlement, with commercial controls (discounts, comps, credits, overrides) audited.
- **Today:** NOT SELLABLE — no payments; clients can self-mark paid through three paths; pricing is duplicated and undecided (12 open founder decisions); courtesy codes are in memory only.
- **Mean maturity:** 2.1 / 5. Strongest existing: `CAP.MARKETING.EVOLVE_PUBLIC_OFFER_PAGES` (4), `CAP.COMMERCIAL.COMP` (3), `CAP.COMMERCIAL.COURTESY_CODE_ENGINE` (3), `CAP.COMMERCIAL.DISCOUNT_FIXED` (3)
- **To reach the mature model:** Close the self-authorize paths now. Founder decides pricing (12 open decisions). One price source, not five or more hand copies. Stripe after client #1. Persist courtesy codes.
- **Root engines:** PERMISSION_ENGINE, CANON_REGISTRY, COST_LEDGER

### CUSTOMER JOURNEY

- **Layer:** MOVEMENT_LAYER + CLIENT_PROJECT_ROOM + CLIENT_CONTROL_ROOM
- **Mature operating model:** Account → invited membership → one canonical client room (HOME / PROJECT / REVIEWS / INBOX / LIBRARY). The movement layer carries the client between locations.
- **Today:** BROKEN AT THE HANDOFF — the public journey and the movement layer work. Account → project room has three competing surfaces, no membership/invites, and role tamper.
- **Mean maturity:** 2.57 / 5. Strongest existing: `CAP.MOVEMENT.WORLD_TRANSITIONS` (4), `CAP.CRM.INTAKE_TO_PROJECT_CONVERSION` (3), `CAP.CRM.LEAD_PIPELINE_ADMIN` (3), `CAP.CRM.NOTES_HISTORY` (3)
- **To reach the mature model:** Membership/invites, a server-derived role, and merging the 3 client surfaces. FAST TRAVEL becomes role-aware.
- **Root engines:** PERMISSION_ENGINE, PROJECT_REGISTRY

### DIGITAL LOCATION WORLD

- **Layer:** CLIENT_SITES + PROJECT_RUNTIME_LAYER
- **Mature operating model:** Each approved project becomes a SITE record with a runtime, a host, a domain and a LAUNCHED state. LAUNCHED ≠ DELETED.
- **Today:** CANNOT LAUNCH — runtimes render only inside site00.com in design-preview. There is no client hosting, domain, LAUNCHED state or site record at launch.
- **Mean maturity:** 2.15 / 5. Strongest existing: `CAP.PRODUCT.BLDR_CLASS_MODEL` (4), `CAP.PRODUCT.JURNL_FAMILY_RUNTIME` (4), `CAP.RUNTIME.PROJECT_RUNTIME_REGISTRY` (4), `CAP.SITES.SITE00_RELEASE_ENGINE` (4)
- **To reach the mature model:** A LAUNCHED state, a site record written at launch, one client hosting path (manual MVP), then automated deploys and domains.
- **Root engines:** PROJECT_REGISTRY, EVENT_LEDGER

### PRODUCT SYSTEM

- **Layer:** FOUNDER_PRODUCTION_WORKSPACE + STUDIO_OS
- **Mature operating model:** HUB / INBOX / DESIGN / EXPERIENCE / EXPRESSION / LIBRARY / ACTIVITY produce families through a guarded provider gateway. Review goes out to the client and decisions come back as events.
- **Today:** STRONGEST AREA, BUT A CLOSED LOOP WITH THE CLIENT IS MISSING — the workspace, the JURNL expression pipeline and the asset factory are real. The review loop has no send and no return, and the dispatch guards are not called by any API.
- **Mean maturity:** 2.66 / 5. Strongest existing: `CAP.ASSET.ASSTS_ASSET_FACTORY` (4), `CAP.EXPRESSION.FAMILY_PRODUCTION_CONTRACT` (4), `CAP.ASSET.ASTRAL_WORLD_ASSETS` (3), `CAP.ASSET.CREATIVE_LINEAGE` (3)
- **To reach the mature model:** Send-to-client, return loop, project-scope HUB/INBOX/LIBRARY/ACTIVITY (today they resolve to ndxbook), a provider gateway that calls the reference-binding guard, and one asset graph.
- **Root engines:** EVENT_LEDGER, ASSET_GRAPH, COST_LEDGER

### MARKETING SYSTEM

- **Layer:** PRODUCTS_EVOLVE + FOUNDER_PRODUCTION_WORKSPACE
- **Mature operating model:** EVOLVE marketing OS per client org, content, distribution and SEO; SITE 00 markets itself with the same machine.
- **Today:** FOUNDER-ONLY PROTOTYPE — the EVOLVE marketing OS works for five hard-coded orgs; publishing is off, analytics adapters return empty, and SEO is essentially absent.
- **Mean maturity:** 1.7 / 5. Strongest existing: `CAP.MARKETING.CLIENT_MARKETING_ENGAGEMENTS` (4), `CAP.CONTENT.CAMPAIGN_PACKAGE_STORE` (3), `CAP.CONTENT.CONTENT_OPERATIONS_LIBRARY` (3), `CAP.CONTENT.COPYWRITING_BRAND_VOICE` (3)
- **To reach the mature model:** Registry-driven orgs (today 5 hard-coded slugs), an SEO baseline (robots, sitemap, per-route meta), and publishing after the fence review.
- **Root engines:** PROJECT_REGISTRY, ROUTE_META_REGISTRY

### LIVE OPERATIONS

- **Layer:** FOUNDER_CONTROL_ROOM + SHARED_PLATFORM_SERVICE
- **Mature operating model:** The founder runs the studio from one registry with a demo-free database, a real cost ledger and real notifications.
- **Today:** DEMO-CONTAMINATED — the operator console and approval queue work. There are 7+ registries, the demo seed writes to production reads, and there is no cost ledger table.
- **Mean maturity:** 2.21 / 5. Strongest existing: `CAP.CONTROL_ROOM.ACCESS_CREDENTIALS` (4), `CAP.INTEGRATION.RAILWAY_API_HOST` (4), `CAP.INTEGRATION.SUPABASE` (4), `CAP.OPS.LAUNCH_READINESS_MANIFEST` (4)
- **To reach the mature model:** Isolate demo seeds, add a DB cost ledger, make email actually send, and merge 7+ registries.
- **Root engines:** PROJECT_REGISTRY, COST_LEDGER, NOTIFICATION_BUS

### MEASUREMENT

- **Layer:** SHARED_PLATFORM_SERVICE → FOUNDER_CONTROL_ROOM / CLIENT_CONTROL_ROOM
- **Mature operating model:** Event ledger projections → founder KPIs and client reports. Page analytics on SITE 00 and client sites. Quality scores from real QA runs.
- **Today:** ALMOST NONE — no page analytics, no error monitoring, 11 competing event tables, and no client-facing reports.
- **Mean maturity:** 2.12 / 5. Strongest existing: `CAP.QUALITY.FAMILY_IMPLEMENTATION_GATE` (4), `CAP.ANALYTICS.FOUNDER_PIPELINE_REPORTS` (3), `CAP.EXPERIMENT.METHODOLOGY_VALIDATION_RUNS` (3), `CAP.QUALITY.FOUNDER_JUDGMENT_CAPTURE` (3)
- **To reach the mature model:** Error monitoring now. Page analytics and ledger projections after client #1. Client reports at the mature stage.
- **Root engines:** EVENT_LEDGER

### MAINTENANCE

- **Layer:** CONTROL_PLANE + FOUNDER_CONTROL_ROOM
- **Mature operating model:** Green CI, migrations applied by the pipeline, staging, rollback, backups, incident records, and client change requests that re-enter production.
- **Today:** FRAGILE — CI has been red since 2026-09-28; frontend deploys run through manual ZIPs; no staging, backups, or rollback wiring.
- **Mean maturity:** 1.94 / 5. Strongest existing: `CAP.RELEASE.PRODUCTION_PIPELINE` (4), `CAP.RELEASE.RELEASE_MANIFEST` (4), `CAP.INCIDENT.REGRESSION_GUARD_TESTS` (3), `CAP.POSTLAUNCH.HEALTH_ENDPOINTS` (3)
- **To reach the mature model:** Fix CI and migration drift now. Staging, backups and rollback wiring after client #1.
- **Root engines:** CANON_REGISTRY, EVENT_LEDGER

### EVOLUTION

- **Layer:** PRODUCTS_EVOLVE
- **Mature operating model:** REFINE / INSTALL / TRANSFORM delivered as real workflows, triggered by measurement and change requests.
- **Today:** INTAKE ONLY — REFINE/INSTALL/TRANSFORM are page copy plus a localStorage assessment, with no delivery workflow.
- **Mean maturity:** 2.67 / 5. Strongest existing: `CAP.EVOLUTION.EXTERNAL_RECONCILIATION` (3), `CAP.PRODUCT.EVOLVE_PATHS` (3), `CAP.EVOLVE.OPERATIONS_INTELLIGENCE` (2)
- **To reach the mature model:** Today these are intake only. Build delivery after the measurement loop exists.
- **Root engines:** EVENT_LEDGER, PROJECT_REGISTRY

### PLATFORM FOUNDATION

- **Layer:** SHARED_PLATFORM_SERVICE + CONTROL_PLANE
- **Mature operating model:** One permission engine, RLS everywhere, a provider gateway, canon in data checked by CI, and per-project secrets.
- **Today:** UNSAFE FOR EXTERNAL CLIENTS — no API auth layer, CORS open, RLS gaps, a public asset bucket, and guards that are honour-system or test-only. Canon is in docs only.
- **Mean maturity:** 2.36 / 5. Strongest existing: `CAP.CANON.JURNL_FAMILY_CONTRACTS` (4), `CAP.DEVICE_QA.PRODUCTION_ROUTE_SMOKE` (4), `CAP.PERF.ROUTE_CODE_SPLITTING` (4), `CAP.RISK.OPUS_NATIVE_COST_CEILING` (4)
- **To reach the mature model:** API auth layer, CORS, RLS gaps, the public bucket, guards wired into the gateway, canon as data.
- **Root engines:** PERMISSION_ENGINE, COST_LEDGER, CANON_REGISTRY

## What does not change

The design language, the IDNTY/BLDR/EVOLVE product ontology, the client and production navigation, the movement layer (ENTER 00, WAITING ROOM = MENU, LOCATIONS, FAST TRAVEL, SWIPE-UP, EXIT 00), and the JURNL family expression system as it exists on main.
