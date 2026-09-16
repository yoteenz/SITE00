# Native Opus design runtime

**Sprint:** `P0.VR.OPUS-NATIVE1`
**Model:** `claude-opus-5`, hard-bound
**Endpoint:** `/api/site00/opus-native`
**Surface:** `/projects/:projectSlug/design/opus-native` (internal)

The runtime that lets SITE 00's DESIGN workspace talk to Claude Opus directly
through the Anthropic API, so routine Opus design work no longer requires
Cursor.

| Document | Contents |
|---|---|
| [`01-EXECUTION-PROTOCOL.md`](./01-EXECUTION-PROTOCOL.md) | Phase 1 — `OPUS_DESIGN_EXECUTION_PROTOCOL_V1`, the observed methodology, as runtime policy |
| [`02-ARCHITECTURE.md`](./02-ARCHITECTURE.md) | Phases 2–21 — how the runtime is built and why |
| [`03-CURSOR-GAP.md`](./03-CURSOR-GAP.md) | Phase 24 — `NativeOpusVsCursorGap` and what blocks Cursor exit |

## The shape of it

```
founder → DESIGN panel → /api/site00/opus-native → context compiler
                                                 → Anthropic (Opus 5, cached prefix)
                                                 → narrow tools → repo / browser
                                                 → patch in sandbox
                                                 → screenshots + tests
                                                 → WAITING_FOR_FOUNDER_REVIEW
                                                 → approve | request changes | revert
```

## Three properties worth knowing before you touch it

**The credential is server-side and nothing else.** `ANTHROPIC_API_KEY` is read
in exactly one module, `api/_lib/site00OpusNative/config.ts`. It is never
returned, logged, or serialised into a run record. Every response the endpoint
emits is audited for credential material before it is sent, and a response that
would carry one is replaced with an error. Guard tests enforce all of this.

**The agent cannot self-approve, and cannot reach `main`.** A successful run
terminates at `WAITING_FOR_FOUNDER_REVIEW`. Approval marks the patch approved
and leaves it in the working tree for a human to commit. The runtime invokes no
git command anywhere — the only process it ever launches is `npm`, for
typecheck and tests.

**Writes are boundary-enforced, not requested.** Each design surface declares
its own write allowlist. The canonical NDXBOOK reconstruction declares none, so
an agent can read it in full and cannot modify a byte of it. Attempting to is
recorded as a scope violation and refused by the tool layer.

## Operating it

```bash
# API runtime (Railway in production; locally on :3000)
npm run start:api

# dev server with the API proxied, so the panel can reach the runtime
VITE_DEV_PROXY_TARGET=http://127.0.0.1:3000 npx vite --port 5175 --host
```

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Server-side credential. Without it the runtime reports `ANTHROPIC_API: BLOCKED` and refuses to dispatch. |
| `SITE00_OPUS_NATIVE_PREVIEW_URL` | Base URL the screenshot tools drive. Defaults to `http://127.0.0.1:5174`. |
| `SITE00_OPUS_NATIVE_WORKDIR` | Where patches, screenshots, receipts and lineage are written. Defaults to `/tmp/site00-opus-native`. |
| `SITE00_OPUS_NATIVE_ALLOW_SCRIPTED` | Set to `1` to enable the deterministic replay provider. Off by default. |
| `SITE00_OPUS_NATIVE_RATES` | JSON override for token pricing, so a rate change does not need a deploy. |

## Adding a design surface

Surfaces are declared in `api/_lib/site00OpusNative/designSurfaceRegistry.ts`:
which component, stylesheet, state hook and content module make up the page,
which golden reference is authoritative, which contracts apply, and which files
— if any — an agent may write.

This registry is the runtime's main advantage over a generic coding agent.
Cursor has to rediscover what a page consists of on every run; SITE 00 already
knows, so it is declared once and compiled into context directly.

Default a new surface to `writable: []` with a `writeFirewallReason`. Widen it
deliberately.

## Status

The credential is not yet configured in any environment, so no live Opus call
has been made. Everything else in the pipeline is exercised end to end and
covered by 54 guard tests. Add `ANTHROPIC_API_KEY` to the Railway environment
and the same loop runs with Opus choosing the tool calls.
