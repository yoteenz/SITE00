# Operations runbook test

## Wired (Phase 2 + 3)

- `generate-runbook` / `activate-runbook` admin POST  
- `getRunbookView` read model  
- `start-task` / `complete-task`  
- `verify-task` API exists; **UI RUN VERIFICATION disabled** (no observed-value contract)

## Simulation boundary

| Mode | Staging behavior |
| --- | --- |
| Stripe not configured | Checkout may return simulated URL (`simulated_checkout=1`) — **not** paid state |
| External DNS/mail providers | No real purchases; founder completes manual/assisted tasks |
| `runTaskVerification` | Requires server `pass` + `observed` — UI does not fabricate pass |

## Safe staging test

1. Use **SYNTH ·** test client only.  
2. Mark manual tasks complete with explicit founder action (not page view).  
3. Do not present simulated DNS as verified client records.

## Gates L / M / N

| Gate | Status |
| --- | --- |
| L — founder operations | PARTIAL (UI wired; live NOT_TESTED) |
| M — runbook dependencies | PASS (unit); live NOT_TESTED |
| N — simulation separation | PASS (code); live NOT_TESTED |
