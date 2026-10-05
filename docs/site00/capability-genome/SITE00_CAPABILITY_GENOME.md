# SITE 00 — Capability Genome

Sprint: P0.SITE00.GROUND-ZERO-MATURE-CAPABILITY-GENOME-RECONCILIATION1. Audited against current main `6f63aaa` (`6f63aaaa439cc4c996a734e3cec5abbf586f2e61`). This is plan and canon only: 0 code changes, 0 database changes, 0 paid generations.

## What this is

This is a read of what SITE 00 **actually has** in code today, measured against the mature endpoint:

**IDEA → BUSINESS UNDERSTANDING → IDENTITY → OFFER → CUSTOMER JOURNEY → DIGITAL LOCATION/WORLD → PRODUCT SYSTEM → MARKETING SYSTEM → LIVE OPERATIONS → MEASUREMENT → MAINTENANCE → EVOLUTION**

Six read-only audit tracks read `src/`, `api/`, `server/`, `supabase/migrations/`, `scripts/`, `tests/`, `.github/workflows/`, `docs/` and `motherboard/` directly. Earlier Ground Zero reports were used only as leads. Every record carries file:line evidence, and every MISSING record lists the searches that came back empty.

The tracks produced 348 raw records. 58 of them were the same capability seen by two tracks and were merged, which leaves **290 canonical capabilities**. Of those, 262 are HIGH confidence and 28 MEDIUM.

## Counts

| Status | Count |
|---|---|
| EXISTS_CONNECTED | 38 |
| EXISTS_PARTIAL | 133 |
| EXISTS_DISCONNECTED | 23 |
| CONCEPT_ONLY | 16 |
| DUPLICATED_COMPETING | 35 |
| MISSING | 44 |
| DEPRECATED | 0 |
| SUPERSEDED | 1 |

| Disposition | Count |
|---|---|
| KEEP | 29 |
| CONNECT | 38 |
| EXPAND | 47 |
| MERGE | 59 |
| REPAIR | 45 |
| REBUILD | 1 |
| RECLASSIFY | 13 |
| DEPRECATE | 2 |
| ADD | 56 |

| Priority | Count |
|---|---|
| CLIENT_READY_BLOCKER | 31 |
| GROUND_ZERO_FOUNDATION | 53 |
| POST_FIRST_CLIENT_HIGH_PRIORITY | 115 |
| MATURE_PLATFORM | 71 |
| FUTURE_OPTIONAL | 20 |

Mean maturity is **2.28 / 5**. No capability rates 5, meaning none is production-grade, tested and monitored. 26 rate 4.

## The one-paragraph truth

SITE 00 has a real **production studio**: the workspace shell, the JURNL family expression pipeline, the asset factory, identity canon promotion, intake persistence and the launch readiness manifests. It also has a lot of **built-but-unwired** machinery:

- the reference-binding guard, which nothing outside tests calls;
- email templates that never send;
- courtesy codes kept in memory only;
- 41 tables that nothing references;
- analytics adapters that return empty.

What it does **not** have is the business pipeline around the studio:

- no payments (clients can mark themselves paid through three paths);
- no membership or invites;
- no send or return in the review loop;
- no LAUNCHED state, and no hosting for client sites;
- no analytics, no error monitoring and no SEO;
- CI red since 2026-09-28.

The gap is mostly **connection**, not invention. Of the 290 capabilities, 203 are promotions of existing code and 44 are truly missing.

## Ratings (0–5, mean maturity rounded)

