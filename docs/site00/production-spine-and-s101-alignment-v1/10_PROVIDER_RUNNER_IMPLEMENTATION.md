# 10 — Provider runner implementation

Sprint `P0.SITE00.STUDIOWORLD.PRODUCTION-SPINE-AND-EXCHANGE-S101-PACKET-ALIGNMENT.V1`, §18 and §22, decision D-02. Branch `claude/studioworld-production-record-spine`. Code: `shared/site00-production-spine/runner.ts`, `gate.ts` and `providers.ts`.

**Provider execution is disabled. No real request was sent, no charge was made, and no external model was called to prove anything.**

## 1. What was reused

| Existing machinery | Used for |
| --- | --- |
| `directorial/routing.ts` `PROVIDER_ROUTES`, `quoteCredits`, V2 quotes | Route, model and configuration of each job; exact quotes (null when none matches, never a guess) |
| `directorial/review.ts` `authorizeGenerationJob` | The scene-state part of the gate: screenplay → direction → keyframes → budget → production steps and element approval, read from `REVIEW_STATE_V1.json` |
| `dispatch.ts` idempotency idea (inputs hash → key) | The job input hash and idempotency key |
| `providerGateway/spendAuthorization.ts` principle: a client flag is never authorization | Server-held, gate-issued dispatch tickets |
| JURNL's OpenArt route (manual or agent-side, no OpenArt SDK in the app) | The OpenArt transport is an agent-session route; the deployed app holds no OpenArt credential or connector |

## 2. The runner's path (§22)

| Step | Where |
| --- | --- |
| Load the approved shot | `gateInput` reads SHOT, BUDGET, approvals and the budget's job ledger |
| Resolve approved references | `providerInputs` maps each input to its ASSET and re-verifies the stored copy's hash |
| Validate the job budget | the gate: budget AUTHORIZED by the founder; every attempt of every job in the budget, plus this quote, within the authorized credits |
| Call the authorization gate | `issueDispatchTicket`: the only way to get a ticket |
| Create a job ledger entry | the job is saved as QUEUED, with a new attempt, **before** the provider call; a concurrent dispatch fails on the revision check |
| Prepare the provider request | `buildProviderRequest`, then `requestProblems` (start frame present, whole 3–15 s, sound off, 9:16) |
| Execute only when explicitly authorized | the transport redeems the ticket first; one ticket buys one submission of exactly the gated request |
| Track provider status | `poll` reads status once; nothing loops in the background |
| Capture returned output | `capture` fetches the output by operation ID |
| Copy media to private storage | `MediaStore.put` (deliverable 09) |
| Hash and verify the copy | re-read the stored copy; it must hash to the provider output |
| Create a take record | video jobs: TAKE with probed duration, resolution, frame rate, aspect and audio |
| Place the take into review | READY_FOR_REVIEW, never approved |

## 3. Why no caller can go around the gate

- **A transport needs a ticket.** It will not act without a `DispatchTicket` it can redeem.
- **Only the gate makes tickets.** It does so after every check passes, and keeps them in a module-private `WeakMap`.
- **A copied or hand-built ticket is not a ticket.** Identity is checked, so it is refused (NO_DISPATCH_TICKET).
- **A ticket buys one exact request.** It is single-use, expires within two minutes or at the authorization's expiry, and must match the job, project, input hash and idempotency key.
- **There is one entry point.** The spine API's dispatch action calls the runner. The API has no endpoint that authorizes a job or a budget.

## 4. The spend gate (§18)

Each requirement and how the gate meets it:

- **No valid founder approval → no provider call.** The job needs a GENERATION_AUTHORIZATION by the FOUNDER for this job, not revoked (NO_FOUNDER_APPROVAL, AUTHORIZATION_REVOKED).
- **No applicable budget → no provider call.** The shot's budget must be AUTHORIZED by a founder BUDGET_AUTHORIZATION and cover the shot (NO_APPLICABLE_BUDGET).
- **Unknown quote → no unapproved spend.** A null quote is refused at authorization and at dispatch (UNKNOWN_QUOTE).
- **Invalid scene state → no provider call.** The scene review state must authorize the step and the target must be approved (INVALID_SCENE_STATE). The shot's founder decisions must all be answered (DECISIONS_OPEN). Its references must be approved assets (REFERENCES_NOT_APPROVED).
- **Expired authorization → no provider call.** An authorization has an expiry; past it, dispatch is refused and the job returns to AWAITING_APPROVAL (AUTHORIZATION_EXPIRED).
- **Duplicate job request → idempotent.** A job already QUEUED or later is returned as it is and nothing is sent (DUPLICATE_IDEMPOTENT).
- **Over-budget retry → rejected.** Failed attempts count their reported charge, or their quote when none is reported. A retry past the budget is refused (OVER_BUDGET).
- **Changed inputs → new approval.** The authorization records the input hash. A different hash refuses dispatch and drops the authorization (APPROVAL_INVALIDATED_BY_INPUT_CHANGE).
- **No second entry point.** See §3.

There is also a runtime gate in front of the spend gate. If the route's transport is disabled, the runner returns PROVIDER_EXECUTION_DISABLED and does not issue a ticket.

## 5. Transports

| Transport | State | Notes |
| --- | --- | --- |
| `FakeProviderTransport` | Tests only | Deterministic; records the requests it receives; returns locally generated media; reports 0 credits on success and UNKNOWN on failure. The runner refuses it against a live store. |
| `OpenArtAgentSessionTransport` | **DISABLED** | See the conditions below. |

`OpenArtAgentSessionTransport` is enabled only when **both** of these hold:

- `SITE00_PROVIDER_EXECUTION=ENABLED`;
- an agent-session OpenArt executor is injected.

The API never injects one, so in the app it reports `SITE00_PROVIDER_EXECUTION is not ENABLED` (or `no agent-session OpenArt executor`) and refuses every call before reading the ticket. Its payload uses the quotes' model, mode and configuration. The connector's tool names and response fields were not verified from this environment, so they are not modelled.

## 6. Tests

`tests/productionSpine.test.ts`, under "spend gate (§18)", covers one case per requirement:

- no approval, no budget, open decisions, no references;
- invalid scene state;
- unknown quote;
- expired and revoked authorizations;
- changed inputs;
- duplicate dispatch;
- failed job with no automatic retry, then an over-budget retry refused;
- tickets: copied, mismatched, expired, reused and missing;
- the OpenArt route disabled under every combination of flag and executor;
- the fake transport refused on the live catalogue.

The runner tests in the same file cover:

- the full capture path;
- a capture failure that does not call the provider again;
- a rejected take that starts nothing;
- a corrupted copy refused at approval.
