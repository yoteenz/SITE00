# Existing system forensic map

**Audited at:** `392ac76d5`, the integration branch `cursor/idnty-founder-readiness-e2e-be3b` including persistence fix #1657.
**Method:** read-only source trace with file and line references. Nothing was executed against staging.
**Paths:** relative to the repository root.

## 1. Headline findings

1. **No founder workspace exists for Digital Foundation.** The founder surface is seven separate pages:
   - Only the Readiness Desk uses the admin shell.
   - No admin navigation item points to any of them; they are reachable only by URL or by links between the pages.
   - The `/admin/site00` dashboard has no Digital Foundation data.
2. **The Readiness Desk is the only working operational surface.** It holds synthetic-client creation, the test journey, the email timeline, gated test sends and staging diagnostics.
3. **Founder pages P13, P14 and P15 have no designed UI.**
   - Pipeline is a bare table.
   - Project command and Workbench print raw JSON.
   - `SITE00_DIGITAL_FOUNDATION_EXPERIENCE_AUTHORITY_BLUEPRINT_V1.md:22-25` already records this.
4. **About 22 admin API actions have no UI:**
   - quote: update-quote, manual-adjustment, quote-commercial-ready
   - approvals: approval-request, approval-resolve
   - client actions: client-action
   - stages and runbook: update-stage, generate-runbook, activate-runbook, set-providers
   - tasks: start-task, complete-task, verify-task, escalate-task, set-blocker
   - messages: messages, send-message
   - other: completion-gate, email-timeline, create-lead, create-artifact-for-lead, materialize-fixture
5. **Three fonts compete.**
   - Admin shell: **Martian Mono** (`src/site00/styles/tokens.css:33-44`).
   - Correspondence Studio: **Saira Semi Condensed + Barlow Condensed** (`site00-correspondence-studio.css:6-66`).
   - Digital Foundation client: **SITE 00 Display + Saira Semi Condensed** (`site00-df-client.css:22-23`; faces in `site00-correspondence-fonts.css`).

   The founder's rule ("the two current IDNTY intake fonts") means the workspace **drops Martian Mono and Barlow** inside the founder workspace.
6. **Generic defaults ship today:**
   - `window.prompt` used to copy links
   - native inputs and checkboxes with no styling
   - unconfirmed destructive actions (reset test data, revoke, archive)
   - JSON `<pre>` dumps
   - a bell with no handler
   - a static "ONLINE" indicator
   - no account menu and no sign-out in the shell

## 2. Routes (all under `AdminGuard` → `AdminSuspense`)

Mounting: `src/App.tsx:22-25`, `/admin` → `AdminGuard` (`src/components/AdminGuard.tsx`). There is a **preview bypass**: `TEMPORARY_SITE00_ADMIN_BYPASS_ON_PREVIEW = true` (`:10`, `:20-26`). Routes are defined in `src/routes/Site00AdminRoutes.tsx`.

### 2.1 Digital Foundation founder routes (7)

| # | Path | Constant (`src/site00/config/routes.ts`) | Page | Shell | Route line |
| --- | --- | --- | --- | --- | --- |
| R1 | `/admin/site00/foundation` | `digitalFoundationAdmin` :50 | `FoundationAdminListPage` | No | 647-654 |
| R2 | `/admin/site00/foundation/:id` | `digitalFoundationAdminDetail` :51 | `FoundationAdminDetailPage` | No | 655-662 |
| R3 | `/admin/site00/foundation/pipeline` | `digitalFoundationPipeline` :52 | `FoundationPipelinePage` | No | 607-614 |
| R4 | `/admin/site00/foundation/:id/command` | `digitalFoundationProjectCommand` :53 | `FoundationProjectCommandPage` | No | 631-638 |
| R5 | `/admin/site00/foundation/:id/workbench` | `digitalFoundationWorkbench` :54 | `FoundationWorkbenchPage` | No | 639-646 |
| R6 | `/admin/site00/foundation/communications` | `digitalFoundationCommunications` :55 | `CommunicationsCommandPage` | No | 615-622 |
| R7 | `/admin/site00/foundation-readiness` | `digitalFoundationReadiness` :56 | `FoundationReadinessPage` | **Yes** | 623-630 (`lazyWithChunkRecovery`) |

