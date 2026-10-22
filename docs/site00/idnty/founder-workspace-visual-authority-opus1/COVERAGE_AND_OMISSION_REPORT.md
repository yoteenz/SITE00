# Coverage and omission report (§41 gate)

**Status:** PROPOSED. **Gate result: PASS. No existing capability lacks a destination.** Four items are RETIRED · REQUIRES FOUNDER APPROVAL and none are UNRESOLVED.

**Method:** a systematic comparison of the following sources:

| § | Source |
| --- | --- |
| A | Existing source components |
| B | Routes |
| C | Feature capabilities |
| D | Readiness Desk functions |
| E | Attached reference screens |
| F | Proposed information architecture |
| G | Page and component tree |
| H | Visual boards |
| I | Composer plan |

Source lines are from EXISTING_SYSTEM_FORENSIC_MAP.md, audited at `392ac76d5`. Every row names its destination (F), registry ID (G), board (H) and phase (I).

**Dispositions:**

| Disposition | Meaning |
| --- | --- |
| PRESERVED | Same capability, same meaning, in the new workspace |
| MOVED | Same capability, at another destination |
| REPLACED | An equivalent that removes a defect (e.g. a hard-coded value, a native prompt, a missing confirmation). The replacement is PROPOSED and awaits founder approval like everything else |
| RETIRED · FA | Removed; requires founder approval |
| UNRESOLVED | No destination (**none**) |

## A. Existing source components

| # | Component (source) | Disposition | Destination | Registry | Board | Phase |
| --- | --- | --- | --- | --- | --- | --- |
| A-01 | `FoundationAdminListPage.tsx` | REPLACED | 02 Foundations | FN-01 | 05, 06 | 3 |
| A-02 | `FoundationAdminDetailPage.tsx` | REPLACED | Client record | CR-01 | 09, 10 | 4 |
| A-03 | `FoundationPipelinePage.tsx` | MOVED | 04 Operations active work | OP-01, OP-02 | 17, 18 | 6 |
| A-04 | `FoundationProjectCommandPage.tsx` (JSON) | REPLACED | Record operations section | CR-09, OP-03 | 17, 18 | 4, 6 |
| A-05 | `FoundationWorkbenchPage.tsx` (JSON) | REPLACED | Record operations + task inspector | CR-09, OP-04, OP-05 | 17, 18 | 4, 6 |
| A-06 | `CommunicationsCommandPage.tsx` | REPLACED | 05 Correspondence | CO-01 | 19, 20 | 7 |
| A-07 | `FoundationReadinessPage.tsx` | MOVED (R7 kept until FD-W7) | 06 System + Test Lab | SY-01…SY-13 | 21–23 | 8 |
| A-08 | `Site00AdminShell.tsx` (used by R7) | REPLACED inside the workspace; admin shell unchanged elsewhere | Workspace shell | SH-01 | 01, 02 | 1 |
| A-09 | `Site00AdminHeader.tsx` (search, bell, ONLINE) | REPLACED | Shell header / top bar | SH-03, SH-04, SH-05 | 01, 02, 24 | 1 |
| A-10 | `AdminSearchModal.tsx` (production search) | PRESERVED outside; workspace gets DF-scoped search with the same keyboard model | Shell search | SH-04, OL-04 | 01, 24 | 1 |
| A-11 | `foundationAdminApi.ts`, `foundationReadinessApi.ts` | PRESERVED (consumed as is) | All destinations | — | — | 0 |
| A-12 | `CorrespondenceWorkspacePage.tsx` + `components/correspondence/workspace/*` | PRESERVED (unchanged, linked) | Tool link | CO-07 | 19, 20 | 7 |
| A-13 | `src/site00/admin/config/nav.ts` (imported nowhere) | PRESERVED (out of scope; untouched) | — | — | — | — |
| A-14 | Admin error boundary "[ ADMIN · INITIALIZATION FAILED ]" | PRESERVED | Shell | SH-01 | — | 1 |
| A-15 | DF threshold objects `objects.tsx` | PRESERVED (reused decoratively) | Page titles | SC-16 | 03–22 | 1 |
| A-16 | DF icon catalog `icons/meta.ts`, `glyphs.ts` | PRESERVED | All | — | all | 1 |

## B. Routes

