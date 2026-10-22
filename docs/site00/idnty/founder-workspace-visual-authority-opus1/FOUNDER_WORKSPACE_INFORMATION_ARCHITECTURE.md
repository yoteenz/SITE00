# Founder workspace information architecture

**Status:** PROPOSED. Boards 01, 02, 26. Open decisions: FD-W1 (mobile navigation), FD-W2 (inspector), FD-W6 (routes), FD-W7 (Readiness Desk).

## 1. Principle: one question per destination

Each destination answers one founder question and leads with the action that question implies. Information that answers a different question lives in that destination, reached by a link, not repeated.

| # | Destination | Founder question | Leads with | Never contains |
| --- | --- | --- | --- | --- |
| 01 | OVERVIEW | What needs me right now? | The oldest founder decision (CURRENT FOCUS) | System diagnostics, raw lists of every client |
| 02 | FOUNDATIONS | Where is each client? | The registry, sorted "needs you first" | Review decisions inline; operations task lists |
| 03 | REVIEWS | What must I decide? | The decision queue with one primary action per item | Clients with nothing to decide |
| 04 | OPERATIONS | What fulfilment work is moving or stuck? | The next task the founder can start, then blocked work | Commercial decisions |
| 05 | CORRESPONDENCE | What has been said and sent, and what can be sent? | The send-policy truth, then messages | Template editing (stays in Correspondence Studio) |
| 06 | SYSTEM | Is staging able to do what I'm about to do? | One verdict and the one next system action | Client data (except synthetic test clients in TEST LAB) |

The **client record** belongs to 02 FOUNDATIONS and is reachable from every destination (row, review item, task, thread, notification).

## 2. Placement of every capability

How each existing capability is placed. COVERAGE_AND_OMISSION_REPORT.md lists the same at line-item level.

| Capability (source) | Destination | Why there |
| --- | --- | --- |
| List of artifacts, state, payment, created (R1) | 02 registry | Where-is-each-client question |
| Create lead + link (R1) | Global create → 02 | Creation belongs to the shell so it is reachable everywhere; the result lands in the registry |
| Client intake link / client home (R1, R2) | Record quick actions COPY LINK, CLIENT VIEW | Per-client context |
| Detail dl, submitted intake, quote, events (R2) | Record OVERVIEW, INTAKE, QUOTE, ACTIVITY | Same data, sectioned |
| Mark foundation complete (R2) | Record RECORDS + confirmation | Completion needs the gate and ownership values in view |
| Pipeline table (R3) | 04 OPERATIONS active work | Stage, next action, blocker are fulfilment facts |
| Project command / workbench JSON (R4, R5) | Record OPERATIONS + 04 task inspector | Designed views replace raw JSON |
| Communications policy text (R6) | 05 policy banner + lifecycle map | Now backed by the real event map and send gates |
| Readiness Desk diagnostics (R7) | 06 SYSTEM overview, stack, integrations, security, report | Category-first instead of one long page |
| Readiness Desk test harness (R7) | 06 SYSTEM TEST LAB | Kept whole; synthetic only |
| Correspondence Studio (templates, campaigns, packs) | Unchanged, linked from 05 and the menu | A separate tool with its own chrome; not duplicated |
| ~22 unexposed admin actions | Record sections, Reviews, Operations, Correspondence | Each placed where its decision is made (DATA_CONTRACT_MAPPING.md §5) |

## 3. Navigation model

| Element | Phone (< 768) | Tablet (768–1279) | Desktop (≥ 1280) |
| --- | --- | --- | --- |
| Primary | Bottom nav: HOME · FOUNDATIONS · CREATE · REVIEWS · SYSTEM | 72 px index rail, all six + create | 232 px sidebar, all six + NEW FOUNDATION |
| 04 OPERATIONS, 05 CORRESPONDENCE | Labelled MENU drawer (header, right) | Rail | Sidebar |
| Tools (Readiness Desk, Correspondence Studio) | MENU drawer | Account menu | Sidebar, below a rule |
| Account, sign-out | MENU drawer | Rail foot plate → menu | Sidebar foot → menu |
| Back | Header ← on pushed views; bottom nav stays | Breadcrumb in top bar | Breadcrumb in top bar |

**Why OPERATIONS is not in the phone bottom nav (FD-W1).** The founder references B–G put HOME, FOUNDATIONS, create, REVIEWS and SYSTEM there. Operations actions are not persisted alone today (G-04), so most founder time on a phone goes to decisions and client status. The labelled MENU keeps OPERATIONS and CORRESPONDENCE one tap away and never behind an unlabelled icon. **Alternative:** swap SYSTEM for OPERATIONS once G-04 closes.

## 4. Progressive disclosure layers

| Layer | What appears | Example |
| --- | --- | --- |
| 0 · Glance | Verdict, focus, counts | "1 ITEM NEEDS YOU · 2 UNVERIFIED" |
| 1 · List | One row per thing, four facts: who, status, progress, next | Registry row |
| 2 · Context | Inspector (desktop) or sheet (phone) | Client preview, module detail |
| 3 · Workspace | The full page with sections | Client record, review detail |
| 4 · Technical | Collapsed technical detail | Env names, request id, error status |

Nothing from a deeper layer is shown permanently at a shallower one.

## 5. Cross-destination links

| From | To | Trigger |
| --- | --- | --- |
| Overview focus | Review detail | Primary action |
| Overview signal | Foundations filtered | Tap (filters Active Work in place on Overview; "ALL FOUNDATIONS →" carries the filter) |
| Registry row | Client record | Tap / Enter |
| Review item | Review detail → record section | Primary action / OPEN RECORD |
| Notification | Review detail, record or task | Tap |
| Task | Record OPERATIONS | Project link |
| Thread | Record COMMUNICATIONS | Client name |
| System module | Test Lab / Correspondence (email) | Next action |
| Record | Client view (public link, new tab) | CLIENT VIEW |

## 6. Synthetic test clients

Synthetic clients (`SYNTH · ` prefix, created by `create-test-client`) are excluded from Overview signals and the registry by default (`?test=1` shows them), carry the hatched plate and TEST tag everywhere, and are fully operable from SYSTEM → TEST LAB. **FD-W12** confirms the default.
