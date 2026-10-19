# 06 · System page specification

**Status:** PROPOSED. Boards 21 (mobile), 22 (desktop), 23 (test lab). Registry SY-01…SY-13. Reference G (06 SYSTEM).
**Route:** `/admin/site00/foundation/system?tab=` (new). R7 `/admin/site00/foundation-readiness` keeps working (FD-W7).
**Question:** is staging able to do what I'm about to do?

## 1. Principle

The R7 Readiness Desk holds every staging diagnostic and the only test harness, on one long page. System keeps **all** of it, reorganised category-first:
- one verdict;
- eight modules;
- detail on demand;
- technical configuration last.

**No check reads as healthy unless a real check ran and passed.** In particular, a responding catalog endpoint is not API health.

## 2. Tabs

| Tab (phone label) | Content | R7 source |
| --- | --- | --- |
| OVERVIEW | Verdict ("ACTION REQUIRED — 1 ITEM NEEDS YOU", counts by chip), module grid, build marker, OPEN READINESS DESK (until FD-W7) | :108-133, :292-294 |
| INFRASTRUCTURE (STACK) | Frontend `carefree-luck`, API `reliable-creation` (UNVERIFIED: no health probe), Supabase project (ISOLATED: ref = staging, ≠ production), persistence (SUPABASE · DURABLE), public link origin, external E2E (NOT PASSED · BY DESIGN) | :146-203 |
| INTEGRATIONS | Stripe: key mode by prefix (TEST; live → BLOCKED), webhook (UNVERIFIED). Resend: API key (PRESENT, name only), send flag (OFF BY POLICY), domain (NEEDS FOUNDER). GoDaddy DNS: DKIM (NEEDS FOUNDER; always manual) | :146-203 + `founderReadiness.ts` |
| SECURITY | RLS probe on `site00_df_project_messages`: anon read DENIED, service role ALLOWED (server only), persistence exposure SAFE; founder session (email as data, ADMIN) | :205-222 |
| TEST LAB | See §4 | :296-462 |
| READINESS REPORT (desktop tab; phone via OVERVIEW) | READY · ACTION REQUIRED · BLOCKED · UNVERIFIED columns; TECHNICAL CONFIGURATION table (STATUS · SETTING · PURPOSE · STATE), env **names** only; legacy env presence list | :224-290 |

## 3. Modules

The eight modules are: STAGING STACK, PERSISTENCE, DATABASE SECURITY, EMAIL SENDING, EMAIL DOMAIN · DKIM, STRIPE, API HEALTH and E2E TEST MODE.

Each card shows an icon, a chip, a title and one line of condition. Tapping a card opens its detail (sheet on phone, inspector on desktop):
- summary;
- checks with chips;
- the **one next action** (e.g. "CONFIRM THE GODADDY DKIM RECORD AND THE RESEND DOMAIN, THEN RE-RUN THE REPORT.");
- ENVIRONMENT · NAMES ONLY;
- RE-RUN READINESS REPORT.

Chip meanings follow VISUAL_AUTHORITY_FOUNDATION.md §3. The board 21 legend shows what each chip is never used for.

**Reported but unchecked today** (always UNVERIFIED): API health ping, Stripe webhook probe, E2E results, live email delivery (G-08). A transactional send flag that is ON is reported as UNVERIFIED, per `founderReadiness.ts`.

## 4. Test lab (board 23)

| Function | Detail | API |
| --- | --- | --- |
| Create synthetic client | Policy banner (staging, synthetic, allowlisted, never a real client); TEST RECIPIENT (must be on the API allowlist; explained before submit), DISPLAY NAME (default "Founder E2E Client", saved with the `SYNTH · ` prefix) | `create-test-client` |
| Test journey | Plate (hatched) + name + email; segments; STATE / INTAKE / PAYMENT / SURFACE; SUBMIT INTAKE (TEST), QUOTE READY + QUEUE EMAIL, OPEN CLIENT LINK (masked token, new tab) | `test-journey`, `advance-test-intake`, `advance-test-quote` |
| Email events | Template id (data) · trigger · provider id (data) · status chip | `email-timeline` |
| Invitation preview (no send) | Subject, to (masked), from, link valid, configured origin, ready-to-send, blockers | `prepare-test-invitation` |
| Gated send | One sheet + approval tick for every send (§3 of CORRESPONDENCE_PAGE_SPECIFICATION.md) | `dispatch-test-email` |
| Reset test data | **Confirmed** destructive sheet: what it clears (in-memory store, synthetic journey state, memory-only events), what it does not (database rows, real clients); no undo; type RESET; red RESET TEST DATA. Today one click, no confirmation | `reset-test-data` |
| Continuity checks | Artifact survives restart, link resolves after restart, intake resumes, events survive restart: drawn **UNVERIFIED / NOT PERSISTED**. A proposal for the persistence workstream; nothing claims they have run (FD-W18) | none today |
| Fixtures | `materialize-fixture` (A_BASE…M_COMPLETE_CREDIT) stays an API-only staging tool; no UI is proposed (not in R7) | — |

Synthetic actions reject non-synthetic artifacts at the API. The UI never offers them on a real client.

## 5. Security rules

- Environment variables appear by **name and presence** only. Values are never fetched to the browser.
- No Supabase credentials, service-role key or token values are ever rendered.
- Provider ids and the build commit are data (exact case); they are not secrets.

## 6. States

| State | Presentation |
| --- | --- |
| Report loading | Skeleton verdict + module skeletons |
| Report failed | Banner "COULD NOT LOAD THE READINESS REPORT" + RETRY + technical detail (action, status, request id, time) |
| Probe failed | FAILED chip + the probe note in module detail |
| Re-running | Button busy; previous report kept and labelled with its age |
| Production environment detected | Verdict "PRODUCTION · TEST LAB UNAVAILABLE"; TEST LAB tab disabled with that reason |