| Route | Disposition | Destination | Board | Phase |
| --- | --- | --- | --- | --- |
| R1 `/admin/site00/foundation` | PRESERVED (same path) | 02 Foundations | 26 | 3 |
| R2 `/admin/site00/foundation/:id` | PRESERVED (same path) | Client record | 26 | 4 |
| R3 `/admin/site00/foundation/pipeline` | MOVED (redirect; path resolves) | 04 Operations | 26 | 6 |
| R4 `/:id/command` | MOVED (redirect) | Record `?section=operations` | 26 | 4 |
| R5 `/:id/workbench` | MOVED (redirect) | Record `?section=operations&view=tasks` | 26 | 4 |
| R6 `/admin/site00/foundation/communications` | PRESERVED (same path) | 05 Correspondence | 26 | 7 |
| R7 `/admin/site00/foundation-readiness` (auth return path) | PRESERVED (same path; renders R7 until FD-W7, then System) | 06 System | 26 | 8 |
| Correspondence Studio routes | PRESERVED (untouched) | Tool | 26 | — |
| Intakes, dashboard, email debug, public client routes | PRESERVED (untouched; outside the workspace) | — | 26 | — |
| `invitationAdmin` constant (unrouted) | PRESERVED (still unrouted; no UI invented) | — | — | — |
| Dev preview bootstrap `/api/dev/site00-digital-foundation-preview-bootstrap` | PRESERVED (dev-only empty-list behaviour) | 02 registry states | — | 3 |

## C. Feature capabilities

| # | Capability (source) | Disposition | Destination | Registry | Board | Phase |
| --- | --- | --- | --- | --- | --- | --- |
| C-01 | Create lead + link (R1 :30-48) | REPLACED: real fields replace the hard-coded `prospect@example.com` | Global create → 02 | FN-07, OL-01 | 07, 08 | 3 |
| C-02 | Copy client intake link via `window.prompt` (R1 :41) | REPLACED: clipboard + toast + visible link + fallback field | Link ready, quick actions, row menu | SC-18, CR-03 | 07–09, 24 | 3, 4 |
| C-03 | Table State / Payment / Created / Links (R1 :65-90) | PRESERVED (state, payment, created → phase, whose move, activity) | 02 registry | FN-05 | 05, 06 | 3 |
| C-04 | Link "Client intake" (new tab `/foundation/:token?step=intake`) | PRESERVED | CLIENT VIEW (new tab) | CR-03, FN-10 | 09, 24 | 3, 4 |
| C-05 | Link "Founder" (to detail) | PRESERVED | Row → record | FN-05 | 05, 06 | 3 |
| C-06 | Detail: ← list, open client intake, client home (R2) | PRESERVED | Back, CLIENT VIEW | CR-02, CR-03 | 09, 10 | 4 |
| C-07 | Detail: Artifact id, State / Intake / Payment / Referral / Funnel dl | PRESERVED | Record header + overview kv | CR-02, SC-17 | 10 | 4 |
| C-08 | Detail: submitted intake (business, industry, contact, email, phone, domain, needs, team size) | PRESERVED | Record INTAKE | CR-06 | 11 | 4 |
| C-09 | Detail: Quote v{n} subtotal | PRESERVED (expanded) | Record QUOTE | CR-08 | 12 | 4 |
| C-10 | Detail: Recent events (last 10) | PRESERVED (expanded) | Record ACTIVITY, Overview movement | CR-12, OV-06 | 03, 10 | 2, 4 |
| C-11 | Mark foundation complete (R2 :22-36; hard-coded ownership; no confirm) | REPLACED: gate + ownership fields + confirmation | Record RECORDS | CR-10, OL-10 | 24 | 4 |
| C-12 | Pipeline: business, payment, stage, next action, blocker; links to command / workbench (R3) | MOVED | 04 Operations | OP-02 | 17, 18 | 6 |
| C-13 | Project command JSON (R4) | REPLACED (designed view of the same data) | Record OPERATIONS | CR-09 | 18 | 4 |
| C-14 | Workbench JSON (R5) | REPLACED (designed task view) | Operations tasks | OP-04, OP-05 | 17, 18 | 6 |
| C-15 | Communications static policy text (R6) | REPLACED (policy banner backed by real gates) | 05 | CO-01 | 19, 20 | 7 |
| C-16 | Link to email-pack debug (R6) | PRESERVED | 05 tools / menu | CO-07 | 19 | 7 |
| C-17 | Link to DF admin (R6) | PRESERVED (navigation) | Shell | SH-11 | 02 | 1 |
| C-18 | Reference to event map (R6) | REPLACED (rendered lifecycle map) | 05 LIFECYCLE | CO-04 | 20 | 7 |
| C-19 | Admin API actions with no UI (~22: update-quote, manual-adjustment, quote-commercial-ready, approval-request, approval-resolve, client-action, update-stage, generate-runbook, activate-runbook, set-providers, start/complete/verify/escalate-task, set-blocker, messages, send-message, completion-gate, email-timeline, create-lead, create-artifact-for-lead, materialize-fixture) | PRESERVED (API unchanged) · UI designed for every founder action except: `create-lead` / `create-artifact-for-lead` (covered by `create-artifact`), `materialize-fixture` (API-only staging tool, as today) | Record, Reviews, Operations, Correspondence | see registry | 10–20 | 4–7 |
| C-20 | Correspondence Studio: library, preview (devices, HTML / REFERENCE / COMPARE), inspector tabs, review and test, REVISE / APPROVE → MARK READY | PRESERVED (untouched) | Tool | CO-07 | — | — |

