# 08 — Production authorization hardening

Sprint §14, §15, §16 and §17, for the production spine. The audit of the other provider paths in the repository is in deliverable 09.

## 1. What a dispatch must prove (§15)

A provider call needs a single-use ticket. Only the spend gate (`gate.ts → issueDispatchTicket`) issues tickets, and the transport redeems one before doing anything. The gate checks:

| §15 requirement | Gate check | Code |
| --- | --- | --- |
| Authorized operator | Dispatcher holds DISPATCH (founder) | `OPERATOR_NOT_AUTHORIZED` |
| Project | Job, shot and authorization belong to one project | `PROJECT_MISMATCH` |
| Purpose | The authorization records the job's purpose (kind, shot, reference, provider, model, mode) | stored on the approval |
| Approved references | Every input is an approved reference whose stored copy matches its hash | `REFERENCES_NOT_APPROVED`, `REFERENCE_MEDIA_UNVERIFIED` |
| Approved settings | The input hash covers route, provider, model, mode, settings, outputs, inputs and prompt; any change voids the authorization | `APPROVAL_INVALIDATED_BY_INPUT_CHANGE` |
| Current quote | A known quote, no older than 24 h | `UNKNOWN_QUOTE`, `QUOTE_STALE` |
| Explicit authorization | A founder GENERATION_AUTHORIZATION for this job, not revoked | `NO_FOUNDER_APPROVAL`, `AUTHORIZATION_REVOKED` |
| Spending ceiling | Quote ≤ the authorization's ceiling; committed + quote ≤ the founder-authorized budget | `EXCEEDS_AUTHORIZED_MAX`, `OVER_BUDGET` |
| Scope | One job, one attempt. A used authorization buys nothing more. | `AUTHORIZATION_ALREADY_USED` |
| Expiration | The authorization expires (≤ 24 h). The ticket lasts at most 120 s and never past the authorization. | `AUTHORIZATION_EXPIRED`, `TICKET_EXPIRED` |
| Request fingerprint | The ticket binds project, job, input hash, idempotency key and route; the transport redeems against the request it is about to send | `TICKET_MISMATCH` |
| Provider route | The route is in the project's route table, and the authorization names the same route | `ROUTE_INVALID`, `NO_TRANSPORT` |
| Quote unchanged since authorization | The authorization records the quote it was given against | `QUOTE_CHANGED` |
| Creative state | The scene review state allows the job (steps, scopes, element approvals); founder decisions answered | `INVALID_SCENE_STATE`, `DECISIONS_OPEN` |

**The database repeats the decisive part.** A job can only become AUTHORIZED against a founder GENERATION_AUTHORIZATION for that job at that input hash (`site00_spine_job_authority`). A non-founder authorization cannot be written (`spend_founder` check).

**A valid quote is not permission, and a configured credential is not permission.** The OpenArt route stays disabled unless both of these hold:

1. `SITE00_PROVIDER_EXECUTION=ENABLED`;
2. an agent-session executor is injected.

The deployed app has neither. OpenArt session or token variables in the server environment disable the route outright.

## 2. Unknown cost is never zero (§16)

| Place | Before | Now |
| --- | --- | --- |
| `committedCredits` | A failed attempt with no reported charge and no quote counted 0 | Counts the attempt's quote, else the job's quote. If neither exists the total is **unknown** (`null`) and the gate refuses with `UNKNOWN_COMMITTED_SPEND`. |
| Scene gate adapter (`theExchange.ts`) | `quotedCost.credits ?? 0` | Passes `null`; the scene gate reports "price UNKNOWN" |
| Workspace budget | Summed with `0` for unknown | `committedCredits: null` shows UNKNOWN |
| Provider-operation rows | — | `charged_status` REPORTED / UNKNOWN / NOT_AVAILABLE; the cost view shows `UNKNOWN`, never 0 |
| Fake provider | A failed run reports UNKNOWN | unchanged (so tests see the honest case) |

A charge counts as 0 in exactly one case: `NOT_SENT`, meaning the request provably never left the process (ticket refused, request invalid, route disabled).

## 3. Duplicate and retry protection (§17)

| Case | Protection | Evidence |
| --- | --- | --- |
| Double click / two tabs / two servers | QUEUED is written with compare-and-set before the call. Losers see the job dispatched and send nothing. The database allows one in-flight attempt per job and one row per ticket. | Unit test (3 concurrent dispatches → 1 request); PostgreSQL test (2 runners → 1 request) |
| Timeout or lost response | Submission errors are classed NOT_SENT / REJECTED / UNCERTAIN; anything unclassified is UNCERTAIN. Uncertain → `RECONCILIATION_REQUIRED`, attempt `UNCERTAIN`, charge UNKNOWN. Never resent. | Unit tests |
| Uncertain provider status | `reconcile` asks the provider by idempotency key: found → RUNNING; definitively absent → FAILED (spend counted at the quote); cannot say → stays for a person (`resolveReconciliation`, FOUNDER or PRODUCTION_ADMIN) | Unit tests |
| Worker restart mid-call | `recoverInterrupted()` moves a QUEUED job untouched for 5 minutes to RECONCILIATION_REQUIRED, and a stuck capture to ASSET_CAPTURE_FAILED. It never calls a provider. | Unit test (a worker that dies inside the call) |
| Provider accepted, but the ledger write failed | The job goes to RECONCILIATION_REQUIRED with the operation id in its errors. If even that write fails it stays QUEUED for recovery. | Unit test |
| Double callback / polling race | `poll` is idempotent: a job past RUNNING is returned as it stands. The losing writer re-reads instead of writing. | Unit test: 2 polls → 1 result, 1 take |
| Capture failure | ASSET_CAPTURE_FAILED; `recapture` (FOUNDER or PRODUCTION_ADMIN) reads the provider's stored output again and **never submits** | Unit test; dry run step 16 |
| Operator retry | Only a founder retry request moves FAILED back to AWAITING_APPROVAL. It clears the authorization, so a new one is needed against a fresh quote and the budget (failed spend still counted). | Unit test |
| Duplicate approval | One decision per subject version (database unique index); deterministic approval ids; compare-and-set on the subject | Unit and PostgreSQL tests |

## 4. Not covered here

- Spend paths outside the spine: deliverable 09.
- The real OpenArt executor: it does not exist, and the route is BLOCKED (deliverable 10).