R7 is also the auth-email return path (`src/utils/auth/site00AuthRedirect.ts:8-17`). **Preserve it.**

### 2.2 Adjacent admin routes (preserved, outside the DF workspace)

| Group | Paths | Note |
| --- | --- | --- |
| Correspondence Studio | `/admin/site00/correspondence-studio[/:project[/:campaign[/:email]]]` (`admin/config/routes.ts:47-52`; `Site00AdminRoutes.tsx:359-390`) | Own chrome; template, campaign and pack review; **cannot send**; reviews stored in localStorage |
| Intakes | `/admin/site00/intakes`, `/intakes/:type/:id`, `/client-intakes`, `/bldr-intakes`, `/bldr-intakes/:id` | Identity, Builder and World intakes. **Not Digital Foundation.** |
| Admin dashboard | `/admin/site00` (`DashboardPage`, "00 / CONTROL") | Production control; no DF data |
| Email debug | `/admin/site00/debug/email-pack` | Linked from R6 |
| Unrouted constants | `invitationAdmin` (`/admin/site00/invitation`, :57), `existingLocationAdmin` (:43) | The invitation API exists with no UI |
| Public client (context) | `/foundation/review`, `/foundation/:token`, `/invite/:code` | Not admin |

## 3. Page-by-page capability inventory

### R7 · `FoundationReadinessPage.tsx` (468 lines): the Readiness Desk

| Capability | Source | Notes |
| --- | --- | --- |
| Header: "[ DIGITAL FOUNDATION · STAGING READINESS ]" and the subtitle "Synthetic clients only · allowlisted email · staging Supabase · no production deploy" | :104-106 | Mixed case today |
| Overall status line: Overall · Synthetic intake · Email/payment E2E (always "Not authorized (by design)") · Founder session · Email send | :108-133 | — |
| Links: All foundation artifacts, Correspondence Studio | :135-136 | — |
| Staging stack: Frontend, API, Supabase ref (isolated?), Persistence (Supabase / in-memory), Email sending, Stripe key mode, Public link origin, External E2E (always "Not passed") | :146-203 | — |
| Database security probe: project ref, anon read result, persistence-exposure safe, notes | :205-222 | — |
| Readiness report: Ready / Action required / Blocked / Unverified columns | :224-259 | — |
| Technical configuration `<details>`: env group table (Status / Setting / Purpose / State / Note) | :261-279 | Names only, never values |
| Legacy env presence list `<details>` | :281-290 | Diagnostic |
| Build meta: API build commit and package marker | :292-294 | — |
| Create test client: native email input "Test recipient (must be on API allowlist)", Display name (default "Founder E2E Client"), "Create test client" | :301-322 | → `create-test-client` |
| Client journey: State / Intake / Payment / Surface, "Open client link" (new tab, masked) | :326-336 | → `test-journey` |
| Journey actions: "Submit intake (test)", "Quote ready + queue email", "Reset test data (memory store)" | :337-362 | Reset has **no confirmation** |
| Email events table: Status / Template / Trigger / Provider ID | :363-441 | → `email-timeline` |
| Invitation flow: "Prepare test invitation", checkbox "Founder approves Resend send", "Send test invitation" (disabled until ticked) | :381-421 | → `prepare-test-invitation`, `dispatch-test-email` |
| "Send lifecycle email (approved)" for other queued intents | :423-435 | Sends `founder_approved_send=true` **without a checkbox gate** (inconsistent gating) |
| Invitation preview (no send): Subject, To (masked), From, Link valid, Uses configured origin, Ready to send, blockers | :442-462 | — |
| States: error `role=alert` ("Could not load readiness report", "Action failed", "Reset failed", "Prepare failed"); "Loading…" | :140-144, :201, :297 | No empty or success states |

### R1 · `FoundationAdminListPage.tsx` (93 lines): "Founder mini console"

- **"Create lead + link":**
  - Uses a **hardcoded** `contact_email: 'prospect@example.com'` and `referral_kind: 'DIRECT'` (:30-48).
  - Then shows **`window.prompt('Copy client intake link:', …)`** (:41).