| Domain | Rating | Mean | Caps | Missing/concept | Blockers |
|---|---|---|---|---|---|
| CRM | 2 | 2.12 | 8 | 2 | 1 |
| ANALYTICS | 2 | 1.62 | 8 | 2 | 1 |
| MARKETING | 2 | 2.33 | 12 | 1 | 0 |
| SEO | 1 | 0.62 | 8 | 6 | 0 |
| CONTENT | 2 | 2.12 | 8 | 2 | 0 |
| OPERATIONS | 2 | 2.36 | 25 | 3 | 5 |
| SECURITY | 2 | 1.81 | 16 | 6 | 9 |
| ACCESSIBILITY | 2 | 2.2 | 5 | 1 | 0 |
| PERFORMANCE | 3 | 3.0 | 4 | 0 | 0 |
| RELEASE_ENGINEERING | 2 | 2.5 | 6 | 1 | 1 |
| POST_LAUNCH | 2 | 1.5 | 4 | 3 | 2 |
| MAINTENANCE_EVOLVE | 2 | 1.5 | 6 | 3 | 0 |
| CANON_GOVERNANCE | 2 | 2.38 | 8 | 2 | 1 |
| COST | 2 | 1.89 | 9 | 3 | 0 |
| INCIDENT_LEARNING | 2 | 2.0 | 4 | 1 | 1 |
| DEPENDENCY_GRAPH | 2 | 2.29 | 7 | 2 | 0 |
| RISK_ENGINE | 3 | 3.0 | 5 | 1 | 1 |
| PIPELINE_ROUTER | 3 | 2.57 | 7 | 1 | 0 |
| BUSINESS_INTELLIGENCE | 3 | 2.82 | 11 | 1 | 0 |
| MARKET_INTELLIGENCE | 2 | 2.2 | 5 | 1 | 0 |
| OFFER_ARCHITECTURE | 2 | 2.22 | 9 | 1 | 0 |
| COMMERCIAL_CONTROLS | 2 | 1.94 | 17 | 6 | 1 |
| SALES_CONVERSION | 2 | 2.0 | 4 | 1 | 0 |
| CUSTOMER_JOURNEY | 2 | 2.5 | 8 | 1 | 2 |
| SUPPORT | 2 | 1.5 | 6 | 2 | 0 |
| MOVEMENT_LAYER | 3 | 2.8 | 10 | 0 | 0 |
| SITES | 2 | 2.17 | 6 | 0 | 2 |
| CONTROL_ROOM | 2 | 2.11 | 9 | 3 | 1 |
| CONTROL_PLANE | 2 | 2.0 | 3 | 1 | 1 |
| PROJECT_RUNTIME | 2 | 2.33 | 3 | 1 | 0 |
| PRODUCT_ARCHITECTURE | 3 | 3.11 | 9 | 1 | 0 |
| EXPRESSION_ARCHITECTURE | 3 | 3.12 | 8 | 0 | 0 |
| ASSET_PROVENANCE | 3 | 2.88 | 8 | 0 | 1 |
| DATA_MODEL | 3 | 2.67 | 3 | 0 | 0 |
| INTEGRATIONS | 3 | 2.88 | 8 | 0 | 1 |
| DEVICE_QA | 3 | 3.0 | 5 | 0 | 0 |
| EXPERIMENTATION | 2 | 1.67 | 3 | 1 | 0 |
| QUALITY_SCORING | 3 | 3.2 | 5 | 0 | 0 |

## Maturity by mature-endpoint stage

| Stage | Caps | Mean maturity | Verdict today |
|---|---|---|---|
| IDEA | 8 | 2.75 | MOSTLY THERE — entry, assessments and IDNTY/BLDR intake persistence work. EVOLVE and creative intakes are localStorage-only, there is no contact form, and lead/booking tables are only written by the demo seed. |
| BUSINESS_UNDERSTANDING | 9 | 2.33 | FRAGMENTED — there are six intake mechanisms and six or more profile stores, but no unified business profile, and no competitor research. |
| IDENTITY | 7 | 3.14 | PARTIAL — IDNTY 00–03 exists as config, and identity phase/canon promotion code exists. Founder-only; not wired to client review. |
| OFFER | 31 | 2.1 | NOT SELLABLE — no payments; clients can self-mark paid through three paths; pricing is duplicated and undecided (12 open founder decisions); courtesy codes are in memory only. |
| CUSTOMER_JOURNEY | 21 | 2.57 | BROKEN AT THE HANDOFF — the public journey and the movement layer work. Account → project room has three competing surfaces, no membership/invites, and role tamper. |
| DIGITAL_LOCATION_WORLD | 20 | 2.15 | CANNOT LAUNCH — runtimes render only inside site00.com in design-preview. There is no client hosting, domain, LAUNCHED state or site record at launch. |
| PRODUCT_SYSTEM | 35 | 2.66 | STRONGEST AREA, BUT A CLOSED LOOP WITH THE CLIENT IS MISSING — the workspace, the JURNL expression pipeline and the asset factory are real. The review loop has no send and no return, and the dispatch guards are not called by any API. |
| MARKETING_SYSTEM | 27 | 1.7 | FOUNDER-ONLY PROTOTYPE — the EVOLVE marketing OS works for five hard-coded orgs; publishing is off, analytics adapters return empty, and SEO is essentially absent. |
| LIVE_OPERATIONS | 42 | 2.21 | DEMO-CONTAMINATED — the operator console and approval queue work. There are 7+ registries, the demo seed writes to production reads, and there is no cost ledger table. |
| MEASUREMENT | 16 | 2.12 | ALMOST NONE — no page analytics, no error monitoring, 11 competing event tables, and no client-facing reports. |
| MAINTENANCE | 16 | 1.94 | FRAGILE — CI has been red since 2026-09-28; frontend deploys run through manual ZIPs; no staging, backups, or rollback wiring. |
| EVOLUTION | 3 | 2.67 | INTAKE ONLY — REFINE/INSTALL/TRANSFORM are page copy plus a localStorage assessment, with no delivery workflow. |
| PLATFORM_FOUNDATION | 55 | 2.36 | UNSAFE FOR EXTERNAL CLIENTS — no API auth layer, CORS open, RLS gaps, a public asset bucket, and guards that are honour-system or test-only. Canon is in docs only. |