## D. Readiness Desk (R7) functions

| # | Function (R7 lines) | Disposition | Destination | Registry | Board |
| --- | --- | --- | --- | --- | --- |
| D-01 | Header + subtitle (:104-106) | REPLACED (System title + test-lab policy banner) | 06 | SY-01 | 21–23 |
| D-02 | Overall status line: overall, synthetic intake, E2E (not authorized by design), founder session, email send (:108-133) | PRESERVED | Verdict + modules | SY-02, SY-03 | 21, 22 |
| D-03 | Links: all artifacts, Correspondence Studio (:135-136) | PRESERVED | Navigation, tools | SH-11 | 02 |
| D-04 | Staging stack: frontend, API, Supabase ref, persistence, email sending, Stripe key mode, public link origin, external E2E (:146-203) | PRESERVED | STACK + INTEGRATIONS | SY-04, SY-05 | 21 |
| D-05 | Database security probe (:205-222) | PRESERVED | SECURITY | SY-06 | 21 |
| D-06 | Readiness report: ready / action required / blocked / unverified (:224-259) | PRESERVED | READINESS REPORT | SY-07 | 22 |
| D-07 | Technical configuration `<details>` env table (:261-279) | PRESERVED (names only) | READINESS REPORT | SY-08 | 22 |
| D-08 | Legacy env presence list (:281-290) | PRESERVED | Technical configuration | SY-08 | 22 |
| D-09 | Build meta: API commit + package marker (:292-294) | PRESERVED | Overview foot | SY-09 | 21, 22 |
| D-10 | Create test client (:301-322) | PRESERVED | TEST LAB | SY-10 | 23 |
| D-11 | Client journey state / intake / payment / surface + open client link (:326-336) | PRESERVED | TEST LAB | SY-11 | 23 |
| D-12 | Submit intake (test), Quote ready + queue email (:337-362) | PRESERVED | TEST LAB | SY-11 | 23 |
| D-13 | Reset test data, no confirmation (:337-362) | REPLACED (confirmed) | TEST LAB | SY-11, OL-17 | 23 |
| D-14 | Email events table (:363-441) | PRESERVED | TEST LAB + 05 DELIVERY | SY-12, CO-02 | 20, 23 |
| D-15 | Prepare test invitation + approval tick + send (:381-421) | PRESERVED | TEST LAB / 05 | SY-12, CO-06 | 19, 23 |
| D-16 | "Send lifecycle email (approved)" without a tick (:423-435) | REPLACED (same tick for every send, FD-W16) | Gated send | CO-06, OL-15 | 19, 23 |
| D-17 | Invitation preview, no send (:442-462) | PRESERVED | TEST LAB / 05 preview | CO-05 | 20, 23 |
| D-18 | Error states role=alert; "Loading…" (:140-144, :201, :297) | REPLACED (banner + retry + detail; skeletons) | All | SC-13, SC-15 | 24 |

## E. Reference screens (B–G)