- **Table:** State / Payment / Created / Links. The links are "Client intake" (new tab `/foundation/:token?step=intake`) and "Founder" (detail) (:65-90).
- **Cloud preview bootstrap:** when the list is empty it fetches `/api/dev/site00-digital-foundation-preview-bootstrap` (:15-24).
- **States:** bare `<p>` error only; no loading or empty state.
- **Styling:** `.site00-admin-page` has **no CSS rule**.

### R2 · `FoundationAdminDetailPage.tsx` (110 lines)

- **Links:** ← Foundation list, Open client intake (new tab), Client home (new tab).
- **Header and state:** "Artifact {id8}". Definition list State / Intake / Payment / Referral / Funnel.
- **"Submitted intake":** Business, Industry, Contact, Email, Phone, Existing domain, Needs, Team size.
- **Quote:** "Quote v{n}" plus subtotal.
- **"Recent events":** last 10.
- **"Mark foundation complete"** (PAID only):
  - Sends **hardcoded** ownership values (`registrar:'TBD'`, etc.).
  - No confirmation, no busy state, no error handling (:22-36, :95-99).

### R3 · `FoundationPipelinePage.tsx`

- **Table:** Business / Payment / Stage / Next action / Blocker, with links to Command and Workbench (:26-53).
- **States:** error as `<p>`; no loading or empty state.

### R4 · `FoundationProjectCommandPage.tsx` / R5 · `FoundationWorkbenchPage.tsx`

- Both render a raw JSON `<pre>` of `project-command` or `workbench` (:30-32; :28).

### R6 · `CommunicationsCommandPage.tsx`

- Static text: "Transactional and marketing sends remain disabled until founder authorization…"
- Links to the email-pack debug page and DF admin, plus a reference to the event map (:10-24).

### Correspondence Studio · `CorrespondenceWorkspacePage.tsx` and `components/correspondence/workspace/*`

- **Top bar:** search, bell (founder-review filter), "FOUNDER MODE".
- **Navigation:**
  - Left nav: TEMPLATES / CAMPAIGNS / DELIVERIES live, the other four "NOT IN V1", ACTIVE BRAND native `<select>`.
  - Task tabs: LIBRARY / PREVIEW / REVIEW.
- **Library:** EMAILS / CAMPAIGNS / AUTOMATIONS (DF lifecycle trigger map, all OFF) / ARCHIVE; family and pack chips.
- **Preview:**
  - Device toggle: MOBILE / TABLET / DESKTOP.
  - View toggle: HTML / REFERENCE / COMPARE.
  - Data-state native `<select>`.
- **Inspector:**
  - CONTENT, DESIGN and SETTINGS tabs.
  - REVIEW & TEST tab: review state, version history, approval history, founder notes, preview checks, "TEST SEND OFF".
- **Actions:** REVISE / SEND TEST OFF / APPROVE → MARK READY.
- **Review persistence:** localStorage `site00-correspondence-review-v1`.
- **Gaps:** no per-client message history and no delivery status.

### Admin shell · `Site00AdminShell.tsx`, `Site00AdminHeader.tsx`, `AdminSearchModal.tsx`

- **Sidebar:**
  - "SITE 00 ◆", "00 / CONTROL · OPERATOR ENVIRONMENT" (static).
  - Nav from `control-nav.ts:12-28`: COMMAND, PROJECTS, PRODUCTION, ESTIMATOR, REVIEWS, CLIENTS, ASSETS / VAULT, SYSTEMS, AUTOMATION, BUSINESS, REPORTS, CORRESPONDENCE, EMAIL / DEBUG, MARKETING, SETTINGS. **No Digital Foundation item.**
  - Footer: profile "OWNER / ADMIN" (static) and "V2.0.0".
- **Header:**
  - Read-only search that opens the ⌘K `AdminSearchModal` (production search; states SEARCHING…, error, "TYPE AT LEAST 2 CHARACTERS.", "NO RESULTS FOR …").
  - Bell **with no handler**.
  - Static "ONLINE".
- **Unused:** the nav config in `src/site00/admin/config/nav.ts` is imported nowhere.
- **Error boundary:** "[ ADMIN · INITIALIZATION FAILED ]" with Reload / Return to sign-in.

## 4. Visual inventory