## Shared root engines

Most of the remaining work hangs off a small set of engines. Build each one once:

| Engine | Members | Blockers | Member effort (d) | What it is |
|---|---|---|---|---|
| PERMISSION_ENGINE | 17 | 10 | 39.5 | One server-side authority: who is the caller (Supabase JWT), what role do they have on which project (membership), and which API policy applies. It replaces per-handler auth, role values sent in the request body, ADMIN_EMAILS fallbacks and the honour-system confirmation flags. |
| PROJECT_REGISTRY | 27 | 6 | 86.0 | One canonical project record (site00_projects plus a type and a link to its site00_sites row) that every surface resolves through. It replaces 7+ hard-coded registries, the five orgRegistry slugs and auto-seeded demo projects. |
| EVENT_LEDGER | 25 | 5 | 67.5 | One append-only project event stream (site00_project_events, created by a migration). Activity, review outcomes, notifications, analytics and audit are read from it as projections. It replaces 6 activity logs and 11 event/activity tables. |
| NOTIFICATION_BUS | 4 | 1 | 14.0 | Event ledger → (in-app notification, transactional email via a real provider, digest). It replaces the sendEmailAsync stub that never sends and the competing notification hooks. |
| ASSET_GRAPH | 17 | 3 | 58.0 | Project-scoped asset, reference and lineage graph (storage prefix per project, signed URLs, family/screen/page tree nodes, dependency and invalidation edges). It unifies 6 tree/dependency models and the JURNL dual root. |
| COST_LEDGER | 24 | 1 | 67.0 | One DB cost ledger plus a provider gateway: every paid call goes through a precheck (reference binding, budget, server-held founder confirmation) and writes a cost row. It replaces hand-kept JSON ledgers, /tmp receipts and about 57 files that call providers directly. |
| CANON_REGISTRY | 19 | 1 | 56.5 | Machine-readable canon (locked ontology, page tree, capability registry, design authority registry, decision status) that CI checks code against. Today it exists as docs that no code reads. |
| ROUTE_META_REGISTRY | 5 | 0 | 6.2 | Per-route metadata (title, canonical, robots, audience, guard) that SEO, guards and navigation read from. |

## Client-ready blockers (31)

