# SITE 00 — Digital Foundation Operations V1

## Operations doctrine

Digital Foundation is a **standardized professional service**. Execution follows:

**DISCOVER → CONFIGURE → EXECUTE → VERIFY → APPROVE → COMPLETE**

Founding principle: **the quote configuration generates the production runbook.**

Commerce/lifecycle from Artifact V1 is unchanged. Operations adds the layer between **paid scope** and **verified completion**.

## Founder operations parents (semantic contracts)

| Parent | Role |
|--------|------|
| **P13 Foundation Pipeline** | Portfolio visibility — what needs attention, blockers, forecasts |
| **P14 Project Command** | One engagement control center — scope, progress, client owes / we owe |
| **P15 Execution Workbench** | Task orchestration by execution mode and status bucket |

No final visual design in this sprint — data/query contracts only.

## Code map

| Concern | Path |
|--------|------|
| Operations types | `shared/site00-digital-foundation/operations/types.ts` |
| Runbook generator | `shared/site00-digital-foundation/operations/runbookGenerator.ts` |
| Scope hash / supersede | `shared/site00-digital-foundation/operations/scopeHash.ts` |
| Dependencies | `shared/site00-digital-foundation/operations/dependencyEngine.ts` |
| Stage rollup | `shared/site00-digital-foundation/operations/stageRollup.ts` |
| Verification | `shared/site00-digital-foundation/operations/verificationEngine.ts` |
| Completion gate | `shared/site00-digital-foundation/operations/completionGate.ts` |
| Ownership generator | `shared/site00-digital-foundation/operations/ownershipGenerator.ts` |
| Forecast refinement | `shared/site00-digital-foundation/operations/forecast.ts` |
| Provider abstraction | `shared/site00-digital-foundation/operations/providers.ts` |
| P13 / P14 / P15 contracts | `shared/site00-digital-foundation/operations/contracts/` |
| Runtime engine | `api/_lib/digitalFoundation/operationsEngine.ts` |
| Admin API extensions | `api/admin/site00-foundation.ts` (`pipeline`, `workbench`, task actions) |

## Execution modes

- **AUTOMATED** — future provider/API (capability-gated; **no live writes in V1**)
- **ASSISTED** — SITE 00 prepares exact handoff; founder confirms
- **CLIENT_ACTION** — creates/consumes canonical **Needs you** requests
- **EXTERNAL_MANUAL** — work outside SITE 00; reason recorded
- **VERIFICATION** — expected vs current state; rules must PASS for completion gate

Escalation **AUTOMATED → ASSISTED → EXTERNAL_MANUAL** is explicit (`escalate-task` admin action).

## Runbook lifecycle

Statuses: `DRAFT` → `READY` → `ACTIVE` → … → `COMPLETE` / `SUPERSEDED`

- Generated on payment activation (and on demand).
- **Scope hash** change supersedes prior runbook/tasks safely.
- Quote-level timeline remains authoritative; **forecast** stores `ORIGINAL_*` vs `CURRENT_*` + `forecast_reason`.

## Completion gate

Foundation complete requires (unless **founder override** with reason):

1. Active runbook
2. Required tasks complete/verified
3. Required verification rules PASS (or manual override per rule)
4. Pending domain/signature approvals resolved
5. Ownership record present

Client artifact consumes operational truth (stages, Needs you count, forecast) without internal noise.

## Security

- No password fields; provider credentials architecture-only (OAuth / scoped tokens later).
- Visibility: `INTERNAL_ONLY` | `CLIENT_SAFE` | `CLIENT_ACTIONABLE` on tasks.

## Five-board visual handoff

See `docs/site00/idnty/SITE00_DIGITAL_FOUNDATION_FIVE_BOARD_HANDOFF.md` for OPUS.

## Fixtures

`shared/site00-digital-foundation/operations/fixtures/operationsScenarios.ts` — OPS A–M hints paired with commerce fixtures.

Tests: `tests/digitalFoundationOperations.test.ts`