| Asset | Source | Use in the proposal |
| --- | --- | --- |
| SITE 00 Display (one cut, declared at 400–900) | `public/site00-correspondence-studio/fndatn-01/fonts/site00-correspondence-display.woff2` | Headlines and numerals of record |
| Saira Semi Condensed 300–700 | the same folder | All other text |
| DF threshold objects (`DfThresholdHero`, `DfCrownObject`, `DfCornerFragment`) | `src/site00/foundation-client/objects.tsx` ("purely decorative, never carries client data"; photoreal slots null) | The **only** architectural imagery on the boards; server-rendered from source |
| FNDATN-01 email art (red-glass architecture) | `public/site00-correspondence-studio/fndatn-01/assets/**` | Not used. Email art, not workspace imagery; final founder approval still pending (`pack.ts:14`) |
| DF icon catalog: 16 families, 142 icons, plus 6 legacy extras | `icons/meta.ts`, `icons/glyphs.ts` | Every glyph on the boards |
| NDXBOOK founder workspace CSS | `src/site00/styles/site00-founder-workspace.css` (10,554 lines) | **Not reused.** A different product (NDX), with no DF selectors |

## 5. Founder references (attached to this sprint)

Six mobile screens are stored in `references/`:

| Ref | Screen | Key elements |
| --- | --- | --- |
| B | 01 DIGITAL FOUNDATION (home) | "CLIENTS · PROGRESS · NEXT ACTIONS"; 4 metric tiles; RECENT ACTIVITY; bottom nav HOME / FOUNDATIONS / + / REVIEWS / SYSTEM |
| C | 02 FOUNDATIONS | Tabs ALL / INVITED / INTAKE / QUOTE / ACTIVE / COMPLETE; client cards with thumbnail, status and % |
| D | Client record | Hero image; status pill; "70% COMPLETE · STEP 2 OF 5"; COPY LINK / RESEND INVITE / MESSAGE / VIEW INTAKE / MORE; tabs OVERVIEW / INTAKE / QUOTE / OPERATIONS / ACTIVITY; journey INVITED → INTAKE → QUOTE → SETUP → COMPLETE; NEXT STEP; ADDITIONAL SERVICES |
| G | 06 SYSTEM | Tabs OVERVIEW / INFRASTRUCTURE / INTEGRATIONS / TEST LAB; staging environment; DATABASE, EMAIL SENDING, STRIPE, API KEYS, SECURITY PROBE, E2E TEST MODE; OPEN READINESS DESK |
| E | 03 REVIEWS | "CLIENTS · QUOTES · APPROVALS · EXCEPTIONS"; tabs ALL / INTAKES / QUOTES / ACTIONS / EXCEPTIONS; ink full-width review buttons |
| F | Review detail | Journey INVITED / OPENED / INTAKE / QUOTE / COMPLETE; tabs OVERVIEW / INTAKE / RECOMMENDATIONS / NOTES; section rows; footer ADD NOTE + REVIEW INTAKE |

**Not attached:** Reference A (desktop Foundation Control), plus any tablet or Operations / Correspondence screens.
- Desktop, tablet, Operations and Correspondence authority are therefore **derived**, from the mobile references, the brief and the existing SITE 00 grammar.
- They are marked PROPOSED and carry no reference authority.

### Reference elements this package does **not** reproduce literally (and why)

| Element | Reason |
| --- | --- |
| Monospace "SITE 00 / FOUNDER" wordmark | The founder requires the two intake fonts. The wordmark is set in Saira 600, wide tracking, exactly as the DF client header does it. |
| Photo thumbnails and hero photos per client | No client imagery exists. The brief forbids inventing business photography. A typographic **plate** (initials plus a threshold sliver) is the non-image identity, with an image slot reserved for future approved assets. |
| "70% COMPLETE" | No percentage exists in the data (gap G-02). Shown as phase segments plus "STEP n OF 8". |
| Circular create button and circular journey nodes | Brief: "Do not automatically adopt circular controls." Refined to 3 px-radius rectilinear forms, matching the form-control authority. |
| "RESEND INVITE" quick action | No backend action exists (G-05). Shown as an unavailable action with its reason, never as live. |
| Large hero photo on the record page | Replaced by a slim threshold band built from the DF object, used once per destination at most |