| Capability | Status | Maturity | Effort (d) | Name |
|---|---|---|---|---|
| CAP.ANALYTICS.PROJECT_EVENTS_LEDGER | DUPLICATED_COMPETING | 2 | 3.0 | Project events ledger (site00_project_events) |
| CAP.ASSET.STORAGE_BUCKETS | EXISTS_PARTIAL | 3 | 2 | Storage buckets |
| CAP.COMMERCIAL.SIMULATED_ACTIVATION_PATHS | DUPLICATED_COMPETING | 3 | 2.0 | Simulated payment / commercial activation paths |
| CAP.CONTROL_PLANE.MIGRATION_MANAGEMENT | EXISTS_PARTIAL | 2 | 1 | Database migration management |
| CAP.CONTROL_ROOM.CLIENT_OVERVIEW | EXISTS_PARTIAL | 2 | 2 | Client CTRL ROOM overview |
| CAP.CRM.INTAKE_TO_PROJECT_CONVERSION | EXISTS_PARTIAL | 3 | 0.5 | Intake → project conversion |
| CAP.DECISION.COMMERCIAL_FOUNDER_DECISIONS | EXISTS_CONNECTED | 3 | 2.0 | Commercial founder decision register |
| CAP.INCIDENT.RUNTIME_ERROR_MONITORING | MISSING | 1 | 1.0 | Runtime error monitoring / alerting |
| CAP.INTEGRATION.EMAIL_PROVIDER | EXISTS_PARTIAL | 2 | 2.0 | Transactional email delivery |
| CAP.JOURNEY.CLIENT_ONBOARDING | EXISTS_PARTIAL | 2 | 1.5 | Client project onboarding and activation |
| CAP.JOURNEY.CLIENT_PROJECT_ROOM_SURFACE | DUPLICATED_COMPETING | 3 | 3 | Canonical client project room surface |
| CAP.LAUNCH.CLIENT_LAUNCH_FLOW | CONCEPT_ONLY | 1 | 3.0 | Client approval → launch flow |
| CAP.LAUNCH.CLIENT_SITE_HOSTING | MISSING | 1 | 3 | Client site build & hosting |
| CAP.OPS.CLIENT_REVIEW_ENGINE | EXISTS_PARTIAL | 3 | 1 | Client review engine (comment, annotate, approve, revise) |
| CAP.OPS.DELIVERABLE_HANDOFF_LIBRARY | MISSING | 1 | 4 | Deliverable handoff, library, and downloads |
| CAP.OPS.DEMO_SEED_ISOLATION | EXISTS_PARTIAL | 1 | 1.5 | Demo seed and fixture isolation from production |
| CAP.OPS.REVIEW_RETURN_LOOP | MISSING | 2 | 3.0 | Client decision return loop |
| CAP.OPS.SEND_TO_CLIENT_REVIEW | MISSING | 0 | 3 | Send to client review |
| CAP.PRIVACY.CLIENT_DATA_FIREWALL | EXISTS_PARTIAL | 3 | 1.5 | Client data isolation (internal field stripping) |
| CAP.PRIVACY.LEGAL_PAGES | MISSING | 1 | 1.5 | Privacy policy & terms pages |
| CAP.RELEASE.CI_HEALTH | EXISTS_PARTIAL | 2 | 2 | CI test health |
| CAP.RISK.SPEND_CONFIRMATION_GUARDS | EXISTS_PARTIAL | 3 | 3.0 | founderConfirmedSpend spend guards |
| CAP.SECURITY.ADMIN_GATING | EXISTS_PARTIAL | 3 | 1.5 | Founder/admin gating via ADMIN_EMAILS |
| CAP.SECURITY.API_AUTH_MIDDLEWARE | EXISTS_PARTIAL | 2 | 3 | API route auth policy / middleware |
| CAP.SECURITY.CLIENT_ROLE_ENFORCEMENT | EXISTS_PARTIAL | 2 | 0.5 | Server-derived client role (review permissions) |
| CAP.SECURITY.PROJECT_MEMBERSHIP_INVITES | MISSING | 1 | 5.0 | Project membership + invite acceptance |
| CAP.SECURITY.RLS_POLICIES | EXISTS_PARTIAL | 3 | 2.0 | Row Level Security coverage |
| CAP.SECURITY.SERVICE_ROLE_CLIENT | EXISTS_PARTIAL | 3 | 0.5 | Server Supabase admin client hardening |
| CAP.SECURITY.SUPABASE_AUTH_SESSION | EXISTS_PARTIAL | 3 | 4.0 | Supabase auth + session restore |
| CAP.SITES.CLIENT_SITES_VIEW | EXISTS_PARTIAL | 1 | 1 | Client MY SITES view |
| CAP.SITES.SITE_ENTITY | EXISTS_DISCONNECTED | 2 | 1 | Site entity (digital location record) |

Several capabilities were deliberately **not** made blockers: Stripe checkout (client #1 is invoiced manually), automated DNS, the messages thread, SEO, analytics, the marketing OS, EVOLVE delivery, the advanced commercial controls and the capability registry. Five records were downgraded and two upgraded during reconciliation and verification; each one's `reconciliation_note` explains why.

## Recalculated estimates

| Target | Engineer-days | FAST | EXPECTED | RISK |
|---|---|---|---|---|
| CLIENT_READY_MVP (genome) | 87.0 | 31 working days | 48 working days | 70 working days |
| CLIENT_READY_MVP (Ground Zero) | 82 (73.5 in the 34 listed blockers) | 23 | 36 | 52 |
| FULL SITE 00 (MVP + foundation + after client #1) | +357.5 after the MVP | 22 weeks | 33 weeks | 49 weeks |
| MATURE PLATFORM | +547.6 after the MVP | 31 weeks | 46 weeks | 68 weeks |

Critical path: WP01 → WP04 → WP05 → WP07 → WP08 → WP13b → WP17 (29.0 days).

Effort: 87.0 engineer-days vs 73.5 for the 34 Ground Zero blockers (82 including its non-blocking MVP items). Arithmetic: 73.5 − 9.5 connection credits (reusing the review engine, dependency engine, intake-invite tokens and provisioning) − 2 deferred (D13 messages) + 9.0 scope growth inside replaced items + 16 for new work packages (CI/migrations, commercial bypass, client hosting + launch, spend confirmation, founder decisions) = 87.0.

Critical path: 29.0 vs 21 days. Ground Zero ended at client HOME. The genome path runs to a LAUNCHED site and starts with CI and migrations, because no fix can ship safely while main is red.

Ground Zero's full plan was +105 days, 9/14/21 weeks. It covered only the page tree and the review loop. The genome also counts the business pipeline (offer, payments, CRM, marketing, SEO, analytics, release, maintenance, evolution).

## Capability registry

There is **no** platform capability registry. `src/site00/config/capability-registry.ts` holds a 14-entry catalog of installable EVOLVE/BLDR **offerings**, which is an offer list and not a platform registry. See `SITE00_CAPABILITY_REGISTRY_PROPOSAL.json` for the proposal: check this genome in as data and add a CI contract test.

## Files

See `README.md`.