| Reference element | Disposition | Where / why |
| --- | --- | --- |
| B · metric tiles ×4 | REPLACED (one signal rail) | Overview zone C; founder feedback: action over reporting |
| B · RECENT ACTIVITY | PRESERVED | Overview zone F |
| B · bottom nav + centre + | PRESERVED (geometry refined, FD-W4) | Shell |
| C · status tabs ALL / INVITED / INTAKE / QUOTE / ACTIVE / COMPLETE | PRESERVED (+ REVIEW) | 02 |
| C · client cards with thumbnail and % | REPLACED (plate + phases; no photos or %; FD-W3, FD-W11) | 02 |
| D · hero image | REPLACED (threshold band) | Record |
| D · COPY LINK / RESEND INVITE / MESSAGE / VIEW INTAKE / MORE | PRESERVED except RESEND (unavailable, G-05); VIEW INTAKE = INTAKE tab | Record |
| D · tabs OVERVIEW / INTAKE / QUOTE / OPERATIONS / ACTIVITY | PRESERVED (+ RECOMMENDATIONS, RECORDS, COMMUNICATIONS) | Record |
| D · journey 5 steps | REPLACED (8 display phases, FD-W11) | Record |
| D · NEXT STEP, ADDITIONAL SERVICES | PRESERVED (next action; recommendations / quote lines) | Record |
| E · tabs ALL / INTAKES / QUOTES / ACTIONS / EXCEPTIONS; ink review buttons | PRESERVED (ACTIONS = REQUESTS; + RECOMMEND, HISTORY) | 03 |
| F · journey, tabs OVERVIEW / INTAKE / RECOMMENDATIONS / NOTES, section rows, ADD NOTE + REVIEW INTAKE | PRESERVED (decision sheet) | Review detail |
| G · tabs OVERVIEW / INFRASTRUCTURE / INTEGRATIONS / TEST LAB; DATABASE, EMAIL, STRIPE, API KEYS, SECURITY PROBE, E2E TEST MODE; OPEN READINESS DESK | PRESERVED (+ SECURITY tab; API KEYS as names-only presence) | 06 |
| Monospace wordmark | REPLACED (Saira; two-font rule) | Shell |

## Special inspections (§41 list)

| Item | Today | Result |
| --- | --- | --- |
| Native dropdowns | Correspondence Studio brand / data-state `<select>` (Studio unchanged); none in DF pages | PRESERVED in Studio; workspace uses the field grammar (FN-04, SC-07) |
| Menus | None | ADDED: row, account, sort (SC-08, OL-06, OL-18) |
| Account surfaces | Static "OWNER / ADMIN", no sign-out | REPLACED: identity + account menu + sign-out (SH-02, SH-07) |
| Notification states | Bell with no handler | REPLACED: derived center (SH-05; FD-W19) |
| Search | Production ⌘K modal | PRESERVED outside; DF search inside (SH-04) |
| Filters | None | ADDED: status views + filters (FN-03, FN-04) |
| Modals | `window.prompt` | REPLACED: overlay host (SH-13) |
| Confirmation dialogs | None (reset, mark complete) | ADDED (OL-10, OL-17, OL-08) |
| Empty states | None | ADDED (SC-12) |
| Loading states | "Loading…" text | REPLACED (SC-13) |
| Error states | Bare `<p>` / role=alert | REPLACED (SC-15) |
| Test-client controls | R7 | PRESERVED (SY-10…SY-12) |
| Client link actions | prompt + new-tab links | PRESERVED + REPLACED copy (SC-18, CR-03) |
| Email status | R7 events table | PRESERVED + expanded (CO-02) |
| Payment readiness | R2 payment field, R7 Stripe key mode | PRESERVED (record state, Stripe module) |
| Permissions | AdminGuard, preview bypass, client message PAID rule, test-mode allowlist | PRESERVED unchanged; surfaced as reasons |
| Dashboard diagnostics | R7 | PRESERVED (06) |
| Lifecycle actions | R2 mark complete + unexposed API actions | PRESERVED / ADDED (records, reviews, operations) |
| Responsive variants | None (desktop-only pages) | ADDED (RESPONSIVE_COMPONENT_MATRIX.md) |

## Retired · requires founder approval

| Item | Why retire | Replacement |
| --- | --- | --- |
| Raw JSON `<pre>` on R4 and R5 | Not a founder interface | Designed operations views; raw payload available in technical detail if the founder wants it |
| `window.prompt` link copy | Native, blocking, unlabeled | Clipboard + toast + fallback field |
| R7 one-page layout (after FD-W7) | Replaced by category-first System | System at the same path |
| Static "ONLINE" indicator | Not backed by any check | Environment indicator from the readiness report |

## Gate result

- A: 16 components, all mapped.
- B: 7 DF routes plus adjacent routes, all mapped.
- C: 20 capability groups, all mapped.
- D: 18 Readiness Desk functions, all mapped.
- E: 6 reference screens, all elements mapped.
- Special inspections: 19, all mapped.

**UNRESOLVED: 0. RETIRED · FA: 4.** The gate passes, subject to founder approval of the retirements.
