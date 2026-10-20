# 27 — Backend Gap Register

Nothing here was implemented. This sprint creates no tables, changes no backend, migrates no data, sends no email and modifies no payment processing. Severity: **B** = blocks the founder-approved direction, **H** = high, **M** = medium, **L** = low.

| ID | Gap | Needed for | Severity | Proposed shape | Phase |
|---|---|---|---|---|---|
| G-01 | Review route (AUTO / FOUNDER) not in client payload | A "closer look" notice | M | `review: { route: 'AUTO'\|'FOUNDER' }` in `ClientDigitalFoundationPayload` | 7 |
| **G-02** | `completeIntake` exposes a CLIENT_REVIEW quote immediately; no founder approval before the client sees prices | directions 3–6, family A, stage 2 | **B** | Auto-prepare the quote as DRAFT; client sees `quote` only after founder approval (`founder_commercial_ready` + transition to QUOTE_READY by founder action) | 2 / 7 |
| G-03 | Portal views only on PORTAL surface; no intake-summary record | four areas from INTAKE_COMPLETE | H | client: `portalViewsForPayload` from INTAKE_COMPLETE; `buildClientRecords` adds INTAKE SUMMARY | 1 / 12 |
| G-04 | Client-action drafts not persisted | IN PROGRESS state | M | `draft` on ClientActionRequest, or client-local draft with an honest label | 12 |
| G-05 | Payload lists only OPEN actions | SUBMITTED, RESOLVED | H | include `COMPLETED` (last 30 days) and `response_submitted_at` | 12 |
| G-06 | No action dependencies or effort metadata | BLOCKED, "ABOUT TWO MINUTES" | M | `blocked_by: request_id[]`, `effort_minutes` per action type | 12 |
| G-07 | No client-safe workstream projection | family N, O | H | `client_workstreams[]` from stages + runbook tasks with `CLIENT_SAFE` visibility | 11 |
| G-08 | `events` stripped from client payload | activity timeline, received time | H | `client_activity[]` from the allow-list in `20` | 11 |
| **G-09** | No session / email-link / code reentry; no `/foundation/return` | family H, home screen, access card | **B** | route + `df_client_sessions` (httpOnly cookie, 30 days), link (15 min, single use) + code (10 min, 5 tries), rate limits, non-enumerating responses | 4 |
| G-10 | No step-up for sensitive records | verified view | H | step-up flag on session (30 min idle) | 12 |
| G-11 | No access-card id service | family G | H | issue / revoke / version card ids, stored hashed; render inputs exclude `public_token` | 6 |
| **G-12** | Bearer token: no expiry, rotation, hashing, revocation; CORS `*`; archived artifacts still served | security | **B** | exchange token→session on first use + replaceState; rotate on demand; store hash; restrict CORS to site00.com; reject POST on ARCHIVED | 4 |
| G-13 | No manifest, icons, theme-color; `/site00/favicon.svg` missing | family F | H | static manifest + icons (`10`), linked only on `/foundation/*` | 5 |
| G-14 | Email templates for taking-shape / needs-you / sign-in not present; sending disabled | `20` | M | templates in correspondence studio; `enabled: false` until founder approves | 13 |
| G-15 | Webhook idempotency, amount and currency checks not verified | payment gates | H | assert in `webhookHandler` + tests | 10 |
| G-16 | Quote EXPIRED status never set (read-time only) | consistency | L | acceptable; optional sweeper | 9 |
| G-17 | No route to send a declined-required proposal back to founder review | family J | H | `action=request-review` → quote DRAFT v+1, state back to INTAKE_COMPLETE / RECOMMENDATION_READY via allowed transitions | 9 |
| G-18 | `send-message` requires PAID | REQUEST CLARIFICATION pre-payment | M | allow messages from INTAKE_COMPLETE, rate-limited | 8 |
| G-19 | No server `fetched_at` | status as-of | L | add `fetched_at` to payload | 3 |
| G-20 | `CommunicationPreferences` unwired (API exists) | family R | L | client only | 13 |
| G-21 | `?step=intake` ignored | email/admin deep links | L | read it in FoundationClient, or drop it from links | 1 |
| G-22 | `DigitalFoundationCompleteSurface` outside DF grammar | family P | M | client only | 12 |
| G-23 | No client-safe founder note on a quote | founder note | L | `client_note` on quote version | 8 |
| G-24 | FNDATN-01 email 02 contradicts the instant quote | email truth | M | resolved by G-02 + new copy | 13 |
| G-25 | Recommendation reasons / required flag / decline effect not exposed | family J | H | `recommendations[]: { addon_id, required, reason, decline_effect }` | 8 |
| G-26 | Handoff document not generated as a client record | FOUNDATION HANDOFF record | M | generate at completion | 12 |

## Not gaps (verified to exist)

- Quote versioning and SUPERSEDED.
- The three verbatim disclosures enforced server-side.
- Webhook HMAC verification and quote-version binding.
- Redirect never marks paid.
- `build-interest`.
- `update-communication-preferences`.
- `complete-client-action`.
- `buildClientRecords`.
- `timeline_readiness`.
- `operations_summary`.
- Lifecycle transition guard.
