# CONTROL ROOM / CONTROL PLANE / SITES vs PROJECTS — forensic notes

Repo `/home/claude/site00` @ `2ac4059` (main). Static, read-only audit. Extends ground-zero evidence (auth_permissions, project_registry, firewall, cost_provider_models, navigation).

## 1. What the names mean today

- **CTRL ROOM** (`/control/*`): canon (`motherboard/CORE.md:134`) and `ctrl-room-nav.ts:2` call it the *customer account environment*. In practice it's a **command center**. The mobile copy asks "WHAT NEEDS MY ATTENTION?" and covers properties, projects, access and activity. Project signals deep-link into Studio.
- **CTRL ROOM** is also the name of the operator "ADMIN ATTENTION CENTER" at `/admin/site00/ctrl-room`, which lists blockers, approvals, leads, discovery and overdue invoices. That's a direct name collision. The page only appears in the legacy `SITE00_ADMIN_NAV`, so you can reach it by URL but not from the current shell nav.
- **CONTROL ROOM** shows up with the founder's intended meaning in just one place: the `/account` hub card, "ACCOUNT SETTINGS AND TEAM MANAGEMENT". It's also used as the name of a design-skin screen slot ("08 CONTROL ROOM") and in a "Founder Control Room" code comment on the EVOLVE ops card.
- **00 / CONTROL** (`/admin/site00/*`) is the internal operator environment. In founder terms it combines OPERATIONS, PROJECT MANAGEMENT and some INFRA management.
- **control plane** has one meaning in code: the P0.BRIDGE.1 *design* control plane. That covers the SITE 00↔FSBW repo change handoff (`site00_managed_projects`, `site00_repo_bindings`, `api/site00/design-control-plane.ts`), and its store defaults to memory. No umbrella "SITE 00 control plane" exists.

## 2. Surface classification (what each one actually is)

| Surface | Real data? | Should be |
|---|---|---|
| `/control` overview | Partial. Counts and sites come from the API. Plan comes from localStorage. Billing is empty. EVOLVE card is fixtures | CLIENT CONTROL ROOM. It currently also holds project management and founder ops |
| `/control/sites` | **Seed only.** Every user sees the same fake sites and team. MANAGE goes to an unrouted page | SITES (client) |
| `/control/{domains,billing,team,settings,security}` | Stubs | CLIENT CONTROL ROOM |
| `/control/evolve-operations` | Fixtures. Labeled "FOUNDER · INTERNAL ONLY" but gated only by sign-in | OPERATIONS. **Access defect** |
| `/account` | Placeholder links | CLIENT CONTROL ROOM hub |
| `/account/intakes` | Real | PROJECT MANAGEMENT (pre-project) |
| `/idnty/sign-in-security` | Read-only stub | CLIENT CONTROL ROOM |
| `/admin/site00/settings` | Static text. The automation route renders the same page | FOUNDER CONTROL ROOM (stub) |
| `/admin/site00/finance` | Demo-seeded invoices, no Stripe | OPERATIONS / founder commercial |
| `/admin/site00/team` | Built from the `ADMIN_EMAILS` env var (hardcoded fallback) | FOUNDER CONTROL ROOM / OPERATIONS |
| `/admin/site00/access-credentials` | Real | Control-plane management |
| `/admin/site00/evolve/connections`, org connections | Real (OAuth, AES secrets) | Control-plane management |
| `/admin/site00/sites` | Real table, but only the demo seed ever writes to it | OPERATIONS (labeled SYSTEMS/INFRA) |
| `/admin/site00/ctrl-room` | Real | OPERATIONS (misnamed) |
| OperatingWorldTopNav | — | Mixes account, project and operator links. STUDIO and APPROVALS are shown to clients and bounce them |

**Founder Control Room:** effectively absent as a coherent place. The founder has no personal profile or security page, no notification settings, no defaults, and no commercial admin (price book, codes, credits). Today these needs are scattered across operator pages or exist only as env vars.

