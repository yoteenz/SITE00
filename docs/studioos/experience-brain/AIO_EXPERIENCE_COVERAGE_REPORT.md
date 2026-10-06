# AIO — Experience coverage report

**Sprint:** P0.SITE00.WORKSPACE-EXPERIENCE-BRAIN.CANONICAL-SCHEMA-AIO-PROOF1 · **Project:** ALL IN ONE ENTERPRISES INC (first full proof) · **Source:** yoteenz/fsbw · all-in-one-enterprises/ @ fd8bf3c
_Generated from `shared/studioos-experience-brain` — do not edit by hand._

## Coverage

| Metric | Value |
|---|---|
| Total material features | 28 |
| Experience complete | 23 |
| Experience partial | 5 |
| Experience missing | 0 |
| Public coverage | 100% (not applicable: 6 internal / authenticated-only features) |
| Client coverage | 100% |
| Founder / staff coverage | 100% |
| System coverage | 100% |
| Visual archetype coverage | 100% |
| E2E contract coverage | 100% |

Experience completion is a separate axis from functional completion: a route, data model or readiness engine existing proves nothing about the experience. Functional % below comes from AIO's own family completion matrix and is shown only for contrast.

## Features

| Feature | Family | Archetype | Primary object | Earned | Authority | E2E | Functional % | Activation |
|---|---|---|---|---|---|---|---|---|
| AIO.ENTRY | F01 ENTRY | THRESHOLD / SHOWCASE | THE PATHWAY (start · road ready · run · get paid) | EXPERIENCE_COMPLETE | READY | READY | 55 | public live (demo persistence) |
| AIO.GET_STARTED | F02 GET STARTED | ROUTE / CONSULTATION | THE ROADMAP (items with reasons) | EXPERIENCE_COMPLETE | READY | READY | 55 | live (demo persistence) |
| AIO.BUSINESS_FORMATION | F03 START YOUR BUSINESS | ROUTE / CASE_FILE | THE BUSINESS ENTITY (name, type, status on the route) | EXPERIENCE_COMPLETE | READY | READY | 55 | formation ACTIVE (SERVICE_ACTIVATION_MATRIX) |
| AIO.ROAD_READY | F04 ROAD READY | CHECKLIST / ROUTE | THE ROAD READY PROFILE (setup progress vs items verified) | EXPERIENCE_COMPLETE | READY | READY | 64 | authorities ACTIVE · Road Ready profile live (demo persistence) |
| AIO.MY_OFFICE | F05 MY OFFICE | CONTROL_ROOM / QUEUE | THE NEXT ACTION | EXPERIENCE_COMPLETE | READY | READY | 68 | demo complete |
| AIO.SERVICES | F06 SERVICES | INDEX / QUEUE | THE REQUEST (service, customer-friendly state) | EXPERIENCE_COMPLETE | READY | READY | 57 | per service |
| AIO.AUTHORITIES | F06 SERVICES (get-road-ready) · F04 ROAD READY | CASE_FILE / CHECKLIST | THE AUTHORITY (USDOT / MC numbers and status) | EXPERIENCE_COMPLETE | READY | READY | 57 | authorities ACTIVE |
| AIO.BOC3 | F06 SERVICES (get-road-ready) | CASE_FILE / CHECKLIST | THE BOC-3 FILING | EXPERIENCE_DRAFTED | EXPERIENCE_REQUIRED | READY | 57 | boc3 PARTNER_PENDING — partner / manual workflow until provider is activated |
| AIO.IFTA_REGISTRATION | F06 SERVICES (get-road-ready) | CASE_FILE / CHECKLIST | THE IFTA ACCOUNT (license + decals) | EXPERIENCE_COMPLETE | READY | READY | 57 | ifta-reg LIMITED_PILOT |
| AIO.IFTA | F06 SERVICES (permits-taxes-compliance) · F04 ROAD READY item · F16 VAULT tax_fuel | PACKET_BUILDER / WORKBENCH / CHECKLIST | THE QUARTER (Q{n} {YYYY} — due date, packet completeness, seal when filed) | EXPERIENCE_COMPLETE | READY | READY | — | ifta-reg LIMITED_PILOT · ifta-filing PREPARING · fuel-tax INTERNAL_ONLY (staff manual filing) |
| AIO.PERMITTING | F06 SERVICES (permits-taxes-compliance) | CASE_FILE / CHECKLIST | THE PERMIT (jurisdiction, validity window) | EXPERIENCE_COMPLETE | READY | READY | 57 | permitting ACTIVE |
| AIO.TAGS_REGISTRATION | F06 SERVICES (get-road-ready) | CASE_FILE / CHECKLIST | THE UNIT REGISTRATION (truck, plate, jurisdictions) | EXPERIENCE_COMPLETE | READY | READY | 57 | tags ACTIVE |
| AIO.ROAD_TAX | F06 SERVICES (permits-taxes-compliance) | CASE_FILE / CHECKLIST | THE TAX PERIOD (units, amount, stamped proof) | EXPERIENCE_COMPLETE | READY | READY | 57 | road-tax INTERNAL_ONLY — staff workflow |
| AIO.COMPLIANCE_SAFETY | F06 SERVICES (safety-drivers) | CASE_FILE / CHECKLIST | THE SAFETY FILE (program + driver files) | EXPERIENCE_DRAFTED | EXPERIENCE_REQUIRED | READY | — | catalog-listed; activation per service (not in SERVICE_ACTIVATION_MATRIX) |
| AIO.RENEWALS | F04 ROAD READY · F06 SERVICES (renewals) | HORIZON / QUEUE | THE NEXT EXPIRATION (item, date, decision) | EXPERIENCE_COMPLETE | READY | READY | — | renewals in catalog (permits-taxes-compliance) |
| AIO.DISPATCH_OPERATIONS | F07 OPERATIONS | CONTROL_ROOM / DECISION_WINDOW / PIPELINE | THE LOAD (lane, rate, pickup / delivery, status) | EXPERIENCE_COMPLETE | READY | READY | 71 | dispatch ACTIVE — manual load entry supported without load board |
| AIO.LOAD_BOARD | F08 LOAD BOARD | MATCHING_BOARD / DECISION_WINDOW | THE OPPORTUNITY (lane, rate, fit) | EXPERIENCE_DRAFTED | EXPERIENCE_REQUIRED | READY | 68 | tied to brokerage — PAUSED (business activation required) |
| AIO.BROKERAGE | F09 BROKERAGE | PIPELINE / DECISION_WINDOW | THE SHIPMENT (lane, dates, status) | EXPERIENCE_DRAFTED | EXPERIENCE_REQUIRED | READY | 68 | brokerage PAUSED — BUSINESS ACTIVATION REQUIRED (not publicly enabled) |
| AIO.FINANCES | F10 FINANCES | LEDGER / DECISION_WINDOW | THE BALANCE (service fees due) | EXPERIENCE_COMPLETE | READY | READY | 55 | billing live in demo; payment provider abstraction |
| AIO.FACTORING | F11 FACTORING | PIPELINE / PACKET_BUILDER | THE INVOICE (load, amount, stage) | EXPERIENCE_COMPLETE | READY | READY | 68 | factoring PARTNER_PENDING — partner referral, not direct funding |
| AIO.INSURANCE | F12 INSURANCE | DECISION_WINDOW / DOCUMENT_TABLE | THE POLICY (coverage, carrier, term) | EXPERIENCE_COMPLETE | READY | READY | 65 | insurance PARTNER_PENDING — assistance / referral, no bind without licensing |
| AIO.BOOKKEEPING | F13 BOOKKEEPING | WORKBENCH / LEDGER | THE MONTH (period, close status) | EXPERIENCE_COMPLETE | READY | READY | 69 | bookkeeping in catalog (plans priced) |
| AIO.FLEETCARE | F14 FLEETCARE | ROUTE / CASE_FILE | THE TICKET (unit, issue, step) | EXPERIENCE_COMPLETE | READY | READY | 61 | demo store (provider route guard is a known gap) |
| AIO.DRIVERLINK | F15 DRIVERLINK | PIPELINE / MATCHING_BOARD | THE JOB (opening, matched verified drivers) | EXPERIENCE_DRAFTED | EXPERIENCE_REQUIRED | READY | 61 | demo store (driver route guard is a known gap) |
| AIO.VAULT | F16 VAULT | CABINET / ARCHIVE / DOCUMENT_TABLE | THE DOCUMENT (category, status, version) | EXPERIENCE_COMPLETE | READY | READY | 66 | live (demo + storage abstraction) |
| AIO.INBOX | F17 INBOX | QUEUE | THE THREAD (feature, needs-you, resolution) | EXPERIENCE_COMPLETE | READY | READY | 62 | live (provider abstraction) |
| AIO.ACCOUNT | F18 ACCOUNT | DOCUMENT_TABLE / CHECKLIST | THE ORGANISATION (members, roles) | EXPERIENCE_COMPLETE | READY | READY | 55 | live (Supabase auth partial) |
| AIO.OFFICE_OPERATIONS | AIO OFFICE role projection (office/*) across F05–F17 | CONTROL_ROOM / QUEUE | THE WORK ITEM (client, division, waitingOn, due) | EXPERIENCE_COMPLETE | READY | READY | — | live (OfficeRouteGuard; demo + office modules) |

## Service inventory (sprint §23)

- **PERMITTING** → `AIO.PERMITTING`
- **TAGS / REGISTRATION** → `AIO.TAGS_REGISTRATION`
- **IFTA / FUEL TAX** → `AIO.IFTA`
- **ROAD TAX / HIGHWAY TAX** → `AIO.ROAD_TAX`
- **AUTHORITIES** → `AIO.AUTHORITIES`
- **BOC-3** → `AIO.BOC3`
- **LLC / INC** → `AIO.BUSINESS_FORMATION`
- **ROAD READY** → `AIO.ROAD_READY`
- **BROKERAGE** → `AIO.BROKERAGE`
- **DISPATCH / OPERATIONS** → `AIO.DISPATCH_OPERATIONS`
- **LOAD BOARD** → `AIO.LOAD_BOARD`
- **INSURANCE** → `AIO.INSURANCE`
- **FACTORING** → `AIO.FACTORING`
- **BOOKKEEPING** → `AIO.BOOKKEEPING`
- **FLEETCARE** → `AIO.FLEETCARE`
- **DRIVERLINK** → `AIO.DRIVERLINK`
- **VAULT** → `AIO.VAULT`
- **INBOX** → `AIO.INBOX`
- **CLIENT ACCOUNT** → `AIO.ACCOUNT`
- **AIO OFFICE OPERATIONS** → `AIO.OFFICE_OPERATIONS`

## Material experience gaps (explicit)

### AIO.BOC3 — EXPERIENCE_DRAFTED
- open question: Process-agent partner is not activated (PARTNER_PENDING): partner turnaround, confirmation format and who files are unknown — the client / staff handoff moment cannot be authored precisely.

### AIO.COMPLIANCE_SAFETY — EXPERIENCE_DRAFTED
- open question: Bundles 8 catalog services (DOT compliance, DQ files, D&A consortium, Clearinghouse, ELD services, DOT audit, new-entrant audit, safety programs) with different lifecycles — split into one contract per service.
- open question: Activation state per service is not in SERVICE_ACTIVATION_MATRIX.

### AIO.LOAD_BOARD — EXPERIENCE_DRAFTED
- open question: Negotiation policy (counter rules, rate floors), carrier eligibility criteria and publication cadence are not in source.
- open question: Depends on brokerage business activation (PAUSED).

### AIO.BROKERAGE — EXPERIENCE_DRAFTED
- open question: Brokerage is PAUSED pending business activation (authority / bond / licensing) — the public experience cannot be finalised.
- open question: Shipper credit terms and quote validity rules are not in source.

### AIO.DRIVERLINK — EXPERIENCE_DRAFTED
- open question: Pricing model (who pays — company, driver, placement fee) is not in source.
- open question: The DRIVER projection needs its own client-side perspective (driver onboarding, credential upload, job applications); driver route guard is a known gap.

## Not applicable (public)

- AIO.MY_OFFICE — Authenticated home.
- AIO.LOAD_BOARD — Authenticated carrier surface; publicly described only inside Dispatch / Operations marketing.
- AIO.FINANCES — Pricing relationships are defined on each service’s public perspective.
- AIO.VAULT — Private document hub.
- AIO.INBOX — Private correspondence.
- AIO.OFFICE_OPERATIONS — Internal-only office.

## Screen-family gate

Features a generator may build screens for now: 23. Features that return EXPERIENCE_REQUIRED: AIO.BOC3, AIO.COMPLIANCE_SAFETY, AIO.LOAD_BOARD, AIO.BROKERAGE, AIO.DRIVERLINK.
