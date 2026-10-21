# Client portal validation (four tabs)

**Authority:** Phase 2 boards inside `/foundation/:token` — no redesign in 3B.

| Tab | Data source | Automated | Live staging |
| --- | --- | --- | --- |
| Overview | `ClientDigitalFoundationPayload` | PASS (component tests) | NOT_TESTED |
| Roadmap | stages + forecast | PASS | NOT_TESTED |
| Needs You | `client_actions` | PASS (P10 wired) | NOT_TESTED |
| Records | `buildClientRecords` | PASS | NOT_TESTED |
| Complete / Location views | `completion_state` | PASS | NOT_TESTED |

## G-02 quote withholding

Client quote hidden until `founder_commercial_ready` — verified in `digitalFoundationClientQuoteGate.test.ts`.

## Post-completion (Gate Q)

Portal shell must remain after `COMPLETE` — Phase 1 `resolveDfRoute` contract; **live reopen NOT_TESTED** this run.