**Client Control Room:** mostly stubs. The profile API (`api/profile.ts` GET/PATCH) has no UI. Password reset links to `/account/settings`, which doesn't exist. There's no 2FA, no billing (Stripe isn't wired) and no team invites (no membership model).

Rule violation: the `/control` overview puts project signals ("ENTER STUDIO") and founder EVOLVE operations into the client control room. Project management should move to PROJECTS/STUDIO. Founder ops should move to 00 / CONTROL.

## 3. Control plane inventory (summary)

- **Live:** auth (JWT), the `site00_projects` registry (fragmented), identities, the review engine, the approval engine (`site00_approval_requests` plus launch overrides), provider connections (EVOLVE) and orchestration (manifests/requirements, Supabase canonical).
- **Partial / code-only:**
  - Permissions: role can be spoofed from the request.
  - Firewall: UI side only.
  - PCI route graph: computed per run, not persisted.
  - Cost engine: Opus receipts are JSON *files*, guards live in docs and JSON from PR #1357, no DB ledger.
  - Design control plane: memory store.
  - Studio-world adapter: depends on env config.
- **Missing:** membership, funding, a general discount engine, persistent notifications (email isn't configured, and in-app notifications live in memory), and a post-launch lifecycle.

## 4. Discount / promotion

The only real mechanism is **Existing Location courtesy codes** (`shared/site00-existing-location/courtesy.ts`):

- The founder picks the code string. It's stored as a SHA-256 hash and compared timing-safe.
- Six discount types: PERCENT_100, FULL_CASE_COMP, FIXED_AMOUNT, DIAGNOSIS_ONLY, LABOR_ONLY, SPECIFIC_SERVICE.
- Eligibility can be restricted by email or client id. Codes have max redemptions, valid_from and expires_at.
- On redemption the code is marked used, an audit event is written, and a fully comped case becomes `COMPLIMENTARY_APPROVED`. Any non-zero total throws PAYMENT_REQUIRED.

Gaps in this mechanism:

- The service runs on **in-memory Maps**. The `site00_courtesy_codes` and `site00_courtesy_redemptions` tables exist but no code uses them, so codes and redemption counts are lost on restart.
- `eligible_services` is stored but never enforced.
- The founder can only create codes through a raw POST action. No admin page exists, even though a route constant is defined.

Other related pieces:

- The EVOLVE Foundation waiver is rule-based.
- EVOLVE plan entitlements set caps but have no metering.
- The monetization contract defines usage limits, but only structurally.
- Launch overrides waive requirements, not prices.
- "Credits" appear only as signals in the fixture-based ops intelligence. Nothing anywhere supports project credits or client-specific pricing.

**Recommendation:**
- Turn `courtesy.ts` into a project-agnostic **Commercial Adjustments engine in the control plane**. It would cover discount, comp/waiver, project credit ledger, price override and usage-limit override. It would scope by service, project or client, persist to Supabase with an append-only audit, and be enforced server-side at quote, checkout and entitlement time.
- Manage the policies, grants and history in the **Founder Control Room → Commercial** section, with in-context "apply to this project" actions in project management.
- Clients see only their own credits and redemptions in the Client Control Room.

## 5. Sites vs Projects

- `site00_sites` has `project_id` and `identity_id` foreign keys (ON DELETE SET NULL, so a site outlives its project), plus a free-text `status` and `domain`. It has no `live_url`, there's no domains table, and **the only code that writes to it is the demo seed**. Launch never creates or promotes a site.
- Public `/sites` reads an empty static seed. `/sites/:id` isn't routed. Signed-in users are redirected to `/control/sites`, which shows seed data.
- The project DB status has no LAUNCHED/LIVE/MAINTENANCE value (it's a CHECK constraint ending at PRODUCTION/ARCHIVED), and `PHASE_ORDER` ends at LAUNCH.
- The UI layer invents LAUNCHED/POST_LAUNCH (project index, by substring match) and LIVE/COMPLETE (client app). In the client app `liveDays` is hardcoded to 47, and the post-launch opportunity CTAs only record interest.
- Projects are never hard-deleted, so they persist after launch. But CTRL ROOM and admin team queries filter on `status='ACTIVE'`, so a project that moves to PRODUCTION or ARCHIVED vanishes from those views. In those surfaces, launched effectively looks like deleted.
- From a site, a signed-in client can't do anything real today: no open-live, info, return-to-project, maintenance, add-on, extension or EVOLVE entry.

Outputs: `control.json`, `sites_projects.json` (same dir).
