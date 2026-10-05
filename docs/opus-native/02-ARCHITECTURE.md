# Native Opus runtime architecture

Phases 2–21 of `P0.VR.OPUS-NATIVE1`.

## Module map

| Module | Phase | Responsibility |
|---|---|---|
| `shared/site00-opus-native/protocol.ts` | 1 | The protocol text, its version and its hash |
| `shared/site00-opus-native/types.ts` | 3, 6, 10, 19 | Context, run, patch, receipt and lineage contracts |
| `shared/site00-opus-native/modeContracts.ts` | 15, 16 | QUICK / DESIGN / FORENSIC policies and effort resolution |
| `shared/site00-opus-native/pricing.ts` | 6 | Token rates, run cost projection, cache-saving maths |
| `api/_lib/site00OpusNative/config.ts` | security | The one place the credential is read; model hard-bind; redaction |
| `api/_lib/site00OpusNative/designSurfaceRegistry.ts` | 3, 9, 14, 18 | What a design surface consists of, and what may be written |
| `api/_lib/site00OpusNative/contextCompiler.ts` | 3, 4, 5, 9, 14 | Four-tier compilation, dependency expansion, golden resolution |
| `api/_lib/site00OpusNative/provider.ts` | 5, 16, 21 | Anthropic transport and the deterministic replay provider |
| `api/_lib/site00OpusNative/tools.ts` | 8, 9 | Fifteen narrow tools; no general execution path |
| `api/_lib/site00OpusNative/workspaceSandbox.ts` | 10, 11 | Patch apply, exact baseline capture, revert |
| `api/_lib/site00OpusNative/preview.ts` | 12, 13 | Chromium render, screenshot, DOM measurement, pixel comparison |
| `api/_lib/site00OpusNative/costLedger.ts` | 6, 7 | Per-run meter, guard verdicts, receipts, ledger roll-up |
| `api/_lib/site00OpusNative/runtime.ts` | the loop | Assembles the request, gates, dispatches, executes tools, finalises |
| `api/_lib/site00OpusNative/approval.ts` | 17, 19 | Approve, request changes, revert, lineage closure |
| `api/_lib/site00OpusNative/observability.ts` | 20 | Diagnostics and the outbound secret audit |
| `api/_lib/site00OpusNative/cursorGap.ts` | 24 | Parity table |

## Phase 4 — the four tiers, and why the order matters

| Tier | Contents | Cacheable | Changes |
|---|---|---|---|
| `STABLE_CACHEABLE_CONTEXT` | Protocol, design authority rules | yes | Almost never |
| `PROJECT_CONTEXT` | Project canon, approved interaction contract | yes | Per project |
| `PAGE_CONTEXT` | Route, golden identity, read and write allowlists | no | Per page |
| `TASK_CONTEXT` | The founder's task and the required method | no | Per run |

A single cache breakpoint sits at the end of the stable region. Anthropic
allows four; one is correct here because the stable tiers are versioned as a
unit — the protocol and the project canon change together, so a finer split
would spend a breakpoint for nothing.

Budget enforcement never drops a stable tier. Dropping the protocol to save
tokens would remove the thing that makes the run correct, so page and task
context are trimmed instead and the agent is told it happened, which is why
`read_file` exists.

## Phase 9 — the code access boundary

Expansion starts from the surface's declared entry points and follows relative
imports outwards by `dependencyDepth` hops: none for QUICK, one for DESIGN, two
for FORENSIC. Everything is filtered through `isInspectablePath`, which permits
only `src/`, `shared/`, `docs/` and `public/site00/`, and rejects absolute paths
and any path containing `..`.

## Phase 6 — costing a loop, not a request

The first version of the cost estimate priced a single request and
under-projected a real proof run by roughly five times, because an agent loop
resends the growing conversation on every iteration — the second turn pays for
the first turn's tool results again, and so on.

`projectRunCost` models that: the stable prefix is written once and read
thereafter, the volatile context is resent every turn, and tool results
accumulate quadratically. It is deliberately conservative.

The estimate informs the founder. The **guard** protects them: it runs against
real usage before every dispatch, so an estimate that is wrong costs accuracy,
not money.

Images are a related trap. A viewport screenshot's base64 encoding is hundreds
of thousands of characters, but Anthropic charges roughly `(w × h) / 750`
tokens for it — on the order of 1,600. Measuring images as text inflated a
receipt by an order of magnitude and fired the spend guard on a run that was
never expensive, so image blocks are counted at a flat realistic rate and their
payload is excluded from the text estimate.

## Phase 11 — what the sandbox actually is

The agent writes to the real working tree, because that is the only way the dev
server can render the change and the screenshot loop can see it. Safety comes
from three properties rather than from filesystem isolation:

1. the write allowlist is fixed per surface and enforced in the tool layer;
2. exact prior bytes are captured before the first write, so revert restores
   content rather than approximating it;
3. nothing is ever committed — approval leaves the patch in the tree for a
   human, and the runtime invokes no git command anywhere.

Patches are surgical find/replace with unique anchors. Full-file regeneration
is deliberately unavailable: an anchor that cannot be found is a conflict the
founder should see, whereas a whole-file rewrite silently discards anything the
agent did not know about. An anchor matching more than once is also a conflict,
not a first-match replacement.

## Phase 8 — why there is no shell

Cursor gave the model broad agent access including arbitrary shell. That is not
inherited. Every capability is a named tool with a typed input and a fixed
allowlist. The two tools that execute anything run fixed argv arrays through
`execFile` with no shell interpolation, and the single model-influenced
argument — the test pattern — is validated to `^[\w.\-/]+$` before it is used.

## Phase 21 — failure handling

Named and handled: `MISSING_API_KEY`, `RATE_LIMIT`, `INSUFFICIENT_CREDIT`,
`PROVIDER_TIMEOUT`, `PROVIDER_5XX`, `MALFORMED_TOOL_CALL`, `PATCH_CONFLICT`,
`TEST_FAILURE`, `PREVIEW_FAILURE`, `SCREENSHOT_FAILURE`, `COST_CEILING`,
`ITERATION_CEILING`, `CANCELLED`, `CONTEXT_TOO_LARGE`, `SCOPE_VIOLATION`.

Two decisions worth stating. A cost ceiling returns `BLOCKED` rather than
throwing, so the run finishes cleanly and the work already produced is
preserved and presented for review. And a tool failure is returned to the model
as a tool result rather than aborting the run, so the agent can react to a
missing preview by reporting it instead of pretending it rendered.

## Phase 22 — Cursor stays

This is migration infrastructure. No existing developer workflow was removed.
See [`03-CURSOR-GAP.md`](./03-CURSOR-GAP.md) for what still requires Cursor.
